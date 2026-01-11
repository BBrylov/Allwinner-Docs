# Установка и конфигурация среды разработки

## Получение виртуальной машины

### Загрузка инструмента VMware

Откройте в браузере адрес https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html. Как показано на скриншоте, нажмите кнопку для загрузки Windows-версии VMware Workstation, нажмите **DOWNLOAD NOW** чтобы начать загрузку.

![vmwareworkstation_download_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/vmwareworkstation_download_001.png)

После завершения загрузки установите программу, используя все параметры по умолчанию.

### Получение образа системы Ubuntu

* Откройте в браузере https://www.linuxvmimages.com/images/ubuntu-1804/. Найдите расположение, указанное стрелкой, и нажмите **VMware Image** для загрузки.

![linuxvmimage_downlaod_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/linuxvmimage_downlaod_001.png)

Процесс загрузки может занять от 10 до 30 минут, в зависимости от скорости интернета.

## Запуск виртуальной машины

1. Распакуйте архив образа виртуальной машины. После распаковки вы найдете два файла, как показано на скриншоте. Мы будем использовать файл конфигурации с расширением .vmx.

![ConfigHost_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_003.png)

2. Откройте установленную программу VMware Workstation, нажмите **Файл** --> **Открыть** в верхнем левом углу, найдите файл Ubuntu_18.04.6_VM_LinuxVMImages.COM.vmx, после чего откроется диалоговое окно новой виртуальной машины.

![ConfigHost_004](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_004.png)

3. На скриншоте ниже показан экран конфигурации виртуальной машины. Вы можете нажать на красную рамку 2 "Редактировать параметры виртуальной машины", чтобы отрегулировать объем памяти и количество процессоров виртуальной машины. Рекомендуется установить объем памяти не менее 4 ГБ и минимум 4 процессора. После настройки нажмите **Включить эту виртуальную машину**, чтобы запустить её.

![ConfigHost_005](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_005.png)

При первом открытии появится диалоговое окно с вопросом о копировании виртуальной машины. Просто нажмите **Я скопировал эту виртуальную машину**, чтобы продолжить загрузку системы.

![ConfigHost_006](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_006.png)

Через несколько секунд система запустится автоматически. Щелкните на надпись **Ubuntu**, чтобы открыть окно входа, затем введите пароль ubuntu для входа в систему Ubuntu.

Примечание:

**По умолчанию имя пользователя и пароль Ubuntu: ubuntu ubuntu**

**По умолчанию имя пользователя и пароль Ubuntu: ubuntu ubuntu**

**По умолчанию имя пользователя и пароль Ubuntu: ubuntu ubuntu**

**Ubuntu требует подключения к интернету. Если ваш компьютер Windows уже имеет доступ в Интернет, система Ubuntu автоматически будет использовать сетевое подключение Windows для подключения к интернету.**

### Конфигурация среды разработки

* Установите необходимые пакеты. Щелкните, чтобы перейти в окно Ubuntu, затем одновременно нажмите **Ctrl + Alt + T** для открытия терминала. После открытия терминала выполните следующую команду для установки необходимых зависимостей:

```bash
sudo apt-get install -y  sed make binutils build-essential  gcc g++ bash patch gzip bzip2 perl  tar cpio unzip rsync file  bc wget python  cvs git mercurial rsync  subversion android-tools-mkbootimg vim  libssl-dev  android-tools-fastboot
```

Если вы обнаружите, что при первом запуске виртуальной машины Ubuntu невозможно вставить команды скопированные из Windows, вам нужно сначала вручную ввести следующую команду для установки инструмента совместного буфера обмена между виртуальной машиной и Windows:

```bash
sudo apt install open-vm-tools-desktop
```

![ConfigHost_007](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_007.png)

После завершения установки щелкните кнопку питания в правом верхнем углу, чтобы перезагрузить систему Ubuntu, или введите команду sudo reboot для перезагрузки.

Теперь вы можете копировать и вставлять файлы между Windows и Ubuntu.

![ConfigHost_008](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_008.png)

После выполнения этого шага вы можете перейти к следующему этапу - получению исходного кода и начать разработку на отладочной плате RISC-V Dongshan Nezha STU.
