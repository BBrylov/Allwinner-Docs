# Компиляция с использованием buildroot-SDK

## Введение

* Данная система сборки основана на чипе Allwinner T113-S3, адаптирована к основной версии buildroot 2022lts, совместима с проектами курсов и связанными компонентами 100ASK. Система реализует низкую связанность и высокую доступность, используя разные спецификации buildroot external tree для раздельного управления различными проектами и компонентами, что облегчает освоение и способствует лучшему пониманию.

## Установка необходимых зависимостей

### ubuntu-18.04

Конфигурация среды выполнения: Данная система была протестирована на ubuntu18.04. Помимо базовой установки требуется установить следующие необходимые зависимости:

```bash
book@100ask:~$  sudo apt-get install build-essential subversion git-core libncurses5-dev zlib1g-dev gawk flex quilt libssl-dev xsltproc libxml-parser-perl mercurial bzr ecj cvs unzip lib32z1 lib32z1-dev lib32stdc++6 libstdc++6 libncurses-dev   u-boot-tools -y
```

* После завершения установки выполните следующую команду для начала процесса компиляции.

## Получение исходного кода SDK

* По умолчанию весь исходный код хранится в репозитории GitHub. Используйте следующую команду для получения кода:

```bash
book@100ask:~$ git clone  https://github.com/DongshanPI/buildroot-100ask_t113-pro
book@100ask:~$ cd buildroot-100ask_t113-pro/
book@100ask:~/buildroot-100ask_t113-pro$ git submodule update --init --recursive
book@100ask:~/buildroot-100ask_t113-pro$ git submodule update --recursive --remote
book@100ask:~/buildroot-100ask_t113-pro$ cd  buildroot/
book@100ask:~/buildroot-100ask_t113-pro/buildroot$ git submodule update --init --recursive

```

* Для пользователей из стран, где доступ к GitHub невозможен, рекомендуется использовать резервный репозиторий Gitee в Китае:

```bash
book@100ask:~$ git clone  https://gitee.com/weidongshan/buildroot-100ask_t113-pro
book@100ask:~$ cd buildroot-100ask_t113-pro/
book@100ask:~/buildroot-100ask_t113-pro$ git submodule update --init --recursive
book@100ask:~/buildroot-100ask_t113-pro$ git submodule update --recursive --remote
book@100ask:~/buildroot-100ask_t113-pro$ cd  buildroot/
book@100ask:~/buildroot-100ask_t113-pro/buildroot$ git submodule update --init --recursive
```

## Компиляция и запись минимальной системы

### Компиляция образа минимальной системы для sdcard

```bash
book@100ask:~/buildroot-100ask_t113-pro/buildroot$ make  BR2_EXTERNAL="../br2t113pro ../br2lvgl "  100ask_t113-pro_sdcard_core_defconfig
book@100ask:~/buildroot-100ask_t113-pro/buildroot$ make  V=1

```

### Запись образа минимальной системы на sdcard

После завершения компиляции в директории output/images будет создан файл sdcard.img. Скопируйте файл на Windows и используйте win32diskimage для записи, или используйте команду dd для записи на TF-карту. Затем вставьте карту в отладочную плату для загрузки. Подробнее см. страницу [Быстрый старт](https://dongshanpi.com/DongshanNezhaSTU/03-QuickStart/#tf)

### Компиляция образа минимальной системы для SPI NAND

```bash
book@100ask:~/buildroot-100ask_t113-pro/buildroot$ make   BR2_EXTERNAL="../br2t113pro  ../br2lvgl"  100ask_t113-pro_spinand_core_defconfig
book@100ask:~/buildroot-100ask_t113-pro/buildroot$ make  V=1
```

### Запись образа минимальной системы на SPI NAND

После завершения компиляции в директории output/images будет создан файл buildroot_linux_nand_uart3.img. Скопируйте файл на Windows и используйте официальный инструмент Allwinner AllwinnertechPhoeniSuit для записи. Подробное руководство по записи см. на странице [Быстрый старт](https://dongshanpi.com/DongshanNezhaSTU/03-QuickStart/#spi-nand).
