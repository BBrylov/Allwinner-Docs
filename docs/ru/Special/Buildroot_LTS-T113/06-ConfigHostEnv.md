# Установка и конфигурация окружения разработки


## Получение виртуальной машины

### Загрузка инструмента VMware

Откройте веб-браузер на странице https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html, как показано стрелкой на рисунке, нажмите для загрузки и установки версии VMware Workstation для Windows. Нажмите **DOWNLOAD NOW**, чтобы начать загрузку.

![vmwareworkstation_download_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/vmwareworkstation_download_001.png)

После завершения загрузки просто установите все с конфигурацией по умолчанию.



### Получение образа системы Ubuntu

* Откройте в браузере https://www.linuxvmimages.com/images/ubuntu-1804/, найдите расположение, показанное на стрелке ниже, и нажмите **VMware Image**, чтобы загрузить.

![linuxvmimage_downlaod_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/linuxvmimage_downlaod_001.png)

Загрузка может занять от 10 до 30 минут в зависимости от скорости вашего интернета.



## Запуск виртуальной машины

1. Распакуйте архив образа виртуальной машины. После распаковки вы можете увидеть два файла внутри. Далее мы будем использовать файл конфигурации с расширением .vmx.

![ConfigHost_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_003.png)

2. Откройте установленное программное обеспечение VMware Workstation, нажмите **Файл** --> **Открыть** в левом верхнем углу, найдите файл Ubuntu_18.04.6_VM_LinuxVMImages.COM.vmx выше. После этого откроется новое диалоговое окно виртуальной машины.

![ConfigHost_004](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_004.png)

3. На рисунке ниже показана конфигурация виртуальной машины. Вы можете щелкнуть на красный прямоугольник 2, чтобы "Отредактировать параметры виртуальной машины" и отрегулировать размер памяти и количество процессоров в виртуальной машине. Рекомендуется, чтобы память была не менее 4 ГБ, а процессоров было не менее 4. После регулировки вы можете нажать **Включить эту виртуальную машину**, чтобы запустить виртуальную машину.

![ConfigHost_005](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_005.png)

При первом открытии будет выведено диалоговое окно "Виртуальная машина скопирована". В этом случае просто нажмите "Я скопировал эту виртуальную машину", и вы сможете продолжить запуск виртуальной машины.

![ConfigHost_006](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_006.png)

Подождите несколько секунд, система автоматически загрузится. После загрузки нажмите на слово **Ubuntu**, чтобы войти в диалоговое окно входа, введите пароль ubuntu, чтобы войти в систему Ubuntu.

Внимание:

**Имя пользователя и пароль Ubuntu по умолчанию: ubuntu ubuntu**

**Имя пользователя и пароль Ubuntu по умолчанию: ubuntu ubuntu**

**Имя пользователя и пароль Ubuntu по умолчанию: ubuntu ubuntu**

**Ubuntu по умолчанию требует подключения к Интернету. Если ваш компьютер Windows может получить доступ в Интернет, система Ubuntu будет автоматически делиться сетью Windows для подключения к Интернету.**



### Конфигурация окружения разработки



* Установите необходимые пакеты. Щелкните мышью в интерфейс Ubuntu, нажмите **Ctrl + Alt + T** одновременно, чтобы быстро открыть терминал. После открытия выполните следующую команду в терминале для установки необходимых пакетов.

```bash
sudo apt-get install -y  sed make binutils build-essential  gcc g++ bash patch gzip bzip2 perl  tar cpio unzip rsync file  bc wget python  cvs git mercurial rsync  subversion android-tools-mkbootimg vim  libssl-dev  android-tools-fastboot
```

Если вы обнаружите, что ваша виртуальная машина Ubuntu не может копировать команды из Windows при первом запуске, вам нужно вручную выполнить следующую команду для установки инструмента обмена буфером обмена между виртуальной машиной и Windows.

```bash
sudo apt install open-vm-tools-desktop
```

![ConfigHost_007](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_007.png)

После завершения установки нажмите кнопку питания в правом верхнем углу для перезагрузки системы Ubuntu или введите команду sudo reboot для перезагрузки.

Затем вы сможете копировать и вставлять файлы между Windows и Ubuntu.

![ConfigHost_008](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_008.png)

После этого шага вы можете продолжить получение исходного кода и начать разработку отладочной платы Dongshan Nezha STU на архитектуре RISC-V.
