# Разработка малого ядра E907 на отладочной плате

## 0. Предисловие

Отладочная плата 100ASK_V853-PRO имеет чип V853, интегрирующий два процессора: ARM Cortex-A7 и RISC-V E907. Сянь Те E907 - это полностью синтезируемый высокопроизводительный MCU процессор. Он совместим с набором команд RV32IMAC и обеспечивает значительное повышение производительности целых чисел, а также высокоэффективную производительность работы с плавающей точкой. Основные характеристики E907 включают: однопрецизионное и двойнопрецизионное арифметико-логические устройства с плавающей точкой, а также быстрый ответ на прерывания. Ниже приведено описание ядра RISC-V E907.

![img](https://bbs.aw-ol.com/assets/uploads/files/1677222896251-934bf475-964e-4113-b4ac-9a19c4bc8783-%E5%9B%BE%E7%89%87.png)

В этой главе основное внимание уделяется разработке малого ядра E907 и обмену данными между малым ядром и большим ядром ARM A7.

Официальный веб-сайт T-Head E907: https://www.t-head.cn/product/E907?spm=a2ouz.12986968.0.0.7bfc2cbdcYnL2b

Центр загрузки ресурсов микросхемы E907: https://occ.t-head.cn/community/download?id=3916180248689188864

Руководство по разработке E907 Allwinner: https://tina.100ask.net/SdkModule/Linux_E907_DevelopmentGuide-01/

Разработка и использование E907 на V85x Yuzuki: https://www.gloomyghost.com/live/20230215.aspx



## 1. Конфигурирование среды E907

BSP пакет E907_RTOS: https://github.com/YuzukiHD/Yuzukilizard/tree/master/Software/BSP/e907_rtos

Цепочка инструментов компиляции E907: https://github.com/YuzukiHD/Yuzukilizard/releases/download/Compiler.0.0.1/riscv64-elf-x86_64-20201104.tar.gz

Благодаря репозиторию E907_RTOS на V851S от Yuzuki, я разместил пакет разработки E907 на Baidu NetDisk для удобства всех. Ссылка:

Ссылка: https://pan.baidu.com/s/1TX742vfEde9bMLd9IrwwqA?pwd=sp6a
Код доступа: sp6a

Вы можете получить `e907_rtos.tar.gz` из диска ресурсов V853 на Baidu NetDisk в папке 09_E907 Development Package.

## 1.1 Компиляция исходного кода E907

Поместите загруженный пакет разработки E907 в любую директорию, предположим, вы поместили его в директорию `/home/book/workspaces`

```
book@100ask:~/workspaces$ ls
e907_rtos.tar.gz
```

Распакуйте архив исходного кода e907, введите `tar -xzvf e907_rtos.tar.gz `, например:

```
book@100ask:~/workspaces$ tar -xzvf e907_rtos.tar.gz
e907_rtos/
e907_rtos/README.md
e907_rtos/rtos/
e907_rtos/rtos/LICENSE
e907_rtos/rtos/toolchain/
e907_rtos/rtos/toolchain/riscv64-elf-x86_64-20201104/
e907_rtos/rtos/toolchain/riscv64-elf-x86_64-20201104/libexec/
e907_rtos/rtos/toolchain/riscv64-elf-x86_64-20201104/libexec/gcc/
...
```

После распаковки перейдите в директорию исходного кода e907

```
book@100ask:~/workspaces$ cd e907_rtos/
book@100ask:~/workspaces/e907_rtos$ ls
README.md  rtos  rtos-hal
```

Перейдите в директорию `rtos/source/`

```
book@100ask:~/workspaces/e907_rtos$ cd rtos/source/
book@100ask:~/workspaces/e907_rtos/rtos/source$ ls
disfunc.sh  ekernel   envsetup.sh  Kbuild   Kconfig.melis     Makefile      modules.order  platform.txt  scripts
drivers     emodules  include      Kconfig  Kconfig.platform  melis-env.sh  out            projects      tools
```

Конфигурируйте переменные окружения компиляции, введите `source melis-env.sh`

```
book@100ask:~/workspaces/e907_rtos/rtos/source$ source melis-env.sh
```

Введите `lunch` для выбора соответствующей отладочной платы

```
book@100ask:~/workspaces/e907_rtos/rtos/source$ lunch

You're building on Linux 100ask 5.4.0-148-generic #165~18.04.1-Ubuntu SMP Thu Apr 20 01:14:06 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux

Lunch menu... pick a combo:
The supported board:
    1. v851-e907-lizard
    2. v851-e907-lizard-tinymaix
    3. v853-e907-100ask
    4. v853-e907-100ask-tinymaix
What is your choice?
```

На этом этапе введите 3 и нажмите Enter. Выберите решение `v853-e907-100ask`, результат выбора будет выглядеть следующим образом

```
book@100ask:~/workspaces/e907_rtos/rtos/source$ lunch

You're building on Linux 100ask 5.4.0-148-generic #165~18.04.1-Ubuntu SMP Thu Apr 20 01:14:06 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux

Lunch menu... pick a combo:
The supported board:
    1. v851-e907-lizard
    2. v851-e907-lizard-tinymaix
    3. v853-e907-100ask
    4. v853-e907-100ask-tinymaix
What is your choice? 3
You have select v853-e907-100ask
============================================
Project Based On Platform sun20iw3p1 v853-e907-100ask
============================================
```

Теперь вы можете начать компиляцию, введите `make`

```
book@100ask:~/workspaces/e907_rtos/rtos/source$ make
scripts/kconfig/conf  --silentoldconfig Kconfig
  CHK     include/config/kernel.release
  CHK     include/generated/uapi/melis/version.h
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
  UPD     include/generated/uapi/melis/version.h
  CHK     include/generated/utsrelease.h
  CC      sysconfig.fex
  CC      ekernel/arch/common/common.o
  LD      ekernel/arch/common/built-in.o
  AS      ekernel/arch/riscv/sunxi/blobdata.o
  LD      ekernel/arch/riscv/sunxi/built-in.o
  LD      ekernel/arch/riscv/built-in.o
  LD      ekernel/arch/built-in.o
  LD      ekernel/built-in.o
  LD [M]  ekernel/melis30.o
/home/book/workspaces/e907_rtos/rtos/source/../toolchain/riscv64-elf-x86_64-20201104//bin/riscv64-unknown-elf-ld: ekernel/melis30.o: section .dram_seg.stack lma 0x43c3a2b8 adjusted to 0x43c3a34c
  OBJCOPY ekernel/melis30.bin
  RENAME  ekernel/melis30.o ----> ekernel/melis30.elf
/home/book/workspaces/e907_rtos/rtos/source/../toolchain/riscv64-elf-x86_64-20201104//bin/riscv64-unknown-elf-strip: ekernel/stW7SdkR: section .dram_seg.stack lma 0x43c3a2b8 adjusted to 0x43c3a34c

   text    data     bss     dec     hex filename
 221280   17132   25488  263900   406dc ekernel/melis30.elf

  pack    melis

#### make completed successfully (11 seconds) ####
```

После завершения компиляции в директории `ekernel/` будет создан файл `melis30.elf`, который можно использовать для запуска малого ядра.



### 1.2 Параметры конфигурации E907

Конфигурация пакета разработки E907 аналогична конфигурации Tina SDK. В директории `e907_rtos/rtos/source` выполните `make menuconfig`

Например:

```
book@100ask:~/workspaces/e907_rtos/rtos/source$ make menuconfig
```

После выполнения появится следующий интерфейс:

![image-20230504112330976](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504112330976.png)



## 2. Загрузка малого ядра E907

### 2.1 Конфигурация Tina

#### 2.1.1 Конфигурация дерева устройств

В корневой директории Tina перейдите в директорию дерева устройств

```
book@100ask:~/workspaces/tina-v853-open$ cd device/config/chips/v853/configs/100ask/
```

Отредактируйте дерево устройств

```
book@100ask:~/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask$ vi board.dts
```

В файле дерева устройств найдите узел дерева устройств, относящийся к E907. По умолчанию параметры дерева устройств установлены следующим образом:

```
reserved-memory {
                e907_dram: riscv_memserve {
                        reg = <0x0 0x48000000 0x0 0x00400000>;
                        no-map;
                };

                vdev0buffer: vdev0buffer@47000000 {
                        /* 256k reserved for shared mem pool */
                        compatible = "shared-dma-pool";
                        reg = <0x0 0x47000000 0x0 0x40000>;
                        no-map;
                };

                vdev0vring0: vdev0vring0@47040000 {
                        reg = <0x0 0x47040000 0x0 0x20000>;
                        no-map;
                };

                vdev0vring1: vdev0vring1@47060000 {
                        reg = <0x0 0x47060000 0x0 0x20000>;
                        no-map;
                };
        };

        e907_rproc: e907_rproc@0 {
                compatible = "allwinner,sun8iw21p1-e907-rproc";
                clock-frequency = <600000000>;
                memory-region = <&e907_dram>, <&vdev0buffer>,
                                                <&vdev0vring0>, <&vdev0vring1>;

                mboxes = <&msgbox 0>;
                mbox-names = "mbox-chan";
                iommus = <&mmu_aw 5 1>;

                memory-mappings =
                /* DA            len         PA */
                        /* DDR for e907  */
                        < 0x48000000 0x00400000 0x48000000 >;
                core-name = "sun8iw21p1-e907";
                firmware-name = "melis-elf";
                status = "okay";
        };

        rpbuf_controller0: rpbuf_controller@0 {
                compatible = "allwinner,rpbuf-controller";
                remoteproc = <&e907_rproc>;
                ctrl_id = <0>;  /* index of /dev/rpbuf_ctrl */
                iommus = <&mmu_aw 5 1>;
                status = "okay";
        };

        rpbuf_sample: rpbuf_sample@0 {
                compatible = "allwinner,rpbuf-sample";
                rpbuf = <&rpbuf_controller0>;
                status = "okay";
        };
```

Так как нам нужно использовать `uart3` для вывода информации малого ядра E907, нужно отключить узел `uart3`, чтобы не позволить ядру его занять

```
&uart3 {
        pinctrl-names = "default", "sleep";
        pinctrl-0 = <&uart3_pins_active>;
        pinctrl-1 = <&uart3_pins_sleep>;
        uart-supply = <&reg_dcdc1>;
        status = "okay";
};
```

Измените мультиплексирование выводов дерева устройств

```
uart3_pins_active: uart3@0 {
                allwinner,pins = "PH0", "PH1";
                allwinner,function = "uart3";
                allwinner,muxsel = <5>;
                allwinner,drive = <1>;
                allwinner,pull = <1>;
        };

        uart3_pins_sleep: uart3@1 {
                allwinner,pins = "PH0", "PH1";
                allwinner,function = "gpio_in";
                allwinner,muxsel = <0>;
        };
```



#### 2.1.2 Конфигурация ядра

В корневой директории Tina выполните `make kernel_menuconfig`, например:

```
book@100ask:~/workspaces/tina-v853-open$ make kernel_menuconfig
```

**1. Включение поддержки аппаратной части**

После входа в интерфейс конфигурации ядра перейдите в директорию ` Device Drivers  `, выберите `Mailbox Hardware Support`, как показано на рисунке ниже

![image-20230504145616213](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504145616213.png)

После выбора перейдите в директорию `Mailbox Hardware Support` и выберите `sunxi Mailbox` и `sunxi rv32 standby driver`, результат будет выглядеть следующим образом:

![image-20230504145817407](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504145817407.png)

**2. Включение драйвера RPMsg**

Перейдите в следующую директорию

```
→ Device Drivers
	→ Rpmsg drivers
```

Выберите следующую конфигурацию

```
<*> allwinnertech rpmsg driver for v853-e907
<*> allwinnertech rpmsg hearbeat driver
<*> sunxi rpmsg ctrl driver
<*> Virtio RPMSG bus driver
```

После выбора результат будет выглядеть следующим образом:

![image-20230504145408205](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504145408205.png)

**3. Включение драйвера общей памяти**

Перейдите в следующую директорию

```
→ Device Drivers
	→ Remoteproc drivers
```

Выберите следующую конфигурацию

```
<*> SUNXI remote processor support  --->
```

Как показано на рисунке ниже:

![image-20230504150510997](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504150510997.png)

После внесения изменений сохраните конфигурацию ядра и выйдите.

#### 2.1.3 Компиляция новой версии образа

В корневой директории Tina введите `make` для компиляции только что выбранных драйверов ядра, после завершения компиляции введите `pack` для создания нового образа. Например:

```
book@100ask:~/workspaces/tina-v853-open$ make
...
book@100ask:~/workspaces/tina-v853-open$ pack
...
```

После создания нового образа скопируйте созданный файл `v853_linux_100ask_uart0.img` на хост-машину Windows.

### 2.2 Конфигурация E907

#### 2.2.1 Изменение скрипта компоновки E907

Перейдите в директорию `e907_rtos/rtos/source/projects/v853-e907-100ask`, найдите файл `kernel.lds`, который содержит информацию о компоновке малого ядра E907.

```
book@100ask:~/workspaces/e907_rtos/rtos/source/projects/v853-e907-100ask$ ls
configs  data  epos.img  kernel.lds  src  version
```

Измените `kernel.lds`, найдите узел `MEMORY` и измените начальный адрес на `0x48000000` и длину на `0x00400000`. Эти параметры должны соответствовать параметрам памяти E907 в дереве устройств Tina. Вы можете изменить узел `MEMORY` на:

```
MEMORY
{
   /*DRAM_KERNEL: 4M */
   DRAM_SEG_KRN (rwx) : ORIGIN = 0x48000000, LENGTH = 0x00400000
}
```

Сравнительная диаграмма следующая:

![image-20230504152546509](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504152546509.png)

Здесь используется адрес `0x48000000` при условии, что V853 имеет 128M памяти, шестнадцатеричное значение `0x48000000`; длина составляет 4M, шестнадцатеричное значение `0x00400000`

#### 2.2.2 Изменение конфигурации E907

Перейдите в директорию `e907_rtos/rtos/source/projects/v853-e907-100ask/configs` и измените файл `defconfig`, например:

```
book@100ask:~/workspaces/e907_rtos/rtos/source/projects/v853-e907-100ask$ cd configs/
book@100ask:~/workspaces/e907_rtos/rtos/source/projects/v853-e907-100ask/configs$ ls
defconfig  sys_config.fex
```

Измените следующие три параметра на:

```
CONFIG_DRAM_PHYBASE=0x48000000
CONFIG_DRAM_VIRTBASE=0x48000000
CONFIG_DRAM_SIZE=0x0400000
```

Как показано на рисунке ниже:

![image-20230504153420513](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504153420513.png)

#### 2.2.3 Использование uart3 для вывода информации

**1. Изменение мультиплексирования выводов**

Конфигурируйте файл мультиплексирования выводов. Перейдите в директорию `e907_rtos/rtos/source/projects/v853-e907-100ask/configs`

Измените файл `sys_config.fex`, используя справочник по данным, просмотрите функции мультиплексирования выводов. Мы используем PH0 и PH1 как функцию `uart3`

![image-20230504161901226](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504161901226.png)

Измените узел uart3 на:

```
[uart3]
uart_tx         = port:PH00<5><1><default><default>
uart_rx         = port:PH01<5><1><default><default>
```

**2. Изменение конфигурации**

В директории `e907_rtos/rtos/source` введите `make menuconfig`, перейдите в интерфейс конфигурации E907

Перейдите в следующую директорию и выберите `[*] Support Serial Driver`

```
 → Kernel Setup
 	→ Drivers Setup
 		→ Melis Source Support
 			[*] Support Serial Driver
```

![image-20230504155321387](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504155321387.png)



Перейдите в следующую директорию и выберите `[*] enable sysconfig`, включите функцию чтения и анализа sys_config.fex

```
 → Kernel Setup
 	→ Drivers Setup
 		→ SoC HAL Drivers
 			→ Common Option
 				[*] enable sysconfig
```

![image-20230504155644570](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504155644570.png)



Перейдите в следующую директорию, включите драйвер uart и используйте uart3.

```
 → Kernel Setup
 	→ Drivers Setup
 		→ SoC HAL Drivers
 			→ UART Devices
 				[*] enable uart driver
 				[*]   support uart3 device
 				(3)   cli uart port number
```

![image-20230504155927822](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504155927822.png)

Перейдите в следующую директорию, включите анализатор sys_config.fex

```
 → Kernel Setup
 	→ Subsystem support
 		→ devicetree support
 			[*] support traditional fex configuration method parser.
```

![image-20230504160213237](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504160213237.png)

Сохраните и выйдите из конфигурации E907.

#### 2.2.4 Компиляция для создания нового образа

В директории `workspaces/e907_rtos/rtos/source` введите `make`

```
book@100ask:~/workspaces/e907_rtos/rtos/source$ make
  CHK     include/config/kernel.release
  CHK     include/generated/uapi/melis/version.h
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
fatal: not a git repository (or any parent up to mount point /)
Stopping at filesystem boundary (GIT_DISCOVERY_ACROSS_FILESYSTEM not set).
  UPD     include/generated/uapi/melis/version.h
  CHK     include/generated/utsrelease.h
  CC      sysconfig.fex
  CC      ekernel/arch/common/common.o
  LD      ekernel/arch/common/built-in.o
  AS      ekernel/arch/riscv/sunxi/blobdata.o
  LD      ekernel/arch/riscv/sunxi/built-in.o
  LD      ekernel/arch/riscv/built-in.o
  LD      ekernel/arch/built-in.o
  LD      ekernel/built-in.o
  LD [M]  ekernel/melis30.o
/home/book/workspaces/e907_rtos/rtos/source/../toolchain/riscv64-elf-x86_64-20201104//bin/riscv64-unknown-elf-ld: ekernel/melis30.o: section .dram_seg.stack lma 0x4803a2b8 adjusted to 0x4803a34c
  OBJCOPY ekernel/melis30.bin
  RENAME  ekernel/melis30.o ----> ekernel/melis30.elf
/home/book/workspaces/e907_rtos/rtos/source/../toolchain/riscv64-elf-x86_64-20201104//bin/riscv64-unknown-elf-strip: ekernel/stWPSq13: section .dram_seg.stack lma 0x4803a2b8 adjusted to 0x4803a34c

   text    data     bss     dec     hex filename
 221280   17132   25488  263900   406dc ekernel/melis30.elf

  pack    melis

#### make completed successfully (7 seconds) ####
```

После завершения компиляции в директории `ekernel` будет создан файл `melis30.elf`.

### 2.3 Проверка аппаратной части отладочной платы

Обнаружено, что резистор R36 на отладочной плате 100ASK_V853-PRO вызывает слишком высокую скорость передачи `uart3`. Поэтому необходимо проверить, присутствует ли резистор R36 на отладочной плате, и если да, его нужно удалить вручную. На рисунке ниже показано расположение резистора R36. Резистор находится в красной рамке

![image-20230505100755222](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230505100755222.png)

Если резистор присутствует, его нужно удалить вручную. На рисунке ниже показана схема удаления резистора R36

![image-20230505111423226](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230505111423226.png)

После удаления резистора R36 вы сможете нормально использовать последовательный порт `uart3`.



### 2.4 Включение E907 на отладочной плате

Используйте инструмент прошивки Allwinner `AllwinnertechPhoeniSuit` для обновления нового образа Tina. Для получения дополнительной информации см. https://forums.100ask.net/t/topic/2882

После завершения обновления откройте терминал последовательного порта и перейдите на консоль отладочной платы. Скопируйте `melis30.elf` в директорию `/lib/firmware`.

Предположим, я использую функцию ADB для копирования файла в директорию `root/` отладочной платы

```
root@TinaLinux:~# cd /root/
root@TinaLinux:~# ls
melis30.elf
```

Скопируйте `melis30.elf` из директории `root` в директорию `/lib/firmware`

```
root@TinaLinux:~# cp melis30.elf /lib/firmware/
root@TinaLinux:~# ls /lib/firmware/
boot_xr829.bin   fw_xr829.bin     melis30.elf      sdd_xr829.bin
etf_xr829.bin    fw_xr829_bt.bin  regulatory.db
```

После завершения копирования вы можете увидеть прошивку малого ядра в директории `/lib/firmware`.

#### 2.4.1 Подключение uart3 отладочной платы

На этом этапе необходимо использовать модуль преобразователя USB в последовательный порт для подключения к `uart3`, который мы установили выше. Нам нужно найти на отладочной плате контакты PH0, PH1 и GND и подключить их к выводам RXD, TXD и GND модуля преобразователя USB в последовательный порт соответственно. Отладочная плата 100ASK_V853-PRO уже вывела контакты PH0, PH1 и GND. Расположение показано на рисунке ниже

![image-20230504175344715](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504175344715.png)

Конкретные контакты можно посмотреть на обратной стороне отладочной платы. Проверьте расположение контактов.

![image-20230504175534607](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504175534607.png)

Из обозначений на обратной стороне вы можете узнать расположение PH0, PH1 и GND, как показано на рисунке ниже. PH0, PH1 и GND должны быть подключены к выводам RX, TX и GND модуля преобразователя USB в последовательный порт соответственно.

![image-20230504180138631](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230504180138631.png)

После подключения модуля преобразователя USB в последовательный порт на хост-машину Windows используйте программное обеспечение последовательного порта для открытия интерфейса uart3. Скорость передачи составляет 115200.

В терминале последовательного порта разработочной платы Tina Linux введите

```
root@TinaLinux:~# echo melis30.elf > /sys/kernel/debug/remoteproc/remoteproc0/firmware
```

Поместите прошивку `melis30.elf` на аппаратный узел `firmware`, запустите прошивку E907

```
root@TinaLinux:~# echo start > /sys/kernel/debug/remoteproc/remoteproc0/state
[ 3926.510018]  remoteproc0: powering up e907_rproc
[ 3926.515440]  remoteproc0: failed to parser head (melis30.elf) ret=-2
[ 3926.522674]  remoteproc0: failed to read boot_package item
[ 3926.528930]  remoteproc0: request_firmware failed from boot_package: -14
[ 3926.537528] virtio_rpmsg_bus virtio0: rpmsg host is online
[ 3926.543964]  remoteproc0: registered virtio0 (type 7)
[ 3926.550538]  remoteproc0: remote processor e907_rproc is now up
root@TinaLinux:~# [ 3926.560537] virtio_rpmsg_bus virtio0: creating channel rpbuf-service addr 0x400
[ 3926.569199] virtio_rpmsg_bus virtio0: creating channel sunxi,rpmsg_heartbeat addr 0x401
[ 3926.578725] virtio_rpmsg_bus virtio0: creating channel sunxi,notify addr 0x402
[ 3926.587194] virtio_rpmsg_bus virtio0: creating channel sunxi,rpmsg_ctrl addr 0x403
```

После включения вы сможете увидеть следующую информацию вывода в другом интерфейсе последовательного порта

```
|commitid:
|halgitid:
|timever : Thu, 04 May 2023 04:22:23 -0400

scheduler startup
msh >Start Rpmsg Hearbeat Timer
rpmsg ctrldev: Start Running...
```

Нажмите Enter для входа в интерфейс терминала.

Введите `ps` для просмотра информации о процессах малого ядра

```
msh >ps
thread                           pri  status      sp     stack size max used left tick  error
-------------------------------- ---  ------- ---------- ----------  ------  ---------- ---
tshell                            21  ready   0x000003e8 0x00004000    19%   0x00000008 000
ctrldev                            6  suspend 0x00000148 0x00001000    08%   0x0000000a 000
rpmsg_srm                          8  suspend 0x000000f8 0x00000800    22%   0x0000000a 000
vring-ipi                         15  suspend 0x00000118 0x00002000    03%   0x0000000a 000
rpbuf_init                         8  suspend 0x000000e8 0x00001000    12%   0x0000000a 000
standby                            1  suspend 0x00000128 0x00001000    07%   0x0000000a 000
tidle                             31  ready   0x00000178 0x00002000    04%   0x0000001e 000
timer                              8  suspend 0x000000d8 0x00000200    73%   0x0000000a 000
```

## 3. Двухядерная коммуникация

### 3.1 Создание узлов коммуникации малым ядром E907

В терминале последовательного порта малого ядра E907 создайте два узла коммуникации для прослушивания данных, введите `eptdev_bind test 2`

```
msh >eptdev_bind test 2
```

Посмотрите узлы прослушивания, введите `rpmsg_list_listen`

```
msh >rpmsg_list_listen
name             listen  alive
test             2  0
console                  100  0
```

### 3.2 Создание узлов коммуникации большим ядром

Также создайте два узла прослушивания коммуникации в Tina Linux, введите следующие две команды

```
echo test > /sys/class/rpmsg/rpmsg_ctrl0/open
echo test > /sys/class/rpmsg/rpmsg_ctrl0/open
```

После введения результат выглядит следующим образом:

```
root@TinaLinux:~# echo test > /sys/class/rpmsg/rpmsg_ctrl0/open
[ 5060.227158] virtio_rpmsg_bus virtio0: creating channel sunxi,rpmsg_client addr 0x404
s/rpmsg/rpmsg_ctrl0/openroot@TinaLinux:~# echo test > /sys/class/rpmsg/rpmsg_ctrl0/open
[ 5061.464758] virtio_rpmsg_bus virtio0: creating channel sunxi,rpmsg_client addr 0x405
```

В большом ядре Tina Linux также созданы два узла прослушивания, введите `ls /dev/rpmsg*` для просмотра информации узла

```
root@TinaLinux:~# ls /dev/rpmsg*
/dev/rpmsg0       /dev/rpmsg1       /dev/rpmsg_ctrl0
```

После создания вы можете увидеть автоматически выводимую информацию в терминале малого ядра E907.

```
msh >ctrldev: Rx 44 Bytes
client: Rx 8 Bytes
rpmsg0: binding
send 0x13131411 to rpmsg0
create rpmsg0 client success
ctrldev: Rx 44 Bytes
client: Rx 8 Bytes
rpmsg1: binding
send 0x13131411 to rpmsg1
create rpmsg1 client success
```

### 3.3 Передача от большого ядра к малому ядру E907

В Tina Linux введите

```
echo "hello 100ASK_V853-PRO" > /dev/rpmsg0
echo "hello Tina Linux" > /dev/rpmsg1
```

Передайте информацию `Linux Message 0` через созданный узел прослушивания в малое ядро E907, например:

```
root@TinaLinux:~# echo "hello 100ASK_V853-PRO" > /dev/rpmsg0
root@TinaLinux:~# echo "hello Tina Linux" > /dev/rpmsg1
```

После введения откройте терминал последовательного порта E907 и вы найдете информацию, переданную от большого ядра.

```
rpmsg0: Rx 22 Bytes
Data:hello 100ASK_V853-PRO

rpmsg1: Rx 17 Bytes
Data:hello Tina Linux
```

### 3.4 Передача от малого ядра E907 к большому ядру

На стороне малого ядра используйте команду `eptdev_send` с синтаксисом `eptdev_send <id> <data>`. Здесь номер `id` начинается с 0. У нас есть два узла коммуникации, поэтому номера id составляют 0 и 1.

В терминале последовательного порта малого ядра введите следующие команды:

```
 eptdev_send 0 "hello E907"
 eptdev_send 1 "hello E907"
```

Например:

```
msh >eptdev_send 0 "hello E907"
will send hello E907 to rpmsg0
msh >eptdev_send 1 "hello E907"
will send hello E907 to rpmsg1
```

После введения малое ядро передаст информацию в два узла коммуникации rpmsg0 и rpmsg1 соответственно. Вы можете ввести на стороне большого ядра Tina Linux

```
cat /dev/rpmsg0
cat /dev/rpmsg1
```

Вы можете просмотреть информацию, переданную от малого ядра E907. Например:

```
root@TinaLinux:~# cat /dev/rpmsg0
hello E907
^C
root@TinaLinux:~# cat /dev/rpmsg1
hello E907
^C
```

Нажмите Ctrl+C для завершения прослушивания узла.

Вы можете многократно передавать информацию на стороне малого ядра на этот узел. Этот узел поддерживает постоянное получение информации, передаваемой малым ядром, например:

На E907 малом ядре, несколько раз передавайте информацию в узел прослушивания `rpmsg0`

```
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
msh >eptdev_send 0 "hello E907 "
will send hello E907  to rpmsg0
```

На стороне большого ядра вы будете постоянно получать информацию, передаваемую малым ядром

```
root@TinaLinux:~# cat /dev/rpmsg0
hello E907 hello E907 hello E907 hello E907 hello E907 hello E907 hello E907
```

### 3.5 Закрытие коммуникации

На стороне большого ядра Tina Linux, работайте с узлом, введите следующую команду. Введите `echo <id>` для узла rpmsg control, чтобы закрыть узел

```
echo 0 > /sys/class/rpmsg/rpmsg_ctrl0/close
echo 1 > /sys/class/rpmsg/rpmsg_ctrl0/close
```

Например:

```
root@TinaLinux:~# echo 0 > /sys/class/rpmsg/rpmsg_ctrl0/close
[ 6783.156899] virtio_rpmsg_bus virtio0: destroying channel sunxi,rpmsg_client addr 0x404
root@TinaLinux:~# echo 1 > /sys/class/rpmsg/rpmsg_ctrl0/close
root@TinaLinux:~# [ 6784.224740] virtio_rpmsg_bus virtio0: destroying channel sunxi,rpmsg_client addr 0x405
```

На этом этапе малое ядро E907 также автоматически закроет узел коммуникации и выведет следующую информацию

```
send 0x13131411 to rpmsg0
rpmsg0: unbinding
ctrldev: Rx 44 Bytes
send 0x13131411 to rpmsg1
rpmsg1: unbinding
```
