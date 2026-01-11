## 3 Введение в методы компиляции

### 3.1 Подготовка цепочки инструментов для компиляции

Для подготовки и выполнения цепочки инструментов для компиляции выполните следующие шаги:

```
1）cd longan/brandy/brandy-2.0/\
2）./build.sh -t
```



### 3.2 Быстрая компиляция boot0 и U-Boot

В директории longan/brandy/brandy-2.0/ выполните ./build.sh -p имя_платформы для быстрой компиляции всего процесса загрузки. Это имя платформы относится к LICHEE_CHIP.

```
./build.sh -p {LICHEE_CHIP}            //быстрая компиляция spl/U-Boot
./build.sh -o spl-pub -p {LICHEE_CHIP} //быстрая компиляция spl-pub
./build.sh -o uboot -p {LICHEE_CHIP}   //быстрая компиляция U-Boot
```



### 3.3 Компиляция U-Boot

cd longan/brandy/brandy-2.0/u-boot-2018/ для входа в директорию u-boot-2018. Взяв в качестве примера {LICHEE_CHIP}, последовательно выполните следующие операции.

```
1）make {LICHEE_CHIP}_defconfig
2）make -j
```



### 3.4 Компиляция boot0/fes/sboot

cd longan/brandy/brandy-2.0/spl-pub для входа в директорию spl-pub, необходимо установить параметры платформы и модуля для компиляции. Взяв в качестве примера {LICHEE_CHIP}, метод компиляции для nand/emmc следующий:

1. Компиляция boot0

```
make distclean
make p={LICHEE_CHIP} m=nand
make boot0

make distclean
make p={LICHEE_CHIP} m=emmc
make boot0
```



2. Компиляция fes

```
make distclean
make p={LICHEE_CHIP} m=fes
make fes
```



3. Компиляция sboot

```
make distclean
make p={LICHEE_CHIP} m=sboot
make sboot
```

