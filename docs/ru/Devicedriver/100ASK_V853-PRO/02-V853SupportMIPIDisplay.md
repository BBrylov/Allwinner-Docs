# Адаптация отладочной платы к 4-дюймовому MIPI экрану

## 0. Предисловие

Поскольку мы уже адаптировали RGB экран, при адаптации 4-дюймового MIPI экрана RGB экран работать не будет. Ссылка на покупку 4-дюймового экрана:

[4-дюймовый MIPI экран от 100ask](https://item.taobao.com/item.htm?spm=a1z10.5-c-s.w4002-18944745104.11.268678a0HuK0No&id=706091265930)

![image-20230413093019260](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230413093019260.png)

Руководство по отладке LCD: [https://tina.100ask.net/SdkModule/Linux_LCD_DevelopmentGuide-01/](https://tina.100ask.net/SdkModule/Linux_LCD_DevelopmentGuide-01/)

Руководство по разработке Display: [https://tina.100ask.net/SdkModule/Linux_Display_DevelopmentGuide-01/](https://tina.100ask.net/SdkModule/Linux_Display_DevelopmentGuide-01/)

Пакет ресурсов для адаптации 4-дюймового экрана: [https://forums.100ask.net/uploads/short-url/g7BQ0FPSSnKHSptR2QMjIPwnwno.zip](https://forums.100ask.net/uploads/short-url/g7BQ0FPSSnKHSptR2QMjIPwnwno.zip). Этот пакет содержит все измененные файлы (включая программы драйверов, дерево устройств и файлы конфигурации).

## 1. Добавление нового драйвера

Добавьте программу драйвера в

Каталог драйверов LCD ядра:
`tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp/lcd`

Каталог драйверов LCD uboot:
`tina-v853-open/brandy/brandy-2.0/u-boot-2018/drivers/video/sunxi/disp2/disp/lcd/`

Поскольку драйверы экрана в uboot и ядре имеют некоторые отличия, ниже представлены разные драйверы для uboot и ядра. Полные исходные файлы можно найти в пакете ресурсов для адаптации 4-дюймового экрана.

### 1.1 Программа драйвера uboot

Заголовочный файл драйвера tft08006.h

```c
#ifndef _TFT08006_H
#define _TFT08006_H

#include "panels.h"

extern __lcd_panel_t tft08006_panel;

extern s32 bsp_disp_get_panel_info(u32 screen_id, disp_panel_para *info);

#endif /*End of file*/
```

C-файл драйвера tft08006.c

Здесь показана только часть, отличающаяся от ядра:

```c
__lcd_panel_t tft08006_panel = {
        /* panel driver name, must mach the name of
         * lcd_drv_name in sys_config.fex
         */
        .name = "tft08006",
        .func = {
                .cfg_panel_info = lcd_cfg_panel_info,
                        .cfg_open_flow = lcd_open_flow,
                        .cfg_close_flow = lcd_close_flow,
                        .lcd_user_defined_func = lcd_user_defined_func,
        },
};
```

### 1.2 Программа драйвера ядра

Заголовочный файл драйвера tft08006.h

```c
#ifndef _TFT08006_H
#define _TFT08006_H

#include "panels.h"

extern struct __lcd_panel tft08006_panel;

extern s32 bsp_disp_get_panel_info(u32 screen_id, struct disp_panel_para *info);

#endif /*End of file*/
```

C-файл драйвера tft08006.c, здесь показана только часть, отличающаяся от uboot.

```c
struct __lcd_panel tft08006_panel = {
        /* panel driver name, must mach the name of
         * lcd_drv_name in sys_config.fex
         */
        .name = "tft08006",
        .func = {
                .cfg_panel_info = lcd_cfg_panel_info,
                        .cfg_open_flow = lcd_open_flow,
                        .cfg_close_flow = lcd_close_flow,
                        .lcd_user_defined_func = lcd_user_defined_func,
        },
};
```

## 2. Изменение panels.h и panels.c в ядре

Поскольку в ядре нет соответствующей конфигурации для драйвера экрана tft08006, нам нужно добавить определение в драйвер дисплея Allwinner panels.

### 2.1 Изменение panels.h в ядре

Измените panels.h в каталоге драйверов экрана:

```
book@100ask:~/workspaces/tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp/lcd$ vi panels.h
```

Добавьте определение драйвера экрана tft08006 после определения драйвера экрана icn6202:

```c
#ifdef CONFIG_LCD_SUPPORT_ICN6202
extern struct __lcd_panel icn6202_panel;
#endif
#ifdef CONFIG_LCD_SUPPORT_ICN6202
extern struct __lcd_panel icn6202_panel;
#endif
#ifdef CONFIG_LCD_SUPPORT_NT35510_MIPI
extern struct __lcd_panel nt35510_panel;
#endif
```

Нажмите ESC, введите `:wq` для сохранения изменений и выхода.

### 2.2 Изменение panels.c в ядре

Измените panels.c в каталоге драйверов экрана:

```
book@100ask:~/workspaces/tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp/lcd$ vi panels.c
```

Добавьте определение драйвера экрана tft08006 после определения драйвера экрана icn6202:

```c
#ifdef CONFIG_LCD_SUPPORT_ICN6202
       &icn6202_panel,
#endif
#ifdef CONFIG_LCD_SUPPORT_TFT08006
        &tft08006_panel,
#endif

#ifdef CONFIG_LCD_SUPPORT_NT35510_MIPI
        &nt35510_panel,
#endif
```

Нажмите ESC, введите `:wq` для сохранения изменений и выхода.

## 3. Изменение Kconfig и Makefile в ядре

### 3.1 Изменение Kconfig в ядре

Измените Kconfig в каталоге драйверов экрана, чтобы добавить драйвер экрана tft08006 в конфигурацию ядра для последующего выбора при компиляции:

В каталоге драйверов экрана введите `vi Kconfig`

```
tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp/lcd$ vi Kconfig
```

Добавьте конфигурацию драйвера экрана tft08006 после конфигурации драйвера экрана icn6202:

```c
config LCD_SUPPORT_ICN6202
       bool "LCD support icn6202 panel"
       default n
       ---help---
               If you want to support icn6202 panel for display driver, select it.

config LCD_SUPPORT_TFT08006
       bool "LCD support tft08006 panel"
       default n
       ---help---
               If you want to support tft08006 panel for display driver, select it.

config LCD_SUPPORT_NT35510_MIPI
        bool "LCD support nt35510_mipi panel"
        default n
        help
                If you want to support nt35510_mipi panel for display driver, select it.
```

Нажмите ESC, введите `:wq` для сохранения изменений и выхода.

### 3.2 Изменение Makefile в ядре

Вернитесь на уровень выше каталога драйверов экрана и измените файл Makefile:

```
book@100ask:~/workspaces/tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp$ vi Makefile
```

Добавьте правило компиляции драйвера экрана tft08006 после правила компиляции драйвера экрана icn6202:

```c
disp-$(CONFIG_LCD_SUPPORT_ICN6202) += lcd/icn6202.o
disp-$(CONFIG_LCD_SUPPORT_TFT08006) += lcd/tft08006.o
disp-$(CONFIG_LCD_SUPPORT_NT35510_MIPI) += lcd/nt35510.o
```

Нажмите ESC, введите `:wq` для сохранения изменений и выхода.

## 4. Изменение конфигурации ядра

В корневом каталоге Tina введите `make kernel_menuconfig` для входа в интерфейс конфигурации ядра.

```
book@100ask:~/workspaces/tina-v853-open$ make kernel_menuconfig
```

Перед выбором драйвера экрана убедитесь, что `DISP Driver Support(sunxi-disp2)` включен. В предоставляемом нами SDK он уже включен по умолчанию. Если вы его отключили ранее, нужно в интерфейсе конфигурации ядра войти в каталог `Video support for sunxi` и нажать Y для выбора `sunxi-disp2`, чтобы открыть конфигурацию узла LCD.

```
→ Device Drivers
	→ Graphics support
		→ Frame buffer Devices
			→ Video support for sunxi
				<*> DISP Driver Support(sunxi-disp2)
```

Войдите в каталог драйверов экрана и нажмите Y для выбора tft08006:

```
→ Device Drivers
	→ Graphics support
		→ Frame buffer Devices
			→ Video support for sunxi
				→ LCD panels select
					[*] LCD support tft08006 panel
```

Как показано на рисунке, выберите драйвер экрана tft08006 для компиляции в ядро.

![image-20230412141639648](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230412141639648.png)

Сохраните и выйдите из интерфейса конфигурации ядра.

## 5. Изменение конфигурации uboot

Перейдите в корневой каталог uboot и выполните `make menuconfig` для открытия интерфейса конфигурации uboot.

```
book@100ask:~/workspaces/tina-v853-open/brandy/brandy-2.0/u-boot-2018$ make menuconfig
```

Перед выбором драйвера экрана убедитесь, что `DISP Driver Support(sunxi-disp2)` включен. В предоставляемом нами SDK он уже включен по умолчанию. Если вы его отключили ранее, нужно в интерфейсе конфигурации ядра войти в каталог `Graphics support` и нажать Y для выбора `sunxi-disp2`, чтобы открыть конфигурацию узла LCD.

```
→ Device Drivers
	→ Graphics support
		[*] DISP Driver Support(sunxi-disp2)  --->
```

Войдите в каталог драйверов экрана и нажмите Y для выбора драйвера экрана TFT08006.

```
→ Device Drivers
	→ Graphics support
		→ LCD panels select
			 [*] LCD support TFT08006 panel
```

Как показано на рисунке, выберите драйвер экрана tft08006.

![image-20230412143445778](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230412143445778.png)

Сохраните и выйдите из интерфейса конфигурации uboot.

## 6. Изменение дерева устройств

Расположение дерева устройств: tina-v853-open/device/config/chips/v853/configs/100ask/

```
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ ls
BoardConfig.mk  board.dts  buildroot  env.cfg  linux-4.9  sys_config.fex  uboot-board.dts
```

Где board.dts — дерево устройств ядра, uboot-board.dts — дерево устройств uboot.

### 6.1 Изменение дерева устройств uboot

В каталоге дерева устройств введите `vi uboot-board.dts` для редактирования дерева устройств uboot.

```
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ vi uboot-board.dts
```

Закомментируйте предыдущий узел lcd0 и измените узел lcd0 для экрана tft08006:

```
&lcd0 {
        base_config_start   = <1>;
        lcd_used            = <1>;

        lcd_driver_name     = "tft08006";

        lcd_backlight       = <500>;
        lcd_if              = <4>;

        lcd_x               = <480>;
        lcd_y               = <800>;
        lcd_width           = <52>;
        lcd_height          = <52>;
        lcd_dclk_freq       = <25>;

        lcd_pwm_used        = <1>;
        lcd_pwm_ch          = <9>;
        lcd_pwm_freq        = <50000>;
        lcd_pwm_pol         = <1>;
        lcd_pwm_max_limit   = <255>;

        lcd_hbp             = <10>;
        lcd_ht              = <515>;
        lcd_hspw            = <5>;

        lcd_vbp             = <20>;
        lcd_vt              = <830>;
        lcd_vspw            = <5>;

        lcd_dsi_if          = <0>;
        lcd_dsi_lane        = <2>;
        lcd_dsi_format      = <0>;
        lcd_dsi_te          = <0>;
        lcd_dsi_eotp        = <0>;
        lcd_frm             = <0>;
        lcd_io_phase        = <0x0000>;
        lcd_hv_clk_phase    = <0>;
        lcd_hv_sync_polarity= <0>;
        lcd_gamma_en        = <0>;
        lcd_bright_curve_en = <0>;
        lcd_cmap_en         = <0>;
        lcdgamma4iep        = <22>;

        lcd_gpio_0          = <&pio PH 0 1 0 3 1>;
        pinctrl-0           = <&dsi4lane_pins_a>;
        pinctrl-1           = <&dsi4lane_pins_b>;
        base_config_end     = <1>;

};
```

Добавьте мультиплексируемые выводы после узла &pio:

```
         dsi4lane_pins_a: dsi4lane@0 {
                allwinner,pins = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "PD11";
                allwinner,pname = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "PD11";
                allwinner,function = "dsi";
                allwinner,muxsel = <5>;
                allwinner,drive = <3>;
                allwinner,pull = <0>;
        };

        dsi4lane_pins_b: dsi4lane@1 {
                allwinner,pins = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "PD11";
                allwinner,pname = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "DP11";
                allwinner,function = "io_disabled";
                allwinner,muxsel = <0xf>;
                allwinner,drive = <1>;
                allwinner,pull = <0>;
        };
```

### 6.2 Изменение дерева устройств ядра

В каталоге дерева устройств введите `vi board.dts` для редактирования дерева устройств ядра.

```
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ vi board.dts
```

Закомментируйте предыдущий узел lcd0 и измените узел lcd0 для экрана tft08006:

```
&lcd0 {
        base_config_start   = <1>;
        lcd_used            = <1>;

        lcd_driver_name     = "tft08006";

        lcd_backlight       = <500>;
        lcd_if              = <4>;

        lcd_x               = <480>;
        lcd_y               = <800>;
        lcd_width           = <52>;
        lcd_height          = <52>;
        lcd_dclk_freq       = <25>;

        lcd_pwm_used        = <1>;
        lcd_pwm_ch          = <9>;
        lcd_pwm_freq        = <50000>;
        lcd_pwm_pol         = <1>;
        lcd_pwm_max_limit   = <255>;

        lcd_hbp             = <10>;
        lcd_ht              = <515>;
        lcd_hspw            = <5>;

        lcd_vbp             = <20>;
        lcd_vt              = <830>;
        lcd_vspw            = <5>;

        lcd_dsi_if          = <0>;
        lcd_dsi_lane        = <2>;
        lcd_dsi_format      = <0>;
        lcd_dsi_te          = <0>;
        lcd_dsi_eotp        = <0>;
        lcd_frm             = <0>;
        lcd_io_phase        = <0x0000>;
        lcd_hv_clk_phase    = <0>;
        lcd_hv_sync_polarity= <0>;
        lcd_gamma_en        = <0>;
        lcd_bright_curve_en = <0>;
        lcd_cmap_en         = <0>;
        lcdgamma4iep        = <22>;

        lcd_gpio_0          = <&pio PH 0 1 0 3 1>;
        pinctrl-0           = <&dsi4lane_pins_a>;
        pinctrl-1           = <&dsi4lane_pins_b>;
        base_config_end     = <1>;

};
```

Добавьте мультиплексируемые выводы после узла &pio:

```
         dsi4lane_pins_a: dsi4lane@0 {
                allwinner,pins = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "PD11";
                allwinner,pname = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "PD11";
                allwinner,function = "dsi";
                allwinner,muxsel = <5>;
                allwinner,drive = <3>;
                allwinner,pull = <0>;
        };

        dsi4lane_pins_b: dsi4lane@1 {
                allwinner,pins = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "PD11";
                allwinner,pname = "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7", "PD9", "PD10", "DP11";
                allwinner,function = "io_disabled";
                allwinner,muxsel = <0xf>;
                allwinner,drive = <1>;
                allwinner,pull = <0>;
        };
```

## 7. Добавление сенсорного управления I2C

Из документации по экрану мы знаем, что чип сенсорного управления MIPI экрана — FT5336. Далее мы будем использовать встроенный в Allwinner драйвер сенсорного экрана FT6336.

### 7.1 Изменение дерева устройств

Измените узел twi2 для использования драйвера ft6336 и задайте диапазон сенсорного управления. Ширина X — 480, высота Y — 800. Вывод инициализации нужно найти в схеме базовой платы V853, где вывод инициализации — PH7, вывод пробуждения — PH8.

![image-20230414193438036](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230414193438036.png)

```
&twi2 {
        ctp@38 {
                status = "okay";
                ctp_used = <1>;
                ctp_name = "ft6336";
                ctp_twi_id = <0x2>;
                ctp_twi_addr = <0x38>;
                ctp_screen_max_x = <0x480>;
                ctp_screen_max_y = <0x800>;
                ctp_revert_x_flag = <0x0>;
                ctp_revert_y_flag = <0x1>;
                ctp_exchange_x_y_flag = <0x0>;
                ctp_int_port = <&pio PH 7 6 1 3 0xffffffff>;
                ctp_wakeup   = <&pio PH 8 1 1 3 0xffffffff>;
        };
};
```

Значение параметров дерева устройств можно узнать на сайте Tina от 100ask: [https://tina.100ask.net/SdkModule/Linux_Deploy_DevelopmentGuide-02/#39](https://tina.100ask.net/SdkModule/Linux_Deploy_DevelopmentGuide-02/#39)

### 7.2 Изменение конфигурации ядра

Поскольку мы ранее адаптировали драйвер сенсорного экрана RGB, нужно войти в ядро и изменить его на новый драйвер. Войдите в следующий каталог, нажмите пробел для отмены выбора предыдущего драйвера gt9xxnew touchscreen driver, нажмите Y для выбора нового драйвера ft6336 touchscreen driver, сохраните и выйдите.

```
→ Device Drivers
	→ Input device support
		→ Touchscreens
			<*>   ft6336 touchscreen driver
```

![image-20230414193735639](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230414193735639.png)

### 7.3 Изменение программы драйвера

Измените программу драйвера сенсорного экрана ft6336.c. Здесь показана только измененная часть, полный исходный файл см. в пакете ресурсов для адаптации 4-дюймового экрана.

```c
                        input_report_abs(ts->input_dev,
                                        ABS_MT_POSITION_X, -(event->au16_x[i]-480));
                        input_report_abs(ts->input_dev,
                                        ABS_MT_POSITION_Y, -(event->au16_y[i]-800));
```

### 7.4 Привязка LVGL к новому узлу сенсорного экрана

Поскольку Tina по умолчанию привязывает узел сенсорного управления к /dev/input/event0, нам нужно изменить узел, привязанный в заголовочном файле драйвера LVGL, на узел, через который наш драйвер сенсорного экрана передает данные. Наш драйвер передает данные через узел event2, поэтому нужно перейти в

каталог `tina-v853-open/platform/thirdparty/gui/lvgl-8/lv_examples/src` и изменить заголовочный файл lv_drv_conf.h следующим образом:

```shell
book@100ask:~/workspaces/tina-v853-open$ cd platform/thirdparty/gui/lvgl-8/lv_examples/src/
book@100ask:~/workspaces/tina-v853-open/platform/thirdparty/gui/lvgl-8/lv_examples/src$ vi lv_drv_conf.h
```

Найдите `LIBINPUT_NAME` в узле сенсорного управления и измените `/dev/input/event0` на `/dev/input/event2`, как показано в красной рамке на рисунке ниже.

![image-20230417101852786](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230417101852786.png)

Примечание: мы изменили заголовочный файл, который мог быть скомпилирован ранее, и при повторной компиляции он может не перекомпилироваться, что приведет к тому, что измененный узел не вступит в силу. Можно вручную удалить пример программы `lv_examples` из каталога out или полностью удалить каталог out и перекомпилировать. Подробности можно узнать из курса преподавателя Вэй Дуншаня "Архитектура и программирование ARM" в разделе о процессе компиляции gcc. Ссылка для доступа: [Архитектура и программирование ARM](https://www.100ask.net/p/t_pc/goods_pc_detail/goods_detail/p_5f857338e4b0e95a89c3cdb0)

## 8. Компиляция системы и упаковка для создания образа

Вернитесь в корневой каталог Tina и введите `make` для компиляции системы:

```shell
book@100ask:~/workspaces/tina-v853-open$ make -j4
...
sun8iw21p1 compile Kernel successful
INFO: ----------------------------------------
INFO: build Tina OK.
INFO: ----------------------------------------
```

Упакуйте для создания образа, введите `pack`:

```shell
book@100ask:~/workspaces/tina-v853-open$ pack
...
Dragon execute image.cfg SUCCESS !
----------image is at----------

33M     /home/book/workspaces/tina-v853-open/out/v853/100ask/openwrt/v853_linux_100ask_uart0.img

pack finish
```

## 9. Прошивка и тестирование

После упаковки скопируйте новый образ на компьютер Windows и используйте инструмент прошивки Allwinner PhoenixSuit для записи на отладочную плату. Подробности см. на: [https://forums.100ask.net/t/topic/2882](https://forums.100ask.net/t/topic/2882). После прошивки необходимо **отключить питание**, прежде чем подключать шлейф MIPI экрана к разъему MIPI. Обратите внимание на правильность порядка проводов шлейфа.

![image-20230417120449282](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230417120449282.png)

После подключения шлейфа снова подключите питание и два кабеля Type-C, затем переведите переключатель в направлении разъема питания для включения. При загрузке появится логотип пингвина Tina Linux. После входа в систему можно проверить узел сенсорного управления:

```
root@TinaLinux:/# ls /dev/input/
event0  event1  event2
```

Мы используем event2. Если вы не уверены, какой узел использует ваш драйвер сенсорного экрана, можете проверить с помощью `cat /dev/input/event*`, где `*` означает, какой узел сенсорного управления нужно проверить. Например, если я использую event2, нужно ввести `cat /dev/input/event2`. При касании экрана будет выводиться информация о передаче данных.

Используя демонстрационный пример LVGL, введите `lv_examples 0` для запуска примера LVGL. Можно протестировать работу сенсорного управления, нажимая на кнопки взаимодействия в UI на экране.

```shell
root@TinaLinux:/# lv_examples 0
wh=480x800, vwh=480x1600, bpp=32, rotated=0
Turn on double buffering.
Turn on 2d hardware acceleration.
Turn on 2d hardware acceleration rotate.
```
