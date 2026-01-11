# Часто задаваемые вопросы

## 6 ЧЗВ

### 6.1 Часто используемые методы отладки

#### 6.1.1 Использование sunxi_dump для чтения и записи соответствующих регистров

Необходимо включить модуль SUNXI_DUMP:

```
make kernel_menuconfig
	---> Device Drivers
		---> dump reg driver for sunxi platform (выбрать)
```

Методы использования:

```
cd /sys/class/sunxi_dump
1. Просмотр одного регистра
echo 0x0300b048 > dump ;cat dump
2. Запись значения в регистр
echo 0x0300b058 0xfff > write ;cat write
3. Просмотр непрерывной серии регистров
echo 0x0300b000,0x0300bfff > dump;cat dump

4. Запись значений группы регистров
echo 0x0300b058 0xfff,0x0300b0a0 0xfff > write;cat write

Таким способом вы можете просмотреть и модифицировать соответствующие регистры gpio, чтобы найти проблему.
```


#### 6.1.2 Использование узла отладки sunxi_pinctrl

Необходимо включить DEBUG_FS:

```
make kernel_menuconfig
	---> Kernel hacking
		---> Compile-time checks and compiler options
			---> Debug Filesystem (выбрать)
```

Монтируйте узел файла и перейдите в соответствующую директорию:

```
mount -t debugfs none /sys/kernel/debug
cd /sys/kernel/debug/sunxi_pinctrl
```



1. Просмотр конфигурации вывода:

```
echo PC2 > sunxi_pin
cat sunxi_pin_configure
```

Результат показан на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_007.png)

Рисунок 6-1: Рисунок просмотра конфигурации вывода

2. Изменение свойств вывода

Каждый вывод имеет четыре свойства: мультиплексирование (function), данные (data), способность управления (dlevel), подтяжка (pull).

Команда для изменения свойств вывода выглядит следующим образом:

```
echo PC2 1 > pull;cat pull
cat sunxi_pin_configure  //просмотреть ситуацию после изменения
```

Результат после изменения показан на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_008.png)

Рисунок 6-2: Рисунок результата изменения



Примечание: на платформе sunxi в настоящее время существует несколько устройств pinctrl, которые представляют собой pio, r_pio и axpxxx-gpio. При операции с выводами после PL переключитесь на устройство вывода через следующую команду, в противном случае операция не будет выполнена. Команда переключения выглядит следующим образом:

```
echo pio > /sys/kernel/debug/sunxi_pinctrl/dev_name //переключиться на устройство pio
cat /sys/kernel/debug/sunxi_pinctrl/dev_name
echo r_pio > /sys/kernel/debug/sunxi_pinctrl/dev_name //переключиться на устройство r_pio
cat /sys/kernel/debug/sunxi_pinctrl/dev_name
```

Результат изменения показан на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_009.png)

Рисунок 6-3: Рисунок устройства вывода



#### 6.1.3 Использование узла отладки pinctrl core

```
mount -t debugfs none /sys/kernel/debug
cd /sys/kernel/debug/sunxi_pinctrl
```

1. Просмотр устройства управления выводом:

```
cat pinctrl-devices
```

Результат показан на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_0010.png)

Рисунок 6-4: Рисунок устройства вывода

2. Просмотр состояния вывода и соответствующего устройства использования

Результат показан в лог файле ниже:

```
console:/sys/kernel/debug/pinctrl # ls
pinctrl-devices pinctrl-handles pinctrl-maps pio r_pio
console:/sys/kernel/debug/pinctrl # cat pinctrl-handles
Requested pin control handlers their pinmux maps:
device: twi3 current state: sleep
	state: default
        type: MUX_GROUP controller pio group: PA10 (10) function: twi3 (15)
        type: CONFIGS_GROUP controller pio group PA10 (10)config 00001409
config 00000005
        type: MUX_GROUP controller pio group: PA11 (11) function: twi3 (15)
        type: CONFIGS_GROUP controller pio group PA11 (11)config 00001409
config 00000005
	state: sleep
        type: MUX_GROUP controller pio group: PA10 (10) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PA10 (10)config 00001409
config 00000001
        type: MUX_GROUP controller pio group: PA11 (11) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PA11 (11)config 00001409
config 00000001
device: twi5 current state: default
    state: default
        type: MUX_GROUP controller r_pio group: PL0 (0) function: s_twi0 (3)
        type: CONFIGS_GROUP controller r_pio group PL0 (0)config 00001409
config 00000005
        type: MUX_GROUP controller r_pio group: PL1 (1) function: s_twi0 (3)
        type: CONFIGS_GROUP controller r_pio group PL1 (1)config 00001409
config 00000005
	state: sleep
        type: MUX_GROUP controller r_pio group: PL0 (0) function: io_disabled (4)
        type: CONFIGS_GROUP controller r_pio group PL0 (0)config 00001409
config 00000001
        type: MUX_GROUP controller r_pio group: PL1 (1) function: io_disabled (4)
        type: CONFIGS_GROUP controller r_pio group PL1 (1)config 00001409
config 00000001
device: soc@03000000:pwm5@0300a000 current state: active
	state: active
        type: MUX_GROUP controller pio group: PA12 (12) function: pwm5 (16)
        type: CONFIGS_GROUP controller pio group PA12 (12)config 00000001
config 00000000
config 00000000
	state: sleep
        type: MUX_GROUP controller pio group: PA12 (12) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PA12 (12)config 00000001
config 00000000
config 00000000
device: uart0 current state: default
	state: default
	state: sleep
device: uart1 current state: default
	state: default
        type: MUX_GROUP controller pio group: PG6 (95) function: uart1 (37)
        type: CONFIGS_GROUP controller pio group PG6 (95)config 00001409
config 00000005
        type: MUX_GROUP controller pio group: PG7 (96) function: uart1 (37)
        type: CONFIGS_GROUP controller pio group PG7 (96)config 00001409
config 00000005
        type: MUX_GROUP controller pio group: PG8 (97) function: uart1 (37)
        type: CONFIGS_GROUP controller pio group PG8 (97)config 00001409
config 00000005
        type: MUX_GROUP controller pio group: PG9 (98) function: uart1 (37)
        type: CONFIGS_GROUP controller pio group PG9 (98)config 00001409
config 00000005
	state: sleep
        type: MUX_GROUP controller pio group: PG6 (95) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PG6 (95)config 00001409
config 00000001
        type: MUX_GROUP controller pio group: PG7 (96) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PG7 (96)config 00001409
config 00000001
        type: MUX_GROUP controller pio group: PG8 (97) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PG8 (97)config 00001409
config 00000001
        type: MUX_GROUP controller pio group: PG9 (98) function: io_disabled (5)
        type: CONFIGS_GROUP controller pio group PG9 (98)config 00001409
....
```

Из приведённого выше частичного лог видно, какие выводы управляются устройством и находится ли текущее состояние вывода в правильном состоянии. На примере устройства twi3, выводы, управляемые twi3, это PA10/PA11. У них есть два набора состояний: sleep и default. Состояние default представляет режим использования, состояние sleep представляет режим io disabled, означающий, что вывод не может нормально использоваться. Текущее состояние выводов, используемых устройством twi3, находится в состоянии sleep.



#### 6.1.4 Шаги проверки проблем с прерыванием GPIO

##### 6.1.4.1 Прерывание GPIO постоянно срабатывает

1. Проверьте, постоянно ли срабатывает сигнал прерывания

2. Используйте узел sunxi_dump для подтверждения того, что бит ожидающего прерывания не очищен (см. раздел 6.1.1)

3. Не изменяйте мультиплексирование вывода gpio в программе обработки прерывания gpio. Это вызовет аномалию прерывания


##### 6.1.4.2 Прерывание GPIO не обнаружено

1. Проверьте, нормален ли сигнал прерывания. Если не нормален, проверьте аппаратную часть. Если нормален, перейдите к шагу 2

2. Используйте узел sunxi_dump для просмотра бита ожидающего прерывания gpio. Если он установлен, перейдите к шагу 5, в противном случае перейдите к шагу 3

3. Используйте узел sunxi_dump для просмотра того, правильно ли конфигурирован способ срабатывания прерывания gpio. Если правильно, перейдите к шагу 4, в противном случае перейдите к шагу 5

4. Проверьте тактовый сигнал дискретизации прерывания. По умолчанию должно быть 32k. Вы можете переключить тактовый сигнал дискретизации gpio прерывания на 24M через узел sunxi_dump для экспериментирования

5. Используйте sunxi_dump для подтверждения того, что прерывание включено
