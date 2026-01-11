# Руководство разработки GPIO

## 1 Обзор

### 1.1 Цель документа

Этот документ подробно описывает использование интерфейса GPIO в ядре, помогая пользователям четко овладеть методами программирования для конфигурации GPIO и операции запроса.

### 1.2 Область применения

<center>Таблица 1-1: Список применимых продуктов</center>

| Версия ядра      | Файл драйвера       |
| ---------------- | ------------------- |
| Linux-4.9 и выше | pinctrl-sunxi.c     |


### 1.3 Связанный персонал

Этот документ применяется ко всему персоналу, занимающемуся разработкой драйверов устройств на платформе sunxi ядра Linux.

## 2 Введение в модуль

Фреймворк Pinctrl был предложен системой Linux для унификации управления выводами различными производителями SoC, чтобы избежать того, чтобы каждый производитель SoC независимо реализовывал подсистему управления выводами. Цель состоит в том, чтобы уменьшить объём работы по переносу системы производителями SoC.

### 2.1 Введение в функциональность модуля

Многие SoC внутри содержат контроллер выводов. С помощью контроллера выводов мы можем конфигурировать функции и характеристики одного или набора выводов. На программном уровне драйвер pinctrl ядра Linux может управлять контроллером выводов для выполнения следующих работ:

* Перечисление и наименование всех выводов, контролируемых контроллером выводов;

* Обеспечение способности мультиплексирования выводов

* Обеспечение возможности конфигурирования выводов, таких как способность управления, подтяжка вверх/вниз, свойства данных и т.д.

* Взаимодействие с подсистемой gpio

* Реализация прерывания выводов


### 2.2 Введение в соответствующую терминологию

<center>Таблица 2-1: Введение в терминологию модуля Pinctrl</center>

| Термин          | Объяснение                                                   |
| --------------- | ------------------------------------------------------------ |
| SUNXI           | Серия аппаратных платформ SoC компании Allwinner             |
| Pin controller  | Абстракция программного обеспечения аппаратного модуля, обычно используется для представления аппаратного контроллера. Может обрабатывать мультиплексирование выводов, конфигурирование свойств и другие функции |
| Pin             | В зависимости от различных способов упаковки микросхемы, выводы могут быть сферическими, штыревыми и т.д. На программном уровне используется набор целых чисел без знака [0-maxpin] для представления |
| Pin groups      | Периферийные устройства обычно не имеют только один вывод. Например, SPI может быть подключен к выводам {0,8,16,24} SoC, а другое устройство I2C подключено к выводам {24,25} SoC. Можно сказать, что здесь есть две группы выводов. Многие контроллеры должны обрабатывать группы выводов. Поэтому подсистема управления выводами контроллера должна иметь механизм для перечисления групп выводов и извлечения действительных выводов в конкретной группе |
| Pinconfig       | Выводы можно конфигурировать несколькими способами, большинство из которых связаны с электрическими характеристиками при использовании их в качестве входов/выходов. Например, выходной вывод можно установить в состояние высокого сопротивления или "трёхстатного" (означает, что он эффективно отключен). Или можно установить входной вывод путем подключения резистора к VDD или GND (подтяжка вверх/вниз) для обеспечения уверенного значения, когда на вывод не подаётся никакой сигнал |
| Pinmux          | Функция мультиплексирования выводов, использование одного физического вывода (шар/площадка/палец и т.д.) для множественного мультиплексирования для поддержки различных функциональных электрических стандартов упаковки |
| Device tree     | Как следует из названия, это дерево, включающее количество и тип процессора, базовый адрес памяти, шину и мост, подключение периферийных устройств, контроллер прерывания и gpio, часы и другие системные ресурсы. Драйвер Pinctrl поддерживает получение информации о конфигурации выводов из узлов устройства, определённых в device tree |


### 2.3 Общая архитектура

Архитектура драйвера модуля Sunxi Pinctrl показана на рисунке ниже. Весь драйвер модуля можно разделить на 4 части: pinctrl api, pinctrl common frame, sunxi pinctrl driver и board configuration. (Верхний уровень в диаграмме device driver представляет пользователя драйвера Pinctrl)

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_001.png)

Рисунок 2-1: Общая диаграмма архитектуры драйвера pinctrl

Pinctrl api: интерфейс, предоставляемый pinctrl для вызова пользователями верхнего уровня.

Pinctrl framework: фреймворк драйвера pinctrl, предоставленный Linux.

Pinctrl sunxi driver: драйвер, который должна реализовать платформа sunxi.

Board configuration: информация о конфигурации выводов устройства, обычно конфигурируется с помощью дерева устройств.


### 2.4 state/pinmux/pinconfig

Фреймворк Pinctrl в основном обрабатывает три функции: pinstate, pinmux и pinconfig. Отношение отображения между pinstate и pinmux, pinconfig показано на рисунке ниже.

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_002.png)

<center>Рисунок 2-2: Диаграмма фреймворка драйвера pinctrl</center>

Система работает в разных состояниях, конфигурация выводов может быть разной. Например, при нормальной работе системы выводы устройства должны иметь один набор конфигурации, но при входе системы в режим сна, чтобы сэкономить электроэнергию, выводы устройства должны иметь другую конфигурацию. Фреймворк Pinctrl может эффективно управлять конфигурацией выводов устройства в разных состояниях.


### 2.5 Введение в структуру исходного кода

```
linux
|
|-- drivers
| |-- pinctrl
| | |-- Kconfig
| | |-- Makefile
| | |-- core.c
| | |-- core.h
| | |-- devicetree.c
| | |-- devicetree.h
| | |-- pinconf.c
| | |-- pinconf.h
| | |-- pinmux.c
| | `-- pinmux.h
| `-- sunxi
| |-- pinctrl-sunxi-test.c
| |-- pinctrl-sun*.c
| `-- pinctrl-sun*-r.c
`-- include
`-- linux
`-- pinctrl
|-- consumer.h
|-- devinfo.h
|-- machine.h
|-- pinconf-generic.h
|-- pinconf.h
|-- pinctrl-state.h
|-- pinctrl.h
`-- pinmux.h
```

## 3 Конфигурация модуля

### 3.1 Конфигурация kernel menuconfig

Перейдите в корневую директорию longan и выполните ./build.sh menuconfig

Перейдите в главное меню конфигурации и выполните следующие шаги:

Сначала выберите опцию Device Drivers для входа в следующий уровень конфигурации, как показано на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_003.png)

Рисунок 3-1: Корневое меню kernel menuconfig


Выберите Pin controllers для входа в конфигурацию следующего уровня, как показано на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_004.png)

Рисунок 3-2: Меню device drivers kernel menuconfig


Выберите Allwinner SoC PINCTRL DRIVER для входа в конфигурацию следующего уровня, как показано на рисунке ниже:

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_005.png)

Рисунок 3-3: Меню pinctrl drivers kernel menuconfig


Драйвер Sunxi pinctrl компилируется в ядро по умолчанию, как показано на рисунке ниже (с платформой sun50iw9p1 в качестве примера, другие платформы аналогичны):

![](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/Tina-Sdk/LinuxGPIODevelopmentGuide_006.png)

Рисунок 3-4: Меню allwinner pinctrl drivers kernel menuconfig




### 3.2 Исходная структура и путь дерева устройств

Для Linux4.9:

* Конфигурация файла дерева устройств является общей конфигурацией для всех решений SoC. Для процессора ARM64 путь к дереву устройств: kernel/{KERNEL}/arch/arm64/boot/dts/sunxi/sun*-pinctrl.dtsi.

* Конфигурация файла дерева устройств является общей конфигурацией для всех решений SoC. Для процессора ARM32 путь к дереву устройств: kernel/{KERNEL}/arch/arm32/boot/dts/sun*-pinctrl.dtsi.

* Путь дерева устройств на уровне платы (board.dts): /device/config/chips/{IC}/configs/{BOARD}/board.dts

Отношение структуры исходного кода дерева устройств выглядит следующим образом:

```
board.dts
|--------sun*.dtsi
		     |------sun*-pinctrl.dtsi
		     |------sun*-clk.dtsi
```


Для Linux5.4:

* Конфигурация файла дерева устройств является общей конфигурацией для всех решений SoC. Для процессора ARM64 в ядре 5.4 больше не поддерживается отдельный dtsi pinctrl. Вместо этого информация о выводах помещается напрямую в: kernel/{KERNEL}/arch/arm32/boot/dts/sun*.dtsi

* Конфигурация файла дерева устройств является общей конфигурацией для всех решений SoC. Для процессора ARM32 в ядре 5.4 больше не поддерживается отдельный dtsi pinctrl. Вместо этого информация о выводах помещается напрямую в: kernel/{KERNEL}/arch/arm32/boot/dts/sun*.dtsi

* Путь дерева устройств на уровне платы (board.dts): /device/config/chips/{IC}/configs/{BOARD}/board.dts

* Отношение включения исходного кода дерева устройств выглядит следующим образом:

```
board.dts
    |--------sun*.dtsi
```




#### 3.2.1 Общая конфигурация контроллера gpio в дереве устройств

В файле kernel/{KERNEL}/arch/arm64/boot/dts/sunxi/sun*-pinctrl.dtsi* (Linux5.4 расположена напрямую в *sun*.dtsi), конфигурируется общая информация о конфигурации контроллера pinctrl SoC, как правило, не рекомендуется изменять, поддерживается разработчиком драйвера pinctrl. В настоящее время на платформе sunxi мы регистрируем два устройства pinctrl в зависимости от домена питания: устройство r_pio (все выводы после PL0) и устройство pio (все выводы перед PL0). Общая конфигурация двух устройств выглядит следующим образом:

```
r_pio: pinctrl@07022000 {
	compatible = "allwinner,sun50iw9p1-r-pinctrl"; //свойство совместимости, используется для привязки драйвера и устройства
	reg = <0x0 0x07022000 0x0 0x400>; //базовый адрес регистра 0x07022000 и диапазон 0x400
    clocks = <&clk_cpurpio>;          //часы, используемые в конфигурации r_pio
    device_type = "r_pio";            //тип устройства свойства
    gpio-controller;                  //указывает, что это контроллер gpio
    interrupt-controller;             //указывает, что это контроллер прерывания, можно удалить, если прерывание не поддерживается
    #interrupt-cells = <3>;           //количество параметров, которые должны быть конфигурированы для свойства прерывания выводов, можно удалить, если прерывание не поддерживается
    #size-cells = <0>;                //не используется, конфигурация 0
    #gpio-cells = <6>;                //количество параметров, необходимых для конфигурации свойства gpio, для linux-5.4 это 3

    /*
     * Следующая конфигурация предназначена для конфигурации выводов, используемых модулем. Модуль управляет выводами путём ссылки на соответствующий узел
     * Поскольку выводы разных плат часто изменяются, рекомендуется изменять через board dts (см. следующий раздел)
     */
    s_rsb0_pins_a: s_rsb0@0 {
        allwinner,pins = "PL0", "PL1";
        allwinner,function = "s_rsb0";
        allwinner,muxsel = <2>;
        allwinner,drive = <2>;
        allwinner,pull = <1>;
    };

    /*
     * Следующая конфигурация предназначена для конфигурации выводов, используемых модулем linux-5.4. Модуль управляет выводами путём ссылки на соответствующий узел
     * Поскольку выводы разных плат часто изменяются, рекомендуется размещать ссылку на выводы модуля в board dts
     * （类似pinctrl-0 = <&scr1_ph_pins>;), и использовать более идентифицируемое имя, такое как scr1_ph_pins）。
     */
    scr1_ph_pins: scr1-ph-pins {
        pins = "PH0", "PH1";
        function = "sim1";
        drive-strength = <10>;
        bias-pull-up;
    };
};

pio: pinctrl@0300b000 {
    compatible = "allwinner,sun50iw9p1-pinctrl"; //свойство совместимости, используется для привязки драйвера и устройства
    reg = <0x0 0x0300b000 0x0 0x400>; //базовый адрес регистра 0x0300b000 и диапазон 0x400
    interrupts = <GIC_SPI 51 IRQ_TYPE_LEVEL_HIGH>, /* AW1823_GIC_Spec: GPIOA: 83-32=51 */
            <GIC_SPI 52 IRQ_TYPE_LEVEL_HIGH>,
            <GIC_SPI 53 IRQ_TYPE_LEVEL_HIGH>,
            <GIC_SPI 54 IRQ_TYPE_LEVEL_HIGH>,
            <GIC_SPI 55 IRQ_TYPE_LEVEL_HIGH>,
            <GIC_SPI 56 IRQ_TYPE_LEVEL_HIGH>,
            <GIC_SPI 57 IRQ_TYPE_LEVEL_HIGH>; //конфигурация прерывания, поддерживаемого устройством, для каждого банка. Каждый номер прерывания gic соответствует одному банку, поддерживающему прерывание
    device_type = "pio"; //тип устройства свойства
    clocks = <&clk_pio>, <&clk_losc>, <&clk_hosc>; //часы, используемые устройством
    gpio-controller;          //указывает, что это контроллер gpio
    interrupt-controller;     //указывает, что это контроллер прерывания
    #interrupt-cells = <3>;   //количество параметров, необходимых для свойства прерывания выводов
    #size-cells = <0>;        //не используется
    #gpio-cells = <6>;        //количество параметров, необходимых для свойства gpio, для linux-5.4 это 3
    /* takes the debounce time in usec as argument */
}
```


#### 3.2.2 Конфигурация на уровне платы board.dts

board.dts используется для сохранения информации об устройстве каждой платы (например, демо плата, демо плата 2.0 и т.д.). На примере демо платы путь к board.dts выглядит следующим образом:

/device/config/chips/{CHIP}/configs/demo/board.dts

Если информация о конфигурации в board.dts существует в *.dtsi (например, sun50iw9p1.dtsi и т.д.), то будут применены следующие правила переопределения:

* Одинаковые свойства и узлы будут переопределены конфигурацией из board.dts, которая переопределит конфигурацию в *.dtsi.

* Новые свойства и узлы будут добавлены в финальный сгенерированный файл dtb.

Простая конфигурация некоторых модулей pinctrl на linux-4.9 в board.dts выглядит следующим образом:

```
pio: pinctrl@0300b000 {
    input-debounce = <0 0 0 0 0 0 0>; /*конфигурация частоты дискретизации прерывания, каждый соответствует одному банку поддерживающему прерывание, в единицах us*/

    spi0_pins_a: spi0@0 {
        allwinner,pins = "PC0", "PC2", "PC4";
        allwinner,pname = "spi0_sclk", "spi0_mosi", "spi0_miso";
        allwinner,function = "spi0";
    };
};
```

Для linux-5.4 не рекомендуется использовать способ переопределения выше, а вместо этого рекомендуется изменять узел, на который ссылается pinctrl-0 драйвера.

Конфигурация board.dts на linux-5.4 выглядит следующим образом:

```
&pio{
    input-debounce = <0 0 0 0 1 0 0 0 0>; //конфигурация частоты дискретизации прерывания, каждый соответствует одному банку поддерживающему прерывание, в единицах us
    vcc-pe-supply = <&reg_pio1_8>; //конфигурация выдерживаемого напряжения вывода IO, например содержание здесь означает установку выводов pe на выдерживаемое напряжение 1.8v
};
```


## 4 Описание интерфейса модуля

### 4.1 Описание интерфейса pinctrl

#### 4.1.1 pin4ctrl_get

* Прототип функции: struct pinctrl *pinctrl_get(struct device *dev);

* Функция: получить описатель операции вывода для устройства. Все операции с выводами должны быть основаны на этом описателе pinctrl.

* Параметры:

  * dev: указатель на описатель устройства, запрашивающего описатель операции вывода.

* Возвращаемое значение:

  - При успехе возвращает описатель pinctrl.

  - При ошибке возвращает NULL.



#### 4.1.2 pinctrl_put

* Прототип функции: void pinctrl_put(struct pinctrl *p)

* Функция: освободить описатель pinctrl, должно использоваться вместе с pinctrl_get.

* Параметры:

  * p: указатель на описатель pinctrl для освобождения.

* Возвращаемое значение:

  * Без возвращаемого значения.

**!** Предупреждение

Должно использоваться совместно с **pinctrl_get**.



#### 4.1.3 devm_pinctrl_get

* Прототип функции: struct pinctrl *devm_pinctrl_get(struct device *dev)

* Функция: получить описатель операции вывода для устройства на основе устройства. Все операции с выводами должны быть основаны на этом описателе pinctrl. Функция полностью аналогична pinctrl_get, только devm_pinctrl_get будет записывать полученный описатель pinctrl и связывать его с информацией об описателе устройства. При запросе ресурсов выводов драйвером устройства рекомендуется приоритизировать использование интерфейса devm_pinctrl_get.

* Параметры:

  * dev: указатель на описатель устройства, запрашивающего описатель операции вывода.

* Возвращаемое значение:

  * При успехе возвращает описатель pinctrl.

  * При ошибке возвращает NULL.



#### 4.1.4 devm_pinctrl_put

* Прототип функции: void devm_pinctrl_put(struct pinctrl *p)

* Функция: освободить описатель pinctrl, должно использоваться вместе с devm_pinctrl_get.

* Параметры:

  * p: указатель на описатель pinctrl для освобождения.

* Возвращаемое значение:

  * Без возвращаемого значения.

**!** Предупреждение

Должно использоваться совместно с **devm_pinctrl_get**, явно вызывать этот интерфейс не требуется.



#### 4.1.5 pinctrl_lookup_state

* Прототип функции: struct pinctrl_state *pinctrl_lookup_state(struct pinctrl *p, const char *name)

* Функция: найти описатель состояния выводов на основе описателя операции выводов.

* Параметры:

  * p: указатель на описатель pinctrl для операции.

  * name: указатель на название состояния, например "default", "sleep" и т.д.

* Возвращаемое значение:

  * При успехе возвращает описатель состояния выводов struct pinctrl_state *.

  * При ошибке возвращает NULL.



#### 4.1.6 pinctrl_select_state

* Прототип функции: int pinctrl_select_state(struct pinctrl *p, struct pinctrl_state *s)

* Функция: установить pinctrl, соответствующий описателю выводов, в состояние, соответствующее описателю состояния.

* Параметры:

  * p: указатель на описатель pinctrl для операции.

  * s: указатель на описатель состояния.

* Возвращаемое значение:

  * При успехе возвращает 0.

  * При ошибке возвращает код ошибки.



#### 4.1.7 devm_pinctrl_get_select

* Прототип функции: struct pinctrl *devm_pinctrl_get_select(struct device *dev, const char *name)

* Функция: получить описатель операции выводов для устройства и установить описатель в указанное состояние.

* Параметры:

  * dev: указатель на описатель устройства, управляющего описателем операции выводов.

  * name: название состояния для установки, например "default", "sleep" и т.д.

* Возвращаемое значение:

  * При успехе возвращает описатель pinctrl.

  * При ошибке возвращает NULL.



#### 4.1.8 devm_pinctrl_get_select_default

* Прототип функции: struct pinctrl *devm_pinctrl_get_select_default(struct device *dev)

* Функция: получить описатель операции выводов для устройства и установить описатель в состояние по умолчанию.

* Параметры:

  * dev: указатель на описатель устройства, управляющего описателем операции выводов.

* Возвращаемое значение:

  * При успехе возвращает описатель pinctrl.

  * При ошибке возвращает NULL.



#### 4.1.9 pin_config_get

* Функция: получить свойства указанного вывода.

* Параметры:

  * dev_name: указатель на устройство pinctrl.

  * name: указатель на имя вывода.

  * config: сохраняет информацию о конфигурации вывода.

* Возвращаемое значение:

  * При успехе возвращает номер вывода.

  * При ошибке возвращает код ошибки.

**!** Предупреждение

Этот интерфейс был удален в **linux-5.4**.



#### 4.1.10 pin_config_set

* Функция: установить свойства указанного вывода.

* Параметры:

  * dev_name: указатель на устройство pinctrl.

  * name: указатель на имя вывода.

  * config: информация о конфигурации вывода.

* Возвращаемое значение:

  * При успехе возвращает 0.

  * При ошибке возвращает код ошибки.

**!** Предупреждение

Этот интерфейс был удален в **linux-5.4**.



### 4.2 Описание интерфейса gpio

#### 4.2.1 gpio_request

* Прототип функции: int gpio_request(unsigned gpio, const char *label)

* Функция: запросить gpio, получить права доступа к gpio.

* Параметры:

  * gpio: номер gpio.

  * label: название gpio, может быть NULL.

* Возвращаемое значение:

  * При успехе возвращает 0.

  * При ошибке возвращает код ошибки.



#### 4.2.2 gpio_free

* Прототип функции: void gpio_free(unsigned gpio)

* Функция: освободить gpio.

* Параметры:

  * gpio: номер gpio.

* Возвращаемое значение:

  * Без возвращаемого значения.



#### 4.2.3 gpio_direction_input

* Прототип функции: int gpio_direction_input(unsigned gpio)

* Функция: установить gpio в режим входа.

* Параметры:

  * gpio: номер gpio.

* Возвращаемое значение:

  * При успехе возвращает 0.

  * При ошибке возвращает код ошибки.



#### 4.2.5 __gpio_get_value

* Прототип функции: int __gpio_get_value(unsigned gpio)

* Функция: получить значение уровня gpio (gpio уже находится в состоянии input/output).

* Параметры:

  * gpio: номер gpio.

* Возвращаемое значение:

  * Возвращает логический уровень, соответствующий gpio, 1 представляет высокий уровень, 0 представляет низкий уровень.



#### 4.2.6 __gpio_set_value

* Прототип функции: void __gpio_set_value(unsigned gpio, int value)

* Функция: установить значение уровня gpio (gpio уже находится в состоянии input/output).

* Параметры:

  * gpio: номер gpio.

  * value: ожидаемое значение уровня gpio для установки, ненулевое значение представляет высокий уровень, 0 представляет низкий уровень.

* Возвращаемое значение:

  * Без возвращаемого значения



#### 4.2.7 of_get_named_gpio

* Прототип функции: int of_get_named_gpio(struct device_node *np, const char *propname, int index)

* Функция: анализирует свойство gpio по названию из dts и возвращает номер gpio.

* Параметры:

  * np: указатель на узел устройства, использующий gpio.

  * propname: название свойства в dts.

  * index: значение индекса свойства в dts.

* Возвращаемое значение:

  * При успехе возвращает номер gpio.

  * При ошибке возвращает код ошибки.



#### 4.2.8 of_get_named_gpio_flags

* Прототип функции: int of_get_named_gpio_flags(struct device_node *np, const char *list_name, int index,

enum of_gpio_flags *flags)

* Функция: анализирует свойство gpio по названию из dts и возвращает номер gpio.

* Параметры:

  * np: указатель на узел устройства, использующий gpio.

  * propname: название свойства в dts.

  * index: значение индекса свойства в dts

  * flags: на платформе sunxi необходимо определить как переменную типа struct gpio_config *, потому что выводы pinctrl на платформе sunxi поддерживают подтяжку вверх/вниз, способность управления и другую информацию, а переменная типа enum of_gpio_flags ядра может содержать только информацию о входе и выходе. Впоследствии платформа sunxi должна стандартизировать этот интерфейс.

* Возвращаемое значение:

  * При успехе возвращает номер gpio.

  * При ошибке возвращает код ошибки.

**Предупреждение**

Параметр **flags** этого интерфейса на платформе **sunxi linux-4.9** и ранее должен быть определён как переменная типа **struct gpio_config**. **linux-5.4** уже стандартизировал этот интерфейс и напрямую использует определение **enum of_gpio_flags**.

## 5 Примеры использования

### 5.1 Пример конфигурации dts в драйвере, использующем выводы

Для драйверов, использующих выводы, драйвер в основном установит несколько часто используемых функций выводов, перечисленных ниже:

* Пользователь драйвера конфигурирует только универсальный GPIO, то есть используемый для входа, выхода и прерывания

* Пользователь драйвера установит мультиплексирование выводов, такие как выводы устройства uart, выводы устройства lcd и т.д., используемые для специальных функций

* Пользователь драйвера должен конфигурировать как универсальную функцию выводов, так и характеристики выводов

Далее введены общие сценарии использования.



#### 5.1.1 Конфигурация функции универсального GPIO / функции прерывания

Использование первого способа: конфигурирование GPIO, прерывания. Пример конфигурации device tree выглядит следующим образом:

```
soc{
    ...
    gpiokey {
        device_type = "gpiokey";
        compatible = "gpio-keys";

        ok_key {
            device_type = "ok_key";
            label = "ok_key";
            gpios = <&r_pio PL 0x4 0x0 0x1 0x0 0x1>; //если это linux-5.4, то должно быть gpios = <&r_pio 0 4 GPIO_ACTIVE_HIGH>;
            linux,input-type = "1>";
            linux,code = <0x1c>;
            wakeup-source = <0x1>;
            };
        };
    ...
};
```

Объяснение

```
Объяснение: gpio in/gpio out/ interrupt используют метод конфигурации dts, параметры конфигурации объясняются следующим образом:
Для linux-4.9:
gpios = <&r_pio PL 0x4 0x0 0x1 0x0 0x1>;
            |    |  |   |   |   |   `---выходной уровень, действителен только для output
            |    |  |   |   |   `-------способность управления, при значении 0x0 используется значение по умолчанию
            |    |  |   |   `-----------подтяжка вверх/вниз, при значении 0x1 используется значение по умолчанию
            |    |  |   `---------------тип мультиплексирования
            |    |  `-------------------какой вывод в текущем банке
            |    `-----------------------какой банк
            `---------------------------указатель на какой pio, для cpus используется &r_pio
При использовании вышеуказанного способа конфигурирования gpio, драйвер должен вызвать следующий интерфейс для анализа параметров конфигурации dts:
int of_get_named_gpio_flags(struct device_node *np, const char *list_name, int index,
enum of_gpio_flags *flags)
После получения информации конфигурации gpio (сохраняется в параметре flags, см. раздел 4.2.8), далее в соответствии с требованиями вызовите соответствующий стандартный интерфейс для реализации своей функциональности
Для linux-5.4:
gpios = <&r_pio 0 4 GPIO_ACTIVE_HIGH>;
            |   |      |
            |   |      `-------------------состояние когда gpio активен, если требуется подтяжка вверх/вниз, можно также или с
            GPIO_PULL_UP, GPIO_PULL_DOWN флаги
            |   `-----------------------какой банк
            `---------------------------указатель на какой pio, для cpus используется &r_pio
```



#### 5.1.2 Использование второго способа

Использование второго способа: конфигурирование выводов устройства. Пример конфигурации device tree выглядит следующим образом:

```
device tree соответствующая конфигурация
soc{
    pio: pinctrl@0300b000 {
        ...
        uart0_ph_pins_a: uart0-ph-pins-a {
            allwinner,pins = "PH7", "PH8";
            allwinner,function = "uart0";
            allwinner,muxsel = <3>;
            allwinner,drive = <0x1>;
            allwinner,pull = <0x1>;
        };
        /* для linux-5.4 пожалуйста используйте способ конфигурации ниже */
        mmc2_ds_pin: mmc2-ds-pin {
            pins = "PC1";
            function = "mmc2";
            drive-strength = <30>;
            bias-pull-up;
        };
        ...
    }；
    ...
    uart0: uart@05000000 {
        compatible = "allwinner,sun8i-uart";
        device_type = "uart0";
        reg = <0x0 0x05000000 0x0 0x400>;
        interrupts = <GIC_SPI 49 IRQ_TYPE_LEVEL_HIGH>;
        clocks = <&clk_uart0>;
        pinctrl-names = "default", "sleep";
        pinctrl-0 = <&uart0_pins_a>;
        pinctrl-1 = <&uart0_pins_b>;
        uart0_regulator = "vcc-io";
        uart0_port = <0>;
        uart0_type = <2>;
    };
    ...
};
```

Где:

* pinctrl-0 соответствует "default" в pinctrl-names, то есть конфигурация выводов в режиме нормальной работы модуля

* pinctrl-1 соответствует "sleep" в pinctrl-names, то есть конфигурация выводов в режиме сна модуля



### 5.2 Примеры использования интерфейса

#### 5.2.1 Конфигурация выводов устройства

Обычно драйвер устройства должен использовать только один интерфейс devm_pinctrl_get_select_default для запроса всех ресурсов выводов устройства.

```c
static int sunxi_pin_req_demo(struct platform_device *pdev)
{
	struct pinctrl *pinctrl;
	/* request device pinctrl, set as default state */
	pinctrl = devm_pinctrl_get_select_default(&pdev->dev);
	if (IS_ERR_OR_NULL(pinctrl))
		return -EINVAL;

	return 0;
}
```



#### 5.2.2 Получение номера GPIO

```
static int sunxi_pin_req_demo(struct platform_device *pdev)
{
    struct device *dev = &pdev->dev;
    struct device_node *np = dev->of_node;
    unsigned int gpio;

    #получить конфигурацию gpio в узле устройства.
    gpio = of_get_named_gpio(np, "vdevice_3", 0);
    if (!gpio_is_valid(gpio)) {
    	if (gpio != -EPROBE_DEFER)
    		dev_err(dev, "Error getting vdevice_3\n");
		return gpio;
    }
}
```



#### 5.2.3 Конфигурация свойств GPIO

Управляйте соответствующими свойствами указанного вывода или группы через интерфейсы pin_config_set/pin_config_get/pin_config_group_set/pin_config_group_get.

```
static int pctrltest_request_all_resource(void)
{
    struct device *dev;
    struct device_node *node;
    struct pinctrl *pinctrl;
    struct sunxi_gpio_config *gpio_list = NULL;
    struct sunxi_gpio_config *gpio_cfg;
    unsigned gpio_count = 0;
    unsigned gpio_index;
    unsigned long config;
    int ret;

    dev = bus_find_device_by_name(&platform_bus_type, NULL, sunxi_ptest_data->dev_name);
    if (!dev) {
        pr_warn("find device [%s] failed...\n", sunxi_ptest_data->dev_name);
        return -EINVAL;
    }

    node = of_find_node_by_type(NULL, dev_name(dev));
    if (!node) {
        pr_warn("find node for device [%s] failed...\n", dev_name(dev));
        return -EINVAL;
    }
    dev->of_node = node;

    pr_warn("++++++++++++++++++++++++++++%s++++++++++++++++++++++++++++\n", __func__);
    pr_warn("device[%s] all pin resource we want to request\n", dev_name(dev));
    pr_warn("-----------------------------------------------\n");

    pr_warn("step1: request pin all resource.\n");
    pinctrl = devm_pinctrl_get_select_default(dev);
    if (IS_ERR_OR_NULL(pinctrl)) {
        pr_warn("request pinctrl handle for device [%s] failed...\n", dev_name(dev));
        return -EINVAL;
    }

    pr_warn("step2: get device[%s] pin count.\n", dev_name(dev));
    ret = dt_get_gpio_list(node, &gpio_list, &gpio_count);
    if (ret < 0 || gpio_count == 0) {
        pr_warn(" devices own 0 pin resource or look for main key failed!\n");
        return -EINVAL;
    }

    pr_warn("step3: get device[%s] pin configure and check.\n", dev_name(dev));
    for (gpio_index = 0; gpio_index < gpio_count; gpio_index++) {
        gpio_cfg = &gpio_list[gpio_index];

        /*проверить конфигурацию функции */
        config = SUNXI_PINCFG_PACK(SUNXI_PINCFG_TYPE_FUNC, 0xFFFF);
        pin_config_get(SUNXI_PINCTRL, gpio_cfg->name, &config);
        if (gpio_cfg->mulsel != SUNXI_PINCFG_UNPACK_VALUE(config)) {
            pr_warn("failed! mul value isn't equal as dt.\n");
            return -EINVAL;
        }

        /*проверить конфигурацию подтяжки */
        if (gpio_cfg->pull != GPIO_PULL_DEFAULT) {
            config = SUNXI_PINCFG_PACK(SUNXI_PINCFG_TYPE_PUD, 0xFFFF);
            pin_config_get(SUNXI_PINCTRL, gpio_cfg->name, &config);
            if (gpio_cfg->pull != SUNXI_PINCFG_UNPACK_VALUE(config)) {
                pr_warn("failed! pull value isn't equal as dt.\n");
                return -EINVAL;
            }
        }

        /*проверить конфигурацию dlevel */
        if (gpio_cfg->drive != GPIO_DRVLVL_DEFAULT) {
            config = SUNXI_PINCFG_PACK(SUNXI_PINCFG_TYPE_DRV, 0XFFFF);
            pin_config_get(SUNXI_PINCTRL, gpio_cfg->name, &config);
            if (gpio_cfg->drive != SUNXI_PINCFG_UNPACK_VALUE(config)) {
                pr_warn("failed! dlevel value isn't equal as dt.\n");
                return -EINVAL;
            }
        }

        /*проверить конфигурацию данных */
        if (gpio_cfg->data != GPIO_DATA_DEFAULT) {
            config = SUNXI_PINCFG_PACK(SUNXI_PINCFG_TYPE_DAT, 0XFFFF);
            pin_config_get(SUNXI_PINCTRL, gpio_cfg->name, &config);
            if (gpio_cfg->data != SUNXI_PINCFG_UNPACK_VALUE(config)) {
                pr_warn("failed! pin data value isn't equal as dt.\n");
                return -EINVAL;
            }
        }
    }

    pr_warn("-----------------------------------------------\n");
    pr_warn("test pinctrl request all resource success!\n");
    pr_warn("++++++++++++++++++++++++++++end++++++++++++++++++++++++++++\n\n");
    return 0;
}
Примечание: необходимо обратить внимание на то, что существуют два устройства SUNXI_PINCTRL и SUNXI_R_PINCTRL pinctrl, выводы в домене cpus должны использовать
SUNXI_R_PINCTRL
```

**!** Предупреждение

В **linux5.4** используйте **pinctrl_gpio_set_config** для конфигурирования свойств **gpio**, используйте **pinconf_to_config_pack** для генерации параметра **config**:

* **SUNXI_PINCFG_TYPE_FUNC** больше не действует, временно не поддерживается конфигурация **FUNC** (рекомендуется использовать интерфейс **pinctrl_select_state** вместо этого)

* **SUNXI_PINCFG_TYPE_PUD** обновлен в соответствии с стандартным определением ядра（**PIN_CONFIG_BIAS_PULL_UP/PIN_CONFIG_BIAS_PULL_DOWN**）

* **SUNXI_PINCFG_TYPE_DRV** обновлено в соответствии с стандартным определением ядра（**PIN_CONFIG_DRIVE_STRENGTH**）, соответствующее отношение **val** составляет (4.9->5.4: 0->10, 1->20…）

* **SUNXI_PINCFG_TYPE_DAT** больше не действует, временно не поддерживается конфигурация **DAT** (рекомендуется использовать **gpio_direction_output** или **__gpio_set_value** для установки уровня）



### 5.3 Использование функции прерывания GPIO в драйвере устройства

Способ 1: получить виртуальный номер прерывания через gpio_to_irq, затем вызвать функцию запроса прерывания. В настоящее время sunxi-pinctrl использует irq-domain для реализации функции виртуального irq для прерывания gpio. При использовании функции прерывания gpio драйвер устройства должен только получить виртуальный номер прерывания через gpio_to_irq, затем остальная часть может работать в соответствии со стандартным интерфейсом irq.

```
static int sunxi_gpio_eint_demo(struct platform_device *pdev)
{
    struct device *dev = &pdev->dev;
    int virq;
    int ret;
    /* map the virq of gpio */
    virq = gpio_to_irq(GPIOA(0));
    if (IS_ERR_VALUE(virq)) {
	    pr_warn("map gpio [%d] to virq failed, errno = %d\n",
    											GPIOA(0), virq);
        return -EINVAL;
    }
    pr_debug("gpio [%d] map to virq [%d] ok\n", GPIOA(0), virq);
    /* request virq, set virq type to high level trigger */
    ret = devm_request_irq(dev, virq, sunxi_gpio_irq_test_handler,
                                IRQF_TRIGGER_HIGH, "PA0_EINT", NULL);
    if (IS_ERR_VALUE(ret)) {
        pr_warn("request virq %d failed, errno = %d\n", virq, ret);
        return -EINVAL;
    }

	return 0;
}
```

Способ 2: конфигурирование прерывания gpio через dts, получение виртуального номера прерывания через функцию анализа dts, наконец вызов функции запроса прерывания. Пример выглядит следующим образом:

```
Конфигурация dts выглядит следующим образом:
soc{
	...
    Vdevice: vdevice@0 {
        compatible = "allwinner,sun8i-vdevice";
        device_type = "Vdevice";
        interrupt-parent = <&pio>; /*зависимый контроллер прерывания (узел с свойством interrupt-controller)*/
        interrupts = < PD 3 IRQ_TYPE_LEVEL_HIGH>;
                        | |   `------------------условие срабатывания и тип прерывания
                        | `-------------------------смещение в банке выводов
                        `---------------------------какой банк
        pinctrl-names = "default";
        pinctrl-0 = <&vdevice_pins_a>;
        test-gpios = <&pio PC 3 1 2 2 1>;
        status = "okay";
	};
	...
};
```

В драйвере используйте стандартный интерфейс platform_get_irq() для получения виртуального номера прерывания, как показано ниже:

```
static int sunxi_pctrltest_probe(struct platform_device *pdev)
{
    struct device_node *np = pdev->dev.of_node;
    struct gpio_config config;
    int gpio, irq;
    int ret;

    if (np == NULL) {
        pr_err("Vdevice failed to get of_node\n");
        return -ENODEV;
    }
    ....
    irq = platform_get_irq(pdev, 0);
    if (irq < 0) {
        printk("Get irq error!\n");
        return -EBUSY;
    }
	.....
	sunxi_ptest_data->irq = irq;
	......
	return ret;
}

//запрос прерывания:
static int pctrltest_request_irq(void)
{
    int ret;
    int virq = sunxi_ptest_data->irq;
    int trigger = IRQF_TRIGGER_HIGH;

    reinit_completion(&sunxi_ptest_data->done);

    pr_warn("step1: request irq(%s level) for irq:%d.\n",
	    trigger == IRQF_TRIGGER_HIGH ? "high" : "low", virq);
	ret = request_irq(virq, sunxi_pinctrl_irq_handler_demo1,
			trigger, "PIN_EINT", NULL);
    if (IS_ERR_VALUE(ret)) {
        pr_warn("request irq failed !\n");
        return -EINVAL;
    }

    pr_warn("step2: wait for irq.\n");
    ret = wait_for_completion_timeout(&sunxi_ptest_data->done, HZ);

    if (ret == 0) {
        pr_warn("wait for irq timeout!\n");
        free_irq(virq, NULL);
        return -EINVAL;
    }

    free_irq(virq, NULL);

    pr_warn("-----------------------------------------------\n");
    pr_warn("test pin eint success !\n");
    pr_warn("+++++++++++++++++++++++++++end++++++++++++++++++++++++++++\n\n\n");

    return 0;
}
```



### 5.4 Установка функции debounce прерывания в драйвере устройства

Способ 1: конфигурирование debounce для каждого банка прерывания через dts. На примере устройства pio выглядит следующим образом:

```
&pio {
    /* takes the debounce time in usec as argument */
    input-debounce = <0 0 0 0 0 0 0>;
                      | | | | | | `----------PA банк
                      | | | | | `------------PC банк
                      | | | | `--------------PD банк
                      | | | `----------------PF банк
                      | | `------------------PG банк
                      | `--------------------PH банк
                      `----------------------PI банк
};
```

Примечание: значения свойств input-debounce должны включать все банки, поддерживающие прерывание в устройстве pio. Если отсутствуют, значения свойств будут установлены на соответствующие регистры debounce в порядке банков. Отсутствующие банки должны иметь значение debounce по умолчанию (если не были изменены при запуске). На платформе sunxi linux-4.9 максимальная частота дискретизации прерывания составляет 24M, минимальная 32k. Значение свойства debounce может быть только 0 или 1. Для linux-5.4 диапазон значений debounce составляет 0~1000000 (в единицах usec).

Способ 2: модуль драйвера вызывает интерфейс gpio для установки debounce прерывания

```
static inline int gpio_set_debounce(unsigned gpio, unsigned debounce);
int gpiod_set_debounce(struct gpio_desc *desc, unsigned debounce);
```

В драйвере вызовите два указанных выше интерфейса для установки регистра debounce прерывания, соответствующего gpio. Обратите внимание, что debounce указывается в миллисекундах (linux-5.4 уже удалил этот интерфейс).
