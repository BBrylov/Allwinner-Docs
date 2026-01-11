# Установка и конфигурация среды разработки


## Получение системы виртуальной машины

### Загрузка инструмента виртуальной машины VMware

Откройте в браузере адрес https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html, как показано на рисунке стрелкой, нажмите для загрузки и установки версии VMware Workstation для Windows, нажмите **DOWNLOAD NOW**, чтобы начать загрузку.

![vmwareworkstation_download_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/vmwareworkstation_download_001.png)

После завершения загрузки установите, используя все конфигурации по умолчанию шаг за шагом.



### Получение образа системы Ubuntu

* Откройте в браузере https://www.linuxvmimages.com/images/ubuntu-1804/, найдите место, указанное стрелкой, как показано ниже, нажмите **VMware Image** для загрузки.

![linuxvmimage_downlaod_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/linuxvmimage_downlaod_001.png)

Процесс загрузки может занять от 10 до 30 минут, в зависимости от скорости интернета.



## Запуск системы виртуальной машины

1. Распакуйте архив образа системы виртуальной машины, после распаковки вы увидите следующие два файла, далее мы будем использовать конфигурационный файл с расширением .vmx.

![ConfigHost_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_003.png)

2. Откройте уже установленное программное обеспечение VMware Workstation, нажмите **Файл** в верхнем левом углу --> **Открыть**, найдите файл Ubuntu_18.04.6_VM_LinuxVMImages.COM.vmx, после чего появится новое окно диалога виртуальной машины.

![ConfigHost_004](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_004.png)

3. Как показано на рисунке ниже, это интерфейс конфигурации виртуальной машины, мы можем нажать на красный прямоугольник 2 "Изменить настройки виртуальной машины", чтобы настроить размер оперативной памяти виртуальной машины и количество процессоров. Рекомендуется минимум 4GB оперативной памяти и как минимум 4 процессора. После настройки можно нажать **Включить эту виртуальную машину**, чтобы запустить виртуальную машину.

![ConfigHost_005](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_005.png)

При первом открытии появится диалоговое окно с сообщением о том, что виртуальная машина скопирована, в этот момент нам просто нужно нажать "Я скопировал виртуальную машину", чтобы продолжить запуск системы виртуальной машины.

![ConfigHost_006](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_006.png)

Подождите несколько секунд, система автоматически запустится. После запуска щелкните мышью по надписи **Ubuntu**, чтобы войти в диалоговое окно входа, введите пароль ubuntu для входа в систему Ubuntu.

Примечание:

**Имя пользователя и пароль Ubuntu по умолчанию - ubuntu ubuntu**

**Имя пользователя и пароль Ubuntu по умолчанию - ubuntu ubuntu**

**Имя пользователя и пароль Ubuntu по умолчанию - ubuntu ubuntu**

**Ubuntu по умолчанию требует подключения к интернету. Если ваш компьютер с Windows уже может получить доступ к интернету, система Ubuntu автоматически использует сеть компьютера Windows для подключения к интернету.**



### Конфигурация среды разработки



* Установка необходимых пакетов программного обеспечения. Щелкните мышью для входа в интерфейс Ubuntu, одновременно нажмите на клавиатуре три клавиши **Ctrl + Alt + T**, чтобы быстро вызвать интерфейс терминала. После успешного вызова выполните следующую команду в терминале для установки необходимых пакетов зависимостей.

```bash
sudo apt-get install -y  sed make binutils build-essential  gcc g++ bash patch gzip bzip2 perl  tar cpio unzip rsync file  bc wget python  cvs git mercurial rsync  subversion android-tools-mkbootimg vim  libssl-dev  android-tools-fastboot
```

Если вы обнаружите, что ваша виртуальная машина Ubuntu при первом запуске не может копировать команды из Windows и вставлять в Ubuntu, то сначала нужно вручную ввести и выполнить следующую команду для установки пакета инструментов для совместного использования буфера обмена между виртуальной машиной и Windows.

```bash
sudo apt install open-vm-tools-desktop
```

![ConfigHost_007](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_007.png)

После завершения установки нажмите кнопку питания в правом верхнем углу для перезагрузки системы Ubuntu, или напрямую введите команду sudo reboot для перезагрузки.

В этот момент вы сможете вставлять файлы из Windows в Ubuntu или копировать файлы из Ubuntu.

![ConfigHost_008](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_008.png)

После выполнения этого шага можно продолжить получение исходного кода и начать путешествие разработки для отладочной платы RISC-V Dongshan Nezha STU.
