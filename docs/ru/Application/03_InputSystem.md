# 3 Система ввода

## 3.1 Что такое система ввода?

Прежде чем разобраться с системой ввода, давайте сначала поймем, что такое устройства ввода. Распространенные устройства ввода включают клавиатуру, мышь, джойстик, планшет для письма, сенсорный экран и т.д. Пользователи обмениваются данными с системой Linux через эти устройства ввода. Для унифицированного управления и обработки этих устройств Linux реализовала набор фиксированных аппаратно-независимых фреймворков системы ввода для использования программами пользовательского пространства. Это и есть система ввода.

## 3.2 Описание фреймворка приложений системы ввода

В системе ввода Linux управление осуществляется на трех уровнях: input core (ядро системы ввода), drivers (уровень драйверов системы ввода) и event handlers (уровень обработчиков событий системы ввода). Как показано на рисунке ниже, это базовый фреймворк системы ввода Linux:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image001.png)

Приведем очень простой пример: когда пользователь нажимает одну из клавиш на клавиатуре, процесс выглядит следующим образом:

Нажатие клавиши --> Уровень драйверов системы ввода --> Ядро системы ввода --> Уровень обработчиков событий системы ввода --> Пространство пользователя

С точки зрения программирования приложений, нам нужно только обратить внимание на то, как пространство пользователя получает событие после нажатия клавиши. Например, я хочу знать, было ли текущее нажатие коротким или длинным? Или я хочу знать, нажал ли я клавишу пробела или клавишу Enter и т.д.

## 3.3 Чтение и анализ событий системы ввода

Узлов устройств в пространстве пользователя так много, как узнать, какое устройство сообщило о событии? Например, если вы хотите узнать, какой узел устройства сообщает о событиях клавиатуры, вы можете получить эту информацию с помощью следующей команды:

```c
cat /proc/bus/input/devices
```

Эта команда означает получение информации об устройствах, соответствующих event. В системе Ubuntu после ввода этой команды мы видим следующий результат:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image002.png)

Что означает каждая строка I, N, P, S, U, H, B здесь?

**I:id of the device(ID устройства)**

Этот параметр описывается структурой struct input_id

```c
41 struct input_id {
42 	//Тип шины
43 	__u16 bustype;
44 	//ID, связанный с производителем
45 	__u16 vendor;
46 	//ID, связанный с продуктом
47 	__u16 product;
48 	//ID версии
49 	__u16 version;
50 };
```

**N:name of the device**

Имя устройства

**P:physical path to the device in the system hierarchy**

Физический путь к устройству в системной иерархии.

**S:sysfs path**

Путь в файловой системе sys

**U:unique identification code for the device(if device has it)**

Уникальный идентификационный код устройства

**H:list of input handles associated with the device.**

Список дескрипторов ввода, связанных с устройством.

**B:bitmaps(битовые карты)**

PROP:device properties and quirks.

EV:types of events supported by the device.

KEY:keys/buttons this device has.

MSC:miscellaneous events supported by the device.

LED:leds present on the device.

PROP:свойства устройства и особенности.

EV:типы событий, поддерживаемые устройством.

KEY:клавиши/кнопки этого устройства.

MSC:прочие события, поддерживаемые устройством.

LED:индикаторы на устройстве.

Поняв значение вышеуказанных параметров и используя следующую команду

```c
cat /proc/bus/input/devices
```

из отображаемой информации легко узнать, что event1 - это узел устройства событий, сообщаемых клавиатурой. Читая этот event1, можно получить конкретное событие нажатой пользователем клавиши.

**Использование команды cat для тестирования событий клавиатуры**

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image003.png)

Когда мы вводим в терминале

```c
cat /dev/input/event1
```

После ввода этой команды и нажатия клавиши Enter можно увидеть кучу непонятных данных. Мы не понимаем эти данные, но можем знать, что если клавиша нажата, терминал выдает ответное сообщение, и тогда мы знаем, что это событие сообщается устройством, которое мы сейчас используем. Как сделать эти данные понятными? В этом случае можно использовать команду hexdump для чтения событий клавиатуры.

**Использование команды hexdump для тестирования событий клавиатуры**

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image004.png)

Эти значения сообщаются через структуру input_event, которая находится в заголовочном файле /usr/include/linux/input.h. Структура input_event описывается следующим образом:

```c
24 struct input_event {
25 	//Время возникновения события
26 	struct timeval time;
27 	//Тип события
28 	__u16 type;
29 	//Значение события
30 	__u16 code;
31 	//Числовое значение, сообщаемое этим событием
32 	__s32 value;
33 };
```

А time в структуре input_event - это:

```c
1 struct timeval
2 {
3 	__time_t tv_sec;        /* Seconds. */
4 	__suseconds_t tv_usec;    /*Microseconds. */
5 };
```

Где tv_sec - количество секунд от Epoch до создания struct timeval, tv_usec - количество микросекунд, то есть остаток после секунд. Epoch означает 00:00:00 1 января 1970 года по Гринвичу.

Возвращаясь к структуре input_event, тип события type в основном бывает трех типов: относительное событие, абсолютное событие, событие клавиатуры.

Например: мышь - это относительное событие, хотя в некоторых случаях может быть и абсолютным событием. При перемещении мыши type - это тип события, сообщаемый нижним уровнем пользователю, тогда code представляет координату X или Y относительно текущей позиции мыши, а value представляет смещение относительно текущей позиции.

**Тип события (type)**

Путь к заголовочному файлу:

```c
/usr/include/linux/input-event-codes.h
```

Конечно, в более старых версиях ядра Linux он может находиться в следующем заголовочном файле:

```c
/usr/include/linux/input.h
```

```c
34 /*
35  * Event types
36  */
37
38 #define EV_SYN			0x00	//Событие синхронизации
39 #define EV_KEY			0x01	//Событие клавиши
40 #define EV_REL			0x02	//Относительное событие
41 #define EV_ABS			0x03	//Абсолютное событие
42 #define EV_MSC			0x04
43 #define EV_SW			0x05
44 #define EV_LED			0x11
45 #define EV_SND			0x12
46 #define EV_REP			0x14
47 #define EV_FF			0x15
48 #define EV_PWR			0x16
49 #define EV_FF_STATUS		0x17
50 #define EV_MAX			0x1f
51 #define EV_CNT			(EV_MAX+1)
```

**Значение события (code)**

Поскольку значений событий очень много, мы не будем перечислять их все здесь. Приведем часть значений событий клавиатуры:

Путь к заголовочному файлу:

```c
/usr/include/linux/input-event-codes.h
```

Конечно, в более старых версиях ядра Linux он может находиться в следующем заголовочном файле:

```c
/usr/include/linux/input.h
64 /*
65  * Keys and buttons
66  *
67  * Most of the keys/buttons are modeled after USB HUT 1.12
68  * (see http://www.usb.org/developers/hidpage).
69  * Abbreviations in the comments:
70  * AC - Application Control
71  * AL - Application Launch Button
72  * SC - System Control
73  */
74
75 #define KEY_RESERVED		0
76 #define KEY_ESC			1
77 #define KEY_1			2
78 #define KEY_2			3
79 #define KEY_3			4
80 #define KEY_4			5
81 #define KEY_5			6
82 #define KEY_6			7
83 #define KEY_7			8
84 #define KEY_8			9
85 #define KEY_9			10
86 #define KEY_0			11
87 #define KEY_MINUS		12
88 #define KEY_EQUAL		13
89 #define KEY_BACKSPACE		14
90 #define KEY_TAB			15
91 #define KEY_Q			16
92 #define KEY_W			17
...
```

Конечно, есть также значения событий мыши, джойстика, сенсорного экрана и т.д.

**Числовое значение, сообщаемое событием (value)**

Эта часть уже была представлена выше на примере мыши. Далее мы получим события через приложение. В следующих разделах мы более подробно изучим программирование приложений системы ввода на трех примерах: мышь, клавиатура и сенсорный экран.

## 3.4 Практика программирования приложений системы ввода 1: Чтение событий универсальной USB мыши

Согласно объяснениям предыдущих разделов, если нам нужно получить события USB мыши, сначала нужно через команду cat /proc/bus/input/devices запросить информацию об устройстве, соответствующем событиям USB мыши. Через фактическое тестирование установлено, что event2 - это узел событий, сообщаемых USB мышью.

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image005.png)

Далее протестируем вывод событий мыши командой hexdump:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image006.png)

Конкретное значение сообщаемых данных можно проанализировать в сочетании с разделом 3.3, здесь это не будет повторяться. Цель этого раздела - написать приложение для получения событий универсальной USB мыши. Чтобы получить событие, нам нужно понять следующие несколько частей.

**1 Тип события, сообщаемого устройством (type)**

Из раздела 3.3 мы знаем, где найти определение соответствующего типа события:

Путь к заголовочному файлу:

```c
/usr/include/linux/input-event-codes.h
```

Конечно, в более старых версиях ядра Linux он может находиться в следующем заголовочном файле:

```c
/usr/include/linux/input.h
```

```c
34 /*
35  * Event types
36  */
37
38 #define EV_SYN			0x00	//Событие синхронизации
39 #define EV_KEY			0x01	//Событие клавиши
40 #define EV_REL			0x02	//Относительное событие
41 #define EV_ABS			0x03	//Абсолютное событие
42 #define EV_MSC			0x04
43 #define EV_SW			0x05
44 #define EV_LED			0x11
45 #define EV_SND			0x12
46 #define EV_REP			0x14
47 #define EV_FF			0x15
48 #define EV_PWR			0x16
49 #define EV_FF_STATUS		0x17
50 #define EV_MAX			0x1f
51 #define EV_CNT			(EV_MAX+1)
```

**2 Значение события, сообщаемого устройством (code)**

Поскольку в этом разделе мы пишем приложение для универсальной USB мыши, мы находим code, связанный с мышью, следующим образом:

Путь к заголовочному файлу:

```c
/usr/include/linux/input-event-codes.h
```

Конечно, в более старых версиях ядра Linux он может находиться в следующем заголовочном файле:

```c
/usr/include/linux/input.h
```

```c
696 /*
697  * Relative axes
698  */
699
700 #define REL_X			0x00	//Относительная координата X
701 #define REL_Y			0x01	//Относительная координата Y
702 #define REL_Z			0x02
703 #define REL_RX			0x03
704 #define REL_RY			0x04
705 #define REL_RZ			0x05
706 #define REL_HWHEEL		0x06
707 #define REL_DIAL		0x07
708 #define REL_WHEEL		0x08
709 #define REL_MISC		0x09
710 #define REL_MAX			0x0f
711 #define REL_CNT			(REL_MAX+1)
```

Здесь мы будем использовать только два параметра: REL_X и REL_Y.

Что касается value, это значение, отражаемое после выбора конкретного типа события (type) и конкретного значения события (code). Для мыши это значение относительно текущего X или относительно текущего Y. Далее давайте посмотрим, как читать события мыши.

Перед написанием приложения input в программу нужно включить следующий заголовочный файл:

```c
#include <linux/input.h>
```

Шаги написания программы:

1 Определить переменную структуры input_event для описания события input

```c
struct input_event event_mouse ;
```

2 Открыть узел события устройства input, здесь универсальная USB мышь - это event2

```c
open("/dev/input/event2",O_RDONLY);
```

3 Прочитать событие

```c
read(fd ,&event_mouse ,sizeof(event_mouse));
```

4 Обработать сообщенное событие

```c
//Определить тип события, сообщаемого мышью, может быть абсолютным или относительным
if(EV_ABS == event_mouse.type || EV_REL == event_mouse.type)
{
   //code представляет относительное смещение X или Y, при определении X печатается относительное смещение X value
   //при определении Y печатается относительное смещение Y value
   if(event_mouse.code == REL_X)
   {
      printf("event_mouse.code_X:%d\n", event_mouse.code);
      printf("event_mouse.value_X:%d\n", event_mouse.value);
   }
   else if(event_mouse.code == REL_Y)
   {
      printf("event_mouse.code_Y:%d\n", event_mouse.code);
      printf("event_mouse.value_Y:%d\n", event_mouse.value);
   }
}
```

5 Закрыть файловый дескриптор

```c
close(fd);
```

Нетрудно заметить, что получение события системы ввода - это также стандартная операция с файлами, что отражает идею Linux "все есть файл".

Полный пример программы следующий:

```c
01 #include <stdio.h>
02 #include <unistd.h>
03 #include <stdlib.h>
04 #include <fcntl.h>
05 #include <linux/input.h>
06
07 int main(void)
08 {
09     //1、Определить переменную структуры для описания события input
10     struct input_event event_mouse ;
11     //2、Открыть узел события устройства input  Моя универсальная USB мышь - это event2
12     int fd    = -1 ;
13 	   fd = open("/dev/input/event2", O_RDONLY);
14     if(-1 == fd)
15     {
16         printf("open mouse event fair!\n");
17         return -1 ;
18     }
19     while(1)
20     {
21         //3、Прочитать событие
22         read(fd, &event_mouse, sizeof(event_mouse));
23 		   if(EV_ABS == event_mouse.type || EV_REL == event_mouse.type)
24 		   {
25             //code представляет относительное смещение X или Y, при определении X печатается относительное смещение X value
26 			   //при определении Y печатается относительное смещение Y value
27             if(event_mouse.code == REL_X)
28             {
29 				   printf("event_mouse.code_X:%d\n", event_mouse.code);
30                 printf("event_mouse.value_X:%d\n", event_mouse.value);
31             }
32             else if(event_mouse.code == REL_Y)
33             {
34                 printf("event_mouse.code_Y:%d\n", event_mouse.code);
35                 printf("event_mouse.value_Y:%d\n", event_mouse.value);
36             }
37 		}
38     }
39     close(fd);
40     return 0 ;
41 }
```

После написания кода выполните

```c
gcc test_mouse.c -o test_mouse
```

Компиляция программы:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image007.png)

После успешной компиляции будет создан test_mouse. Далее выполните эту программу test_mouse.

Когда мышь движется влево-вправо, сообщается событие:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image008.png)

В это время можно видеть, что происходит только изменение значения события относительно X, и печатаемый value - это значение смещения в направлении X относительно начальной координаты.

Когда мышь движется вверх-вниз, сообщается событие:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image009.png)

В это время можно видеть, что происходит только изменение значения события относительно Y, и печатаемый value - это значение смещения в направлении Y относительно начальной координаты.

## 3.5 Практика программирования приложений системы ввода 2: Чтение событий универсальной клавиатуры

Как получить события клавиатуры, уже было рассказано в разделе 3.3, здесь это не будет повторяться. Этот раздел реализует получение событий универсальной клавиатуры. В сочетании с разделом 3.4 по получению событий мыши, здесь узел событий универсальной клавиатуры - event1. Объединяя разделы 3.3 и 3.4, шаги написания следующие:

Перед написанием приложения input в программу нужно включить следующий заголовочный файл:

```c
#include <linux/input.h>
```

Шаги написания программы:

1 Определить переменную структуры input_event для описания события input

```c
struct input_event event_keyboard ;
```

2 Открыть узел события устройства input, узел моей универсальной клавиатуры - event1

```c
open("/dev/input/event1",O_RDONLY);
```

3 Прочитать событие

```c
read(fd ,&event_keyboard ,sizeof(event_keyboard));
```

4 Обработать сообщенное событие

```c
//Определить тип события, сообщаемого клавиатурой
if(EV_KEY == event_keyboard.type)
{
    if(1 == event_keyboard.value)
      printf("Тип события:%d  Значение события:%d Нажато\n", event_keyboard.type, 				         event_keyboard.code);
    else if(0 == event_keyboard.value)
      printf("Тип события:%d  Значение события:%d Отпущено\n", event_keyboard.type, event_keyboard.code);
}
```

5 Закрыть файловый дескриптор

```c
close(fd);
```

Полная реализация примера программы следующая:

```c
01 #include <stdio.h>
02 #include <unistd.h>
03 #include <stdlib.h>
04 #include <fcntl.h>
05 #include <linux/input.h>
06
07 int main(void)
08 {
09     //1、Определить переменную структуры для описания события input
10     struct input_event event_keyboard ;
11     //2、Открыть узел события устройства input  Узел моей универсальной клавиатуры - event1
12     int fd    = -1 ;
13 	   fd = open("/dev/input/event1", O_RDONLY);
14     if(-1 == fd)
15     {
16         printf("open mouse event fair!\n");
17         return -1 ;
18     }
19     while(1)
20     {
21         //3、Прочитать событие
22         read(fd, &event_keyboard, sizeof(event_keyboard));
23 		   if(EV_KEY == event_keyboard.type)
24 		   {
25 				if(1 == event_keyboard.value)
26 					printf("Тип события:%d  Значение события:%d Нажато\n",event_keyboard.type,event_keyboard.code);
27 				else if(0 == event_keyboard.value)
28 					printf("Тип события:%d  Значение события:%d Отпущено\n",event_keyboard.type,event_keyboard.code);
29 		}
30     }
31     close(fd);
32     return 0 ;
33 }
```

Нетрудно заметить, что шаги написания программы для универсальной USB клавиатуры почти такие же, как и для универсальной USB мыши. Разница только в типе читаемого события и в обрабатываемых данных value.

После написания кода выполните

```c
gcc test_keyboard.c -o test_keyboard
```

Компиляция программы:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image010.png)

После успешной компиляции будет создан test_keyboard. Далее выполните эту программу test_keyboard.

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image011.png)

При нажатии клавиши можно наблюдать процесс нажатия и отпускания клавиши, что фактически представляет собой два разных состояния одного и того же события.

## 3.6 Практика программирования приложений системы ввода 3: Чтение событий сенсорного экрана отладочной платы 100ask imx6ul

В предыдущих разделах мы уже освоили основные операции с мышью и клавиатурой и обнаружили закономерность: метод программирования похож, единственное отличие - это получаемый тип события и значение события. Так к какому типу событий в системе input относится сенсорный экран?

Обычно сенсорный экран в системе input относится к абсолютным событиям, то есть координаты точки касания X и Y сообщаются как абсолютные координаты в пределах разрешения экрана.

Абсолютному событию соответствует значение: EV_ABS

Соответствующие значения компонентов X и Y:

ABS_MT_POSITION_X, ABS_MT_POSITION_Y

Объединяя содержимое предыдущих разделов, легко написать следующую программу:

```c
01 #include <stdio.h>
02 #include <unistd.h>
03 #include <fcntl.h>
04 #include <stdlib.h>
05 #include <linux/input.h>
06
07 int main(int argc, char **argv)
08 {
09     int tp_fd  = -1 ;
10     int tp_ret = -1 ;
11     int touch_x,touch_y ;
12     struct input_event imx6ull_ts ;
13     //1、Открыть узел события сенсорного экрана
14     tp_fd = open("/dev/input/event1",O_RDONLY);
15     if(tp_fd < 0)
16     {
17        printf("open /dev/input/event1 fail!\n");
18        return -1 ;
19     }
20     while(1)
21     {
22 	 		//2、Получить соответствующие события сенсорного экрана и вывести текущие координаты касания
23          read(tp_fd ,&imx6ull_ts ,sizeof(imx6ull_ts));
24          switch(imx6ull_ts.type)
25 	 		{
26 	    		case EV_ABS:
27 		 		if(imx6ull_ts.code == ABS_MT_POSITION_X)
28 		    		touch_x = imx6ull_ts.value ;
29 		 		if(imx6ull_ts.code == ABS_MT_POSITION_Y)
30 		    		touch_y = imx6ull_ts.value ;
31 		 		break ;
32 		 		defalut:
33 		 		break ;
34 	 		}
35 	 		printf("touch_x:%d touch_y:%d\n",touch_x,touch_y);
36 	 		usleep(100);
37     }
38     close(tp_fd);
39     return 0;
40 }
```

После написания кода выполните

```c
gcc test_touchscreen.c -o test_touchscreen
```

Кросс-компиляция программы: (обратите внимание, что здесь программа запускается на отладочной плате, а не на ПК)

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image012.png)

Далее запустите отладочную плату, затем в терминале последовательного порта введите команду rz и дождитесь получения файла с ПК. Здесь мы передадим файл test_touchscreen на отладочную плату.

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image013.png)

Конкретные шаги можно найти в главе 11: Передача файлов между ПК и отладочной платой

Далее добавьте права на выполнение для test_touchscreen:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image014.png)

Выполните test_touchscreen, затем прикоснитесь к экрану пальцем, можно увидеть печать соответствующих значений координат:

![](http://photos.100ask.net/NewHomeSite/InputSystem_Image015.png)
