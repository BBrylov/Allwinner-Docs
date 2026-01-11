# 9 Программирование GPIO

## 9.1 Основы программирования GPIO

GPIO (General-Purpose IO Ports), то есть универсальные порты ввода-вывода. Использование GPIO довольно простое, в основном делится на две функции: вход и выход. GPIO в основном используется для управления простыми устройствами. В качестве входного GPIO мы можем подключить этот IO к внешней кнопке или датчику для определения внешнего состояния. В качестве выхода мы можем управлять работой внешних устройств, выводя высокий или низкий уровень.

Поскольку функции GPIO разнообразны, сначала нужно установить пин как GPIO. После установки в GPIO нужно задать направление GPIO. При установке как выход мы можем управлять выводом высокого или низкого уровня. При установке как вход мы можем читать уровень GPIO для определения высокого или низкого уровня внешнего входа.

## 9.2 Программный интерфейс GPIO

Программирование GPIO имеет несколько способов реализации. Здесь мы используем метод sysfs для реализации управления GPIO.

Если нужно управлять gpio через sysfs, сначала требуется поддержка базового ядра. Для реализации поддержки sysfs gpio в ядре нужно настроить ядро. При компиляции ядра добавить Device Drivers-> GPIO Support ->/sys/class/gpio/… (sysfs interface). Пин, используемый как GPIO, не должен использоваться для других целей в ядре.

После нормальной работы системы можно увидеть интерфейсы управления sysfs в /sys/class/gpio. Есть три типа интерфейсов: управляющий интерфейс, сигнал GPIO и контроллер GPIO. Подробное описание этой части см. в《kernel\Documentation\gpio\sysfs.txt》.

#### 9.2.1 Управляющий интерфейс

Управляющий интерфейс используется для управления GPIO в пользовательском пространстве, в основном включает два интерфейса: /sys/class/gpio/export и /sys/class/gpio/unexport. Оба управляющих интерфейса доступны только для записи. /sys/class/gpio/export экспортирует управление GPIO из пространства ядра в пользовательское пространство, /sys/class/gpio/unexport отменяет экспорт управления GPIO из пространства ядра в пользовательское пространство.

Рассмотрим на примере GPIO с номером пина 19. В каталоге /sys/class/gpio после выполнения "echo 19 > export" создается узел "gpio19" для управления GPIO с номером пина 19. После выполнения "echo 19 > unexport" удаляется узел "gpio19", созданный ранее через export. Для использования gpio сначала нужно экспортировать номер пина GPIO через /sys/class/gpio/export. После использования можно удалить ранее экспортированный пин GPIO через /sys/class/gpio/unexport.

#### 9.2.2 Сигнал GPIO

Сигнал GPIO, то есть сам GPIO, его путь /sys/class/gpio/gpioN/, имеет несколько атрибутов. Управляя этими атрибутами, можно управлять GPIO.

- Атрибут "direction", читаемое значение "in" или "out". Записывая "in" или "out" в этот атрибут, можно установить GPIO как вход или выход. Если записать "out", GPIO сразу выдаст низкий уровень. Также можно записать "low" или "high", чтобы сразу установить вывод низкого или высокого уровня.

- Атрибут "value" используется для чтения входного уровня или управления выходным уровнем. Если GPIO настроен как выход, запись 0 в value выдает низкий уровень, запись не-0 выдает высокий уровень. Если настроен как вход, чтение 0 означает низкий входной уровень, 1 - высокий.

- Атрибут "edge" используется для установки уровня триггера, появляется только когда GPIO можно настроить как входной пин прерывания.

#### 9.2.3 Контроллер GPIO

Контроллер GPIO представляет начальный GPIO реализации управления GPIO, его путь /sys/class/gpio/gpiochipN/. Например, /sys/class/gpio/gpiochip42/ представляет, что номер инициализации контроллера GPIO - 42. Атрибуты контроллера GPIO доступны только для чтения, включая base, label, ngpio и др.

- Атрибут "base" имеет то же значение, что и N в gpiochipN, представляет первый GPIO, реализованный этой группой контроллера GPIO.

- Атрибут "ngpio" показывает, сколько GPIO поддерживает этот контроллер, поддерживаемые номера GPIO от N до N+ngpio-1

- Атрибут "label" используется для определения контроллера, не всегда уникален

## 9.3 Определение номера GPIO платы разработки IMX6ULL

Каждый чип может иметь N групп GPIO, каждая группа GPIO максимум 32 GPIO, то есть максимум N*32 GPIO. Но в реальном проектировании количество GPIO в каждой группе различно. В IMX6ULL фактическое количество GPIO в каждой группе показано на рисунке ниже, подробности см. в руководстве《IMX6ULLRM.pdf》 стр. 1347.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image001.png)

На рисунке видно, что в IMX6ULL всего 5 групп GPIO, начальная группа GPIO - GPIO1. Поэтому при расчете фактического номера GPIO первая группа GPIO1 соответствует номерам 0~31. Аналогично, GPION_X в IMX6ULL (N=1~5, X=0~31) фактически соответствует номеру (N-1)*32+X. Далее на примере GPIO для встроенного LED и кнопок объясним, как рассчитать номер GPIO в реальном применении.

### 9.3.1 Расчет номера GPIO для LED

Найдем на схеме соответствующий дизайн LED, конкретное подключение показано на рисунке ниже. На рисунке видно, что LED подключен к GPIO5_3, соответствующий номер GPIO фактически (5-1)*32+3 = 131. Поэтому, если нужно управлять LED в sys_gpio, нужно экспортировать GPIO номер 131.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image002.png)

### 9.3.2 Расчет номера GPIO для кнопки

Найдем на схеме соответствующий дизайн кнопок, на базовой плате 2 кнопки, конкретное подключение показано на рисунке ниже. На рисунке видно, что две кнопки подключены к GPIO5_1 и GPIO4_14, первая кнопка KEY1 соответствует номеру GPIO (5-1)*32+1 = 129, вторая кнопка KEY2 соответствует номеру GPIO (4-1)*32+14=110. Поэтому, если нужно читать значения кнопок KEY1 и KEY2 в sys_gpio, нужно экспортировать GPIO номера 129 и 110.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image003.png)

### 9.3.3 Расчет номера GPIO в особых случаях

В некоторых случаях начальный gpiochipN не gpiochip0. В этом случае нужно к исходному номеру GPIO добавить значение начального gpiochipN для расчета. Рисунок ниже показывает случай, когда начальный gpiochip - gpiochip0.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image004.png)

## 9.4 Практическое программирование

В практической работе мы с помощью LED и кнопок реализовали эксперименты по выводу и вводу GPIO, соответствующий процесс экспериментов и код приведены ниже.

### 9.4.1 Экспорт порта GPIO

Для экспорта порта GPIO нужно записать номер экспортируемого пина в /sys/class/gpio/export. После использования можно также отменить экспорт номера пина через /sys/class/gpio/unexport.

Код реализации экспорта номера пина показан ниже, подробности см. в функции sysfs_gpio_export() файла《sysfs_gpio_1_export_gpio sysfs_gpio_export.c》.

```c
32 int sysfs_gpio_export(unsigned int gpio)
33 {
34     int fd, len;
35     char buf[MAX_BUF];
36 	// /sys/class/gpio/export
37     fd = open( "/sys/class/gpio/export", O_WRONLY);//открыть файл
38     if (fd < 0) {
39         perror("gpio/export");
40         return fd;
41     }
42  
43     len = snprintf(buf, sizeof(buf), "%d", gpio);//преобразовать из числа в строку, т.е. 1 в "1"
44     write(fd, buf, len);//записать номер экспортируемого пина GPIO
45     close(fd);//закрыть файл
46  
47     return 0;
48 }
```

Код реализации отмены экспорта номера пина показан ниже, подробности см. в функции sysfs_gpio_unexport() файла《sysfs_gpio_export.c》.

```c
59 int sysfs_gpio_unexport(unsigned int gpio)
60 {
61     int fd, len;
62     char buf[MAX_BUF];
63 	// /sys/class/gpio/unexport
64     fd = open("/sys/class/gpio/unexport", O_WRONLY);//открыть файл
65     if (fd < 0) {
66         perror("gpio/export");
67         return fd;
68     }
69  
70     len = snprintf(buf, sizeof(buf), "%d", gpio);//преобразовать из числа в строку, т.е. 1 в "1"
71     write(fd, buf, len);//записать номер отменяемого пина GPIO
72     close(fd);//закрыть файл
73     return 0;
74 }
```

После реализации функций экспорта и отмены экспорта номеров пинов реализуем конкретный экспорт номеров пинов. Номера пинов для LED и кнопок показаны ниже

```c
11 #define GPIO4_14	110
12 #define GPIO5_1 	129
13 #define GPIO5_3	131 	
14 
15 #define GPIO_KEY1     GPIO4_14
16 #define GPIO_KEY2     GPIO5_1
17 #define GPIO_LED	  	 GPIO5_3
```

После определения соответствующих номеров пинов можно выполнить экспорт. Конкретный код реализации в функции main файла《sysfs_gpio_1_export_gpio/sysfs_gpio_export.c》, ниже соответствующая часть кода, экспортируются пины для LED и кнопок.

```c
183 int main(int argc, char **argv) {
184     unsigned int i;
185     unsigned int value1,value2;
186    
187 	printf("\t********************************************\n");
188     printf("\t********  SYSFS_GPIO_TEST_DEMO**************\n");
189     printf("\t******** version date: 2020/05    **********\n");
190     printf("\t********************************************\n");    
191 
192 	printf("gpio begin to export gpio\r\n");
193     sysfs_gpio_export(GPIO_KEY1);//export gpio key1
194     sysfs_gpio_export(GPIO_KEY2);//export gpio key2
195     sysfs_gpio_export(GPIO_LED);//export gpio led
196     printf("gpio export gpio ok\r\n");
197 
198 
199     return 0;
200 }
```

После компиляции кода запускаем код на плате. Результат работы кода показан на рисунке ниже, видно, что GPIO110, GPIO129 и GPIO131 успешно экспортированы.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image005.png)

### 9.4.2 Установка направления GPIO

Для установки направления экспортированного пина нужно записать различные значения в /sys/class/gpio/gpioN/direction. Запись "in" означает установку как вход, запись "out" означает установку как выход. Код реализации установки номера пина показан ниже, подробности см. в функции sysfs_gpio_set_dir() файла《sysfs_gpio_2_export_gpio sysfs_gpio_export.c》.

```c
86 int sysfs_gpio_set_dir(unsigned int gpio, unsigned int out_flag)
87 {
88     int fd, len;
89     char buf[MAX_BUF];
90 	// /sys/class/gpio/gpioN/direction
91     len = snprintf(buf, sizeof(buf), SYSFS_GPIO_DIR  "/gpio%d/direction", gpio);
92  
93     fd = open(buf, O_WRONLY);//открыть файл
94     if (fd < 0) {
95         perror(buf);
96         return fd;
97     }
98  
99     if (out_flag)//если 1, записать "out", т.е. установить как выход
100         write(fd, "out", 4);
101     else//если 0, записать "in", т.е. установить как вход
102         write(fd, "in", 3);
103  
104     close(fd);//закрыть файл
105     return 0;
106 }
```

После реализации функции установки направления пина устанавливаем различные направления для кнопок и LED. Устанавливаем кнопки как вход "IN", LED как выход "out", соответствующий код показан ниже. Соответствующий код в функции main файла《sysfs_gpio_2_export_gpio/sysfs_gpio_export.c》, ниже соответствующая часть кода.

```c
183 int main(int argc, char **argv) {
184     unsigned int i;
185     unsigned int value1,value2;
186    
187 	printf("\t********************************************\n");
188     printf("\t********  SYSFS_GPIO_TEST_DEMO**************\n");
189     printf("\t******** version date: 2020/05    **********\n");
190     printf("\t********************************************\n");    
191 		
192 	printf("begin to export gpio and direction\r\n");
193     sysfs_gpio_export(GPIO_KEY1);//export gpio key1
194     sysfs_gpio_export(GPIO_KEY2);//export gpio key2
195     sysfs_gpio_export(GPIO_LED);//export gpio led
196 
197     sysfs_gpio_set_dir(GPIO_KEY1, 0);//set as input
198     sysfs_gpio_set_dir(GPIO_KEY2, 0);//set as input
199     sysfs_gpio_set_dir(GPIO_LED, 1);//set as output
200     printf(" export gpio and direction ok\r\n");
201 
202 
203 
204     return 0;
205 }
```

После компиляции кода запускаем код на плате. Результат работы кода показан на рисунке ниже, видно, что направление GPIO110 и GPIO129 для кнопок установлено как вход, GPIO131 для LED2 установлен как вход.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image006.png)

### 9.4.3 Эксперимент вывода GPIO - управление выводом LED

Для установки выходного уровня пина нужно записать различные значения в /sys/class/gpio/gpioN/value. Запись '1' означает вывод высокого уровня, запись '0' означает вывод низкого уровня. Код реализации установки выходного высокого/низкого уровня пина показан ниже, подробности см. в функции sysfs_gpio_set_value() файла《sysfs_gpio_3_export_gpio sysfs_gpio_export.c》.

```c
119 int sysfs_gpio_set_value(unsigned int gpio, unsigned int value)
120 {
121     int fd, len;
122     char buf[MAX_BUF];
123 	// /sys/class/gpio/gpioN/value
124     len = snprintf(buf, sizeof(buf), SYSFS_GPIO_DIR "/gpio%d/value", gpio);
125  
126     fd = open(buf, O_WRONLY);//открыть файл
127     if (fd < 0) {
128         perror(buf);
129         return fd;
130     }
131  
132     if (value)//если 1, записать "1", т.е. установить вывод высокого уровня
133         write(fd, "1", 2);
134     else//если 0, записать "0", т.е. установить вывод низкого уровня
135         write(fd, "0", 2);
136  
137     close(fd);//закрыть файл
138     return 0;
139 }
```

После реализации функции управления выходным уровнем пина реализуем управление LED. Записывая "1" или "0" в value, управляем выводом GPIO высокого или низкого уровня, соответствующий код в функции main файла《sysfs_gpio_3_export_gpio/sysfs_gpio_export.c》, ниже соответствующая часть кода.

```c
183 int main(int argc, char **argv) {
184     unsigned int i;
185     unsigned int value1,value2;
186    
187 	printf("\t********************************************\n");
188     printf("\t********  SYSFS_GPIO_TEST_DEMO**************\n");
189     printf("\t******** version date: 2020/05    **********\n");
190     printf("\t********************************************\n");    
191 		
192 	printf("led begin to init\r\n");
193     sysfs_gpio_export(GPIO_LED);//export gpio led
194 
195     sysfs_gpio_set_dir(GPIO_LED, 1);//set as output
196     printf("led init ok\r\n");
197 
198 
199     /* Confirm INIT_B Pin as High */
200 	while(1)
201 	{
202     
203        
204 		sysfs_gpio_set_value(GPIO_LED, 1);//output high 
205 		printf("led off\r\n");
206 		usleep(500000);	//delay	
207 		sysfs_gpio_set_value(GPIO_LED, 0);//output low 
208 		printf("led on\r\n");
209 		usleep(500000);//delay
210     }
211 	
212     sysfs_gpio_unexport(GPIO_LED);//unexport gpio led
213 
214     return 0;
215 }
```

После компиляции кода запускаем код на плате. Результат работы кода показан на рисунке ниже, видна регулярная печать информации управления LED (на физическом устройстве видно мигание LED).

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image007.png)

### 9.4.4 Эксперимент ввода GPIO - чтение значения кнопки

Для чтения входного уровня пина нужно прочитать значение /sys/class/gpio/gpioN/value. Если прочитано '1', значит вход - высокий уровень, если прочитано '0', значит вход - низкий уровень. Код реализации чтения входного уровня пина показан ниже, подробности см. в функции sysfs_gpio_get_value() файла《sysfs_gpio_4_export_gpio sysfs_gpio_export.c》.

```c
152 int sysfs_gpio_get_value(unsigned int gpio, unsigned int *value)
153 {
154     int fd, len;
155     char buf[MAX_BUF];
156     char ch;
157 	// /sys/class/gpio/gpioN/value
158     len = snprintf(buf, sizeof(buf), SYSFS_GPIO_DIR "/gpio%d/value", gpio);
159  
160     fd = open(buf, O_RDONLY);//открыть файл
161     if (fd < 0) {
162         perror("gpio/get-value");
163         return fd;
164     }
165  
166     read(fd, &ch, 1);//прочитать внешний входной уровень
167 
168     if (ch != '0') {//если '1', установить в 1, т.е. вход - высокий уровень
169         *value = 1;
170     } else {//если '0', установить в 0, т.е. вход - низкий уровень
171         *value = 0;
172     }
173  
174     close(fd);//закрыть файл
175     return 0;
176 }
```

После реализации функции чтения уровня пина реализуем чтение значения внешней кнопки, читая значение value для чтения значения кнопки, соответствующий код в функции main файла《sysfs_gpio_4_export_gpio/sysfs_gpio_export.c》, ниже соответствующая часть кода.

```c
183 int main(int argc, char **argv) {
184     unsigned int i;
185     unsigned int value1,value2;
186    
187 	printf("\t********************************************\n");
188     printf("\t********  SYSFS_GPIO_TEST_DEMO**************\n");
189     printf("\t******** version date: 2020/05    **********\n");
190     printf("\t********************************************\n");    
191 		
192 	printf("key begin to init\r\n");
193     sysfs_gpio_export(GPIO_KEY1);//export gpio key1
194     sysfs_gpio_export(GPIO_KEY2);//export gpio key2
195     
196     sysfs_gpio_set_dir(GPIO_KEY1, 0);//set as input
197     sysfs_gpio_set_dir(GPIO_KEY2, 0);//set as input
198    
199     printf("key init ok\r\n");
200 
201 
202     /* Confirm INIT_B Pin as High */
203 	while(1)
204 	{
205     
206         sysfs_gpio_get_value(GPIO_KEY1, &value1);	//read key1 value	
207 		//printf("@@key1 value 1is %d \n\r",value1);
208 		if(value1==0)//key1 pressed
209 		{
210 			printf("@@key1 is pressed 0\n\r");			
211 		}
212 		sysfs_gpio_get_value(GPIO_KEY2, &value2);//read key2 value	
213 		//printf("##key2 value 1is %d \n\r",value2);
214 		if(value2==0)//key2 pressed
215 		{
216 			printf("##key2 is pressed 0\n\r");			
217 		}
218 		usleep(100000);//delay
219 				
220     }
221 	
222 	sysfs_gpio_unexport(GPIO_KEY1);//unexport gpio key1
223     sysfs_gpio_unexport(GPIO_KEY2);//unexport gpio key2
224    
225 
226     return 0;
227 }
```

После компиляции кода запускаем код на плате. Результат работы кода показан на рисунке ниже, видно, что при нажатии кнопок KEY1 и KEY2 печатаются различные значения.

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image008.png)

### 9.4.5 Эксперимент управления LED и кнопками

В предыдущих экспериментах мы отдельно реализовали управление LED и кнопками. В этом эксперименте объединяем предыдущие эксперименты, управляя миганием LED и читая значение кнопок. При нажатии кнопки печатается соответствующая информация. Соответствующий код в функции main файла《sysfs_gpio_5_export_gpio/sysfs_gpio_export.c》, ниже соответствующая часть кода

```c
183 int main(int argc, char **argv) {
184     unsigned int i;
185     unsigned int value1,value2;
186    
187 	printf("\t********************************************\n");
188     printf("\t********  SYSFS_GPIO_TEST_DEMO**************\n");
189     printf("\t******** version date: 2020/05    **********\n");
190     printf("\t********************************************\n");    
191 		
192 	printf("led&key begin to init\r\n");
193     sysfs_gpio_export(GPIO_KEY1);//export gpio key1
194     sysfs_gpio_export(GPIO_KEY2);//export gpio key2
195     sysfs_gpio_export(GPIO_LED);//export gpio led
196     sysfs_gpio_set_dir(GPIO_KEY1, 0);//set as input
197     sysfs_gpio_set_dir(GPIO_KEY2, 0);//set as input
198     sysfs_gpio_set_dir(GPIO_LED, 1);//set as output
199     printf("led&key init ok\r\n");
200 
201 
202     /* Confirm INIT_B Pin as High */
203 	while(1)
204 	{
205     
206         sysfs_gpio_get_value(GPIO_KEY1, &value1);	//read key1 value		
207 		//printf("@@key1 value 1is %d \n\r",value1);
208 		if(value1==0)//key1 pressed
209 		{
210 			printf("@@key1 is pressed 0\n\r");			
211 		}
212 		sysfs_gpio_get_value(GPIO_KEY2, &value2);//read key2 value	
213 		//printf("##key2 value 1is %d \n\r",value2);
214 		if(value2==0)//key2 pressed
215 		{
216 			printf("##key2 is pressed 0\n\r");			
217 		}
218 		//led flash 
219 		sysfs_gpio_set_value(GPIO_LED, 1);
220 		printf("LED OFF\n\r");		
221 		usleep(500000);
222 		sysfs_gpio_set_value(GPIO_LED, 0);
223 		printf("LED ON\n\r");		
224 		usleep(500000);
225     }
226 	
227 	sysfs_gpio_unexport(GPIO_KEY1);//unexport gpio key1
228     sysfs_gpio_unexport(GPIO_KEY2);//unexport gpio key2
229     sysfs_gpio_unexport(GPIO_LED);//unexport gpio led
230 
231     return 0;
232 }
```

После компиляции кода запускаем код на плате. Результат работы кода показан на рисунке ниже, видно мигание LED, при нажатии кнопок KEY1 и KEY2 печатаются различные значения (из-за мигания LED кнопки можно прочитать только после одного цикла мигания LED, поэтому кнопку нужно держать нажатой, чтобы прочитать изменение значения).

![](http://photos.100ask.net/NewHomeSite/GPIOProgram_Image009.png)
