# ALSA

## 8.1 Концепции, связанные с аудио

Аудиосигнал — это непрерывно изменяющийся аналоговый сигнал. Однако компьютер может обрабатывать и записывать только двоичные цифровые сигналы. Аудиосигнал, полученный от естественного источника звука, должен пройти определённое преобразование, чтобы стать цифровым аудиосигналом, прежде чем его можно будет отправить в компьютер для дальнейшей обработки.

Цифровая аудиосистема воссоздаёт исходный звук путём преобразования звуковой волны в серию двоичных данных. Устройство, реализующее этот процесс, обычно называется (A/D) преобразователем. Преобразователь A/D производит выборку звуковой волны десятки тысяч раз в секунду. Каждая точка выборки регистрирует состояние исходной аналоговой звуковой волны в определённый момент времени, обычно называемое образцом (sample). Количество образцов, снимаемых за одну секунду, называется частотой дискретизации (частотой выборки). Путём соединения серии последовательных образцов можно описать звук в компьютере. Для каждого образца в процессе выборки цифровая аудиосистема выделяет определённое количество битов хранения для записи амплитуды звуковой волны, обычно называемое разрешением выборки или точностью выборки. Чем выше точность выборки, тем более детально звук может быть восстановлен.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image001.png)

Цифровой звук включает в себя множество концепций. Для программистов, работающих с аудио под Linux, наиболее важны два ключевых процесса цифрализации звука: дискретизация и квантование.

- Дискретизация — это чтение амплитуды звукового сигнала через определённые промежутки времени. По сути, дискретизация — это цифрализация во времени.

- Квантование — это преобразование амплитуды звукового сигнала, полученной дискретизацией, в цифровое значение. По сути, квантование — это цифрализация по амплитуде.

### 8.1.1 Частота дискретизации

Частота дискретизации — это количество выборок амплитуды звуковой волны, снимаемых в секунду при цифрализации аналоговой звуковой волны. Выбор частоты дискретизации должен соответствовать теории выборки Найквиста (Harry Nyquist): если произвести выборку некоторого аналогового сигнала, то максимальная частота сигнала, которая может быть восстановлена после выборки, составляет только половину частоты выборки. Иными словами, если частота выборки выше, чем удвоенная максимальная частота входного сигнала, исходный сигнал может быть восстановлен из серии выбранных образцов.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image002.png)

Как показано на рисунке выше, использование частоты 40 кГц для выборки сигнала 20 кГц может правильно захватить исходный сигнал. Использование частоты 30 кГц для выборки сигнала 20 кГц приведёт к путанице в сигналах.

Минимальная частота выборки, обычно используемая при восстановлении музыкального сигнала, составляет 44,1 кГц. Во многих высокачественных системах используется частота выборки 48 кГц.

| Система | Частота дискретизации |
| -------- | -------- |
| Телефон     | 8000 Гц   |
| CD       | 44100 Гц  |
| Профессиональное аудио | 48000 Гц  |
| Аудио DVD  | 96000 Гц  |

### 8.1.2 Количество битов квантования

Количество битов квантования — это цифрализация амплитуды аналогового аудиосигнала. Оно определяет динамический диапазон аналогового сигнала после цифрализации. Обычно используются 8 бит, 12 бит и 16 бит. Чем выше количество битов квантования, тем больше динамический диапазон сигнала, и цифрализованный аудиосигнал будет ближе к исходному сигналу, но требуемое пространство для хранения также больше.

Обычно используемый метод цифрового представления в аудиоприложениях — это импульсно-кодовая модуляция (Pulse-Code-Modulated, PCM). При таком методе представления каждый цикл выборки кодирует амплитуду аналогового сигнала одним цифровым уровнем. Полученная цифровая волна состоит из значений, выбранных из входной аналоговой волны. Поскольку разрешение всех преобразователей A/D ограничено, шум квантования, вносимый преобразователем A/D в цифровую аудиосистему, неизбежен.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image003.png)

## 8.2 Архитектура ALSA

ALSA расшифровывается как Advanced Linux Sound Architecture, что в переводе означает "продвинутая архитектура звука Linux". ALSA — это стандартный интерфейс программы поддержки аудиосистемы в версиях ядра Linux 2.6 и более поздних. ALSA состоит из библиотеки ALSA, драйверов ядра и соответствующих инструментов тестирования и разработки, обеспечивая лучшее управление аудиосистемой в Linux.

В этом разделе будет представлена архитектура ALSA.

### 8.2.1 Введение в архитектуру ALSA

ALSA — это компонент ядра в системе Linux, который предоставляет драйверы для звуковых карт. Она предоставляет специальные функции библиотеки для упрощения написания соответствующих прикладных программ. По сравнению с интерфейсом программирования OSS, библиотека функций ALSA более удобна в использовании.

Для прикладных программ ALSA несомненно является лучшим выбором, так как она имеет более удобный интерфейс программирования и полностью совместима с OSS.

Система ALSA включает 7 подпроектов:

- Пакет драйверов alsa-driver
- Пакет разработки alsa-libs
- Пакет разработки плагинов alsa-libplugins
- Пакет инструментов управления параметрами alsa-utils
- Инструмент имитационного слоя совместимости интерфейса OSS alsa-oss
- Пакет поддержки специальной прошивки для аудио alsa-finnware
- Пакет прочих служебных программ обработки звука alsa-tools

Взаимодействие архитектуры пользовательского пространства с драйвером звуковой карты ALSA показано на рисунке ниже:

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image004.png)

## 8.3 Портирование библиотеки ALSA и инструментов

Портирование ALSA в основном предполагает портирование alsa-lib и alsa-utils.

- **alsa-lib**: функциональная библиотека пользовательского пространства, инкапсулирующая абстрактный интерфейс, предоставленный драйвером, предоставляет API приложениям через файл libasound.so.

- **alsa-utils**: пакет практических инструментов, реализующих воспроизведение аудио (aplay), запись (arecord) и другие инструменты путём вызова alsa-lib.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image005.png)

ALSA Util — это чистое прикладное программное обеспечение, функционирующее как программа тестирования устройства ALSA. ALSA-Lib — это промежуточное программное обеспечение, поддерживающее API приложений. Приложение в ALSA-Util будет вызывать интерфейсы в ALSA-Lib для управления регистрами микросхемы аудиокодека. Интерфейсы в lib зависят от кода драйвера на самом нижнем уровне. Следовательно, порядок портирования программы ALSA — сначала portировать Driver, затем Lib, затем Util.

### 8.3.1 Загрузка библиотеки ALSA

ALSA необходимо скачать с официального веб-сайта ALSA (http://www.alsa-project.org), загрузив alsa-lib и alsa-utils.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image006.png)

Как показано на рисунке выше, загруженные версии:

- alsa-lib-1.2.2.tar.bz2
- alsa-utils-1.2.2.tar.bz2

### 8.3.2 Компиляция библиотеки ALSA

При портировании ALSA Lib не требуется изменять исходный код, нужно только перекомпилировать код библиотеки для поддержки собственной платформы.

```c
tar -xvf alsa-lib-1.0.27.2.tar.bz2
cd alsa-lib-1.0.27.2
CC=arm-none-linux-gnueabi-gcc
./configure --host=arm-linux  --prefix=/home/m/3rd/alsa/install/
make
make install
```

В приведённой выше команде несколько важных параметров конфигурации ./configure объясняются следующим образом:

- --host указывает компилятор. Здесь указывается кросс-компилятор. Перед запуском этой команды конфигурации убедитесь, что компилятор уже может быть выполнен непосредственно в Shell.

- --prefix указывает путь установки откомпилированных файлов, поэтому команда установки создаст директории lib и include в этом указанном каталоге.

### 8.3.3 Компиляция ALSA Util

ALSA Util может генерировать исполняемые файлы приложений для воспроизведения, записи и конфигурирования аудио. Это очень полезно при тестировании кода драйвера. Процесс компиляции выглядит следующим образом:

```c
tar -xvf alsa-utils-1.0.27.2.tar.bz2
cd alsa-utils-1.0.27.2
CC=arm-none-linux-gnueabi-gcc
./configure --prefix=/home/m/3rd/alsa/install/ --host=arm-linux --with-alsa-inc-prefix=/home/m/3rd/alsa/install/include --with-alsa-prefix=/home/m/3rd/alsa/install/lib --disable-alsamixer --disable-xmlto --disable-nls
make
```

### 8.3.4 Портирование библиотеки ALSA и инструментов на встроенную платформу

Портирование библиотеки ALSA и инструментов тестирования заключается в размещении соответствующих файлов библиотеки и исполняемых файлов на целевой плате. Следующие файлы должны быть скопированы в соответствующие места:

(1) Файлы библиотеки ALSA, помещаемые в /lib/.

(2) Файлы конфигурации, помещаемые в /usr/local/share, совпадающие с каталогом, указанным во время компиляции.

(3) Тестовые приложения. ALSA Util может создавать aplay, amixer, arecord. Мы можем поместить эти исполняемые файлы в /usr/sbin.

(4) В каталоге ядра убедитесь, что существует каталог /dev/snd/. В этом каталоге находятся файлы устройств controlC0, pcmC0D0, /usr/sbintimer, timer. Если эти файлы устройств уже находятся в /dev, их можно вручную скопировать в каталог /snd.

В системе LINUX каждый файл устройства является файлом. Аудиоустройства не являются исключением. Их файлы устройств находятся в каталоге /dev/snd. Давайте посмотрим на эти файлы устройств:

```c
ls /dev/snd -l
crw-rw----+ 1 root audio 116,  2 5月  19 21:24 controlC0     используется для звуковой карты
crw-rw----+ 1 root audio 116,  4 6月   6 19:31 pcmC0D0c
crw-rw----+ 1 root audio 116,  3 6月  11 11:53 pcmC0D0p
crw-rw----+ 1 root audio 116, 33 5月  19 21:24 timer
```

(1) controlC0: файл устройства управления аудио, например выбор канала, микширование, управление микрофоном и т.д.;

(2) pcmC0D0c: устройство записи звуковой карты 0 устройства 0, c означает capture (захват);

(3) pcmC0D0p: устройство воспроизведения звуковой карты 0 устройства 0, p означает play (воспроизведение);

(4) timer: настройка таймера.

## 8.4 Отладка ALSA

В этом разделе основное внимание уделяется использованию инструмента tinyalsa. tinyalsa — это упрощённая версия alsa-lib. Она предоставляет базовые интерфейсы pcm и control; без слишком сложных операций и функций. Вы можете использовать интерфейсы по необходимости. tinyalsa-utils — это набор инструментов, основанных на tinyalsa. Ниже представлены несколько часто используемых инструментов.

### 8.4.1 amixer

Подобен действию amixer, используется для управления элементами управления микшером.

Способ использования:

- Часто используемые параметры

| Параметр        | Функция                        |
| ----------- | --------------------------- |
| -D,--device | Укажите звуковую карту, по умолчанию используется card0 |

- Часто используемые команды

| Команда     | Функция                             |
| -------- | -------------------------------- |
| controls | Список всех элементов управления для указанной звуковой карты           |
| contents | Список подробной информации всех элементов управления для указанной звуковой карты |
| get      | Получить информацию об указанном элементе управления               |
| set      | Установить значение указанного элемента управления                 |

Примеры:

```c
Получить все имена элементов управления звуковой карты audiocodec
amixer -Dhw:audiocodec controls
Получить текущую громкость оборудования
amixer -Dhw:audiocodec cget name='LINEOUT volume'
Установить текущую громкость оборудования
amixer -Dhw:audiocodec cget name='LINEOUT volume' 25
```

### 8.4.2 aplay

aplay — это инструмент воспроизведения драйвера звуковой карты ALSA в командной строке, используемый для функции воспроизведения.

Способ использования:

| Параметр              | Функция                                                         |
| ----------------- | ------------------------------------------------------------ |
| -D,--device       | Укажите звуковую карту, по умолчанию используется default                               |
| -l,--list-devices | Список всех текущих звуковых карт                                             |
| -t,--file-type    | Укажите формат воспроизводимого файла, такой как voc, wav, raw. Если не указано, будет прочитан заголовок файла для идентификации |
| -c,--channels     | Укажите количество каналов                                                   |
| -f,--format       | Укажите формат выборки                                                 |
| -r,--rate         | Частота дискретизации                                                       |
| -d,--duration     | Укажите время воспроизведения                                               |
| --period-size     | Укажите размер периода                                             |
| --buffer-size     | Укажите размер буфера                                             |

Примеры:

```c
aplay -Dhw:audiocodec /mnt/UDISK/test.wav
```

### 8.4.3 arecord

arecord — это инструмент записи драйвера звуковой карты ALSA в командной строке, используемый для функции записи.

Способ использования:

| Параметр              | Функция                                                         |
| ----------------- | ------------------------------------------------------------ |
| -D,--device       | Укажите звуковую карту, по умолчанию используется default                               |
| -l,--list-devices | Список всех текущих звуковых карт                                             |
| -t,--file-type    | Укажите формат воспроизводимого файла, такой как voc, wav, raw. Если не указано, будет прочитан заголовок файла для идентификации |
| -c,--channels     | Укажите количество каналов                                                   |
| -f,--format       | Укажите формат выборки                                                 |
| -r,--rate         | Частота дискретизации                                                       |
| -d,--duration     | Укажите время воспроизведения                                               |
| --period-size     | Укажите размер периода                                             |
| --buffer-size     | Укажите размер буфера                                             |

Примеры:

```c
Запись на 5 с, количество каналов 2, частота дискретизации 16000, точность выборки 16 бит, сохранение в виде wav файла
arecord -Dhw:audiocodec -f S16_LE -r 16000 -c 2 -d 5 /mnt/UDISK/test.wav
```

## 8.5 Описание часто используемых интерфейсов

Из кода видна взаимосвязь между alsa-lib пользовательского уровня и alsa-driver и оборудованием. alsa-lib уровня пользователя получает доступ к ядру путём управления файлами устройств /dev/snd/pcmC0D0p, созданными alsa-driver. Драйвер alsa-driver ядра получает доступ к микросхеме звуковой карты оборудования через звуковое ядро.

![](http://photos.100ask.net/NewHomeSite/AudioBoard_Image007.png)

### 8.5.1 Интерфейс PCM

Для удобства управления и доступа alsa-lib инкапсулировала соответствующие интерфейсы, реализующие функции воспроизведения и записи через узлы pcmCXDXp/pcmCXDXc (/dev/snd/pcmCXDXx).

Основные затронутые интерфейсы:

| Имя функции                                 | Объяснение |
| -------------------------------------- | ---- |
| snd_pcm_open                           |      |
| snd_pcm_info                           |      |
| snd_pcm_hw_params_any                  |      |
| snd_pcm_hw_params_set_access           |      |
| snd_pcm_hw_params_set_format           |      |
| snd_pcm_hw_params_set_channels         |      |
| snd_pcm_hw_params_set_rate_near        |      |
| snd_pcm_hw_params_set_buffer_size_near |      |
| snd_pcm_hw_params                      |      |
| snd_pcm_sw_params_current              |      |
| snd_pcm_sw_params                      |      |
| snd_pcm_readi                          |      |
| snd_pcm_writei                         |      |
| snd_pcm_close                          |      |

Для подробного описания интерфейса pcm, пожалуйста, обратитесь к:

https://www.alsa-project.org/alsa-doc/alsa-lib/pcm.html
https://www.alsa-project.org/alsa-doc/alsa-lib/group___p_c_m.html

## 8.6 Разработка программы управления громкостью на основе ALSA

### 8.6.1 Разработка программы

- Список файлов:

| Номер | Имя файла         | Описание           |
| ---- | -------------- | -------------- |
| 1    | AlsaVolume.h   | Файл заголовка управления громкостью |
| 2    | AlsaVolume.cpp | Программа управления громкостью   |

- Разработка функций-членов:

| Номер | Имя функции           | Параметр        | Описание параметра | Описание функции             |
| ---- | ---------------- | ----------- | -------- | -------------------- |
| 1    | setMasterVolume  | long volume | Значение громкости   | Установить громкость             |
| 2    | getCurrentVolume | нет          | нет       | Получить текущую громкость         |
| 3    | increaseVolume   | нет          | нет       | Функция интерфейса однопроходного уменьшения громкости |
| 4    | decreaseVolume   | нет          | нет       | Функция интерфейса однопроходного увеличения громкости |

- Разработка переменных-членов:

| Номер | Имя переменной-члена | Тип              | Описание                 |
| ---- | -------------- | ----------------- | -------------------- |
| 1    | _VOLUMECHANGE  | const float       | Размер шага регулировки громкости     |
| 2    | handle         | snd_mixer_t*      | Mixer handle         |
| 3    | element_handle | snd_mixer_elem_t* | Mixer element handle |
| 4    | minVolume      | long              | Минимальная громкость             |
| 5    | maxVolume      | long              | Максимальная громкость             |

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

### 8.6.3 Реализация функций-членов в классе AlsaVolume

- Конструктор класса AlsaVolume

```c
AlsaVolume::AlsaVolume()
{
    snd_mixer_selem_id_t* sid = NULL;
    const char* card = "default";
    const char* selem_name = "Playback";
    //1. Открыть устройство микширования
    auto res = snd_mixer_open(&handle, 0);

    //2. attach HCTL to open mixer
    res = snd_mixer_attach(handle, card);

    //3. Register mixer simple element class.
snd_mixer_selem_register(handle, NULL, NULL);

    //4. Получить первый элемент, то есть Master
snd_mixer_load(handle);

    //5. allocate an invalid snd_mixer_selem_id_t using standard alloca
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

- Функция пошагового уменьшения громкости

```c
long AlsaVolume::decreaseVolume()
{
    long newVolume = 0;
if (getCurrentVolume() >= 0 + _VOLUMECHANGE) // check that we won't go below minimum volume
        newVolume = getCurrentVolume() - _VOLUMECHANGE;
    else
        newVolume = 0;
    setMasterVolume(newVolume);
    return newVolume;
}
```

- Функция пошагового увеличения громкости

```c
long AlsaVolume::increaseVolume()
{
    long newVolume = 0;
if (getCurrentVolume() <= 100 - _VOLUMECHANGE) // check that we don't go above the max volume
        newVolume = getCurrentVolume() + _VOLUMECHANGE;
    else
        newVolume = 100;
    setMasterVolume(newVolume);
    return newVolume;
}
```

## 8.7 Разработка базового класса ALSA

### 8.7.1 Разработка программы

- Список файлов:

| Номер | Имя файла       | Описание           |
| ---- | ------------ | -------------- |
| 1    | AlsaBase.h   | Файл заголовка базового класса ALSA |
| 2    | AlsaBase.cpp | Реализация базового класса    |

- Общие переменные-члены:

| Номер | Имя переменной-члена                 | Тип              | Описание             |
| ---- | -------------------------- | ----------------- | ---------------- |
| 1    | rate                       | int               | Скорость передачи (битрейт)             |
| 2    | channels                   | int               | Количество каналов           |
| 3    | bits_per_frame             | mutable int       | Размер данных на кадр     |
| 4    | default_output_buffer_size | int               | Размер буфера вывода по умолчанию |
| 5    | frames                     | snd_pcm_uframes_t | Количество кадров             |
| 6    | buffer_size                | snd_pcm_uframes_t | Размер буфера         |
| 7    | buffer_frames              | snd_pcm_uframes_t | Размер буфера         |
| 8    | period_size                | snd_pcm_uframes_t | Размер периода       |
| 9    | period_frames              | snd_pcm_uframes_t |                  |
| 10   | period_time                | unsigned int      |                  |
| 11   | buffer_time                | unsigned int      |                  |
| 12   | bits_per_sample            | size_t            |                  |

- Защищённые переменные-члены:

| Номер | Имя переменной-члена | Тип                  | Описание |
| ---- | ------------- | --------------------- | ---- |
| 1    | device        | const char *          |      |
| 2    | handle        | snd_pcm_t *           |      |
| 3    | params        | snd_pcm_hw_params_t * |      |
| 4    | format        | snd_pcm_format_t      |      |
| 5    | access_type   | snd_pcm_access_t      |      |
| 6    | DEVICE_OPENED | bool                  |      |
| 7    | PARAMS_SETED  | bool                  |      |

### 8.7.2 Реализация функций-членов в классе AlsaBase

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
    // Выделить пространство для параметров оборудования
    snd_pcm_hw_params_alloca(&params);

    //1、 Заполнить параметры оборудования значениями по умолчанию
    if ((err = snd_pcm_hw_params_any(handle, params)) < 0) {
        return err;
    }

    //2、 Restrict a configuration space to contain only real hardware rates.
    if ((err = snd_pcm_hw_params_set_rate_resample(handle, params, 0)) < 0) {
        return err;
    }

    //3、 Установить способ доступа
    if ((err = snd_pcm_hw_params_set_access(handle, params, access_type)) < 0) {
        return err;
    }

    //4、 Установить формат, S16_LE и т.д.
    if ((err = snd_pcm_hw_params_set_format(handle, params, format)) < 0) {
        return err;
    }

    //5 Установить каналы
    if ((err = snd_pcm_hw_params_set_channels(handle, params, channels)) < 0) {
        return err;
    }

    //6 Установить битрейт
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

    // Запишем параметры в устройство
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

## 8.8 Воспроизведение на основе ALSA

### 8.8.1 Разработка программы

- Список файлов

| Номер | Имя файла           | Описание               |
| ---- | ---------------- | ------------------ |
| 1    | AlsaPlayback.h   | Файл заголовка управления воспроизведением аудио |
| 2    | AlsaPlayback.cpp | Программа воспроизведения аудио       |

- Разработка функций-членов

| Номер | Имя функции   | Параметр                                                        | Описание параметра | Описание функции |
| ---- | -------- | ----------------------------------------------------------- | -------- | -------- |
| 1    | playback | const char *input_buffer <br/> const long input_buffer_size |          | Воспроизведение аудио |

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

### 8.1.3 Реализация функций-членов в классе AlsaPlayback

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

## 8.9 Запись на основе ALSA

### 8.9.1 Разработка программы

- Список файлов

| Номер | Имя файла          | Описание           |
| ---- | --------------- | -------------- |
| 1    | AlsaCapture.h   | Файл заголовка записи аудио |
| 2    | AlsaCapture.cpp | Программа записи аудио   |

- Разработка функций-членов

| Номер | Имя функции  | Параметр | Описание параметра | Описание функции |
| ---- | ------- | ---- | -------- | -------- |
| 1    | capture | нет   |          | Запись аудио |

- Разработка переменных-членов

| Номер | Имя переменной-члена | Тип              | Описание                 |
| ---- | -------------- | ----------------- | -------------------- |
| 1    | _VOLUMECHANGE  | const float       | Размер шага регулировки громкости     |
| 2    | handle         | snd_mixer_t*      | Mixer handle         |
| 3    | element_handle | snd_mixer_elem_t* | Mixer element handle |
| 4    | minVolume      | long              | Минимальная громкость             |
| 5    | maxVolume      | long              | Максимальная громкость             |

### 8.9.2 Определение класса AlsaPlay

```c
#pragma once
#include "AlsaBase.h"
namespace rv1108_audio{

class AlsaCapture : public AlsaBase
{
  public:
    // Буфер выходных данных
    char *output_buffer;
    // Размер буфера вывода
    unsigned int output_buffer_size;
    // int frames_to_read;
    // Для возврата количества прочитанных кадров
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

### 8.9.3 Реализация функций-членов в классе AlsaCapture

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
            // Overrun happened
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
