# Компиляция приложения Helloword

Перед началом кросс-компиляции необходимо указать папку, в которой хранятся файлы библиотек и заголовков, необходимые для кросс-компиляции.

```
export STAGING_DIR=~/tina-v853-open/prebuilt/rootfsbuilt/arm/toolchain-sunxi-musl-gcc-830/toolchain/arm-openwrt-linux-muslgnueabi
```

Например:

```
book@100ask:~/workspaces/helloword$ export STAGING_DIR=~/tina-v853-open/prebuilt/rootfsbuilt/arm/toolchain-sunxi-musl-gcc-830/toolchain/arm-openwrt-linux-muslgnueabi
```

### 1. Написание приложения helloword

Исходный код helloword.c выглядит следующим образом. После того как вы выполнили команду source build/envsetup.sh на предыдущем шаге, введите в терминал: gedit helloword.c, откроется текстовый редактор. Вставьте следующий код в редактор, затем нажмите Ctrl + S для сохранения и закройте редактор, нажав X в верхнем правом углу:

```
#include <stdio.h>
int main (void)
{
    printf("hello word!\n");
    return 0;
}
```

После написания и сохранения кода в файл helloword.c выполните следующую команду компиляции:

```
book@100ask:~/workspaces/helloword$ ~/tina-v853-open/prebuilt/rootfsbuilt/arm/toolchain-sunxi-musl-gcc-830/toolchain/bin/arm-openwrt-linux-gcc -o hello helloword.c
```

После завершения компиляции вы можете выполнить команду file hello для проверки типа файла скомпилированного приложения и убедиться, что это исполняемый файл архитектуры ARM.

```
book@100ask:~/workspaces/helloword$ file hello
hello: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), dynamically linked, interpreter /lib/ld-musl-armhf.so.1, with debug_info, not stripped
```

### 2. Загрузка программы на отладочную плату и её выполнение

Скопируйте скомпилированный файл **hello** на отладочную плату с помощью команды adb:

```
adb push hello /root/
```

После завершения передачи выполните на отладочной плате следующие операции для добавления прав доступа на выполнение и запуска программы:

```
chmod +x hello
./helloword
```

![image-20230627141803244](http://photos.100ask.net/allwinner-docs/v853/LinuxEnv/image-20230627141803244.png)
