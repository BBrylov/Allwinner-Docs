# Конфигурация набора инструментов NPU

## 0. Предисловие

NPU использует модели специального формата, которые невозможно прямо импортировать из обученной нейронной сети в NPU для вычисления. Таким образом, необходимо преобразовать модель из формата, полученного при обучении сети, в формат модели NPU.

![img](https://v853.docs.aw-ol.com/assets/img/dev_npu/image-20220712112951142.png)

Процесс развертывания модели в системе NPU обычно включает четыре этапа:

[![image-20220712110126757](https://v853.docs.aw-ol.com/assets/img/dev_npu/image-20220712110126757.png)](https://v853.docs.aw-ol.com/assets/img/dev_npu/image-20220712110126757.png)

V853 поддерживает следующие популярные модели фреймворков глубокого обучения:

- TensorFlow
- Caffe
- TFLite
- Keras
- Pytorch
- Onnx NN
- Darknet

В этой статье описывается установка и использование инструментов преобразования моделей для NPU. В этой статье в основном используется инструмент `Verisilicon Tool Acuity Toolkit`, предназначенный для преобразования моделей. Этот инструмент в настоящее время поддерживает только Linux дистрибутивы Ubuntu 20.04.

Ссылка для скачивания: https://netstorage.allwinnertech.com:5001/sharing/ZIruS49kj

Руководство по использованию инструмента моделирования:

## 1. Конфигурация окружения инструмента преобразования моделей

Скачайте образ виртуальной машины: https://www.linuxvmimages.com/images/ubuntu-2004/

![image-20230510181541648](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230510181541648.png)

После скачивания распакуйте файл. После распаковки используйте программу VMware для открытия файла `Ubuntu_20.04.4_VM_LinuxVMImages.COM.vmx`.

![image-20230510190806827](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230510190806827.png)

Дождитесь открытия виртуальной машины Ubuntu 20.04. После открытия скачайте необходимые зависимости.

```
sudo apt install -y python3 python3-dev python3-pip build-essential
```

## 2. Установка инструмента моделирования

Примечание перед установкой: личные разработчики могут быть не в состоянии подать заявку на `Лицензию` для использования всех функций. Нам нужна только функция преобразования моделей, которая не требует подачи заявки на `Лицензию`.

Скопируйте скачанный `Verisilicon_Tool_VivanteIDE` в любую директорию на виртуальной машине. Предположим, что имя файла после скачивания - `V853 NPU Toolkits.zip`. Распакуйте этот файл на компьютере Windows, а затем перейдите в директорию `V853 NPU Toolkits\NPU` и скопируйте файл `Verisilicon_Tool_VivanteIDE_v5.7.0_CL470666_Linux_Windows_SDK_p6.4.x_dev_6.4.10_22Q1_CL473325A_20220425.tar`, показанный ниже, в Ubuntu 20.04.

![image-20230511102613439](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511102613439.png)

Скопируйте в директорию виртуальной машины, как показано ниже:

![image-20230511102942773](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511102942773.png)

В директории архива распакуйте файл архива, введя

```
ubuntu@ubuntu2004:~$ tar xvf Verisilicon_Tool_VivanteIDE_v5.7.0_CL470666_Linux_Windows_SDK_p6.4.x_dev_6.4.10_22Q1_CL473325A_20220425.tar
```

![image-20230511103317254](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511103317254.png)

После распаковки в текущей директории будут распакованы следующие файлы

```
├── doc
│   ├── Vivante.IDE.Release.Notes.pdf
│   └── Vivante_IDE_User_Guide.pdf
├── Vivante_IDE-5.7.0_CL470666-Linux-x86_64-04-24-2022-18.55.31-plus-W-p6.4.x_dev_6.4.10_22Q1_CL473325A-Install
└── Vivante_IDE-5.7.0_CL470666-Win32-x86_64-04-24-2022-18.36.02-plus-W-p6.4.x_dev_6.4.10_22Q1_CL473325A-Setup.exe
```

В директории `doc/` содержатся:

Примечания к выпуску IDE инструмента моделирования `Vivante.IDE.Release.Notes.pdf`

Руководство пользователя инструмента моделирования `Vivante_IDE_User_Guide.pdf`

В текущей директории находятся:

Пакет инструмента моделирования для Linux:

`Vivante_IDE-5.7.0_CL470666-Linux-x86_64-04-24-2022-18.55.31-plus-W-p6.4.x_dev_6.4.10_22Q1_CL473325A-Install`

Пакет инструмента моделирования для Windows:

`Vivante_IDE-5.7.0_CL470666-Win32-x86_64-04-24-2022-18.36.02-plus-W-p6.4.x_dev_6.4.10_22Q1_CL473325A-Setup.exe`

Так как мы устанавливаем инструмент моделирования в среде Linux в Ubuntu, нам нужно использовать пакет инструмента моделирования для Linux, введите

```
ubuntu@ubuntu2004:~$ ./Vivante_IDE-5.7.0_CL470666-Linux-x86_64-04-24-2022-18.55.31-plus-W-p6.4.x_dev_6.4.10_22Q1_CL473325A-Install
```

![image-20230511104911709](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511104911709.png)

После выполнения появится диалоговое окно, нажмите `Да`

![image-20230511105020389](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105020389.png)

Нажмите `Далее`

![image-20230511105159542](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105159542.png)

Прочитайте лицензионное соглашение, примите его и нажмите `Далее`

![image-20230511105314275](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105314275.png)

Вы можете указать пользовательский путь установки. Здесь я использую путь установки по умолчанию.

![image-20230511105509716](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105509716.png)

Выберите файл лицензии `License`. Если у вас нет файла лицензии, нажмите Далее, чтобы пропустить. Позже вы можете добавить его в IDE. Корпоративные клиенты могут получить `License` согласно последующим инструкциям. Персональные разработчики могут использовать функцию преобразования моделей без подачи заявки на `License`.

![image-20230511105553859](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105553859.png)

Нажмите `Далее`

![image-20230511105822651](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105822651.png)

Дождитесь завершения установки

![image-20230511105848028](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105848028.png)

После завершения установки нажмите `Завершить`

![image-20230511105938428](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511105938428.png)

После вышеуказанных шагов инструмент моделирования IDE установлен. Мы можем перейти в директорию `VeriSilicon/VivanteIDE5.7.0/ide/`

```
ubuntu@ubuntu2004:~$ cd VeriSilicon/VivanteIDE5.7.0/ide/
ubuntu@ubuntu2004:~/VeriSilicon/VivanteIDE5.7.0/ide$ ls
3ds          about.html  artifacts.xml  epl-v10.html  history.txt  libcairo-swt.so  p2       readme     setenv-vivanteide5.7.0     VivanteIDE       VivanteIDE.ini
about_files  acuityc     configuration  features      icon.xpm     notice.html      plugins  resources  uninstall-vivanteide5.7.0  vivanteide5.7.0
```

`vivanteide5.7.0` в этой директории - это приложение IDE инструмента моделирования. Используйте следующую команду для запуска приложения

```
ubuntu@ubuntu2004:~/VeriSilicon/VivanteIDE5.7.0/ide$ ./vivanteide5.7.0
```

После запуска потребуется создать рабочую область. Здесь я использую конфигурацию по умолчанию и нажимаю OK.

![image-20230511110543268](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511110543268.png)

После завершения конфигурации IDE инструмента, приложение откроется, и потребуется ввести `License`.

![image-20230511110700031](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511110700031.png)

Если вы персональный разработчик, вы можете просто закрыть приложение, и последующая разработка может нормально продолжаться без этого инструмента моделирования.

Если вы корпоративный клиент, вы можете перейти на официальный сайт VeriSilicon, заполнить информацию компании и получить `License`.

Адрес для подачи заявки на License: https://www.verisilicon.com/cn/VIPAcuityIDELicenseRequest

Примечание: при подаче заявки на `License` необходимо использовать корпоративную почту, а не личную почту.

## 2. Установка инструмента преобразования моделей

### 2.1 Конфигурация окружения

Скопируйте скачанный `Verisilicon Tool Acuity Toolkit` в любую директорию на виртуальной машине. Предположим, что имя файла после скачивания - `V853 NPU Toolkits.zip`. Распакуйте этот файл на компьютере Windows, затем перейдите в директорию `V853 NPU Toolkits\NPU` и скопируйте файл `Vivante_acuity_toolkit_binary_6.6.1_20220329_ubuntu20.04.tgz`, показанный ниже, в Ubuntu 20.04.

![image-20230511101434413](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511101434413.png)

Скопируйте в директорию виртуальной машины, как показано ниже:

![image-20230511103013759](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511103013759.png)

После копирования распакуйте пакет инструментов, введя

```
ubuntu@ubuntu2004:~$ tar xvf Vivante_acuity_toolkit_binary_6.6.1_20220329_ubuntu20.04.tgz
```

Дождитесь завершения распаковки. После распаковки в текущей директории будет создана папка `acuity-toolkit-binary-6.6.1`

![image-20230511111416848](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511111416848.png)

Скопируйте эту папку в директорию IDE моделирования

```
ubuntu@ubuntu2004:~$ mv acuity-toolkit-binary-6.6.1 /home/ubuntu/VeriSilicon/
```

Примечание: путь `/home/ubuntu/VeriSilicon/` нужно заменить на путь установки вашего IDE.

Перейдите в папку `acuity-toolkit-binary-6.6.1`

```
ubuntu@ubuntu2004:~$ cd VeriSilicon/acuity-toolkit-binary-6.6.1/
ubuntu@ubuntu2004:~/VeriSilicon/acuity-toolkit-binary-6.6.1$ ls
bin  build_linux.sh  COPYRIGHTS  lenet  LICENSE  README.md  requirements.txt
```

Так как преобразование модели требует установки дополнительных пакетов, необходимые пакеты указаны в файле `requirements.txt`, поэтому введите

```
ubuntu@ubuntu2004:~/VeriSilicon/acuity-toolkit-binary-6.6.1$ pip install -r requirements.txt
```

Дождитесь завершения скачивания. Так как источник PIP по умолчанию скачивает медленно, рекомендуется изменить источник перед скачиванием пакета. Например, переключиться на зеркало Tsinghua:

```
ubuntu@ubuntu2004:~/VeriSilicon/acuity-toolkit-binary-6.6.1$ pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple/
Writing to /home/ubuntu/.config/pip/pip.conf
ubuntu@ubuntu2004:~/VeriSilicon/acuity-toolkit-binary-6.6.1$ pip install -r requirements.txt
```

![image-20230511115249711](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511115249711.png)

**Часто задаваемые вопросы:**

Обратите внимание, если во время установки появляется сообщение об ошибке:

```
RROR: launchpadlib 1.10.13 requires testresources, which is not installed.
```

![image-20230511115732023](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511115732023.png)

Нужно вручную установить `launchpadlib`

```
ubuntu@ubuntu2004:~/VeriSilicon/acuity-toolkit-binary-6.6.1$ pip install launchpadlib
```

После завершения установки повторно выполните `pip install -r requirements.txt`.

### 2.2 Конфигурация пути

Конфигурируйте путь так, чтобы вы могли использовать инструмент в любой директории. Здесь предоставляются 2 способа конфигурации.

(1) Конфигурация с помощью команды

В домашней директории перейдите в путь установки IDE моделирования `VeriSilicon`.

```
ubuntu@ubuntu2004:~$ cd VeriSilicon/
ubuntu@ubuntu2004:~/VeriSilicon$ pwd
/home/ubuntu/VeriSilicon
```

Выполните следующую команду для одноразовой настройки.

```
export ACTU_BASE=$(ls | grep acu*) && \
    export ACTU_IDE_BASE=$(ls | grep *IDE*) && \
    echo -e "ACUITY_TOOLS_METHOD='$PWD/$ACTU_BASE'\nexport ACUITY_PATH='$PWD/$ACTU_BASE/bin/'\nexport VIV_SDK='$PWD/$ACTU_IDE_BASE/cmdtools'\nexport PATH=$PATH:$PWD/$ACTU_BASE/bin/:$PWD/$ACTU_IDE_BASE/ide/\nexport pegasus=$PWD/$ACTU_BASE/bin/pegasus\nalias pegasus=$PWD/$ACTU_BASE/bin/pegasus" >> ~/.bashrc && \
    source ~/.bashrc
```

(2) Ручная конфигурация

Отредактируйте вручную `~/.bashrc`, конфигурируя следующее содержимое. Введите в терминале:

```
vi ~/.bashrc
```

В конце файла добавьте

`/home/ubuntu/VeriSilicon/` измените на ваш путь установки.

```
ACUITY_TOOLS_METHOD='/home/ubuntu/VeriSilicon/acuity-toolkit-binary-6.6.1'
export ACUITY_PATH='/home/ubuntu/VeriSilicon/acuity-toolkit-binary-6.6.1/bin/'
export VIV_SDK='/home/ubuntu/VeriSilicon/VivanteIDE5.7.0/cmdtools'
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/ubuntu/VeriSilicon/acuity-toolkit-binary-6.6.1/bin/:/home/ubuntu/VeriSilicon/VivanteIDE5.7.0/ide/
export pegasus=/home/ubuntu/VeriSilicon/acuity-toolkit-binary-6.6.1/bin/pegasus
alias pegasus=/home/ubuntu/VeriSilicon/acuity-toolkit-binary-6.6.1/bin/pegasus
```

После конфигурации `.bashrc` выглядит так

![image-20230511131910396](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511131910396.png)

После завершения конфигурации сохраните и выйдите из интерфейса конфигурации. В терминале введите `source ~/.bashrc`, чтобы активировать файл конфигурации.

```
ubuntu@ubuntu2004:~$ source ~/.bashrc
```

На этом установка инструмента преобразования моделей завершена. Введите команду `pegasus help` для тестирования работоспособности инструмента.

![image-20230511132344888](http://photos.100ask.net/allwinner-docs/v853/AIApplication/image-20230511132344888.png)
