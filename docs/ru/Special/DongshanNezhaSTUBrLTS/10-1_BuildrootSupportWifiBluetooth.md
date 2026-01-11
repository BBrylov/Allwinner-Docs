# Компиляция и сборка корневой файловой системы с помощью buildroot-SDK

## Отдельная компиляция и конфигурация busybox

``` shell
book@virtual-machine:~/Neza-D1/buildroot-2021$ make  busybox-menuconfig
```

### Очистка недействительного кэша и переупаковка

``` shell
rm -rf  output/target;    find output/build/ -name .stamp_target_installed | xargs rm ; make
```
