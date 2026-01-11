# 11 Программирование PWM

## 11.1 Обзор PWM

		PWM (Pulse Width Modulation) - широтно-импульсная модуляция, это метод, который путем модуляции ширины серии импульсов создает эквивалентную нужную форму волны (включая форму и амплитуду), осуществляя цифровое кодирование уровня аналогового сигнала. Другими словами, путем регулирования изменения коэффициента заполнения регулируются сигналы, энергия и другие параметры. Коэффициент заполнения - это процент времени, в течение которого сигнал находится на высоком уровне в пределах одного периода. Например, коэффициент заполнения меандра составляет 50%. Это очень эффективная техника использования цифрового выхода микропроцессора для управления аналоговой схемой.

![](http://photos.100ask.net/NewHomeSite/PWM_image1.jpg)

		Сигнал PWM преобразует аналоговый сигнал в кодировку, необходимую для цифровой схемы. Сейчас в основном используются цифровые схемы, поэтому сигналы PWM применяются во многих случаях. Наиболее часто мы встречаем их в схемах диммирования переменного тока, которые также можно назвать бесступенчатым регулированием скорости. Когда высокий уровень занимает больше времени, то есть коэффициент заполнения больше, яркость выше; когда коэффициент заполнения меньше, яркость ниже, при условии, что частота PWM больше частоты восприятия человеческого глаза, иначе будет эффект мерцания. Помимо применения в схемах диммирования, PWM также используется в схемах прерывания постоянного тока, управлении зуммерами, управлении двигателями, инверторных схемах, регулировке количества тумана в увлажнителях и т.д.

![](http://photos.100ask.net/NewHomeSite/PWM_image2.jpg)

### 11.1.1 Описание параметров PWM

https://www.kernel.org/doc/Documentation/pwm.txt
 **period (период)**
 Общий период сигнала PWM (чтение/запись).
 Значение в наносекундах, является суммой активного и неактивного
 времени PWM.

 **duty_cycle (коэффициент заполнения)**
 Активное время сигнала PWM (чтение/запись).
 Значение в наносекундах и должно быть меньше периода.
 В режиме NORMAL представляет длительность высокого уровня в течение одного периода
 В режиме INVERTED представляет длительность низкого уровня в течение одного периода

 **polarity (полярность)**
 Изменение полярности сигнала PWM (чтение/запись).
 Запись в этот атрибут возможна только если чип PWM поддерживает изменение
 полярности. Полярность PWM можно изменить только когда PWM
 отключен. Значения - строки "normal" или "inversed".

 **enable (включение)**
 Включение/отключение сигнала PWM (чтение/запись).

- 0 - отключен
- 1 - включен

## 11.2 Просмотр PWM на уровне пользователя

		Если в конфигурации ядра включен CONFIG_SYSFS, будет предоставлен простой интерфейс sysfs для использования PWM из пространства пользователя. Он находится в /sys/class/pwm/. Каждый обнаруженный контроллер/чип PWM будет выведен как pwmchipN, где N - базовое значение чипа PWM. Внутри директории вы найдете:

```c
 1 echo 0 > /sys/class/pwm/pwmchip0/export /*Настройка вывода PWM4, вызов узлов устройства в директории pwm0 для дальнейшей конфигурации */
```

```c
 2 echo 1000000 >/sys/class/pwm/pwmchip0/pwm0/period /*Установка длительности одного периода PWM4, единица измерения - ns, то есть 1 кГц */
```

```c
 3 echo 500000 >/sys/class/pwm/pwmchip0/pwm0/duty_cycle /*Установка времени "ON" в одном периоде, единица измерения - ns, то есть коэффициент заполнения=duty_cycle/period=50% */
```

```c
 4 echo 1 >/sys/class/pwm/pwmchip0/pwm0/enable /*Включение PWM4 */
```

## 11.3 Использование PWM через SYSFS

```c
#include <stdio.h>
#include <fcntl.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/time.h>
#include <unistd.h>
#include <string.h>
#include <sys/ioctl.h>
#include <linux/ioctl.h>

#define dbmsg(fmt, args ...) printf("%s[%d]: "fmt"\n", __FUNCTION__, __LINE__,##args)

#define DUTY              "duty"
#define PERIOD            "1000000"
#define DUTYCYCLE         "500000"
#define LENGTH            100

int fd_period = 0,fd_duty = 0,fd_enable = 0,duty_m = 0;

int usage()
{
    printf("usage:\n");
    printf("./pwm-sysfs-test duty <0/1> : 0-->static; 1-->dynamic \n");
    return 0;
}

int pwm_setup()
{
  int fd,ret;

  fd = open("/sys/class/pwm/pwmchip0/export", O_WRONLY);
  if(fd < 0)
  {
      dbmsg("open export error\n");
      return -1;
  }
  ret = write(fd, "0", strlen("0"));
  if(ret < 0)
  {
      dbmsg("creat pwm0 error\n");
      return -1;
  }else
  dbmsg("export pwm0 ok\n");

  fd_period = open("/sys/class/pwm/pwmchip0/pwm0/period", O_RDWR);
  fd_duty = open("/sys/class/pwm/pwmchip0/pwm0/duty_cycle", O_RDWR);
  fd_enable = open("/sys/class/pwm/pwmchip0/pwm0/enable", O_RDWR);

  if((fd_period < 0)||(fd_duty < 0)||(fd_enable < 0))
  {
      dbmsg("open error\n");
      return -1;
  }

  ret = write(fd_period, PERIOD,strlen(PERIOD));
  if(ret < 0)
  {
      dbmsg("change period error\n");
      return -1;
  }else
    dbmsg("change period ok\n");

  ret = write(fd_duty, DUTYCYCLE, strlen(DUTYCYCLE));
  if(ret < 0)
  {
      dbmsg("change duty_cycle error\n");
      return -1;
  }else
    dbmsg("change duty_cycle ok\n");

  ret = write(fd_enable, "1", strlen("1"));
  if(ret < 0)
  {
      dbmsg("enable pwm0 error\n");
      return -1;
  }else
  dbmsg("enable pwm0 ok\n");

  duty_m = atoi(DUTYCYCLE)/2;
  printf("duty_m: %d \n",duty_m);

  return 0;
}

int main ( int argc, char *argv[] )
{
  int ret;
  int num;
  if(argc < 2)
  {
    usage();
    return -1;
  }

  if(strncmp(argv[1],DUTY, sizeof(DUTY)) == 0)
  {
    dbmsg("%s", DUTY);
    if(argc != 3)
    {
      usage();
      return -1;
    }
    pwm_setup();
  }

  return 0;
}
```

## 11.4 Прикладное программирование PWM

Основные полезные API пользователя следующие:
devm_pwm_get() или pwm_get() / pwm_put(): этот API используется для поиска, запроса и освобождения устройства PWM.
pwm_init_state(), pwm_get_state(), pwm_apply_state(): этот API используется для инициализации, получения и применения текущего состояния устройства PWM.
pwm_config(): этот API обновляет конфигурацию устройства PWM (период и коэффициент заполнения).

### 11.4.1 Изменение дерева устройств

```c
beeper {
compatible = "pwm-beeper";
pwms = <&pwm 0 1000000 0>;
pinctrl-names = "default";
pinctrl-0 = <&pwm0_pin>;
};
```

### 11.4.2 Изменение конфигурационного файла

```c
Активировать фреймворк PWM в конфигурации ядра через инструмент Linux menuconfig, Menuconfig или как настроить ядро (CONFIG_PWM=y):
Device Drivers  --->
   [*] Pulse-Width Modulation (PWM) Support  --->
```

### 11.4.3 Добавление драйвера

```c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/miscdevice.h>
#include <linux/fs.h>
#include <asm/gpio.h>
#include <linux/pwm.h>

//#include <plat/gpio-cfg.h>

#define PWM_ON  0x100001
#define PWM_OFF 0x100002

struct pwm_device *pwm_dev_2;
struct pwm_device *pwm_dev_3;

static long pwm_ioctl(struct file *file,
                        unsigned int cmd,
                        unsigned long arg)
{
    int ret;
    switch(cmd) {
        case PWM_ON:
                ret = pwm_config(pwm_dev_2,200000,500000);
                if(ret < 0){
                    printk("pwm_dev_2 ioctl fail");
                    return 0;
                }
                ret = pwm_config(pwm_dev_3,300000,500000);
                if(ret < 0){
                    printk("pwm_dev_3 ioctl fail");
                }
                pwm_enable(pwm_dev_2);
                pwm_enable(pwm_dev_3);
            break;
        case PWM_OFF:
                ret = pwm_config(pwm_dev_2,0,500000);
                if(ret < 0){
                    printk("pwm_dev_2 ioctl fail");
                    return 0;
                }
                ret = pwm_config(pwm_dev_3,0,500000);
                if(ret < 0){
                    printk("pwm_dev_3 ioctl fail");
                }
                pwm_disable(pwm_dev_2);
                pwm_disable(pwm_dev_3);
            break;
    }
    return 0;
}

//Определение методов работы с оборудованием
static struct file_operations pwm_fops = {
    .owner = THIS_MODULE,
    .unlocked_ioctl = pwm_ioctl
};

//Определение объекта miscdevice
static struct miscdevice pwm_misc = {
    .minor = MISC_DYNAMIC_MINOR, //Динамическое выделение младшего номера устройства
    .name = "mypwm",             //dev/mypwm
    .fops = &pwm_fops
};

static int pwm_init(void)
{
    int ret;
    printk("regisger pwm_misc device\n");
    //1.Запрос ресурса pwm, установка вывода в 0
    pwm_dev_2 = pwm_request(1,"pwm_2");
    if(pwm_dev_2 == NULL){
        printk("pwm_dev_2 register fail\n");
    }
    pwm_dev_3 = pwm_request(2,"pwm_3");
    if(pwm_dev_3 == NULL){
        printk("pwn_dev_3 register fail\n");
    }

    ret = pwm_config(pwm_dev_2,0,500000);
    if(ret < 0){
        printk("pwm_config_2 init fail\n");
        return 0;
    }
    ret = pwm_config(pwm_dev_3,0,500000);
    if(ret < 0){
        printk("pwm_config_3 init fail\n");
        return 0;
    }

    ret = pwm_enable(pwm_dev_2);
    if(ret == 0){
        printk("pwm_enable_dev_2 init success\n");
    }
    if(ret < 0 ){
        printk("pwm_enable_dev_2 init fail\n");
        return 0;
    }
    ret = pwm_enable(pwm_dev_3);
    if(ret == 0){
        printk("pwm_enable_dev_3 init success\n");
    }
    if(ret < 0 ){
        printk("pwm_enable_dev_3 init fail\n");
        return 0;
    }
    //2.Регистрация miscdevice
    misc_register(&pwm_misc);
    return 0;
}

static void pwm_exit(void)
{
    printk("unregister pwm_misc device\n");
    //1.Удаление miscdevice
    misc_deregister(&pwm_misc);
    //2.Освобождение ресурса pwm
    pwm_config(pwm_dev_2,0,500000);
    pwm_disable(pwm_dev_2);
    pwm_free(pwm_dev_2);

    pwm_config(pwm_dev_3,0,500000);
    pwm_disable(pwm_dev_3);
    pwm_free(pwm_dev_3);
}
module_init(pwm_init);
module_exit(pwm_exit);
MODULE_LICENSE("GPL");
```

### 11.4.4 Запуск тестирования

```c
#include <stdio.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>

#define PWM_ON  0x100001
#define PWM_OFF 0x100002

int main(void)
{
    int fd;
    int a;

    fd = open("/dev/mypwm", O_RDWR);
    if (fd < 0)
        return -1;

    while(1) {
            ioctl(fd, PWM_ON);
    }
    close(fd);
    return 0;
}
```
