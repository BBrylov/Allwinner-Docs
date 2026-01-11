# Компиляция и выполнение драйвера Hello World

## Конфигурация окружения разработки

Сначала нам нужно получить соответствующую цепочку инструментов кросс-компиляции.

Поскольку в настоящее время не предоставляется версия цепочки инструментов для Windows, это можно сделать только в Linux. Сначала обратитесь к предыдущему разделу о конфигурации виртуальной машины Ubuntu и выполните конфигурацию.


## Получение исходного кода ядра

Наш исходный код хранится в различных репозиториях Git. GitHub является основным местом размещения и имеет наиболее актуальное состояние. Gitee также используется в качестве резервного сайта. Пожалуйста, выбирайте в зависимости от вашей ситуации.

* Если вы имеете доступ к GitHub, используйте следующую команду для получения исходного кода

```bash
git clone https://github.com/DongshanPI/eLinuxCore_100ask-t113-pro
cd  eLinuxCore_100ask-t113-pro
git submodule update  --init --recursive
```


* Если вы не имеете доступа к GitHub, используйте следующую команду для получения исходного кода.

```bash
git clone https://gitee.com/weidongshan/eLinuxCore_100ask-t113-pro.git
cd  eLinuxCore_100ask-t113-pro
git submodule update  --init --recursive
```


## Конфигурация окружения компиляции ядра

```bash
export PATH=$PATH:/home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin
export ARCH=arm
export CROSS_COMPILE=arm-linux-gnueabi-
```

```bash
sun8iw20p1smp_defconfigbook@100ask:~/eLinuxCore_100ask-t113-pro/linux$ export ARCH=arm
book@100ask:~/eLinuxCore_100ask-t113-pro/linux$ export CROSS_COMPILE=arm-linux-gnueabi-
book@100ask:~/eLinuxCore_100ask-t113-pro/linux$ export PATH=$PATH:/home/book/eLinuxCore_100ask-t113-pro/toolchain/gcc-linaro-7.2.1-2017.11-x86_64_arm-linux-gnueabi/bin
book@100ask:~/NezhaSTU/eLinuxCore_100ask-t113-pro/linux$ make sun8iw20p1smp_defconfig
  HOSTCC  scripts/basic/fixdep
  HOSTCC  scripts/kconfig/conf.o
  HOSTCC  scripts/kconfig/confdata.o
  HOSTCC  scripts/kconfig/expr.o
  LEX     scripts/kconfig/lexer.lex.c
  YACC    scripts/kconfig/parser.tab.[ch]
  HOSTCC  scripts/kconfig/lexer.lex.o
  HOSTCC  scripts/kconfig/parser.tab.o
  HOSTCC  scripts/kconfig/preprocess.o
  HOSTCC  scripts/kconfig/symbol.o
  HOSTLD  scripts/kconfig/conf
#
# configuration written to .config
#
book@100ask:~/eLinuxCore_100ask-t113-pro/linux$ make zImage -j8

```



## Написание драйвера Hello World

hello_drv.c

```c
#include <linux/module.h>

#include <linux/fs.h>
#include <linux/errno.h>
#include <linux/miscdevice.h>
#include <linux/kernel.h>
#include <linux/major.h>
#include <linux/mutex.h>
#include <linux/proc_fs.h>
#include <linux/seq_file.h>
#include <linux/stat.h>
#include <linux/init.h>
#include <linux/device.h>
#include <linux/tty.h>
#include <linux/kmod.h>
#include <linux/gfp.h>

/* 1. Определение основного номера устройства                                    */
static int major = 0;
static char kernel_buf[1024];
static struct class *hello_class;


#define MIN(a, b) (a < b ? a : b)

/* 3. Реализация соответствующих функций open/read/write и заполнение структуры file_operations */
static ssize_t hello_drv_read (struct file *file, char __user *buf, size_t size, loff_t *offset)
{
	int err;
	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	err = copy_to_user(buf, kernel_buf, MIN(1024, size));
	return MIN(1024, size);
}

static ssize_t hello_drv_write (struct file *file, const char __user *buf, size_t size, loff_t *offset)
{
	int err;
	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	err = copy_from_user(kernel_buf, buf, MIN(1024, size));
	return MIN(1024, size);
}

static int hello_drv_open (struct inode *node, struct file *file)
{
	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	return 0;
}

static int hello_drv_close (struct inode *node, struct file *file)
{
	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	return 0;
}

/* 2. Определение собственной структуры file_operations */
static struct file_operations hello_drv = {
	.owner	 = THIS_MODULE,
	.open    = hello_drv_open,
	.read    = hello_drv_read,
	.write   = hello_drv_write,
	.release = hello_drv_close,
};

/* 4. Сообщить ядру о структуре file_operations: регистрация драйвера */
/* 5. Кто должен регистрировать драйвер? Должна быть функция входа: при установке драйвера она будет вызвана */
static int __init hello_init(void)
{
	int err;

	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	major = register_chrdev(0, "hello", &hello_drv);  /* /dev/hello */


	hello_class = class_create(THIS_MODULE, "hello_class");
	err = PTR_ERR(hello_class);
	if (IS_ERR(hello_class)) {
		printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
		unregister_chrdev(major, "hello");
		return -1;
	}

	device_create(hello_class, NULL, MKDEV(major, 0), NULL, "hello"); /* /dev/hello */

	return 0;
}

/* 6. Если есть функция входа, должна быть функция выхода: при удалении драйвера она будет вызвана */
static void __exit hello_exit(void)
{
	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	device_destroy(hello_class, MKDEV(major, 0));
	class_destroy(hello_class);
	unregister_chrdev(major, "hello");
}


/* 7. Другие улучшения: предоставление информации об устройстве, автоматическое создание узла устройства */

module_init(hello_init);
module_exit(hello_exit);

MODULE_LICENSE("GPL");
```

```c

#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <stdio.h>
#include <string.h>

/*
 * ./hello_drv_test -w abc
 * ./hello_drv_test -r
 */
int main(int argc, char **argv)
{
	int fd;
	char buf[1024];
	int len;

	/* 1. Проверка параметров */
	if (argc < 2)
	{
		printf("Usage: %s -w <string>\n", argv[0]);
		printf("       %s -r\n", argv[0]);
		return -1;
	}

	/* 2. Открытие файла */
	fd = open("/dev/hello", O_RDWR);
	if (fd == -1)
	{
		printf("can not open file /dev/hello\n");
		return -1;
	}

	/* 3. Запись или чтение файла */
	if ((0 == strcmp(argv[1], "-w")) && (argc == 3))
	{
		len = strlen(argv[2]) + 1;
		len = len < 1024 ? len : 1024;
		write(fd, argv[2], len);
	}
	else
	{
		len = read(fd, buf, 1024);
		buf[1023] = '\0';
		printf("APP read : %s\n", buf);
	}

	close(fd);

	return 0;
}

```



Makefile:

```makefile

# 1. При использовании разных ядер для разных плат обязательно измените KERN_DIR
# 2. Ядро в KERN_DIR должно быть предварительно сконфигурировано и скомпилировано. Для компиляции ядра необходимо установить следующие переменные окружения:
# 2.1 ARCH,          например: export ARCH=arm64
# 2.2 CROSS_COMPILE, например: export CROSS_COMPILE=aarch64-linux-gnu-
# 2.3 PATH,          например: export PATH=$PATH:/home/book/100ask_roc-rk3399-pc/ToolChain-6.3.1/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu/bin
# Примечание: для разных плат и разных компиляторов эти 3 переменные окружения могут отличаться.
#             Пожалуйста, обратитесь к руководству пользователя продвинутого уровня для каждой платы

KERN_DIR = /home/book/eLinuxCore_100ask-t113-pro/linux/

all:
	make -C $(KERN_DIR) M=`pwd` modules
	$(CROSS_COMPILE)gcc -o hello_drv_test hello_drv_test.c

clean:
	make -C $(KERN_DIR) M=`pwd` modules clean
	rm -rf modules.order
	rm -f hello_drv_test

obj-m	+= hello_drv.o

```

### Компиляция

```bash
book@100ask:~$ make
make -C /home/book/NezhaSTU/eLinuxCore_100ask-t113-pro/linux/ M=`pwd` modules
make[1]: Entering directory '/home/book/NezhaSTU/eLinuxCore_100ask-t113-pro/linux'
  CC [M]  /home/book/NezhaSTU/hello_drv.o
  Building modules, stage 2.
  MODPOST 1 modules
  CC [M]  /home/book/NezhaSTU/hello_drv.mod.o
  LD [M]  /home/book/NezhaSTU/hello_drv.ko
make[1]: Leaving directory '/home/book/NezhaSTU/eLinuxCore_100ask-t113-pro/linux'
riscv64-unknown-linux-gnu-gcc -o hello_drv_test hello_drv_test.c
book@100ask:~$
```



## Копирование на отладочную плату

Как скопировать файл на отладочную плату? Вы можете использовать USB-диск, ADB, сеть, последовательный порт и т.д.

Мы рекомендуем использовать сетевой метод. Есть много способов передачи по сети: TFTP, NFS, SFTP. Для NFS требуется поддержка файловой системы NFS в ядре. Для SFTP требуется поддержка компонента openssh в корневой файловой системе. Поэтому мы выбираем TFTP.

### Использование сетевого сервиса TFTP

1. Сначала ваша система Ubuntu должна поддерживать службу TFTP, она должна быть сконфигурирована и установлена, затем скопируйте скомпилированную программу hello world в каталог tftp.

```bash
book@100ask:~$ cp hello_drv_test hello_drv.ko ~/tftpboot/
```

2. Войдите в отладочную плату. Сначала убедитесь, что отладочная плата может получить IP-адрес и взаимодействовать с системой Ubuntu (это компьютер, на котором вы компилировали hello word). Затем на отладочной плате получите приложение hello word и выполните его.

```bash
# udhcpc
udhcpc: started, v1.35.0
[  974.154486] libphy: 4500000.eth: probed
[  974.159083] sunxi-gmac 4500000.eth eth0: eth0: Type(8) PHY ID 001cc916 at 0 IRQ poll (4500000.eth-0:00)
udhcpc: broadcasting discover
udhcpc: broadcasting discover
[  979.331180] sunxi-gmac 4500000.eth eth0: Link is Up - 1Gbps/Full - flow control off
[  979.340154] IPv6: ADDRCONF(NETDEV_CHANGE): eth0: link becomes ready
udhcpc: broadcasting discover
udhcpc: broadcasting select for 192.168.1.47, server 192.168.1.1
udhcpc: lease of 192.168.1.47 obtained from 192.168.1.1, lease time 86400
deleting routers
adding dns 192.168.1.1
# [  992.315224] random: crng init done
[  992.319022] random: 2 urandom warning(s) missed due to ratelimiting

# tftp -g -r hello_drv.ko 192.168.1.133
# tftp -g -r hello_drv_test  192.168.1.133
# ls
hello_drv.ko    hello_drv_test  helloword
```

Как показано выше, IP-адрес моего компьютера Ubuntu - 192.168.1.133, поэтому я использую tftp для получения программы hello word с Ubuntu. Скорость загрузки зависит от скорости вашего интернета.

### Использование метода USB ADB

* Сначала подключите кабель OTG отладочной платы. Система автоматически запустит службу ADB при загрузке, в результате чего компьютер выведет устройство. Введите выведенное устройство в виртуальную машину VMware и подключитесь к Ubuntu.

* Затем я могу использовать команду adb push для загрузки файла. Перед началом загрузки вы можете использовать команду adb devices для проверки подключения отладочной платы к системе.

* В следующем примере используется команда adb для загрузки hello word в каталог /root отладочной платы.

```shell
adb push helloword /root
```



## Выполнение

```bash
# insmod hello_drv.ko
[ 1007.072991] hello_drv: loading out-of-tree module taints kernel.
[ 1007.081285] /home/book/NezhaSTU/hello_drv.c hello_init line 70
# chmod +x hello_drv_test
# ls /dev/h
hdmi   hello
# ls /dev/hello
/dev/hello
# ./hello_drv
hello_drv.ko    hello_drv_test
# ./hello_drv_test  -w abc
[ 1060.000621] /home/book/NezhaSTU/hello_drv.c hello_drv_open line 45
[ 1060.007613] /home/book/NezhaSTU/hello_drv.c hello_drv_write line 38
[ 1060.015194] /home/book/NezhaSTU/hello_drv.c hello_drv_close line 51
# ./hello_drv_test  -r
[ 1062.312864] /home/book/NezhaSTU/hello_drv.c hello_drv_open line 45
[ 1062.319853] /home/book/NezhaSTU/hello_drv.c hello_drv_read line 30
APP read : abc[ 1062.327680] /home/book/NezhaSTU/hello_drv.c hello_drv_close line 51

#
```
