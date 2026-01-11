# Компиляция и сборка системы с помощью buildroot-SDK

## Описание

* Данная система сборки основана на процессоре Allwinner RISC-V 64-bit D1-H, адаптирована для главной ветки buildroot 2022lts, совместима с проектами и компонентами 100ask, обеспечивает низкую связанность и высокую доступность. Используя различные спецификации buildroot external tree, различные проекты и компоненты управляются отдельно, что облегчает освоение и понимание.

## Получение исходного кода SDK

* По умолчанию весь исходный код хранится в репозитории GitHub. Используйте следующую команду для его получения:

```bash
book@virtual-machine:~$ git clone  https://github.com/DongshanPI/buildroot_dongshannezhastu
book@virtual-machine:~$ cd buildroot_dshannezhastu
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --init --recursive
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --recursive --remote
```

* Для пользователей из Китая, которые не могут получить доступ к GitHub, используйте зеркало Gitee:

```bash
book@virtual-machine:~$ git clone  https://gitee.com/weidognshan/buildroot_dongshannezhastu
book@virtual-machine:~$ cd buildroot_dshannezhastu
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --init --recursive
book@virtual-machine:~/buildroot_dongshannezhastu$ git submodule update --recursive --remote
```

## Установка необходимых зависимостей

### ubuntu-18.04

Среда выполнения была протестирована на ubuntu 18.04. Помимо предыдущей конфигурации, требуется установить следующие зависимости:

```bash
 sudo apt-get install -y  libncurses5-dev   u-boot-tools
```

После завершения установки выполните следующую команду для начала компиляции.

## Компиляция и запись минимальной системы

### Компиляция образа минимальной системы для SD-карты

```bash
book@virtual-machine:~/buildroot_dongshannezhastu$ cd buildroot-awol/
book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make  BR2_EXTERNAL="../br2lvgl  ../br2qt5 ../br2nezhastu"  dongshannezhastu_sdcard_core_defconfig

book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make
```

### Запись образа минимальной системы на SD-карту

После завершения компиляции файл dongshannezhastu-sdcard.img будет создан в директории output/images. Скопируйте файл на Windows и используйте win32diskimage для записи, или используйте команду dd if для записи на TF-карту, затем вставьте карту в отладочную плату для загрузки. Подробнее см. страницу [Быстрый старт](https://dongshanpi.com/DongshanNezhaSTU/03-QuickStart/#tf) слева.

### Компиляция образа минимальной системы для SPI NAND

```bash
book@virtual-machine:~/buildroot_dongshannezhastu$ cd buildroot-awol/
book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make  BR2_EXTERNAL="../br2lvgl  ../br2qt5 ../br2nezhastu"  dongshannezhastu_spinand_core_defconfig

book@virtual-machine:~/buildroot_dongshannezhastu/buildroot-awol$ make
```

### Запись образа минимальной системы на SPI NAND

После завершения компиляции файл d1-h-nezhastu_uart0.img будет создан в директории output/images. Скопируйте файл на Windows и используйте официальный инструмент Allwinner AllwinnertechPhoeniSuit для записи. Подробное описание процесса записи см. на странице [Быстрый старт](https://dongshanpi.com/DongshanNezhaSTU/03-QuickStart/#spi-nand) слева.
