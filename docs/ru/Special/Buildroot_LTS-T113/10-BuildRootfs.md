# Компиляция и создание корневой файловой системы с использованием buildroot-SDK

## Отдельная компиляция и конфигурация busybox

``` shell
book@virtual-machine:~/Neza-D1/buildroot-2021$ make  busybox-menuconfig
```

### Очистка неправильного кэша и переупаковка

``` shell
rm -rf  output/target;    find output/build/ -name .stamp_target_installed | xargs rm ; make
```
