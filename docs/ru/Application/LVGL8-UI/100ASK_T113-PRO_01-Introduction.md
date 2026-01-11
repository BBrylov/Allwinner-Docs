
* Раздел обратной связи https://github.com/100askTeam/Stage3_D1s-Components/discussions/
# Практическая разработка на LVGL

## Перенос игры 2048 на базе LVGL

В этом разделе описано, как перенести уже написанную программу LVGL, включая небольшую игру `2048` на `lvgl`, на отладочную плату.

Игра `2048`, использованная здесь, предоставлена 100ask и имеет открытый исходный код: [lv_lib_100ask](https://gitee.com/weidongshan/lv_lib_100ask)

### Подготовка каркаса

Прежде всего, подготовим базовый каркас LVGL. Его можно скопировать и изменить непосредственно из `lv_g2d_test`.

Сначала скопируем исходный код. В папке исходного кода `platform/thirdparty/gui/lvgl-8` скопируем исходный код `lv_g2d_test`, указанный красной стрелкой, в папку `lv_2048`, указанную желтой стрелкой, как шаблон.

Как показано на рисунке ниже, и очистим папку ресурсов `res`,

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-13-53-08-1658123584%281%29.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-13-53-08-1658123584(1).png)

Точно так же скопируем индексный файл. Найдем `openwrt/package/thirdparty/gui/lvgl-8` и скопируем `lv_g2d_test` как `lv_2048` в качестве индекса, который мы будем использовать для игры `2048`.

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-13-53-55-1658123630%281%29.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-13-53-55-1658123630(1).png)

И отредактируем `Makefile`, изменим имя файла с `lv_g2d_test` на `lv_2048` здесь:

```makefile
include $(TOPDIR)/rules.mk
include $(INCLUDE_DIR)/package.mk
include ../sunxifb.mk

PKG_NAME:=lv_2048
PKG_VERSION:=8.1.0
PKG_RELEASE:=1

PKG_BUILD_DIR := $(BUILD_DIR)/$(PKG_NAME)
SRC_CODE_DIR := $(LICHEE_PLATFORM_DIR)/thirdparty/gui/lvgl-8/$(PKG_NAME)
define Package/$(PKG_NAME)
  SECTION:=gui
  SUBMENU:=Littlevgl
  CATEGORY:=Gui
  DEPENDS:=+LVGL8_USE_SUNXIFB_G2D:libuapi +LVGL8_USE_SUNXIFB_G2D:kmod-sunxi-g2d \
           +LVGL8_USE_FREETYPE:libfreetype
  TITLE:=lvgl 2048
endef

PKG_CONFIG_DEPENDS := \
    CONFIG_LVGL8_USE_SUNXIFB_DOUBLE_BUFFER \
    CONFIG_LVGL8_USE_SUNXIFB_CACHE \
    CONFIG_LVGL8_USE_SUNXIFB_G2D \
    CONFIG_LVGL8_USE_SUNXIFB_G2D_ROTATE

define Package/$(PKG_NAME)/config
endef

define Package/$(PKG_NAME)/Default
endef

define Package/$(PKG_NAME)/description
  a lvgl 2048 v8.1.0
endef

define Build/Prepare
    $(INSTALL_DIR) $(PKG_BUILD_DIR)/
    $(CP) -r $(SRC_CODE_DIR)/src $(PKG_BUILD_DIR)/
    $(CP) -r $(SRC_CODE_DIR)/../lvgl $(PKG_BUILD_DIR)/src/
    $(CP) -r $(SRC_CODE_DIR)/../lv_drivers $(PKG_BUILD_DIR)/src/
endef

define Build/Configure
endef

TARGET_CFLAGS+=-I$(PKG_BUILD_DIR)/src

ifeq ($(CONFIG_LVGL8_USE_SUNXIFB_G2D),y)
TARGET_CFLAGS+=-DLV_USE_SUNXIFB_G2D_FILL \
                -DLV_USE_SUNXIFB_G2D_BLEND \
                -DLV_USE_SUNXIFB_G2D_BLIT \
                -DLV_USE_SUNXIFB_G2D_SCALE
endif

define Build/Compile
    $(MAKE) -C $(PKG_BUILD_DIR)/src\
        ARCH="$(TARGET_ARCH)" \
        AR="$(TARGET_AR)" \
        CC="$(TARGET_CC)" \
        CXX="$(TARGET_CXX)" \
        CFLAGS="$(TARGET_CFLAGS)" \
        LDFLAGS="$(TARGET_LDFLAGS)" \
        INSTALL_PREFIX="$(PKG_INSTALL_DIR)" \
        all
endef

define Package/$(PKG_NAME)/install
    $(INSTALL_DIR) $(1)/usr/bin/
    $(INSTALL_DIR) $(1)/usr/share/lv_2048
    $(INSTALL_BIN) $(PKG_BUILD_DIR)/src/$(PKG_NAME) $(1)/usr/bin/
endef

$(eval $(call BuildPackage,$(PKG_NAME)))
```

После завершения подготовки каркаса можно выполнить `make menuconfig` и проверить, появился ли параметр `lv_2048`, и выбрать его.

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-13-56-31-image.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-13-56-31-image.png)

### Изменение исходного кода

Второй шаг - изменение исходного кода. Отредактируйте скопированный файл `main.c`, удалите ненужные части `lv_g2d_test`. Оставьте только самые базовые части.

```c
#include "lvgl/lvgl.h"
#include "lv_drivers/display/sunxifb.h"
#include "lv_drivers/indev/evdev.h"
#include <unistd.h>
#include <pthread.h>
#include <time.h>
#include <sys/time.h>
#include <stdlib.h>
#include <stdio.h>

static lv_style_t rect_style;
static lv_obj_t *rect_obj;
static lv_obj_t *canvas;

int main(int argc, char *argv[]) {
    lv_disp_drv_t disp_drv;
    lv_disp_draw_buf_t disp_buf;
    lv_indev_drv_t indev_drv;
    uint32_t rotated = LV_DISP_ROT_NONE;

    lv_disp_drv_init(&disp_drv);

    /*LittlevGL init*/
    lv_init();

    /*Linux frame buffer device init*/
    sunxifb_init(rotated);

    /*A buffer for LittlevGL to draw the screen's content*/
    static uint32_t width, height;
    sunxifb_get_sizes(&width, &height);

    static lv_color_t *buf;
    buf = (lv_color_t*) sunxifb_alloc(width * height * sizeof(lv_color_t), "lv_2048");

    if (buf == NULL) {
        sunxifb_exit();
        printf("malloc draw buffer fail\n");
        return 0;
    }

    /*Initialize a descriptor for the buffer*/
    lv_disp_draw_buf_init(&disp_buf, buf, NULL, width * height);

    /*Initialize and register a display driver*/
    disp_drv.draw_buf = &disp_buf;
    disp_drv.flush_cb = sunxifb_flush;
    disp_drv.hor_res = width;
    disp_drv.ver_res = height;
    disp_drv.rotated = rotated;
    disp_drv.screen_transp = 0;
    lv_disp_drv_register(&disp_drv);

    evdev_init();
    lv_indev_drv_init(&indev_drv); /*Basic initialization*/
    indev_drv.type = LV_INDEV_TYPE_POINTER; /*See below.*/
    indev_drv.read_cb = evdev_read; /*See below.*/
    /*Register the driver in LVGL and save the created input device object*/
    lv_indev_t *evdev_indev = lv_indev_drv_register(&indev_drv);

    /*Handle LitlevGL tasks (tickless mode)*/
    while (1) {
        lv_task_handler();
        usleep(1000);
    }

    return 0;
}

/*Set in lv_conf.h as `LV_TICK_CUSTOM_SYS_TIME_EXPR`*/
uint32_t custom_tick_get(void) {
    static uint64_t start_ms = 0;
    if (start_ms == 0) {
        struct timeval tv_start;
        gettimeofday(&tv_start, NULL);
        start_ms = (tv_start.tv_sec * 1000000 + tv_start.tv_usec) / 1000;
    }

    struct timeval tv_now;
    gettimeofday(&tv_now, NULL);
    uint64_t now_ms;
    now_ms = (tv_now.tv_sec * 1000000 + tv_now.tv_usec) / 1000;

    uint32_t time_ms = now_ms - start_ms;
    return time_ms;
}
```

Далее интегрируем `lv_lib_100ask` с игрой `2048`. Сначала загружаем исходный код `lv_lib_100ask` и поместим его в папку `src` `platform/thirdparty/gui/lvgl-8/lv_2048`. Согласно описанию `lv_lib_100ask`, скопируем `lv_lib_100ask_conf_template.h` в каталог `src` и переименуем его в `lv_lib_100ask_conf.h`.

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-14-55-44-image.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-14-55-44-image.png)

Отредактируйте `lv_lib_100ask_conf.h`, включите ссылку всей библиотеки и сконфигурируйте включение `LV_USE_100ASK_2048`. Для краткости здесь удалены ненужные элементы конфигурации.

```c
/**
 * @file lv_lib_100ask_conf.h
 * Configuration file for v8.2.0
 *
 */
/*
 * COPY THIS FILE AS lv_lib_100ask_conf.h
 */

/* clang-format off */
#if 1 /*Set it to "1" to enable the content*/

#ifndef LV_LIB_100ASK_CONF_H
#define LV_LIB_100ASK_CONF_H

#include "lv_conf.h"

/*******************
 * GENERAL SETTING
 *******************/

/*********************
 * USAGE
 *********************

/*2048 game*/
#define LV_USE_100ASK_2048                               1
#if LV_USE_100ASK_2048
    /* Matrix size*/
    /*Do not modify*/
    #define  LV_100ASK_2048_MATRIX_SIZE          4

    /*test*/
    #define  LV_100ASK_2048_SIMPLE_TEST          1
#endif

#endif /*LV_LIB_100ASK_H*/

#endif /*End of "Content enable"*/
```

Затем отредактируйте номер версии в `platform/thirdparty/gui/lvgl-8/lv_2048/src/lv_lib_100ask/lv_lib_100ask.h`, измените на `(8,1,0)`.

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-48-46-image.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-48-46-image.png)

Затем отредактируйте в `main.c`, интегрируйте `lv_100ask_2048_simple_test`, как показано ниже.

(1) Добавьте `lv_lib_100ask/lv_lib_100ask.h` в заголовочный файл

```c
#include <lv_lib_100ask/lv_lib_100ask.h>
```

(2) Добавьте вызов интерфейса в функцию `main`

```c
lv_100ask_2048_simple_test();
```

Полный файл `main.c` выглядит следующим образом:

```c
#include <unistd.h>
#include <pthread.h>
#include <time.h>
#include <sys/time.h>
#include <stdlib.h>
#include <stdio.h>

#include "lvgl/lvgl.h"
#include "lv_drivers/display/sunxifb.h"
#include "lv_drivers/indev/evdev.h"

#include "lv_lib_100ask/lv_lib_100ask.h"  // включите заголовочный файл

static lv_style_t rect_style;
static lv_obj_t *rect_obj;
static lv_obj_t *canvas;

int main(int argc, char *argv[]) {
    lv_disp_drv_t disp_drv;
    lv_disp_draw_buf_t disp_buf;
    lv_indev_drv_t indev_drv;
    uint32_t rotated = LV_DISP_ROT_NONE;

    lv_disp_drv_init(&disp_drv);

    /*LittlevGL init*/
    lv_init();

    /*Linux frame buffer device init*/
    sunxifb_init(rotated);

    /*A buffer for LittlevGL to draw the screen's content*/
    static uint32_t width, height;
    sunxifb_get_sizes(&width, &height);

    static lv_color_t *buf;
    buf = (lv_color_t*) sunxifb_alloc(width * height * sizeof(lv_color_t), "lv_nes");

    if (buf == NULL) {
        sunxifb_exit();
        printf("malloc draw buffer fail\n");
        return 0;
    }

    /*Initialize a descriptor for the buffer*/
    lv_disp_draw_buf_init(&disp_buf, buf, NULL, width * height);

    /*Initialize and register a display driver*/
    disp_drv.draw_buf = &disp_buf;
    disp_drv.flush_cb = sunxifb_flush;
    disp_drv.hor_res = width;
    disp_drv.ver_res = height;
    disp_drv.rotated = rotated;
    disp_drv.screen_transp = 0;
    lv_disp_drv_register(&disp_drv);

    evdev_init();
    lv_indev_drv_init(&indev_drv); /*Basic initialization*/
    indev_drv.type = LV_INDEV_TYPE_POINTER; /*See below.*/
    indev_drv.read_cb = evdev_read; /*See below.*/
    /*Register the driver in LVGL and save the created input device object*/
    lv_indev_t *evdev_indev = lv_indev_drv_register(&indev_drv);

    lv_100ask_2048_simple_test();  // вызовите игру 2048

    /*Handle LitlevGL tasks (tickless mode)*/
    while (1) {
        lv_task_handler();
        usleep(1000);
    }

    return 0;
}

/*Set in lv_conf.h as `LV_TICK_CUSTOM_SYS_TIME_EXPR`*/
uint32_t custom_tick_get(void) {
    static uint64_t start_ms = 0;
    if (start_ms == 0) {
        struct timeval tv_start;
        gettimeofday(&tv_start, NULL);
        start_ms = (tv_start.tv_sec * 1000000 + tv_start.tv_usec) / 1000;
    }

    struct timeval tv_now;
    gettimeofday(&tv_now, NULL);
    uint64_t now_ms;
    now_ms = (tv_now.tv_sec * 1000000 + tv_now.tv_usec) / 1000;

    uint32_t time_ms = now_ms - start_ms;
    return time_ms;
}
```

Затем отредактируйте `Makefile`, добавьте ссылку на исходный код `lv_lib_100ask`.

```
include lv_lib_100ask/lv_lib_100ask.mk
```

Также измените `BIN` на `lv_2048`. Полный файл `Makefile` выглядит следующим образом:

```makefile
#
# Makefile
#
CC ?= gcc
LVGL_DIR_NAME ?= lvgl
LVGL_DIR ?= ${shell pwd}
CFLAGS ?= -O3 -g0 -I$(LVGL_DIR)/ -Wall -Wshadow -Wundef -Wmissing-prototypes -Wno-discarded-qualifiers -Wall -Wextra -Wno-unused-function -Wno-error=strict-prototypes -Wpointer-arith -fno-strict-aliasing -Wno-error=cpp -Wuninitialized -Wmaybe-uninitialized -Wno-unused-parameter -Wno-missing-field-initializers -Wtype-limits -Wsizeof-pointer-memaccess -Wno-format-nonliteral -Wcast-qual -Wunreachable-code -Wno-switch-default -Wreturn-type -Wmultichar -Wformat-security -Wno-ignored-qualifiers -Wno-error=pedantic -Wno-sign-compare -Wno-error=missing-prototypes -Wdouble-promotion -Wclobbered -Wdeprecated -Wempty-body -Wtype-limits -Wshift-negative-value -Wstack-usage=2048 -Wno-unused-value -Wno-unused-parameter -Wno-missing-field-initializers -Wuninitialized -Wmaybe-uninitialized -Wall -Wextra -Wno-unused-parameter -Wno-missing-field-initializers -Wtype-limits -Wsizeof-pointer-memaccess -Wno-format-nonliteral -Wpointer-arith -Wno-cast-qual -Wmissing-prototypes -Wunreachable-code -Wno-switch-default -Wreturn-type -Wmultichar -Wno-discarded-qualifiers -Wformat-security -Wno-ignored-qualifiers -Wno-sign-compare
LDFLAGS ?= -lm
BIN = lv_2048


#Collect the files to compile
SRCDIRS   =  $(shell find . -maxdepth 1 -type d)
MAINSRC = $(foreach dir,$(SRCDIRS),$(wildcard $(dir)/*.c))

include $(LVGL_DIR)/lvgl/lvgl.mk
include $(LVGL_DIR)/lv_drivers/lv_drivers.mk
include lv_lib_100ask/lv_lib_100ask.mk

OBJEXT ?= .o

AOBJS = $(ASRCS:.S=$(OBJEXT))
COBJS = $(CSRCS:.c=$(OBJEXT))

MAINOBJ = $(MAINSRC:.c=$(OBJEXT))

SRCS = $(ASRCS) $(CSRCS) $(MAINSRC)
OBJS = $(AOBJS) $(COBJS)

## MAINOBJ -> OBJFILES

all: default

%.o: %.c
    @$(CC)  $(CFLAGS) -c $< -o $@
    @echo "CC $<"

default: $(AOBJS) $(COBJS) $(MAINOBJ)
    $(CC) -o $(BIN) $(MAINOBJ) $(AOBJS) $(COBJS) $(LDFLAGS)

clean:
    rm -f $(BIN) $(AOBJS) $(COBJS) $(MAINOBJ)
```

### Интеграция сенсорного экрана

После выполнения вышеуказанных операций вы можете обнаружить, что сенсорный экран не реагирует. Это потому, что номер события `event`, привязанный к сенсорному экрану, неправильный. По умолчанию привязка - `event3`, но из журнала запуска видно, что сенсорный экран отладочной платы привязан к `event0`.

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-17-48-image.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-17-48-image.png)

В этом случае необходимо изменить номер события `event`, привязанный к сенсорному экрану. Файл конфигурации находится в `lv_drv_conf.h`:

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-19-12-image.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-19-12-image.png)

Здесь измените `event3` на `event0`:

```c
#  define EVDEV_NAME   "/dev/input/event0"
```

Конечно, кроме этого способа, вы также можете использовать команду для создания символической ссылки `touchscreen`, которая будет напрямую использовать `touchscreen` в качестве узла сенсорного экрана, удобно для отладки:

```shell
ln -s /dev/input/eventX /dev/input/touchscreen
```

### Тестовая компиляция

После изменения, если вы хотите скомпилировать этот пакет отдельно для тестирования, а не компилировать полный SDK. Вы можете сделать это:

(1) Убедитесь, что вы уже выполнили `source build/envsetup.sh` и `lunch`

(2) В любой папке выполните команду `mmo lv_2048 -B`

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-13-39-image.png)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-15-13-39-image.png)

Где `mmo` означает компиляцию отдельного пакета `openWrt`. `lv_2048` позади - это имя пакета. Параметр `-B` означает сначала выполнить `clean`, а затем скомпилировать. Без этого параметра это просто прямая компиляция.

### Тестовый запуск

После компиляции и упаковки просто используйте `lv_2048` на отладочной плате для запуска

[![img](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-14-47-19-lQDPJxaBvZoKbvPNC9DND8CwaCpI77wfq4cC1aIjrECqAA_4032_3024.jpg)](https://v853.docs.aw-ol.com/assets/img/lvgl_demo_2048/2022-07-18-14-47-19-lQDPJxaBvZoKbvPNC9DND8CwaCpI77wfq4cC1aIjrECqAA_4032_3024.jpg)
