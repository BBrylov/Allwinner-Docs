# Практическое развертывание модели Yolact

## 1. Предисловие

### 1.1 Целевая аудитория

Этот документ (это руководство) предназначен в основном для следующих людей:

• Инженеры технической поддержки

• Инженеры разработки программного обеспечения

• Клиенты AI приложений

## 2. Основное содержание

### 2.1 Введение в разработку NPU

• Поддерживает квантизацию с точностью int8/uint8/int16, вычислительная производительность может достигать 1TOPS.

• По сравнению с крупными решениями на базе чипов, использующих GPU в качестве вычислительного блока AI, потребление мощности составляет менее 1% необходимого для GPU.

• Может напрямую импортировать форматы моделей Caffe, TensorFlow, Onnx, TFLite, Keras, Darknet, pyTorch и т.д.

• Предоставляет инструменты разработки AI: поддерживает быстрое преобразование моделей, поддерживает API преобразования на стороне отладочной платы, поддерживает модели TensorFlow, TF Lite, Caffe, ONNX, Darknet, pyTorch и т.д.

• Предоставляет интерфейсы разработки приложений AI: предоставляет кроссплатформенный API NPU.

### 2.2 Процесс разработки

Полный процесс разработки NPU показан на рисунке ниже:

![image-20221208101012970](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101012970.png)

<center>Рисунок 2-1: npu_1.png</center>

### 2.3 Получение исходной модели YOLACT

Существует множество способов получения модели YOLACT. Вы можете создать модель YOLACT в формате ONNX на основе проекта https://github.com/dbolya/yolact. В этом документе предполагается, что у вас уже есть модель yolact.onnx.

### 2.4 Структура рабочей директории развертывания модели

Файл yolact-sim.onnx имеет размер 120M, что достаточно велико.

![image-20221208101053708](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101053708.png)

<center>Рисунок 2-2: npu_workspace</center>

### 2.5 Импорт модели

```
pegasus import onnx --model yolact-sim.onnx --output-model yolact-sim.json --output-data yolact-sim.data
```

Целью импорта модели является преобразование открытого формата модели в файл описания сетевой модели VIP (.json) и файл весов (.data).

![image-20221208101310404](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101310404.png)

<center>Рисунок 2-3: npu_import</center>

### 2.6 Создание YML файла

Файл YML описывает вход и выход сети, включая форму входного изображения, коэффициенты нормализации (среднее значение, нулевая точка), формат изображения, формат выхода тензора, методы постпроцесса и т.д. Команда следующая:

```
pegasus generate inputmeta --model yolact-sim.json --input-meta-output yolact-sim-inputemeta.yml
```

```
pegasus generate postprocess-file --model yolact-sim.json --postprocess-file-output yolact-simpostprocess-file.yml
```

![image-20221208101601819](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101601819.png)

<center>Рисунок 2-4: npu_yml</center>

Измените параметр scale в файле input meta на 0.0039(1/256), что полностью совпадает со способом изменения в yolov3.

![image-20221208101624198](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101624198.png)

<center>Рисунок 2-5: npu_scale</center>

### 2.7 Квантизация

Команда квантизации:

```
pegasus quantize --model yolact-sim.json --model-data yolact-sim.data --batch-size 1 --device CPU --with-input-meta yolact-sim-inputemeta.yml --rebuild --model-quantize yolact-sim.quantilize --quantizer asymmetric_affine --qtype uint8
```

После выполнения команды создан файл таблицы квантизации:

![image-20221208101701439](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101701439.png)

<center>Рисунок 2-6: npu_quantilize</center>

### 2.8 Предварительное выведение

```
pegasus inference --model yolact-sim.json --model-data yolact-sim.data --batch-size 1 --dtype quantized --model-quantize yolact-sim.quantilize --device CPU --with-input-meta yolact-siminputemeta.yml --postprocess-file yolact-sim-postprocess-file.yml
```

![image-20221208101802000](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101802000.png)

<center>Рисунок 2-7: npu_inf</center>

### 2.9 Экспорт кода и файла NBG

```
pegasus export ovxlib --model yolact-sim.json --model-data yolact-sim.data --dtype quantized --model-quantize yolact-sim.quantilize --batch-size 1 --save-fused-graph --target-ide-project 'linux64' --with-input-meta yolact-sim-inputemeta.yml --postprocess-file yolact-sim-postprocess-file.yml --output-path ovxlib/yolact/yolact --pack-nbg-unify --optimize "VIP9000PICO_PID0XEE" --vivsdk${VIV_SDK}
```

```
pegasus export ovxlib --model yolact-sim.json --model-data yolact-sim.data --dtype quantized --model-quantize yolact-sim.quantilize --batch-size 1 --save-fused-graph --target-ide-project 'linux64' --with-input-meta yolact-sim-inputemeta.yml --postprocess-file yolact-sim-postprocess-file.yml --output-path ovxlib/yolact/yolact --pack-nbg-viplite --optimize "VIP9000PICO_PID0XEE" --vivsdk${VIV_SDK}
```

![image-20221208101926523](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101926523.png)

<center>Рисунок 2-8: npu_export</center>

Созданный файл NBG может быть развёрнут на стороне отладочной платы:

![image-20221208101945583](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208101945583.png)

<center>Рисунок 2-9: npu_nbg</center>

### 2.10 Измерение вычислительных характеристик модели

```
pegasus measure --model yolact-sim.json
```

![image-20221208102008519](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102008519.png)

<center>Рисунок 2-10: npu_measure</center>

По сравнению с требованиями вычислительных характеристик yolov3 32.99G MACC и yolov3-tiny 2.79G macc, YOLACT явно требует гораздо больше вычислительных характеристик. Кстати, 1TOPS=1000GOPS. Для yolov3-tiny требуется 3G вычислительных характеристик, то есть 0.003T. При частоте 500M теоретическая производительность NPU составляет 0.5T. Таким образом, частота кадров YOLOv3 составляет: 0.5T/0.003T=166 кадров. Это значение очень близко к значению моделирования.

### 2.11 Проверка постпроцесса

Код постпроцесса C модели yolact находится в следующем месте:

![image-20221208102042389](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102042389.png)

<center>Рисунок 2-11: npu_gerit</center>

Компилируем модель постпроцесса:

![image-20221208102206195](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102206195.png)

<center>Рисунок 2-12: npu_post</center>

В директории out сгенерирована программа постпроцесса yolact:

![image-20221208102225653](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102225653.png)

<center>Рисунок 2-13: npu_postprocess</center>

Модель yolact имеет пять слоёв вывода, на этапе выведения сгенерировано 5 тензоров вывода.

![image-20221208102753573](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102753573.png)

<center>Рисунок 2-14: npu_tensor</center>

Соответствие между тензорами: 0 - location, 1 - confidence, 2 - mask, 3 - временно не используется, 4 - maskmaps.

output0_4_19248_1.dat <---->iter_0_attach_Concat_Concat_256_out0_0_out0_1_19248_4.tensor

output1_81_19248_1.dat<---->iter_0_attach_Softmax_Softmax_260_out0_1_out0_1_19248_81.tensor

output2_32_19248_1.dat<---->iter_0_attach_Concat_Concat_258_out0_2_out0_1_19248_32.tensor

output3_4_19248.dat <---->iter_0_attach_Initializer_769_out0_3_out0_19248_4.tensor

output4_32_138_138_1.dat<---->iter_0_attach_Transpose_Transpose_165_out0_4_out0_1_138_138_32.tensor

Выполнение постпроцесса:

![image-20221208102833160](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102833160.png)

<center>Рисунок 2-15: npu_exepost</center>

Результаты постпроцесса:

![image-20221208102858625](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102858625.png)

<center>Рисунок 2-16: npu_yolact</center>

На изображении распознаны две собаки. Есть информация о двух собаках. Остальное работает очень хорошо. Собака с 70.7% вероятностью не должна появляться. Вероятно, это вызвано тем, что квантизация привела к снижению точности выходных результатов.

После изменения параметров нормализации и переразвёртывания получены следующие результаты. Видно, что предыдущая проблема исчезла:

![image-20221208102920884](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208102920884.png)

<center>Рисунок 2-17: npu_yolact_ok</center>

Таким образом, импорт модели yolact завершён.

### 2.12 Заключение
