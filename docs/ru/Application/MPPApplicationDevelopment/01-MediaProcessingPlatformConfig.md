# Конфигурация платформы обработки медиа MPP

## 0. Предисловие

Модуль управления системой MPP, в соответствии с характеристиками чипа, выполняет сброс различных аппаратных компонентов, базовую инициализацию, а также отвечает за инициализацию, деинициализацию бизнес-модулей системы MPP (Media Process Platform - платформа обработки медиа), управление рабочим состоянием бизнес-модулей системы MPP и предоставление информации о текущей версии системы MPP. Перед запуском бизнес-приложений MPP необходимо выполнить инициализацию системы MPP. Аналогично, после завершения работы бизнес-приложений MPP также необходимо выполнить деинициализацию системы MPP и освободить ресурсы.

В этой главе описывается, как добавить патч MPP в Tina SDK и как скомпилировать и использовать его. Этот патч содержит исходный код части MPP. Подробная информация о разработке MPP находится в руководстве по разработке системы «100ASK-V853_Pro» в разделе 01_学习手册 на диске с материалами для отладочной платы 100ASK V853-PRO на Baidu Netdisk. Седьмая глава **Руководство по разработке мультимедиа MPP в Tina Linux** четвертой части **Разработка базовых компонентов** этого руководства подробно описывает разработку модуля управления системой MPP для отладочной платы 100ASK V853-PRO.

Диск с материалами для отладочной платы 100ASK V853-PRO:

Ссылка: https://pan.baidu.com/s/1TX742vfEde9bMLd9IrwwqA?pwd=sp6a
Код доступа: sp6a

Инструкции по использованию MPP_sample от Allwinner: https://tina.100ask.net/SdkModule/Linux_MPP_Sample_Instructions-01/

## 1. Добавление пакета расширения MPP

Пакет расширения MPP:

Ссылка: [https://pan.baidu.com/s/1TX742vfEde9bMLd9IrwwqA?pwd=sp6a 8](https://pan.baidu.com/s/1TX742vfEde9bMLd9IrwwqA?pwd=sp6a)
Код доступа: sp6a

Находится в каталоге 08_MPP扩展包.

После завершения загрузки поместите архив `sunxi-mpp.tar.gz` в любой каталог виртуальной машины. Предположим, что он помещен в каталог `/home/book/workspaces`.

Например:

```
book@100ask:~/workspaces$ ls
100ASK_V853-PRO_TinaSDK  sunxi-mpp.tar.gz  tina-v853-open
```

Распакуйте архив `sunxi-mpp.tar.gz`, введите

```
tar -xzvf sunxi-mpp.tar.gz
```

Например:

```
book@100ask:~/workspaces$ tar -xzvf sunxi-mpp.tar.gz
sunxi-mpp/
sunxi-mpp/CMake/
sunxi-mpp/CMake/sunxi_mpp_lib.cmake
sunxi-mpp/CMake/sunxi_mpp_include.cmake
...
```

После завершения распаковки перейдите в каталог `sunxi-mpp` и просмотрите файлы в текущем каталоге

```
book@100ask:~/workspaces$ cd sunxi-mpp/
book@100ask:~/workspaces/sunxi-mpp$ ls
CMake  CMakeLists.txt  include  lib  README.md  sample  STAGING_DIR.sh  toolchain
```

Описание каждой папки:

```
CMake: Настройка заголовочных файлов и каталогов зависимостей для различных файлов MPP
CMakeLists.txt: Настройка файлов компиляции, расположения цепочки инструментов кросс-компиляции, информации о местоположении и правилах зависимостей
include: Содержит заголовочные файлы, необходимые для пакета расширения MPP
lib: Содержит файлы зависимостей, необходимые для пакета расширения MPP
sample: Содержит исходный код примеров приложений MPP
STAGING_DIR.sh: Настройка переменных окружения
toolchain: Содержит цепочку инструментов кросс-компиляции V853
```

## 2. Компиляция пакета расширения MPP

Добавьте переменную окружения кросс-компиляции. Здесь нужно только добавить переменную окружения с расположением `sunxi-mpp`, введите

```
book@100ask:~/workspaces/sunxi-mpp$ export CMAKE_CURRENT_SOURCE_DIR=~/workspaces/sunxi-mpp
```

Активируйте переменные окружения, введите

```
book@100ask:~/workspaces/sunxi-mpp$ source STAGING_DIR.sh
```

Создайте каталог build для компиляции и хранения скомпилированных приложений

```
book@100ask:~/workspaces/sunxi-mpp$ mkdir build
```

Перейдите в каталог `build` и выполните `cmake ..`, чтобы настроить цепочку инструментов, промежуточный каталог и правила компиляции

```
book@100ask:~/workspaces/sunxi-mpp$ cd build/
book@100ask:~/workspaces/sunxi-mpp/build$ cmake ..
-- The C compiler identification is GNU 7.5.0
-- The CXX compiler identification is GNU 7.5.0
-- Check for working C compiler: /usr/bin/cc
-- Check for working C compiler: /usr/bin/cc -- works
-- Detecting C compiler ABI info
-- Detecting C compiler ABI info - done
-- Detecting C compile features
-- Detecting C compile features - done
-- Check for working CXX compiler: /usr/bin/c++
-- Check for working CXX compiler: /usr/bin/c++ -- works
-- Detecting CXX compiler ABI info
-- Detecting CXX compiler ABI info - done
-- Detecting CXX compile features
-- Detecting CXX compile features - done
-- STAGING_DIR: build
-- Configuring done
-- Generating done
-- Build files have been written to: /home/book/workspaces/sunxi-mpp/build
```

После выполнения в каталоге `build` будут созданы следующие файлы, среди которых каталог `bin` используется для хранения созданных бинарных приложений.

```
book@100ask:~/workspaces/sunxi-mpp/build$ ls
bin  CMakeCache.txt  CMakeFiles  cmake_install.cmake  Makefile  sample  STAGING_DIR.sh
```

Скомпилируйте приложения MPP, введите

```
book@100ask:~/workspaces/sunxi-mpp/build$ make
Scanning dependencies of target sample_virvi2vo
[  1%] Building C object sample/sample_virvi2vo/CMakeFiles/sample_virvi2vo.dir/sample_virvi2vo.c.o
[  2%] Linking C executable ../../bin/sample_virvi2vo
[  2%] Built target sample_virvi2vo
...
Scanning dependencies of target sample_demux2adec2ao
[ 99%] Building C object sample/sample_demux2adec2ao/CMakeFiles/sample_demux2adec2ao.dir/sample_demux2adec2ao.c.o
[100%] Linking C executable ../../bin/sample_demux2adec2ao
[100%] Built target sample_demux2adec2ao
```

После завершения компиляции можно перейти в каталог `bin` для просмотра созданных бинарных файлов.

```
book@100ask:~/workspaces/sunxi-mpp/build$ cd bin/
book@100ask:~/workspaces/sunxi-mpp/build/bin$ ls
sample_adec               sample_CodecParallel         sample_MotionDetect         sample_uvc2vo        sample_virvi2venc
sample_aec                sample_demux2adec            sample_multi_vi2venc2muxer  sample_uvcout        sample_virvi2venc2muxer
sample_aenc               sample_demux2adec2ao         sample_rtsp                 sample_uvc_vo        sample_virvi2vo
sample_ai                 sample_demux2vdec            sample_smartIPC_demo        sample_venc          sample_virvi2vo_zoom
sample_ai2aenc            sample_demux2vdec2vo         sample_smartPreview_demo    sample_venc2muxer    sample_vo
sample_ai2aenc2muxer      sample_demux2vdec_saveFrame  sample_timelapse            sample_vi_g2d        yuv420pTobmp
sample_ao                 sample_driverVipp            sample_UILayer              sample_vin_isp_test
sample_ao_resample_mixer  sample_g2d                   sample_uvc2vdec_vo          sample_vi_reset
sample_aoSync             sample_glog                  sample_uvc2vdenc2vo         sample_virvi
```

Информацию о том, как тестировать и использовать приложения MPP, обязательно смотрите в:

Инструкции по использованию MPP_sample от Allwinner: https://tina.100ask.net/SdkModule/Linux_MPP_Sample_Instructions-01/

Если в «Инструкциях по использованию MPP_sample от Allwinner» нет описания тестирования, можно посмотреть файл `Readme.txt` в каждом примере программы. Например, предположим, что мне нужна программа `sample_driverVipp`, нужно перейти в каталог с исходным кодом, введите

```
book@100ask:~/workspaces/sunxi-mpp$ cd sample/sample_driverVipp/
book@100ask:~/workspaces/sunxi-mpp/sample/sample_driverVipp$ ls
CMakeLists.txt  Readme.txt  sample_driverVipp.c  sample_driverVipp.h
```

Можно увидеть, что в каталоге с исходным кодом есть файл Readme.txt, в котором подробно описано, как проводить тестирование.

```
book@100ask:~/workspaces/sunxi-mpp/sample/sample_driverVipp$ cat Readme.txt
sample_driverVipp：
    该sample演示直接调用linux内核驱动获取frame。按下ctrl+c，终止测试。
    每隔若干帧保存一帧到指定的目录。

读取测试参数的流程：
    sample只支持命令行模式输入参数。如果不输入参数,会提示输入。
    从命令行启动sample_driverVipp的指令：
    ./sample_driverVipp
    或
    ./sample_driverVipp 0 1920 1080 8 60 0 10 60 /mnt/extsd

测试参数的说明：
(1)video device: 0~3 (vipp0~vipp3)
(2)capture_width：指定camera采集的图像宽度
(3)capture_height：指定camera采集的图像高度
(4)pixel_format：指定camera采集的图像格式
(5)fps：指定camera采集的帧率
(6)test frame count：指定测试采集的frame总数，0表示无限。
(7)store count: 指定保存的图像数量。
(8)store interval: 指定保存图像的周期，即每n帧图像保存1帧。
(9)frame saving path: 指定保存图像的目录，该目录要确保存在。
```

Если вы хотите использовать MPP для разработки и написания собственных приложений, пожалуйста, прочитайте руководство по разработке системы «100ASK-V853_Pro» в разделе 01_学习手册 на диске с материалами для отладочной платы 100ASK V853-PRO на Baidu Netdisk. Седьмая глава **Руководство по разработке мультимедиа MPP в Tina Linux** четвертой части **Разработка базовых компонентов** этого руководства подробно описывает разработку модуля управления системой MPP для отладочной платы 100ASK V853-PRO.

## 3. Тестирование приложений MPP

Для тестирования приложений MPP необходимо добавить файлы зависимостей отладочной платы. Эти файлы зависимостей находятся в каталоге `sunxi-mpp/lib`, как показано на рисунке ниже

![image-20230427155025142](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230427155025142.png)

Скопируйте все файлы из этого каталога в каталог `lib` отладочной платы. Предположим, я использую карту TF для копирования их на отладочную плату. Скопируйте папку lib на карту TF, затем вставьте TF в отладочную плату 100ASK V853-PRO и смонтируйте карту TF, введите

```
root@TinaLinux:/# mount /dev/mmcblk1p1 /mnt/extsd/
```

После монтирования перейдите в каталог TF

```
root@TinaLinux:/# cd /mnt/extsd/
root@TinaLinux:/mnt/extsd# ls
System Volume Information        lib
```

Можно увидеть папку `lib`. Скопируйте все файлы из каталога `lib` в каталог `lib` отладочной платы, введите

```
root@TinaLinux:/mnt/extsd# cp lib/* /lib/
```

Дождитесь завершения копирования.

### 3.1 Тестирование приложения для предпросмотра данных с камеры в реальном времени на LCD

Аппаратные требования: отладочная плата 100ASK V853-PRO, 4-дюймовый MIPI дисплей, MIPI камера.

Название примера: sample_virvi2vo

Путь к исходному коду: sunxi-mpp/sample/sample_virvi2vo/

Этот пример демонстрирует получение данных с камеры и отображение их в реальном времени на LCD экране. Ниже показано, как запустить скомпилированное приложение на отладочной плате 100ASK V853-PRO.

После компиляции пакета расширения mpp в каталоге `sunxi-mpp/build/bin` будет создан файл `sample_virvi2vo`. Скопируйте созданный файл на карту TF для резервного копирования.

Скопируйте файл `sample_virvi2vo.conf` из каталога `sunxi-mpp/sample/sample_virvi2vo` на карту TF для резервного копирования.

Скопируйте весь каталог `sunxi-mpp/lib` на карту TF для резервного копирования.

После завершения копирования вставьте карту TF в отладочную плату 100ASK V853-PRO и смонтируйте карту TF на отладочной плате, введите `mount /dev/mmcblk1p1 /mnt/extsd/`

```
root@TinaLinux:/# mount /dev/mmcblk1p1 /mnt/extsd/
[  168.601231] FAT-fs (mmcblk1p1): Volume was not properly unmounted. Some data may be corrupt. Please run fsck.
```

Перейдите в каталог монтирования `/mnt/extsd/`

```
root@TinaLinux:/# cd /mnt/extsd/
```

Проверьте наличие соответствующих файлов

```
root@TinaLinux:/mnt/extsd# ls
System Volume Information  sample_virvi2vo
sample_virvi2vo.conf
```

Запустите тестовую программу, введите `./sample_virvi2vo -path ./sample_virvi2vo.conf`

```
 root@TinaLinux:/mnt/extsd# ./sample_virvi2vo -path ./sample_virvi2vo.conf
```

После выполнения на MIPI экране будут отображаться данные изображения, получаемые с камеры в реальном времени.

Приложение автоматически завершится через установленное время, или можно досрочно завершить тестирование, нажав Ctrl+C.

### 3.2 Тестирование приложения для распознавания лиц и фигур в реальном времени

Аппаратные требования: отладочная плата 100ASK V853-PRO, 4-дюймовый MIPI дисплей, MIPI камера.

Название примера: sample_smartPreview_demo

Путь к исходному коду: sunxi-mpp/sample/sample_smartPreview_demo

Этот пример демонстрирует получение данных изображения с камеры, их обработку с использованием модели распознавания лиц или фигур, и отображение результатов с рамками в реальном времени на LCD экране. Ниже показано, как запустить скомпилированное приложение на отладочной плате 100ASK V853-PRO.

После компиляции пакета расширения mpp в каталоге `sunxi-mpp/build/bin` будет создан файл `sample_smartPreview_demo`. Скопируйте созданный файл на карту TF для резервного копирования.

Скопируйте модель распознавания лиц `face.nb` из каталога `sunxi-mpp/sample/sample_smartPreview_demo/models/fdet` на карту TF для резервного копирования.

Скопируйте файл модели распознавания фигур `2.0.0_Gamma.nb` из каталога `sunxi-mpp/sample/sample_smartPreview_demo/models/pdet` на карту TF для резервного копирования.

Скопируйте файл параметров `sample_smartPreview_demo.conf` из каталога `sunxi-mpp/sample/sample_smartPreview_demo` на карту TF для резервного копирования.

После завершения копирования вставьте карту TF в отладочную плату 100ASK V853-PRO и смонтируйте карту TF на отладочной плате, введите `mount /dev/mmcblk1p1 /mnt/extsd/`

```
root@TinaLinux:/# mount /dev/mmcblk1p1 /mnt/extsd/
[  168.601231] FAT-fs (mmcblk1p1): Volume was not properly unmounted. Some data may be corrupt. Please run fsck.
```

Перейдите в каталог монтирования `/mnt/extsd/`

```
root@TinaLinux:/# cd /mnt/extsd/
```

Проверьте наличие соответствующих файлов

```
root@TinaLinux:/mnt/extsd# ls
2.0.0_Gamma.nb                   sample_smartPreview_demo
System Volume Information        sample_smartPreview_demo.conf
face.nb
```

Измените файл `sample_smartPreview_demo.conf`. Предположим, что здесь я использую 4-дюймовый MIPI экран 100ask и 2-линейную MIPI камеру. Для тестирования модели распознавания лиц необходимо изменить этот файл следующим образом:

```
########### paramter (ref to tulip_cedarx.conf)############
[parameter]
main_isp_dev = 0
main_vipp_dev = 0
main_capture_width = 360
main_capture_height = 640
main_layer_num = 0
main_display_x = 0
main_display_y = 0
main_display_width = 480
main_display_height = 800
main_nn_nbg_type = 1                    #-1:disable, 0:human, 1:face
main_nn_isp = 0
main_nn_vipp = 8
main_nn_vi_buf_num = 3
main_nn_src_frame_rate = 20             #fps
main_nn_nbg_file_path = "face.nb"
main_nn_draw_orl_enable = 1

sub_isp_dev = 1
sub_vipp_dev = 1
sub_capture_width = 1920
sub_capture_height = 1080
sub_layer_num = 1
sub_display_x = 0
sub_display_y = 00
sub_display_width = 480
sub_display_height = 800
sub_nn_nbg_type = 1                    #-1:disable, 0:human, 1:face
sub_nn_isp = 1
sub_nn_vipp = 9
sub_nn_vi_buf_num = 3
sub_nn_src_frame_rate = 20             #fps
sub_nn_nbg_file_path = "face.nb"
sub_nn_draw_orl_enable = 1

disp_type = "lcd"                      #disp_type is lcd, hdmi, cvbs
pic_format = "nv21"                    #pic_format is yu12, yv12, nv21, nv12
frame_rate = 20                        #fps

orl_thick=200
test_duration = 0                      #unit:s, 0:Infinite duration.
```

Если нужно протестировать обнаружение фигур, также необходимо изменить файл `sample_smartPreview_demo.conf`, установив `main_nn_nbg_type` в 0 и `main_nn_nbg_file_path` в путь к модели распознавания фигур, например:

```
main_nn_nbg_type = 0
main_nn_nbg_file_path = "2.0.0_Gamma.nb"
```

Запустите тестовую программу:

```
root@TinaLinux:/mnt/extsd# ./sample_smartPreview_demo -path sample_smartPreview_demo.conf
```

После выполнения дисплей будет принимать данные с камеры, но вначале будут отброшены некоторые данные изображения, что может привести к зависанию изображения вначале. После успешного тестирования на дисплее будут отображаться данные с камеры в реальном времени, и можно будет обводить лица на изображении с камеры рамками.

## 4. Заключение

Для других приложений здесь не будет демонстрации каждого по отдельности. Вы можете ознакомиться с файлом Readme.txt каждой программы примера или «Инструкциями по использованию MPP_sample от Allwinner» для тестирования и экспериментов, а также с «Руководством по разработке мультимедиа MPP в Tina Linux» для разработки. Платформа обработки медиа MPP обладает хорошей играбельностью и открытостью, что подходит для разработки собственных приложений. Надеюсь, что эта глава поможет вам понять использование MPP.
