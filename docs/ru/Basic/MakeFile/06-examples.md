# 6. Пример Makefile
В предыдущих примерах мы размещали заголовочные файлы и исходные файлы в одной директории, что не очень удобно для поддержки, поэтому мы классифицируем их, делая структуру более правильной - поместим все заголовочные файлы в папку inc, а все исходные файлы в папку src.
Структура директорий кода:

```bash
$ tree
.
├── inc
│ ├── add.h
│ └── sub.h
├── Makefile
└── src
	├── add.c
	├── main.c
	└── sub.c
```

Содержимое Makefile:

```makefile
SOURCE = $(wildcard ./src/*.c)
OBJECT = $(patsubst %.c, %.o, $(SOURCE))
INCLUEDS = -I ./inc

TARGET = 100ask
CC = gcc
CFLAGS = -Wall -g
$(TARGET): $(OBJECT)
	@mkdir -p output/
	$(CC) $^ $(CFLAGES) -o output/$(TARGET)

%.o: %.c
	$(CC) $(INCLUEDS) $(CFLAGES) -c $< -o $@

.PHONY:clean
clean:
	@rm -rf $(OBJECT) output/
```

Анализ:

* Строка 1: получить все .c файлы в текущей директории src и присвоить переменной SOURCE.
* Строка 2: заменить файлы с расширением .c в директории ./src на файлы .o и присвоить переменной OBJECT.
* Строка 4: указать директорию заголовочных файлов через опцию -I и присвоить переменной INCLUDES.
* Строка 6: имя конечного целевого файла 100ask, присвоить переменной TARGET.
* Строка 7: заменить значение по умолчанию CC cc на gcc.
* Строка 8: присвоить переменной CFLAGS опцию отображения всех предупреждений и опцию отладки gdb.
* Строка 11: создать директорию output, не отображая эту команду в терминале.
* Строка 12: скомпилировать и создать исполняемую программу 100ask, поместить исполняемую программу в директорию output
* Строка 15: создать соответствующие объектные файлы из исходных файлов.
* Строка 17: псевдоцель, избегать конфликта с одноименным файлом clean в текущей директории.
* Строка 19: используется для выполнения команды при вызове make clean, удаляет файлы, сгенерированные в процессе компиляции.
  Конечный результат компиляции:

```bash
$ make
gcc -I ./inc -c src/main.c -o src/main.o
gcc -I ./inc -c src/add.c -o src/add.o
gcc -I ./inc -c src/sub.c -o src/sub.o
gcc src/main.o src/add.o src/sub.o -o output/100ask
$tree
.
├── inc
│ ├── add.h
│ └── sub.h
├── Makefile
├── output
│ └── 100ask
└── src
	├── add.c
	├── add.o
	├── main.c
	├── main.o
	├── sub.c
	└── sub.o
```

Приведенный выше файл Makefile достаточно полный, однако при разработке проекта код требует постоянной итерации, поэтому необходимо что-то для записи изменений, следовательно нужно добавить номер версии к конечному исполняемому файлу:

```makefile
VERSION = 1.0.0
SOURCE = $(wildcard ./src/*.c)
OBJECT = $(patsubst %.c, %.o, $(SOURCE))

INCLUEDS = -I ./inc

TARGET = 100ask
CC = gcc
CFLAGS = -Wall -g

$(TARGET): $(OBJECT)
	@mkdir -p output/
	$(CC) $^ $(CFLAGES) -o output/$(TARGET)_$(VERSION)

%.o: %.c
	$(CC) $(INCLUEDS) $(CFLAGES) -c $< -o $@

.PHONY:clean
clean:
	@rm -rf $(OBJECT) output/
```

* Строка 1: присвоить номер версии переменной VERSION.
* Строка 13: добавить номер версии как суффикс при генерации исполняемого файла.

Результат компиляции:

```
$ tree
.
├── inc
│ 	├── add.h
│ 	└── sub.h
├── Makefile
├── output
│ 	└── 100ask_1.0.0
└── src
	├── add.c
		├── add.o
	├── main.c
	├── main.o
	├── sub.c
	└── sub.o
```

