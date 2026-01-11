# Быстрое начало работы

* Посмотрите видео-руководство по работе
<iframe width="800" height="600"
  src="//player.bilibili.com/player.html?aid=677495111&bvid=BV1Rm4y1X7GZ&cid=462849541&page=1">
</iframe>

## Включение и загрузка системы

**Внимание: Если в вашей конфигурации нет SPI NANDFLASH, обратитесь к разделу ниже о записи прошивки на TF-карту, сначала запишите систему, чтобы иметь возможность загрузки и использования.**

### 1. Подключение кабеля последовательного порта
Подключите один конец прилагаемого кабеля TypeC к интерфейсу последовательного порта/питания отладочной платы, другой конец - к USB-порту компьютера. После успешного подключения загорится красный светодиод питания на плате.
По умолчанию система автоматически установит драйвер устройства последовательного порта, если установка не произошла автоматически, можно использовать Driver Genius для автоматической установки.

* Для систем Windows
В этом случае в диспетчере устройств Windows в разделе "Порты (COM и LPT)" появится дополнительное устройство последовательного порта, обычно начинающееся с `USB-Enhanced-SERIAL CH9102`, обратите внимание на конкретный номер COM, который потребуется для последующего подключения.

![QuickStart-01](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/QuickStart-01.png)

Как показано на рисунке выше, номер COM - 96, поэтому при подключении будем использовать последовательный порт 96.

* Для систем Linux
Проверьте, появилось ли новое устройство /dev/tty<>, обычно узлом устройства является /dev/ttyACM0.

![QuickStart-02](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/QuickStart-02.png)

### 2. Открытие консоли последовательного порта
#### Получение инструмента для работы с последовательным портом
Используйте инструменты последовательного порта, такие как Putty или MobaXterm, для работы с устройством отладочной платы.

* Инструмент putty можно получить на странице https://www.chiark.greenend.org.uk/~sgtatham/putty/.
* MobaXterm можно получить на странице https://mobaxterm.mobatek.net/ (рекомендуется).

#### Подключение к последовательному порту с помощью putty

![QuickStart-04](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/QuickStart-04.png)

#### Подключение к последовательному порту с помощью Mobaxterm
Откройте MobaXterm, нажмите "Session" в левом верхнем углу, в появившемся окне выберите "Serial", как показано на рисунке ниже, выберите номер порта (номер порта COM21, отображаемый ранее в диспетчере устройств), скорость передачи (Speed 115200), управление потоком (Flow Control: none), затем нажмите "OK". Шаги показаны на рисунке ниже.
**Внимание: Управление потоком (Flow Control) обязательно должно быть установлено в none, иначе вы не сможете вводить данные в последовательный порт в MobaXterm**

![Mobaxterm_serial_set_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Mobaxterm_serial_set_001.png)




### 3. Вход в оболочку системы
После успешного открытия последовательного порта с помощью инструмента, можно напрямую нажать клавишу Enter для входа в оболочку, также можно нажать кнопку `Reset` на плате, чтобы просмотреть полную информацию о системе.
![bootlogs_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/bootlogs_001.png)

**Имя пользователя для входа в систему по умолчанию - root без пароля.**

**Имя пользователя для входа в систему по умолчанию - root без пароля.**

**Имя пользователя для входа в систему по умолчанию - root без пароля.**




## Запись прошивки в SPI NAND

**Обратите внимание, что при таком способе записи файловая система доступна только для чтения. Если требуется работа с сетевой файловой системой или использование TF-карты, данный способ не рекомендуется.**

### Подготовка

1. Основная плата отладочной платы Dongshan Nezha STU x1
2. Скачайте инструмент для прошивки AllwinnertechPhoeniSuit: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnertechPhoeniSuit.zip
3. Кабель TypeC X2
4. Скачайте минимальный образ системы для SPI NAND: https://gitlab.com/dongshanpi/tools/-/raw/main/tina_d1-h-nezha_uart0.zip
5. Скачайте драйвер USB для записи Allwinner: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnerUSBFlashDeviceDriver.zip

### Подключение отладочной платы

Как показано на рисунке ниже, подключите два кабеля TypeC к интерфейсу последовательного порта отладочной платы и интерфейсу записи OTG, другие концы подключите к USB-портам компьютера. После успешного подключения можно разархивировать загруженный инструмент записи и минимальный образ системы для SPI NAND для использования.


![DongshanNezhaSTU-SPI-NAND_FLASH_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/DongshanNezhaSTU-SPI-NAND_FLASH_001.jpg)



### Установка USB-драйвера

После подключения отладочной платы сначала удерживайте кнопку режима записи **FEL**, затем один раз нажмите кнопку сброса системы **RESET**, чтобы автоматически войти в режим записи.

В это время в диспетчере устройств в разделе **Контроллеры USB** появится неизвестное устройство. В этот момент нам нужно модифицировать предварительно загруженный **драйвер USB для записи Allwinner**, затем разархивировать архив **драйвера USB для записи Allwinner**, внутри которого можно увидеть следующие файлы.

```bash
InstallUSBDrv.exe
drvinstaller_IA64.exe
drvinstaller_X86.exe
UsbDriver/
drvinstaller_X64.exe
install.bat
```

Для пользователей Windows 7 достаточно запустить скрипт `install.bat` от имени администратора, дождаться установки и в появившемся диалоговом окне о необходимости установки драйвера нажать "установить".

Для пользователей Windows 10/11 необходимо вручную установить драйвер в диспетчере устройств.

Как показано на рисунке ниже, при первом подключении OTG-устройства и входе в режим записи в диспетчере устройств появится неизвестное устройство.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_001.png)

Далее щелкните правой кнопкой мыши на этом неизвестном устройстве, в появившемся диалоговом окне нажмите "Выполнить поиск драйверов на этом компьютере".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_002.png)

Затем в новом диалоговом окне нажмите "Обзор" и найдите папку с ранее загруженным драйвером для USB-записи, найдите директорию `UsbDriver/`, войдите в нее и нажмите "ОК".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_007.png)

Обратите внимание, что нужно войти в папку `UsbDriver/`, затем нажать "ОК", как показано на рисунке ниже.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_003.png)

В этот момент продолжите, нажав кнопку **Далее**, система предложит установить драйвер.
В появившемся диалоговом окне нажмите "Все равно установить этот драйвер" и дождитесь завершения установки.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_004.png)

После завершения установки появится сообщение: "Windows успешно обновила драйвер".
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_005.png)


Наконец, можно увидеть, что в диспетчере устройств неизвестное устройство превратилось в устройство `USB Device(VID_1f3a_efe8)`, это означает, что драйвер успешно установлен.
![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_006.png)


### Запуск программы записи

Разархивируйте загруженный инструмент для прошивки Allwinner **AllwinnertechPhoeniSuit**, также разархивируйте **минимальный образ системы для SPI NAND**.

После разархивирования получится образ **tina_d1-h-nezha_uart0.img**, который предназначен для записи в SPI NAND, и папка **AllwinnertechPhoeniSuit**.

Сначала войдите в директорию **AllwinnertechPhoeniSuit\AllwinnertechPhoeniSuitRelease20201225**, найдите **PhoenixSuit.exe** и запустите двойным щелчком.

После открытия программы основной интерфейс выглядит так, как показано на рисунке ниже

![PhoenixSuit_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_001.png)


Далее нужно переключиться на окно **Прошивка одной кнопкой**, как показано на рисунке ниже, нажмите красную рамку №1, в появившемся новом окне нажмите красную рамку №2 **Обзор** и найдите разархивированный ранее минимальный образ системы для SPI NAND **tina_d1-h-nezha_uart0.img**, после выбора образа нажмите красную рамку №3 **Полное стирание и обновление**, затем нажмите красную рамку №4 **Начать обновление**.

После нажатия не обращайте внимания на появившуюся информацию, в этот момент возьмите уже подключенную отладочную плату, сначала удерживайте кнопку режима записи **FEL**, затем один раз нажмите кнопку сброса системы **RESET**, и автоматически начнется вход в режим записи и сама запись.

![PhoenixSuit_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_002.png)


Во время записи будет отображаться прогресс-бар, после завершения записи отладочная плата автоматически перезагрузится.

![PhoenixSuit_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_003.png)


### Загрузка системы

Обычно после успешной записи происходит автоматическая перезагрузка и запуск системы. В этот момент войдите в терминал последовательного порта, где можно увидеть информацию о загрузке. После завершения загрузки всей информации введите имя пользователя root для входа в записанную систему.

![spinand-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/spinand-flashsystem_001.png)


## Запись прошивки на TF-карту

### Подготовка
1. Основная плата отладочной платы Dongshan Nezha STU x1
2. Кабель Type-C X1
3. Кардридер для TF-карт x1
4. Micro TF-карта от 8GB x1
5. Инструмент win32diskimage: https://gitlab.com/dongshanpi/tools/-/raw/main/win32diskimager-1.0.0-install.exe
6. Специализированный инструмент форматирования SD-карт: https://gitlab.com/dongshanpi/tools/-/raw/main/SDCardFormatter5.0.1Setup.exe
7. Минимальный образ системы для TF-карты: https://gitlab.com/dongshanpi/tools/-/raw/main/dongshannezhastu-sdcard.zip

### Запуск программы записи

Сначала необходимо скачать два инструмента для записи TF-карты: **win32diskimage и специализированный инструмент форматирования SD-карт**, затем получить файл образа системы для TF-карты **dongshannezhastu-sdcard.zip**. После получения установите эти два инструмента: **win32diskimage и специализированный инструмент форматирования SD-карт**, также можно разархивировать файл образа системы для TF-карты **dongshannezhastu-sdcard.zip**, получится файл **dongshannezhastu-sdcard.img** - это образ, который нужно записать.



* Отформатируйте TF-карту с помощью SD CardFormat, не забудьте сделать резервную копию данных на карте. Как показано на рисунке ниже, нажмите "Обновить", найдите TF-карту, затем нажмите Format, в появившемся диалоговом окне нажмите **Да (Yes)** и дождитесь завершения форматирования.

![SDCardFormat_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/SDCardFormat_001.png)

* После завершения форматирования используйте инструмент **Win32diskimage** для записи образа. Следуйте указанным ниже шагам: найдите букву диска вашей TF-карты, затем нажмите на значок папки под стрелкой №2, найдите разархивированный ранее файл образа для TF-карты **dongshannezhastu-sdcard.img**, наконец, нажмите "Записать" и дождитесь завершения записи.

![wind32diskimage_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/wind32diskimage_001.png)


После завершения можно извлечь TF-карту и вставить ее в слот для TF-карты на обратной стороне минимальной платы Dongshan Nezha STU. В этот момент подключите кабель последовательного порта и откройте устройство последовательного порта с помощью инструмента, нажмите кнопку **RESET** на отладочной плате для перезагрузки и входа в систему на TF-карте.

### Загрузка системы
![sdcard-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/sdcard-flashsystem_001.png)

**Имя пользователя для входа в систему - root, пароль пустой**

**Имя пользователя для входа в систему - root, пароль пустой**

**Имя пользователя для входа в систему - root, пароль пустой**
