# Компиляция и выполнение драйвера Hello World

## Конфигурация среды разработки

Прежде всего, нам нужно получить цепочку инструментов кросс-компиляции для отладочной платы Dongshan Nezha STU. Поскольку изначальная цепочка инструментов предоставлена Alibaba Pingtou Ge, их цепочка инструментов имеет некоторые отличия от стандартной цепочки инструментов сообщества GNU, поэтому мы временно не можем использовать версию сообщества.

Поскольку в настоящее время цепочка инструментов не предоставляется для Windows, работа возможна только в Linux. Пожалуйста, обратитесь к вышеуказанному разделу о конфигурации виртуальной машины Ubuntu и выполните конфигурацию.


## Получение исходного кода ядра
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


## Конфигурация среды компиляции ядра
```bash
export PATH=$PATH:/home/book/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin
export ARCH=riscv
export CROSS_COMPILE=riscv64-unknown-linux-gnu-
```
```bash
book@100ask:~/eLinuxCore_dongshannezhastu/linux$ export ARCH=riscv
book@100ask:~/eLinuxCore_dongshannezhastu/linux$ export CROSS_COMPILE=riscv64-unknown-linux-gnu-
book@100ask:~/eLinuxCore_dongshannezhastu/linux$ export PATH=$PATH:/home/book/eLinuxCore_dongshannezhastu/toolchain/riscv64-glibc-gcc-thead_20200702/bin
book@100ask:~/NezhaSTU/eLinuxCore_dongshannezhastu/linux$ make sun20iw1p1_d1_defconfig
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
book@100ask:~/eLinuxCore_dongshannezhastu/linux$ make Image  -j8

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

/* 1. Определение основного номера устройства                                                                 */
static int major = 0;
static char kernel_buf[1024];
static struct class *hello_class;


#define MIN(a, b) (a < b ? a : b)

/* 3. Реализация соответствующих функций open/read/write и т.д., заполнение структуры file_operations                   */
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

/* 2. Определение собственной структуры file_operations                                              */
static struct file_operations hello_drv = {
	.owner	 = THIS_MODULE,
	.open    = hello_drv_open,
	.read    = hello_drv_read,
	.write   = hello_drv_write,
	.release = hello_drv_close,
};

/* 4. Сообщение структуры file_operations ядру: регистрация драйвера                                */
/* 5. Кто регистрирует драйвер? Должна быть входная функция: при установке драйвера будет вызвана эта входная функция */
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

/* 6. Если есть входная функция, должна быть и выходная функция: при выгрузке драйвера будет вызвана эта выходная функция           */
static void __exit hello_exit(void)
{
	printk("%s %s line %d\n", __FILE__, __FUNCTION__, __LINE__);
	device_destroy(hello_class, MKDEV(major, 0));
	class_destroy(hello_class);
	unregister_chrdev(major, "hello");
}


/* 7. Прочие дополнения: предоставление информации об устройстве, автоматическое создание узла устройства                                     */

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

# 1. При использовании разных ядер отладочных плат обязательно измените KERN_DIR
# 2. Ядро в KERN_DIR должно быть предварительно сконфигурировано и скомпилировано. Для компиляции ядра сначала установите следующие переменные окружения:
# 2.1 ARCH,          например: export ARCH=arm64
# 2.2 CROSS_COMPILE, например: export CROSS_COMPILE=aarch64-linux-gnu-
# 2.3 PATH,          например: export PATH=$PATH:/home/book/100ask_roc-rk3399-pc/ToolChain-6.3.1/gcc-linaro-6.3.1-2017.05-x86_64_aarch64-linux-gnu/bin
# Примечание: для разных отладочных плат и разных компиляторов вышеуказанные 3 переменные окружения могут отличаться,
#       пожалуйста, обратитесь к расширенному руководству пользователя для каждой отладочной платы

KERN_DIR = /home/book/eLinuxCore_dongshannezhastu/linux/

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
make -C /home/book/NezhaSTU/eLinuxCore_dongshannezhastu/linux/ M=`pwd` modules
make[1]: Entering directory '/home/book/NezhaSTU/eLinuxCore_dongshannezhastu/linux'
  CC [M]  /home/book/NezhaSTU/hello_drv.o
  Building modules, stage 2.
  MODPOST 1 modules
  CC [M]  /home/book/NezhaSTU/hello_drv.mod.o
  LD [M]  /home/book/NezhaSTU/hello_drv.ko
make[1]: Leaving directory '/home/book/NezhaSTU/eLinuxCore_dongshannezhastu/linux'
riscv64-unknown-linux-gnu-gcc -o hello_drv_test hello_drv_test.c
book@100ask:~$
```



## Копирование на отладочную плату

Как скопировать файлы на отладочную плату? Есть USB-накопитель, ADB, сеть, последовательный порт и т.д.

Мы рекомендуем использовать в первую очередь сетевой способ. Сетевые способы тоже разные: есть передача TFTP, передача NFS, передача SFTP. Среди них передача NFS требует поддержки файловой системы NFS в ядре, SFTP требует поддержки компонента openssh в корневой файловой системе, поэтому в итоге мы выбираем сервис TFTP.

### Использование сетевого сервиса TFTP

1. Прежде всего, необходимо, чтобы ваша система Ubuntu поддерживала сервис TFTP, был установлен и настроен, затем скопируйте скомпилированную программу helloword в директорию TFTP.

```bash
book@100ask:~$ cp hello_drv_test hello_drv.ko ~/tftpboot/
```

2. Войдите на отладочную плату, сначала позвольте отладочной плате получить IP-адрес и убедитесь, что она может пинговать систему Ubuntu (здесь имеется в виду хост, который компилировал helloword), затем на отладочной плате получите приложение helloword и выполните его.

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

Как показано выше, IP-адрес моего хоста Ubuntu - 192.168.1.133, поэтому используя TFTP получаем программу helloword с Ubuntu, скорость получения зависит от скорости сети.

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
