# Выполнение программы Hello World


## Конфигурация окружения разработки

Сначала нам нужно получить цепочку инструментов кросс-компиляции.

## Получение цепочки инструментов кросс-компиляции

Наш исходный код хранится в различных репозиториях Git. GitHub является основным местом размещения и имеет наиболее актуальное состояние. Gitee также используется в качестве резервного сайта. Пожалуйста, выбирайте в зависимости от вашей ситуации.

* Если вы имеете доступ к GitHub, используйте следующую команду для получения исходного кода

```bash
git clone https://github.com/DongshanPI/eLinuxCore_100ask-t113-pro.git
cd  eLinuxCore_100ask-t113-pro
git submodule update  --init --recursive
```



* Если вы не имеете доступа к GitHub, используйте следующую команду для получения исходного кода.

```bash
git clone https://gitee.com/weidongshan/eLinuxCore_100ask-t113-pro.git
cd  eLinuxCore_100ask-t113-pro
git submodule update  --init --recursive
```



После получения исходного кода необходимо войти в путь цепочки инструментов кросс-компиляции и проверить, доступна ли она.

```bash
book@virtual-machine:~/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin$ ./arm-linux-gnueabi-gcc -v
Using built-in specs.
COLLECT_GCC=./arm-linux-gnueabi-gcc
COLLECT_LTO_WRAPPER=/home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin/../libexec/gcc/arm-linux-gnueabi/7.2.1/lto-wrapper
Target: arm-linux-gnueabi
Configured with: '/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/snapshots/gcc.git~linaro-7.2-2017.11/configure' SHELL=/bin/bash --with-mpc=/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/_build/builds/destdir/x86_64-unknown-linux-gnu --with-mpfr=/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/_build/builds/destdir/x86_64-unknown-linux-gnu --with-gmp=/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/_build/builds/destdir/x86_64-unknown-linux-gnu --with-gnu-as --with-gnu-ld --disable-libmudflap --enable-lto --enable-shared --without-included-gettext --enable-nls --disable-sjlj-exceptions --enable-gnu-unique-object --enable-linker-build-id --disable-libstdcxx-pch --enable-c99 --enable-clocale=gnu --enable-libstdcxx-debug --enable-long-long --with-cloog=no --with-ppl=no --with-isl=no --disable-multilib --with-float=soft --with-mode=thumb --with-tune=cortex-a9 --with-arch=armv7-a --enable-threads=posix --enable-multiarch --enable-libstdcxx-time=yes --enable-gnu-indirect-function --with-build-sysroot=/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/_build/sysroots/arm-linux-gnueabi --with-sysroot=/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/_build/builds/destdir/x86_64-unknown-linux-gnu/arm-linux-gnueabi/libc --enable-checking=release --disable-bootstrap --enable-languages=c,c++,fortran,lto --build=x86_64-unknown-linux-gnu --host=x86_64-unknown-linux-gnu --target=arm-linux-gnueabi --prefix=/home/tcwg-buildslave/workspace/tcwg-make-release/builder_arch/amd64/label/tcwg-x86_64-build/target/arm-linux-gnueabi/_build/builds/destdir/x86_64-unknown-linux-gnu
Thread model: posix
gcc version 7.2.1 20171011 (Linaro GCC 7.2-2017.11)

```

После завершения мы можем добавить ее в переменную окружения PATH системы.

Сначала нам нужно получить абсолютный путь, где находится цепочка инструментов кросс-компиляции. Войдите в каталог <code>eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin</code> и выполните команду **pwd**, чтобы получить абсолютный путь ` /home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin` .

```bash
book@virtual-machine:~/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin$ pwd
/home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin
```

Затем вы можете выполнить следующую команду в терминале, чтобы добавить это в переменную окружения системы, чтобы вы могли выполнять цепочку инструментов кросс-компиляции из любого места.

```bash
export PATH=$PATH:/home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin
```

Внимание: этот метод действует только для текущего терминала. Если вы закроете этот терминал и откроете его снова, вам нужно будет выполнить команду еще раз.

Есть еще один способ сделать это постоянно - записать в переменную окружения системы. Вам нужно изменить файл **/etc/environment** и добавить абсолютный путь цепочки инструментов кросс-компиляции в конец. Обратите внимание, что для внесения изменений необходимо использовать команду sudo.

```bash
book@virtual-machine:~$ cat /etc/environment
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin"
```



## Написание программы Hello World

* После конфигурации цепочки инструментов кросс-компиляции вы можете начать писать наше приложение. Ниже приведена самая простая программа Hello World.

```c
#include <stdio.h>
int main (void)
{
    printf("hello word!\n");
    return 0;
}
```

После написания сохраните файл как helloword.c

Затем выполните следующую команду компиляции

```bash
book@virtual-machine:~$ vim helloword.c
book@virtual-machine:~$ arm-linux-gnueabi-gcc -o helloword helloword.c
```

## Копирование на отладочную плату

Как скопировать файл на отладочную плату? Вы можете использовать USB-диск, ADB, сеть, последовательный порт и т.д.

Мы рекомендуем использовать сетевой метод. Есть много способов передачи по сети: TFTP, NFS, SFTP. Для NFS требуется поддержка файловой системы NFS в ядре. Для SFTP требуется поддержка компонента openssh в корневой файловой системе. Поэтому мы выбираем TFTP.



### Использование метода USB ADB

* Сначала подключите кабель OTG отладочной платы. Система автоматически запустит службу ADB при загрузке, в результате чего компьютер выведет устройство. Введите выведенное устройство в виртуальную машину VMware и подключитесь к Ubuntu.

* Затем я могу использовать команду adb push для загрузки файла. Перед началом загрузки вы можете использовать команду adb devices для проверки подключения отладочной платы к системе.

* В следующем примере используется команда adb для загрузки helloword в каталог /root отладочной платы.

```shell
adb push helloword /root
```



## Выполнение

После загрузки программы вам нужно использовать команду chmod +x, чтобы добавить права на выполнение для программы. Затем вы можете выполнить это приложение hello world.

```bash
# chmod +x helloword
# ./helloword
hello word!
#
```
