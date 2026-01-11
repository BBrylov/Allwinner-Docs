# Использование Buildroot-SDK для компиляции и сборки системы

## Введение

* Эта система сборки основана на чипе Allwinner RISCV-64 Linux D1-H, адаптирована к основной версии buildroot 2022 LTS, совместима с проектными курсами и соответствующими компонентами 100ask, действительно достигнута низкая связанность и высокая доступность. Используя различные спецификации buildroot external tree, различные проекты и различные компоненты управляются отдельно, что делает их более легкими для освоения и понимания.

## Получение исходного кода SDK

* По умолчанию весь исходный код хранится в репозитории GitHub, используйте следующие команды для получения


```bash
book@virtual-machine:~$ git clone  https://github.com/DongshanPI/buildroot_dongshannezhastu
book@virtual-machine:~$ cd buildroot_dshannezhastu
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --init --recursive
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --recursive --remote
```



* Для студентов в стране, которые не могут получить доступ к GitHub, можно использовать резервный сайт Gitee в стране, следующие команды.

```bash
book@virtual-machine:~$ git clone  https://gitee.com/weidognshan/buildroot_dongshannezhastu
book@virtual-machine:~$ cd buildroot_dshannezhastu
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --init --recursive
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --recursive --remote
```

## Установка необходимых пакетов зависимостей

### Ubuntu-18.04

Конфигурация среды выполнения: Эта система была проверена на Ubuntu 18.04, на основе предыдущего необходимо установить следующие необходимые зависимости

```bash
 sudo apt-get install -y  libncurses5-dev   u-boot-tools
```

После завершения установки выполните следующую команду для начала операции компиляции.


## Компиляция и запись минимальной системы

### Компиляция образа минимальной системы для SD-карты

```bash
book@virtual-machine:~/buildroot_dongshannezhastu$ cd buildroot-awol/
book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make  BR2_EXTERNAL="../br2lvgl  ../br2qt5 ../br2nezhastu"  dongshannezhastu_sdcard_core_defconfig

book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make
```

### Запись образа минимальной системы на SD-карту

После завершения компиляции в директории output/images будет создан файл dongshannezhastu-sdcard.img, скопируйте файл в систему Windows и используйте win32diskimage для записи, или используйте dd if для записи на TF-карту,
затем вставьте в отладочную плату для загрузки. Пожалуйста, обратитесь к странице [Быстрый старт](https://dongshanpi.com/DongshanNezhaSTU/03-QuickStart/#tf) слева



### Компиляция образа минимальной системы для SPI NAND
```bash
book@virtual-machine:~/buildroot_dongshannezhastu$ cd buildroot-awol/
book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make  BR2_EXTERNAL="../br2lvgl  ../br2qt5 ../br2nezhastu"  dongshannezhastu_spinand_core_defconfig

book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make
```


### Запись образа минимальной системы на SPI NAND

После завершения компиляции в директории output/images будет создан файл d1-h-nezhastu_uart0.img, скопируйте файл в систему Windows и используйте официальный инструмент Allwinner AllwinnertechPhoeniSuit для записи.
Подробные шаги записи см. на странице [Быстрый старт](https://dongshanpi.com/DongshanNezhaSTU/03-QuickStart/#spi-nand) слева.
