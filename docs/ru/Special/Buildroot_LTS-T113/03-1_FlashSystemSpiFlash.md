# Прошивка системы на SPI NAND

**Внимание: файловая система, записанная этим методом, использует ubifs, поэтому если требуется монтирование сетевой файловой системы или использование TF-карты, этот метод не рекомендуется.**

## Подготовка

1. Главная плата отладочной платы Dongshan Nezha STU x1
2. Загрузить инструмент линейной прошивки Allwinnertech PhoenixSuit: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnertechPhoeniSuit.zip
3. Кабель TypeC X2
4. Загрузить минимальный образ системы SPI NAND: https://gitlab.com/dongshanpi/tools/-/raw/main/buildroot_linux_nand_uart3.zip
5. Загрузить драйвер USB для прошивки Allwinnertech: https://gitlab.com/dongshanpi/tools/-/raw/main/AllwinnerUSBFlashDeviceDriver.zip

## Подключение отладочной платы

* Как показано на рисунке ниже, подключите два кабеля TypeC к последовательному порту отладочной платы и порту прошивки OTG соответственно, другой конец - к USB-порту компьютера. После успешного подключения вы можете распаковать загруженный инструмент прошивки и минимальный образ системы SPI NAND.

![T113-Pro_FlashSystem](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/100ask_t113_pro/T113-Pro_FlashSystem.png)



* Используя пинцет или кабель Dupont, замкните выводы 5-6 SPI NAND FLASH на модуле ядра, то есть MOSI и SCLK. Одновременно с замыканием можно нажать кнопку RESET на нижней плате. В этот момент отладочная плата войдет в режим прошивки FEL. После входа в режим прошивки можно перейти к установке специального драйвера прошивки.

![T113-Pro_FlashSystem_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/100ask_t113_pro/T113-Pro_FlashSystem_002.png)


## Установка драйвера USB

После подключения отладочной платы сначала нажмите и удерживайте клавишу режима прошивки **FEL**, затем нажмите один раз клавишу системного сброса **RESET**, чтобы автоматически войти в режим прошивки.

В этот момент вы можете увидеть, что в **Контроллере универсальной последовательной шины** в Диспетчере устройств появляется неизвестное устройство. Тогда вам нужно взять предварительно загруженный **Драйвер USB для прошивки Allwinnertech** и изменить его. Распакуйте загруженный архив **Драйвер USB для прошивки Allwinnertech** и вы увидите следующие файлы.

```bash
InstallUSBDrv.exe
drvinstaller_IA64.exe
drvinstaller_X86.exe
UsbDriver/
drvinstaller_X64.exe
install.bat
```

Для пользователей системы Windows 7 просто откройте скрипт `install.bat` от имени администратора и дождитесь завершения установки. В появившемся диалоговом окне запроса установки драйвера нажмите кнопку установки.

Для пользователей системы Windows 10/11 необходимо установить драйвер вручную в Диспетчере устройств.

Как показано на рисунке ниже, при первом подключении устройства OTG в режиме прошивки Диспетчер устройств выведет неизвестное устройство.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_001.png)

Затем щелкните правой кнопкой мыши на этом неизвестном устройстве, и в появившемся диалоговом окне нажмите "Обзор компьютера для поиска программного обеспечения драйвера".

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_002.png)

Затем в появившемся новом диалоговом окне нажмите "Обзор", найдите папку с загруженным драйвером USB и перейдите в папку `UsbDriver/`, затем нажмите "OK".

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_007.png)

Обязательно перейдите в папку `UsbDriver/` и нажмите OK, как показано на рисунке ниже.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_003.png)

На этом этапе нажмите кнопку **Далее**, после чего система предложит установить драйвер. В появившемся диалоговом окне нажмите "Всегда устанавливать это программное обеспечение драйвера" и дождитесь завершения установки.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_004.png)

После завершения установки будет показано сообщение "Windows успешно обновил ваш драйвер".

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_005.png)

Наконец, вы можете видеть, что неизвестное устройство в диспетчере устройств стало устройством `USB Device(VID_1f3a_efe8)`, что указывает на то, что драйвер устройства успешно установлен.

![Windows_FlashDevice_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/Windows_FlashDevice_006.png)


## Запуск программного обеспечения для прошивки

Распакуйте загруженный инструмент линейной прошивки **AllwinnertechPhoeniSuit**, а также распакуйте загруженный минимальный образ системы **SPI NAND**.

После распаковки вы получите образ **buildroot_linux_nand_uart3.img**, используемый для прошивки в SPI NAND, и папку **AllwinnertechPhoeniSuit**.

Сначала перейдите в каталог **AllwinnertechPhoeniSuit\AllwinnertechPhoeniSuitRelease20201225**, найдите **PhoenixSuit.exe** и дважды щелкните, чтобы запустить его.

После открытия программы главное окно выглядит следующим образом

![PhoenixSuit_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_001.png)


Далее нам необходимо перейти в окно **Быстрая прошивка**. Как показано на рисунке, нажмите красный прямоугольник 1, в появившемся новом окне нажмите красный прямоугольник 2 **Обзор**, найдите распакованный минимальный образ системы SPI NAND **buildroot_linux_nand_uart3.img**, выберите образ и нажмите красный прямоугольник 3 **Полное стирание и обновление**, затем нажмите красный прямоугольник 4 **Обновить сейчас**.

После нажатия кнопки не обращайте внимания на появившуюся информацию. В это время возьмите подключенную отладочную плату, нажмите и удерживайте клавишу режима прошивки **FEL**, затем нажмите один раз клавишу системного сброса **RESET**, чтобы автоматически войти в режим прошивки и начать прошивку.

![PhoenixSuit_002](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_002.png)


Во время прошивки будет отображаться индикатор прогресса, и после завершения прошивки отладочная плата автоматически перезагрузится.

![PhoenixSuit_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/PhoenixSuit_003.png)


## Загрузка системы

Обычно после успешной прошивки система автоматически перезагружается. В этом случае мы входим в последовательный терминал и можем видеть информацию о загрузке. После загрузки всей информации введите имя пользователя root для входа в прошитую систему.

![spinand-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/spinand-flashsystem_001.png)

**Имя пользователя системы - root, пароль пуст**

**Имя пользователя системы - root, пароль пуст**

**Имя пользователя системы - root, пароль пуст**
