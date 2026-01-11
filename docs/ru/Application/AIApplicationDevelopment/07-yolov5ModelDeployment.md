# Развертывание модели YOLOV5 на отладочной плате

## 0. Предисловие

В этом разделе в основном описывается, как получить алгоритм обнаружения объектов одноэтапной целевой фокусировки yolov5 и преобразовать исходную модель yolov5 в формат ONNX. Используя инструмент преобразования моделей для преобразования модели и развертывания преобразованной модели на отладочной плате.

Список используемого программного обеспечения в этом разделе:

1. Anaconda (Windows)
2. Git (Windows)
3. Tina SDK (Linux)
4. Расширенный пакет NPU от Allwinner (Linux)
5. Библиотека OpenCV (Linux)

Список оборудования:
Отладочная плата 100ASK_V853-PRO от 100ask: [https://item.taobao.com/item.htm?&id=706864521673](https://item.taobao.com/item.htm?&id=706864521673)

Здесь предоставляется пакет ресурсов Source: [source](https://forums.100ask.net/uploads/short-url/3EJbv6OUENwcKfBR5veOKWVMsey.zip) (содержит файл зависимостей конфигурации среды conda yolov5, код развертывания на устройстве)

Образ опыта yolov5: [v853_linux_100ask_uart0.img](https://bbs.aw-ol.com/assets/uploads/files/1687760754902-v853_linux_100ask_uart0.img) (метод тестирования: yolov5 /etc/models/yolov5_model.nb <тестовое изображение>)

Ресурсы версии V6.0, предоставленные официально YOLOV5:

Файл модели YOLOV5s ONNX: [https://github.com/ultralytics/yolov5/releases/download/v6.0/yolov5s.onnx](https://github.com/ultralytics/yolov5/releases/download/v6.0/yolov5s.onnx)

Файл модели YOLOV5s PT: [https://github.com/ultralytics/yolov5/releases/download/v6.0/yolov5s.pt](https://github.com/ultralytics/yolov5/releases/download/v6.0/yolov5s.pt)

Код yolov5-v6.0: [https://github.com/ultralytics/yolov5/archive/refs/tags/v6.0.zip](https://github.com/ultralytics/yolov5/archive/refs/tags/v6.0.zip)

## 1. Конфигурация окружения yolov5

Официальный веб-сайт yolov5: [https://github.com/ultralytics/yolov5](https://github.com/ultralytics/yolov5)

Используя инструмент Git, получите исходный код версии V6.0 в любой директории, введя

```
git clone -b v6.0 https://github.com/ultralytics/yolov5
```

![image-20230613182944474](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230613182944474.png)

Если у вас возникли проблемы со скачиванием через Git, вы также можете напрямую перейти по следующему адресу для скачивания архива исходного кода. После скачивания распакуйте его и он готов к использованию.

[https://github.com/ultralytics/yolov5/archive/refs/tags/v6.0.zip](https://github.com/ultralytics/yolov5/archive/refs/tags/v6.0.zip)

Дождитесь завершения скачивания. После скачивания в текущей директории появится папка проекта yolov5

```
100askTeam@DESKTOP-F46NFJT MINGW64 /d/Programmers/ModelDeployment/2.yolov5
$ ls
yolov5/

100askTeam@DESKTOP-F46NFJT MINGW64 /d/Programmers/ModelDeployment/2.yolov5
$ cd yolov5/

100askTeam@DESKTOP-F46NFJT MINGW64 /d/Programmers/ModelDeployment/2.yolov5/yolov5 (master)
$ ls
CITATION.cff     README.zh-CN.md  detect.py   requirements.txt  tutorial.ipynb
CONTRIBUTING.md  benchmarks.py    export.py   segment/          utils/
LICENSE          classify/        hubconf.py  setup.cfg         val.py
README.md        data/            models/     train.py
```

Откройте программу Anaconda Prompt (Anaconda3) и перейдите в директорию проекта yolov5, введя следующие команды

```
(base) C:\Users\100askTeam>D:

(base) D:\>cd D:\Programmers\ModelDeployment\2.yolov5\yolov5

(base) D:\Programmers\ModelDeployment\2.yolov5\yolov5>
```

Используйте conda для создания окружения проекта yolov, введя

```
conda create -n my-yolov5-env python=3.7
```

Активируйте окружение yolov5

```
conda activate my-yolov5-env
```

Установите зависимости

```
pip install -U -r requirements.txt -i https://pypi.doubanio.com/simple/
```

![image-20230614111413244](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230614111413244.png)

**Часто задаваемые вопросы:**

Во время конфигурации окружения из-за различий в версиях могут возникнуть различные проблемы. Ниже я предоставлю версии пакетов окружения, которое я установил. Файл находится в архиве в папке requirements файла conda-yolov5_6-env.yaml. В терминале Conda создайте новое окружение, выполнив

```
conda env create -f conda-yolov5_6-env.yaml
```

Выполните `python detect.py`, чтобы протестировать, успешно ли конфигурировано окружение. После выполнения будут автоматически скачаны файлы весов модели

![image-20230614115122455](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230614115122455.png)

Скорость скачивания здесь может быть очень медленной. Рекомендуется напрямую посетить официальный веб-сайт для скачивания [https://github.com/ultralytics/yolov5/tree/v6.0](https://github.com/ultralytics/yolov5/tree/v6.0), нажав на красный прямоугольник на рисунке ниже (YOLOV5s). Здесь я скачал модель yolov5s.onnx версии v6.0 в качестве примера.

Адрес для скачивания: [https://github.com/ultralytics/yolov5/releases/download/v6.0/yolov5s.pt](https://github.com/ultralytics/yolov5/releases/download/v6.0/yolov5s.pt)

![image-20230614144617406](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230614144617406.png)

Перейдя, вы попадёте в центр ресурсов yolov5. Прокрутите вниз до интерфейса скачивания ресурсов версии V6.0 и найдите необходимый вам ресурс для скачивания.

![yolov5-download](http://photos.100ask.net/allwinner-docs/v853/AIApplication/yolov5-download.gif)

Поместите этот файл модели в папку проекта yolov5, как показано ниже:

![image-20230619162921742](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619162921742.png)

В терминале conda введите `python detect.py`, и вы получите следующий результат выполнения

```
(my-yolov5-env) D:\Programmers\ModelDeployment\2.yolov5\yolov5-6.0>python detect.py
detect: weights=yolov5s.pt, source=data\images, imgsz=[640, 640], conf_thres=0.25, iou_thres=0.45, max_det=1000, device=, view_img=False, save_txt=False, save_conf=False, save_crop=False, nosave=False, classes=None, agnostic_nms=False, augment=False, visualize=False, update=False, project=runs\detect, name=exp, exist_ok=False, line_thickness=3, hide_labels=False, hide_conf=False, half=False, dnn=False
YOLOv5  2021-10-12 torch 2.0.1+cpu CPU

Fusing layers...
D:\Anaconda3\envs\my-yolov5-env\lib\site-packages\torch\functional.py:504: UserWarning: torch.meshgrid: in an upcoming release, it will be required to pass the indexing argument. (Triggered internally at C:\actions-runner\_work\pytorch\pytorch\builder\windows\pytorch\aten\src\ATen\native\TensorShape.cpp:3484.)
  return _VF.meshgrid(tensors, **kwargs)  # type: ignore[attr-defined]
Model Summary: 213 layers, 7225885 parameters, 0 gradients
image 1/2 D:\Programmers\ModelDeployment\2.yolov5\yolov5-6.0\data\images\bus.jpg: 640x480 4 persons, 1 bus, Done. (0.274s)
image 2/2 D:\Programmers\ModelDeployment\2.yolov5\yolov5-6.0\data\images\zidane.jpg: 384x640 2 persons, 1 tie, Done. (0.189s)
Speed: 4.5ms pre-process, 231.3ms inference, 2.8ms NMS per image at shape (1, 3, 640, 640)
Results saved to runs\detect\exp1
```

**Часто задаваемые вопросы:**

Если при выполнении этой команды возникает следующая ошибка:

![image-20230619161143601](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619161143601.png)

Причина: версия torch слишком новая. Это можно решить путём изменения кода или понижения версии.

Ниже я использую способ изменения кода для решения:

Отредактируйте файл `D:\Anaconda3\envs\my-yolov5-env\lib\site-packages\torch\nn\modules\upsampling.py`, функцию forward класса Upsample, измените возвращаемое значение.

Исходный код:

```
    def forward(self, input: Tensor) -> Tensor:
        return F.interpolate(input, self.size, self.scale_factor, self.mode, self.align_corners,
                             recompute_scale_factor=self.recompute_scale_factor)
```

После изменения:

```
    def forward(self, input: Tensor) -> Tensor:
        return F.interpolate(input, self.size, self.scale_factor, self.mode, self.align_corners)
```

Результат изменения показан ниже:

![image-20230619162245935](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619162245935.png)

После выполнения `python detect.py` вы можете найти результаты выполнения в директории runs\detect\exp1 в папке проекта yolov5, как показано ниже.

![bus](http://photos.100ask.net/allwinner-docs/v853/AIApplication/bus.jpg)

![zidane](http://photos.100ask.net/allwinner-docs/v853/AIApplication/zidane.jpg)

## 2. Экспорт модели YOLOV5 ONNX

### 2.1 Экспорт модели программой export

В программе export.py найдите функцию parse_opt и проверьте формат модели, выводимой по умолчанию. Если поддержка ONNX установлена по умолчанию, не нужно изменять. Если формат ONNX не установлен по умолчанию, измените формат по умолчанию на ONNX.

![image-20230619163348744](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619163348744.png)

Перед выполнением функции export.py необходимо убедиться, что установлен пакет onnx. Можно установить вручную, как показано ниже

```
pip install onnx==1.13.0 -i https://pypi.doubanio.com/simple/
```

![image-20230614143642210](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230614143642210.png)

Выполните функцию export.py для экспорта динамической модели ONNX yolov5 в терминале conda введите

```
python export.py --weights yolov5s.pt --include onnx --dynamic
```

![image-20230619164049085](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619164049085.png)

После завершения выполнения в директории проекта yolov5 создаётся файл с названием `yolov5s.onnx`, как показано ниже:

![image-20230619164141069](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619164141069.png)

### 2.2 Упрощение модели

Поскольку преобразованная модель имеет динамическую форму, не ограничивая размер входного изображения, это добавит дополнительные операции обработки для NPU. Поэтому здесь мы должны преобразовать её в модель со статической формой.

Нужно установить инструмент `onnxsim`. В терминале conda введите

```
pip install onnxsim -i https://pypi.doubanio.com/simple/
```

![image-20230614145945598](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230614145945598.png)

Затем используйте эту команду для преобразования:

```
python -m onnxsim yolov5s.onnx yolov5s-sim.onnx --input-shape 1,3,640,640
```

![image-20230625153004215](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625153004215.png)

После завершения экспорта файла с названием `yolov5s-sim.onnx`, файл находится в папке проекта yolov5, как показано ниже:

![image-20230619164602355](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619164602355.png)

### 2.3 Просмотр модели

Используйте открытый веб-сайт Netron

[https://netron.app/](https://netron.app/)

Посетите приведённый выше адрес для просмотра структуры модели.

![image-20230619165052151](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619165052151.png)

Выберите файл `yolov5s-sim.onnx` и нажмите открыть.

![image-20230619165209306](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619165209306.png)

Просмотрите выходные узлы, показанные на рисунке ниже

![image-20230625153134978](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625153134978.png)

Видно, что модель имеет 4 выходных узла. Узел output - это узел после анализа постобработки. В процессе фактического тестирования было обнаружено, что квантизация NPU очень неудобна для постобработки вычисления, с большим смещением выходных данных. Поэтому мы можем запустить часть постобработки на CPU. Таким образом остаются три выходных узла `350`, `498`, `646` - выходные узлы до анализа постобработки. Выходные узлы будут изменены во время импорта модели позже.

## 3. Преобразование модели NPU

### 3.1 Создание директории преобразования

Откройте виртуальную машину Ubuntu 20.04 с установленным пакетом инструментов NPU. Создайте папку yolov5-6.0 для хранения моделей и изображений для квантизации и т.д.

```
ubuntu@ubuntu2004:~$ mkdir yolov5-6.0
```

Перейдите в директорию преобразования модели yolov5.

```
ubuntu@ubuntu2004:~$ cd yolov5-6.0/
```

Создайте директорию data для хранения изображений для квантизации

```
mkdir data
```

Передайте изображения для квантизации в папку data. Например, передайте изображение `test01.jpg` в `data`

```
ubuntu@ubuntu2004:~/yolov5-test$ ls data
test01.jpg
```

Создайте файл `dataset.txt` в директории преобразования модели yolov5

```
ubuntu@ubuntu2004:~/yolov5-6.0$ touch dataset.txt
```

Отредактируйте файл `dataset.txt`

```
ubuntu@ubuntu2004:~/yolov5-6.0$ vi dataset.txt
```

Добавьте пути к изображениям для квантизации в файл `dataset.txt`.

```
./data/test01.jpg
```

![image-20230619175830410](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619175830410.png)

Передайте модель `yolov5s-sim.onnx` в папку преобразования модели yolov5. Например:

```
ubuntu@ubuntu2004:~/yolov5-6.0$ ls
data  dataset.txt  yolov5s-sim.onnx
```

Файлы рабочей директории показаны ниже:

```
ubuntu@ubuntu2004:~/yolov5-6.0$ tree
.
├── data
│   └── test01.jpg
├── dataset.txt
└── yolov5s-sim.onnx

1 directory, 3 files
```

### 3.2 Импорт модели

Перед импортом модели необходимо знать выходные узлы, которые мы хотим сохранить. Из предыдущего просмотра три выходных узла постобработки - это `350`, `498`, `646`.

```
pegasus import onnx --model yolov5s-sim.onnx --output-data yolov5s-sim.data --output-model yolov5s-sim.json --outputs 350 498 646
```

При импорте создаются два файла - `yolov5s-sim.data` и `yolov5s-sim.json`. Это файлы представления внутреннего формата VeriSilicon для сети YOLO V5. Файл `data` хранит веса, файл `cfg` хранит модель.

### 3.3 Создание YML файла

YML файл описывает гиперпараметры входа и выхода сети и её конфигурацию. Эти параметры включают форму входного и выходного тензора, коэффициенты нормализации (средние значения, нулевая точка), формат изображения, формат вывода тензора, способ постобработки и т.д.

```
pegasus generate inputmeta --model yolov5s-sim.json --input-meta-output yolov5s-sim_inputmeta.yml
```

![image-20230619181406282](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619181406282.png)

```
pegasus generate postprocess-file --model yolov5s-sim.json --postprocess-file-output yolov5s-sim_postprocess_file.yml
```

Измените параметр `scale` в файле `yolov5s-sim_inputmeta.yml` на `0.0039216(1/255)`. Целью является нормализация входного `тензора` для соответствия обучению сети.

```
vi yolov5s-sim_inputmeta.yml
```

![image-20230621183150357](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230621183150357.png)

### 3.4 Квантизация

Создайте файл таблицы квантизации. Используйте асимметричную квантизацию, uint8. Измените параметр `--batch-size` на количество изображений в вашем файле `dataset.txt`.

```
pegasus quantize --model yolov5s-sim.json --model-data yolov5s-sim.data --batch-size 1 --device CPU --with-input-meta yolov5s-sim_inputmeta.yml --rebuild --model-quantize yolov5s-sim.quantize --quantizer asymmetric_affine --qtype uint8
```

![image-20230619181548262](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619181548262.png)

### 3.5 Предварительное взаимодействие

Используя таблицу квантизации из предыдущих шагов, выполните предварительное взаимодействие для получения тензора взаимодействия

```
pegasus inference --model yolov5s-sim.json --model-data yolov5s-sim.data --batch-size 1 --dtype quantized --model-quantize yolov5s-sim.quantize --device CPU --with-input-meta yolov5s-sim_inputmeta.yml --postprocess-file yolov5s-sim_postprocess_file.yml
```

![image-20230619181729205](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619181729205.png)

### 3.6 Экспорт шаблонного кода и модели

Выведённую модель можно найти в папке `ovxilb/yolov5s-sim_nbg_unify` с файлом `network_binary.nb`.

```
pegasus export ovxlib --model yolov5s-sim.json --model-data yolov5s-sim.data --dtype quantized --model-quantize yolov5s-sim.quantize --batch-size 1 --save-fused-graph --target-ide-project 'linux64' --with-input-meta yolov5s-sim_inputmeta.yml --output-path ovxilb/yolov5s-sim/yolov5s-simprj --pack-nbg-unify --postprocess-file yolov5s-sim_postprocessmeta.yml --optimize "VIP9000PICO_PID0XEE" --viv-sdk ${VIV_SDK}
```

![image-20230619181923864](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230619181923864.png)

Скопируйте созданный файл `network_binary.nb` для последующего использования.

## 4. Развертывание YOLOV5 на устройстве

### 4.1 Конфигурация окружения развертывания yolov5 на устройстве

Перед развертыванием на устройстве, так как постобработка требует использования библиотеки OpenCV, пожалуйста, сначала следуйте инструкциям ниже

- Конфигурация расширенного пакета NPU: https://forums.100ask.net/t/topic/3224

- Конфигурация библиотеки OpenCV: https://forums.100ask.net/t/topic/3349

После конфигурации вы сможете компилировать программу развертывания на устройстве.

Скачайте `yolov5.tar.gz` из архива `source`, скопируйте этот архив в виртуальную машину и распакуйте архив

```
tar -xzvf yolov5.tar.gz
```

Скопируйте распакованную папку в директорию `tina-v853-open/openwrt/package/npu/`

```
cp yolov5/ ~/workspaces/tina-v853-open/openwrt/package/npu/ -rf
```

Примечание: приведённая выше директория `~/workspaces/tina-v853-open/openwrt/package/npu/` должна быть изменена на фактическую директорию вашего SDK.

После копирования это выглядит так:

```
book@100ask:~/workspaces/tina-v853-open/openwrt/package/npu$ ls
lenet  viplite-driver  vpm_run  yolov3  yolov5
```

### 4.2 Компиляция кода развертывания на устройстве

Конфигурируйте окружение компиляции

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

Перейдите в интерфейс конфигурации Tina

```
book@100ask:~/workspaces/tina-v853-open$ make menuconfig
```

Перейдите в следующую директорию и выберите yolov5, затем вы сможете скомпилировать программу развертывания на устройстве

```
> 100ask
	> NPU
		<*> yolov5....................................................... yolov5 demo
		<*>   yolov5-model...................................... yolov5 test demo model
```

Примечание: после выбора yolov5-model, файл yolov5_model.nb будет упакован в образ, этот файл модели будет находиться в директории /etc/models/.

![image-20230625170009845](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625170009845.png)

Сохраните и выйдите из интерфейса конфигурации Tina.

Скомпилируйте образ Tina SDK, после завершения компиляции упакуйте образ

```
book@100ask:~/workspaces/tina-v853-open$ make
...
book@100ask:~/workspaces/tina-v853-open$ pack
```

Примечание: если вы упакуете модель в образ, может возникнуть проблема с установкой слишком малого размера файловой системы. Вы можете обратиться к https://forums.100ask.net/t/topic/3158 для решения.

После завершения упаковки используйте инструмент записи Allwinner для записи нового образа. Если вы ещё не знаете, как записать систему, обратитесь к: https://forums.100ask.net/t/topic/3403

### 4.3 Тестирование развертывания yolov5 на устройстве

Требования к файлу тестового изображения:

- Изображение
- Размер: 640*640

**На стороне отладочной платы:**

Используйте ADB для передачи тестового изображения на отладочную плату. Переключите режим USB0 в режим Device

```
cat /sys/devices/platform/soc/usbc0/usb_device
```

![image-20230625171158725](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625171158725.png)

**На стороне хоста:**

Подключите устройство ADB к виртуальной машине и передайте тестовое изображение из виртуальной машины на отладочную плату. Проверьте устройство ADB

```
book@100ask:~/workspaces/testImg$ adb devices
List of devices attached
20080411	device
```

Проверьте файл, который нужно передать

```
book@100ask:~/workspaces/testImg$ ls bus_640-640.jpg
bus_640-640.jpg
```

Передайте файл на отладочную плату

```
book@100ask:~/workspaces/testImg$ adb push bus_640-640.jpg /mnt/UDISK
bus_640-640.jpg: 1 file pushed. 0.7 MB/s (97293 bytes in 0.128s)
```

**На стороне отладочной платы:**

Перейдите в директорию тестового изображения

```
root@TinaLinux:/# cd /mnt/UDISK/
root@TinaLinux:/mnt/UDISK# ls
bus_640-640.jpg  lost+found       overlay
```

Параметры программы yolov5: yolov5 <путь к файлу модели> <путь к тестовому изображению>

Если вы упаковали файл модели yolov5 по умолчанию, вы можете ввести

```
yolov5 /etc/models/yolov5_model.nb ./bus_640-640.jpg
```

Если вам нужно выбрать свой файл модели для тестирования, вы можете заменить приведённый выше `/etc/models/yolov5_model.nb` на путь к своей модели. Ниже я использую файл модели по умолчанию для тестирования.

![image-20230625172157448](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625172157448.png)

Просмотрите выходной файл изображения `yolov5_out.jpg`

```
root@TinaLinux:/mnt/UDISK# ls
bus_640-640.jpg  lost+found       overlay          yolov5_out.jpg
```

**На стороне хоста:**

Извлеките выходной файл `yolov5_out.jpg` в текущую папку

```
book@100ask:~/workspaces/testImg$ adb pull /mnt/UDISK/yolov5_out.jpg ./
/mnt/UDISK/yolov5_out.jpg: 1 file pulled. 0.9 MB/s (184894 bytes in 0.202s)
```

![image-20230625172512521](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625172512521.png)

### 4.4 Тестирование других изображений

Для распознавания людей эта модель довольно точна

![image-20230625175804726](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625175804726.png)

Для сложных случаев, таких как дорожное движение, модель теряет некоторые пешеходов, но хорошо работает с транспортными средствами и редко их теряет.

![image-20230625180437728](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625180437728.png)

При тестировании животных эта модель очень точна при обнаружении животных с высокой точностью предсказания и хорошими результатами обнаружения.

![image-20230625181808524](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625181808524.png)

![image-20230625184657791](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230625184657791.png)
