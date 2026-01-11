# Быстрое начало работы

* Справочное обучающее видео
<iframe width="800" height="600"
  src="//player.bilibili.com/player.html?aid=677495111&bvid=BV1Rm4y1X7GZ&cid=462849541&page=1">
</iframe>
## Включение и загрузка системы

**Примечание: Если в купленной вами конфигурации нет SPI NAND FLASH, пожалуйста, обратитесь к разделу ниже о записи прошивки на TF-карту, сначала запишите систему, только потом можно будет загрузиться.**

### 1. Подключение кабеля последовательного порта
Подключите один конец кабеля TypeC к разъему последовательного порта/питания отладочной платы, другой конец к USB-порту компьютера. После успешного подключения загорится красный индикатор питания на плате.
По умолчанию система автоматически установит драйвер устройства последовательного порта, если драйвер не установился автоматически, можно использовать Driver Genius для автоматической установки.

* Для Windows систем
В этот момент в Диспетчере устройств Windows в разделе "Порты (COM и LPT)" появится новое устройство последовательного порта, обычно начинающееся с `USB-Enhanced-SERIAL CH9102`, вам нужно обратить внимание на конкретный номер COM в конце, он понадобится для дальнейшего подключения.

![QuickStart-01](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/QuickStart-01.png)

Как показано на рисунке выше, номер COM - 96, далее мы будем использовать именно этот номер последовательного порта.

* Для Linux систем
Можно проверить, не появилось ли новое устройство /dev/tty<>, обычно узел устройства будет /dev/ttyACM0.

![QuickStart-02](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/QuickStart-02.png)

### 2. Открытие консоли последовательного порта
#### Получение инструмента последовательного порта
Используйте инструменты последовательного порта, такие как Putty или MobaXterm, для подключения к устройству отладочной платы.

* Инструмент Putty можно получить, посетив страницу https://www.chiark.greenend.org.uk/~sgtatham/putty/.
* MobaXterm можно получить, посетив страницу https://mobaxterm.mobatek.net/ (рекомендуется).

#### Использование Putty для входа через последовательный порт

![QuickStart-04](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/QuickStart-04.png)

#### Использование Mobaxterm для входа через последовательный порт
Откройте MobaXterm, нажмите на "Session" в верхнем левом углу, в появившемся окне выберите "Serial", как показано на рисунке ниже, выберите номер порта (номер порта COM21, отображаемый в диспетчере устройств), скорость передачи (Speed 115200), управление потоком (Flow Control: none), затем нажмите "OK". Шаги показаны на рисунке ниже.
**Примечание: Управление потоком (Flow Control) обязательно должно быть выбрано none, иначе вы не сможете вводить данные в последовательный порт в MobaXterm**

![Mobaxterm_serial_set_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Mobaxterm_serial_set_001.png)




### 3. Вход в shell системы
После успешного открытия последовательного порта с помощью инструмента последовательного порта, можно напрямую нажать клавишу Enter для входа в shell, конечно, вы также можете нажать кнопку `Reset` сброса на плате, чтобы увидеть полную информацию о системе.
![bootlogs_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/bootlogs_001.png)

**Имя пользователя для входа в систему по умолчанию - root, пароля нет.**

**Имя пользователя для входа в систему по умолчанию - root, пароля нет.**

**Имя пользователя для входа в систему по умолчанию - root, пароля нет.**




## Запись прошивки в SPI NAND

**Примечание: файловая система, записанная этим способом, доступна только для чтения, если требуется работа с сетевой файловой системой или использование TF-карты, этот способ не рекомендуется.**

### Подготовительные работы

1. Основная плата отладочной платы Dongshan Nezha STU x1
2. Скачать инструмент Allwinner для прошивки AllwinnertechPhoeniSuit: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnertechPhoeniSuit.zip
3. Кабель TypeC x2
4. Скачать минимальный образ системы для SPI NAND: https://gitlab.com/dongshanpi/tools/-/raw/main/tina_d1-h-nezha_uart0.zip
5. Скачать драйвер USB для прошивки Allwinner: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnerUSBFlashDeviceDriver.zip

### Подключение отладочной платы

Как показано на рисунке ниже, подключите два кабеля TypeC соответственно к разъему последовательного порта отладочной платы и к разъему OTG для прошивки, другой конец подключите к USB-порту компьютера. После успешного подключения можно распаковать скачанный инструмент прошивки и минимальный образ системы SPI NAND для использования.


![DongshanNezhaSTU-SPI-NAND_FLASH_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/DongshanNezhaSTU-SPI-NAND_FLASH_001.jpg)



### Установка USB-драйвера

После подключения отладочной платы сначала зажмите кнопку режима прошивки **FEL**, затем один раз нажмите кнопку системного сброса **RESET**, чтобы автоматически войти в режим прошивки.

В этот момент в диспетчере устройств в разделе **Контроллеры USB** появится неизвестное устройство, нам нужно будет изменить скачанный заранее **драйвер USB для прошивки Allwinner**, затем распаковать архив **драйвера USB для прошивки Allwinner**, внутри можно увидеть следующие файлы.

```bash
InstallUSBDrv.exe
drvinstaller_IA64.exe
drvinstaller_X86.exe
UsbDriver/
drvinstaller_X64.exe
install.bat
```

Для пользователей системы Windows 7 достаточно открыть от имени администратора скрипт `install.bat`, дождаться установки, в появившемся диалоговом окне установки драйвера нажать "Установить".

Для пользователей систем Windows 10/Windows 11 необходимо вручную установить драйвер в диспетчере устройств.

Как показано на рисунке ниже, при первом подключении устройства OTG в режиме прошивки в диспетчере устройств появится неизвестное устройство.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_001.png)

Далее щелкните правой кнопкой мыши на этом неизвестном устройстве, в появившемся диалоговом окне нажмите "Выполнить поиск драйверов на этом компьютере".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_002.png)

Затем в новом диалоговом окне нажмите "Обзор" и найдите папку с драйвером для прошивки USB, которую мы скачали ранее, найдите директорию `UsbDriver/` и войдите в нее, затем нажмите "ОК".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_007.png)

Обратите внимание, войдите в папку `UsbDriver/`, затем нажмите "ОК", как показано на рисунке ниже.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_003.png)

В этот момент продолжаем нажать кнопку **Далее**, система предложит установить драйвер.
В появившемся диалоговом окне нажимаем "Всегда устанавливать этот драйвер" и ждем завершения установки.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_004.png)

После завершения установки появится сообщение "Windows успешно обновила драйвер".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_005.png)


Наконец, мы можем увидеть, что в диспетчере устройств неизвестное устройство превратилось в устройство `USB Device(VID_1f3a_efe8)`, это означает, что драйвер устройства установлен успешно.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_006.png)


### Запуск программы прошивки

Распакуйте скачанный инструмент Allwinner для прошивки **AllwinnertechPhoeniSuit**, одновременно скачайте и распакуйте **минимальный образ системы SPI NAND**.

После распаковки получим образ **tina_d1-h-nezha_uart0.img**, который используется для записи в SPI NAND. Другая папка - **AllwinnertechPhoeniSuit**.

Сначала войдите в директорию **AllwinnertechPhoeniSuit\AllwinnertechPhoeniSuitRelease20201225** и найдите **PhoenixSuit.exe**, дважды щелкните для запуска.

Главное окно программы выглядит как показано на рисунке ниже

![PhoenixSuit_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_001.png)


Далее нам нужно переключиться на окно **Прошивка в один клик**, как показано на рисунке ниже, нажмите красный прямоугольник метка 1, в появившемся новом окне нажмите красный прямоугольник 2 **Обзор**, найдите распакованный ранее минимальный образ системы SPI NAND **tina_d1-h-nezha_uart0.img**, выберите образ, затем нажмите красный прямоугольник 3 **Полное стирание и обновление**, наконец нажмите красный прямоугольник 4 **Начать обновление**.

После завершения не обращайте внимания на появившиеся сообщения, в этот момент возьмите уже подключенную отладочную плату, сначала зажмите кнопку режима прошивки **FEL**, затем один раз нажмите кнопку системного сброса **RESET**, чтобы автоматически войти в режим прошивки и начать прошивку.

![PhoenixSuit_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_002.png)


Во время прошивки будет отображаться индикатор прогресса, после завершения прошивки отладочная плата автоматически перезагрузится.

![PhoenixSuit_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_003.png)


### Загрузка системы

Обычно после успешной прошивки система автоматически перезагружается и запускается, в этот момент входим в терминал последовательного порта, можем увидеть информацию о загрузке, после полной загрузки всей информации введите имя пользователя root для входа в записанную систему.

![spinand-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/spinand-flashsystem_001.png)


## Запись прошивки на TF-карту

### Подготовительные работы
1. Основная плата отладочной платы Dongshan Nezha STU x1
2. Кабель Type-C x1
3. Устройство чтения TF-карт x1
4. Micro TF-карта 8GB и выше x1
5. Инструмент win32diskimage: https://gitlab.com/dongshanpi/tools/-/raw/main/win32diskimager-1.0.0-install.exe
6. Специальный инструмент форматирования SD-карт: https://gitlab.com/dongshanpi/tools/-/raw/main/SDCardFormatter5.0.1Setup.exe
7. Минимальный образ системы для TF-карты: https://gitlab.com/dongshanpi/tools/-/raw/main/dongshannezhastu-sdcard.zip

### Запуск программы записи

Сначала необходимо скачать **win32diskimage и специальный инструмент форматирования SD-карт** - эти два инструмента для записи на TF-карту, затем получить файл образа системы для TF-карты **dongshannezhastu-sdcard.zip**, после получения сначала установите **win32diskimage и специальный инструмент форматирования SD-карт** - эти два инструмента, одновременно можно распаковать файл образа системы для TF-карты **dongshannezhastu-sdcard.zip**, получив файл **dongshannezhastu-sdcard.img** - это образ, который мы будем записывать.



* Используйте SD CardFormat для форматирования TF-карты, обратите внимание на резервное копирование данных на карте. Как показано на рисунке ниже, нажмите "Обновить", найдите TF-карту, затем нажмите Format, в появившемся диалоговом окне нажмите **Да (Yes)** и дождитесь завершения форматирования.

![SDCardFormat_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/SDCardFormat_001.png)

* После завершения форматирования используйте инструмент **Win32diskimage** для записи образа, следуя указанным ниже шагам, найдите букву диска вашей TF-карты, затем нажмите стрелку 2 на значок папки, найдите распакованный ранее файл образа TF-карты **dongshannezhastu-sdcard.img**, наконец нажмите "Запись" и дождитесь завершения записи.

![wind32diskimage_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/wind32diskimage_001.png)


После завершения можно извлечь TF-карту и вставить ее в слот для TF-карты на обратной стороне минимальной платы Dongshan Nezha STU, в этот момент подключите кабель последовательного порта и используйте инструмент последовательного порта для открытия устройства последовательного порта, нажмите кнопку сброса **RESET** на отладочной плате, чтобы перезагрузиться и войти в систему на TF-карте.

### Загрузка системы
![sdcard-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/sdcard-flashsystem_001.png)

**Имя пользователя для входа в систему - root, пароль пустой**

**Имя пользователя для входа в систему - root, пароль пустой**

**Имя пользователя для входа в систему - root, пароль пустой**
