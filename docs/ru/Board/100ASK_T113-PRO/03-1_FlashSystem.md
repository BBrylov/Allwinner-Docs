# Обновление системы разработки

## Обновление системы на TF-карте

**Внимание: приоритет загрузки T113 с TF-карты выше, чем с встроенной SPI NAND. Если вам нужно загрузиться с системы SPI NAND, сначала извлеките TF-карту.**

* Необходимая подготовка

  - Оборудование: основная плата 100ASK_T113-PRO x1

  - Оборудование: кабель USB Type-C x2

  - Оборудование: устройство чтения TF-карт x1

  - Оборудование: Micro TF-карта объемом 8 ГБ и более x1

  - Программное обеспечение: инструмент записи TF-карт системы Tina: [PhoenixCard-V2.8](https://gitlab.com/dongshanpi/tools/-/raw/main/PhoenixCard-V2.8.zip)

  - Программное обеспечение: инструмент форматирования SD-карт: [SDCardFormatter5](https://gitlab.com/dongshanpi/tools/-/raw/main/SDCardFormatter5.0.1Setup.exe)

  - Программное обеспечение: минимальный образ системы Tina для TF-карты: [tina_t113-100ask_uart3](https://gitlab.com/dongshanpi/tools/-/raw/main/tina_t113-100ask_uart3.zip)



#### 1. Запуск программы записи

Сначала необходимо скачать два инструмента для записи TF-карт: **win32diskimage и специализированный инструмент форматирования SD-карт**, затем получить файл образа системы для TF-карты **tina_t113-100ask_uart3.zip**. После получения установите инструмент **специализированного форматирования SD-карт SDCardFormatter5** и распакуйте файл образа системы TF-карты **tina_t113-100ask_uart3.zip**, чтобы получить файл **tina_t113-100ask_uart3.img** - это образ, который мы будем записывать. Также распакуйте инструмент записи системы Tina на TF-карту **PhoenixCard-V2.8**, после распаковки войдите в директорию инструмента записи и дважды щелкните по **PhoenixCard.exe**, чтобы запустить инструмент записи.

Шаг первый: Вставьте TF-карту в устройство чтения карт, а устройство чтения подключите к USB-порту компьютера. Используйте SD CatFormat для форматирования TF-карты, не забудьте сделать резервную копию данных на карте. Как показано на рисунке ниже, нажмите "Обновить", чтобы найти TF-карту, затем нажмите Format, в появившемся диалоговом окне нажмите **Да (Yes)** и дождитесь завершения форматирования.




![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/SDCardFormat_001.png)





Шаг второй: После завершения форматирования используйте инструмент **PhoenixCard.exe** для записи образа. Следуя инструкциям на рисунке ниже, найдите букву диска вашей TF-карты, нажмите `красный прямоугольник 1` - Прошивка, выберите уже распакованный образ `tina_t113-100ask_uart3.img`, затем нажмите `красный прямоугольник 2 - Загрузочная карта`, и наконец нажмите `красный прямоугольник 3 - Запись`, дождитесь завершения записи.

![image-20230216162130989](http://photos.100ask.net/allwinner-docs/t113-s3/basic/image-20230216162130989.png)

На следующем рисунке показан успешный результат записи.

![PhoenixCard_Config_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/d1s/PhoenixCard_Config_002.png)

После завершения записи можно извлечь TF-карту и вставить её в отладочную плату.



#### 2. Подключение TF-карты к отладочной плате

Как показано на рисунке ниже, извлеките TF-карту с записанной прошивкой из компьютера и вставьте её в **слот TF-карты**, обозначенный красным прямоугольником слева на рисунке, затем нажмите кнопку **аппаратного сброса системы**, обозначенную красным прямоугольником справа. Отладочная плата автоматически загрузится с TF-карты с записанным образом.

![image-20230216164700325](http://photos.100ask.net/allwinner-docs/t113-s3/basic/image-20230216164700325.png)



#### 2. Загрузка системы

Ниже приведена информация о загрузке системы с TF-карты. Вы можете открыть этот последовательный порт с помощью инструмента работы с последовательным портом, затем перезагрузить отладочную плату, чтобы просмотреть полные логи загрузки с TF-карты.

```
[30]HELLO! BOOT0 is starting!
[33]BOOT0 commit : 88480af-dirty
[36]set pll start
[42]periph0 has been enabled
[45]set pll end
[46][pmu]: bus read error
[49]board init ok
[50]ZQ value = 0x30
[52]get_pmu_exist() = -1
[55]ddr_efuse_type: 0xa
[57]trefi:7.8ms
[59][AUTO DEBUG] single rank and full DQ!
[63]ddr_efuse_type: 0xa
[66]trefi:7.8ms
[68][AUTO DEBUG] rank 0 row = 13
[71][AUTO DEBUG] rank 0 bank = 8
[74][AUTO DEBUG] rank 0 page size = 2 KB
[78]DRAM BOOT DRIVE INFO: V0.33
[81]DRAM CLK = 936 MHz
[83]DRAM Type = 3 (2:DDR2,3:DDR3)
[87]DRAMC read ODT  off.
[89]DRAM ODT value: 0x42.
[92]ddr_efuse_type: 0xa
[95]DRAM SIZE =128 M
[97]dram_tpr4:0x0
[98]PLL_DDR_CTRL_REG:0xf8004d00
[101]DRAM_CLK_REG:0xc0000000
[104][TIMING DEBUG] MR2= 0x20
[112]DRAM simple test OK.
[114]rtc standby flag is 0x0, super standby flag is 0x0
[119]dram size =128
[122]card no is 0
[123]sdcard 0 line count 4
[126][mmc]: mmc driver ver 2021-05-21 14:47
[135][mmc]: Wrong media type 0x0
[138][mmc]: ***Try SD card 0***
[157][mmc]: HSSDR52/SDR25 4 bit
[160][mmc]: 50000000 Hz
[162][mmc]: 30436 MB
[164][mmc]: ***SD/MMC 0 init OK!!!***
[239]Loading boot-pkg Succeed(index=0).
[242]Entry_name        = u-boot
[248]Entry_name        = optee
[252]Entry_name        = dtb
[255]mmc not para
[256]Jump to second Boot.
M/TC: OP-TEE version: 6aef7bb2-dirty (gcc version 5.3.1 20160412 (Linaro GCC 5.3-2016.05)) #1 Fri Jul 23 09:25:11 UTC 2021 arm


U-Boot 2018.05-g24521d6-dirty (Feb 07 2023 - 01:44:41 -0500) Allwinner Technology

[00.310]CPU:   Allwinner Family
[00.313]Model: sun8iw20
I2C:   FDT ERROR:fdt_set_all_pin:[twi0]-->FDT_ERR_BADPATH
FDT ERROR:fdt_set_all_pin:[twi1]-->FDT_ERR_BADPATH
ready
[00.334]DRAM:  128 MiB
[00.337]Relocation Offset is: 04f01000
[00.356]secure enable bit: 0
[00.359]smc_tee_inform_fdt failed with: -65526[00.364]CPU=1008 MHz,PLL6=600 Mhz,AHB=200 Mhz, APB1=100Mhz  MBus=300Mhz
[00.370]gic: sec monitor mode
[00.373]flash init start
[00.375]workmode = 0,storage type = 1
[00.378][mmc]: mmc driver ver uboot2018:2021-11-19 15:38:00
[00.384][mmc]: get sdc_type fail and use default host:tm1.
[00.390][mmc]: can't find node "mmc0",will add new node
[00.395][mmc]: fdt err returned <no error>
[00.398][mmc]: Using default timing para
[00.402][mmc]: SUNXI SDMMC Controller Version:0x50310
[00.428][mmc]: card_caps:0x3000000a
[00.431][mmc]: host_caps:0x3000003f
[00.436]sunxi flash init ok
[00.446]Loading Environment from SUNXI_FLASH... OK
[00.478]Item0 (Map) magic is bad
[00.481]the secure storage item0 copy0 magic is bad
[00.499]Item0 (Map) magic is bad
[00.502]the secure storage item0 copy1 magic is bad
[00.506]Item0 (Map) magic is bad
secure storage read widevine fail
[00.512]secure storage read widevine fail with:-1
secure storage read ec_key fail
[00.520]secure storage read ec_key fail with:-1
secure storage read ec_cert1 fail
[00.527]secure storage read ec_cert1 fail with:-1
secure storage read ec_cert2 fail
[00.534]secure storage read ec_cert2 fail with:-1
secure storage read ec_cert3 fail
[00.542]secure storage read ec_cert3 fail with:-1
secure storage read rsa_key fail
[00.549]secure storage read rsa_key fail with:-1
secure storage read rsa_cert1 fail
[00.557]secure storage read rsa_cert1 fail with:-1
secure storage read rsa_cert2 fail
[00.564]secure storage read rsa_cert2 fail with:-1
secure storage read rsa_cert3 fail
[00.572]secure storage read rsa_cert3 fail with:-1
[00.576]usb burn from boot
delay time 0
weak:otg_phy_config
[00.587]usb prepare ok
[00.754]usb sof ok
[00.756]usb probe ok
[00.757]usb setup ok
set address 0x11
set address 0x11 ok
set address 0xf
set address 0xf ok
try to update
[03.762]do_burn_from_boot usb : have no handshake
root_partition is rootfs
set root to /dev/mmcblk0p5
[03.773]update part info
[03.776]update bootcmd
[03.779]change working_fdt 0x43ec0e70 to 0x43ea0e70
disable nand error: FDT_ERR_BADPATH
[03.801]update dts
Hit any key to stop autoboot:  0
[04.972]no vendor_boot partition is found
Android's image name: t113-100ask
[04.982]Starting kernel ...

[04.985][mmc]: MMC Device 2 not found
[04.988][mmc]: mmc 2 not find, so not exit
[    0.000000] Booting Linux on physical CPU 0x0
[    0.000000] Linux version 5.4.61 (book@ubuntu1804) (arm-openwrt-linux-muslgnueabi-gcc.bin (OpenWrt/Linaro GCC 6.4-2017.11 2017-11) 6.4.1, GNU ld (GNU Binutils) 2.27) #25 SMP PREEMPT Thu Feb 16 08:03:58 UTC 2023
[    0.000000] CPU: ARMv7 Processor [410fc075] revision 5 (ARMv7), cr=10c5387d
[    0.000000] CPU: div instructions available: patching division code
[    0.000000] CPU: PIPT / VIPT nonaliasing data cache, VIPT aliasing instruction cache
[    0.000000] OF: fdt: Machine model: sun8iw20
[    0.000000] printk: bootconsole [earlycon0] enabled
[    0.000000] Memory policy: Data cache writealloc
[    0.000000] cma: Reserved 8 MiB at 0x47800000
[    0.000000] On node 0 totalpages: 32768
[    0.000000]   Normal zone: 256 pages used for memmap
[    0.000000]   Normal zone: 0 pages reserved
[    0.000000]   Normal zone: 32768 pages, LIFO batch:7
[    0.000000] psci: probing for conduit method from DT.
[    0.000000] psci: PSCIv1.0 detected in firmware.
[    0.000000] psci: Using standard PSCI v0.2 function IDs
[    0.000000] psci: MIGRATE_INFO_TYPE not supported.
[    0.000000] psci: SMC Calling Convention v1.0
[    0.000000] percpu: Embedded 15 pages/cpu s30348 r8192 d22900 u61440
[    0.000000] pcpu-alloc: s30348 r8192 d22900 u61440 alloc=15*4096
[    0.000000] pcpu-alloc: [0] 0 [0] 1
[    0.000000] Built 1 zonelists, mobility grouping on.  Total pages: 32512
[    0.000000] Kernel command line: earlyprintk=sunxi-uart,0x02500C00 clk_ignore_unused initcall_debug=0 console=ttyS3,115200 loglevel=8 root=/dev/mmcblk0p5 init=/pseudo_init partitions=boot-resource@mmcblk0p1:env@mmcblk0p2:env-redund@mmcblk0p3:boot@mmcblk0p4:rootfs@mmcblk0p5:private@mmcblk0p6:rootfs_data@mmcblk0p7:UDISK@mmcblk0p8 cma=8M snum= mac_addr= wifi_mac= bt_mac= specialstr= gpt=1 androidboot.mode=normal androidboot.hardware=sun8iw20p1 boot_type=1 androidboot.boot_type=1 gpt=1 uboot_message=2018.05-g24521d6-dirty(02/07/2023-01:44:41) androidboot.dramsize=128
[    0.000000] Dentry cache hash table entries: 16384 (order: 4, 65536 bytes, linear)
[    0.000000] Inode-cache hash table entries: 8192 (order: 3, 32768 bytes, linear)
[    0.000000] mem auto-init: stack:off, heap alloc:off, heap free:off
[    0.000000] Memory: 108612K/131072K available (6144K kernel code, 264K rwdata, 1504K rodata, 1024K init, 1164K bss, 14268K reserved, 8192K cma-reserved)
[    0.000000] SLUB: HWalign=64, Order=0-3, MinObjects=0, CPUs=2, Nodes=1
[    0.000000] rcu: Preemptible hierarchical RCU implementation.
[    0.000000]  Tasks RCU enabled.
[    0.000000] rcu: RCU calculated value of scheduler-enlistment delay is 10 jiffies.
[    0.000000] NR_IRQS: 16, nr_irqs: 16, preallocated irqs: 16
[    0.000000] random: get_random_bytes called from start_kernel+0x264/0x3e8 with crng_init=0
[    0.000000] arch_timer: cp15 timer(s) running at 24.00MHz (phys).
[    0.000000] clocksource: arch_sys_counter: mask: 0xffffffffffffff max_cycles: 0x588fe9dc0, max_idle_ns: 440795202592 ns
[    0.000006] sched_clock: 56 bits at 24MHz, resolution 41ns, wraps every 4398046511097ns
[    0.008007] Switching to timer-based delay loop, resolution 41ns
[    0.014185] clocksource: timer: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 79635851949 ns
[    0.023890] Calibrating delay loop (skipped), value calculated using timer frequency.. 48.00 BogoMIPS (lpj=240000)
[    0.034238] pid_max: default: 32768 minimum: 301
[    0.038979] Mount-cache hash table entries: 1024 (order: 0, 4096 bytes, linear)
[    0.046309] Mountpoint-cache hash table entries: 1024 (order: 0, 4096 bytes, linear)
[    0.054640] CPU: Testing write buffer coherency: ok
[    0.059838] /cpus/cpu@0 missing clock-frequency property
[    0.065162] /cpus/cpu@1 missing clock-frequency property
[    0.070501] CPU0: thread -1, cpu 0, socket 0, mpidr 80000000
[    0.076658] Setting up static identity map for 0x40100000 - 0x40100060
[    0.083320] rcu: Hierarchical SRCU implementation.
[    0.088524] smp: Bringing up secondary CPUs ...
[    0.094150] CPU1: thread -1, cpu 1, socket 0, mpidr 80000001
[    0.094268] smp: Brought up 1 node, 2 CPUs
[    0.104090] SMP: Total of 2 processors activated (96.00 BogoMIPS).
[    0.110267] CPU: All CPU(s) started in SVC mode.
[    0.115344] devtmpfs: initialized
[    0.129556] VFP support v0.3: implementor 41 architecture 2 part 30 variant 7 rev 5
[    0.137664] clocksource: jiffies: mask: 0xffffffff max_cycles: 0xffffffff, max_idle_ns: 19112604462750000 ns
[    0.147537] futex hash table entries: 512 (order: 3, 32768 bytes, linear)
[    0.154770] pinctrl core: initialized pinctrl subsystem
```



## Запись прошивки в SPI NAND

**Обратите внимание, что файловая система, записываемая этим способом, является файловой системой ubifs. Если требуется монтирование сетевой файловой системы или использование TF-карты, этот способ не рекомендуется.**

## Необходимая подготовка

1. Основная плата Dongshan Nezha STU x1
2. Скачайте инструмент прошивки Allwinner AllwinnertechPhoeniSuit: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnertechPhoeniSuit.zip
3. Кабель TypeC X2
4. Скачайте минимальный образ системы SPI NAND: https://gitlab.com/dongshanpi/tools/-/raw/main/buildroot_linux_nand_uart3.zip
5. Скачайте драйвер USB-прошивки Allwinner: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnerUSBFlashDeviceDriver.zip

## Подключение отладочной платы

* Как показано на рисунке ниже, подключите два кабеля TypeC к интерфейсу последовательного порта отладочной платы и к интерфейсу записи OTG соответственно, другой конец подключите к USB-порту компьютера. После успешного подключения можно распаковать и использовать загруженный инструмент записи и минимальный образ системы SPI NAND.

![T113-Pro_FlashSystem](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/100ask_t113_pro/T113-Pro_FlashSystem.png)



* Используя пинцет или соединительный провод, замкните контакты 5-6 флеш-памяти SPI NAND на основном модуле, то есть MOSI и SCLK. Во время замыкания можно нажать кнопку RESET на базовой плате, в этот момент отладочная плата войдет в режим записи FEL. После входа в режим записи можно продолжить установку специального драйвера для записи.

![T113-Pro_FlashSystem_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/100ask_t113_pro/T113-Pro_FlashSystem_002.png)


## Установка USB-драйвера

После подключения отладочной платы сначала нажмите и удерживайте кнопку режима записи **FEL**, затем один раз нажмите кнопку сброса системы **RESET**, чтобы автоматически войти в режим записи.

В это время в диспетчере устройств в разделе **Контроллеры универсальной последовательной шины** появится неизвестное устройство. В этот момент нам нужно изменить заранее загруженный **драйвер USB-прошивки Allwinner**, затем распаковать архив **драйвера USB-прошивки Allwinner**. После распаковки вы увидите следующие файлы.

```bash
InstallUSBDrv.exe
drvinstaller_IA64.exe
drvinstaller_X86.exe
UsbDriver/
drvinstaller_X64.exe
install.bat
```

Для пользователей Windows 7 достаточно открыть скрипт `install.bat` от имени администратора, дождаться установки и в появившемся диалоговом окне нажать "Установить".

Для пользователей Windows 10/Windows 11 необходимо установить драйвер вручную через диспетчер устройств.

Как показано на рисунке ниже, при первом подключении OTG-устройства в режиме записи в диспетчере устройств появится неизвестное устройство.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_001.png)

Затем щелкните правой кнопкой мыши на этом неизвестном устройстве и в появившемся диалоговом окне выберите "Выполнить поиск драйверов на этом компьютере".

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_002.png)

Затем в новом диалоговом окне нажмите "Обзор" и найдите ранее загруженную папку с драйвером USB-прошивки, найдите директорию `UsbDriver/` и войдите в неё, после чего нажмите ОК.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_007.png)

Обратите внимание, что нужно войти в папку `UsbDriver/`, затем нажать ОК, как показано на рисунке ниже.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_003.png)

В этот момент нажмите кнопку **Далее**, система предложит установить драйвер.
В появившемся диалоговом окне нажмите "Всё равно установить этот драйвер" и дождитесь завершения установки.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_004.png)

После завершения установки появится сообщение: "Windows успешно обновила драйверы".

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_005.png)

Наконец, можно увидеть, что неизвестное устройство в диспетчере устройств превратилось в устройство `USB Device(VID_1f3a_efe8)`, что означает успешную установку драйвера.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_006.png)


## Запуск программы записи

Распакуйте загруженный инструмент прошивки Allwinner **AllwinnertechPhoeniSuit**, а также распакуйте загруженный **минимальный образ системы SPI NAND**.

После распаковки получится образ **buildroot_linux_nand_uart3.img**, предназначенный для записи в SPI NAND, и папка **AllwinnertechPhoeniSuit**.

Сначала войдите в директорию **AllwinnertechPhoeniSuit\AllwinnertechPhoeniSuitRelease20201225**, найдите **PhoenixSuit.exe** и дважды щелкните по нему для запуска.

После открытия программы главное окно выглядит следующим образом:

![PhoenixSuit_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_001.png)


Затем нам нужно переключиться на окно **Прошивка одной кнопкой**. Как показано на рисунке ниже, нажмите красный прямоугольник под номером 1, в появившемся новом окне нажмите красный прямоугольник 2 **Обзор**, найдите только что распакованный минимальный образ системы SPI NAND **buildroot_linux_nand_uart3.img**, после выбора образа нажмите красный прямоугольник 3 **Полное стирание и обновление**, и наконец нажмите красный прямоугольник 4 **Немедленное обновление**.

После нажатия не обращайте внимания на появившееся сообщение. В этот момент возьмите уже подключенную отладочную плату, сначала нажмите и удерживайте кнопку режима записи **FEL**, затем один раз нажмите кнопку сброса системы **RESET**, чтобы автоматически войти в режим записи и начать прошивку.

![PhoenixSuit_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_002.png)


Во время записи будет отображаться индикатор прогресса записи. После завершения записи отладочная плата автоматически перезагрузится.

![PhoenixSuit_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_003.png)


## Загрузка системы

Обычно после успешной записи система автоматически перезагружается и запускается. В это время, войдя в терминал последовательного порта, можно увидеть информацию о загрузке. После завершения загрузки всей информации введите имя пользователя root для входа в записанную систему.

![spinand-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/spinand-flashsystem_001.png)

**Имя пользователя для входа в систему: root, пароль пустой**

**Имя пользователя для входа в систему: root, пароль пустой**

**Имя пользователя для входа в систему: root, пароль пустой**
