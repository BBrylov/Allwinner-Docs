# Установка и конфигурация среды разработки


## Получение системы виртуальной машины

### Загрузка инструмента виртуальной машины VMware

Откройте в браузере адрес https://www.vmware.com/products/workstation-pro/workstation-pro-evaluation.html. Как показано на рисунке ниже, нажмите для загрузки и установки VMware Workstation для Windows, нажмите **DOWNLOAD NOW** для начала загрузки.

![vmwareworkstation_download_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/vmwareworkstation_download_001.png)

После завершения загрузки используйте конфигурацию по умолчанию и установите шаг за шагом.



### Получение образа системы Ubuntu

* Откройте в браузере https://www.linuxvmimages.com/images/ubuntu-1804/ и найдите место, указанное стрелкой ниже, нажмите **VMware Image** для загрузки.

![linuxvmimage_downlaod_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/linuxvmimage_downlaod_001.png)

Процесс загрузки может занять от 10 до 30 минут в зависимости от скорости интернет-соединения.



## Запуск системы виртуальной машины

1. Распакуйте архив образа виртуальной машины. После распаковки вы увидите два файла, как показано ниже. Далее мы будем использовать файл конфигурации с расширением .vmx.

![ConfigHost_003](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_003.png)

2. Откройте уже установленное программное обеспечение VMware Workstation, нажмите **Файл** в левом верхнем углу --> **Открыть**, найдите файл Ubuntu_18.04.6_VM_LinuxVMImages.COM.vmx, после чего откроется диалоговое окно новой виртуальной машины.

![ConfigHost_004](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_004.png)

3. Как показано на рисунке ниже, это интерфейс конфигурации нашей виртуальной машины. Мы можем нажать на красную рамку 2 "Изменить параметры виртуальной машины", чтобы настроить размер оперативной памяти и количество процессоров виртуальной машины. Рекомендуется использовать память не менее 4 ГБ и как минимум 4 процессора. После настройки можно нажать **Запустить эту виртуальную машину** для запуска.

![ConfigHost_005](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_005.png)

При первом открытии появится диалоговое окно о том, что виртуальная машина была скопирована. В этом случае нам нужно только нажать "Я скопировал виртуальную машину", чтобы продолжить загрузку системы виртуальной машины.

![ConfigHost_006](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_006.png)

Подождите несколько секунд, и система автоматически запустится. После загрузки щелкните мышью на надписи **Ubuntu**, чтобы войти в диалоговое окно входа, введите пароль ubuntu для входа в систему Ubuntu.

Примечание:

**Имя пользователя и пароль по умолчанию для Ubuntu: ubuntu ubuntu**

**Имя пользователя и пароль по умолчанию для Ubuntu: ubuntu ubuntu**

**Имя пользователя и пароль по умолчанию для Ubuntu: ubuntu ubuntu**

**Ubuntu по умолчанию требует подключения к сети. Если ваш компьютер с Windows уже имеет доступ к Интернету, система Ubuntu автоматически будет использовать сеть компьютера Windows для подключения к Интернету.**



### Конфигурация среды разработки



* Установка необходимых пакетов. Щелкните мышью, чтобы войти в интерфейс Ubuntu, одновременно нажмите клавиши **Ctrl + Alt + T**, чтобы быстро вызвать интерфейс терминала. После успешного вызова выполните следующую команду в терминале для установки необходимых зависимостей.

```bash
sudo apt-get install -y  sed make binutils build-essential  gcc g++ bash patch gzip bzip2 perl  tar cpio unzip rsync file  bc wget python  cvs git mercurial rsync  subversion android-tools-mkbootimg vim  libssl-dev  android-tools-fastboot
```

Если вы обнаружили, что при первом запуске виртуальной машины Ubuntu невозможно скопировать команду из Windows и вставить ее в Ubuntu, вам нужно вручную ввести и выполнить следующую команду для установки пакета инструментов для совместного использования буфера обмена между виртуальной машиной и Windows.

```bash
sudo apt install open-vm-tools-desktop
```

![ConfigHost_007](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_007.png)

После завершения установки нажмите кнопку питания в правом верхнем углу, чтобы перезагрузить систему Ubuntu, или напрямую введите команду sudo reboot для перезагрузки.

Теперь вы можете вставлять файлы из Windows в Ubuntu или копировать файлы из Ubuntu.

![ConfigHost_008](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/ConfigHost_008.png)

После выполнения этого шага можно продолжить получение исходного кода и начать путешествие по разработке на отладочной плате Dongshan Nezha STU RISC-V.
