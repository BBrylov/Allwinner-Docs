# Прошивка системы на TF-карту

## Подготовка

1. Главная плата отладочной платы T113 x1
2. Кабель Type-C X1
3. Кардридер TF-карты x1
4. Micro TF-карта объемом 8 ГБ или более x1
5. Инструмент win32diskimage: https://gitlab.com/dongshanpi/tools/-/raw/main/win32diskimager-1.0.0-install.exe
6. Специализированный инструмент форматирования SD-карты: https://gitlab.com/dongshanpi/tools/-/raw/main/SDCardFormatter5.0.1Setup.exe
7. Минимальный образ системы TF-карты: https://gitlab.com/dongshanpi/tools/-/raw/main/100ask-t113-pro_sdcard.zip

## Запуск программного обеспечения для прошивки

Сначала необходимо загрузить два инструмента для прошивки TF-карты: **win32diskimage** и **SDcard formatter**, затем получить файл образа системы TF-карты **100ask-t113-pro_sdcard.zip**. После получения установите оба инструмента и распакуйте файл образа системы TF-карты **dongshannezhastu-sdcard.zip**. Вы получите файл **100ask-t113-pro_sdcard.img**, который нужно прошить.



* Используйте SD Card Format для форматирования TF-карты, помните о резервном копировании данных на карте. Как показано на рисунке ниже, нажмите "Обновить", чтобы найти TF-карту, затем нажмите "Format". В появившемся диалоговом окне нажмите **Да (Yes)** и дождитесь завершения форматирования.

![SDCardFormat_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/SDCardFormat_001.png)

* После завершения форматирования используйте инструмент **Win32diskimage** для прошивки образа. Следуя приведенным ниже шагам, найдите букву своей TF-карты, затем нажмите 2 кнопку открытия папки, найдите распакованный файл образа TF-карты **dongshannezhastu-sdcard.img**, и наконец нажмите "Запись" и дождитесь завершения записи.

![wind32diskimage_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/wind32diskimage_001.png)


После завершения можно извлечь TF-карту и вставить ее в слот TF-карты на обратной стороне основной платы Dongshan Nezha STU. Затем подключите кабель последовательного порта и используйте инструмент последовательного порта, чтобы открыть устройство последовательного порта. Нажмите кнопку **RESET** на отладочной плате для перезагрузки и входа в систему TF-карты.

## Загрузка системы

![sdcard-flashsystem_001](https://cdn.staticaly.com/gh/DongshanPI/Docs-Photos@master/DongshanNezhaSTU/sdcard-flashsystem_001.png)

**Имя пользователя системы - root, пароль пуст**

**Имя пользователя системы - root, пароль пуст**

**Имя пользователя системы - root, пароль пуст**
