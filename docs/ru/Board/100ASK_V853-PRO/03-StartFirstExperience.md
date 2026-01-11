# Первый опыт загрузки отладочной платы

Во всех последующих операциях мы "общаемся" с платой через последовательный порт. Последовательный порт - это сокращение от последовательного интерфейса, это означает, что данные передаются последовательно бит за битом, его особенностью является простота линий связи.

## 1. Включение питания отладочной платы

Как показано в разделе 3.3, подключите кабель питания 12V к разъему питания, подключите кабель TypeC к разъему последовательного порта, разъем питания используется для подачи питания, кабель TypeC - это кабель последовательного порта, используемый для вывода отладочной информации. После успешного подключения необходимо перевести переключатель питания на базовой плате в направлении разъема питания, при этом красный светодиод питания на основном модуле также загорится, свечение светодиода указывает на то, что устройство может нормально работать от питания.

![image-20230627113339987](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113339987.png)

<center>Рисунок 4.2 Схема подключения</center>

## 2. Использование инструмента последовательного порта для входа в систему

После подключения кабеля type-c USB Windows автоматически установит драйвер (установка может занять некоторое время, подождите около минуты). Откройте "Диспетчер устройств" компьютера, в разделе "Порты (COM и LPT)" можно увидеть "(COM13)", как показано в разделе 3.3. Микросхема USB последовательного порта на отладочной плате может быть CP210x или CH9102, их производительность одинакова. Номер COM, отображаемый на вашем компьютере, может отличаться, запомните номер, отображаемый на вашем компьютере.

![image-20230627113415107](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113415107.png)

<center>Рисунок 4.3 Отображение последовательного порта в диспетчере устройств</center>

Если компьютер не отображает номер порта, необходимо установить драйвер вручную, скачайте Driver Genius с официального сайта ([www.drivergenius.com](http://www.drivergenius.com)), установите, запустите, выполните проверку, драйвер последовательного порта будет установлен автоматически.

Откройте MobaXterm, нажмите "Session" в левом верхнем углу, в появившемся окне выберите "Serial", как показано ниже, выберите номер порта (номер порта COM13, отображаемый ранее в диспетчере устройств), скорость передачи (Speed 115200), управление потоком (Flow Control: none), и наконец нажмите "OK". Шаги показаны на рисунке 3.4.

Примечание: Управление потоком (Flow Control) обязательно должно быть установлено в none, иначе вы не сможете вводить данные в последовательный порт в MobaXterm.

![image-20230627113535098](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113535098.png)

<center>Рисунок 4.4 Настройка последовательного порта в Mobaxterm</center>

Затем отобразится черное окно, в это время включите выключатель питания платы, вы получите данные, отправленные с последовательного порта платы, как показано на рисунке 3.5.

![image-20230627113554675](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113554675.png)

<center>Рисунок 4.5 Отображение данных последовательного порта в Mobaxterm</center>

Имя пользователя по умолчанию на отладочной плате - root, пароль не требуется.

После загрузки отладочной платы, как показано на рисунке 3.6, нажмите Enter, чтобы войти в режим командной строки.

![image-20230627113626752](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113626752.png)

<center>Рисунок 4.6 Экран входа в систему отладочной платы</center>

После входа в командную строку можно выполнять различные команды Linux, как показано на рисунке 3.7:

![image-20230627113646895](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113646895.png)

<center>Рисунок 4.7 Опыт работы с командами Linux через последовательный порт на отладочной плате</center>

## 3. Передача файлов через adb

Полное название команды adb - Android Debug Bridge, она выполняет роль моста отладки, это программа клиент-сервер. Клиент - это компьютер, используемый для операций, сервер - это устройство или отладочная плата Android. ADB также является инструментом в Android SDK, может напрямую управлять эмулятором Android или реальным устройством или отладочной платой Android. Мы можем передавать файлы с Ubuntu на отладочную плату через команду adb.

Нам нужно подключить два кабеля typeC платы одним концом к отладочной плате, другим концом к USB-порту компьютера, чтобы можно было использовать команды ADB, как показано на рисунке ниже, в основном это кабель с синим номером 17.

![image-20230627113730801](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113730801.png)

Откройте виртуальную машину Ubuntu, подключите кабель OTG, как показано на рисунке 3., виртуальная машина обнаружит новое USB-устройство Google Tina ADB, нажмите "Подключить к виртуальной машине", выберите имя виртуальной машины "100ASK_V853_ubuntu_18.04_x64", и наконец нажмите OK.

![image-20230627113739717](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113739717.png)

<center>Рисунок 4.8 Подключение к виртуальной машине через OTG</center>



Откройте терминал, введите adb devices, проверьте, успешно ли подключение, после успешного подключения можно использовать команду adb для передачи файлов на отладочную плату.

![image-20230627113807732](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113807732.png)

Рисунок 4.9 Проверка подключения OTG к виртуальной машине



Пример:

Передача файла test1.txt на отладочную плату V853.

Можно использовать

```
adb push test1.txt /root/
```

После успешной передачи можно просмотреть в ПО MobaXterm. Процесс показан на рисунке 3.9.

Терминал Ubuntu:

![image-20230627113828720](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113828720.png)

Терминал shell отладочной платы:

![image-20230627113836660](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627113836660.png)

Рисунок 3.9 Процесс передачи файла командой adb



## 4. Тестирование подключения к сети RJ45

Для тестирования проводной сетевой карты RJ45 нам нужно подготовить сетевой кабель, маршрутизатор, который может подключаться к интернету и поддерживает функцию распределения сети dhcp, сначала подключим один конец сетевого кабеля к разъему сети с номером 7, как показано на рисунке ниже, другой конец подключим к интерфейсу LAN маршрутизатора.

![image-20230627114003341](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627114003341.png)

После завершения подключения можно войти в систему отладочной платы, ввести ifconfig eth0 up для включения сетевого порта, выполнить команду udhcpc -i eth0, и IP-адрес будет получен автоматически, после получения IP-адреса можно использовать ifconfig для просмотра и попытаться пропинговать 100ask для проверки сетевой связи, используйте Ctrl+C для завершения тестирования.

Примечание: только команды после # являются командами для выполнения.

```
root@TinaLinux:/# ifconfig eth0 up
[  452.569557] libphy: gmac0: probed
[  452.619408] sunxi-gmac gmac0 eth0: eth0: Type(6) PHY ID 001cc816 at 0 IRQ poll (gmac0-0:00)
[  452.639897] IPv6: ADDRCONF(NETDEV_UP): eth0: link is not ready
root@TinaLinux:/# udhcpc -i eth0
udhcpc: started, v1.27.2
udhcpc: sending discover
udhcpc: sending select for 192.168.1.16
udhcpc: lease of 192.168.1.16 obtained, lease time 86400
udhcpc: ifconfig eth0 192.168.1.16 netmask 255.255.255.0 broadcast +
udhcpc: setting default routers: 192.168.1.1
root@TinaLinux:/# ifconfig
eth0      Link encap:Ethernet  HWaddr C6:C1:06:76:89:BE
          inet addr:192.168.1.16  Bcast:192.168.1.255  Mask:255.255.255.0
          inet6 addr: fe80::c4c1:6ff:fe76:89be/64 Scope:Link
          UP BROADCAST RUNNING MULTICAST  MTU:1500  Metric:1
          RX packets:35 errors:0 dropped:0 overruns:0 frame:0
          TX packets:13 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1000
          RX bytes:4670 (4.5 KiB)  TX bytes:2086 (2.0 KiB)
          Interrupt:58

lo        Link encap:Local Loopback
          inet addr:127.0.0.1  Mask:255.0.0.0
          inet6 addr: ::1/128 Scope:Host
          UP LOOPBACK RUNNING  MTU:65536  Metric:1
          RX packets:0 errors:0 dropped:0 overruns:0 frame:0
          TX packets:0 errors:0 dropped:0 overruns:0 carrier:0
          collisions:0 txqueuelen:1
          RX bytes:0 (0.0 B)  TX bytes:0 (0.0 B)
root@TinaLinux:/# ping www.100ask.net
PING www.100ask.net (118.25.119.100): 56 data bytes
64 bytes from 118.25.119.100: seq=0 ttl=52 time=33.588 ms
64 bytes from 118.25.119.100: seq=1 ttl=52 time=34.009 ms
64 bytes from 118.25.119.100: seq=2 ttl=52 time=43.339 ms
^C
--- www.100ask.net ping statistics ---
6 packets transmitted, 6 packets received, 0% packet loss
round-trip min/avg/max = 33.170/35.178/43.339 ms
```

## 5. Тестирование подключения к сети WiFi

Как показано на рисунке ниже, WIFI-чип - это модуль XR829, обозначенный номером 23, синий номер 24 - это разъем антенны ANT, по умолчанию он уже установлен для вас, после подтверждения подключения антенны, пожалуйста, войдите в терминал последовательного порта и выполните следующие команды для операций.

Примечание: WIFI XR829 поддерживает только маршрутизаторы с частотой 2.4Ghz, не поддерживает маршрутизаторы с частотой 5Ghz.

![image-20230627114052002](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627114052002.png)

Примечание: только команды после # являются командами для выполнения.

Первый шаг: выполните ifconfig wlan0 up, затем выполните wifi -s для сканирования WiFi, обратите внимание, что сканируемый WiFi должен быть с частотой 2.4Ghz

```
root@TinaLinux:~# ifconfig wlan0 up

root@TinaLinux:~# wifi -s
```

Второй шаг: выполните wifi -c ssid [passwd] для установления сетевого подключения, где ssid - это имя WIFI, [passwd] - это пароль WIFI.

```
root@TinaLinux:~# wifi -c Programmers 123456
```

После правильного подключения udhcpc будет выполнен автоматически для получения IP-адреса

Третий шаг: выполните iw wlan0 link для просмотра состояния подключения, как показано ниже, это означает, что вы уже подключены к маршрутизатору.

```
root@TinaLinux:~# iw wlan0 link
Connected to 94:d9:b3:b7:c9:0a (on wlan0)
        SSID: Programmers
        freq: 2442
        RX: 755675 bytes (4331 packets)
        TX: 2330 bytes (19 packets)
        signal: -25 dBm
        tx bitrate: 120.0 MBit/s MCS 5 40MHz short GI

        bss flags:      short-preamble short-slot-time
        dtim period:    1
        beacon int:				     100

```

Пятый шаг: наконец можно использовать ping -I wlan0 www.100ask.net для проверки сетевой связи.

```
root@TinaLinux:~# ping -I wlan0 www.100ask.net
PING www.100ask.net (118.25.119.100): 56 data bytes
64 bytes from 118.25.119.100: seq=0 ttl=51 time=35.777 ms
64 bytes from 118.25.119.100: seq=1 ttl=51 time=50.659 ms
64 bytes from 118.25.119.100: seq=2 ttl=51 time=44.681 ms
^C
--- www.100ask.net ping statistics ---
3 packets transmitted, 3 packets received, 0% packet loss
round-trip min/avg/max = 35.777/43.705/50.659 ms
```

## 6. Тестирование функции USB

Как показано на рисунке ниже, отладочная плата имеет 4 встроенных интерфейса TypeA USB, может подключать устройства USB 2.0, можно использовать флешку и другие устройства для подключения к отладочной плате для тестирования.

**Примечание:** Перед тестированием необходимо отключить кабель Type-C от порта OTG, чтобы предотвратить конфликт с USB-устройствами

![image-20230627114221450](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627114221450.png)

Введите cat /sys/devices/platform/soc/usbc0/usb_host для переключения системы в режим Host.

Затем вставьте флешку в USB-интерфейс с номером 5 или 6, в это время в терминале отладочной платы появится следующее сообщение, конечно, вы также можете выполнить lsusb для сравнения до и после подключения USB-устройства.

```
root@TinaLinux:/# cat /sys/devices/platform/soc/usbc0/usb_host
[   46.045421]
[   46.045421] insmod_host_driver
[   46.045421]
[   46.052167] [ehci0-controller]: sunxi_usb_enable_ehci
[   46.057937] [sunxi-ehci0]: probe, pdev->name: 4101000.ehci0-controller, sunxi_ehci: 0xc0a7d548, 0x:e0848000, irq_no:137
[   46.070612] sunxi-ehci 4101000.ehci0-controller: SW USB2.0 'Enhanced' Host Controller (EHCI) Driver
[   46.081176] sunxi-ehci 4101000.ehci0-controller: new USB bus registered, assigned bus number 1
[   46.091238] sunxi-ehci 4101000.ehci0-controller: irq 311, io mem 0xc0a00000
[   46.125502] sunxi-ehci 4101000.ehci0-controller: USB 0.0 started, EHCI 1.00
[   46.134492] hub 1-0:1.0: USB hub found
[   46.138939] hub 1-0:1.0: 1 port detected
[   46.143975] [ohci0-controller]: sunxi_usb_enable_ohci
[   46.149713] [sunxi-ohci0]: probe, pdev->name: 4101000.ohci0-controller, sunxi_ohci: 0xc0a7d76c
[   46.159716] sunxi-ehci 4101000.ehci0-controller: ehci_irq: highspeed device connect
[   46.168748] sunxi-ohci 4101000.ohci0-controller: SW USB2.0 'Open' Host Controller (OHCI) Driver
[   46.178753] sunxi-ohci 4101000.ohci0-controller: new USB bus registered, assigned bus number 2
[   46.188518] sunxi-ohci 4101000.ohci0-controller: irq 312, io mem 0x00000000
[   46.270548] hub 2-0:1.0: USB hub found
[   46.274964] hub 2-0:1.0: 1 port detected
host_chose finished!
[   49.945431] usb 2-1: new full-speed USB device number 2 using sunxi-ohci
[   50.168452] usb 2-1: not running at top speed; connect to a high speed hub
[   50.185855] hub 2-1:1.0: USB hub found
[   50.191467] hub 2-1:1.0: 4 ports detected
root@TinaLinux:/# lsusb
Bus 002 Device 002: ID 05e3:0608
Bus 001 Device 001: ID 1d6b:0002
Bus 002 Device 001: ID 1d6b:0001
[  147.985422] usb 2-1.2: new full-speed USB device number 3 using sunxi-ohci
[  148.152449] usb 2-1.2: not running at top speed; connect to a high speed hub
[  148.173819] usb-storage 2-1.2:1.0: USB Mass Storage device detected
[  148.181455] scsi host0: usb-storage 2-1.2:1.0
[  150.225528] scsi 0:0:0:0: Direct-Access              SD Card Reader   1.00 PQ: 0 ANSI: 6
[  150.244497] sd 0:0:0:0: [sda] 62333952 512-byte logical blocks: (31.9 GB/29.7 GiB)
[  150.257497] sd 0:0:0:0: [sda] Write Protect is off
[  150.262885] sd 0:0:0:0: [sda] Mode Sense: 03 00 00 00
[  150.273483] sd 0:0:0:0: [sda] No Caching mode page found
[  150.279765] sd 0:0:0:0: [sda] Assuming drive cache: write through
[  150.382513]  sda: sda1
[  150.410487] sd 0:0:0:0: [sda] Attached SCSI removable disk

root@TinaLinux:/# lsusb
Bus 002 Device 003: ID 067b:2731
Bus 002 Device 002: ID 05e3:0608
Bus 001 Device 001: ID 1d6b:0002
Bus 002 Device 001: ID 1d6b:0001
```

## 7. Тестирование функции отображения LCD

Для тестирования функции отображения LCD необходимо подключить модуль экрана, в настоящее время мы поддерживаем только 7-дюймовый RGB-экран и 4-дюймовый MIPI-экран, для этого теста используется только 7-дюймовый RGB-экран, это тот же экран, что и наш NXP 6ull ST157, если не подготовлен, тестирование невозможно.

Перед подключением необходимо убедиться, что отладочная плата находится в **выключенном состоянии**, подключите один конец шлейфа экрана к экрану, другой конец шлейфа подключите к отладочной плате, обратите внимание, что наш шлейф подключается с нажатием вниз, то есть сторона шлейфа с контактами обращена вниз.

![image-20230627114342987](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627114342987.png)

После успешного подключения можно загрузить отладочную плату, ввести lv_examples 1, также можно тестировать касанием экрана.

```
root@TinaLinux:/# lv_examples 1
wh=1024x600, vwh=1024x1200, bpp=32, rotated=0
Turn on double buffering.
Turn on 2d hardware acceleration.
Turn on 2d hardware acceleration rotate.
```

## 8. Тестирование функции камеры

Примечание, приведенный ниже метод предназначен для старой версии тестирования, для новой версии посетите: https://forums.100ask.net/t/topic/3560

Для тестирования функции камеры необходимо подключить модуль MIPI-камеры, в настоящее время мы поддерживаем только модуль камеры GC2053, эту камеру можно приобрести в официальном магазине 100ask, если нет такого типа модуля камеры, тестирование невозможно.

Перед подключением необходимо убедиться, что отладочная плата находится в **выключенном состоянии**, подключите один конец шлейфа экрана к модулю камеры, другой конец шлейфа подключите к отладочной плате, обратите внимание, что наш шлейф подключается с нажатием вниз, то есть сторона шлейфа с контактами обращена вниз. Обратите внимание на правильность последовательности проводов шлейфа при подключении.

![image-20230627114422169](http://photos.100ask.net/allwinner-docs/v853/Basic/image-20230627114422169.png)

После успешного подключения можно загрузить отладочную плату, после завершения загрузки введите camerademo NV21 1920 1088 30 bmp /tmp 5 для съемки пяти фотографий, фотографии сохраняются в директории /tmp, можно передать на компьютер для просмотра через флешку или TF-карту.

```
root@TinaLinux:/# camerademo NV21 1920 1088 30 bmp /tmp
[CAMERA]**********************************************************
[CAMERA]*                                                        *
[CAMERA]*              this is camera test.                      *
[CAMERA]*                                                        *
[CAMERA]**********************************************************
[CAMERA]**********************************************************
[CAMERA] open /dev/video0!
[CAMERA]**********************************************************
[CAMERA]**********************************************************
[CAMERA] The path to data saving is /tmp.
[CAMERA] The number of captured photos is 5.
[CAMERA] save bmp format
[CAMERA]**********************************************************
[CAMERA] Using format parameters NV21.
[CAMERA] camera pixelformat: NV21
[CAMERA] Resolution size : 1920 * 1088
[CAMERA] The photo save path is /tmp.
[CAMERA] The number of photos taken is 5.
begin ion_alloc_open
pid: 1143, g_alloc_context = 0x2ecd0
[CAMERA] Camera capture framerate is 20/1
[CAMERA] VIDIOC_S_FMT succeed
[CAMERA] fmt.type = 9
[CAMERA] fmt.fmt.pix_mp.width = 1920
[CAMERA] fmt.fmt.pix_mp.height = 1088
[CAMERA] fmt.fmt.pix_mp.pixelformat = NV21
[CAMERA] fmt.fmt.pix_mp.field = 1
[CAMERA] stream on succeed
[CAMERA] camera0 capture num is [0]
[CAMERA_PROMPT] the time interval from the start to the first frame is 179 ms
[CAMERA] camera0 capture num is [1]
[CAMERA] camera0 capture num is [2]
[CAMERA] camera0 capture num is [3]
[CAMERA] camera0 capture num is [4]
[CAMERA] Capture thread finish
[CAMERA] close /dev/video0
ion_alloc_close
pid: 1143, release g_alloc_context = 0x2ecd0
root@TinaLinux:/# ls /tmp/
UNIX_WIFI.domain  bmp_NV21_3.bmp    lib               wpa_ctrl_1055-1
bmp_NV21_1.bmp    bmp_NV21_4.bmp    lock              wpa_ctrl_1055-2
bmp_NV21_2.bmp    bmp_NV21_5.bmp    run
```

Вышеуказанные bmp_NV21_1.bmp, bmp_NV21_2.bmp, bmp_NV21_3.bmp, bmp_NV21_4.bmp, bmp_NV21_5.bmp - это пять фотографий, которые были только что сделаны.
