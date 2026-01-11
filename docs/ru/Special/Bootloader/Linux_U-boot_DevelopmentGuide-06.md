## 8 Часто используемые функции интерфейса

### 8.1 Интерфейс, связанный с fdt

1. const void \*fdt_getprop(const void \*fdt, int nodeoffset, const char \*name, int \*lenp)

*•* Назначение: Получить значение указанного свойства

*•* Параметры:

	*•* fdt: рабочее flattened device tree

	*•* nodeoffset: смещение узла для изменения

	*•* name: имя получаемого свойства

	*•* lenp: длина значения получаемого свойства (будет перезаписана) или NULL

*•* Возврат:

	*•* Не NULL (указатель на значение свойства): успех

	*•* NULL (lenp пустой): ошибка

	*•* Код ошибки (lenp не пустой): ошибка



2. int fdt_set_node_status(void \*fdt, int nodeoffset, enum fdt_status status, unsigned int error_code)

*•* Назначение: Установить состояние узла

*•* Параметры:

	*•* fdt: рабочее flattened device tree

	*•* nodeoffset: смещение узла для изменения

	*•* status:FDT_STATUS_OKAY, FDT_STATUS_DISABLED, FDT_STATUS_FAIL, FDT_STATUS_FAIL_ERROR_CODE

	*•* error_code:опционально, используется только если status равен FDT_STATUS_FAIL_ERROR_CODE

*•* Возврат:

	*•* 0: успех

	*•* Не 0: ошибка



3. int fdt_path_offset(const void \*fdt, const char \*path)

*•* Назначение: Найти смещение узла по полному пути

*•* Параметры:

	*•* fdt: рабочий fdt

	*•* path: полное имя пути

*•* Возврат:

	*•* >=0(смещение узла): успех

	*•* <0: код ошибки



4. static inline int fdt_setprop_u32(void \*fdt, int nodeoffset, const char \*name, uint32_t val)

*•* Назначение: Установить значение свойства в 32-битное целое число, если значение свойства не существует, создать это свойство

*•* Параметры:

	*•* fdt: рабочее flattened device tree

	*•* nodeoffset: смещение узла для изменения

	*•* name: имя изменяемого свойства

	*•* val:32-битное целевое значение

*•* Возврат:

	*•* 0: успех

	*•* <0: код ошибки



5. static inline int fdt_setprop_u64(void \*fdt, int nodeoffset, const char \*name, uint64_t val)

*•* Назначение: Аналогично fdt_setprop_u32, установить значение свойства в 64-битное целое число, если значение свойства не существует, создать это свойство

*•* Параметры:

	*•* fdt: рабочее flattened device tree

	*•* nodeoffset: смещение узла для изменения

	*•* name: имя изменяемого свойства

	*•* val:64-битное целевое значение

*•* Возврат:

	*•* 0: успех

	*•* <0: код ошибки



6. \#define fdt_setprop_string(fdt, nodeoffset, name, str) fdt_setprop((fdt), (nodeoffset), (name), (str), strlen(str)+1)

*•* Назначение: Установить значение свойства в строку, если значение свойства не существует, создать это свойство

*•* Параметры:

	*•* fdt: рабочее flattened device tree

	*•* nodeoffset: смещение узла для изменения

	*•* name: имя изменяемого свойства

	*•* str: целевое значение

*•* Возврат:

	*•* 0: успех

	*•* <0: код ошибки

Примечание: В конфигурации sys_config.fex состояние активации узла равно 0 или 1. В fdt соответствующее свойство status равно disable или okay.



7. int save_fdt_to_flash(void \*fdt_buf, size_t fdt_size)

*•* Назначение: Сохранить изменения во флеш

*•* Параметры:

	*•* fdt_buf: текущее рабочее flattened device tree

	*•* fdt_size: размер текущего рабочего flattened device tree, можно получить через fdt_totalsize(fdt_buf )

*•* Возврат:

	*•* 0: успех

	*•* <0: ошибка



8. Справочное применение

Реализация командной строки fdt в U-Boot: cmd/fdt.c



### 8.2 Функции интерфейса, связанные с env

1. int env_set(const char \*varname, const char \*varvalue)

*•* Назначение: Установить значение переменной окружения varname в varvalue, недействительно после перезагрузки

*•* Параметры:

	*•* varname: имя устанавливаемой переменной окружения

	*•* varvalue: изменить указанную переменную окружения на это значение

*•* Возврат:

	*•* 0: успех

	*•* Не 0: ошибка



2. char \*env_get(const char \*name)

*•* Назначение: Получить значение указанной переменной окружения

*•* Параметры:

	*•* name: имя переменной

*•* Возврат:

	*•* NULL: ошибка

	*•* Не NULL (значение переменной окружения): успех



3. int env_save(void)

*•* Назначение: Сохранить переменную окружения, сохраняется после перезагрузки

*•* Параметры: нет

*•* Возврат:

	*•* 0: успех

	*•* Не 0: ошибка



4. Справочное применение

board/sunxi/sunxi_bootargs.c update_bootargs предоставляет информацию ядру через cmdline, в основном через обновление переменной bootargs env_set(\"bootargs\", cmdline).



### 8.3 Вызов командной строки U-Boot

1. int run_command_list(const char \*cmd, int len, int flag)

*•* Назначение: Выполнить командную строку U-Boot

*•* Параметры:

	*•* cmd: указатель на строку команды

	*•* len: длина командной строки, установите -1 для автоматического получения

	*•* flag: любой, так как в sunxi не используется

*•* Возврат:

	*•* 0: успех

	*•* Не 0: ошибка



2. Справочное применение:

common/autoboot.c autoboot_command реализует команду автозапуска U-Boot

s = env_get(\"bootcmd\");

run_command_list(s, -1, 0).



### 8.4 Чтение/запись Flash

1. int sunxi_flash_read(uint start_block, uint nblock, void \*buffer)

*•* Назначение: Прочитать nblock с указанной начальной позиции start_block в buffer

*•* Параметры:

	*•* start_block: начальный адрес

	*•* nblock:количество блоков

	*•* buffer: адрес памяти

*•* Возврат:

	*•* 0: успех

	*•* Не 0: ошибка



2. int sunxi_flash_write(uint start_block, uint nblock, void \*buffer)

*•* Назначение: Записать buffer в nblock с указанной начальной позиции start_block

*•* Параметры:

	*•* start_block: начальный адрес

	*•* nblock:количество блоков

	*•* buffer: адрес памяти

*•* Возврат:

	*•* 0: успех

	*•* Не 0: ошибка



3. int sunxi_sprite_read(uint start_block, uint nblock, void \*buffer)

*•* Назначение аналогично sunxi_flash_read



4. int sunxi_sprite_write(uint start_block, uint nblock, void \*buffer)

*•* Назначение аналогично sunxi_flash_write



5. Справочное применение

common/sunxi/board_helper.c sunxi_set_bootcmd_from_mis реализует операцию чтения/записи раздела misc





### 8.5 Получение информации о разделе

1. int sunxi_partition_get_partno_byname(const char \*part_name)

*•* Назначение: Получить номер раздела по имени раздела

*•* Параметры:

	*•* part_name: имя раздела

*•* Возврат:

	*•* <0: ошибка

	*•* >0（номер раздела）: успех



2. int sunxi_partition_get_info_byname(const char \*part_name, uint \*part_offset, uint \*part_size)

*•* Назначение: Получить смещение и размер раздела по имени раздела

*•* Параметры:

	*•* part_name: имя раздела

	*•* part_offset: смещение раздела

	*•* part_size: размер раздела

*•* Возврат:

	*•* 0: успех

	*•* -1: ошибка



3. uint sunxi_partition_get_offset_byname(const char \*part_name)

*•* Назначение: Получить смещение по имени раздела

*•* Параметры:

	*•* part_name: имя раздела

*•* Возврат:

	*•* <=0 : ошибка

	*•* >0 : успех



4. int sunxi_partition_get_info(const char \*part_name, disk_partition_t \*info)

*•* Назначение: Получить информацию о разделе по part_name

*•* Параметры:

	*•* part_name: имя раздела

	*•* info: информация о разделе

*•* Возврат:

	*•* Не 0: ошибка

	*•* 0: успех



5. lbaint_t sunxi_partition_get_offset(int part_index)

*•* Назначение: Получить смещение раздела в режиме card sprite

*•* Параметры:

	*•* part_index: номер раздела

*•* Возврат:

	*•* >=0（смещение）: успех

	*•* -1: ошибка



6. Справочное применение

Загрузка изображения при загрузке: drivers/video/sunxi/logo_display/sunxi_load_bmp.c



### 8.6 Операции, связанные с GPIO

1. int fdt_get_one_gpio(const char\* node_path, const char\* prop_name,user_gpio_set_t\* gpio_list)

*•* Назначение: Получить конфигурацию gpio по пути node_path и имени gpio prop_name

*•* Параметры:

	*•* node_path：путь fdt

	*•* prop_name：имя gpio

	*•* gpio_list：информация о gpio для получения

*•* Возврат:

	*•* 0：успех

	*•* -1：ошибка



2. ulong sunxi_gpio_request(user_gpio_set_t *gpio_list, __u32 group_count_max)

*•* Назначение: Получить дескриптор операции gpio по конфигурации gpio

*•* Параметры:

	*•* gpio_list：список конфигурации gpio, может быть получен через fdt_get_one_gpio

	*•* group_count_max: максимальное количество конфигураций gpio в gpio_list

*•* Возврат:

	*•* 0：ошибка

	*•* >0（дескриптор операции gpio）: успех



3. \__s32 gpio_write_one_pin_value(ulong p_handler, __u32 value_to_gpio, const char *gpio_name)

*•* Назначение: Записать данные по дескриптору операции gpio

*•* Параметры:

	*•* p_handler：дескриптор операции gpio, может быть получен через sunxi_gpio_request

	*•* value_to_gpio：данные для записи, 0 или 1

	*•* gpio_name：имя gpio

*•* Возврат:

	*•* EGPIO_SUCCESS：успех

	*•* EGPIO_FAIL：ошибка



4. Справочное применение

Управление состоянием led:

```
sprite/sprite_led.c

user_gpio_set_t gpio_init;

fdt_get_one_gpio("/soc/card_boot", "sprite_gpio0", &gpio_init); //Получить конфигурацию gpio sprite_gpio0 в /soc/card_boot

sprite_led_hd = sunxi_gpio_request(&gpio_init, 1); //Получить дескриптор операции gpio

gpio_write_one_pin_value(sprite_led_hd, sprite_led_status, "sprite_gpio0"); //Управлять состоянием led
```



## 9 Этап инициализации часто используемых ресурсов

*•* env : доступ возможен после инициализации переменной окружения

*•* fdt : доступ возможен с начала выполнения U-Boot

*•* malloc : доступ возможен только после релокации
