# Управление сетью

## Команда ifconfig

> ifconfig используется для управления сетевыми устройствами.

```bash
[ubuntu@book:~]$ sudo apt install net-tools
[ubuntu@book:~]$ ifconfig
[ubuntu@book:~]$ sudo dhclient 			//автоматическое получение IP-адреса
[ubuntu@book:~]$ sudo ifconfig ens33 up  //включение сетевого интерфейса ens33
[ubuntu@book:~]$ sudo dhclient 			//автоматическое получение IP-адреса
[ubuntu@book:~]$ ping qq.com 			//тестирование сетевой связности

[ubuntu@book:~]$ sudo ifconfig ens33 down  //отключение сетевого интерфейса ens33
[ubuntu@book:~]$ sudo ifconfig ens33 hw ether 00:AA:BB:CC:DD:EE  //установка MAC-адреса 00:AA:BB:CC:DD:EE для интерфейса ens33
[ubuntu@book:~]$ sudo ifconfig ens33 up  //включение сетевого интерфейса ens33
[ubuntu@book:~]$ sudo dhclient 			//автоматическое получение IP-адреса
```

* Пример настройки динамического IP

```bash
book@virtual-machine:~$ cat /etc/netplan/01-netplan.yaml
network:
 version: 2
 ethernets:
    ens33:
      dhcp4: true
```



* Пример настройки статического IP

```bash
book@virtual-machine:~$ cat /etc/netplan/01-netplan.yaml
network:
 version: 2
 renderer: networkd
 ethernets:
    ens192:
      dhcp4: no
      addresses: [192.168.1.133/24]
      gateway4: 192.168.1.1
```



## Команда ping

> Используется для проверки или тестирования сетевой связности.

```ba
[ubuntu@book:~]$ ping qq.com	//проверка связности с qq.com
[ubuntu@book:~]$ ping 192.168.1.1 //проверка связности с 192.168.1.1
[ubuntu@book:~]$ ping -I ens36 qq.com //использование интерфейса ens36 для проверки связности с qq.com
[ubuntu@book:~]$ ping -I ens36 192.168.1.1  //использование интерфейса ens36 для проверки связности с IP-адресом 192.168.1.1
[ubuntu@book:~]$ ping  -i 3 -s 1024 qq.com  //установка интервала 3 секунды и размера пакета 1024 для проверки связности с qq.com
```

* Состояние сетевой связности.



* Аномальная сетевая связь.








## Общий доступ к файлам через samba

```bash
[ubuntu@book:~]$ sudo apt install cifs-utils samba -y
[ubuntu@book:~]$ sudo nano /etc/samba/smb.conf
[share]
   comment = All Printers
   available = yes
   browseable = yes
   path = /home/ubuntu/Downloads
   public  = yes
   writable = yes
[ubuntu@book:~]$ sudo smbpasswd -a ubuntu
[ubuntu@book:~]$ sudo /etc/init.d/smbd restart
[ubuntu@book:~]$ sudo chmod -R go+rwx  Downloads/
```

* В Windows введите `\\IP\share` и в появившемся диалоговом окне введите имя пользователя и пароль, которые мы только что установили через smbpasswd.





## Служба nfs

> NFS - это сетевая файловая система, позволяющая отладочной плате напрямую монтировать папки с ПК через сеть.

```bash
[ubuntu@book:~]$ sudo apt install nfs-kernel-server
[ubuntu@book:~]$ mkdir ~/nfs_rootfs
[ubuntu@book:~]$ sudo nano /etc/exports
/home/ubuntu/nfs_rootfs  *(rw,nohide,insecure,no_subtree_check,async,no_root_squash)
[ubuntu@book:~]$ sudo service nfs-kernel-server restart

[ubuntu@book:~]$ sudo mount -t nfs 127.0.0.1:/home/ubuntu/nfs_rootfs /mnt
```



## Служба tftp

```bash
[ubuntu@book:~]$  sudo apt-get install tftp-hpa tftpd-hpa
[ubuntu@book:~]$ mkdir ~/tftpboot
[ubuntu@book:~]$ sudo chmod -R 777 ~/tftpboot
[ubuntu@book:~/tftpboot]$ sudo nano /etc/default/tftpd-hpa
TFTP_USERNAME="tftp"
TFTP_DIRECTORY="/home/ubuntu/tftpboot"
TFTP_OPTIONS="-l -c -s"
TFTP_ADDRESS=":69"
[ubuntu@book:~/tftpboot]$ sudo service tftpd-hpa restart
```

> TFTP_OPTIONS="-l -c -s" -s означает безопасность, -c означает разрешение на загрузку

* Использование команды tftp на отладочной плате для загрузки и скачивания файлов

```bash
# tftp -r test1 -g 192.168.1.20   //получение файла test1 с сервера 192.168.1.20
# tftp -l 1.txt   -p 192.168.1.20  //загрузка локального файла 1.txt на сервер 192.168.1.20

```



## Команда netstat

> Используется для просмотра подробной информации о сетевых подключениях системы.

```bash
[ubuntu@book:~]$ netstat -a  //отображение подробного состояния сети
[ubuntu@book:~]$ netstat -apu //отображение информации об использовании портов
```





## Команда tcpdump

> Используется для прослушивания сетевых данных.

```bash
[ubuntu@book:~]$ tcpdump 	//отображение всех сетевых пакетов
[ubuntu@book:~]$ tcpdump -i ens36  //указание сетевого интерфейса, мониторинг сетевых пакетов ens36
[ubuntu@book:~]$ tcpdump -i ens36 -q //отображение в упрощенном режиме
[ubuntu@book:~]$ tcpdump -i ens36 -vv //отображение более подробной информации
[ubuntu@book:~]$ tcpdump -c 10 -i ens36 -vv //мониторинг ens36, захват только 10 пакетов
[ubuntu@book:~]$ tcpdump -c 10 -i ens36 -vv  > tcpdump.cap //мониторинг ens36, захват только 10 пакетов, экспорт в файл tcpdump.cap
```



## Команда ip

> Более мощная команда управления сетью, чем ifconfig.

```bash
[ubuntu@book:~]$ ip link show
[ubuntu@book:~]$ ip a
[ubuntu@book:~]$ ip addr show
[ubuntu@book:~]$ ip link set ens36 up
[ubuntu@book:~]$ ip link set ens36 down
[ubuntu@book:~]$ ip addr add 192.168.1.20/24 dev ens36
[ubuntu@book:~]$ ip addr del 192.168.1.20/24 dev ens36
[ubuntu@book:~]$ ip -s link list
[ubuntu@book:~]$ ip route list
```