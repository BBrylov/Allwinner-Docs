# Развертывание модели YOLOV3 на отладочной плате

## 0. Предисловие

Ранее мы изучили конфигурацию инструмента преобразования моделей NPU. В этом разделе показано, как добавить расширенный пакет NPU, который содержит тестовые примеры `Lenet` и `YOLOV3`, и реализуется преобразование и развертывание модели yolov3.

Ссылка для скачивания расширенного пакета NPU: [https://www.aw-ol.com/downloads?cat=18](https://www.aw-ol.com/downloads?cat=18)

Официальное введение NPU от Allwinner: [https://v853.docs.aw-ol.com/npu/dev_npu/](https://v853.docs.aw-ol.com/npu/dev_npu/)

Пакет ресурсов: (содержит файл описания структуры модели `cfg`, файл весов `weights` и тестовые изображения)

## 1. Установка расширенного пакета NPU

После перехода на [https://www.aw-ol.com/downloads?cat=18](https://www.aw-ol.com/downloads?cat=18) скачайте расширенный пакет NPU для V853

![image-20230511155647021](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511155647021.png)

Переименуйте скачанный `V853 NPU扩展软件包.gz` на `npu_package.tar.gz` и поместите этот расширенный пакет в корневую директорию Tina. Как показано ниже:

```
book@100ask:~/workspaces/tina-v853-open$ ls
brandy  build  buildroot  build.sh  device  kernel  npu_package.tar.gz  openwrt  out  platform  prebuilt  tools
```

![image-20230511160039793](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511160039793.png)

Распакуйте архив расширенного пакета NPU в терминале

```
book@100ask:~/workspaces/tina-v853-open$ tar xvf npu_package.tar.gz openwrt/package/npu/
```

![image-20230511160340555](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511160340555.png)

После распаковки расширенный пакет автоматически интегрируется в конфигурацию Tina.

## 2. Конфигурация yolov3

Повторно активируйте конфигурацию окружения Tina и выберите конфигурацию отладочной платы 100ASK_V853-PRO.

```
book@100ask:~/workspaces/tina-v853-open$ source build/envsetup.sh
...
book@100ask:~/workspaces/tina-v853-open$ lunch

You're building on Linux

Lunch menu... pick a combo:
     1  v853-100ask-tina
     2  v853-vision-tina
Which would you like? [Default v853-100ask]: 1
...
```

Перейдите в интерфейс конфигурации Tina, введя

```
make menuconfig
```

Перейдите в следующую директорию:

```
> Allwinner
	> NPU
		< > lenet......................................................... lenet demo (NEW)
		<*> viplite-driver................................... viplite driver for NPU  (NEW)
		< > vpm_run................................................ vpm model runner  (NEW)
		<*> yolov3....................................................... yolov3 demo (NEW)
		<*>   yolov3-model.............................. yolov3 test demo model (37 MB)
```

Выберите `viplite-driver` и `yolov3`, как показано ниже:

![image-20230511162515584](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511162515584.png)

После завершения выбора сохраните и выйдите из интерфейса конфигурации Tina.

Исходный код примера Demo yolov3 находится в: tina-v853-open/openwrt/package/npu/yolov3

```
book@100ask:~/workspaces/tina-v853-open/openwrt/package/npu/yolov3$ ls
Makefile  src
book@100ask:~/workspaces/tina-v853-open/openwrt/package/npu/yolov3$ tree
.
├── Makefile
└── src
    ├── bmp.h
    ├── box.c
    ├── box.h
    ├── image_utils.c
    ├── image_utils.h
    ├── main.c
    ├── Makefile
    ├── vnn_global.h
    ├── vnn_post_process.c
    ├── vnn_post_process.h
    ├── vnn_pre_process.c
    ├── vnn_pre_process.h
    ├── yolo_layer.c
    ├── yolo_layer.h
    ├── yolov3_model.nb
    └── yolo_v3_post_process.c

1 directory, 17 files
```

## 3. Тестирование Demo yolov3

Перед тестированием необходимо подготовить изображение формата `416*416`

![image-20230511165625823](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511165625823.png)

Передайте изображение на отладочную плату с помощью ADB

```
book@100ask:~/workspaces/testImg$ adb push test01.jpg /tmp/
test01.jpg: 1 file pushed. 0.5 MB/s (22616 bytes in 0.048s)
```

После входа в серийный терминал перейдите в директорию `tmp`

```
root@TinaLinux:~# cd /tmp/
root@TinaLinux:/tmp# ls
UNIX_WIFI.domain  lock              test01.jpg        wpa_ctrl_1067-2
lib               run               wpa_ctrl_1067-1
```

Используйте Demo yolov3 для тестирования изображения, введя

```
root@TinaLinux:/tmp# yolov3 /etc/models/yolov3_model.nb test01.jpg
```

После ввода команды программа тестирования будет использовать изображение test01.jpg в качестве входных данных и выведет изображение с ограничивающим прямоугольником test01.jpg. Передайте файл в Windows с помощью SD-карты или другого способа для просмотра, как показано ниже:

![image-20230511175402808](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511175402808.png)

## 4. Преобразование модели yolov3

### 4.1 Подготовка модели

Модель, используемая в этом примере, скачана с сети. Позже мы будем использовать самостоятельно обученные модели. Использованный фреймворк - darknet, модель - `YOLOv3-608`. Набор данных для обучения - `COCO trainval` данные. Модель можно скачать здесь: [https://pjreddie.com/darknet/yolo/](https://pjreddie.com/darknet/yolo/)

![image-20230511181922536](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511181922536.png)

Скачайте файл описания структуры модели `cfg` и файл весов `weights` соответственно. Если загрузка невозможна, вы можете найти соответствующие файлы в директории yolov3 в архиве ресурсов.

Передайте два скачанных файла в конфигурированную Ubuntu 20.04 с установленным инструментом преобразования моделей. Предположим, что файлы передаются в директорию `/home/ubuntu/workspaces`

```
ubuntu@ubuntu2004:~/workspaces$ ls
yolov3.cfg  yolov3.weights
```

![image-20230512112654652](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230512112654652.png)

Отредактируйте файл `yolov3.cfg`, измените `width` и `height` на `416` для повышения производительности.

```
ubuntu@ubuntu2004:~/workspaces$ vi yolov3.cfg
```

Измените исходную ширину и высоту модели 608 на 416.

![image-20230512113414290](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230512113414290.png)

Создайте папку `data` для хранения изображений, необходимых для квантизации.

```
ubuntu@ubuntu2004:~/workspaces$ mkdir data
```

Создайте файл `dataset.txt` и запишите в него пути к изображениям и их идентификаторы.

```
ubuntu@ubuntu2004:~/workspaces$ touch dataset.txt
```

Предположим, я поместил два изображения для квантизации в директорию `/home/ubuntu/workspaces/data`, как показано ниже:

![image-20230512113853903](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230512113853903.png)

Затем нужно отредактировать файл `dataset.txt` в директории `/home/ubuntu/workspaces`

```
ubuntu@ubuntu2004:~/workspaces$ vi dataset.txt
```

Измените содержимое файла на:

```
./data/test01.jpg
./data/test02.jpg
```

Ниже показана полная структура директории всех файлов. Вы можете сравнить её, чтобы убедиться, что не пропущены необходимые файлы.

```
ubuntu@ubuntu2004:~/workspaces$ tree
.
├── data
│   ├── test01.jpg
│   └── test02.jpg
├── dataset.txt
├── yolov3.cfg
└── yolov3.weights

1 directory, 5 files
```

### 4.2 Импорт модели

В терминале введите

```
buntu@ubuntu2004:~/workspaces$ pegasus import darknet --model yolov3.cfg --weights yolov3.weights --output-model yolov3.json --output-data yolov3.data
```

При импорте создаются два файла - `yolov3.data` и `yolov3.json`. Это файлы представления внутреннего формата VeriSilicon для сети YOLO V3, соответствующие исходным файлам модели `yolov3.weights` и `yolov3.cfg`

```
ubuntu@ubuntu2004:~/workspaces$ ls
data  dataset.txt  yolov3.cfg  yolov3.data  yolov3.json  yolov3.weights
```

### 4.3 Создание YML файла

YML файл описывает гиперпараметры входа и выхода сети и её конфигурацию. Эти параметры включают форму входного и выходного тензора, коэффициенты нормализации (средние значения, нулевая точка), формат изображения, формат вывода тензора, способ постобработки и т.д.

```
pegasus generate inputmeta --model yolov3.json --input-meta-output yolov3_inputmeta.yml

pegasus generate postprocess-file --model yolov3.json --postprocess-file-output yolov3_postprocessmeta.yml
```

После выполнения создаются файлы `yolov3_inputmeta.yml` и `yolov3_inputmeta.yml`. Измените параметр `scale` в файле `yolov3_inputmeta.yml` на `0.0039(1/255)`. Цель - нормализовать входной `тензор` для соответствия обучению сети.

В терминале введите

```
ubuntu@ubuntu2004:~/workspaces$ vi yolov3_inputmeta.yml
```

Измените параметр scale с исходного значения 1.0 на 0.0039, как показано ниже:

![image-20230512143218882](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230512143218882.png)

### 4.4 Квантизация

Создайте файл таблицы квантизации. Используйте асимметричную квантизацию, uint8. Измените параметр `--batch-size` на количество изображений в вашем файле `dataset.txt`.

```
pegasus quantize --model yolov3.json --model-data yolov3.data --batch-size 1 --device CPU --with-input-meta yolov3_inputmeta.yml --rebuild --model-quantize yolov3.quantize --quantizer asymmetric_affine --qtype uint8
```

### 4.5 Предварительное взаимодействие

Используя таблицу квантизации из предыдущих шагов, выполните предварительное взаимодействие для получения тензора взаимодействия. Yolov3 - это сеть с 1 входом и 3 выходами, поэтому в итоге создаётся 4 `тензора`

```
pegasus inference --model yolov3.json --model-data yolov3.data --batch-size 1 --dtype quantized --model-quantize yolov3.quantize --device CPU --with-input-meta yolov3_inputmeta.yml --postprocess-file yolov3_postprocessmeta.yml
```

### 4.6 Экспорт шаблонного кода и модели

```
pegasus export ovxlib --model yolov3.json --model-data yolov3.data --dtype quantized --model-quantize yolov3.quantize --batch-size 1 --save-fused-graph --target-ide-project 'linux64' --with-input-meta yolov3_inputmeta.yml --output-path ovxilb/yolov3/yolov3prj --pack-nbg-unify --postprocess-file yolov3_postprocessmeta.yml --optimize "VIP9000PICO_PID0XEE" --viv-sdk ${VIV_SDK}
```

На этом преобразование модели завершено. Сгенерированная модель находится в папке `ovxilb/yolov3_nbg_unify`.

```
ubuntu@ubuntu2004:~/workspaces$ ls ovxilb/yolov3_nbg_unify/
BUILD   makefile.linux  network_binary.nb  vnn_post_process.c  vnn_pre_process.c  vnn_yolov3prj.c  yolov3prj.2012.vcxproj
main.c  nbg_meta.json   vnn_global.h       vnn_post_process.h  vnn_pre_process.h  vnn_yolov3prj.h  yolov3prj.vcxproj
```

![image-20230512144213994](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230512144213994.png)

## 5. Тестирование преобразованной модели

Передайте модель на отладочную плату с помощью adb или SD-карты. Например, с помощью ADB:

```
ubuntu@ubuntu2004:~/workspaces/ovxilb/yolov3_nbg_unify$ adb push network_binary.nb /tmp/
network_binary.nb: 1 file pushed. 0.8 MB/s (39056704 bytes in 43.893s)
```

Передайте тестовое изображение на отладочную плату. Можно использовать adb или SD-карту. Например, с помощью ADB:

```
buntu@ubuntu2004:~/workspaces/data$ adb push test01.jpg /tmp/
test01.jpg: 1 file pushed. 0.6 MB/s (27095 bytes in 0.041s)
ubuntu@ubuntu2004:~/workspaces/data$ adb push test02.jpg
adb: usage: push requires an argument
ubuntu@ubuntu2004:~/workspaces/data$ adb push test02.jpg /tmp/
test02.jpg: 1 file pushed. 0.7 MB/s (30697 bytes in 0.041s)
```

После завершения передачи перейдите в серийный терминал отладочной платы и перейдите в директорию `/tmp/`. Вы можете увидеть переданные файлы

```
root@TinaLinux:~# cd /tmp/
root@TinaLinux:/tmp# ls
lock                test01.jpg          wpa_ctrl_1067-2
UNIX_WIFI.domain    network_binary.nb   test02.jpg
lib                 run                 wpa_ctrl_1067-1
```

Протестируйте `test01.jpg`, введя

```
root@TinaLinux:/tmp# yolov3 ./network_binary.nb test01.jpg
[0xb6f0c560]vip_init[104], [ 1374.785733] npu[4ca][4ca] vipcore, device init..

The version of Viplite is: 1.8[ 1374.793243] set_vip_power_clk ON
.0-0-AW-2022-04-21
[ 1374.801777] enter aw vip mem alloc size 83886080
[ 1374.811007] aw_vip_mem_alloc vir 0xe2c00000, phy 0x48800000
[ 1374.817350] npu[4ca][4ca] gckvip_drv_init  kernel logical phy address=0x48800000  virtual =0xe2c00000
Create Neural Network: 73.30ms or 73297.75us
Start run graph [1] times...
Run the 1 time: 201.00ms or 200999.30us
vip run network execution time:
Total   201.15ms or 201152.98us
Average 201.15ms or 201152.98us
data_format=2 buff_size=43095
data_format=2 buff_size=172380
data_format=2 buff_size=689520
dog  97% 168 394 27 396
cat  95% 8 209 153 408
[ 1375.455490] npu[4ca][4ca] gckvip_drv_exit, aw_vip_mem_free
[ 1375.461792] aw_vip_mem_free vir 0xe2c00000, phy 0x48800000
[ 1375.467981] aw_vip_mem_free dma_unmap_sg_atrs
[ 1375.473057] aw_vip_mem_free ion_unmap_kernel
[ 1375.479885] aw_vip_mem_free ion_free
[ 1375.484023] aw_vip_mem_free ion_client_destroy
[ 1375.494199] npu[4ca][4ca] vipcore, device un-init..
```

После тестирования передайте выведённое изображение с ограничивающим прямоугольником на SD-карту

```
root@TinaLinux:/tmp# mount /dev/mmcblk1p1 /mnt/extsd/
root@TinaLinux:/tmp# cp yolo_v3_output.bmp /mnt/extsd/yolo_v3_output-test01.bmp
```

Протестируйте `test02.jpg`, введя

```
root@TinaLinux:/tmp# yolov3 ./network_binary.nb test02.jpg
[0xb6f9d560]vip_init[104], [ 1541.123871] npu[4d3][4d3] vipcore, device init..

The version of Viplite is: 1.8[ 1541.131453] set_vip_power_clk ON
.0-0-AW-2022-04-21
[ 1541.139871] enter aw vip mem alloc size 83886080
[ 1541.148078] aw_vip_mem_alloc vir 0xe2c00000, phy 0x48800000
[ 1541.154367] npu[4d3][4d3] gckvip_drv_init  kernel logical phy address=0x48800000  virtual =0xe2c00000
Create Neural Network: 73.51ms or 73514.38us
Start run graph [1] times...
Run the 1 time: 201.01ms or 201008.95us
vip run network execution time:
Total   201.16ms or 201164.50us
Average 201.16ms or 201164.50us
data_format=2 buff_size=43095
data_format=2 buff_size=172380
data_format=2 buff_size=689520
motorbike  99% 86 313 150 405
person  100% 117 294 0 366
[ 1541.793857] npu[4d3][4d3] gckvip_drv_exit, aw_vip_mem_free
[ 1541.800091] aw_vip_mem_free vir 0xe2c00000, phy 0x48800000
[ 1541.806330] aw_vip_mem_free dma_unmap_sg_atrs
[ 1541.811397] aw_vip_mem_free ion_unmap_kernel
[ 1541.818379] aw_vip_mem_free ion_free
[ 1541.822433] aw_vip_mem_free ion_client_destroy
[ 1541.836550] npu[4d3][4d3] vipcore, device un-init..
```

После тестирования передайте выведённое изображение с ограничивающим прямоугольником на SD-карту

```
root@TinaLinux:/tmp# cp yolo_v3_output.bmp /mnt/extsd/yolo_v3_output-test02.bmp
```

Просмотрите два выведённых изображения с ограничивающим прямоугольником на SD-карте с помощью компьютера, как показано ниже:

![image-20230512151101531](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230512151101531.png)
