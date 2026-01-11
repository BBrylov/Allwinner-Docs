# Выполнение вывода Hello World



## Конфигурация среды разработки

Прежде всего, нам нужно получить цепочку инструментов кросс-компиляции для отладочной платы Dongshan Nezha STU. Поскольку изначальная цепочка инструментов предоставлена Alibaba Pingtou Ge, их цепочка инструментов имеет некоторые отличия от стандартной цепочки инструментов сообщества GNU, поэтому мы временно не можем использовать версию сообщества.

Поскольку в настоящее время цепочка инструментов не предоставляется для Windows, работа возможна только в Linux. Пожалуйста, обратитесь к вышеуказанному разделу о конфигурации виртуальной машины Ubuntu и выполните конфигурацию.



## Получение цепочки инструментов кросс-компиляции

Весь наш исходный код хранится в различных git-репозиториях, среди которых GitHub является основным хостингом и имеет самое актуальное состояние, также используется Gitee в качестве резервного сайта, выберите в соответствии с вашей реальной ситуацией.

* Для студентов, которые могут получить доступ к GitHub, используйте следующие команды для получения исходного кода

```bash
git clone https://github.com/DongshanPI/eLinuxCore_dongshannezhastu
cd  eLinuxCore_dongshannezhastu
git submodule update  --init --recursive
```



* Для студентов, которые не могут получить доступ к GitHub, используйте следующие команды для получения исходного кода.

```bash
git clone https://gitee.com/weidongshan/eLinuxCore_dongshannezhastu.git
cd  eLinuxCore_dongshannezhastu
git submodule update  --init --recursive
```



После получения исходного кода необходимо войти в путь цепочки инструментов кросс-компиляции для проверки её работоспособности.

```bash
book@virtual-machine:~/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin$ ./riscv64-unknown-linux-gnu-gcc -v
Using built-in specs.
COLLECT_GCC=./riscv64-unknown-linux-gnu-gcc
COLLECT_LTO_WRAPPER=/home/book/NezhaSTU/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin/../libexec/gcc/riscv64-unknown-linux-gnu/8.1.0/lto-wrapper
Target: riscv64-unknown-linux-gnu
Configured with: /ldhome/software/toolsbuild/slave/workspace/riscv64_build_linux_x86_64/build/../source/riscv/riscv-gcc/configure --target=riscv64-unknown-linux-gnu --with-mpc=/ldhome/software/toolsbuild/slave/workspace/riscv64_build_linux_x86_64/lib-for-gcc-x86_64-linux/ --with-mpfr=/ldhome/software/toolsbuild/slave/workspace/riscv64_build_linux_x86_64/lib-for-gcc-x86_64-linux/ --with-gmp=/ldhome/software/toolsbuild/slave/workspace/riscv64_build_linux_x86_64/lib-for-gcc-x86_64-linux/ --prefix=/ldhome/software/toolsbuild/slave/workspace/riscv64_build_linux_x86_64/install --with-sysroot=/ldhome/software/toolsbuild/slave/workspace/riscv64_build_linux_x86_64/install/sysroot --with-system-zlib --enable-shared --enable-tls --enable-languages=c,c++,fortran --disable-libmudflap --disable-libssp --disable-libquadmath --disable-nls --disable-bootstrap --src=../../source/riscv/riscv-gcc --enable-checking=yes --with-pkgversion='C-SKY RISCV Tools V1.8.4 B20200702' --enable-multilib --with-abi=lp64d --with-arch=rv64gcxthead 'CFLAGS_FOR_TARGET=-O2  -mcmodel=medany' 'CXXFLAGS_FOR_TARGET=-O2  -mcmodel=medany' CC=gcc CXX=g++
Thread model: posix
gcc version 8.1.0 (C-SKY RISCV Tools V1.8.4 B20200702)

```

После завершения мы можем добавить её в системную переменную окружения PATH.

Сначала нужно получить абсолютный путь, где находится цепочка инструментов кросс-компиляции, войдите в директорию <code>eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin</code> и выполните команду **pwd**, чтобы получить абсолютный путь `/home/book/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin`.

```bash
book@virtual-machine:~/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin$ pwd
/home/book/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin
```

Далее в терминале выполните следующую команду, чтобы добавить это в системную переменную окружения, таким образом можно будет выполнять цепочку инструментов кросс-компиляции из любого местоположения.

```bash
export PATH=$PATH:/home/book/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin
```

Примечание: этот метод действителен только для текущего терминала. Если вы закроете этот терминал и откроете снова, команду нужно будет выполнить повторно.

Есть также другой способ для постоянного действия - записать в системные переменные окружения. Необходимо изменить **/etc/environment**, добавив в конец полученный абсолютный путь цепочки инструментов кросс-компиляции. Обратите внимание, что для изменения требуется использовать команду sudo.

```bash
book@virtual-machine:~$ cat /etc/environment
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/book/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin"
```



## Написание программы Hello World

* После конфигурации цепочки инструментов кросс-компиляции можно начать писать наше приложение. Ниже приведена самая простая программа вывода Hello World.

```c
#include <stdio.h>
int main (void)
{
    printf("hello word!\n");
    return 0;
}
```

После написания сохраните в файл helloword.c

Затем выполните следующую команду компиляции для компиляции

```bash
book@virtual-machine:~$ vim helloword.c
book@virtual-machine:~$ riscv64-unknown-linux-gnu-gcc -o helloword helloword.c
book@virtual-machine:~$ file helloword
helloword: ELF 64-bit LSB executable, UCB RISC-V, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-riscv64xthead-lp64d.so.1, for GNU/Linux 4.15.0, with debug_info, not stripped
```

## Копирование на отладочную плату

Как скопировать файлы на отладочную плату? Есть USB-накопитель, ADB, сеть, последовательный порт и т.д.

Мы рекомендуем использовать в первую очередь сетевой способ. Сетевые способы тоже разные: есть передача TFTP, передача NFS, передача SFTP. Среди них передача NFS требует поддержки файловой системы NFS в ядре, SFTP требует поддержки компонента openssh в корневой файловой системе, поэтому в итоге мы выбираем сервис TFTP.

### Использование сетевого сервиса TFTP

1. Прежде всего, необходимо, чтобы ваша система Ubuntu поддерживала сервис TFTP, был установлен и настроен, затем скопируйте скомпилированную программу helloword в директорию TFTP.

```bash
book@virtual-machine:~$ cp helloword ~/tftpboot/
book@virtual-machine:~$ ls ~/tftpboot/helloword
/home/book/tftpboot/helloword
book@virtual-machine:~$
```

2. Войдите на отладочную плату, сначала позвольте отладочной плате получить IP-адрес и убедитесь, что она может пинговать систему Ubuntu (здесь имеется в виду хост, который компилировал helloword), затем на отладочной плате получите приложение helloword и выполните его.

```bash
# udhcpc
udhcpc: started, v1.35.0
udhcpc: broadcasting discover
udhcpc: broadcasting select for 192.168.1.47, server 192.168.1.1
udhcpc: lease of 192.168.1.47 obtained from 192.168.1.1, lease time 86400
deleting routers
adding dns 192.168.1.1
# tftp -g -r helloword 192.168.1.133
# ls
helloword

```

Как показано выше, IP-адрес моего хоста Ubuntu - 192.168.1.133, поэтому используя TFTP получаем программу helloword с Ubuntu, скорость получения зависит от скорости сети.



### Использование USB ADB способа

* Далее мы расскажем, как использовать USB OTG и команду ADB для передачи файлов.





## Выполнение

После загрузки программы необходимо использовать команду chmod +x для добавления прав на выполнение программы, после этого мы сможем выполнить это приложение helloword.

```bash
# chmod +x helloword
# ./helloword
hello word!
#
```
