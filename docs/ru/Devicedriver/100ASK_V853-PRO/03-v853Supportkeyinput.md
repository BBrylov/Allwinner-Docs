# Поддержка ввода с кнопок отладочной платы

## 0. Предисловие

На отладочной плате 100ASK_V853-PRO расположено 5 функциональных кнопок. В этой главе обсудим, как включить эти пять кнопок.

![image-20230417154108195](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230417154108195.png)

## 1. Принцип работы функциональных кнопок V853

5 кнопок, предоставляемых на отладочной плате 100ASK_V853-PRO, реализованы через высокоточный модуль аналого-цифрового преобразования GPADC. GPADC — это модуль аналого-цифрового преобразования с разрешением 12 бит и точностью сбора 8 бит. Конкретное количество каналов можно посмотреть в документации spec. Диапазон аналогового входа 0-1.8В, максимальная частота дискретизации 1МГц. Поддерживается сравнение данных, функция самопроверки, а также работа в следующих конфигурируемых режимах:

1. Single mode: выполняет одно преобразование на указанном канале и помещает данные в соответствующий регистр данных
2. Single-cycle mode: выполняет один цикл преобразования на указанном канале и помещает данные в соответствующий регистр данных
3. Continuous mode: непрерывно выполняет преобразование на указанном канале и помещает данные в соответствующий регистр данных
4. Burst mode: выполняет дискретизацию и преобразование с помещением данных в 32-байтовый FIFO, поддерживает управление прерываниями

![image-20230417172938775](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230417172938775.png)

Некоторые интерфейсы GPADC также постепенно используются для считывания кнопок модуля KEY, обычно включая VOL+, VOL-, HOME, MENU, ENTER и т.д. GPADC0 используется для KEY по схеме, показанной выше. AVCC-AP — это питание 1.8В. При нажатии различных кнопок напряжение на порту GPADC0 отличается. CPU определяет, какая именно кнопка нажата, путем измерения этого напряжения. Как показано на рисунке выше, напряжения для VOL+, VOL-, MENU, ENTER, HOME/UBOOT составляют соответственно 0.21В, 0.41В, 0.59В, 0.75В, 0.88В. Подробности можно посмотреть в "100ASK-V853_Pro Руководство по разработке системы.pdf", глава 13 "Руководство по разработке Linux GPADC" пятой части по разработке драйверов.

## 2. Драйвер GPADC

Расположение драйвера GPADC:

```
tina-v853-open/kernel/linux-4.9/drivers/input/sensor/sunxi_gpadc.c
tina-v853-open/kernel/linux-4.9/drivers/input/sensor/sunxi_gpadc.h
```

## 3. Конфигурация ядра GPADC

В корневом каталоге Tina введите `make kernel_menuconfig`

```
book@100ask:~/workspaces/tina-v853-open$ make kernel_menuconfig
```

Войдите в следующий каталог и нажмите Y для включения драйвера SUNXI GPADC.

```
→ Device Drivers
	→ Input device support
		→ Sensors
			 <*>   SUNXI GPADC
```

После завершения конфигурации результат показан на рисунке.

![image-20230417174743552](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230417174743552.png)

Сохраните и выйдите из интерфейса конфигурации ядра.

## 4. Конфигурация дерева устройств GPADC

Расположение дерева устройств ядра:

```
tina-v853-open/device/config/chips/v853/configs/100ask/board.dts
```

Войдите в этот каталог и введите `vi board.dts`

```shell
book@100ask:~/workspaces/tina-v853-open$ cd device/config/chips/v853/configs/100ask/
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ ls
BoardConfig.mk  board.dts  buildroot  env.cfg  linux-4.9  sys_config.fex  uboot-board.dts
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ vi board.dts
```

Найдите узел &gpadc, этот узел содержит конфигурацию дискретизации, значения кнопок, данные напряжения и т.д.

```
&gpadc {
    channel_num = <1>;                        // Использование 1 канала
    channel_select = <0x01>;                  // Выбор канала 0x01
    channel_data_select = <0>;                // Включение канала данных
    channel_compare_select = <0x01>;          // Включение функции сравнения канала
    channel_cld_select = <0x01>;              // Включение функции "данные меньше" для сравнения
    channel_chd_select = <0>;                 // Включение функции "данные больше" для сравнения
    channel0_compare_lowdata = <1700000>;     // Значение меньше этого вызывает прерывание
    channel0_compare_higdata = <1200000>;     // Значение больше этого вызывает прерывание
    channel1_compare_lowdata = <460000>;      // Значение меньше этого вызывает прерывание
    channel1_compare_higdata = <1200000>;     // Значение больше этого вызывает прерывание
    key_cnt = <5>;                            // Количество кнопок
    key0_vol = <210>;                         // Напряжение кнопки, единица mv
    key0_val = <115>;                         // Значение кнопки при нажатии
    key1_vol = <410>;                         // Напряжение кнопки, единица mv
    key1_val = <114>;                         // Значение кнопки при нажатии
    key2_vol = <590>;                         // Напряжение кнопки, единица mv
    key2_val = <139>;                         // Значение кнопки при нажатии
    key3_vol = <750>;                         // Напряжение кнопки, единица mv
    key3_val = <28>;                          // Значение кнопки при нажатии
    key4_vol = <880>;                         // Напряжение кнопки, единица mv
    key4_val = <102>;                         // Значение кнопки при нажатии
    status = "okay";                          // Включение GPADC
};
```

Из файла board.dts также видно, что часть конфигурации, которая не требует частого изменения, сохранена в файле sun8iw21p1.dtsi. Перейдите в этот каталог и откройте файл.

```
book@100ask:~/workspaces/tina-v853-open$ cd kernel/linux-4.9/arch/arm/boot/dts/
book@100ask:~/workspaces/tina-v853-open/kernel/linux-4.9/arch/arm/boot/dts$ vi sun8iw21p1.dtsi
```

Просмотрите узел gpadc, можно увидеть, что здесь сохранена информация о прерываниях, тактовых сигналах и т.д., но по умолчанию не включена. Примечание: здесь можно не изменять, так как установленный здесь параметр status будет перезаписан параметром status в board.dts. Если в board.dts установлено включение, то в итоговом дереве устройств, упакованном в образ, будет состояние включения.

```
gpadc:gpadc@2009000 {
    compatible = "allwinner,sunxi-gpadc";         // Для привязки драйвера и устройства
    reg = <0x0 0x02009000 0x0 0x400>;             // Адрес регистров, используемых устройством
    interrupts = <GIC_SPI 57 IRQ_TYPE_NONE>;      // Прерывание, используемое устройством
    clocks = <&clk_gpadc>;                        // Тактовый сигнал, используемый устройством
    status = "disabled";                          // Конфигурация по умолчанию не включает GPADC
};
```

## 5. Добавление тестового пакета getevent

В корневом каталоге Tina выполните `make menuconfig`

```
book@100ask:~/workspaces/tina-v853-open$ make menuconfig
```

Войдите в каталог Utilities и нажмите Y для выбора getevent

```
 > Utilities
 	 <*> getevent.................................... getevent for Android Toolbox
```

После выбора результат показан на рисунке.

![image-20230417183138871](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230417183138871.png)

Сохраните и выйдите из интерфейса конфигурации Tina.

## 6. Компиляция, упаковка и прошивка

В корневом каталоге Tina введите `make -j32`

```
book@100ask:~/workspaces/tina-v853-open$ make -j32
...
book@100ask:~/workspaces/tina-v853-open$ pack
...
```

После создания образа скопируйте образ v853_linux_100ask_uart0.img из каталога tina-v853-open/out/v853/100ask/openwrt/ на компьютер Windows и используйте инструмент прошивки Allwinner PhoenixSuit для записи на отладочную плату.

Подключите кабель питания 12В и два кабеля Type-C, переведите переключатель в направлении разъема питания для включения. После прошивки нового образа дождитесь загрузки системы. В командной строке введите `getevent` для входа в тестовую программу. Из выводимой информации мы знаем, что драйвер gpadc передает информацию через `/dev/input/event1`. При нажатии на кнопку будет считано значение кнопки.

```
root@TinaLinux:~# getevent
add device 1: /dev/input/event2
  name:     "ft6336"
add device 2: /dev/input/event1
  name:     "sunxi-gpadc0"
add device 3: /dev/input/event0
  name:     "axp2101-pek"
poll 4, returned 1
/dev/input/event1: 0001 0073 00000001
poll 4, returned 1
/dev/input/event1: 0000 0000 00000000
poll 4, returned 1
/dev/input/event1: 0001 0073 00000000
poll 4, returned 1
/dev/input/event1: 0000 0000 00000000

```

Нажмите Ctrl+C для завершения теста.

## 7. Написание тестового приложения

Из тестирования в предыдущей главе мы знаем, что gpadc использует `/dev/input/event1` для передачи данных о нажатии кнопок. Поэтому в приложении узел для получения данных должен быть /dev/input/event1. Приложение показано ниже.

```c
#include <stdio.h>
#include <linux/input.h>
#include <stdlib.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <sys/time.h>
#include <limits.h>
#include <unistd.h>
#include <signal.h>

#define DEV_PATH "/dev/input/event1" //Modified to gpadc drive reporting node
static int gpadc_fd = 0;

unsigned int test_gpadc(const char * event_file)
{
        int code = 0, i;

        struct input_event data;

        gpadc_fd = open(DEV_PATH, O_RDONLY);

        if(gpadc_fd <= 0)
        {
                printf("open %s error!\n", DEV_PATH);
                return -1;
        }

        for(i = 0; i < 10; i++) //read 10 times
        {
                read(gpadc_fd, &data, sizeof(data));
                if(data.value == 1)
                {
                        printf("key %d pressed\n", data.code);
                }
                else if(data.value == 0)
                {
                        printf("key %d releaseed\n", data.code);
                }
        }
        close(gpadc_fd);
        return 0;
}

int main(int argc,const char *argv[])
{
    int rang_low = 0, rang_high = 0;
        return test_gpadc(DEV_PATH);
}
```

## 8. Компиляция приложения и тестирование

Создайте новый каталог gpadc для хранения приложения и исполняемого файла.

```
book@100ask:~/workspaces$ mkdir gpadc_test
book@100ask:~/workspaces$ cd gpadc_test/
book@100ask:~/workspaces/gpadc_test$ vi gpadc_test.c
```

Скопируйте приложение из предыдущего раздела в gpadc_test.c и сохраните.

После написания нам нужно предоставить среду компиляции для приложения gpadc_test. Введите

```shell
book@100ask:~/workspaces/gpadc_test$ export STAGING_DIR=~/workspaces/tina-v853-open/prebuilt/rootfsbuilt/arm/toolchainsunxi-musl-gcc-830/toolchain/arm-openwrt-linux-muslgnueabi
```

Используйте цепочку инструментов кросс-компиляции для компиляции бинарного файла. Примечание: необходимо заменить путь к каталогу Tina SDK на свой.

```
book@100ask:~/workspaces/gpadc_test$ ~/workspaces/tina-v853-open/prebuilt/rootfsbuilt/arm/toolchain-sunxi-musl-gcc-830/toolchain/bin/arm-openwrt-linux-gcc -o gpadc_test gpadc_test.c
```

После компиляции в текущем каталоге будет создан исполняемый файл gpadc_test, скопируйте его на отладочную плату для запуска. Ниже используется метод с TF-картой для копирования файла на отладочную плату. Предполагается, что вы уже скопировали файл на TF-карту. После вставки TF-карты в отладочную плату введите следующие команды в командной строке для монтирования SD-карты в каталог `/mnt/` и копирования приложения gpadc_test в каталог /root.

```
root@TinaLinux:/# mount /dev/mmcblk1p1 /mnt/
[   26.744697] FAT-fs (mmcblk1p1): Volume was not properly unmounted. Some data may be corrupt. Please run fsck.
root@TinaLinux:/# cd /mnt/
root@TinaLinux:/mnt# ls
System Volume Information  gpadc_test
root@TinaLinux:/mnt# cp gpadc_test /root/
```

Перейдите в каталог /root и запустите тестовую программу. Программа автоматически завершится после 10 считываний значений.

```
root@TinaLinux:/mnt# cd /root/
root@TinaLinux:~# ./gpadc_test
key 115 pressed
key 0 releaseed
key 115 releaseed
key 0 releaseed
key 114 pressed
key 0 releaseed
key 114 releaseed
key 0 releaseed
key 139 pressed
key 0 releaseed
```
