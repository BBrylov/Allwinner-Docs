# Конфигурация OpenCV и FFmpeg

## 0. Предисловие

Спасибо пользователю Yuzuki за предоставленные два пакета поддержки. Оригинальная ссылка на обсуждение: [https://bbs.aw-ol.com/topic/3427/](https://bbs.aw-ol.com/topic/3427/)

Пакет поддержки OpenCV: [opencv.tar.gz](https://forums.100ask.net/uploads/short-url/5yNatU5BBvsoRGv8EGnIuOMEeaB.gz)

Пакет поддержки FFmpeg: [ffmpeg.tar.gz](https://forums.100ask.net/uploads/short-url/xqyLFwIcZoZwjEvxpORGdL1FHss.gz)

## 1. Установка OpenCV и FFmpeg

Передайте два скачанных архива `opencv.tar.gz` и `ffmpeg.tar.gz` в Ubuntu. Их можно поместить в любую директорию. Предположим, я поместил их в директорию `/home/book/workspaces`

```
book@100ask:~/workspaces$ ls
tina-v853-open     opencv.tar.gz     ffmpeg.tar.gz
```

Распакуйте два архива, введя

```
tar -xzvf opencv.tar.gz
tar -xzvf ffmpeg.tar.gz
```

Например:

```
book@100ask:~/workspaces$ tar -xzvf opencv.tar.gz
opencv/
opencv/patches/
opencv/patches/010-uclibc-ng.patch
opencv/patches/020-l_tmpnam.patch
opencv/Makefile
opencv-sample/
opencv-sample/opencv-camera/
opencv-sample/opencv-camera/src/
opencv-sample/opencv-camera/src/main.cpp
opencv-sample/opencv-camera/src/Makefile
opencv-sample/opencv-camera/Makefile
opencv-sample/yolov5-post-opencv/
opencv-sample/yolov5-post-opencv/src/
opencv-sample/yolov5-post-opencv/src/main.cpp
opencv-sample/yolov5-post-opencv/src/Makefile
opencv-sample/yolov5-post-opencv/Makefile
book@100ask:~/workspaces$ tar -xzvf ffmpeg.tar.gz
ffmpeg/
ffmpeg/patches/
ffmpeg/patches/030-h264-mips.patch
ffmpeg/patches/050-glibc.patch
ffmpeg/patches/010-pkgconfig.patch
ffmpeg/Config.in
ffmpeg/Makefile
```

Скопируйте распакованные файлы в директорию `tina-v853-open/openwrt/package/`

```
book@100ask:~/workspaces$ cp -rfd opencv tina-v853-open/openwrt/package/
book@100ask:~/workspaces$ cp -rfd opencv-sample tina-v853-open/openwrt/package/
book@100ask:~/workspaces$ cp -rfd ffmpeg tina-v853-open/openwrt/package/
```

Проверьте содержимое этой директории. Вы должны увидеть три скопированных файла

```
book@100ask:~/workspaces$ ls tina-v853-open/openwrt/package/
allwinner  feeds  ffmpeg  opencv  opencv-sample  thirdparty
```

## 2. Компиляция OpenCV и FFmpeg

Перейдите в корневую директорию Tina и конфигурируйте окружение Tina. Выберите отладочную плату 100ASK_V853-PRO.

```
book@100ask:~/workspaces$ cd tina-v853-open/
book@100ask:~/workspaces/tina-v853-open$ source build/envsetup.sh
NOTE: The SDK(/home/book/workspaces/tina-v853-open) was successfully loaded
load openwrt... ok
Please run lunch next for openwrt.
load buildroot,bsp...ok
Please run ./build.sh config next for buildroot,bsp.
book@100ask:~/workspaces/tina-v853-open$ lunch

You're building on Linux

Lunch menu... pick a combo:
     1  v853-100ask-tina
     2  v853-vision-tina
Which would you like? [Default v853-100ask]: 1
Jump to longan autoconfig
/home/book/workspaces/tina-v853-open/build.sh autoconfig -o openwrt -i v853 -b 100ask           -n default
========ACTION List: mk_autoconfig -o openwrt -i v853 -b 100ask -n default;========
options :
INFO: Prepare toolchain ...
INFO: kernel defconfig: generate /home/book/workspaces/tina-v853-open/kernel/linux-4.9/.config by /home/book/workspaces/tina-v853-open/device/config/chips/v853/configs/100ask/linux-4.9/config-4.9
INFO: Prepare toolchain ...
make: Entering directory '/home/book/workspaces/tina-v853-open/kernel/linux-4.9'
*** Default configuration is based on '../../../../../device/config/chips/v853/configs/100ask/linux-4.9/config-4.9'
#
# configuration written to .config
#
make: Leaving directory '/home/book/workspaces/tina-v853-open/kernel/linux-4.9'
INFO: clean buildserver

Usage:
 kill [options] <pid> [...]

Options:
 <pid> [...]            send signal to every <pid> listed
 -<signal>, -s, --signal <signal>
                        specify the <signal> to be sent
 -l, --list=[<signal>]  list all signal names, or convert one to a name
 -L, --table            list all signal names in a nice table

 -h, --help     display this help and exit
 -V, --version  output version information and exit

For more details see kill(1).
INFO: prepare_buildserver
```

Перейдите в интерфейс конфигурации Tina

```
book@100ask:~/workspaces/tina-v853-open$ make menuconfig
```

Перейдите в следующую директорию и выберите `opencv-camera` и `yolov5-post-opencv`

```
 > lizard
 	> opencv-sample
 		<*> opencv-camera............ opencv camera, capture video and display to fb0
		< > yolov5-post-opencv....................... yolov5 post process with opencv
```

Здесь opencv-camera используется для захвата изображений через video с помощью OpenCV и вывода их на узел fb0. yolov5-post-opencv - программа постобработки yolov5, написанная на OpenCV.

Выберите opencv-camera и завершите конфигурацию. Сохраните и выйдите из интерфейса конфигурации Tina.

Скомпилируйте OpenCV и примеры. В корневой директории Tina введите `make`

```
book@100ask:~/workspaces/tina-v853-open$ make
...
```

Дождитесь завершения компиляции.

После завершения компиляции перепрошейте образ на отладочную плату.
