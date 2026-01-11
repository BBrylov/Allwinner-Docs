# Управление системой

## Команда apt

> Дополнительный инструмент - использование aptitude, графический менеджер пакетов.

```bash
[ubuntu@book:~]$ sudo apt update	//обновление списка пакетов до последнего состояния
[ubuntu@book:~]$ sudo apt upgrade   //обновление всех пакетов до последней версии
[ubuntu@book:~]$ sudo apt install <pkg>  //установка пакета, можно указать несколько
[ubuntu@book:~]$ sudo apt reinstall <pkg>  //переустановка пакета
[ubuntu@book:~]$ sudo apt remove <pkg>   //удаление пакета
[ubuntu@book:~]$ sudo apt-cache search <string> //поиск пакета в репозитории apt
[ubuntu@book:~]$ sudo apt list  //список установленных пакетов
[ubuntu@book:~]$ sudo apt show <pkg> //просмотр подробной информации о пакете
```

* aptitude - графический интерфейс управления пакетами, можно использовать мышь и подсказки на экране для работы.





## Команда dpkg

> Команда для автономной установки deb пакетов.

```bash
[ubuntu@book:~]$ sudo dpkg -i <pkg.deb>  //ручная установка уже загруженного пакета
[ubuntu@book:~]$ sudo dpkg -r <pkg> 		//ручное удаление уже загруженного пакета
```



## Команда snap

> Команда онлайн-управления пакетами

```bash
[ubuntu@book:~]$ sudo snap version //просмотр версии snap
[ubuntu@book:~]$ sudo snap find "media player"  //поиск пакетов для media player
[ubuntu@book:~]$ sudo snap install vlc 		   //установка vlc
[ubuntu@book:~]$ sudo snap info vlc 			   //просмотр подробной информации о vlc
[ubuntu@book:~]$ sudo snap install --channel=edge vlc  //установка тестовой версии vlc
[ubuntu@book:~]$ sudo snap switch  --channel=stable vlc  //переключение vlc на стабильную версию
[ubuntu@book:~]$ snap list 					//просмотр состояния установленных пакетов
```



## Команда top

> Просмотр использования системных ресурсов

```bash
[ubuntu@book:~]$ top
```



## Команда htop

```bash
[ubuntu@book:~]$ sudo apt install htop
[ubuntu@book:~]$ htop
```



## Команда uname

> Отображение информации о системе





## Команда find

> Используется для поиска файлов и каталогов.

```bash
[ubuntu@book:~]$ find  -name <file> 			 //поиск всех файлов с именем file в текущем пути
[ubuntu@book:~]$ find ~/Desktop -name test.txt //поиск файла test.txt в каталоге Desktop
[ubuntu@book:~]$ find ~/Desktop -name "*.txt" //поиск всех файлов с расширением .txt в каталоге Desktop
[ubuntu@book:~]$ find . 					 //отображение всех файлов и каталогов в текущем каталоге
[ubuntu@book:~]$ find  ~ -print > home.txt   //перенаправление списка всех файлов и папок из каталога ~ в файл home.txt
[ubuntu@book:~]$ find /usr/bin/ -size  +1M 	 //список всех файлов размером более 1M в каталоге /usr/bin/
[ubuntu@book:~]$ find . -type f -atime +3    //список файлов, к которым обращались в течение последних 3 дней в текущем пути
[ubuntu@book:~]$ find . -type f -amin +10    //список файлов, к которым обращались более 10 минут назад в текущем пути
[ubuntu@book:~]$ find ./ ! -name "*.txt"	 //список всех файлов и папок, не имеющих расширение .txt в текущем пути
```



## Команда adduser

> Создание нового пользователя

```bas
[ubuntu@book:~]$ sudo adduser book  //добавление пользователя с именем book
[ubuntu@book:~]$ su book			//переключение на пользователя book, требуется ввод пароля пользователя book
[ubuntu@book:~]$ su ubuntu			//переключение обратно на пользователя ubuntu, требуется ввод пароля пользователя ubuntu
```



## Команда userdel

> Удаление пользователя

```bash
[ubuntu@book:~]$ sudo userdel book 	//удаление пользователя с именем book
[ubuntu@book:~]$ sudo userdel -rf  book	//удаление пользователя book со всеми его ресурсами с помощью -rf
```



## passwd

> Установка пароля пользователя
```bash
[ubuntu@book:~]$ sudo passwd ubuntu   //изменение пароля пользователя ubuntu
[ubuntu@book:~]$ sudo passwd 		   //изменение пароля пользователя root
```


## Команда exit

> Выход из текущей открытой оболочки

```bash
[ubuntu@book:~]$ exit
```



## reboot

> Используется для перезагрузки компьютера.

```bash
[ubuntu@book:~]$ sudo reboot
[ubuntu@book:~]$ sudo reboot -n  //перезагрузка без записи кэша данных на диск
[ubuntu@book:~]$ sudo reboot -f	  //принудительная перезагрузка, аналогично отключению питания
[ubuntu@book:~]$ sudo reboot -d   //перезагрузка, но без записи в системный журнал
[ubuntu@book:~]$ sudo reboot -w   //без перезагрузки, но с записью операции перезагрузки в системный журнал
```

## poweroff

> Используется для выключения компьютера.

```bash
[ubuntu@book:~]$ sudo poweroff
[ubuntu@book:~]$ sudo poweroff -n  //выключение без записи кэша данных на диск
[ubuntu@book:~]$ sudo poweroff -f	  //принудительное выключение, аналогично отключению питания
[ubuntu@book:~]$ sudo poweroff -d   //выключение, но без записи в системный журнал
[ubuntu@book:~]$ sudo poweroff -w   //без выключения, но с записью операции выключения в системный журнал
```



## shutdown

> Операция выключения, перед выключением информация о выключении передается всем выполняющимся программам.

```bash
[ubuntu@book:~]$ sudo shutdown -h now //немедленное выключение
[ubuntu@book:~]$ sudo shutdown -t 10  //выключение через 10 секунд
[ubuntu@book:~]$ sudo shutdown -r now  //немедленная перезагрузка
[ubuntu@book:~]$ sudo shutdown -h 3  	//выключение через 3 минуты
[ubuntu@book:~]$ sudo shutdown -c   	//отмена текущей операции выключения
```



## Команда which

> Используется для поиска местоположения файлов в системе

```bash
[ubuntu@book:~]$ which gdb  //поиск и отображение местоположения команды gdb
```



## Команда ps

> Отображение состояния процессов, выполняющихся в текущей системе.

```bash
[ubuntu@book:~]$ ps -aux  //просмотр подробной информации о состоянии процессов
[ubuntu@book:~]$ ps -ef | grep "ssh" //просмотр полного пути процесса и PID, в сочетании с grep для поиска нужной информации о процессе
[ubuntu@book:~]$ ps -u root  //просмотр информации о процессах пользователя root
```



## Команда clear

> Используется для очистки экрана, в основном для очистки строк в терминале.

```b
[ubuntu@book:~]$ clear
```



## Команда su

> Используется для переключения идентификатора пользователя, изменения пользователя текущего терминала.

```bash
[ubuntu@book:~]$ su root //переключение на пользователя root, требуется ввод пароля пользователя root
[ubuntu@book:~]$ su ubuntu //переключение на пользователя ubuntu, требуется ввод пароля пользователя ubuntu
```



## Команда whoami

> Команда whoami используется для отображения имени текущего пользователя

```bash
[ubuntu@book:~]$ whoami
```



## Команда who

> Используется для отображения пользователей, вошедших в систему, и их подробной информации.

```bash
[ubuntu@book:~]$ who  		//отображение всех пользователей, вошедших в систему
[ubuntu@book:~]$ who  -H 	//отображение заголовков столбцов
[ubuntu@book:~]$ who -T  -H 	//отображение атрибутов терминала входа
[ubuntu@book:~]$ who -q		//отображение состояния вошедших пользователей в упрощенном режиме

```





## Команда date

> Используется для отображения текущей информации о времени системы.

```b
[ubuntu@book:~]$ date
```



## dmesg

> Команда для просмотра журнала ядра.

```bash
[ubuntu@book:~]$ dmesg
```