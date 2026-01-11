# Пояснение по смешанной квантизации NPU

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

![image-20221208105945861](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208105945861.png)

<center>Рисунок 2-1: npu_1.png</center>

В этом документе на примере модели yolov5s описаны конкретные шаги смешанной квантизации.

### 2.3 Развертывание с плавающей точкой

Целью развертывания с плавающей точкой является получение золотых данных для сравнения сходства с данными, полученными при смешанной квантизации, для оценки эффекта смешанной квантизации.

```
pegasus.py import onnx --model yolov5s.onnx --output-data yolov5s.data --output-model yolov5s.json

pegasus.py generate inputmeta --model yolov5s.json --input-meta-output yolov5s-inputmeta.yml

pegasus.py generate postprocess-file --model yolov5s.json --postprocess-file-output yolov5s-postprocess-file.yml

pegasus.py inference --model yolov5s.json --model-data yolov5s.data --batch-size 1 --dtype float32 --device CPU --with-input-meta yolov5s-inputmeta.yml --postprocess-file yolov5s-postprocess-file.yml

pegasus.py export ovxlib --model yolov5s.json --model-data yolov5s.data --dtype float32 --batch-size 1 --save-fused-graph --target-ide-project 'linux64' --with-input-meta yolov5s-inputmeta.yml --postprocess-file yolov5s-postprocess-file.yml --output-path ovxlib/yolov5s/yolov5sprj --pack-nbg-unify --optimize "VIP9000PICO_PID0XEE" --viv-sdk ${VIV_SDK}
```

Важно помнить, что после третьего шага необходимо изменить параметры mean и scale в файле input yml на параметры, соответствующие фактическому обучению сети. Для yolov5s параметр scale необходимо изменить на 0.0039.

![image-20221208110132347](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110132347.png)

<center>Рисунок 2-2: scale</center>

В конце получены золотые данные тензора выходного слоя:

```
iter_0_attach_Concat_Concat_303_out0_0_out0_1_25200_85.tensor
```

![image-20221208110156068](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110156068.png)

<center>Рисунок 2-3: tensor</center>

### 2.4 Развертывание со смешанной квантизацией

Первые два шага одинаковые:

```
pegasus.py import onnx --model yolov5s.onnx --output-data yolov5s.data --output-model yolov5s.json

pegasus.py generate inputmeta --model yolov5s.json --input-meta-output yolov5s-inputmeta.yml

pegasus.py generate postprocess-file --model yolov5s.json --postprocess-file-output yolov5s-postprocess-file.yml
```

Затем измените коэффициенты нормализации, среднее значение и дисперсию (scale).

![image-20221208110441010](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110441010.png)

<center>Рисунок 2-4: normallize</center>

#### 2.4.1 Квантизация PCQ+int8

```
pegasus.py quantize --model yolov5s.json --model-data yolov5s.data --batch-size 1 --device CPU --with-input-meta yolov5s-inputmeta.yml --rebuild --model-quantize yolov5s.quantize --quantizer perchannel_symmetric_affine --qtype int8
```

На этом шаге получен файл таблицы квантизации yolov5s.quantize.

```
pegasus.py quantize --model yolov5s.json --model-data yolov5s.data --device CPU --withinput-meta yolov5s-inputmeta.yml --hybrid --model-quantize yolov5s.quantize --quantizer perchannel_symmetric_affine --qtype int8
```

![image-20221208110532874](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110532874.png)

<center>Рисунок 2-5: quantilize</center>

Основной причиной проблемы точности YOLOV5S является то, что часть постпроцесса также включена в сетевое выполнение. Постпроцесс не очень подходит для квантизации и имеет большие потери точности, как показано на рисунке ниже:

![image-20221208110559683](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110559683.png)

<center>Рисунок 2-6: output</center>

Слои ниже permute относятся к части постпроцесса, эта часть имеет особенно большие потери точности при квантизации и требует смешанной квантизации.

#### 2.4.2 Смешанная квантизация

Отредактируйте файл yolov5s.quantilize по умолчанию, добавив слои ниже permute, которые требуют смешанной квантизации, для выполнения квантизации int16.

```
customized_quantize_layers:
Sigmoid_Sigmoid_202_21: dynamic_fixed_point-i16
Initializer_342_62: dynamic_fixed_point-i16
Slice_Slice_207_61: dynamic_fixed_point-i16
Initializer_344_48: dynamic_fixed_point-i16
Mul_Mul_209_47: dynamic_fixed_point-i16
Sub_Sub_211_32: dynamic_fixed_point-i16
Initializer_346_33: dynamic_fixed_point-i16
Add_Add_213_17: dynamic_fixed_point-i16
Mul_Mul_215_8: dynamic_fixed_point-i16
Initializer_348_18: dynamic_fixed_point-i16
Slice_Slice_220_49: dynamic_fixed_point-i16
Initializer_355_50: dynamic_fixed_point-i16
Mul_Mul_222_34: dynamic_fixed_point-i16
Initializer_460_20: dynamic_fixed_point-i16
Pow_Pow_223_19: dynamic_fixed_point-i16
Mul_Mul_224_9: dynamic_fixed_point-i16
Concat_Concat_230_5: dynamic_fixed_point-i16
Slice_Slice_229_10: dynamic_fixed_point-i16
Reshape_Reshape_232_2: dynamic_fixed_point-i16
Sigmoid_Sigmoid_237_26: dynamic_fixed_point-i16
Initializer_385_66: dynamic_fixed_point-i16
Slice_Slice_242_65: dynamic_fixed_point-i16
Mul_Mul_244_52: dynamic_fixed_point-i16
Initializer_387_53: dynamic_fixed_point-i16
Sub_Sub_246_37: dynamic_fixed_point-i16
Add_Add_248_22: dynamic_fixed_point-i16
Initializer_389_38: dynamic_fixed_point-i16
Mul_Mul_250_11: dynamic_fixed_point-i16
Initializer_391_23: dynamic_fixed_point-i16
Initializer_461_35: dynamic_fixed_point-i16
Initializer_398_55: dynamic_fixed_point-i16
Slice_Slice_255_54: dynamic_fixed_point-i16
Mul_Mul_257_39: dynamic_fixed_point-i16
Pow_Pow_258_24: dynamic_fixed_point-i16
Mul_Mul_259_12: dynamic_fixed_point-i16
Initializer_464_25: dynamic_fixed_point-i16
Slice_Slice_264_13: dynamic_fixed_point-i16
Concat_Concat_265_6: dynamic_fixed_point-i16
Reshape_Reshape_267_3: dynamic_fixed_point-i16
Concat_Concat_303_1: dynamic_fixed_point-i16
attach_Concat_Concat_303/out0_0: dynamic_fixed_point-i16
Sigmoid_Sigmoid_272_31: dynamic_fixed_point-i16
Initializer_428_70: dynamic_fixed_point-i16
Slice_Slice_277_69: dynamic_fixed_point-i16
Mul_Mul_279_57: dynamic_fixed_point-i16
Initializer_430_58: dynamic_fixed_point-i16
Sub_Sub_281_42: dynamic_fixed_point-i16
Initializer_432_43: dynamic_fixed_point-i16
Add_Add_283_27: dynamic_fixed_point-i16
Mul_Mul_285_14: dynamic_fixed_point-i16
Initializer_434_28: dynamic_fixed_point-i16
Initializer_441_45: dynamic_fixed_point-i16
Slice_Slice_290_59: dynamic_fixed_point-i16
Mul_Mul_292_44: dynamic_fixed_point-i16
Initializer_468_30: dynamic_fixed_point-i16
Mul_Mul_294_15: dynamic_fixed_point-i16
Slice_Slice_299_16: dynamic_fixed_point-i16
Concat_Concat_300_7: dynamic_fixed_point-i16
Reshape_Reshape_302_4: dynamic_fixed_point-i16
Pow_Pow_293_29: dynamic_fixed_point-i16
```

![image-20221208110656474](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110656474.png)

<center>Рисунок 2-7: mix</center>

![image-20221208110708470](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110708470.png)

<center>Рисунок 2-8: mix</center>

#### 2.4.3 Выполнение смешанной квантизации

```
pegasus.py quantize --model yolov5s.json --model-data yolov5s.data --device CPU --withinput-meta yolov5s-inputmeta.yml --hybrid --model-quantize yolov5s.quantize --quantizer perchannel_symmetric_affine --qtype int8
```

![image-20221208110746513](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110746513.png)

<center>Рисунок 2-9: hybrid</center>

![image-20221208110818811](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208110818811.png)

<center>Рисунок 2-10: изменение diff</center>

После выполнения вы можете видеть изменения в выводе квантованных слоёв.

### 2.5 Выведение

```
pegasus.py inference --model yolov5s.json --model-data yolov5s.data --batch-size 1 --dtype quantized --model-quantize yolov5s.quantize --device CPU --with-input-meta yolov5sinputmeta.yml --postprocess-file yolov5s-postprocess-file.yml
```

### 2.6 Экспорт модели

```
pegasus.py export ovxlib --model yolov5s.quantize.json --model-data yolov5s.data --dtype quantized --model-quantize yolov5s.quantize --batch-size 1 --save-fused-graph --targetide-project 'linux64' --with-input-meta yolov5s-inputmeta.yml --postprocess-file yolov5s-postprocess-file.yml --output-path ovxlib/yolov5s/yolov5sprj --pack-nbg-unify --optimize "VIP9000PICO_PID0XEE" --viv-sdk ${VIV_SDK}
```

### 2.7 Сравнение сходства

Сравните косинусное сходство ранее сгенерированного золотого тензора и выходного тензора, полученного в это время:

```
python /home/caozilong/VeriSilicon/acuity-toolkit-whl-6.6.1/bin/tools/
compute_tensor_similarity.py ./iter_0_attach_Concat_Concat_303_out0_0_out0_1_25200_85.
tensor ../wendang/iter_0_attach_Concat_Concat_303_out0_0_out0_1_25200_85.tensor
```

![image-20221208111010297](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20221208111010297.png)

<center>Рисунок 2-11: изменение diff</center>

Видно, что косинусное сходство всё ещё очень высокое, достигает 0.999912. Процесс развертывания смешанной квантизации завершён.
