# Развертывание пользовательской модели YOLOv5 на отладочной плате

## 0. Предисловие

В этой главе описывается, как обучить модель на пользовательском наборе данных и развернуть её на отладочной плате 100ASK-V853-PRO. Предполагается, что вы уже установили окружение YOLOv5-v6.0. Информацию об установке окружения см. в разделе [YOLOv5-v6.0 установка окружения](https://forums.100ask.net/t/topic/3670). Если вы не читали статью [Развертывание модели YOLOv5 на отладочной плате 100ASK-V853-PRO](https://forums.100ask.net/t/topic/3648), пожалуйста, сначала выполните действия из этой статьи.

Ниже приведена демонстрация того, как обучить пользовательскую модель, экспортировать модель, преобразовать модель и развернуть модель. Примечание: обучение модели требует определённых характеристик компьютера. Если компьютер недостаточно мощный, это может привести к плохим результатам обучения и низкой точности модели.

Справочная ссылка: [https://docs.ultralytics.com/yolov5/tutorials/train_custom_data/](https://docs.ultralytics.com/yolov5/tutorials/train_custom_data/)

## 1. Загрузка инструмента аннотации данных

Инструмент аннотации данных: https://github.com/heartexlabs/labelImg/releases

![image-20230628104416057](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628104416057.png)

Нажмите на красную рамку выше для загрузки. После завершения загрузки распакуйте архив и дважды щелкните файл `labelImg.exe`.

![image-20230628104508751](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628104508751.png)

После открытия подождите его запуска. После завершения вы войдёте в следующий интерфейс работы аннотирования.

![image-20230628104644114](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628104644114.png)

Дополнительная информация об использовании LabelImg доступна по адресу: https://github.com/heartexlabs/labelImg

LabelImg заранее предоставляет несколько классов для использования, которые необходимо вручную удалить, чтобы вы могли аннотировать собственный набор данных. Шаги следующие:

![delete-labelImg-predefind](http://photos.100ask.net/allwinner-docs/v853/AIApplication/delete-labelImg-predefind.gif)

Перейдите в папку data в директории программы LabelImg, откройте файл `predefined_classes.txt`, удалите все предопределённые классы в файле, сохраните и закройте.

## 2. Создание директории набора данных

В любой рабочей директории создайте папку `images` и папку `labels` для хранения изображений набора данных и информации об аннотациях соответственно. Здесь я демонстрирую аннотацию с использованием небольшого количества образцов изображений. В реальных проектах вам необходимо собрать достаточно изображений и аннотировать их, чтобы удовлетворить требованиям по точности и прецизионности модели.

Например, в моей директории `100ask-yolov5-image` я создал папки `images` и `labels`, как показано ниже. Папка images содержит набор данных изображений, папка labels содержит аннотации данных.

![DataSetworkingDirectory](http://photos.100ask.net/allwinner-docs/v853/AIApplication/DataSetworkingDirectory.gif)

## 3. Аннотирование изображений

После открытия программы LabelImg используйте её для открытия папки набора данных изображений, как показано ниже:

![LabelImg-OpenDataSetDirectory](http://photos.100ask.net/allwinner-docs/v853/AIApplication/LabelImg-OpenDataSetDirectory.gif)

После открытия измените выходную папку для аннотаций на папку `labels` в созданной вами директории набора данных.

![LabelImg-changelabelDir](http://photos.100ask.net/allwinner-docs/v853/AIApplication/LabelImg-changelabelDir.gif)

Ниже я показываю процесс аннотирования, используя отладочные платы 100ask в качестве примера, аннотируя три отладочные платы.

![label-iamge](https://bbs.aw-ol.com/assets/uploads/files/1688096675613-labelimg-labelingprocess.gif)

Когда вы нажимаете Save, это указывает на завершение аннотирования. После завершения аннотирования в папке `labels` будут созданы файл `classes.txt` (категории) и информация о позициях аннотированных категорий в изображении.

Ниже приведены [сочетания клавиш LabelImg](https://github.com/heartexlabs/labelImg):

| Ctrl + u         | Загрузить все изображения из директории  |
| ---------------- | ---------------------------------------- |
| Ctrl + r         | Изменить целевую директорию аннотаций  |
| Ctrl + s         | Сохранить                                     |
| Ctrl + d         | Скопировать текущую метку и прямоугольник       |
| Ctrl + Shift + d | Удалить текущее изображение                 |
| Space            | Отметить текущее изображение как проверенное       |
| w                | Создать прямоугольник                        |
| d                | Следующее изображение                               |
| a                | Предыдущее изображение                           |
| del              | Удалить выбранный прямоугольник             |
| Ctrl++           | Увеличить масштаб                                  |

После аннотирования большого количества изображений папка `labels` выглядит следующим образом:

![LabelImg-LabelsDir](http://photos.100ask.net/allwinner-docs/v853/AIApplication/LabelImg-LabelsDir.gif)

## 4. Разделение на обучающий и проверочный наборы

Для обучения модели необходим обучающий и проверочный наборы. Проще говоря, сеть обучается на обучающем наборе, а обученная сеть проверяется на проверочном наборе. Обычно обучающий набор должен составлять 80% от общего набора данных, а проверочный набор должен составлять 20%. Поэтому разделите аннотированный набор данных в соответствии с этими пропорциями.

В директории проекта yolov5-6.0 создайте папку 100ask (название этой папки можно изменить), в папке 100ask создайте папку train (для хранения обучающего набора) и папку val (для хранения проверочного набора).

![100ask-trainVal-Img](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-trainVal-Img.gif)

В папке train создайте папку images и папку labels. Папка images содержит 80% изображений из общего набора данных, папка labels содержит соответствующие файлы аннотаций.

![100ask-trainDir-ImgLab](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-trainDir-ImgLab.gif)

В папке val создайте папку images и папку labels. Папка images содержит 20% изображений из общего набора данных, папка labels содержит соответствующие файлы аннотаций.

![100ask-trainVal-Img](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-trainVal-Img.gif)

## 5. Создание файла конфигурации набора данных

Перейдите в директорию yolov5-6.0\data и создайте файл `data.yaml` со следующим содержимым:

```
train: 100ask\train\images  # обучающие изображения
val: 100ask\val\images  # проверочные изображения

nc: 3  # количество классов
names: ['T113', 'K510', 'V853']  # названия классов
```

![100ask-dataYaml-Config](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-dataYaml-Config.gif)

## 6. Создание файла конфигурации модели

Перейдите в директорию models, скопируйте файл yolov5s.yaml, вставьте его в директорию models и переименуйте в 100ask_my-model.yaml, например:

![100ask-modelYaml-Config](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-modelYaml-Config.gif)

Измените количество классов в файле 100ask_my-model.yaml на количество классов в вашей обучаемой модели.

## 6. Изменение функции обучения

Откройте файл train.py в папке проекта yolov5-6.0 и измените путь файла конфигурации данных, как показано красной рамкой на рисунке:

```
parser.add_argument('--cfg', type=str, default='models/100ask_my-model.yaml', help='model.yaml path')
parser.add_argument('--data', type=str, default=ROOT / 'data/data.yaml', help='dataset.yaml path')
```

## 7. Обучение модели

В окне терминала conda активируйте окружение yolov5, а затем перейдите в папку проекта yolov5-6.0. Выполните команду `python train.py`, как показано на рисунке ниже:

![image-20230628174332495](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628174332495.png)

По умолчанию программа выполняет 300 итераций. Дождитесь завершения обучения...

![image-20230628182753106](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628182753106.png)

После завершения обучения результаты сохраняются в директории `runs\train\` в последний раз при обучении. Как показано на рисунке выше, лучшая модель этого обучения и последняя обученная модель сохраняются в следующей директории:

```
runs\train\exp7\weights
```

## 8. Проверка модели

Измените функцию val.py, как показано ниже:

```
    parser.add_argument('--data', type=str, default=ROOT / 'data/data.yaml', help='dataset.yaml path')
    parser.add_argument('--weights', nargs='+', type=str, default=ROOT / 'runs/train/exp7/weights/best.pt', help='model.pt path(s)')
```

![image-20230628183910971](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628183910971.png)

Измените yolo.py в папке models:

```
class Model(nn.Module):
    def __init__(self, cfg='100ask_my-model.yaml', ch=3, nc=None, anchors=None):  # model, input channels, number of classes
```

![image-20230628185921751](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628185921751.png)

Откройте окно терминала conda и введите `python val.py`

![image-20230628190017879](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230628190017879.png)

После выполнения результаты сохраняются в папке `runs\val\exp`.

![100ask-valRun](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-valRun.gif)

## 9. Предсказание на изображениях

В директории data создайте новую папку `100ask-images` для хранения изображений и видеофайлов для обнаружения.

Измените функцию detect.py, изменив путь модели и путь к изображению для обнаружения.

```
parser.add_argument('--weights', nargs='+', type=str, default=ROOT / 'runs/train/exp7/weights/best.pt', help='model path(s)')
parser.add_argument('--source', type=str, default=ROOT / 'data/100ask-images', help='file/dir/URL/glob, 0 for webcam')
```

![image-20230629103359183](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629103359183.png)

Результат обнаружения выглядит следующим образом:

![2023-06-28 191541(3)](http://photos.100ask.net/allwinner-docs/v853/AIApplication/yolov5-detect.jpg)

## 10. Экспорт модели ONNX

Измените функцию export.py:

```
parser.add_argument('--data', type=str, default=ROOT / 'data/data.yaml', help='dataset.yaml path')
parser.add_argument('--weights', type=str, default=ROOT / 'runs/train/exp7/weights/best.pt', help='weights path')
```

![image-20230629103642324](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629103642324.png)

Введите в окно терминала conda:

```
python export.py --include onnx --dynamic
```

![image-20230629104014942](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629104014942.png)

Экспортированная модель находится в той же директории, что и входная модель. Предположим, входная модель находится в: `runs\train\exp7\weights`

![image-20230629104123779](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629104123779.png)

## 11. Упрощение модели

Перед упрощением модели необходимо установить зависимый пакет `onnxruntime`. Введите следующую команду:

```
pip install onnxruntime==1.13.1 -i https://pypi.doubanio.com/simple/
```

Команда упрощения выглядит следующим образом:

```
python -m onnxsim <входная модель> <выходная модель> --input-shape <размер входного изображения>
```

Например:

Путь входной модели: runs/train/exp7/weights/best.onnx, путь выходной модели: runs/train/exp7/weights/best-sim.onnx

Размер входного изображения зафиксирован на 640x640.

```
python -m onnxsim runs/train/exp7/weights/best.onnx runs/train/exp7/weights/best-sim.onnx --input-shape 1,3,640,640
```

![image-20230629110454569](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629110454569.png)

## 13. Просмотр модели

Посетите: https://netron.app/

![image-20230629111343751](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629111343751.png)

Вы можете видеть, что вход уже зафиксирован на 640x640. Видно, что модель имеет 4 узла вывода. Узел ouput является узлом после обработки постпроцесса. Во время практического тестирования обнаружено, что операция квантизации NPU очень неудобна для постпроцесса, и выходные данные имеют большое отклонение. Поэтому мы можем запустить часть постпроцесса на CPU. Таким образом, при импорте модели сохраняем только узлы вывода 350, 498, 646 перед постпроцессом.

## 14. Проверка модели

Модель необходимо изменить на путь упрощённой модели.

Создайте новую папку для хранения входного изображения с фиксированным размером. Предположим, что выше я установил размер входного изображения на 640x640. Тогда я создаю папку 100ask-images-640 в директории data для хранения изображений размером 640x640 в качестве тестовых данных.

Измените функцию detect.py:

```
    parser.add_argument('--weights', nargs='+', type=str, default=ROOT / 'runs/train/exp7/weights/best-sim.onnx', help='model path(s)')
    parser.add_argument('--source', type=str, default=ROOT / 'data/100ask-images-640', help='file/dir/URL/glob, 0 for webcam')
```

![image-20230629112042899](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629112042899.png)

Введите в окно терминала conda:

```
python detect.py
```

![image-20230629112859954](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629112859954.png)

Из выходной информации видно, что результаты обнаружения хранятся в runs\detect\exp6

Результаты обнаружения выглядят следующим образом:

![test-640](http://photos.100ask.net/allwinner-docs/v853/AIApplication/test-640.jpg)

## 15. Преобразование модели

### 15.1 Создание рабочей директории

Передайте упрощённую модель `best-sim.onnx` в виртуальную машину с инструментом преобразования модели NPU и создайте директорию инструмента модели, содержащую файл модели, папку квантизации `data` (для хранения изображений квантизации), файл `dataset.txt` (для хранения путей к изображениям квантизации).

```
buntu@ubuntu2004:~/100ask-yolov5-test$ tree
.
├── best-sim.onnx
├── data
│   └── test01.jpg
└── dataset.txt

1 directory, 5 files
```

Рабочая директория выглядит следующим образом:

![100ask-changeModelDir](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-changeModelDir.gif)

### 15.2 Импорт модели

Перед импортом модели нам нужно знать узлы вывода, которые мы хотим сохранить. Ранее мы обнаружили три узла постпроцесса: `350`, `498`, `646`.

```
pegasus import onnx --model best-sim.onnx --output-data best-sim.data --output-model best-sim.json --outputs "350 498 646"
```

Импорт создаёт два файла: `yolov5s-sim.data` и `yolov5s-sim.json`. Оба файла представляют собой форматы представления Verisilicon для сети YOLOv5. Файл `data` содержит веса, файл `cfg` содержит модель.

![100ask-leadingInmodel](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-leadingInmodel.gif)

### 15.3 Генерация YML файла

Файл YML описывает и конфигурирует гиперпараметры входа и выхода сети, включая форму тензора входа-выхода, коэффициенты нормализации (среднее значение, нулевая точка), формат изображения, формат выхода тензора, методы постпроцесса и т.д.

```
pegasus generate inputmeta --model best-sim.json --input-meta-output best-sim_inputmeta.yml
```

![100ask-generateModelInput](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-generateModelInput.gif)

```
pegasus generate postprocess-file --model best-sim.json --postprocess-file-output best-sim_postprocess_file.yml
```

![100ask-generateModelOutput](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-generateModelOutput.gif)

Измените параметр `scale` в файле `best-sim_inputmeta.yml` на `0.0039216(1/255)`. Цель состоит в том, чтобы нормализовать входной `тензор`, что соответствует обучению сети.

```
vi best-sim_inputmeta.yml
```

Процесс изменения показан на рисунке ниже:

![100ask-changeInputYaml](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-changeInputYaml.gif)

### 15.4 Квантизация

Генерирует файл таблицы квантизации, использует асимметричную квантизацию, uint8. Измените параметр `--batch-size` на количество изображений, предоставленных в `dataset.txt`. Если исходная сеть использует фиксированный batch_size, используйте фиксированный batch_size. Если исходная сеть использует переменный batch_size, установите этот параметр на 1.

```
pegasus quantize --model best-sim.json --model-data best-sim.data --batch-size 1 --device CPU --with-input-meta best-sim_inputmeta.yml --rebuild --model-quantize best-sim.quantize --quantizer asymmetric_affine --qtype uint8
```

![100ask-quantifyModel](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-quantifyModel.gif)

### 15.5 Предварительное выведение

Выполните предварительное выведение с использованием таблицы квантизации из предыдущего шага для получения вывода `тензора`:

```
pegasus inference --model best-sim.json --model-data best-sim.data --batch-size 1 --dtype quantized --model-quantize best-sim.quantize --device CPU --with-input-meta best-sim_inputmeta.yml --postprocess-file best-sim_postprocess_file.yml
```

![100ask-PreInferenceModel](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-PreInferenceModel.gif)

### 15.6 Экспорт кода шаблона и модели

Выходная модель находится в папке `ovxilb/100ask-best-sim_nbg_unify`. Здесь вы можете найти файл модели `network_binary.nb`.

```
pegasus export ovxlib --model best-sim.json --model-data best-sim.data --dtype quantized --model-quantize best-sim.quantize --batch-size 1 --save-fused-graph --target-ide-project 'linux64' --with-input-meta best-sim_inputmeta.yml --output-path ovxilb/100ask-best-sim/100ask-simprj --pack-nbg-unify --postprocess-file best-sim_postprocessmeta.yml --optimize "VIP9000PICO_PID0XEE" --viv-sdk ${VIV_SDK}
```

![100ask-Export-NBModel](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-Export-NBModel.gif)

Вы можете перейти в директорию, показанную на рисунке ниже, и скопировать файл модели `network_binary.nb` для дальнейшего использования.

![100ask-NBModelDir](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-NBModelDir.gif)

## 16. Развертывание на плате

Здесь мы используем программу развертывания на плате, которую мы написали в предыдущей статье [Развертывание модели YOLOv5 на отладочной плате 100ASK-V853-PRO](https://forums.100ask.net/t/topic/3648). Мы входим в папку программы развертывания на плате, копируем новую программу и вносим изменения. Главным образом мы изменяем программу `vnn_post_process.cpp`.

### 16.1 Изменение функции `draw_objects`

Измените названия классов в функции `draw_objects`. Классы моей обученной модели: `T113、K510、V853`

![image-20230629180241351](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629180241351.png)

Названия категорий должны соответствовать файлу `data.yaml` в папке `data` проекта yolov5-6.0

![image-20230629180515157](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629180515157.png)

### 16.2 Изменение функции `generate_proposals`

Измените количество категорий в функции `generate_proposals` на ваше количество категорий. Если мои обученные категории имеют 3 класса: `T113、K510、V853`, измените на 3.

![image-20230629180707567](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629180707567.png)

Изменённый файл выглядит следующим образом:

![100ask-YOLOV5Dir](http://photos.100ask.net/allwinner-docs/v853/AIApplication/100ask-YOLOV5Dir.gif)

### 16.3 Компиляция

```
 book@100ask:~/workspaces/tina-v853-open$ source build/envsetup.sh
 ...
 book@100ask:~/workspaces/tina-v853-open$ lunch
 ...1
 ...
```

Откройте menuconfig, введите:

```
 make menuconfig
```

Перейдите в следующую директорию и выберите конфигурацию yolov5-100ask:

```
> 100ask
	> NPU
		<*> yolov5-100ask......................................... yolov5-100ask demo
```

![image-20230629185606559](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629185606559.png)

Выполните компиляцию и генерацию образа:

```
 book@100ask:~/workspaces/tina-v853-open$ make
 ...
 book@100ask:~/workspaces/tina-v853-open$ pack
```

После завершения компиляции используйте инструмент прошивки Allwinner для прошивки образа.

### 16.4 Тестирование

**На хост-машине:**

Передайте изображение размером `640*640` и файл модели `network_binary.nb`:

```
book@100ask:~/workspaces/testImg$ adb push test-100ask.jpg /mnt/UDISK
test-100ask.jpg: 1 file pushed. 0.6 MB/s (51039 bytes in 0.078s)
book@100ask:~/workspaces/testImg$ adb push network_binary.nb /mnt/UDISK
network_binary.nb: 1 file pushed. 0.7 MB/s (7409024 bytes in 10.043s)
```

**На отладочной плате:**

Перейдите в директорию /mnt/UDISK/:

```
root@TinaLinux:/# cd /mnt/UDISK/
root@TinaLinux:/mnt/UDISK# ls
lost+found         network_binary.nb  overlay            test-100ask.jpg
```

Запустите программу обнаружения YOLOv5:

```
yolov5-100ask network_binary.nb test-100ask.jpg
```

![image-20230629190424474](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629190424474.png)

После выполнения выходной файл `yolov5_out.jpg` будет создан в текущей директории:

```
root@TinaLinux:/mnt/UDISK# ls
lost+found         overlay            yolov5_out.jpg
network_binary.nb  test-100ask.jpg
```

**На хост-машине:**

Получите выходное изображение `yolov5_out.jpg` с отладочной платы:

```
book@100ask:~/workspaces/testImg$ adb pull /mnt/UDISK/yolov5_out.jpg ./
/mnt/UDISK/yolov5_out.jpg: 1 file pulled. 0.8 MB/s (98685 bytes in 0.116s)
```

## 17. Результаты обнаружения

![image-20230629190722233](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629190722233.png)

![image-20230629191417157](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629191417157.png)

![image-20230629191450619](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230629191450619.png)
