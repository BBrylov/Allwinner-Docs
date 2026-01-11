# Поддержка записи и воспроизведения аудио на отладочной плате

## 0. Предисловие

В этой главе описывается, как использовать встроенные микрофоны MIC для записи звука и динамик для воспроизведения аудио.

Руководство по разработке аудио: https://tina.100ask.net/SdkModule/Linux_AudioFrequency_DevelopmentGuide-02/#220-v853

Официальное введение в аудио от Allwinner: https://v853.docs.aw-ol.com/soft/tina_audio/#audio_1

## 1. Введение в аппаратную часть

Чип V853 предоставляет AudioCodec (встроенный аудиоинтерфейс чипа) x1, I2S/PCM (цифровой аудиоинтерфейс) x2, DMIC (интерфейс внешнего цифрового MIC) x1, которые могут удовлетворить различные аудио потребности. Отладочная плата 100ASK V853-PRO имеет два встроенных микрофона MIC и разъем для динамика. Как показано на рисунке ниже:

![image-20230505163212847](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230505163212847.png)

Если вы хотите использовать разъем динамика для воспроизведения звука, необходимо подключить внешний динамик

![image-20230506110123930](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230506110123930.png)

## 2. Использование фреймворка аудиодрайвера

В Tina Linux используется стандартный API ALSA, поэтому для использования аудио функций можно использовать стандартный `alsa-utils`. Он предоставляет такие инструменты, как `amixer`, `aplay`, `arecord`. В корневом каталоге Tina введите `make menuconfig`

```
book@100ask:~/workspaces/tina-v853-open$ make menuconfig
```

После входа в интерфейс конфигурации Tina, перейдите в следующий каталог

```
 > Sound
 	<*> alsa-utils............ ALSA (Advanced Linux Sound Architecture) utilities
```

Как показано на рисунке:

![image-20230506100011757](http://photos.100ask.net/allwinner-docs/v853/DeviceDriver/image-20230506100011757.png)

После выбора будут включены функции `amixer`, `aplay`, `arecord`. Перекомпилируйте, упакуйте и обновите систему для экспериментов.

### 2.1 Управление драйвером: amixer

amixer - это инструмент командной строки для настройки драйвера звуковой карты ALSA, используется для включения, выключения различных звуковых карт и настройки громкости различных звуковых карт. Используйте команду `amixer` для вывода списка текущих зарегистрированных аудиоустройств.

```c
amixer
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-29-52-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-29-52-image.png)

- Часто используемые опции

```
Опция             Функция
-D,--device      Указать звуковую карту, по умолчанию используется default
```

- Часто используемые команды

```
Команда          Функция
controls         Вывести список всех контроллеров указанной звуковой карты
contents         Вывести подробную информацию обо всех контроллерах указанной звуковой карты
cget             Получить информацию об указанном контроллере
cset             Установить значение указанного контроллера
```

Выбрать вход MIC1

```shell
amixer -D hw:audiocodec cset name='MIC1 Input Select' 0
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-37-11-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-37-11-image.png)

Выбрать вход MIC2

```shell
amixer -D hw:audiocodec cset name='MIC2 Input Select' 0
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-37-40-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-37-40-image.png)

Включить MIC1

```shell
amixer -D hw:audiocodec cset name='MIC1 Switch' 1
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-38-18-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-38-18-image.png)

Включить MIC2

```shell
amixer -D hw:audiocodec cset name='MIC2 Switch' 1
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-38-45-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-38-45-image.png)

Установить громкость MIC1

```shell
amixer -D hw:audiocodec cset name='MIC1 gain volume' 30
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-39-04-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-39-04-image.png)

Установить громкость MIC2

```shell
amixer -D hw:audiocodec cset name='MIC2 gain volume' 30
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-39-28-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-39-28-image.png)

Включить функцию вывода LINEOUT

```shell
amixer -D hw:audiocodec cset name='LINEOUT Output Select' 1
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-30-36-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-30-36-image.png)

Включить путь LINEOUT

```
amixer -D hw:audiocodec cset name='LINEOUT Switch' 1
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-31-00-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-31-00-image.png)

Установить громкость вывода

```
amixer -D hw:audiocodec cset name='LINEOUT volume' 25
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-31-36-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-31-36-image.png)

### 2.2 Инструмент записи: arecord

arecord - это инструмент командной строки для записи звука с драйвера звуковой карты ALSA, используется для функции записи.

```
Опция                Функция
-D,--device          Указать звуковую карту, по умолчанию используется default
-l,--list-device`    Вывести список всех текущих звуковых карт
-t,--file-type       Указать формат воспроизводимого файла, например voc, wav, raw. Если не указано, будет прочитан заголовок файла для распознавания
-c,--channels        Указать количество каналов
-f,--format          Указать формат выборки
-r,--rate            Частота дискретизации
-d,--duration        Указать время воспроизведения
--period-size        Указать размер периода
--buffer-siz`        Указать размер буфера
```

**Просмотр устройств записи**

Можно использовать команду `arecord -l` для просмотра устройств записи, предоставляемых отладочной платой.

```shell
arecord -l
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-36-45-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-11-36-45-image.png)

**Запись с микрофона**

Перед записью необходимо использовать amixer для открытия аудиопути, настроить внутренние MIC1, MIC2 для записи двухканального аудио.

```shell
amixer -D hw:audiocodec cset name='MIC1 Input Select' 0 && \
    amixer -D hw:audiocodec cset name='MIC2 Input Select' 0 && \
    amixer -D hw:audiocodec cset name='MIC1 Switch' 1 && \
    amixer -D hw:audiocodec cset name='MIC2 Switch' 1 && \
    amixer -D hw:audiocodec cset name='MIC1 gain volume' 30 && \
    amixer -D hw:audiocodec cset name='MIC2 gain volume' 30
```

Используйте команду `arecord` для записи с двух встроенных микрофонов.

```shell
arecord -D hw:audiocodec -f S16_LE -t wav -c2 -r 16000 -d 3 t.wav
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-33-24-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-33-24-image.png)

### 2.3 Инструмент воспроизведения: aplay

aplay - это инструмент командной строки для воспроизведения звука с драйвера звуковой карты ALSA, используется для функции воспроизведения.

```
Опция                Функция
-D,--device          Указать звуковую карту, по умолчанию используется default
-l,--list-devices    Вывести список всех текущих звуковых карт
-t,--file-type       Указать формат воспроизводимого файла, например voc, wav, raw. Если не указано, будет прочитан заголовок файла для распознавания
-c,--channels        Указать количество каналов
-f,--format          Указать формат выборки
-r,--rate            Частота дискретизации
-d,--duration        Указать время воспроизведения
--period-size        Указать размер периода
--buffer-size        Указать размер буфера
```

**Просмотр устройств воспроизведения**

Используйте `aplay -l` для просмотра устройств воспроизведения

```shell
aplay -l
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-33-48-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-33-48-image.png)

**Воспроизведение аудио через динамик**

Перед воспроизведением необходимо открыть аудиопуть, настроить динамик для воспроизведения аудио. Подробности смотрите в конфигурации amixer.

```shell
amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT volume' 25
```

Используйте `aplay` для воспроизведения только что записанного аудио через внешний динамик.

```shell
aplay -D hw:audiocodec t.wav
```

[![img](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-34-30-image.png)](https://v853.docs.aw-ol.com/assets/img/tina_audio/2022-07-26-13-34-30-image.png)

## 3. Тестирование функции записи

После запуска отладочной платы в терминале последовательного порта введите следующие команды:

```
amixer -D hw:audiocodec cset name='MIC1 Input Select' 0 && \
   	amixer -D hw:audiocodec cset name='MIC2 Input Select' 0 && \
    amixer -D hw:audiocodec cset name='MIC1 Switch' 1 && \
    amixer -D hw:audiocodec cset name='MIC2 Switch' 1 && \
    amixer -D hw:audiocodec cset name='MIC1 gain volume' 30 && \
    amixer -D hw:audiocodec cset name='MIC2 gain volume' 30 && \
    arecord -D hw:audiocodec -f S16_LE -t wav -c2 -r 16000 -d 3 test.wav
```

Например:

```
root@TinaLinux:/# [   67.295067] random: crng init done
[   67.298885] random: 4 urandom warning(s) missed due to ratelimiting

root@TinaLinux:/#
root@TinaLinux:/#
root@TinaLinux:/# amixer -D hw:audiocodec cset name='MIC1 Input Select' 0 && \
>    amixer -D hw:audiocodec cset name='MIC2 Input Select' 0 && \
>     amixer -D hw:audiocodec cset name='MIC1 Switch' 1 && \
>     amixer -D hw:audiocodec cset name='MIC2 Switch' 1 && \
>     amixer -D hw:audiocodec cset name='MIC1 gain volume' 30 && \
>     amixer -D hw:audiocodec cset name='MIC2 gain volume' 30 && \
>     arecord -D hw:audiocodec -f S16_LE -t wav -c2 -r 16000 -d 3 test.wav
numid=23,iface=MIXER,name='MIC1 Input Select'
  ; type=ENUMERATED,access=rw------,values=1,items=2
  ; Item #0 'differ'
  ; Item #1 'single'
  : values=0
numid=24,iface=MIXER,name='MIC2 Input Select'
  ; type=ENUMERATED,access=rw------,values=1,items=2
  ; Item #0 'differ'
  ; Item #1 'single'
  : values=0
numid=17,iface=MIXER,name='MIC1 Switch'
  ; type=BOOLEAN,access=rw------,values=1
  : values=on
numid=18,iface=MIXER,name='MIC2 Switch'
  ; type=BOOLEAN,access=rw------,values=1
  : values=on
numid=12,iface=MIXER,name='MIC1 gain volume'
  ; type=INTEGER,access=rw---R--,values=1,min=0,max=31,step=0
  : values=30
  | dBscale-min=0.00dB,step=1.00dB,mute=0
numid=13,iface=MIXER,name='MIC2 gain volume'
  ; type=INTEGER,access=rw---R--,values=1,min=0,max=31,step=0
  : values=30
  | dBscale-min=0.00dB,step=1.00dB,mute=0
Recording WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 16000 Hz, Stereo
```

Программа автоматически запишет и сохранит файл в текущий каталог. Просмотрите текущий каталог, можно увидеть сохраненный файл `test.wav`

```
root@TinaLinux:/# ls
bin       etc       lib       rdinit    run       sys       usr
data      home      mnt       rom       sbin      test.wav  var
dev       init      proc      root      squashfs  tmp       www
```

## 4. Воспроизведение аудио

В терминале последовательного порта введите следующую команду для воспроизведения только что записанного аудио

```
amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT volume' 31 && \
    aplay -D hw:audiocodec test.wav
```

Например:

```
root@TinaLinux:/# amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
>     amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
>     amixer -D hw:audiocodec cset name='LINEOUT volume' 31 && \
>     aplay -D hw:audiocodec test.wav
numid=20,iface=MIXER,name='LINEOUT Switch'
  ; type=BOOLEAN,access=rw------,values=1
  : values=on
numid=20,iface=MIXER,name='LINEOUT Switch'
  ; type=BOOLEAN,access=rw------,values=1
  : values=on
numid=16,iface=MIXER,name='LINEOUT volume'
  ; type=INTEGER,access=rw---R--,values=1,min=0,max=31,step=0
  : values=31
  | dBrange-
    rangemin=0,,rangemax=1
      | dBscale-min=0.00dB,step=0.00dB,mute=1
    rangemin=2,,rangemax=31
      | dBscale-min=-43.50dB,step=1.50dB,mute=1

Playing WAVE 'test.wav' : Signed 16 bit Little Endian, Rate 16000 Hz, Stereo
```

В это время, если мы подключили динамик, динамик будет воспроизводить только что записанное аудио.

Также можно скопировать аудиофайл на отладочную плату, используя следующую команду

```
amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT volume' 31 && \
    aplay -D hw:audiocodec test.wav
```

Где `test.wav` замените на путь к аудиофайлу, который вы хотите воспроизвести.

Предположим, что аудиофайл, который нужно воспроизвести, заранее скопирован на карту TF. После вставки карты TF смонтируйте карту TF

```
root@TinaLinux:/# mount /dev/mmcblk1p1 /mnt/extsd/
```

Просмотрите тестовый аудиофайл в папке `testSound` на карте TF

```
root@TinaLinux:/# ls /mnt/extsd/testSound/
test100.wav
```

Используйте следующую команду для воспроизведения тестового аудио

```
amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
    amixer -D hw:audiocodec cset name='LINEOUT volume' 31 && \
    aplay -D hw:audiocodec /mnt/extsd/testSound/test100.wav
```

Например:

```
root@TinaLinux:/# amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
>     amixer -D hw:audiocodec cset name='LINEOUT Switch' 1 && \
>     amixer -D hw:audiocodec cset name='LINEOUT volume' 31 && \
>     aplay -D hw:audiocodec /mnt/extsd/testSound/test100.wav
numid=20,iface=MIXER,name='LINEOUT Switch'
  ; type=BOOLEAN,access=rw------,values=1
  : values=on
numid=20,iface=MIXER,name='LINEOUT Switch'
  ; type=BOOLEAN,access=rw------,values=1
  : values=on
numid=16,iface=MIXER,name='LINEOUT volume'
  ; type=INTEGER,access=rw---R--,values=1,min=0,max=31,step=0
  : values=31
  | dBrange-
    rangemin=0,,rangemax=1
      | dBscale-min=0.00dB,step=0.00dB,mute=1
    rangemin=2,,rangemax=31
      | dBscale-min=-43.50dB,step=1.50dB,mute=1

Playing WAVE '/mnt/extsd/testSound/test100.wav' : Signed 16 bit Little Endian, Rate 22050 Hz, Stereo
```

В это время динамик будет воспроизводить тестовое аудио.

## 5. Замена музыки при загрузке

Так как отладочная плата 100ASK V853-PRO уже по умолчанию включила музыку при загрузке, скрипт автозапуска находится по адресу:

```
openwrt/target/v853/v853-vision/busybox-init-base-files/etc/init.d/S03audio
```

Мы можем найти файл `S03audio` в каталоге `/etc/init.d/` в терминале последовательного порта отладочной платы

```
root@TinaLinux:/# cd /etc/init.d/
root@TinaLinux:/etc/init.d# ls
S00mpp               S50telnet            rc.final
S01logging           S50usb               rc.modules
S03audio             S50wifidaemon        rc.preboot
S10udev              S99swupdate_autorun  rcK
S11dev               adbd                 rcS
S20urandom           cron                 sysntpd
S40network           dbus                 wpa_supplicant
S41netparam          dnsmasq
S50dbus              network
```

Можно просмотреть соответствующий исходный код скрипта.

Перейдите в каталог `/home/res/audio/`, можно увидеть два файла - музыку при загрузке `startup.wav` и музыку при выключении `shutdown.wav`

```
root@TinaLinux:/etc/init.d# cd /home/res/audio/
root@TinaLinux:/home/res/audio# ls
shutdown.wav  startup.wav
```

Мы можем заменить файл `startup.wav` для замены музыки при загрузке. Предположим, я скопирую `test100.wav` с карты TF в каталог `/home/res/audio/` и переименую его в `startup.wav`

```
root@TinaLinux:/home/res/audio# cp /mnt/extsd/testSound/test100.wav /home/res/audio/startup.wav
root@TinaLinux:/home/res/audio# sync
```

Введите `reboot`, после перезагрузки можно услышать замененную музыку при загрузке через динамик.
