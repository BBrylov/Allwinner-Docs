# Адаптация отладочной платы к 7-дюймовому RGB экрану

## 0. Предисловие

В предыдущих разделах мы уже изучили компиляцию и прошивку 100ASK_V853-PRO. Теперь перейдем к адаптации 7-дюймового RGB экрана в Tina SDK. Ссылка на покупку: [https://item.taobao.com/item.htm?spm=a1z10.5-c-s.w4002-18944745104.11.669f1b7fE1ptyQ&id=611156659477](https://item.taobao.com/item.htm?spm=a1z10.5-c-s.w4002-18944745104.11.669f1b7fE1ptyQ&id=611156659477)

![image-20230411160118610](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411160118610.png)

Ссылка на покупку отладочной платы 100ASK_V853-PRO: [100ASK_V853-PRO](https://item.taobao.com/item.htm?spm=a1z10.3-c-s.w4002-18944745109.10.4ea53031qOBnND&id=706864521673)

![image-20230418094041344](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230418094041344.png)

Руководство по отладке LCD: [https://tina.100ask.net/SdkModule/Linux_LCD_DevelopmentGuide-01/](https://tina.100ask.net/SdkModule/Linux_LCD_DevelopmentGuide-01/)

Руководство по разработке Display: [https://tina.100ask.net/SdkModule/Linux_Display_DevelopmentGuide-01/](https://tina.100ask.net/SdkModule/Linux_Display_DevelopmentGuide-01/)

Если вы уже используете наш патч, по умолчанию при загрузке отображается логотип Tina Linux, а также поддерживаются примеры LVGL и сенсорное управление. Введите `lv_examples` в терминале последовательного порта отладочной платы, чтобы увидеть 5 примеров LVGL. Введите `lv_examples 0` для запуска первого примера.

```
root@TinaLinux:/# lv_examples
lv_examples 0, is lv_demo_widgets
lv_examples 1, is lv_demo_music
lv_examples 2, is lv_demo_benchmark
lv_examples 3, is lv_demo_keypad_encoder
lv_examples 4, is lv_demo_stress
root@TinaLinux:/# lv_examples 0
wh=1024x600, vwh=1024x1200, bpp=32, rotated=0
Turn on double buffering.
Turn on 2d hardware acceleration.
Turn on 2d hardware acceleration rotate.
```

После выполнения на 7-дюймовом RGB экране отобразится демо-интерфейс LVGL V8 с поддержкой сенсорного управления.

## 1. Процесс адаптации 7-дюймового RGB экрана

Поскольку Tina SDK уже поддерживает драйвер RGB экрана по умолчанию, для адаптации 7-дюймового RGB экрана нужно обратить внимание на следующие моменты:

1. Модификация дерева устройств
2. Конфигурация ядра
3. Модификация конфигурации Uboot

Расположение дерева устройств ядра: tina-v853-open/device/config/chips/v853/configs/100ask/board.dts

Расположение дерева устройств uboot: tina-v853-open/device/config/chips/v853/configs/100ask/board.dts

Изменение конфигурации ядра: выполните `make kernel_menuconfig` в корневом каталоге tina

Изменение конфигурации uboot: перейдите в корневой каталог uboot tina-v853-open/brandy/brandy-2.0/u-boot-2018 и выполните `make menuconfig`

Расположение драйвера ядра: tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp/lcd/default_panel.c

Расположение драйвера uboot:
tina-v853-open/brandy/brandy-2.0/u-boot-2018/drivers/video/sunxi/disp2/disp/lcd/default_panel.c

## 2. Проверка и изменение дерева устройств

В корневом каталоге Tina введите `cd device/config/chips/v853/configs/100ask/`

```shell
book@100ask:~/workspaces/tina-v853-open$ cd device/config/chips/v853/configs/100ask/
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ vi board.dts
```

### 2.1 Изменение дерева устройств ядра

Измените узел lcd0 в board.dts следующим образом:

```
&lcd0 {
        /* part 1 */
        lcd_used            = <1>;
        lcd_driver_name     = "default_lcd";
        lcd_backlight       = <100>;

        /* part 2 */
        lcd_if = <0>;
        lcd_hv_if = <0>;

        /* part 3 */
        lcd_x               = <1024>;
        lcd_y               = <600>;
        lcd_width           = <154>;
        lcd_height          = <85>;
        lcd_dclk_freq       = <51>;
        lcd_hbp             = <140>;
        lcd_ht              = <1344>;
        lcd_hspw            = <20>;
        lcd_vbp             = <20>;
        lcd_vt              = <635>;
        lcd_vspw            = <3>;

        lcd_pwm_used        = <1>;
        lcd_pwm_ch          = <9>;
        lcd_pwm_freq        = <500>;
        lcd_pwm_pol         = <1>;

        /* part 5 */
        lcd_frm = <1>;
        lcd_io_phase = <0x0000>;
        lcd_gamma_en = <0>;
        lcd_cmap_en = <0>;
        lcd_hv_clk_phase = <0>;
        lcd_hv_sync_polarity= <0>;

        /* part 6 */
        lcd_power = "vcc-lcd";
        lcd_pin_power = "vcc-pd";
        pinctrl-0 = <&rgb18_pins_a>;
        pinctrl-1 = <&rgb18_pins_b>;
};
```

Добавьте дочерние узлы rgb18_pins_a и rgb18_pins_b под узлом &pio для мультиплексирования выводов:

```
 rgb18_pins_a: rgb18@0 {
                allwinner,pins = "PD0", "PD1", "PD2", "PD3", "PD4", "PD5", \
                        "PD6", "PD7", "PD8", "PD9", "PD10", "PD11", \
                        "PD12", "PD13", "PD14", "PD15", "PD16", "PD17", \
                        "PD18", "PD19", "PD20", "PD21";
                allwinner,pname = "lcdd2", "lcdd3", "lcdd4", "lcdd5", "lcdd6", "lcdd7", \
                        "lcdd10", "lcdd11", "lcdd12", "lcdd13", "lcdd14", "lcdd15", \
                        "lcdd18", "lcdd19", "lcdd20", "lcdd21", "lcdd22", "lcdd23", \
                        "lcdpclk", "lcdde", "lcdhsync", "lcdvsync";
                allwinner,function = "lcd";
                allwinner,muxsel = <2>;
                allwinner,drive = <3>;
                allwinner,pull = <0>;
        };

        rgb18_pins_b: rgb18@1 {
                        allwinner,pins = "PD0", "PD1", "PD2", "PD3", "PD4", "PD5", \
                                        "PD6", "PD7", "PD8", "PD9", "PD10", "PD11", \
                                        "PD12", "PD13", "PD14", "PD15", "PD16", "PD17", \
                                        "PD18", "PD19", "PD20", "PD21";
                        allwinner,pname = "lcdd2", "lcdd3", "lcdd4", "lcdd5", "lcdd6", "lcdd7", \
                                        "lcdd10", "lcdd11", "lcdd12", "lcdd13", "lcdd14", "lcdd15", \
                                        "lcdd18", "lcdd19", "lcdd20", "lcdd21", "lcdd22", "lcdd23", \
                                        "lcdpclk", "lcdde", "lcdhsync", "lcdvsync";
                        allwinner,function = "io_disabled";
                        allwinner,muxsel = <0xf>;
                        allwinner,drive = <3>;
                        allwinner,pull = <0>;
        };
```

### 2.2 Изменение дерева устройств uboot

Измените дерево устройств uboot в том же каталоге:

```shell
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ vi uboot-board.dts
```

```
&lcd0 {
        lcd_used            = <1>;
        lcd_driver_name     = "default_lcd";
        lcd_backlight       = <100>;

        lcd_if = <0>;
        lcd_hv_if = <0>;

        lcd_x               = <1024>;
        lcd_y               = <600>;
        lcd_width           = <154>;
        lcd_height          = <85>;
        lcd_dclk_freq       = <51>;
        lcd_hbp             = <140>;
        lcd_ht              = <1344>;
        lcd_hspw            = <20>;
        lcd_vbp             = <20>;
        lcd_vt              = <635>;
        lcd_vspw            = <3>;

        lcd_pwm_used        = <1>;
        lcd_pwm_ch          = <9>;
        lcd_pwm_freq        = <500>;
        lcd_pwm_pol         = <1>;

        lcd_frm = <1>;
        lcd_io_phase = <0x0000>;
        lcd_gamma_en = <0>;
        lcd_cmap_en = <0>;
        lcd_hv_clk_phase = <0>;
        lcd_hv_sync_polarity= <0>;

        lcd_power = "vcc-lcd";
        lcd_pin_power = "vcc-pd";
        pinctrl-0 = <&rgb18_pins_a>;
        pinctrl-1 = <&rgb18_pins_b>;
};
```

Добавьте дочерние узлы rgb18_pins_a и rgb18_pins_b под узлом &pio для мультиплексирования выводов:

```
rgb18_pins_a: rgb18@0 {
                allwinner,pins = "PD0", "PD1", "PD2", "PD3", "PD4", "PD5", \
                        "PD6", "PD7", "PD8", "PD9", "PD10", "PD11", \
                        "PD12", "PD13", "PD14", "PD15", "PD16", "PD17", \
                        "PD18", "PD19", "PD20", "PD21";
                allwinner,pname = "lcdd2", "lcdd3", "lcdd4", "lcdd5", "lcdd6", "lcdd7", \
                        "lcdd10", "lcdd11", "lcdd12", "lcdd13", "lcdd14", "lcdd15", \
                        "lcdd18", "lcdd19", "lcdd20", "lcdd21", "lcdd22", "lcdd23", \
                        "lcdpclk", "lcdde", "lcdhsync", "lcdvsync";
                allwinner,function = "lcd";
                allwinner,muxsel = <2>;
                allwinner,drive = <3>;
                allwinner,pull = <0>;
        };
        rgb18_pins_b: rgb18@1 {
                        allwinner,pins = "PD0", "PD1", "PD2", "PD3", "PD4", "PD5", \
                                        "PD6", "PD7", "PD8", "PD9", "PD10", "PD11", \
                                        "PD12", "PD13", "PD14", "PD15", "PD16", "PD17", \
                                        "PD18", "PD19", "PD20", "PD21";
                        allwinner,pname = "lcdd2", "lcdd3", "lcdd4", "lcdd5", "lcdd6", "lcdd7", \
                                        "lcdd10", "lcdd11", "lcdd12", "lcdd13", "lcdd14", "lcdd15", \
                                        "lcdd18", "lcdd19", "lcdd20", "lcdd21", "lcdd22", "lcdd23", \
                                        "lcdpclk", "lcdde", "lcdhsync", "lcdvsync";
                        allwinner,function = "io_disabled";
                        allwinner,muxsel = <0xf>;
                        allwinner,drive = <3>;
                        allwinner,pull = <0>;
        };
```

## 3. Проверка и изменение конфигурации ядра и uboot

### 3.1 Изменение конфигурации ядра

В корневом каталоге Tina введите `make kernel_menuconfig`

```shell
book@100ask:~/workspaces/tina-v853-open$ make kernel_menuconfig
```

С помощью стрелок выберите и войдите в следующий каталог, нажмите Y для включения DISP Driver Support:

```
 → Device Drivers
 	→ Graphics support
 		→ Frame buffer Devices
 			→ Video support for sunxi
 				<*> DISP Driver Support(sunxi-disp2)
```

Как показано на рисунке:

![image-20230411185022055](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411185022055.png)

После выбора, используя стрелки, выберите Save и нажмите Enter.

![image-20230411185717558](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411185717558.png)

После нажатия появится запрос на подтверждение сохранения резервной копии, выберите OK.

![image-20230411190013770](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411190013770.png)

Измененная конфигурация будет сохранена в файле tina-v853-open/kernel/linux-4.9/.config, нажмите Enter для выхода.

![image-20230411190051184](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411190051184.png)

После сохранения выберите Exit с помощью стрелок и продолжайте выбирать Exit до полного выхода из интерфейса конфигурации ядра.

![image-20230411190138923](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411190138923.png)

### 3.2 Изменение конфигурации uboot

Для изменения uboot необходимо перейти в каталог tina-v853-open/brandy/brandy-2.0/u-boot-2018 и выполнить `make menuconfig`

```
book@100ask:~/workspaces/tina-v853-open$ cd brandy/brandy-2.0/u-boot-2018/
book@100ask:~/workspaces/tina-v853-open/brandy/brandy-2.0/u-boot-2018$ make menuconfig
```

С помощью стрелок войдите в:

```
→ Device Drivers
	→ Graphics support
		 [*] DISP Driver Support(sunxi-disp2)  --->
```

Как показано на рисунке:

![image-20230411192759836](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411192759836.png)

После выбора, используя стрелки, выберите Save и нажмите Enter.

![image-20230411185717558](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411185717558.png)

После нажатия появится запрос на подтверждение сохранения резервной копии, выберите OK.

![image-20230411190013770](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411190013770.png)

Измененная конфигурация будет сохранена в файле `tina-v853-open/brandy/brandy-2.0/u-boot-2018/.config`, нажмите Enter для выхода.

![image-20230411190051184](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411190051184.png)

После сохранения выберите Exit с помощью стрелок и продолжайте выбирать Exit до полного выхода из интерфейса конфигурации uboot.

![image-20230411190138923](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230411190138923.png)

## 4. Программа драйвера 7-дюймового RGB экрана

Программы драйверов в ядре и uboot одинаковые и могут быть использованы повторно. Поскольку мы выбрали sunxi-disp2, по умолчанию будет скомпилирована программа драйвера default_panel.c.

Расположение драйвера ядра: tina-v853-open/kernel/linux-4.9/drivers/video/fbdev/sunxi/disp2/disp/lcd/default_panel.c

Расположение драйвера uboot:
tina-v853-open/brandy/brandy-2.0/u-boot-2018/drivers/video/sunxi/disp2/disp/lcd/default_panel.c

```c
/*
 * drivers/video/sunxi/disp2/disp/lcd/default_panel.c
 *
 * Copyright (c) 2007-2019 Allwinnertech Co., Ltd.
 * Author: zhengxiaobin <zhengxiaobin@allwinnertech.com>
 *
 * This software is licensed under the terms of the GNU General Public
 * License version 2, as published by the Free Software Foundation, and
 * may be copied, distributed, and modified under those terms.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 */
#include "default_panel.h"

static void LCD_power_on(u32 sel);
static void LCD_power_off(u32 sel);
static void LCD_bl_open(u32 sel);
static void LCD_bl_close(u32 sel);

static void LCD_panel_init(u32 sel);
static void LCD_panel_exit(u32 sel);

static void LCD_cfg_panel_info(panel_extend_para * info)
{
        u32 i = 0, j=0;
        u32 items;
        u8 lcd_gamma_tbl[][2] =
        {
                //{input value, corrected value}
                {0, 0},
                {15, 15},
                {30, 30},
                {45, 45},
                {60, 60},
                {75, 75},
                {90, 90},
                {105, 105},
                {120, 120},
                {135, 135},
                {150, 150},
                {165, 165},
                {180, 180},
                {195, 195},
                {210, 210},
                {225, 225},
                {240, 240},
                {255, 255},
        };

        u32 lcd_cmap_tbl[2][3][4] = {
        {
                {LCD_CMAP_G0,LCD_CMAP_B1,LCD_CMAP_G2,LCD_CMAP_B3},
                {LCD_CMAP_B0,LCD_CMAP_R1,LCD_CMAP_B2,LCD_CMAP_R3},
                {LCD_CMAP_R0,LCD_CMAP_G1,LCD_CMAP_R2,LCD_CMAP_G3},
                },
                {
                {LCD_CMAP_B3,LCD_CMAP_G2,LCD_CMAP_B1,LCD_CMAP_G0},
                {LCD_CMAP_R3,LCD_CMAP_B2,LCD_CMAP_R1,LCD_CMAP_B0},
                {LCD_CMAP_G3,LCD_CMAP_R2,LCD_CMAP_G1,LCD_CMAP_R0},
                },
        };

        items = sizeof(lcd_gamma_tbl)/2;
        for (i=0; i<items-1; i++) {
                u32 num = lcd_gamma_tbl[i+1][0] - lcd_gamma_tbl[i][0];

                for (j=0; j<num; j++) {
                        u32 value = 0;

                        value = lcd_gamma_tbl[i][1] + ((lcd_gamma_tbl[i+1][1] - lcd_gamma_tbl[i][1]) * j)/num;
                        info->lcd_gamma_tbl[lcd_gamma_tbl[i][0] + j] = (value<<16) + (value<<8) + value;
                }
        }
        info->lcd_gamma_tbl[255] = (lcd_gamma_tbl[items-1][1]<<16) + (lcd_gamma_tbl[items-1][1]<<8) + lcd_gamma_tbl[items-1][1];

        memcpy(info->lcd_cmap_tbl, lcd_cmap_tbl, sizeof(lcd_cmap_tbl));

}

static s32 LCD_open_flow(u32 sel)
{
        LCD_OPEN_FUNC(sel, LCD_power_on, 30);   //open lcd power, and delay 50ms
        LCD_OPEN_FUNC(sel, LCD_panel_init, 50);   //open lcd power, than delay 200ms
        LCD_OPEN_FUNC(sel, sunxi_lcd_tcon_enable, 100);     //open lcd controller, and delay 100ms
        LCD_OPEN_FUNC(sel, LCD_bl_open, 0);     //open lcd backlight, and delay 0ms

        return 0;
}

static s32 LCD_close_flow(u32 sel)
{
        LCD_CLOSE_FUNC(sel, LCD_bl_close, 0);       //close lcd backlight, and delay 0ms
        LCD_CLOSE_FUNC(sel, sunxi_lcd_tcon_disable, 0);         //close lcd controller, and delay 0ms
        LCD_CLOSE_FUNC(sel, LCD_panel_exit,     200);   //open lcd power, than delay 200ms
        LCD_CLOSE_FUNC(sel, LCD_power_off, 500);   //close lcd power, and delay 500ms

        return 0;
}

static void LCD_power_on(u32 sel)
{
        sunxi_lcd_power_enable(sel, 0);//config lcd_power pin to open lcd power0
        sunxi_lcd_pin_cfg(sel, 1);
}

static void LCD_power_off(u32 sel)
{
        sunxi_lcd_pin_cfg(sel, 0);
        sunxi_lcd_power_disable(sel, 0);//config lcd_power pin to close lcd power0
}

static void LCD_bl_open(u32 sel)
{
        sunxi_lcd_pwm_enable(sel);
        sunxi_lcd_backlight_enable(sel);//config lcd_bl_en pin to open lcd backlight
}

static void LCD_bl_close(u32 sel)
{
        sunxi_lcd_backlight_disable(sel);//config lcd_bl_en pin to close lcd backlight
        sunxi_lcd_pwm_disable(sel);
}

static void LCD_panel_init(u32 sel)
{
        return;
}

static void LCD_panel_exit(u32 sel)
{
        return ;
}

//sel: 0:lcd0; 1:lcd1
static s32 LCD_user_defined_func(u32 sel, u32 para1, u32 para2, u32 para3)
{
        return 0;
}

__lcd_panel_t default_panel = {
        /* panel driver name, must mach the name of lcd_drv_name in sys_config.fex */
        .name = "default_lcd",
        .func = {
                .cfg_panel_info = LCD_cfg_panel_info,
                .cfg_open_flow = LCD_open_flow,
                .cfg_close_flow = LCD_close_flow,
                .lcd_user_defined_func = LCD_user_defined_func,
        },
};
```

## 5. Включение функции сенсорного управления

### 5.1 Изменение дерева устройств

Добавьте дочерний узел ctp для сенсорного управления под узлом twi2 в дереве устройств:

```
&twi2 {
        ctp@14 {
                compatible = "allwinner,gsl3680";
                device_type = "ctp";
                reg = <0x14>;
                status = "okay";
                ctp_name = "gt9xxnew_ts";
                ctp_twi_id = <0x2>;
                ctp_twi_addr = <0x14>;
                ctp_screen_max_x = <0x400>;
                ctp_screen_max_y = <0x258>;
                ctp_revert_x_flag = <0x0>;
                ctp_revert_y_flag = <0x0>;
                ctp_exchange_x_y_flag = <0x0>;
                ctp_int_port = <&pio PH 7 6 1 3 0xffffffff>;
                ctp_wakeup   = <&pio PH 8 1 1 3 0xffffffff>;
                //ctp-supply = <&reg_aldo2>;
                //ctp_power_ldo = <&reg_dldo1>;
                //ctp_power_ldo_vol = <3300>;
        };

};
```

После узла lcd0 включите узел twi2 и функцию мультиплексирования выводов:

```
&twi2 {
        clock-frequency = <400000>;
        pinctrl-0 = <&twi2_pins_a>;
        pinctrl-1 = <&twi2_pins_b>;
        pinctrl-names = "default", "sleep";
        /* For stability and backwards compatibility, we recommend setting 'twi_drv_used' to 0  */
        twi_drv_used = <0>;
        twi-supply = <&reg_dcdc1>;
        twi_pkt_interval = <0>;
        //status = "disabled";
        status = "okay";
};
```

### 5.2 Изменение конфигурации ядра

В корневом каталоге Tina выполните make kernel_menuconfig

```
book@100ask:~/workspaces/tina-v853-open$ make kernel_menuconfig
```

Войдите в следующий каталог и нажмите Y для выбора драйвера сенсорного экрана gt9xxnew touchscreen driver:

```
→ Device Drivers
	→ Input device support
		→ Touchscreens
			<*>   gt9xxnew touchscreen driver
```

Как показано на рисунке:

![image-20230412150545791](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230412150545791.png)

Сохраните и выйдите из интерфейса конфигурации ядра.

## 6. Включение примеров LVGL

В корневом каталоге Tina введите `make menuconfig`

```
book@100ask:~/workspaces/tina-v853-open$ make menuconfig
```

Войдите в следующий каталог и нажмите Y для выбора lv_examples:

```
 > Gui
 	> Littlevgl
 		 <*> lv_examples................................. lvgl examples use lvgl-8.1.0
```

После выбора сохраните и выйдите из интерфейса конфигурации.

## 7. Компиляция и упаковка для создания образа

Поскольку мы уже один раз полностью скомпилировали систему, теперь после изменений компиляция займет гораздо меньше времени. Конкретное время зависит от производительности CPU. В корневом каталоге Tina выполните `make -jN`, где N — количество потоков для ускорения компиляции.

```
book@100ask:~/workspaces/tina-v853-open$ make -j4
```

После завершения компиляции введите pack для упаковки и создания образа:

```
book@100ask:~/workspaces/tina-v853-open$ pack
```

После упаковки новый файл образа можно найти в каталоге tina-v853-open/out/v853/100ask/openwrt/

v853_linux_100ask_uart0.img, скопируйте этот файл на компьютер Windows для последующего использования.

## 8. Прошивка нового образа и загрузка отладочной платы

Используйте инструмент прошивки Allwinner PhoenixSuit для записи нового образа. Подробный метод см. в документе "100ASK_V853-PRO Настройка окружения, компиляция и прошивка".

Примечание: необходимо подключить 7-дюймовый RGB экран перед подачей питания, при этом обратите внимание на правильность порядка проводов шлейфа.

![image-20230412101223261](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230412101223261.png)

Подключите 7-дюймовый экран, затем подключите кабель питания и два кабеля Type-C, переведите переключатель в направлении разъема питания для включения отладочной платы. После прошивки нового образа дождитесь загрузки системы. В командной строке откройте терминал последовательного порта отладочной платы, войдите в консоль Tina Linux и введите `lv_examples 0`, чтобы на 7-дюймовом RGB экране отобразилась демонстрационная программа LVGL.

```
root@TinaLinux:/# lv_examples 0
wh=1024x600, vwh=1024x1200, bpp=32, rotated=0
Turn on double buffering.
Turn on 2d hardware acceleration.
Turn on 2d hardware acceleration rotate.
```
