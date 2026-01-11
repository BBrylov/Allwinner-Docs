# Обновление образа системы

## Запись прошивки в SPI NAND

**Обратите внимание, что файловая система, записываемая этим способом, доступна только для чтения. Если требуется монтирование сетевой файловой системы или использование TF-карты, этот способ не рекомендуется.**

### Необходимая подготовка

1. Основная плата Dongshan Nezha STU x1
2. Скачайте инструмент прошивки Allwinner AllwinnertechPhoeniSuit: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnertechPhoeniSuit.zip
3. Кабель TypeC X2
4. Скачайте минимальный образ системы SPI NAND: https://gitlab.com/dongshanpi/tools/-/raw/main/tina_d1-h-nezha_uart0.zip
5. Скачайте драйвер USB-прошивки Allwinner: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnerUSBFlashDeviceDriver.zip

### Подключение отладочной платы

Как показано на рисунке ниже, подключите два кабеля TypeC к интерфейсу последовательного порта отладочной платы и к интерфейсу записи OTG соответственно, другой конец подключите к USB-порту компьютера. После успешного подключения можно распаковать и использовать загруженный инструмент записи и минимальный образ системы SPI NAND.


![DongshanNezhaSTU-SPI-NAND_FLASH_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/DongshanNezhaSTU-SPI-NAND_FLASH_001.jpg)



### Установка USB-драйвера

После подключения отладочной платы сначала нажмите и удерживайте кнопку режима записи **FEL**, затем один раз нажмите кнопку сброса системы **RESET**, чтобы автоматически войти в режим записи.

В это время в диспетчере устройств в разделе **Контроллеры универсальной последовательной шины** появится неизвестное устройство. В этот момент нам нужно изменить заранее загруженный **драйвер USB-прошивки Allwinner**, затем распаковать архив **драйвера USB-прошивки Allwinner**. После распаковки вы увидите следующие файлы.

```bash
InstallUSBDrv.exe
drvinstaller_IA64.exe
drvinstaller_X86.exe
UsbDriver/
drvinstaller_X64.exe
install.bat
```

Для пользователей Windows 7 достаточно открыть скрипт `install.bat` от имени администратора, дождаться установки и в появившемся диалоговом окне нажать "Установить".

Для пользователей Windows 10/Windows 11 необходимо установить драйвер вручную через диспетчер устройств.

Как показано на рисунке ниже, при первом подключении OTG-устройства в режиме записи в диспетчере устройств появится неизвестное устройство.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_001.png)

Затем щелкните правой кнопкой мыши на этом неизвестном устройстве и в появившемся диалоговом окне выберите "Выполнить поиск драйверов на этом компьютере".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_002.png)

Затем в новом диалоговом окне нажмите "Обзор" и найдите ранее загруженную папку с драйвером USB-прошивки, найдите директорию `UsbDriver/` и войдите в неё, после чего нажмите ОК.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_007.png)

Обратите внимание, что нужно войти в папку `UsbDriver/`, затем нажать ОК, как показано на рисунке ниже.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_003.png)

В этот момент нажмите кнопку **Далее**, система предложит установить драйвер.
В появившемся диалоговом окне нажмите "Всё равно установить этот драйвер" и дождитесь завершения установки.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_004.png)

После завершения установки появится сообщение: "Windows успешно обновила драйверы".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_005.png)


Наконец, можно увидеть, что неизвестное устройство в диспетчере устройств превратилось в устройство `USB Device(VID_1f3a_efe8)`, что означает успешную установку драйвера.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_006.png)


### Запуск программы записи

Распакуйте загруженный инструмент прошивки Allwinner **AllwinnertechPhoeniSuit**, а также распакуйте загруженный **минимальный образ системы SPI NAND**.

После распаковки получится образ **tina_d1-h-nezha_uart0.img**, предназначенный для записи в SPI NAND, и папка **AllwinnertechPhoeniSuit**.

Сначала войдите в директорию **AllwinnertechPhoeniSuit\AllwinnertechPhoeniSuitRelease20201225**, найдите **PhoenixSuit.exe** и дважды щелкните по нему для запуска.

После открытия программы главное окно выглядит следующим образом:

![PhoenixSuit_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_001.png)


Затем нам нужно переключиться на окно **Прошивка одной кнопкой**. Как показано на рисунке ниже, нажмите красный прямоугольник под номером 1, в появившемся новом окне нажмите красный прямоугольник 2 **Обзор**, найдите только что распакованный минимальный образ системы SPI NAND **tina_d1-h-nezha_uart0.img**, после выбора образа нажмите красный прямоугольник 3 **Полное стирание и обновление**, и наконец нажмите красный прямоугольник 4 **Немедленное обновление**.

После нажатия не обращайте внимания на появившееся сообщение. В этот момент возьмите уже подключенную отладочную плату, сначала нажмите и удерживайте кнопку режима записи **FEL**, затем один раз нажмите кнопку сброса системы **RESET**, чтобы автоматически войти в режим записи и начать прошивку.

![PhoenixSuit_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_002.png)


Во время записи будет отображаться индикатор прогресса записи. После завершения записи отладочная плата автоматически перезагрузится.

![PhoenixSuit_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_003.png)


### Загрузка системы

Обычно после успешной записи система автоматически перезагружается и запускается. В это время, войдя в терминал последовательного порта, можно увидеть информацию о загрузке. После завершения загрузки всей информации введите имя пользователя root для входа в записанную систему.

![spinand-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/spinand-flashsystem_001.png)


## Запись прошивки на TF-карту

### Необходимая подготовка
1. Основная плата Dongshan Nezha STU x1
2. Кабель Type-C X1
3. Устройство чтения TF-карт x1
4. Micro TF-карта объемом 8 ГБ и более x1
5. Инструмент win32diskimage: https://gitlab.com/dongshanpi/tools/-/raw/main/win32diskimager-1.0.0-install.exe
6. Специализированный инструмент форматирования SD-карт: https://gitlab.com/dongshanpi/tools/-/raw/main/SDCardFormatter5.0.1Setup.exe
7. Минимальный образ системы для TF-карты: https://gitlab.com/dongshanpi/tools/-/raw/main/dongshannezhastu-sdcard.zip

### Запуск программы записи

Сначала необходимо скачать два инструмента для записи TF-карт: **win32diskimage и специализированный инструмент форматирования SD-карт**, затем получить файл образа системы для TF-карты **dongshannezhastu-sdcard.zip**. После получения установите оба инструмента **win32diskimage и специализированный инструмент форматирования SD-карт**, а также распакуйте файл образа системы TF-карты **dongshannezhastu-sdcard.zip**, чтобы получить файл **dongshannezhastu-sdcard.img** - это образ, который мы будем записывать.



* Используйте SD CatFormat для форматирования TF-карты, не забудьте сделать резервную копию данных на карте. Как показано на рисунке ниже, нажмите "Обновить", чтобы найти TF-карту, затем нажмите Format, в появившемся диалоговом окне нажмите **Да (Yes)** и дождитесь завершения форматирования.

![SDCardFormat_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/SDCardFormat_001.png)

* После завершения форматирования используйте инструмент **Win32diskimage** для записи образа. Следуя приведенным ниже шагам, найдите букву диска вашей TF-карты, затем нажмите стрелку 2 - символ папки, найдите только что распакованный файл образа TF-карты **dongshannezhastu-sdcard.img**, и наконец нажмите "Запись", дождитесь завершения записи.

![wind32diskimage_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/wind32diskimage_001.png)


После завершения можно извлечь TF-карту и вставить её в слот для TF-карты на задней стороне минимальной платы Dongshan Nezha STU. В это время подключите кабель последовательного порта и откройте устройство последовательного порта с помощью инструмента работы с последовательным портом, нажмите кнопку сброса **RESET** на отладочной плате, чтобы перезагрузиться в систему TF-карты.

### Загрузка системы
![sdcard-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/sdcard-flashsystem_001.png)

**Имя пользователя для входа в систему: root, пароль пустой**

**Имя пользователя для входа в систему: root, пароль пустой**

**Имя пользователя для входа в систему: root, пароль пустой**
