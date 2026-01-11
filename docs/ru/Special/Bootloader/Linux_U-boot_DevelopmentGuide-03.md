## 4 Функции U-Boot и введение в методы/файлы конфигурации

### 4.1 Введение в функции U-Boot

В встраиваемых операционных системах BootLoader/U-Boot запускается перед ядром операционной системы. Он может инициализировать аппаратные устройства, создавать карту памяти, тем самым приводя программно-аппаратное окружение системы в подходящее состояние, чтобы подготовить правильную среду для окончательного вызова ядра операционной системы. На платформе sunxi, помимо обязательной функции загрузки системы, система BOOT также предоставляет другие функции, такие как прошивка и обновление.

Основные функции U-Boot можно разделить на следующие категории:

1. Загрузка ядра

   Возможность загрузки образа ядра из накопителя (nand/mmc/spinor) в указанное место в DRAM и его запуск.

2. Массовое производство и обновление

   Включает массовое производство с карты, USB массовое производство, запись приватных данных, обновление прошивки.

3. Информационное сообщение при загрузке

   При загрузке может отображаться логотип запуска (формат BMP).

4. Функция Fastboot

   Реализация стандартных команд fastboot, возможность прошивки с использованием fastboot.



### 4.2 Введение в методы конфигурации функций U-Boot

Различные функции в U-Boot могут быть включены или выключены через defconfig или меню конфигурации menuconfig. Конкретный метод конфигурации следующий:

#### 4.2.1 Конфигурация через defconfig

1. vim /longan/brandy/brandy-2.0/u-boot-2018/configs/{LICHEE_CHIP}_defconfig

2. После открытия {LICHEE_CHIP}_defconfig или {LICHEE_CHIP}_nor_defconfig, соответствующую функцию можно включить или выключить, убрав или добавив "#" перед соответствующим макроопределением. Как показано на рисунке ниже, достаточно убрать # перед CONFIG_SUNXI_NAND, чтобы поддержать функции NAND, включение/выключение других макроопределений аналогично. После изменения необходимо выполнить make xxx_defconfig, чтобы изменённая конфигурация вступила в силу.

   ![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxU-bootDevelopmentGuide_001.png)

																			Рисунок 4-1: Схема конфигурации defconfig

#### 4.2.2 Конфигурация через menuconfig

Метод конфигурации через menuconfig выполняется следующим образом:

1. cd brandy/brandy-2.0/u-boot-2018/

2. Выполните команду make menuconfig, откроется окно меню конфигурации menuconfig, как показано на рисунке ниже. В этот момент можно настраивать функции различных модулей, метод конфигурации описан в окне меню конфигурации menuconfig.

3. После изменения конфигурация уже вступила в силу, просто выполните make для генерации соответствующего bin. Если снова выполнить make xxx_defconfig, конфигурация, изменённая через menuconfig, будет перезаписана конфигурацией из xxx_defconfig после выполнения make xxx_defconfig.

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxU-bootDevelopmentGuide_002.png)

																		Рисунок 4-2: Изображение меню конфигурации menuconfig



### 4.3 Введение в файлы параметров конфигурации U-Boot

U-Boot с версии linux-5.4 больше не использует sysconfig и dts ядра в качестве файлов конфигурации, а использует встроенный dts U-Boot для настройки параметров. kernel-dts и U-Boot-dts полностью независимы.



#### 4.3.1 Путь к U-Boot-dts

Путь к U-Boot-dts: vim longan/brandy/brandy-2.0/u-boot-2018/arch/arm/dts



#### 4.3.2 Конфигурация U-Boot-dts, defconfig

| Параметр конфигурации          | Значение параметра конфигурации                               |
| ---------------------------------- | -------------------------------------- |
| CONFIG_OF_SEPARATE                 | Собрать дерево устройств U-Boot как часть U-Boot |
| CONFIG_OF_BOARD                    | Отключить использование внешнего dts                       |
| CONFIG_DEFAULT_DEVICE_TREE         | Выбрать имя файла dts для сборки              |
| CONFIG_SUNXI_NECESSARY_REPLACE_FDT | Включить опцию, реализовать замену внутреннего dts на внешний dts    |



| Параметр конфигурации          | Опция                       |
| ---------------------------------- | -------------------------- |
| CONFIG_OF_SEPARATE                 | y                          |
| CONFIG_OF_BOARD                    | n                          |
| CONFIG_DEFAULT_DEVICE_TREE         | "{LICHEE_CHIP}-soc-system" |
| CONFIG_SUNXI_NECESSARY_REPLACE_FDT | y                          |



#### 4.3.3 Примечания к U-Boot-dts

##### 4.3.3.1 Примечания по компиляции

1. dts делится на уровень платы dts и системный dts.

   Системный dts определяется CONFIG_DEFAULT_DEVICE_TREE, определение этого макроса можно найти в $(CONFIG_SYS_CONFIG_NAME)_defconfig.

   Системный dts в конечном итоге будет включать dts уровня платы, путь к файлу {LICHEE_BOARD_CONFIG_DIR}, имя файла: uboot-board.dts.



2. Мы можем определить запускаемый dts по выводу во время компиляции

```
OBJCOPY examples/standalone/hello_world.srec
OBJCOPY examples/standalone/hello_world.bin
 LD u-boot
OBJCOPY u-boot.srec
OBJCOPY u-boot-nodtb.bin
'{LICHEE_BOARD_CONFIG_DIR}/uboot-board.dts' -> '~/longan/brandy/brandy-2.0/u-boot-2018/
arch/{LICHEE_ARCH}/dts/.board-uboot.dts'
DTC arch/{LICHEE_ARCH}/dts/{LICHEE_CHIP}-soc-system.dtb
SYM u-boot.sym
SHIPPED dts/dt.dtb
FDTGREP dts/dt-spl.dtb
COPY u-boot.dtb
CAT u-boot-dtb.bin
COPY u-boot.bin
'u-boot.bin' -> '{LICHEE_CHIP}.bin' 'u-boot-g{LICHEE_CHIP}.bin' -> '{LICHEE_BRANDY_OUT_DIR}/bin/u-boot-g{LICHEE_CHIP}.bin' 'u-boot-g{LICHEE_CHIP}.bin' -> '{LICHEE_PLAT_OUT}/u-boot-g{LICHEE_CHIP}.bin'
CFGCHK u-boot.cfg
```



##### 4.3.3.2 Примечания по синтаксису

Когда системный dts и dts уровня платы имеют одноименные узлы на одном пути, dts уровня платы будет перезаписывать системный dts.



##### 4.3.3.3 Примечания во время выполнения

1. Для обновления параметров в dts ядра перед загрузкой ядра и возможности просмотра/изменения dts в консоли U-Boot. По этапам можно разделить на этап использования внутреннего dts и этап использования dts ядра, как показано на рисунке ниже.

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxU-bootDevelopmentGuide_003.png)

																	Рисунок 4-3: Схема изменения dts

2. Можно использовать команду set_working_fdt для переключения текущего активного fdt.

```
[04.562]update bootcmd
[04.576]change working_fdt 0x7bebee58 to 0x7be8ee58
[04.587]update dts
Hit any key to stop autoboot: 0
=> set
	set_working_fdt setenv setexpr
=> set_working_fdt 0x7bebee58
change working_fdt 0x7be8ee58 to 0x7bebee58
=>
```
