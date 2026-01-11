# 6 FAQ

### 6.1 Часто используемые методы отладки

#### 6.1.1 Использование sunxi_dump для чтения и записи соответствующих регистров

Необходимо включить модуль SUNXI_DUMP:

```
make kernel_menuconfig
	---> Device Drivers
		---> dump reg driver for sunxi platform (выбрать)
```

Способ использования:

```
cd /sys/class/sunxi_dump
1. Просмотр одного регистра
echo 0x0300b048 > dump ;cat dump
2. Запись значения в регистр
echo 0x0300b058 0xfff > write ;cat write
3. Просмотр непрерывного диапазона регистров
echo 0x0300b000,0x0300bfff > dump;cat dump

4. Запись значений в группу регистров
echo 0x0300b058 0xfff,0x0300b0a0 0xfff > write;cat write

Используя описанный выше метод, можно просматривать и изменять регистры соответствующих gpio, тем самым обнаруживая проблемы.
```

#### 6.1.2 Использование отладочного узла sunxi_pinctrl

Необходимо включить DEBUG_FS:

```
make kernel_menuconfig
	---> Kernel hacking
		---> Compile-time checks and compiler options
			---> Debug Filesystem (выбрать)
```

Монтирование файлового узла и переход в соответствующую директорию:

```
mount -t debugfs none /sys/kernel/debug
cd /sys/kernel/debug/sunxi_pinctrl
```

1. Просмотр конфигурации вывода:

```
echo PC2 > sunxi_pin
cat sunxi_pin_configure
```

Результат показан на следующем рисунке:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_007.png)

​																	Рисунок 6-1: Просмотр конфигурации вывода

2. Изменение атрибутов вывода

Каждый вывод имеет четыре атрибута: мультиплексирование (function), данные (data), способность управления нагрузкой (dlevel), подтяжка (pull).

Команда для изменения атрибутов вывода следующая:

```
echo PC2 1 > pull;cat pull
cat sunxi_pin_configure  // Просмотр результата изменения
```

Результат после изменения показан на следующем рисунке:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_008.png)

​																Рисунок 6-2: Результат изменения

Примечание: На платформе sunxi в настоящее время существует несколько устройств pinctrl, а именно pio, r_pio и axpxxx-gpio. При работе с выводами после PL используйте следующую команду для переключения устройства вывода, иначе операция не удастся. Команда переключения следующая:

```
echo pio > /sys/kernel/debug/sunxi_pinctrl/dev_name // Переключиться на устройство pio
cat /sys/kernel/debug/sunxi_pinctrl/dev_name
echo r_pio > /sys/kernel/debug/sunxi_pinctrl/dev_name // Переключиться на устройство r_pio
cat /sys/kernel/debug/sunxi_pinctrl/dev_name
```

Результат изменения показан на следующем рисунке:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_009.png)

​															  Рисунок 6-3: Устройство вывода

#### 6.1.3 Использование отладочного узла pinctrl core

```
mount -t debugfs none /sys/kernel/debug
cd /sys/kernel/debug/sunxi_pinctrl
```

1. Просмотр устройства управления выводами:

```
cat pinctrl-devices
```

Результат показан на следующем рисунке:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_0010.png)

​													  	Рисунок 6-4: Устройство вывода

2. Просмотр состояния выводов и соответствующего используемого устройства

Результат показан в следующем журнале:

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

Из приведенного выше частичного журнала можно увидеть, какие устройства управляют выводами и правильно ли текущее состояние выводов. Возьмем в качестве примера устройство twi3: выводы, управляемые twi3, - это PA10/PA11, у них есть два набора состояний: sleep и default. Состояние default означает состояние использования, состояние sleep означает, что вывод находится в состоянии io disabled, что означает, что вывод не может использоваться нормально. Текущее состояние выводов, используемых устройством twi3, находится в состоянии sleep.

#### 6.1.4 Шаги по устранению проблем с прерываниями GPIO

##### 6.1.4.1 Прерывание GPIO постоянно срабатывает

1. Проверьте, постоянно ли сигнал прерывания вызывает прерывание

2. Используйте узел sunxi_dump, чтобы подтвердить, не очищен ли бит pending прерывания (см. раздел 6.1.1)

3. Проверьте, выполняется ли переключение pin mux для gpio, обнаруживающего прерывание, в программе обслуживания прерывания gpio. Такое переключение не допускается, иначе это приведет к аномалии прерывания

##### 6.1.4.2 GPIO не обнаруживает прерывание

1. Проверьте, нормален ли сигнал прерывания. Если не нормален, проверьте аппаратное обеспечение. Если нормален, перейдите к шагу 2

2. Используйте узел sunxi_dump, чтобы проверить, установлен ли бит pending прерывания gpio. Если уже установлен, перейдите к шагу 5, иначе перейдите к шагу 3

3. Используйте узел sunxi_dump, чтобы проверить, правильно ли настроен способ срабатывания прерывания gpio. Если правильно, перейдите к шагу 4, иначе перейдите к шагу 5

4. Проверьте тактовый сигнал выборки прерывания. По умолчанию это должно быть 32k. Вы можете использовать узел sunxi_dump для переключения тактового сигнала выборки прерывания gpio на 24M для эксперимента

5. Используйте sunxi_dump, чтобы подтвердить, включено ли прерывание
