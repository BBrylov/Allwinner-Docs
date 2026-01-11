# Адаптация MIPI камеры на отладочной плате

## 0. Предисловие

Отладочная плата 100ASK_V853-PRO поддерживает 4-линейную MIPI камеру и 2-линейную MIPI камеру. Используя образ, созданный из пакета Tina SDK, предоставленного компанией Baiwenwen, система уже настроена и может быть использована напрямую. В этой главе описано, как адаптировать MIPI камеру. В этом документе используется 2-линейная MIPI камера. Вы можете приобрести её в официальном магазине Taobao компании Baiwenwen. [Отладочная плата 100ASK_V853-PRO](https://item.taobao.com/item.htm?spm=a1z10.5-c-s.w4002-18944745104.11.51891f84ejLLVX&id=706864521673)

![image-20230419155206765](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230419155206765.png)

Полное руководство по разработке с помощью Tina-SDK компании Allwinner: https://tina.100ask.net/

Если вы хотите адаптировать собственную камеру, мы настоятельно рекомендуем следовать следующему руководству по разработке:

Руководство по разработке камеры: https://tina.100ask.net/SdkModule/Linux_Camera_DevelopmentGuide-01/



## 1. Введение в архитектуру VIN

V853 поддерживает параллельный интерфейс CSI и MIPI, использует архитектуру драйвера камеры VIN.

**Архитектура пути камеры**

• VIN поддерживает гибкую конфигурацию одного/двойного входа и выхода двойного ISP по нескольким каналам

• Введена архитектура media для управления pipeline

• Портирована libisp в пользовательское пространство для решения проблем с GPL

• Буфер статистики независимо управляется как v4l2 subdev

• Модуль scaler (vipp) независимо управляется как v4l2 subdev

• Видеобуфер переведен в режим mplane для удобства захвата изображения на уровне пользователя

• Используется v4l2-event для управления событиями

• Используются новые возможности v4l2-controls

![image-20230419160150480](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230419160150480.png)

**Архитектура VIN**

• При использовании можно просто рассматривать как vin модуль + device модуль + af драйвер + модуль управления вспышкой;

• vin.c - это основная реализация функциональности драйвера, включая регистрацию/отмену регистрации, чтение параметров, интерфейс с v4l2 на верхнем уровне, интерфейс с device на нижнем уровне, обработку прерываний, запрос и переключение буферов и т.д.;

• Папка modules/sensor содержит реализацию на уровне устройства для каждого датчика, как правило, включая включение/отключение питания, инициализацию, переключение различных разрешений. Датчики YUV включают реализацию подавляющего большинства команд ioctl, определённых v4l2; в то время как для Raw датчиков большинство команд ioctl реализуются путём вызова библиотеки isp на уровне vin, а некоторые из них, такие как регулировка экспозиции/усиления, передаются через уровень vin к фактическому уровню устройства;

• Папка modules/actuator содержит драйверы для различных модулей VCM;

• Папка modules/flash содержит реализацию интерфейса управления вспышкой;

• vin-csi и vin-mipi - это файлы управления интерфейсами CSI и MIPI;

• Папка vin-isp - это файлы операций библиотеки isp;

• Папка vin-video в основном содержит файлы операций видеоустройства;

![image-20221122113602939](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/Linux_Camera_DevGuide_image-20221122113602939.png)

Путь драйвера находится в linux-4.9/drivers/media/platform/sunxi-vin.

```
sunxi-vin:
│ vin.c ;основное реализация драйвера v4l2 (включая видеоинтерфейс и часть ISP)
│ vin.h ;заголовочный файл драйвера v4l2
│ top_reg.c ;основная реализация интерфейса управления subdev v4l2
│ top_reg.h ;заголовочный файл интерфейса управления
│ top_reg_i.h ;структуры части интерфейса модуля vin
├── modules
│ ├── actuator ;vcm драйвер
│ │ ├── actuator.c
│ │ ├── actuator.h
│ │ ├── dw9714_act.c
│ │ ├── Makefile
│ ├── flash ;драйвер вспышки
│ │ ├── flash.c
│ │ └── flash.h
│ └── sensor ;драйвер датчика
│ ├── ar0144_mipi.c
│ ├── camera_cfg.h ;заголовочный файл расширенных команд ioctl камеры
│ ├── camera.h ;заголовочный файл публичных структур камеры
│ ├── Makefile
│ ├── ov2775_mipi.c
│ ├── ov5640.c
│ ├── sensor-compat-ioctl32.c
│ ├── sensor_helper.c ;файл функции интерфейса публичных операций датчика
│ ├── sensor_helper.h
├── platform ;интерфейс конфигурации, связанный с платформой
├── utility
│ ├── bsp_common.c
│ ├── bsp_common.h
│ ├── cfg_op.c
│ ├── cfg_op.h
│ ├── config.c
│ ├── config.h
│ ├── sensor_info.c
│ ├── sensor_info.h
│ ├── vin_io.h
│ ├── vin_os.c
│ ├── vin_os.h
│ ├── vin_supply.c
│ └── vin_supply.h
├── vin-cci
│ ├── sunxi_cci.c
│ └── sunxi_cci.h
├── vin-csi
│ ├── parser_reg.c
│ ├── parser_reg.h
│ ├── parser_reg_i.h
│ ├── sunxi_csi.c
│ └── sunxi_csi.h
├── vin-isp
│ ├── sunxi_isp.c
│ └── sunxi_isp.h
├── vin-mipi
│ ├── sunxi_mipi.c
│ └── sunxi_mipi.h
├── vin-stat
│ ├── vin_h3a.c
│ ├── vin_h3a.h
│ ├── vin_ispstat.c
│ └── vin_ispstat.h
├── vin_test
├── vin-video
│ ├── vin_core.c
│ ├── vin_core.h
│ ├── vin_video.c
│ └── vin_video.h
└── vin-vipp
├── sunxi_scaler.c
├── sunxi_scaler.h
├── vipp_reg.c
├── vipp_reg.h
└── vipp_reg_i.h
```

## 2. Конфигурация драйвера

Отладочная плата 100ASK_V853-PRO поддерживает модули 4-линейных двойных камер и 2-линейных одинарных камер. Ниже я только демонстрирую конфигурацию 2-линейной MIPI камеры. Мы используем камеру GC2053, используя встроенный в Allwinner драйвер, путь к которому:

```
kernel/linux-4.9/drivers/media/platform/sunxi-vin/modules/sensor/gc2053_mipi.c
```

## 3. Конфигурация дерева устройств

Путь конфигурации дерева устройств:

```
device/config/chips/v853/configs/100ask/board.dts
```

Конфигурация, связанная с камерой:

```
                vind0:vind@0 {
                        vind0_clk = <300000000>;
                        status = "okay";

                        csi2:csi@2 {
                                pinctrl-names = "default","sleep";
                                pinctrl-0 = <&ncsi_pins_a>;
                                pinctrl-1 = <&ncsi_pins_b>;
                                status = "okay";
                        };
                        /*Online mode tp9953 uses online mode*/
                        tdm0:tdm@0 {
                                work_mode = <0>;
                        };

                        isp00:isp@0 {
                                work_mode = <0>;
                        };

                        scaler00:scaler@0 {
                                work_mode = <0>;
                        };

                        scaler10:scaler@4 {
                                work_mode = <0>;
                        };

                        scaler20:scaler@8 {
                                work_mode = <0>;
                        };

                        scaler30:scaler@12 {
                                work_mode = <0>;
                        };

                        actuator0:actuator@0 {
                                device_type = "actuator0";
                                actuator0_name = "ad5820_act";
                                actuator0_slave = <0x18>;
                                actuator0_af_pwdn = <>;
                                actuator0_afvdd = "afvcc-csi";
                                actuator0_afvdd_vol = <2800000>;
                                status = "disabled";
                        };
                        flash0:flash@0 {
                                device_type = "flash0";
                                flash0_type = <2>;
                                flash0_en = <>;
                                flash0_mode = <>;
                                flash0_flvdd = "";
                                flash0_flvdd_vol = <>;
                                status = "disabled";
                        };

                        sensor0:sensor@0 {
                                device_type = "sensor0";
                                sensor0_mname = "gc2053_mipi";
                                sensor0_twi_cci_id = <1>;
                                sensor0_twi_addr = <0x6e>;
                                sensor0_mclk_id = <0>;
                                sensor0_pos = "rear";
                                sensor0_isp_used = <1>;
                                sensor0_fmt = <1>;
                                sensor0_stby_mode = <0>;
                                sensor0_vflip = <0>;
                                sensor0_hflip = <0>;
                                sensor0_iovdd-supply = <&reg_aldo2>;
                                sensor0_iovdd_vol = <1800000>;
                                sensor0_avdd-supply = <&reg_bldo2>;
                                sensor0_avdd_vol = <2800000>;
                                sensor0_dvdd-supply = <&reg_dldo2>;
                                sensor0_dvdd_vol = <1200000>;
                                sensor0_power_en = <>;
                                sensor0_reset = <&pio PA 18 1 0 1 0>;
                                sensor0_pwdn = <&pio PA 19 1 0 1 0>;
                                sensor0_sm_hs = <>;
                                sensor0_sm_vs = <>;
                                flash_handle = <&flash0>;
                                act_handle = <&actuator0>;
                                status  = "okay";
                        };
                        sensor1:sensor@1 {
                                device_type = "sensor1";
                                sensor1_mname = "tp9953";
                                sensor1_twi_cci_id = <0>;
                                sensor1_twi_addr = <0x88>;
                                sensor1_mclk_id = <2>;
                                sensor1_pos = "front";
                                sensor1_isp_used = <0>;
                                sensor1_fmt = <0>;
                                sensor1_stby_mode = <0>;
                                sensor1_vflip = <0>;
                                sensor1_hflip = <0>;
                                sensor1_iovdd-supply = <&reg_aldo2>;
                                sensor1_iovdd_vol = <1800000>;
                                sensor1_avdd-supply = <>; /*<&reg_dcdc1>;*/
                                sensor1_avdd_vol = <3300000>;
                                sensor1_dvdd-supply = <>;//<&reg_dldo2>;
                                sensor1_dvdd_vol = <1200000>;
                                sensor1_power_en = <&pio PI 0 1 0 1 0>;
                                sensor1_reset = <&pio PH 13 1 0 1 0>;
                                sensor1_pwdn  = <>;
                                /*sensor1_pwdn = <&pio PE 13 1 0 1 0>;*/
                                sensor1_sm_hs = <>;
                                sensor1_sm_vs = <>;
                                flash_handle = <>;
                                act_handle = <>;
                                status  = "okay";
                        };
```

## 4. Конфигурация ядра

В корневой директории Tina выполните `make kernel_menuconfig`

```
book@100ask:~/workspaces/tina-v853-open$ make kernel_menuconfig
```

Примечание: перед конфигурацией ядра необходимо установить переменные окружения для входа в конфигурацию ядра, то есть перед конфигурацией введите

```
book@100ask:~/workspaces/tina-v853-open$ source build/envsetup.sh
...
book@100ask:~/workspaces/tina-v853-open$ lunch
... введите 1, выберите решение 1
```

В интерфейсе конфигурации ядра перейдите в следующую директорию и введите M для выбора следующих двух элементов.

```
→ Device Drivers
	→ Multimedia support
		→ V4L platform devices
			<M>   sunxi video input (camera csi/mipi isp vipp)driver
			<M>     v4l2 new driver for SUNXI
```

![image-20230419174735087](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230419174735087.png)



Вы можете видеть, что Allwinner уже поддерживает множество камер. Найдите камеру, которую вам нужно адаптировать, введите M, чтобы скомпилировать драйвер gc2053 как модуль.

```
→ Device Drivers
	→ Multimedia support
		→ V4L platform devices
			→ sensor driver select
				<M> use gc2053_mipi driver
```

Примечание: если пути не отображаются, вам необходимо выбрать родительский каталог, чтобы он открылся.

![image-20230419170040385](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230419170040385.png)

## 5. Конфигурация Tina

В корневой директории Tina введите `make menuconfig`, перейдите в следующую директорию

```
 > Kernel modules
 	> Video Support
 		<*> kmod-vin-v4l2.............................. Video input support (staging)
```

Как показано на рисунке ниже

![image-20230419170855104](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230419170855104.png)

## 6. Конфигурация modules.mk

modules.mk выполняет две основные функции:

1. Копирование соответствующих модулей ko в rootfs платы
2. Автоматическая загрузка соответствующих модулей ko по порядку при загрузке rootfs

Путь файла modules.mk:

```shell
tina-v853-open/openwrt/target/v853/v853-100ask/modules.mk
```

Конфигурация порядка загрузки драйвера

```makefile
 define KernelPackage/vin-v4l2
   SUBMENU:=$(VIDEO_MENU)
   TITLE:=Video input support (staging)
   DEPENDS:=
   FILES:=$(LINUX_DIR)/drivers/media/v4l2-core/videobuf2-core.ko
   FILES+=$(LINUX_DIR)/drivers/media/v4l2-core/videobuf2-dma-contig.ko
   FILES+=$(LINUX_DIR)/drivers/media/v4l2-core/videobuf2-memops.ko
   FILES+=$(LINUX_DIR)/drivers/media/v4l2-core/videobuf2-v4l2.ko
   FILES+=$(LINUX_DIR)/drivers/media/platform/sunxi-vin/vin_io.ko
   FILES+=$(LINUX_DIR)/drivers/media/platform/sunxi-vin/modules/sensor/gc2053_mipi.ko
 #  FILES+=$(LINUX_DIR)/drivers/media/platform/sunxi-vin/modules/sensor_power/sensor_power.ko
   FILES+=$(LINUX_DIR)/drivers/media/platform/sunxi-vin/vin_v4l2.ko
   FILES+=$(LINUX_DIR)/drivers/input/sensor/da380/da380.ko
   AUTOLOAD:=$(call AutoProbe,videobuf2-core videobuf2-dma-contig videobuf2-memops videobuf2-v4l2 vin_io gc2053_mipi vin_v4l2 da380.ko)
 endef

 define KernelPackage/vin-v4l2/description
  Kernel modules for video input support
 endef

 $(eval $(call KernelPackage,vin-v4l2))
```

## 7. Конфигурация S00mpp

На платформе V853, после завершения конфигурации modules.mk, также необходимо завершить конфигурацию скрипта монтирования .ko S00mpp для быстрого запуска модуля камеры при включении.

Путь конфигурации S00mpp:

```
tina-v853-open/openwrt/target/v853/v853-100ask/busybox-init-base-files/etc/init.d/S00mpp
```

Скрипт предварительно загружает драйвер камеры. Приложение может быстро конфигурировать и запускаться при необходимости.

```
#!/bin/sh
#
# Load mpp modules....
#

MODULES_DIR="/lib/modules/`uname -r`"

start() {
    printf "Load mpp modules\n"
    insmod $MODULES_DIR/videobuf2-core.ko
    insmod $MODULES_DIR/videobuf2-memops.ko
    insmod $MODULES_DIR/videobuf2-dma-contig.ko
    insmod $MODULES_DIR/videobuf2-v4l2.ko
    insmod $MODULES_DIR/vin_io.ko
#   insmod $MODULES_DIR/sensor_power.ko
    insmod $MODULES_DIR/gc4663_mipi.ko
    insmod $MODULES_DIR/vin_v4l2.ko
    insmod $MODULES_DIR/sunxi_aio.ko
    insmod $MODULES_DIR/sunxi_eise.ko
#   insmod $MODULES_DIR/vipcore.ko
}

stop() {
    printf "Unload mpp modules\n"
#   rmmod $MODULES_DIR/vipcore.ko
    rmmod $MODULES_DIR/sunxi_eise.ko
    rmmod $MODULES_DIR/sunxi_aio.ko
    rmmod $MODULES_DIR/vin_v4l2.ko
    rmmod $MODULES_DIR/gc4663_mipi.ko
#   rmmod $MODULES_DIR/sensor_power.ko
    rmmod $MODULES_DIR/vin_io.ko
    rmmod $MODULES_DIR/videobuf2-v4l2.ko
    rmmod $MODULES_DIR/videobuf2-dma-contig.ko
    rmmod $MODULES_DIR/videobuf2-memops.ko
    rmmod $MODULES_DIR/videobuf2-core.ko
}

case "$1" in
    start)
    start
    ;;
    stop)
    stop
    ;;
    restart|reload)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart}"
    exit 1
esac

exit $?
```

## 8. Добавление тестовой программы камеры

В корневой директории Tina выполните `make menuconfig`, после входа в интерфейс конфигурации Tina перейдите в следующую директорию и введите Y для выбора тестовой программы camerademo.

```
> Allwinner
	> Vision
		<*> camerademo........................................ camerademo test sensor  --->
```

![image-20230419174305027](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230419174305027.png)

## 8. Компиляция и запись образа

В корневой директории Tina введите `make -j32`

```
book@100ask:~/workspaces/tina-v853-open$ make -j32
...
book@100ask:~/workspaces/tina-v853-open$ pack
...
```

После создания образа скопируйте образ файла v853_linux_100ask_uart0.img из директории tina-v853-open/out/v853/100ask/openwrt/ на компьютер с ОС Windows и используйте инструмент прошивки Allwinner PhoenixSuit для записи его на отладочную плату.

Перед включением необходимо подключить кабель питания 12V и два кабеля Type-C, переместить переключатель в направлении разъёма питания, включить питание и после записи нового образа дождаться загрузки системы. В командной строке введите `lsmod`

```
root@TinaLinux:/# lsmod
Module                  Size  Used by
 vin_v4l2              181099  0
gc2053_mipi             8567  0
 vin_io                 21106  3 vin_v4l2,gc2053_mipi
videobuf2_v4l2          9304  1 vin_v4l2
videobuf2_dma_contig     8632  1 vin_v4l2
videobuf2_memops         948  1 videobuf2_dma_contig
videobuf2_core         22168  2 vin_v4l2,videobuf2_v4l2
xradio_wlan              598  0
xradio_core           431911  1 xradio_wlan
xradio_mac            222724  1 xradio_core
```

Вы можете видеть, что драйвер VIN и драйвер GC2053, которые мы выбрали ранее, уже загружены

## 9. Запуск тестовой программы камеры

В терминале последовательного порта отладочной платы введите `camedemo -h` для вывода учебника по использованию тестовой программы камеры

```
root@TinaLinux:/# camerademo -h
[CAMERA]**********************************************************
[CAMERA]*                                                        *
[CAMERA]*              this is camera test.                      *
[CAMERA]*                                                        *
[CAMERA]**********************************************************
[CAMERA]******************** camerademo help *********************
[CAMERA] This program is a test camera.
[CAMERA] It will query the sensor to support the resolution, output format and test frame rate.
[CAMERA] At the same time you can modify the data to save the path and get the number of photos.
[CAMERA] When the last parameter is debug, the output will be more detailed information
[CAMERA] There are eight ways to run:
[CAMERA]    1.camerademo --- use the default parameters.
[CAMERA]    2.camerademo debug --- use the default parameters and output debug information.
[CAMERA]    3.camerademo setting --- can choose the resolution and data format.
[CAMERA]    4.camerademo setting debug --- setting and output debug information.
[CAMERA]    5.camerademo NV21 640 480 30 bmp /tmp 5 --- param input mode,can save bmp or yuv.
[CAMERA]    6.camerademo NV21 640 480 30 bmp /tmp 5 debug --- output debug information.
[CAMERA]    7.camerademo NV21 640 480 30 bmp /tmp 5 Num --- /dev/videoNum param input mode,can save bmp or yuv.
[CAMERA]    8.camerademo NV21 640 480 30 bmp /tmp 5 Num debug --- /dev/videoNum output debug information.
[CAMERA]    8.camerademo NV21 640 480 30 bmp /tmp 5 Num 1 --- 1/2: chose memory: V4L2_MEMORY_MMAP/USERPTR
[CAMERA]**********************************************************
```

В терминале последовательного порта отладочной платы введите `camerademo NV21 640 480 30 bmp /tmp 5`. Будет сделано 5 фотографий и помещено в директорию /tmp. Скопируйте файлы из директории /tmp на компьютер, чтобы просмотреть соответствующие изображения.

Подробный учебник см.: https://tina.100ask.net/SdkModule/Linux_Camera_DevelopmentGuide-06/
