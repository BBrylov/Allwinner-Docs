# 8 ALSA

## 8.1 Концепции, связанные с аудио

Аудиосигнал — это непрерывно изменяющийся аналоговый сигнал. Однако компьютер может обрабатывать и записывать только двоичные цифровые сигналы. Аудиосигнал, полученный из естественного источника звука, должен быть преобразован в цифровой аудиосигнал, прежде чем его можно будет отправить в компьютер для дальнейшей обработки.

Цифровая аудиосистема реализует воспроизведение исходного звука, преобразуя звуковую волну в серию двоичных данных. Устройство, реализующее этот шаг, обычно называют аналого-цифровым преобразователем (A/D). Аналого-цифровой преобразователь производит дискретизацию звуковой волны десятки тысяч раз в секунду. Каждая точка дискретизации записывает состояние исходной аналоговой звуковой волны в определённый момент времени, обычно называемое образцом (sample). Количество образцов, взятых за одну секунду, называется частотой дискретизации (sampling frequency). Путём соединения серии непрерывных образцов вы можете описать фрагмент звука на компьютере. Для каждого образца в процессе дискретизации цифровая аудиосистема выделяет определённое количество бит для записи амплитуды звуковой волны, обычно называемой разрешением дискретизации или точностью дискретизации (sampling resolution/precision). Чем выше точность дискретизации, тем более тонким будет восстановленный звук.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image001.png)

Цифровое аудио включает много понятий. Для программистов, выполняющих аудиопрограммирование в Linux, наиболее важно понимание двух ключевых шагов цифровизации звука: дискретизации и квантования.

- Дискретизация — это чтение амплитуды звукового сигнала через определённый интервал времени. По сути, дискретизация — это цифровизация во времени.

- Квантование — это преобразование амплитуды звукового сигнала, полученного дискретизацией, в цифровое значение. По сути, квантование — это цифровизация амплитуды.

### 8.1.1 Частота дискретизации

Частота дискретизации — это количество раз в секунду, когда аналоговая звуковая волна подвергается цифровизации путём выборки амплитуды звука. Выбор частоты дискретизации должен следовать теории дискретизации Найквиста (Harry Nyquist): если определённый аналоговый сигнал дискретизируется, то максимальная частота сигнала, которая может быть восстановлена после дискретизации, составляет только половину частоты дискретизации. Или, другими словами, если частота дискретизации более чем в два раза превышает максимальную частоту входящего сигнала, исходный сигнал может быть восстановлен из серии образцов.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image002.png)

Как показано на рисунке выше, частота дискретизации 40 кГц может правильно захватить сигнал 20 кГц. Частота дискретизации 30 кГц при дискретизации сигнала 20 кГц приводит к смешанному сигналу.

Минимальная частота дискретизации, обычно используемая при восстановлении музыкальных сигналов, составляет 44,1 кГц. Во многих высокачественных системах используется частота дискретизации 48 кГц.

| Система      | Частота дискретизации |
| ------------ | --------------------- |
| Телефон      | 8000 Гц               |
| CD           | 44100 Гц              |
| Профессиональное аудио | 48000 Гц   |
| DVD аудио    | 96000 Гц              |

### 8.1.2 Разрядность квантования

Разрядность квантования — это цифровизация амплитуды аналогового аудиосигнала, она определяет динамический диапазон аудиосигнала после цифровизации. Обычно используются 8, 12 и 16 бит. Чем выше разрядность квантования, тем больше динамический диапазон сигнала, тем ближе цифровой аудиосигнал к исходному сигналу, но требуемое пространство хранения также больше.

Метод цифрового представления, обычно используемый в аудиоприложениях, называется импульсно-кодовой модуляцией (Pulse-Code-Modulated, PCM) сигнал. В этом методе представления каждый период дискретизации использует одно цифровое значение для кодирования амплитуды аналогового сигнала. Полученная цифровая волна — это серия приблизительных значений, полученных выборкой из входящей аналоговой волны. Поскольку все аналого-цифровые преобразователи имеют ограниченное разрешение, шум квантования, вносимый аналого-цифровым преобразователем, неизбежен в цифровой аудиосистеме.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image003.png)

## 8.2 Архитектура ALSA

ALSA полностью называется Advanced Linux Sound Architecture, что на русском языке означает Linux Advanced Sound Architecture. ALSA — стандартный интерфейсный программный модуль для поддержки аудиосистемы в версиях ядра Linux 2.6 и более поздних. Она состоит из библиотеки ALSA, драйверов ядра и соответствующих инструментов разработки и тестирования, обеспечивая лучшее управление аудиосистемой в Linux.

В этом подразделе будет представлена архитектура ALSA.

### 8.2.1 Введение в архитектуру ALSA

ALSA — это компонент ядра Linux, который предоставляет драйверы для звуковых карт в системе Linux. Она предоставляет специализированные функции библиотеки для упрощения написания соответствующих прикладных программ. По сравнению с интерфейсом программирования OSS, функции библиотеки ALSA удобнее в использовании.

Для прикладных программ ALSA, несомненно, лучший выбор, потому что она имеет более дружелюбный интерфейс программирования и полностью совместима с OSS.

Система ALSA включает семь подпроектов:

- Пакет драйверов alsa-driver
- Пакет разработки alsa-libs
- Пакет подключаемых модулей разработки alsa-libplugins
- Пакет инструментов управления настройками alsa-utils
- Инструмент уровня совместимости OSS интерфейса alsa-oss
- Пакет поддержки специальной прошивки аудио alsa-firmware
- Пакет дополнительных небольших программ обработки звука alsa-tools

Взаимодействие между драйверами звуковых карт ALSA и архитектурой пространства пользователя показано на следующем рисунке:

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image004.png)

## 8.3 Портирование библиотеки ALSA и инструментов

Портирование ALSA в основном заключается в портировании alsa-lib и alsa-utils.

- **alsa-lib**: функциональная библиотека пространства пользователя, инкапсулирует абстрактный интерфейс, предоставляемый драйвером, предоставляет API приложениям через файл libasound.so.

- **alsa-utils**: пакет практических инструментов, реализует воспроизведение аудио (aplay), запись (arecord) и другие инструменты путём вызова alsa-lib.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image005.png)

ALSA Util — это чистое приложение прикладного уровня, эквивалентное программе тестирования устройства ALSA. ALSA-Lib — это программа среднего уровня, поддерживающая интерфейс приложения. Приложения в ALSA-Util будут вызывать интерфейсы в ALSA-Lib для управления регистрами аудиокодека нашей микросхемы, а интерфейсы в lib зависят от кода драйвера нижнего уровня. Таким образом, порядок портирования программы ALSA заключается в последующем портировании Driver, Lib и Util.

### 8.3.1 Скачивание библиотеки ALSA

ALSA необходимо загрузить с официального веб-сайта http://www.alsa-project.org. alsa-lib и alsa-utils.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image006.png)

Как показано выше, версии, которые мы загружаем:

- alsa-lib-1.2.2.tar.bz2
- alsa-utils-1.2.2.tar.bz2

### 8.3.2 Компиляция ALSA Lib

ALSA Lib портирование не требует изменения исходного кода, просто нужно перекомпилировать код библиотеки для поддержки вашей платформы.

```c
tar -xvf alsa-lib-1.0.27.2.tar.bz2
cd alsa-lib-1.0.27.2
CC=arm-none-linux-gnueabi-gcc
./configure --host=arm-linux  --prefix=/home/m/3rd/alsa/install/
make
make install
```

В приведённой выше команде важные параметры конфигурации ./configure объясняются следующим образом:

- --host указывает компилятор. Здесь указан кросс-компилятор. Перед запуском этой команды конфигурации убедитесь, что компилятор можно запустить непосредственно в командной строке Shell.

- --prefix указывает путь установки скомпилированных файлов. Таким образом, при выполнении команды установки будут созданы каталоги lib и include в этом каталоге.

### 8.3.3 Компиляция ALSA Util

ALSA Util может генерировать исполняемые приложения для воспроизведения, записи, конфигурации аудио. Это очень полезно при тестировании кода драйвера. Процесс компиляции выглядит следующим образом:

```c
tar -xvf alsa-utils-1.0.27.2.tar.bz2
cd alsa-utils-1.0.27.2
CC=arm-none-linux-gnueabi-gcc
./configure --prefix=/home/m/3rd/alsa/install/ --host=arm-linux --with-alsa-inc-prefix=/home/m/3rd/alsa/install/include --with-alsa-prefix=/home/m/3rd/alsa/install/lib --disable-alsamixer --disable-xmlto --disable-nls
make
```

### 8.3.4 Портирование библиотеки и инструментов ALSA на встроенную платформу

Портирование библиотеки ALSA и инструментов тестирования заключается в размещении соответствующих файлов библиотеки и исполняемых файлов на целевой плате. Следующие файлы должны быть скопированы в соответствующие местоположения:

(1) Файлы библиотеки ALSA помещаются в /lib/.

(2) Файлы конфигурации помещаются в /usr/local/share, то же самое, что каталог, указанный во время компиляции.

(3) Исполняемые файлы тестовых приложений ALSA Util может создавать aplay, amixer, arecord, мы можем поместить эти исполняемые файлы в /usr/sbin.

(4) В каталоге ядра убедитесь, что в /dev/snd/ есть каталог, в этом каталоге находятся файлы устройств controlC0, pcmC0D0, /usr/sbintimer, timer. Если эти файлы устройств уже находятся в каталоге /dev, вы можете вручную скопировать их в каталог /snd.

В системе LINUX каждый файл устройства — это файл. Аудиоустройство также имеет файлы устройств, помещённые в каталог /dev/snd. Давайте рассмотрим эти файлы устройств:

```c
ls /dev/snd -l
crw-rw----+ 1 root audio 116,  2 5月  19 21:24 controlC0     используется для звуковой карты
crw-rw----+ 1 root audio 116,  4 6月   6 19:31 pcmC0D0c
crw-rw----+ 1 root audio 116,  3 6月  11 11:53 pcmC0D0p
crw-rw----+ 1 root audio 116, 33 5月  19 21:24 timer
```

(1) controlC0: файл устройства управления аудио, например выбор канала, микширование, управление микрофоном и т.д.;

(2) pcmC0D0c: устройство записи звуковой карты 0 устройства 0, c обозначает capter;

(3) pcmC0D0p: устройство воспроизведения звуковой карты 0 устройства 0, p обозначает play;

(4) timer: установка таймера.

## 8.4 Отладка ALSA

В этом подразделе основное внимание уделяется использованию инструмента tinyalsa. tinyalsa — это упрощённая версия alsa-lib. Она предоставляет основные интерфейсы pcm и control; нет слишком сложных операций или функций. Вы можете использовать интерфейсы по мере необходимости. tinyalsa-utils — это инструмент на основе tinyalsa. Ниже представлены несколько часто используемых инструментов.

### 8.4.1 amixer

По назначению аналогично amixer, используется для работы с микшером управления.

Метод использования:

- Часто используемые опции

| Опция       | Функция                      |
| ----------- | ---------------------------- |
| -D,--device | Указать устройство звуковой карты, по умолчанию используется card0 |

- Часто используемые команды

| Команда  | Функция                                    |
| -------- | ------------------------------------------ |
| controls | Список всех элементов управления указанной звуковой карты |
| contents | Список подробной информации обо всех элементах управления указанной звуковой карты |
| get      | Получить информацию об указанном элементе управления |
| set      | Установить значение указанного элемента управления |

Пример:

```c
Получить все имена элементов управления звуковой карты audiocodec
amixer -Dhw:audiocodec controls
Получить текущий уровень громкости аппаратного обеспечения
amixer -Dhw:audiocodec cget name='LINEOUT volume'
Установить текущий уровень громкости аппаратного обеспечения
amixer -Dhw:audiocodec cget name='LINEOUT volume' 25
```

### 8.4.2 aplay

aplay — это инструмент воспроизведения звуковой карты ALSA из командной строки, используемый для функции воспроизведения.

Метод использования:

| Опция             | Функция                                                      |
| ----------------- | ------------------------------------------------------------ |
| -D,--device       | Указать устройство звуковой карты, по умолчанию используется default |
| -l,--list-devices | Список всех текущих звуковых карт                           |
| -t,--file-type    | Указать формат файла воспроизведения, такой как voc, wav, raw, если не указан, заголовок файла будет прочитан и идентифицирован |
| -c,--channels     | Указать количество каналов                                   |
| -f,--format       | Указать формат дискретизации                                |
| -r,--rate         | Частота дискретизации                                        |
| -d,--duration     | Указать время воспроизведения                                |
| --period-size     | Указать период размер                                        |
| --buffer-size     | Указать размер буфера                                        |

Пример:

```c
aplay -Dhw:audiocodec /mnt/UDISK/test.wav
```

### 8.4.3 arecord

arecord — это инструмент записи звуковой карты ALSA из командной строки, используемый для функции записи.

Метод использования:

| Опция             | Функция                                                      |
| ----------------- | ------------------------------------------------------------ |
| -D,--device       | Указать устройство звуковой карты, по умолчанию используется default |
| -l,--list-devices | Список всех текущих звуковых карт                           |
| -t,--file-type    | Указать формат файла воспроизведения, такой как voc, wav, raw, если не указан, заголовок файла будет прочитан и идентифицирован |
| -c,--channels     | Указать количество каналов                                   |
| -f,--format       | Указать формат дискретизации                                |
| -r,--rate         | Частота дискретизации                                        |
| -d,--duration     | Указать время воспроизведения                                |
| --period-size     | Указать размер периода                                       |
| --buffer-size     | Указать размер буфера                                        |

Пример:

```c
Запись 5 сек, 2 канала, частота дискретизации 16000, точность дискретизации 16 бит, сохранение в формате wav
arecord -Dhw:audiocodec -f S16_LE -r 16000 -c 2 -d 5 /mnt/UDISK/test.wav
```

## 8.5 Описание часто используемых интерфейсов

С точки зрения кода отражены отношения взаимодействия между alsa-lib, alsa-driver и аппаратным обеспечением. Функция alsa-lib пользовательского уровня управляет файлами устройств /dev/snd/pcmC0D0p и т.д., созданными драйвером alsa, для доступа к уровню ядра. Драйвер уровня ядра alsa-driver затем получает доступ к микросхеме звуковой карты аппаратного обеспечения через ядро звука.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image007.png)

### 8.5.1 Интерфейс PCM

Для удобства работы, alsa-lib инкапсулирует соответствующие интерфейсы для реализации воспроизведения и записи через узлы pcmCXDXp/pcmCXDXc (/dev/snd/pcmCXDXx).

Основные затронутые интерфейсы:

| Имя функции                        | Объяснение |
| ---------------------------------- | ---------- |
| snd_pcm_open                       |            |
| snd_pcm_info                       |            |
| snd_pcm_hw_params_any              |            |
| snd_pcm_hw_params_set_access       |            |
| snd_pcm_hw_params_set_format       |            |
| snd_pcm_hw_params_set_channels     |            |
| snd_pcm_hw_params_set_rate_near    |            |
| snd_pcm_hw_params_set_buffer_size_near |            |
| snd_pcm_hw_params                  |            |
| snd_pcm_sw_params_current          |            |
| snd_pcm_sw_params                  |            |
| snd_pcm_readi                      |            |
| snd_pcm_writei                     |            |
| snd_pcm_close                      |            |

Для подробного описания интерфейса pcm, пожалуйста, обратитесь к:

https://www.alsa-project.org/alsa-doc/alsa-lib/pcm.html
https://www.alsa-project.org/alsa-doc/alsa-lib/group___p_c_m.html

## 8.6 Разработка программы управления громкостью на основе ALSA

### 8.6.1 Разработка программы

- Список файлов:

| Номер последовательности | Имя файла      | Описание              |
| ----------------------- | -------------- | -------------------- |
| 1                       | AlsaVolume.h   | Файл заголовка управления громкостью |
| 2                       | AlsaVolume.cpp | Программа управления громкостью |

- Проектирование функции члена:

| Номер последовательности | Имя функции      | Параметр        | Описание параметра | Описание функции |
| ----------------------- | -------------- | --------------- | -------- | -------------------- |
| 1                       | setMasterVolume  | long volume | Значение громкости | Установка громкости |
| 2                       | getCurrentVolume | Нет          | Нет       | Получить текущую громкость |
| 3                       | increaseVolume   | Нет          | Нет       | Функция интерфейса для уменьшения громкости в один шаг |
| 4                       | decreaseVolume   | Нет          | Нет       | Функция интерфейса для увеличения громкости в один шаг |

- Проектирование переменной члена:

| Номер последовательности | Имя переменной члена | Тип           | Описание                 |
| ----------------------- | -------------------- | ------------- | ----------------------- |
| 1                       | _VOLUMECHANGE        | const float   | Размер шага регулировки громкости |
| 2                       | handle               | snd_mixer_t*  | Mixer handle            |
| 3                       | element_handle       | snd_mixer_elem_t* | Mixer element handle |
| 4                       | minVolume            | long          | Минимальная громкость   |
| 5                       | maxVolume            | long          | Максимальная громкость  |

### 8.6.2 Определение класса AlsaVolume

```c
#pragma once
#include <alsa/asoundlib.h>
namespace rv1108_audio{
class AlsaVolume
{
  public:
    AlsaVolume();
    ~AlsaVolume();
    int setMasterVolume(long volume);
    long getCurrentVolume();
    long increaseVolume();
    long decreaseVolume();
  protected:
    const float _VOLUMECHANGE = 5;
  private:
    snd_mixer_t* handle = nullptr;
    snd_mixer_elem_t* element_handle = nullptr;
    long minVolume,maxVolume;
};
}// namespace rv1108_camera
```

### 8.6.3 Реализация функции члена класса AlsaVolume

- Конструктор класса AlsaVolume

```c
AlsaVolume::AlsaVolume()
{
    snd_mixer_selem_id_t* sid = NULL;
    const char* card = "default";
    const char* selem_name = "Playback";
    //1. Откройте устройство микшера
    auto res = snd_mixer_open(&handle, 0);

    //2. Подключить HCTL к открытому миксеру
    res = snd_mixer_attach(handle, card);

    //3. Зарегистрировать простой класс элемента микшера.
    snd_mixer_selem_register(handle, NULL, NULL);

    //4. Получить первый элемент, то есть Master
    snd_mixer_load(handle);

    //5. Выделить недействительный snd_mixer_selem_id_t с помощью стандартного alloca
    snd_mixer_selem_id_alloca(&sid);

    //6. Установить позицию ID элемента
    snd_mixer_selem_id_set_index(sid, 0);

    //7. Установить имя ID элемента
    snd_mixer_selem_id_set_name(sid, selem_name);

    //8. Найти элемент
    element_handle = snd_mixer_find_selem(handle, sid);

    res = snd_mixer_selem_get_playback_volume_range(element_handle,
                                                                           &minVolume,
                                                                           &maxVolume);
}
```

- Функция установки громкости

```c
int AlsaVolume::setMasterVolume(long volume)
{
    long alsaVolume = volume * (maxVolume - minVolume) / 100 ;

    if(snd_mixer_selem_set_playback_volume_all(element_handle, alsaVolume) < 0){
        if(handle)
        snd_mixer_close(handle);
        return -1;
    }

    return 0;
}
```

- Функция получения текущей громкости

```c
long AlsaVolume::getCurrentVolume()
{
    long alsaVolume;
    if(snd_mixer_selem_get_playback_volume(element_handle, SND_MIXER_SCHN_MONO, &alsaVolume) < 0){
        if(handle)
            snd_mixer_close(handle);
            return -1;
      }
    return (alsaVolume*100)/(maxVolume - minVolume);
}
```

- Функция уменьшения громкости на один шаг

```c
long AlsaVolume::decreaseVolume()
{
    long newVolume = 0;
    if (getCurrentVolume() >= 0 + _VOLUMECHANGE) // проверить, что мы не упадём ниже минимальной громкости
        newVolume = getCurrentVolume() - _VOLUMECHANGE;
    else
        newVolume = 0;
    setMasterVolume(newVolume);
    return newVolume;
}
```

- Функция увеличения громкости на один шаг

```c
long AlsaVolume::increaseVolume()
{
    long newVolume = 0;
    if (getCurrentVolume() <= 100 - _VOLUMECHANGE) // проверить, чтобы не превысить максимальную громкость
        newVolume = getCurrentVolume() + _VOLUMECHANGE;
    else
        newVolume = 100;
    setMasterVolume(newVolume);
    return newVolume;
}
```

## 8.7 Проектирование базового класса ALSA

### 8.7.1 Разработка программы

- Список файлов:

| Номер последовательности | Имя файла    | Описание              |
| ----------------------- | ------------ | -------------------- |
| 1                       | AlsaBase.h   | Файл заголовка базового класса ALSA |
| 2                       | AlsaBase.cpp | Программа реализации базового класса |

- Переменные открытого члена:

| Номер последовательности | Имя переменной члена | Тип              | Описание             |
| ----------------------- | ----------------------- | --------------------- | -------------------- |
| 1                       | rate                    | int               | Частота передачи     |
| 2                       | channels                | int               | Количество каналов   |
| 3                       | bits_per_frame          | mutable int       | Размер данных на кадр |
| 4                       | default_output_buffer_size | int         | Размер буфера вывода по умолчанию |
| 5                       | frames                  | snd_pcm_uframes_t | Количество кадров    |
| 6                       | buffer_size             | snd_pcm_uframes_t | Размер буфера        |
| 7                       | buffer_frames           | snd_pcm_uframes_t | Размер буфера        |
| 8                       | period_size             | snd_pcm_uframes_t | Размер периода       |
| 9                       | period_frames           | snd_pcm_uframes_t |                      |
| 10                      | period_time             | unsigned int      |                      |
| 11                      | buffer_time             | unsigned int      |                      |
| 12                      | bits_per_sample         | size_t            |                      |

- Переменные защищённого члена:

| Номер последовательности | Имя переменной члена | Тип                   | Описание |
| ----------------------- | ----------------------- | --------------------- | -------- |
| 1                       | device                  | const char *          |          |
| 2                       | handle                  | snd_pcm_t *           |          |
| 3                       | params                  | snd_pcm_hw_params_t * |          |
| 4                       | format                  | snd_pcm_format_t      |          |
| 5                       | access_type             | snd_pcm_access_t      |          |
| 6                       | DEVICE_OPENED           | bool                  |          |
| 7                       | PARAMS_SETED            | bool                  |          |

### 8.7.2 Реализация функции члена класса AlsaBase

- Конструктор класса AlsaBase

```c
AlsaBase::AlsaBase(const std::string &dev)
{
    device = dev.c_str();
    rate = 8000;
    channels = 2;
    format = SND_PCM_FORMAT_S16_LE;
    access_type = SND_PCM_ACCESS_RW_INTERLEAVED;
    frames = 480;

    DEVICE_OPENED = false;
    PARAMS_SETED = false;

    bits_per_sample = snd_pcm_format_physical_width(format);
    bits_per_frame = (bits_per_sample >> 3) * channels;

    default_output_buffer_size = frames * bits_per_frame / 8; // в байтах

    buffer_frames = frames * 8;
    buffer_time = 0;

    period_frames = buffer_frames / 4;
    period_time = 0;
}

AlsaBase::~AlsaBase()
{
    if (DEVICE_OPENED){
        if((err = snd_pcm_close(handle)) < 0){
            ;
        }else{
            ;
        }

    }
}

int AlsaBase::set_params()
{

    if (!DEVICE_OPENED)
        return -1;
    // Выделить пространство параметров аппаратного обеспечения
    snd_pcm_hw_params_alloca(&params);

    //1、 Заполнить параметры аппаратного обеспечения значениями по умолчанию
    if ((err = snd_pcm_hw_params_any(handle, params)) < 0) {
        return err;
    }

    //2、 Ограничить пространство конфигурации содержать только фактические скорости аппаратного обеспечения.
    if ((err = snd_pcm_hw_params_set_rate_resample(handle, params, 0)) < 0) {
        return err;
    }

    //3、 Установить метод доступа
    if ((err = snd_pcm_hw_params_set_access(handle, params, access_type)) < 0) {
        return err;
    }

    //4、 Установить формат, S16_LE и т.д.
    if ((err = snd_pcm_hw_params_set_format(handle, params, format)) < 0) {
        return err;
    }

    //5 Установить канал
    if ((err = snd_pcm_hw_params_set_channels(handle, params, channels)) < 0) {
        return err;
    }

    //6 Установить битовую скорость
    unsigned int rrate;
    rrate =rate;
    if ((err = snd_pcm_hw_params_set_rate_near(handle, params, &rrate, NULL)) < 0) 	   {
        return err;
    }
    //7
    if (buffer_time == 0 && buffer_frames == 0)
    {
        err = snd_pcm_hw_params_get_buffer_time_max(params, &buffer_time, 0);
        assert(err >= 0);
        if (buffer_time > 500000)
            buffer_time = 500000;
    }
    //8
    if (period_time == 0 && period_frames == 0)
    {
        if (buffer_time > 0)
        period_time = buffer_time / 4;
    else
        period_frames = buffer_frames / 4;
    }
    //9
    if (period_time > 0)
    {
        err = snd_pcm_hw_params_set_period_time_near(handle,
                                                     params,
                                                     &period_time,
                                                     0);
    }
    else
    {
        err = snd_pcm_hw_params_set_period_size_near(handle,
                                                     params,
                                                     &period_frames,
                                                     0);
    }
    assert(err >= 0);
    //10
    if (buffer_time > 0)
    {
        err = snd_pcm_hw_params_set_buffer_time_near(handle, params,
                                                     &buffer_time,
                                                     0);
    }
    else
    {
        err = snd_pcm_hw_params_set_buffer_size_near(handle, params,
                                                     &buffer_frames);
    }
    assert(err >= 0);

    // Запишите параметры в устройство
    if ((err = snd_pcm_hw_params(handle, params)) < 0)
    {
        return -1;
    }
    else
    {
        PARAMS_SETED = true;
    }
    snd_pcm_uframes_t t_buffer_frames;
    snd_pcm_hw_params_get_buffer_size(params, &t_buffer_frames);
    buffer_frames = t_buffer_frames;

    snd_pcm_uframes_t t_period_frames;
    snd_pcm_hw_params_get_period_size(params, &t_period_frames, 0);
    period_frames = t_period_frames;

    return 0;
}
```

## 8.8 Воспроизведение аудио на основе ALSA

### 8.8.1 Разработка программы

- Список файлов

| Номер последовательности | Имя файла           | Описание               |
| ----------------------- | -------------------- | ---------------------- |
| 1                       | AlsaPlayback.h       | Файл заголовка управления воспроизведением аудио |
| 2                       | AlsaPlayback.cpp     | Программа воспроизведения аудио |

- Проектирование функции члена

| Номер последовательности | Имя функции | Параметр                                            | Описание параметра | Описание функции |
| ----------------------- | ----------- | --------------------------------------------------- | ----------- | ----------- |
| 1                       | playback    | const char *input_buffer <br/> const long input_buffer_size |          | Воспроизведение аудио |

### 8.1.2 Определение класса AlsaPlay

```c
#pragma once
#include "AlsaBase.h"
namespace rv1108_audio{

class AlsaPlayback : public AlsaBase
{
    public:
    AlsaPlayback(const std::string &dev);
    ~AlsaPlayback();

    int open_device();
    int playback(const char *input_buffer, const long input_buffer_size) const;
    private:
    int err;
};
}
```

### 8.1.3 Реализация функции члена класса AlsaPlayback

- Конструктор класса AlsaPlayback

```c
AlsaPlayback::AlsaPlayback(const std::string &dev) : AlsaBase(dev)
{
    if (!DEVICE_OPENED)
        open_device();
}
```

```c
int AlsaPlayback::open_device()
{
    if(snd_pcm_open(&handle,
                    device,
                    SND_PCM_STREAM_PLAYBACK,
                    0) < 0)
    {
        DEVICE_OPENED = false;
    }
    else
    {
        DEVICE_OPENED = true;
    }
    return 0;
}
```

- Реализация функции playback

```c
int AlsaPlayback::playback(const char *_input_buffer, const long input_buffer_size) const
{
    int res = -1;
    char *input_buffer = const_cast<char *>(_input_buffer);
    long r = input_buffer_size / bits_per_frame * 8;
    AUDIO_DEV_LOCK;
    while (r > 0)
    {
        snd_pcm_wait(handle, 100);
        do
        {
            res = snd_pcm_writei(handle, input_buffer, frames);
            if (res == -EPIPE){
                AUDIO_DEV_UNLOCK;
                snd_pcm_prepare(handle);
                continue;
            }
        }while (res < 0);
        r -= err;
        input_buffer += res * bits_per_frame / 8;
    }
    return 0;
}
```

## 8.9 Запись аудио на основе ALSA

### 8.9.1 Разработка программы

- Список файлов

| Номер последовательности | Имя файла        | Описание           |
| ----------------------- | --------------- | -------------------|
| 1                       | AlsaCapture.h   | Файл заголовка записи аудио |
| 2                       | AlsaCapture.cpp | Программа записи аудио |

- Проектирование функции члена

| Номер последовательности | Имя функции | Параметр | Описание параметра | Описание функции |
| ----------------------- | --------- | -------- | ----------- | ----------- |
| 1                       | capture   | Нет      |          | Запись аудио |

- Проектирование переменной члена

| Номер последовательности | Имя переменной члена | Тип            | Описание                 |
| ----------------------- | -------------------- | -------------- | ----------------------- |
| 1                       | _VOLUMECHANGE        | const float    | Размер шага регулировки громкости |
| 2                       | handle               | snd_mixer_t*   | Mixer handle            |
| 3                       | element_handle       | snd_mixer_elem_t* | Mixer element handle |
| 4                       | minVolume            | long           | Минимальная громкость   |
| 5                       | maxVolume            | long           | Максимальная громкость  |

### 8.9.2 Определение класса AlsaPlay

```c
#pragma once
#include "AlsaBase.h"
namespace rv1108_audio{

class AlsaCapture : public AlsaBase
{
  public:
    // Буфер данных выхода
    char *output_buffer;
    // Размер буфера выхода
    unsigned int output_buffer_size;
    // int frames_to_read;
    // Используется для возврата количества прочитанных кадров
    int frames_readed;

    AlsaCapture(const std::string &dev);
    ~AlsaCapture();
    int open_device();
    int capture();
  private:
    int err;
};

}
```

### 8.9.3 Реализация функции члена класса AlsaCapture

- Конструктор класса AlsaCapture

```c
AlsaCapture::AlsaCapture(const std::string &dev) : AlsaBase(dev)
{
    if (!DEVICE_OPENED)
        open_device();
    if (!PARAMS_SETED)
        set_params();

    output_buffer_size = default_output_buffer_size;
    output_buffer = (char *)calloc(output_buffer_size, sizeof(char));
}
```

```c
int AlsaCapture::open_device()
{
    if ((err = snd_pcm_open(&handle,
                            device,
                            SND_PCM_STREAM_CAPTURE,
                            0)) < 0)
    {
        DEVICE_OPENED = false;
        return -1;
    }
    else
    {
        DEVICE_OPENED = true;
    }

    return 0;
}
```

- Конструктор класса AlsaCapture

```c
int AlsaCapture::capture()
{
    while (1)
    {
        int err;

        if ((frames_readed = snd_pcm_readi(handle, output_buffer, frames)) < 0)
        {
            // Произошла переполнение
            if (frames_readed == -EPIPE)
            {
                snd_pcm_prepare(handle);
                continue;
            }
            return -1;
        }
        else
        {
            return frames_readed;
        }
    }
}
```
