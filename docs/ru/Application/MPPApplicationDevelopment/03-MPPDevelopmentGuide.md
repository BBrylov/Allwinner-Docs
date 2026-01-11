# Руководство по разработке мультимедиа MPP

## 1 Предисловие

### 1.1 Обзор

Руководство по разработке мультимедиа MPP для Tina Linux

### 1.2 Версия продукта

| 产品名称 | 产品版本 |
| -------- | -------- |
| V853     | V1.0     |

### 1.3 Предполагаемые читатели

Этот документ (это руководство) в основном применимо к следующим инженерам:
• Инженер технической поддержки
• Инженер-разработчик программного обеспечения

## 2 Управление системой

### 2.1 Обзор

Модуль системного управления MPP выполняет сброс и базовую инициализацию различных компонентов оборудования в соответствии с характеристиками микросхемы и одновременно отвечает за инициализацию различных модулей обработки бизнеса в системе MPP (Media Processing Platform медиаплатформа обработки).

Модуль отвечает за инициализацию, деинициализацию и управление рабочим состоянием различных модулей системы MPP, предоставление информации о версии текущей системы MPP и другие функции.

Перед запуском службы MPP приложение должно завершить инициализацию системы MPP. Аналогично, после выхода из службы MPP приложение должно завершить деинициализацию системы MPP и освободить ресурсы.

### 2.2 Описание функций

• Инициализируйте рабочую среду компонентов MPP и завершите конфигурацию инициализации аппаратных устройств, таких как аудио вход-выход, видео вход-выход и т.д.
• Предоставляет интерфейс для привязки компонентов.
• Предоставляет интерфейс для выделения, освобождения и запроса медиа-памяти.

#### 2.2.1 Состояние

Этот компонент не имеет внутренних потоков, поэтому переходов состояния нет.

#### 2.2.2 Системная привязка

MPP предоставляет интерфейс системной привязки (AW_MPI_SYS_Bind), который устанавливает связь между источником и получателем данных путём привязки получателя к источнику (только получатель может привязать источник). После привязки источник данных генерирует

данные будут автоматически отправлены получателю. Отношение привязки является взаимным. После обработки данных получателем, если буфер передачи данных поступает из источника, буфер должен быть возвращен источнику. Один компонент может установить связь с несколькими компонентами

с точностью до портов компонента.

Отношения привязки, поддерживаемые MPP в настоящее время, показаны в таблице ниже:

| Источник данных | Получатель данных |
| ------ | ---------- |
| VI     | VO         |
| VENC   |            |
| VENC   |            |
| VENC   | MUX        |
| AI     | AO         |
| AENC   |            |
| AENC   | MUX        |
| DEMUX  | VDEC       |
| ADEC   |            |
| VDEC   | VO         |
| ADEC   | AO         |
| AO     | AI         |
| CLOCK  | AO         |
| VO     |            |
| DEMUX  |            |
| VDEC   |            |
| VENC   |            |

#### 2.2.3 Режим передачи данных портов компонента

Компоненты MPP имеют два порта (inport/outport). Порт inport используется для приёма данных. После обработки во внутреннем потоке компонента генерируются новые данные, которые добавляются в список данных очереди вывода для управления, ожидая пользователя

чтобы активно получить данные с порта outport или автоматически отправить их на следующий связанный компонент через outport.

Передача данных портов компонента разделяется на режим tunnel и режим non-tunnel. Автоматическая передача данных на следующий компонент называется режимом tunnel, а ручное управление и передача данных называется режимом non-tunnel. Режим tunnel

и режим non-tunnel рабочей передачи данных показаны на диаграммах 1-1 и 1-2 ниже.

![image-20230103115212830](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230103115212830.png)

<center>Рис. 2-1: Режим tunnel компонента MPP</center>

На приведённой выше диаграмме показан принцип работы передачи данных в режиме tunnel между компонентами. Приложению нужно только использовать несколько простых команд для создания, запуска, остановки и уничтожения компонентов. Команда запуска управляет запуском внутреннего потока компонента

что приводит к постоянному генерированию данных и единому управлению во внутреннем списке данных. Затем генерируемые данные автоматически отправляются на следующий компонент. Внутренний поток следующего компонента использует данные, поступающие через входной порт,

для создания данных, которые затем добавляются в список данных для управления. Затем уже использованные данные входного порта возвращаются предыдущему компоненту, позволяя ему освободить пространство буфера, занятое этими данными.

Например, когда компонент ai привязан к компоненту aenc, это означает, что outport компонента ai привязан к inport компонента aenc. Затем, когда в канале ai присутствуют данные pcm, данные автоматически отправляются на

порт inport компонента aenc. Внутренний поток компонента aenc выполняет кодирование и после создания сжатых аудиоданных управляет ими в ожидании отправки на компонент mux или ожидания получения данных пользователем, в зависимости от режима передачи данных выходного порта компонента aenc.

режим передачи.

![image-20230103115252700](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230103115252700.png)

<center></center>

上图显示了non-tunnel 模式的组件间数据传递方式的工作原理。应用创建、启动组件后，需通过SendFrame()/SendStream() 等接口，往组件的inport 输入端口

送数据，然后应用调用Get-Stream()/GetFrame() 等接口去取生产出的数据(分为阻塞方式和超时等待方式)，待组件内部线程利用inport 端的数据生产出数据后，

添加到输出数据队列中进行管理，此时应用的取数据函数调用方可退出(阻塞方式)，应用拿到生成的这笔数据进行处理，接下来仍需要利用这笔数据还帧给组件，

主动告诉组件应用已经使用完这笔数据，可以释放其占用的buffer 空间。

Notice：使用non-tunnel 模式时，应用如果往组件inport 端口送数据不及时，会导致组件内部输入缓冲区的underflow；如果不及时取走数据和还帧，会导致组

件内部输出缓冲区的overflow，因为内部线程一直源源不断地生产出新的数据，输出缓冲区队列逐渐变满直至爆仓，除非应用不往组件inport 端口送数据，那么就

不会生产出数据，输出缓冲区也不会爆仓。输入缓冲区的underflow 和输出缓冲区的overflow 都会导致组件无法处理数据，造成丢帧等后果。

各组件输入端口和输出端口绑定、非绑定支持如下表所示：

| 组件类型 | 输入端             | 输出端             |
| -------- | ------------------ | ------------------ |
| VI       | ——                 | tunnel、non-tunnel |
| AI       | ——                 | tunnel、non-tunnel |
| VENC     | tunnel、non-tunnel | tunnel、non-tunnel |
| AENC     | tunnel、non-tunnel | tunnel、non-tunnel |
| VDEC     | tunnel、non-tunnel | tunnel、non-tunnel |
| ADEC     | tunnel、non-tunnel | tunnel、non-tunnel |
| VO       | tunnel、non-tunnel | ——                 |
| AO       | tunnel、non-tunnel | tunnel、non-tunnel |
| MUX      | tunnel             | ——                 |
| DEMUX    | ——                 | tunnel、non-tunnel |

一般的规律是，source 型组件，其输入端接硬件设备用于获取raw-data，输出端口支持tunnel和non-tunnel 两种模式；sink 型组件，其输入端支持tunnel 和

non-tunnel 两种模式，输出端直接接render 类型硬件设备，进行数据的呈现，如声音的播放、图像的显示；filter 型组件，输入和输出端口都支持tunnel 和non-

tunnel 两种模式。

#### 2.2.4 媒体内存分配

用于多媒体处理的物理连续的内存分配，使用ION 方式。系统控制模块封装了ION 接口，提供给APP 使用。硬件IP 如果支持IOMMU 模式，就不再需要物理连续的

内存，IOMMU 内存的操作也通过ION 驱动接口。

#### 2.2.5 通过mpp 的proc 节点实时查看硬件信息

mpp 可以为若干硬件驱动生成proc 节点，挂载在debugfs 文件系统下，供使用者在系统运行过程中实时查看驱动的运行信息。

配置内核make kernel_menuconfig，打开配置CONFIG_SUNXI_MPP 即可生成proc 节点。

系统启动后，在终端执行命令：mount -t debugfs none /sys/kernel/debug，挂载debugfs 文件系统（默认自动挂载）。然后通过cat 指令查看mpp 节点信息：

```
cat /sys/kernel/debug/mpp/vi
cat /sys/kernel/debug/mpp/ve
cat /sys/kernel/debug/mpp/vo
```

关于MPP 调试节点的具体使用方法，请参考文档《MPP_ 调试指南》。mpp 还可以进一步配置是否打开统计功能，例如venc 组件：AW_MPI_VENC_SetProcSet。

**技巧**
静态属性：指只能在系统未初始化、未启用设备或通道时，才能设置的属性。动态属性：指在任何时刻都可以设置的属性。



### 2.3 API 接口

系统控制实现MPP（Media Process Platform）系统初始化、系统绑定解绑、获取MPP 版本号等功能。

SYS 目前对外支持的API 接口：
• AW_MPI_SYS_Init ：初始化MPP 系统。
• AW_MPI_SYS_Exit ：退出MPP 系统。
• AW_MPI_SYS_SetConf ：配置系统控制参数。
• AW_MPI_SYS_GetConf ：获得系统控制参数。
• AW_MPI_SYS_Bind ：绑定Источник данных通道端口和Получатель данных通道端口。
• AW_MPI_SYS_UnBind ：Источник данных到Получатель данных解绑定接口。
• AW_MPI_SYS_GetBindbyDest ：获取此通道上绑定的源通道的信息。
• AW_MPI_SYS_GetVersion ：获取MPP 的版本号。
• AW_MPI_SYS_GetCurPts ：获取MPP 的当前时间戳。
• AW_MPI_SYS_InitPtsBase ：初始化MPP 的时间戳基准。
• AW_MPI_SYS_SyncPts ：同步MPP 的时间戳。
• AW_MPI_SYS_MmzAlloc_Cached ：在用户态分配MMZ 内存。
• AW_MPI_SYS_MmzFree ：在用户态释放MMZ 内存。
• AW_MPI_SYS_MmzFlushCache ：刷新cache 里的内容到内存并且使cache 里的内容无效。
• AW_MPI_SYS_MmzFlushCache_check ：直接刷新指定cache 里的内容到内存并且使cache 里的内容无效。
• AW_MPI_SYS_GetVirMemInfo ：根据虚拟地址获取对应的内存信息，包括物理地址及cached 属性。
• AW_MPI_SYS_HANDLE_ZERO ：清空指定的文件集合。
• AW_MPI_SYS_HANDLE_SET ：将一个给定的文件描述符加入到集合中。
• AW_MPI_SYS_HANDLE_ISSET ：检查文件描述符在集合中的状态是否变化。
• AW_MPI_SYS_HANDLE_Select ：监视需要监视的文件描述符（读或写的文件集中的文件描述符）的状态变化情况。

#### 2.3.1 AW_MPI_SYS_Init

【描述】

初始化MPP 系统。包括音频输入输出、视频输入输出、视频编码、视频叠加区域、视频侦测分析等都会被初始化。

【语法】

```
ERRORTYPE AW_MPI_SYS_Init();
```

【参数】

| 参数名称 | 描述 | 输入/输出 |
| -------- | ---- | --------- |
| 无       |      |           |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

必须先调用AW_MPI_SYS_SetConf 配置MPP 系统后才能初始化，否则初始化会失败。

如果多次初始化，仍会返回成功，但实际上系统不会对MPP 的运行状态有任何影响。

【举例】

无

#### 2.3.2 AW_MPI_SYS_Exit

【描述】

退出MPP 系统。包括音频输入输出、视频输入输出、视频编码、视频叠加区域、视频侦测分析通道等都会被销毁或者禁用。

【语法】

```
ERRORTYPE AW_MPI_SYS_Exit();
```

【参数】

| 参数名称 | 描述 | 输入/输出 |
| -------- | ---- | --------- |
| 无       |      |           |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

退出MPP 时，如果有阻塞在MPI 上的用户进程，则去初始化会失败。如果所有阻塞在MPI 上的调用都返回，则可以成功去初始化。可以反复去初始化，不返回失败。

由于系统去初始化不会销毁音频的编解码通道，因此这些通道的销毁需要用户主动进行。如果创建这些通道的进程退出，则通道随之被销毁。

【举例】

无

#### 2.3.3 AW_MPI_SYS_SetConf

【描述】

配置系统控制参数。

【语法】

```
ERRORTYPE AW_MPI_SYS_SetConf(const MPP_SYS_CONF_S* pstSysConf);
```

【参数】

| 参数名称   | 描述                         | 输入/输出 |
| ---------- | ---------------------------- | --------- |
| pstSysConf | 系统控制参数指针。静态属性。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

只有在MPP 整个系统处于未初始化状态，才可调用此函数配置MPP 系统，否则会配置失败。

【举例】

无

### 2.3.4 AW_MPI_SYS_GetConf

【描述】

获得系统控制参数。

【语法】

```
ERRORTYPE AW_MPI_SYS_GetConf(MPP_SYS_CONF_S* pstSysConf);
```

【参数】

| 参数名称   | 描述                         | 输入/输出 |
| ---------- | ---------------------------- | --------- |
| pstSysConf | 系统控制参数指针。静态属性。 | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

必须先调用AW_MPI_SYS_SetConf 成功后才能获取配置。

【举例】

无

#### 2.3.5 AW_MPI_SYS_Bind

【描述】

绑定Источник данных通道端口和Получатель данных通道端口。

【语法】

```
ERRORTYPE AW_MPI_SYS_Bind(MPP_CHN_S* pstSrcChn, MPP_CHN_S* pstDestChn);
```

【参数】

| 参数名称   | 描述         | 输入/输出 |
| ---------- | ------------ | --------- |
| pstSrcChn  | 源通道指针   | 输入      |
| pstDestChn | 目的通道指针 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无
【举例】

无

#### 2.3.6 AW_MPI_SYS_UnBind

【描述】

Источник данных到Получатель данных解绑定接口。

【语法】

```
ERRORTYPE AW_MPI_SYS_UnBind(MPP_CHN_S* pstSrcChn, MPP_CHN_S* pstDestChn);
```

【参数】

| 参数名称   | 描述           | 输入/输出 |
| ---------- | -------------- | --------- |
| pstSrcChn  | 源通道指针。   | 输入      |
| pstDestChn | 目的通道指针。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无
【举例】

无

#### 2.3.7 AW_MPI_SYS_GetBindbyDest

【描述】

获取此通道上绑定的源通道的信息。

【语法】

```
ERRORTYPE AW_MPI_SYS_GetBindbyDest(MPP_CHN_S* pstDestChn, MPP_CHN_S* pstSrcChn);
```

【参数】

| 参数名称   | 描述       | 输入/输出 |
| ---------- | ---------- | --------- |
| pstDestChn | 源通道指针 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

如果该通道绑定了2 个以上的源通道（例如Muxer 模块同时接收音频、视频编码通道的编码数据），只返回最先绑定的源通道信息。

【举例】

无

#### 2.3.8 AW_MPI_SYS_GetVersion

【描述】

获取MPP 的版本号。

【语法】

```
ERRORTYPE AW_MPI_SYS_GetVersion(MPP_VERSION_S* pstVersion);
```

【参数】

| 参数名称   | 描述                       | 输入/输出 |
| ---------- | -------------------------- | --------- |
| pstVersion | 版本号描述指针。动态属性。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无
【举例】

无

#### 2.3.9 AW_MPI_SYS_GetCurPts

【描述】

获取MPP 的当前时间戳。

【语法】

```
ERRORTYPE AW_MPI_SYS_GetCurPts(uint64_t* pu64CurPts);
```

【参数】

| 参数名称   | 描述           | 输入/输出 |
| ---------- | -------------- | --------- |
| pu64CurPts | 当前时间戳指针 | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

#### 2.3.10 AW_MPI_SYS_InitPtsBase

【描述】

初始化MPP 的时间戳基准。

【语法】

```
ERRORTYPE AW_MPI_SYS_InitPtsBase(uint64_t u64PtsBase);
```

【参数】

| 参数名称x  | 参数名称描述             | 输入/输出 |
| ---------- | ------------------------ | --------- |
| u64PtsBase | 时间戳基准。单位：微秒。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

初始化时间戳基准会将当前系统的时间戳强制置成u64PtsBase，与系统原有时间戳没有任何约束。因此，建议在媒体业务没有启动时（例如操作系统刚启动），

调用这个接口。如果媒体业务已经启动，建议调用AW_MPI_SYS_SyncPts 进行时间戳微调。

【举例】

无

#### 2.3.11 AW_MPI_SYS_SyncPts

【描述】

同步MPP 的时间戳。

【语法】

```
ERRORTYPE AW_MPI_SYS_SyncPts(uint64_t u64PtsBase);
```

【参数】

| 参数名称   | 描述         | 输入/输出 |
| ---------- | ------------ | --------- |
| u64PtsBase | 时间戳基准。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

对当前系统时间戳（微秒级）进行微调，微调后不会出现时间戳回退现象。在多片之间做同步时，由于单板的时钟源误差可能比较大，建议一秒钟进行一次时间戳

微调。

【举例】

无

#### 2.3.12 AW_MPI_SYS_MmzAlloc_Cached

【描述】

在用户态分配MMZ 内存。内部从ION 分配iommu 内存。

【语法】

```
ERRORTYPE AW_MPI_SYS_MmzAlloc_Cached(unsigned int* pu32PhyAddr, void** ppVirtAddr, unsigned int u32Len);
```

【参数】

| 参数名称          | 描述                   | 输入/输出 |
| ----------------- | ---------------------- | --------- |
| pu32PhyAddr iommu | 物理地址指针           | 输出      |
| ppVirtAddr        | 指向虚拟地址指针的指针 | 输出      |
| u32Len            | 内存块大小             | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

#### 2.3.13 AW_MPI_SYS_MmzFree

【描述】

在用户态释放MMZ 内存。

【语法】

```
ERRORTYPE AW_MPI_SYS_MmzFree(unsigned int u32PhyAddr, void* pVirtAddr);
```

【参数】

| 参数名称         | 描述         | 输入/输出 |
| ---------------- | ------------ | --------- |
| u32PhyAddr iommu | 物理地址     | 输入      |
| pVirtAddr        | 虚拟地址指针 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

#### 2.3.14 AW_MPI_SYS_MmzFlushCache

【描述】

刷新cache 里的内容到内存并且使cache 里的内容无效。

【语法】

```
ERRORTYPE AW_MPI_SYS_MmzFlushCache(unsigned int u32PhyAddr, void* pVitAddr, unsigned int u32Size);
```

【参数】

| 参数名称   | 描述                           | 输入/输出 |
| ---------- | ------------------------------ | --------- |
| u32PhyAddr | 待操作数据的起始物理地址。     | 输入      |
| pVitAddr   | 待操作数据的起始虚拟地址指针。 | 输入      |
| u32Size    | 待操作数据的大小。             | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

#### 2.3.15 AW_MPI_SYS_MmzFlushCache_check

【描述】

刷新cache 里的内容到内存并且使cache 里的内容无效。

【语法】

```
 bERRORTYPE AW_MPI_SYS_MmzFlushCache_check(unsigned int u32PhyAddr, void* pVitAddr, unsigned int u32Size, BOOL bCheck);
```

【参数】

| 参数名称   | 描述输入/输出                                          | 输入/输出 |
| ---------- | ------------------------------------------------------ | --------- |
| u32PhyAddr | 待操作数据的起始物理地址。                             | 输入      |
| pVitAddr   | 待操作数据的起始虚拟地址指针。                         | 输入      |
| u32Size    | 待操作数据的大小。                                     | 输入      |
| bCheck     | 是否需要检查memory 列表（TRUE：检查，FALSE：不检查）。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

#### 2.3.16 AW_MPI_SYS_GetVirMemInfo

【描述】

根据虚拟地址获取对应的内存信息，包括物理地址及cached 属性。

【语法】

```
ERRORTYPE AW_MPI_SYS_GetVirMemInfo(const void* pVitAddr, SYS_VIRMEM_INFO_S* pstMemInfo);
```

【参数】

| 参数名称   | 描述         | 输入/输出 |
| ---------- | ------------ | --------- |
| pVitAddr   | 虚地址。     | 输入      |
| pstMemInfo | 虚内存的信息 | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

#### 2.3.17 AW_MPI_SYS_HANDLE_ZERO

#### 2.3.18 AW_MPI_SYS_HANDLE_SET

#### 2.3.19 AW_MPI_SYS_HANDLE_ISSET

#### 2.3.20 AW_MPI_SYS_HANDLE_Select

【描述】
把mpp 组件实例模拟为文件句柄fd，查询是否有数据可用。

【语法】

```
ERRORTYPE AW_MPI_SYS_HANDLE_ZERO(handle_set *pHandleSet);
ERRORTYPE AW_MPI_SYS_HANDLE_SET(int handle, handle_set *pHandleSet);
ERRORTYPE AW_MPI_SYS_HANDLE_ISSET(int handle, handle_set *pHandleSet);
ERRORTYPE AW_MPI_SYS_HANDLE_Select(handle_set *pRdFds, int nMilliSecs);
```

【参数】

| 参数名称   | 描述           | 输入/输出 |
| ---------- | -------------- | --------- |
| pHandleSet | 类似于fd_set。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】

无

【举例】

无

### 2.4 数据类型

#### 2.4.1 视频公共类型

##### 2.4.1.1 VIDEO_FRAME_ S

【说明】

定义视频原始图像帧结构。

【定义】

```
typedef struct VIDEO_FRAME_S
{
unsigned int mWidth;
unsigned int mHeight;
VIDEO_FIELD_E mField;
PIXEL_FORMAT_E mPixelFormat;
VIDEO_FORMAT_E mVideoFormat;
COMPRESS_MODE_E mCompressMode;
unsigned int mPhyAddr[3];/* Y, U, V; Y, UV; Y, VU */
void* mpVirAddr[3];
unsigned int mStride[3];
unsigned int mHeaderPhyAddr[3];
void* mpHeaderVirAddr[3];
unsigned int mHeaderStride[3];
short mOffsetTop; /* top offset of show area */
short mOffsetBottom; /* bottom offset of show area */
short mOffsetLeft; /* left offset of show area */
short mOffsetRight; /* right offset of show area */
uint64_t mpts; /* unit:us */
unsigned int mExposureTime; /* every frame exp time */
unsigned int mFramecnt; /* rename mPrivateData to Framecnt_exp_start */
int mEnvLV; /* environment luminance value */
int mEnvLVAdj; /* environment luminance value Adj? */
/* nobody use it until now, so just comment out it,
* if somebody want to use it, then you can add it back.
*/
// VIDEO_SUPPLEMENT_S mSupplement;
/* for frame specific informations.
*e.g. this is a Long-Exposure frame, you can set mFrmFlag = (exp_time)<<16 | FF_LONGEXP
.
*e.g. somtimes, frame lost in kernel because of return time delay, then you can set
* mFrmFlag = (lost_num)<<16 | FF_FRAME_LOST; and maybe Venc can insert empty frames.
*/
unsigned int mWhoSetFlag; /* reserve(8bit)|COMP_TYPE(8bit)|DEV_NUM(8bit)|CHN_NUM(8
bit) */
uint64_t mFlagPts; /* when generate this flag, unit(us) */
/* whats this flag, data(16bit)|flag(16bit), if you want a signed data, please use
short data type */
unsigned int mFrmFlag;
} VIDEO_FRAME_S;
```

【成员】

| 成员名称           | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| mWidth             | 装填图像的buffer 的宽度。                                    |
| mHeight            | 装填图像的buffer 的高度。                                    |
| mField             | 帧场模式，目前只支持VIDEO_FIELD_FRAME。                      |
| mPixelFormat       | 视频图像像素格式。                                           |
| mVideoFormat       | 视频图像格式。只支持VIDEO_FORMAT_LINEAR。未使用。            |
| mCompressMode      | 视频压缩模式。未使用。                                       |
| mPhyAddr[3]        | 视频帧的yuv 分量的物理地址。                                 |
| mpVirAddr[3]       | 视频帧的yuv 分量的虚拟地址。                                 |
| mStride[3]         | 视频帧的yuv 分量的一行的跨距，单位为字节。                   |
| mHeaderPhyAddr[3]  | 未使用。                                                     |
| mpHeaderVirAddr[3] | 未使用。                                                     |
| mHeaderStride[3]   | 未使用。                                                     |
| mOffsetTop         | 图像顶部剪裁宽度，单位为像素。图像帧第一行像素的Y 坐标。     |
| mOffsetBottom      | 图像底部剪裁宽度，单位为像素。图像帧最后一行像素的Y 坐标加1。 |
| mOffsetLeft        | 图像左侧剪裁宽度，单位为像素。图像帧左侧像素的X 坐标。       |
| mOffsetRight       | 图像右侧剪裁宽度，单位为像素。图像帧右侧像素的X 坐标加1。    |
| mpts               | 视频帧pts。单位微秒。                                        |
| mExposureTime      | 每帧的曝光时间。                                             |
| mFramecnt          | 曝光开始的帧数。                                             |
| mEnvLV             | 采集图像帧时的环境亮度值。                                   |
| mEnvLVAdj          | 调整采集图像帧时的环境亮度值。                               |
| mWhoSetFlag        | 组件类型、设备ID、通道ID。                                   |
| mFlagPts           | 视频帧的时间戳。                                             |
| mFrmFlag           | 视频帧的标记。                                               |

【注意事项】

无

【相关数据类型及接口】

无

##### 2.4.1.2 VIDEO_FRAME_INFO_S

【说明】

定义视频图像帧信息结构体。

【定义】

```
typedef struct VIDEO_FRAME_INFO_S
{
    VIDEO_FRAME_S VFrame;
    unsigned int mId; //id identify frame uniquely
} VIDEO_FRAME_INFO_S;
```

【成员】

| 成员名称 | 描述                      |
| -------- | ------------------------- |
| VFrame   | 视频图像帧。              |
| mId      | 装填图像帧的buffer 的id。 |

【注意事项】

无

【相关数据类型及接口】

无

##### 2.4.1.3 BITMAP_S

【说明】

定义位图图像信息结构。

【定义】

```
typedef struct BITMAP_S
{
    PIXEL_FORMAT_E mPixelFormat; /* Bitmap's pixel format */
    unsigned int mWidth; /* Bitmap's width */
    unsigned int mHeight; /* Bitmap's height */
    void* mpData; /* Address of Bitmap's data */
} BITMAP_S;
```

【成员】

| 成员名称     | 描述                 |
| ------------ | -------------------- |
| mPixelFormat | 位图像素格式。       |
| mWidth       | 位图宽度。           |
| mHeight      | 位图高度。           |
| mpData       | 位图数据起始虚地址。 |

【注意事项】

位图像素格式支持MM_PIXEL_FORMAT_RGB_8888 和MM_PIXEL_FORMAT_RGB_1555。

【相关数据类型及接口】

无

#### 2.4.2 组件公共类型

##### 2.4.2.1 MPPCallbackInfo

【说明】

通道的callback 回调注册信息。

【定义】

```
typedef ERRORTYPE (*MPPCallbackFuncType)(void *cookie, MPP_CHN_S *pChn, MPP_EVENT_TYPE
event, void *pEventData);
typedef struct MPPCallbackInfo {
    void *cookie; //EyeseeRecorder*
    MPPCallbackFuncType callback; //MPPCallbackWrapper
} MPPCallbackInfo;
```

【成员】

| 成员名称 | 描述                       |
| -------- | -------------------------- |
| cookie   | 回调函数的app 数据结构参数 |
| callback | 回调函数类型的指针         |

【注意事项】

【相关数据类型及接口】

### 2.5 错误码

| 错误代码   | 宏定义                | 描述                         |
| ---------- | --------------------- | ---------------------------- |
| 0xA0028006 | ERR_SYS_NULL_PTR      | 空指针错误                   |
| 0xA0028010 | ERR_SYS_NOTREADY      | 系统控制属性未配置           |
| 0xA0028009 | ERR_SYS_NOT_PERM      | 操作不允许                   |
| 0xA002800C | ERR_SYS_NOMEM         | 分配内存失败，如系统内存不足 |
| 0xA0028003 | ERR_SYS_ILLEGAL_PARAM | 参数设置无效                 |
| 0xA0028012 | ERR_SYS_BUSY          | 系统忙                       |
| 0xA0028008 | ERR_SYS_NOT_SUPPORT   | 不支持的操作或类型。         |

## 3 视频输入

### 3.1 概述

视频输入模块实现的功能：用于接收并解析不同协议（Parallel、MIPI、Sub-lvds、Hispi、BT601/656/1120、Digital camera）传输过来的图像，通过ISP 和VIPP 

模块处理后输出。

主要功能：
• 支持4-lane/2-lane MIPI 配置模式。
• 支持2 路2lane MIPI-CSI2 配置模式。
• 高速串口（MIPI）支持YUV422-8bit、YUV422-10bit 图像格式。
• 高速串口（MIPI）支持YUV420-8bit、YUV420-10bit 图像格式。
• 高速串口（MIPI）支持RGB888、RGB565 图像格式输入。
• 数字并口支持BT601/656/1120 协议。
• ISP 输入：最大支持分辨率3072*3072，最大处理能力5M@30fps。
• 降噪：3DNR 支持单帧参考帧的3D 时域降噪处理；BDNR 支持2D 空域降噪处理。
• 压缩输出：支持LBC 压缩输出。
• 自动对焦：驱动支持对焦控制。
• WDR：支持2F-WDR，支持LBC 压缩，最大2.6 倍压缩率；支持2 帧WDR Sony DOL（长短帧）模式；支持LBC 模式下的WDR。
• 4 路VIPP YUV 输出，单个VIPP 最大支持4 路分时复用。
• 4 路VIPP 支持16 区域矩形框（ORL），框线宽和颜色可调。
• 4 路VPIPP 均支持缩小，缩放倍数为1 ~ 1/256 （宽高各1 ~ 1/16），scaler 模块支持YUV422 转YUV420。

### 3.2 功能描述

通路：CSI > ISP > VIPP > VirChn

CSI：表示物理Camera Signal Input Pasrse Device 的接口。CSI 可以选择连接任意一个

ISP。最多支持3 个CSI。

ISP：表示物理ISP。ISP 可以选择连接任意多个VIPP。最多支持5 个ISP。

VIPP：表示物理Scale + OSD + Mask 通道。每个VIPP 配合一个DMA 输出一路Video 给到DDR。最多支持16 个VIPP。

VirChn：表示VI 虚通道。每个物理通道最多虚拟4 个虚通道输出。默认情况下推荐使用一个物理通道和一个虚通道来采集视频数据。虚拟通道的图像属性是物理通

道的复制品。

【注意事项】
• CSI 输入设备，支持不同的时序输入，对输入的时序进行配置和解析。
• CSI、ISP、VIPP 数据处理不经过DDR。
• VIPP 设备号的使用，当前ISP 默认是在线工作模式，故VIPP 设备号0~16 中，只能使用0、4、8、12。其中，只有VIPP 0 支持在线编码。

### 3.3 VIPP Buffer 的管理和使用

#### 3.3.1 VIPP 与其他组件非绑定


![image-20230104095738825](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104095738825.png)


<center>图3-1: VIPP 非绑定情况</center>

• 每个VIPP 物理通道对应一段Buff 空间，Buff 空间数目由MPI 函数设定，由Kernel Driver层统一管理、分配、使用，默认为5 个Buff ：ABCDE。
• 同一个VIPP 设备下所有的虚通道共用同一个VIPP buff。
• 用户通过AW_MPI_VI_GetFrame 获取buff 数据，AW_MPI_VI_ReleaseFrame 释放buff数据。必须成对使用。

#### 3.3.2 VIPP 与其他组件绑定

• 绑定情况下的buff 和非绑定情况下的buff 分配是一致的。
• 绑定情况下的Buff 数据在组件直接内部传递。AW_MPI_VI_GetFrame 与AW_MPI_VI_ReleaseFrame函数不可使用。

注意：同一个虚拟通道，同一时间只能使用绑定或者非绑定其中一种方式获取YUV 数据，不支持两种方式同时存在。

### 3.4 状态图

1) 程序结构

![image-20230104095942479](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104095942479.png)

<center>图3-2: VIPP 程序结构</center>

2) 状态转换图

![image-20230104100009714](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104100009714.png)

<center>图3-3: VIPP 状态转换图</center>

说明：

• COMP_StateLoaded: 组件完成初始化
• COMP_StateIdle：组件准备就绪
• COMP_StateExecuting: 组件运行状态
• COMP_StatePause: 组件暂停（挂起）状态
• COMP_StateInvalid: 组件非法状态

### 3.5 API 接口

VI 目前支持的对外API 接口：

• AW_MPI_VI_CreateVipp：创建VIPP 物理设备。

• AW_MPI_VI_DestroyVipp：销毁VIPP 物理设备。

• AW_MPI_VI_SetVippAttr：设置VIPP 物理设备属性。

• AW_MPI_VI_GetVippAttr：获取VIPP 物理设备属性。

• AW_MPI_VI_SetVippFlip：设置VIPP 或sensor 垂直镜像。

• AW_MPI_VI_GetVippFlip：获取VIPP 或sensor 垂直镜像。

• AW_MPI_VI_SetVippMirror：设置VIPP 或sensor 水平镜像。

• AW_MPI_VI_GetVippMirror：获取VIPP 或sensor 水平镜像。

• AW_MPI_VI_EnableVipp：启动VIPP 物理设备。

• AW_MPI_VI_DisableVipp：停止VIPP 物理设备。

• AW_MPI_VI_SetVippShutterTime：设置通道0 的长时间曝光参数。【即将废弃，推荐使用AW_MPI_VI_SetShutterTime】

• AW_MPI_VI_CreateVirChn：基于某个VIPP，创建虚通道。

• AW_MPI_VI_DestroyVirChn：销毁虚通道。

• AW_MPI_VI_GetVirChnAttr：获取虚通道属性。

• AW_MPI_VI_SetVirChnAttr：设置虚通道属性。

• AW_MPI_VI_EnableVirChn：启动虚通道。

• AW_MPI_VI_DisableVirChn：停止虚通道。

• AW_MPI_VI_GetFrame：获取视频帧，【仅用于非绑定模式】。

• AW_MPI_VI_ReleaseFrame：释放视频帧，【仅用于非绑定模式】。

• AW_MPI_VI_SetShutterTime：设置长曝光时间参数。

• AW_MPI_VI_SetVIFreq：设置VIPP 物理设备的运行频率。

• AW_MPI_VI_RegisterCallback：设置回调函数。

• AW_MPI_VI_GetIspDev：获取ISP 设备。

• AW_MPI_VI_SetCrop：设置VIPP crop 区域。

• AW_MPI_VI_GetCrop：获取VIPP crop 区域。

#### 3.5.1 AW_MPI_VI_CreateVipp

【描述】

创建一个VIPP 设备。

【语法】

```
AW_S32 AW_MPI_VI_CreateVipp(VI_DEV ViDev);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

VI 所需系统资源（Источник данных类型、接口、数据位宽、时序、场、输入/输出格式PIN、CLK）配置完成，系统启动后才会形成/dev/videoX 节点，此处针对节点进行初

始化操作。

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.2 AW_MPI_VI_DestroyVipp

【描述】

销毁VIPP 物理设备。

【语法】

```
AW_S32 AW_MPI_VI_DestroyVipp(VI_DEV ViDev);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

该函数会关闭/dev/videoX 设备节点，并销毁AW_MPI_VI_CreateVipp 函数申请的所有的资源。

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.3 AW_MPI_VI_SetVippAttr

【描述】

设置VIPP 物理设备属性。

【语法】

```
AW_S32 AW_MPI_VI_SetVippAttr(VI_DEV ViDev, VI_ATTR_S *pstAttr);
```

【参数】

| 参数                   | 描述                                         |
| ---------------------- | -------------------------------------------- |
| VI_DEV ViDev           | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| VI_DEV_ATTR_S *pstAttr | VIPP设备属性，静态属性。                     |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

VIPP 设备创建成功后， 需要设置format 格式、buf 数量、nbufs 个数、memtype、nplanes、type。参见VI_ATTR_S 结构体描述。

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.4 AW_MPI_VI_GetVippAttr

【描述】

获取VIPP 物理设备属性。

【语法】

```
AW_S32 AW_MPI_VI_GetVippAttr(VI_DEV ViDev, VI_ATTR_S *pstAttr);
```

【参数】

| 参数                   | 描述                                         |
| ---------------------- | -------------------------------------------- |
| VI_DEV ViDev           | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| VI_DEV_ATTR_S *pstAttr | VIPP设备属性，动态属性。                     |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

获取format 格式、buf 数量、nbufs 个数、memtype、nplanes、type 等。

【举例】

sample_virvi2vo

#### 3.5.5 AW_MPI_VI_SetVippFlip

【描述】

设置vipp 翻转。

【语法】

```
AW_S32 AW_MPI_VI_SetVippFlip(VI_DEV ViDev, int Value);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| Value | 翻转标志（0：不翻转；1：翻转），动态属性。   |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

设置的Value 值（0：不翻转；1：翻转），这里说的翻转指的是垂直方向的翻转。该函数与AW_MPI_ISP_SetFlip 函数的作用是一样的。

【举例】

```
sample_virvi2vo
sample_vi_reset
sample_virvi2eis2venc
```

#### 3.5.6 AW_MPI_VI_GetVippFlip

【描述】

获取vipp 的翻转标志。

【语法】

```
AW_S32 AW_MPI_VI_GetVippFlip(VI_DEV ViDev, int *Value);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| Value | 翻转标志，动态属性。                         |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

获取到的Value 值（0：不翻转；1：翻转），这里说的翻转指的是垂直方向的翻转。该函数与
AW_MPI_ISP_GetFlip 函数的作用是一样的。
【举例】
无

#### 3.5.7 AW_MPI_VI_SetVippMirror

【描述】

设置vipp 的图像水平镜像。

【语法】

```
AW_S32 AW_MPI_VI_SetVippMirror(VI_DEV ViDev, int Value);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| Value | 镜像标志（0：不镜像，1：镜像），静态属性。   |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

设置的Value 值（0：不镜像；1：镜像），这里说的镜像指的是水平方向的翻转。该函数与AW_MPI_ISP_SetMirror 函数的作用是一样的。

【举例】

```
sample_virvi2vo
sample_vi_reset
sample_virvi2eis2venc
```

#### 3.5.8 AW_MPI_VI_GetVippMirror

【描述】

获取vipp 的水平镜像标志。

【语法】

```
AW_S32 AW_MPI_VI_GetVippMirror(VI_DEV ViDev, int *Value);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| Value | 镜像标志，动态属性。                         |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

获取到的Value 值（0：不镜像；1：镜像），这里说的镜像指的是水平方向的翻转。该函数与AW_MPI_ISP_GetMirror 函数的作用是一样的。

【举例】

无

#### 3.5.9 AW_MPI_VI_EnableVipp

【描述】

启用VIPP 物理设备。

【语法】

AW_S32 AW_MPI_VI_EnableVipp(VI_DEV ViDev);

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

该函数作用是申请buffer，将所有申请到的buffer 放入队列，然后开启数据流，创建数据捕获线程。

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.10 AW_MPI_VI_DisableVipp

【描述】

禁用VIPP 物理设备。

【语法】

```
AW_S32 AW_MPI_VI_DisableVipp(VI_DEV ViDev);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

该函数会停止数据流，释放掉所有申请到的buffer。

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.11 AW_MPI_VI_CreateVirChn

【描述】

基于某个VIPP，创建虚拟通道。

【语法】

```
AW_S32 AW_MPI_VI_CreateVirChn(VI_DEV ViDev, VI_CHN ViCh, ViVirChnAttrS *pAttr);
```

【参数】

| 参数                 | 描述                                       |
| -------------------- | ------------------------------------------ |
| AW_DEV ViDev         | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX] |
| VI_CHN ViCh          | VIR虚拟通道号，取值范围：[0, 3]            |
| ViVirChnAttrS *pAttr | VIR 虚拟通道的属性，静态属性。             |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

保证VIPP 创建后，再进行AW_MPI_VI_CreateVirChn 操作。

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.12 AW_MPI_VI_DestroyVirChn

【描述】

销毁指定VIPP 设备的指定虚拟通道。

【语法】

```
AW_S32 AW_MPI_VI_DestroyVirChn(VI_DEV ViDev, VI_CHN ViCh);
```

【参数】

| 参数  | 描述                                         |
| ----- | -------------------------------------------- |
| ViDev | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| ViCh  | VIR虚拟通道号，取值范围：[0, 3]。            |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无
【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.13 AW_MPI_VI_SetVirChnAttr

【描述】

设置虚拟通道属性。

【语法】

```
AW_S32 AW_MPI_VI_SetVirChnAttr(VI_DEV ViDev, VI_CHN ViCh, ViVirChnAttrS *pAttr);
```

【参数】

| 参数                 | 描述                                         |
| -------------------- | -------------------------------------------- |
| AW_DEV ViDev         | VIPP设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| VI_CHN ViCh          | VIR虚拟通道号，取值范围：[0, 3]。            |
| ViVirChnAttrS *pAttr | VIR 虚拟通道的属性，静态属性。               |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

```
sample_virvi
sample_vi_reset
sample_virvi2venc
```

#### 3.5.14 AW_MPI_VI_GetVirChnAttr

【描述】

获取虚拟通道属性。

【语法】

```
AW_S32 AW_MPI_VI_GetVirChnAttr(VI_DEV ViDev, VI_CHN ViCh, ViVirChnAttrS *pAttr);
```

【参数】

| 参数                 | 描述                                          |
| -------------------- | --------------------------------------------- |
| AW_DEV ViDev         | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| VI_CHN ViCh          | VIR 虚拟通道号，取值范围：[0, 3]。            |
| ViVirChnAttrS *pAttr | VIR 虚拟通道的属性，动态属性。                |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

无

#### 3.5.15 AW_MPI_VI_EnableVirChn

【描述】

启用虚拟通道。
【语法】

```
AW_S32 AW_MPI_VI_EnableVirChn(VI_DEV ViDev, VI_CHN ViCh);
```

【参数】

| 参数  | 描述                                          |
| ----- | --------------------------------------------- |
| ViDev | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| ViCh  | VIR 虚拟通道号，取值范围：[0, 3]。            |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.16 AW_MPI_VI_DisableVirChn

【描述】

禁用虚拟通道。

【语法】

```
AW_S32 AW_MPI_VI_DisableVirChn(VI_DEV ViDev, VI_CHN ViCh);
```

【参数】

| 参数  | 描述                                          |
| ----- | --------------------------------------------- |
| ViDev | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| ViCh  | VIR 虚拟通道号，取值范围：[0, 3]。            |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

```
sample_virvi
sample_virvi2vo
sample_virvi2venc
sample_virvi2venc2muxer
```

#### 3.5.17 AW_MPI_VI_GetFrame

【描述】

获取VI 设备一帧图像， 属性包括width、height、field、pixelformat、timestamp、index、VirAddr、mem_phy、size 等。

【语法】

```
AW_S32 AW_MPI_VI_GetFrame(VI_DEV ViDev, VI_CHN ViCh, VIDEO_FRAME_INFO_S *pstFrameInfo,AW_S32 s32MilliSec);
```

【参数】

| 参数         | 描述                                          |
| ------------ | --------------------------------------------- |
| ViDev        | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| ViCh         | VIR 虚拟通道号，取值范围：[0, 3]。            |
| pstFrameInfo | 视频图像帧信息。                              |
| s32MilliSec  | Timeout超时时间设置，单位：毫秒，动态属性。   |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

该函数仅用于非绑定模式，且必须与函数AW_MPI_VI_ReleaseFrame() 配对使用。

若超过s32MilliSec 设置的时间值且还没有获取到帧数据时，函数就会返回。

【举例】

```
sample_virvi
sample_vi_reset
sample_multi_vi2venc2muxer
```

#### 3.5.18 AW_MPI_VI_ReleaseFrame

【描述】

释放VI 设备图像内存资源。

【语法】

```
AW_S32 AW_MPI_VI_ReleaseFrame(VI_DEV ViDev, VI_CHN ViCh, VIDEO_FRAME_INFO_S *pstFrameInfo);
```

【参数】

| 参数         | 描述                                          |
| ------------ | --------------------------------------------- |
| ViDev        | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| ViCh         | VIR 虚拟通道号，取值范围：[0, 3]。            |
| pstFrameInfo | 视频图像帧信息。                              |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

该函数仅用于非绑定模式，且必须与函数AW_MPI_VI_GetFrame() 配对使用。

【举例】

```
sample_virvi
sample_vi_reset
sample_multi_vi2venc2muxer
```

#### 3.5.19 AW_MPI_VI_SetShutterTime

【描述】

设置长曝光时间参数。

【语法】

```
AW_S32 AW_MPI_VI_SetShutterTime(VI_DEV ViDev, VI_CHN ViChnMask, VI_SHUTTIME_CFG_S *pTime);
```

【参数】

| 参数      | 描述                                                 |
| --------- | ---------------------------------------------------- |
| ViDev     | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。        |
| ViChnMask | 指定要抓取长曝光图片的VIR 虚通道，取值范围：[0, 3]。 |
| pTime     | 长曝光参数。                                         |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

无

#### 3.5.20 AW_MPI_VI_SetVIFreq

【描述】

设置VIPP 物理设备的运行频率。

【语法】

```
AW_S32 AW_MPI_VI_SetVIFreq(VI_DEV ViDev, int nFreq);
```

【参数】

| 参数  | 描述                                          |
| ----- | --------------------------------------------- |
| ViDev | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| nFreq | 频率值，单位：Hz，静态属性。                  |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

默认432MHz。

【举例】

无

#### 3.5.21 AW_MPI_VI_GetIspDev

【描述】

根据VIPP 设备号获取对于的ISP 设备号。

【语法】

```
ERRORTYPE AW_MPI_VI_GetIspDev(VI_DEV ViDev, ISP_DEV *pIspDev);
```

【参数】

| 参数    | 描述                                          |
| ------- | --------------------------------------------- |
| ViDev   | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| pIspDev | ISP 设备号。                                  |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

```
sample_OnlineVenc
```



#### 3.5.22 AW_MPI_VI_SetCrop

【描述】

设置VIPP crop 区域。

【语法】

```
ERRORTYPE AW_MPI_VI_SetCrop(VI_DEV ViDev, const VI_CROP_CFG_S *pCropCfg);
```

【参数】

| 参数     | 描述                                          |
| -------- | --------------------------------------------- |
| ViDev    | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| pCropCfg | 裁剪区域。                                    |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

无

【举例】

```
sample_OnlineVenc
```

#### 3.5.23 AW_MPI_VI_GetCrop

【描述】

获取VIPP crop 区域。

【语法】

```
ERRORTYPE AW_MPI_VI_GetCrop(VI_DEV ViDev, VI_CROP_CFG_S *pCropCfg);
```

【参数】

| 参数     | 描述                                          |
| -------- | --------------------------------------------- |
| ViDev    | VIPP 设备号，取值范围：[0, VI_VIPP_NUM_MAX]。 |
| pCropCfg | 裁剪区域。                                    |

【返回值】

| 返回值  | 描述                                |
| ------- | ----------------------------------- |
| SUCCESS | 成功                                |
| 错误码  | 参考mm_common_vi.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vi.h
库文件：libmpp_vi.so
```

【注意】

【举例】

```
sample_OnlineVenc
```

### 3.6 数据结构

#### 3.6.1 VI_ATTR_S

【说明】

VI 输入设备接口属性。

【定义】

```
typedef struct awVI_ATTR_S {
    enum v4l2_buf_type type;
    enum v4l2_memory memtype;
    struct v4l2_pix_format_mplane format;
    unsigned int nbufs;
    unsigned int nplanes;
    unsigned int fps;
    unsigned int capturemode; //V4L2_MODE_VIDEO
    unsigned int use_current_win; //0:config ISP param again; 1:use current ISP param
    unsigned int wdr_mode;
    unsigned int drop_frame_num; // drop frames number after enable vipp device(default 0).
    unsigned char mOnlineEnable; /* 1: online, 0: offline.*/
    enum dma_buffer_num mOnlineShareBufNum; /* only for online. Number of share buffers of
    CSI and VE, support 1/2.*/
} VI_ATTR_S;
```

【成员】

| 成员名称           | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| type               | 默认值：V4L2_BUF_TYPE_VIDEO_CAPTURE_MPLANE。<br/>采集数据方式，不能修改。 |
| memtype            | 默认值：V4L2_MEMORY_MMAP。采集数据内存使用<br/>方式，不建议修改。 |
| format             | 参考struct v4l2_pix_format_mplane。                          |
| nbufs              | 默认值：5。YUV/RAW 内存节点缓冲个数。                        |
| nplanes            | plane 个数，属于返回值，不设置。                             |
| fps                | 默认值：25。设置Sensor 的帧率。                              |
| capturemode        | 默认值：V4L2_MODE_VIDEO。<br/>其他值：V4L2_MODE_VIDEO、V4L2_MODE_IMAGE、 V4L2_MODE_PREVIEW。 |
| use_current_win    | 默认值：0。<br/>0：表示不管之前有没有设置过分辨率，都重新找<br/>当前设置分辨率最近的分辨率；<br/>1：表示使用之前设置过的分辨率。注意：0 相当于<br/>从新设置sensor 输出的分辨率，1 相当于sensor<br/>在有输出的情况下，使用后端VIPP 做视频缩小<br/>处理，出不同规格的分辨率。 |
| wdr_mode           | 默认值：0。<br/>0：normal；1: DOL；2: Sensor Commanding。    |
| drop_frame_num     | 默认值：0。丢帧计数。                                        |
| mOnlineEnable      | 默认值：0。开启/关闭在线模式。                               |
| mOnlineShareBufNum | 默认值：1。在线模式下，CSI 与VE 的共享buffer<br/>个数。支持配置1、2。 |

【注意事项】

无

【相关数据类型及接口】

```
enum v4l2_field {
V4L2_FIELD_ANY = 0, /* driver can choose from none,
top, bottom, interlaced
depending on whatever it thinks
is approximate ... */
V4L2_FIELD_NONE = 1, /* this device has no fields ... */
V4L2_FIELD_TOP = 2, /* top field only */
V4L2_FIELD_BOTTOM = 3, /* bottom field only */
V4L2_FIELD_INTERLACED = 4, /* both fields interlaced */
V4L2_FIELD_SEQ_TB = 5, /* both fields sequential into one
buffer, top-bottom order */
V4L2_FIELD_SEQ_BT = 6, /* same as above + bottom-top order */
V4L2_FIELD_ALTERNATE = 7, /* both fields alternating into
separate buffers */
V4L2_FIELD_INTERLACED_TB = 8, /* both fields interlaced, top field
first and the top field is
transmitted first */
V4L2_FIELD_INTERLACED_BT = 9, /* both fields interlaced, top field
first and the bottom field is
transmitted first */
};
#define V4L2_FIELD_HAS_TOP(field) \
((field) == V4L2_FIELD_TOP ||\
(field) == V4L2_FIELD_INTERLACED ||\
(field) == V4L2_FIELD_INTERLACED_TB ||\
(field) == V4L2_FIELD_INTERLACED_BT ||\
(field) == V4L2_FIELD_SEQ_TB ||\
(field) == V4L2_FIELD_SEQ_BT)
#define V4L2_FIELD_HAS_BOTTOM(field) \
((field) == V4L2_FIELD_BOTTOM ||\
(field) == V4L2_FIELD_INTERLACED ||\
(field) == V4L2_FIELD_INTERLACED_TB ||\
(field) == V4L2_FIELD_INTERLACED_BT ||\
(field) == V4L2_FIELD_SEQ_TB ||\
(field) == V4L2_FIELD_SEQ_BT)
#define V4L2_FIELD_HAS_BOTH(field) \
((field) == V4L2_FIELD_INTERLACED ||\
(field) == V4L2_FIELD_INTERLACED_TB ||\
(field) == V4L2_FIELD_INTERLACED_BT ||\
(field) == V4L2_FIELD_SEQ_TB ||\
(field) == V4L2_FIELD_SEQ_BT)
enum v4l2_buf_type {
V4L2_BUF_TYPE_VIDEO_CAPTURE = 1,
V4L2_BUF_TYPE_VIDEO_OUTPUT = 2,
V4L2_BUF_TYPE_VIDEO_OVERLAY = 3,
V4L2_BUF_TYPE_VBI_CAPTURE = 4,
V4L2_BUF_TYPE_VBI_OUTPUT = 5,
V4L2_BUF_TYPE_SLICED_VBI_CAPTURE = 6,
V4L2_BUF_TYPE_SLICED_VBI_OUTPUT = 7,
/* Experimental */
V4L2_BUF_TYPE_VIDEO_OUTPUT_OVERLAY = 8,
V4L2_BUF_TYPE_VIDEO_CAPTURE_MPLANE = 9,
V4L2_BUF_TYPE_VIDEO_OUTPUT_MPLANE = 10,
/* Deprecated, do not use */
V4L2_BUF_TYPE_PRIVATE = 0x80,
};
enum v4l2_memory {
V4L2_MEMORY_MMAP = 1,
V4L2_MEMORY_USERPTR = 2,
V4L2_MEMORY_OVERLAY = 3,
V4L2_MEMORY_DMABUF = 4,
};
/**
* struct v4l2_pix_format_mplane - multiplanar format definition
* @width: image width in pixels
* @height: image height in pixels
* @pixelformat: little endian four character code (fourcc)
* @field: enum v4l2_field; field order (for interlaced video)
* @colorspace: enum v4l2_colorspace; supplemental to pixelformat
* @plane_fmt: per-plane information
* @num_planes: number of planes for this format
*/
struct v4l2_pix_format_mplane {
__u32 width;
__u32 height;
__u32 pixelformat;
__u32 field;
__u32 colorspace;
struct v4l2_plane_pix_format plane_fmt[VIDEO_MAX_PLANES];
__u8 num_planes;
__u8 reserved[11];
} __attribute__ ((packed));
```

#### 3.6.2 VIDEO_FRAME_INFO_S

【说明】

VI 视频帧信息。

【定义】

```
typedef struct VIDEO_FRAME_INFO_S
{
VIDEO_FRAME_S VFrame;
unsigned int mId; //id identify frame uniquely
} VIDEO_FRAME_INFO_S;
```

【成员】

| 成员名称 | 描述                   |
| -------- | ---------------------- |
| VFrame   | Buf 数据信息结构属性。 |
| mId      | Buf 唯一ID 号。        |

【注意事项】

无

【相关数据类型及接口】

```
typedef struct VIDEO_FRAME_S
{
unsigned int mWidth;
unsigned int mHeight;
VIDEO_FIELD_E mField;
PIXEL_FORMAT_E mPixelFormat;
VIDEO_FORMAT_E mVideoFormat;
COMPRESS_MODE_E mCompressMode;
unsigned int mPhyAddr[3];/* Y, U, V; Y, UV; Y, VU */
void* mpVirAddr[3];
unsigned int mStride[3];
unsigned int mHeaderPhyAddr[3];
void* mpHeaderVirAddr[3];
unsigned int mHeaderStride[3];
short mOffsetTop; /* top offset of show area */
short mOffsetBottom; /* bottom offset of show area */
short mOffsetLeft; /* left offset of show area */
short mOffsetRight; /* right offset of show area */
uint64_t mpts; /* unit:us */
unsigned int mExposureTime; /* every frame exp time */
unsigned int mFramecnt; /* rename mPrivateData to Framecnt_exp_start */
int mEnvLV; /* environment luminance value */
int mEnvLVAdj; /* environment luminance value Adj? */
/* for frame specific informations.
*e.g. this is a Long-Exposure frame, you can set mFrmFlag = (exp_time)<<16 | FF_LONGEXP
.
*e.g. somtimes, frame lost in kernel because of return time delay, then you can set
* mFrmFlag = (lost_num)<<16 | FF_FRAME_LOST; and maybe Venc can insert empty frames.
*/
unsigned int mWhoSetFlag; /* reserve(8bit)|COMP_TYPE(8bit)|DEV_NUM(8bit)|CHN_NUM(8
bit) */
uint64_t mFlagPts; /* when generate this flag, unit(us) */
/* whats this flag, data(16bit)|flag(16bit), if you want a signed data, please use
short data type */
unsigned int mFrmFlag;
} VIDEO_FRAME_S;
typedef enum VIDEO_FIELD_E
{
VIDEO_FIELD_TOP = 0x1, /* even field */
VIDEO_FIELD_BOTTOM = 0x2, /* odd field */
VIDEO_FIELD_INTERLACED = 0x3, /* two interlaced fields */
VIDEO_FIELD_FRAME = 0x4, /* frame */
VIDEO_FIELD_BUTT
} VIDEO_FIELD_E;
typedef enum VIDEO_FORMAT_E
{
VIDEO_FORMAT_LINEAR = 0x0, /* nature video line */
VIDEO_FORMAT_TILE = 0x1, /* tile cell: 256pixel x 16line, default tile mode
*/
VIDEO_FORMAT_TILE64 = 0x2, /* tile cell: 64pixel x 16line */
VIDEO_FORMAT_BUTT
} VIDEO_FORMAT_E;
typedef enum COMPRESS_MODE_E
{
COMPRESS_MODE_NONE = 0x0, /* no compress */
COMPRESS_MODE_SEG = 0x1, /* compress unit is 256 bytes as a segment, default
seg mode */
COMPRESS_MODE_SEG128 = 0x2, /* compress unit is 128 bytes as a segment */
COMPRESS_MODE_LINE = 0x3, /* compress unit is the whole line */
COMPRESS_MODE_FRAME = 0x4, /* compress unit is the whole frame */
COMPRESS_MODE_BUTT
} COMPRESS_MODE_E;
```

#### 3.6.3 ViVirChnAttrS

【说明】

VI 虚拟通道属性。

【定义】

```
typedef struct {
    BOOL mbRecvInIdleState; //receive input frames in idle, executing, pause state.
    int mCacheFrameNum; //max frame number cached in virChn. 0: not cache, >0:cache number.
} ViVirChnAttrS;
```

【成员】

| 成员名称          | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| mbRecvInIdleState | VIRVI 组件在IDLE 状态下接收输入帧标记，其他状态设置无效。TRUE：接收；FALSE：不接收。 |
| mCacheFrameNum    | 虚拟通道中缓存的帧数最大值。0：不缓存；大于0：缓存的帧数。   |

【注意事项】

无

【相关数据类型及接口】

无

#### 3.6.4 VI_SHUTTIME_CFG_S

【说明】

VI 视频曝光时间参数配置。

【定义】

```
/*
* vi shutter time configuration
*@iTime: frame interval:[1/500S]->[iTime=500] [1/125S]->[iTime=125]
* [1S]->[iTime=-1] [5S]->[iTime=-5]
*@iExpValue: not use until now
*@iGainValue: not use until now
*@bResetAuto: if this value is set, user needn't care auto resume the shutter time.
*@iShutterMode:
* [VI_SHUTTIME_MODE_AUTO]: auto shutter(30fps,auto exp_abs)
* [VI_SHUTTIME_MODE_PREVIEW]: preview mode(fps>=30)
* [VI_SHUTTIME_MODE_NIGHT_VIEW]: night view mode(fps<30)
*/
typedef struct awVI_SHUTTIME_CFG_S {
int iTime;
int iExpValue;
int iGainValue;
VI_SHUTTIME_RESET_E eResetMode;
VI_SHUTTIME_MODE_E eShutterMode;
} VI_SHUTTIME_CFG_S;
```

【成员】

| 成员名称     | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| iTime        | 曝光时间。frame interval：[1/500S]->[iTime=500]，<br/>[1/125S]->[iTime=125]，[1S]->[iTime=-1]，[5S]->[iTime=-5]。 |
| iExpValue    | UNUSED。                                                     |
| iGainValue   | UNUSED。                                                     |
| eResetMode   | 曝光重置方式。                                               |
| eShutterMode | 曝光模式。                                                   |

【注意事项】

无

【相关数据类型及接口】

```
/*
* shut time mode enum
*/
typedef enum awVI_SHUTTIME_MODE_E {
VI_SHUTTIME_MODE_AUTO = 0, /* fix fps to last current normal value */
VI_SHUTTIME_MODE_PREVIEW, /* same fps than AUTO, but has smaller exposure time */
VI_SHUTTIME_MODE_NIGHT_VIEW, /* more than 1S time interval */
} VI_SHUTTIME_MODE_E;
/*
*@VI_SHUTTIME_RESET_MANUAL: user should reset the exposure time into normal. do not use it
now.
*@VI_SHUTTIME_RESET_AUTO_NOW: user don't care reset action, someone else will do it.
* reset action will be executed immediately after long exposure was set. sensor like
imx317
*@VI_SHUTTIME_RESET_AUTO_DELAY: same as the previous one, but reset action will be
* executed after get the long exposure video frame. adapt sensor like imx278
*/
typedef enum awVI_SHUTTIME_RESET_E {
VI_SHUTTIME_RESET_AUTO_DELAY = 0,
VI_SHUTTIME_RESET_AUTO_NOW,
} VI_SHUTTIME_RESET_E;
```

### 3.7 错误码

| 错误码     | 宏定义                            | 描述                       |
| ---------- | --------------------------------- | -------------------------- |
| 0xA0108002 | ERR_VI_INVALID_CHNID              | 无效的VI 通道号            |
| 0xA0108003 | ERR_VI_INVALID_PARA               | 无效的参数                 |
| 0xA0108006 | ERR_VI_INVALID_NULL_PTR           | 空指针                     |
| 0xA0108007 | ERR_VI_FAILED_NOTCONFIG           | 模块未配置                 |
| 0xA0108008 | ERR_VI_NOT_SUPPORT                | 设备不支持                 |
| 0xA0108009 | ERR_VI_NOT_PERM                   | 不允许                     |
| 0xA0108001 | ERR_VI_INVALID_DEVID              | 无效的VI 设备号            |
| 0xA010800C | ERR_VI_NOMEM                      | 无可用的内存               |
| 0xA010800E | ERR_VI_BUF_EMPTY                  | 数据缓冲区为空             |
| 0xA010800F | ERR_VI_BUF_FULL                   | 数据缓冲区为满             |
| 0xA0108010 | ERR_VI_SYS_NOTREADY               | 系统还未准备好             |
| 0xA0108012 | ERR_VI_BUSY                       | VI 设备正忙                |
| 0xA0108041 | ERR_VI_FAILED_NOTENABLE           | 设备未使能                 |
| 0xA0108042 | ERR_VI_FAILED_NOTDISABLE          | 设备未禁止（处于使能状态） |
| 0xA0108040 | ERR_VI_CFG_TIMEOUT                | 配置超时                   |
| 0xA0108043 | ERR_VI_NORM_UNMATCH               | 不匹配                     |
| 0xA0108044 | ERR_VI_INVALID_PHYCHNID           | 无效的物理通道             |
| 0xA0108045 | ERR_VI_FAILED_NOTBIND             | 设备未绑定                 |
| 0xA0108046 | ERR_VI_FAILED_BINDED              | 设备已经绑定               |
| 0xA0108047 | ERR_VI_UNEXIST                    | VI 设备不存在              |
| 0xA0108048 | ERR_VI_EXIST                      | VI 设备已经存在            |
| 0xA0108014 | ERR_VI_SAMESTATE                  | 状态相同（常见于状态转换） |
| 0xA0108015 | ERR_VI_INVALIDSTATE               | 无效的状态                 |
| 0xA0108016 | ERR_VI_INCORRECT_STATE_TRANSITION | 不正确的状态转换           |
| 0xA0108017 | ERR_VI_INCORRECT_STATE_OPERATION  | 不正确的状态操作           |

## 4 视频输出

### 4.1 概述

#### 4.1.1 文档目的

介绍VO 模块的使用方式，以供开发人员可以快速根据本文档进行基于VO 模块的开发。

#### 4.1.2 VO 简介

VO 模块主要处理与视频输出显示相关的功能，主要功能如下：
• 支持linux 标准的framebuffer 接口
• 支持lcd(hv/lvds/cpu/dsi) 输出
• 支持多图层叠加混合处理
• 支持多种显示效果处理（alpha, colorkey, 图像增强，亮度/对比度/饱和度/色度调整）
• 支持智能背光调节
• 支持多种图像数据格式输入(argb,yuv)
• 支持图像缩放处理
• 支持截屏
• 支持图像转换

### 4.2 图层

#### 4.2.1 图层操作说明

显示中最重要的资源是图层，VO 中支持1 路显示设备，第0 路显示设备支持3 个显示通道，通道0，1 为视频图层通道，通道2 为UI 图层通道。每个显示通道包含4 个图层。通道0，1 的图层都支持缩放，通道2 的图层不支持缩放。图层由disp、channel、layer_id 三个索引唯一确定（disp:0/1,channel:0/1/2/3layer_id:0/1/2/3)。

需要注意的是channel 0,1 通道下对应layer_id 为0 ~ 3 时，索引到的图层是支持YUV 格式图像数据的；在channel2 通道下对应layer_id 为0 ~ 3 时，索引到的图层不支持YUV 格式，而是RGB 格式，示意图如下：

![image-20230104105739623](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104105739623.png)

<center>图4-1: 图层示意图</center>

正常情况下，使用0 路显示设备（本系统默认使用第0 路显示设备）就可以满足用户需求。用户可以选择disp：0 的某个通道对应的图层来播放视频，或者选择另外一个图层显示UI，不同图层之间可以设置优先级、alpha 等参数，进行叠加显示。对于内核来说，12 个Layer 可以看作从0~11 线性排布的（由channel*4+layer_id 计算得到，默认disp 为0），其中第0 ~ 7 个是视频图层，第8 ~ 11 个是UI 图层，视频图层的0 ~3、4 ~ 7 图层的属性需要分别保持一致。

只有channel0, 1, 2 三个通道。
• 设置图层参数并使能：接口为AW_MPI_VO_SetVideoLayerAttr 和AW_MPI_VO_EnableVideoLayer。
• 释放图层：接口AW_MPI_VO_DisableVideoLayer，参数为需要释放的图层号。
• 打开/关闭图层：接口为AW_MPI_VO_OpenVideoLayer / AW_MPI_VO_CloseVideoLayer。

#### 4.2.2 显示输出设备操作说明

VO 支持LCD 显示输出设备。开启显示输出设备有几种方式，第一种是在sys_config.fex 中配置[disp] 的初始化参数，显示模块在加载时将会根据配置来初始化选择的显示输出设备；第二种是在kernel 启动后，调用VO 模块的API 接口去开启或关闭指定的输出设备，以下是操作的说明：切换到某个具体的显示输出设备：接口是AW_MPI_VO_SetPubAttr，参数是一个VO_PUB_ATTR_S类型的结构体，其中第二个参数enIntfType 参数用来指定显示设

备。

#### 4.2.3 图层size 与crop

图层Frame Buffer 有两个与size 有关的参数，分别是size 与crop。Size 表示buffer 的完整尺寸，crop 则表示buffer 中需要显示裁减区。如下图所示，完整的图像以size 标识，而矩形框住的部分为裁减区，以crop 标识，在屏幕上只能看到crop 标识的部分，其余部分是隐藏的，不能在屏幕上显示出来。

![image-20230104110131749](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104110131749.png)

<center>图4-2: 图层size 与crop 示意图</center>

#### 4.2.4 图层crop 和screen_win

Screen_win 为crop 部分buffer 在屏幕上显示的位置。如果不需要进行缩放的话，crop 和screen_win 的width,height 是相等的，如果需要缩放，需要用scaler_mode 的图层来显示，crop 和screen_win 的width,height 可以不等。

![image-20230104110202419](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104110202419.png)

<center>图4-3: 图层crop 和screen_win 示意图</center>

#### 4.2.5 Alpha

Alpha 模式有三种:
• Gloabal alpha：全局alpha, 也叫面alpha，即整个图层共用一个alpha，统一的透明度
• Pixel alpha：点alpha，即每个像素都有自己单独的alpha，可以实现部分区域全透，部分区域半透，部分区域不透的效果
• Global_pixel alpha：可以是说以上两种效果的叠加，在实现pixel alpha 的效果的同时，还可以做到淡入淡出的效果。

![image-20230104110258069](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104110258069.png)

<center>图4-4: Alpha blending 示意图</center>

### 4.3 输出设备介绍

• VO 支持屏、HDMI 以及cvbs 等输出
• 屏的接口有很多类型，该平台支持RGB/CPU/LVDS/DSI 接口。

### 4.4 模块状态转换

![image-20230104110342586](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104110342586.png)

<center>图4-5: VO 模块状态转换图</center>

各种状态的定义如下所示：
• COMP_StateIdle ：有资源，不传输数据。
• COMP_StateExecuting ：有资源，传输数据，处理数据。
• COMP_StatePause ：有资源，传输数据，不处理数据。
• COMP_StateLoaded ：无资源。
• COMP_StateInvalid ：非法状态。

### 4.5 API 接口

VO 目前对外支持的API 接口：
• AW_MPI_VO_Enable ：使能指定的VO 设备。
• AW_MPI_VO_Disable ：禁用指定的VO 设备。
• AW_MPI_VO_SetPubAttr ：设置VO 设备的属性。
• AW_MPI_VO_GetPubAttr ：获取VO 设备的属性。
• AW_MPI_VO_GetHdmiHwMode ：获取接入的Hdmi 设备显示分辨率信息。
• AW_MPI_VO_SetFrameDisplayRegion ：设置VO 显示区域。
• AW_MPI_VO_GetFrameDisplayRegion ：获取VO 显示区域。
• AW_MPI_VO_EnableVideoLayer ：申请并使能一个图层，将该图层信息结构体加入到全局链表里面。
• AW_MPI_VO_DisableVideoLayer ：释放指定的图层，从全局链表里面移除该图层信息结构体。
• AW_MPI_VO_AddOutsideVideoLayer ：添加一个外部图层（专门用于GUI）。
• AW_MPI_VO_RemoveOutsideVideoLayer ：移除外部图层（专门用于GUI）。
• AW_MPI_VO_OpenVideoLayer ：打开一个指定的图层。
• AW_MPI_VO_CloseVideoLayer ：关闭一个指定的图层。
• AW_MPI_VO_SetVideoLayerAttr ：设置指定图层的属性。
• AW_MPI_VO_GetVideoLayerAttr ：获取指定图层的属性。
• AW_MPI_VO_SetVideoLayerPriority ：设置指定图层的显示优先级。
• AW_MPI_VO_GetVideoLayerPriority ：获取指定图层的显示优先级。
• AW_MPI_VO_SetVideoLayerAlpha ：设置指定图层的alpha，可以理解为透明度。
• AW_MPI_VO_GetVideoLayerAlpha ：获取指定图层的alpha，包括alpha 模式以及其value。
• AW_MPI_VO_CreateChn ：为指定的VO 图层创建一个指定编号的VO 组件通道。
• AW_MPI_VO_DestroyChn ：销毁指定VO 图层指定编号的VO 通道。
• AW_MPI_VO_RegisterCallback ：为创建的VO 通道组件实例注册一个回调函数。
• AW_MPI_VO_SetChnDispBufNum ：设置VO 组件通道实例的缓存buf 数量。
• AW_MPI_VO_GetChnDispBufNum ：获取VO 组件通道实例的缓存buf 数量。
• AW_MPI_VO_GetDisplaySize ：获取VO 组件通道实例图层的显示数据（图层的显示宽、高）。
• AW_MPI_VO_StartChn ：通道开始工作，接收视频数据并送去显示。
• AW_MPI_VO_StopChn ：通道停止，停止数据传输。
• AW_MPI_VO_PauseChn ：通道暂停，停止显示。
• AW_MPI_VO_ResumeChn ：通道恢复，开始数据传输。
• AW_MPI_VO_Seek ：跳转播放。
• AW_MPI_VO_SetStreamEof ：根据参数标记视频流的结束。
• AW_MPI_VO_ShowChn ：通道图层显示（去隐藏化）。
• AW_MPI_VO_HideChn ：通道图层隐藏（不可见）。
• AW_MPI_VO_GetChnPts ：获取VO 组件通道实例视频播放的时间戳，单位us。
• AW_MPI_VO_SendFrame ：发送一帧视频数据送去显示。
• AW_MPI_VO_Debug_StoreFrame ：保存一帧视频数据，可用于截图。

#### 4.5.1 AW_MPI_VO_Enable

【描述】

使能指定的VO 设备，构造VODevInfo 结构体并加入全局链表。

【语法】

```
ERRORTYPE AW_MPI_VO_Enable(VO_DEV VoDev);
```

【参数】

| 参数描述                    | 输入输出 |
| --------------------------- | -------- |
| VoDev 需要使能的VO 设备编号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

在进行VO 相关操作之前应该首先调用此接口，保证相应的VO 设备被使能。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.2 AW_MPI_VO_Disable

【描述】

禁用指定的VO 设备，同时释放相关的资源。

【语法】

```
ERRORTYPE AW_MPI_VO_Disable(VO_DEV VoDev);
```

【参数】

| 参数描述                    | 输入输出 |
| --------------------------- | -------- |
| VoDev 需要禁用的VO 设备编号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该操作会将指定VO 设备结构体从全局链表中移除，该函数需要与AW_MPI_VO_Enable 配对使
用，在整个VO 模块使用完毕之后调用该函数进行相关资源的释放。
【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.3 AW_MPI_VO_SetPubAttr

【描述】

设置VO 显示设备的背景色，指定VO 设备的类型（HDMI、LCD 等），设置显示尺寸（720p、1080p 等）、频率。

【语法】

```
ERRORTYPE AW_MPI_VO_SetPubAttr(VO_DEV VoDev, const VO_PUB_ATTR_S *pstPubAttr);
```

【参数】

| 参数描述                     | 输入输出     |
| ---------------------------- | ------------ |
| VoDev 需要设置的VO 设备编号  | 输入         |
| pstPubAttr VO 设备属性结构体 | 输入（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

需要初始化pstPubAttr 的enIntfType（显示设备）与enIntfSync（分辨率以及刷新频率）成员。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.4 AW_MPI_VO_GetPubAttr

【描述】

获取VO 设备的背景色、显示设备类型、显示数据格式等信息。

【语法】

```
ERRORTYPE AW_MPI_VO_GetPubAttr(VO_DEV VoDev, const VO_PUB_ATTR_S *pstPubAttr);
```

【参数】

| 参数描述                        | 输入输出     |
| ------------------------------- | ------------ |
| VoDev 需要获取信息的VO 设备编号 | 输入         |
| pstPubAttr VO 设备属性结构体    | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.5 AW_MPI_VO_GetHdmiHwMode

【描述】

获取接入的Hdmi 设备显示分辨率信息

【语法】

```
ERRORTYPE AW_MPI_VO_GetHdmiHwMode(VO_DEV VoDev, VO_INTF_SYNC_E *mode);
```

【参数】

| 返回值 | 描述     | 输入输出         |
| ------ | -------- | ---------------- |
| VoDev  | VO       | 设备输入         |
| mode   | 设备信息 | 输出（动态属性） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数在没有HDMI 设备接入的时候会返回ERR_VO_DEV_NOT_CONFIG 错误码，如果Hdmi 设备的显示分辨率不被支持则会返回ERR_VO_NOT_SUPPORT 错误

码。

【举例】

无

#### 4.5.6 AW_MPI_VO_SetFrameDisplayRegion

【描述】

设置VO 显示区域。

【语法】

```
ERRORTYPE AW_MPI_VO_SetFrameDisplayRegion(VO_LAYER VoLayer, VO_CHN VoChn, const RECT_S *pRect);
```

【参数】

| 返回值  | 描述           | 输入输出 |
| ------- | -------------- | -------- |
| VoLayer | VO Layer。     | 输入     |
| VoChn   | VO 通道号。    | 输入     |
| pRect   | 显示区域信息。 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无
【举例】

```
sample_virvi2vo
```

#### 4.5.7 AW_MPI_VO_GetFrameDisplayRegion

【描述】

获取VO 显示区域。

【语法】

```
ERRORTYPE AW_MPI_VO_GetFrameDisplayRegion(VO_LAYER VoLayer, VO_CHN VoChn, RECT_S *pRect);
```

【参数】

| 返回值  | 描述           | 输入输出         |
| ------- | -------------- | ---------------- |
| VoLayer | VO Layer。     | 输入             |
| VoChn   | VO 通道号。    | 输入             |
| pRect   | 显示区域信息。 | 输出（动态属性） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无
【举例】

```
sample_virvi2vo
```

#### 4.5.8 AW_MPI_VO_EnableVideoLayer

【描述】

申请并使能一个图层，将该图层信息结构体加入到全局链表里面。

【语法】

```
ERRORTYPE AW_MPI_VO_EnableVideoLayer(VO_LAYER VoLayer);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

VoLayer 要依靠一个宏定义来得到，该宏定义为#define HLAY(chn, lyl) (chn*4+lyl)，其中chn 是VO 设备通道号（channel），lyl 是layer 的编号（layer_id）。

chn(0-3)，lyl(0-3)。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.9 AW_MPI_VO_DisableVideoLayer

【描述】

释放指定的图层，从全局链表里面移除该图层信息结构体。

【语法】

```
ERRORTYPE AW_MPI_VO_DisableVideoLayer(VO_LAYER VoLayer);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

VoLayer 要依靠一个宏定义来得到，该宏定义为#define HLAY(chn, lyl) (chn*4+lyl)，其中chn 是VO 设备通道号（channel），lyl 是layer 的编号（layer_id）。

chn(0-3)，lyl(0-3)。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.10 AW_MPI_VO_AddOutsideVideoLayer

【描述】

添加一个外部图层（专门用于GUI）。

【语法】

```
ERRORTYPE AW_MPI_VO_AddOutsideVideoLayer(VO_LAYER VoLayer);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数专门用于添加GUI 的界面图层（因为GUI 图层的申请不经过MPP_VO 这个模块，所以如果用AW_MPI_VO_EnableVideoLayer 的话可能会出现因图层重复被

申请而导致申请失败的情况，AW_MPI_VO_AddOutsideVideoLayer 函数没有图层申请这一步骤），特别注意：如果不是用于GUI 图层的话请使用函数

AW_MPI_VO_EnableVideoLayer 来完成图层的新建。

VoLayer 需要HLAY 宏定义来配合生成。
【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.11 AW_MPI_VO_RemoveOutsideVideoLayer

【描述】

移除外部图层（专门用于GUI）。

【语法】

```
ERRORTYPE AW_MPI_VO_RemoveOutsideVideoLayer(VO_LAYER VoLayer);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数专门用于移除GUI 的界面图层（因为GUI 图层的释放不经过MPP_VO 这个模块，如果用AW_MPI_VO_DisableVideoLayer 的话可能会出现别的程序正在使用

该图层，而该图层的资源被释放的情况），特别注意：如果不是用于GUI 图层的话请尽量使用函数AW_MPI_VO_DisableVideoLayer 来完成图层的移除。VoLayer 

需要HLAY 宏定义来配合生成。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.12 AW_MPI_VO_OpenVideoLayer

【描述】

打开一个指定的图层。

【语法】

```
ERRORTYPE AW_MPI_VO_OpenVideoLayer(VO_LAYER VoLayer);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

在调用完AW_MPI_VO_EnableVideoLayer 函数之后图层默认是被关闭的，如果需要在屏幕上显示出该图层，需要先调用该函数打开图层。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.13 AW_MPI_VO_CloseVideoLayer

【描述】

关闭一个指定的图层。

【语法】

```
ERRORTYPE AW_MPI_VO_CloseVideoLayer(VO_LAYER VoLayer);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

如果先调用函数AW_MPI_VO_DisableVideoLayer，再调用该函数可能会造成花屏现象，花屏持续的时间取决于两个函数的调用间隔，间隔时间越长，花屏时间就

越长。最好还是先调用该函数关闭图层，然后再Disable。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.14 AW_MPI_VO_SetVideoLayerAttr

【描述】

设置指定图层的属性。

【语法】

```
ERRORTYPE AW_MPI_VO_SetVideoLayerAttr(VO_LAYER VoLayer, const VO_VIDEO_LAYER_ATTR_S *pstLayerAttr);
```

【参数】

| 返回值       | 描述           | 输入输出     |
| ------------ | -------------- | ------------ |
| VoLayer      | 图层索引       | 输入         |
| pstLayerAttr | 图层属性结构体 | 输入（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

pstLayerAttr 的结构体类型是VO_VIDEO_LAYER_ATTR_S，里面包含显示区域、图片大小、图层像素格式等元素，但是本函数只对VO_VIDEO_LAYER_ATTR_S 的

stDispRect 成员生效，也就是说本函数只是用于设置图像显示的X、Y 坐标以及宽和高。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.15 AW_MPI_VO_GetVideoLayerAttr

【描述】

获取指定图层的属性。

【语法】

```
ERRORTYPE AW_MPI_VO_GetVideoLayerAttr(VO_LAYER VoLayer, const VO_VIDEO_LAYER_ATTR_S *pstLayerAttr);
```

【参数】

| 返回值       | 描述           | 输入输出     |
| ------------ | -------------- | ------------ |
| VoLayer      | 图层索引       | 输入         |
| pstLayerAttr | 图层属性结构体 | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无
【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.16 AW_MPI_VO_SetVideoLayerPriority

【描述】

设置指定图层的显示优先级。

【语法】

```
ERRORTYPE AW_MPI_VO_SetVideoLayerPriority(VO_LAYER VoLayer, unsigned int uPriority);
```

【参数】

| 返回值    | 描述     | 输入输出     |
| --------- | -------- | ------------ |
| VoLayer   | 图层索引 | 输入         |
| uPriority | 优先级   | 输入（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

显示的时候越靠近上层的图层其uPriority 值越大，所以优先级越高，相应的图层就越靠近顶层。uPriority 的取值范围是0~15，使用的时候注意不要超过此范围。

【举例】

无

#### 4.5.17 AW_MPI_VO_GetVideoLayerPriority

【描述】

获取指定图层的显示优先级。

【语法】

```
ERRORTYPE AW_MPI_VO_GetVideoLayerPriority(VO_LAYER VoLayer, unsigned int *puPriority);
```

【参数】

| 返回值    | 描述     | 输入输出     |
| --------- | -------- | ------------ |
| VoLayer   | 图层索引 | 输入         |
| uPriority | 优先级   | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无

【举例】

无

#### 4.5.18 AW_MPI_VO_SetVideoLayerAlpha

【描述】

设置指定图层的alpha，可以理解为透明度。

【语法】

```
ERRORTYPE AW_MPI_VO_SetVideoLayerAlpha(VO_LAYER, VO_VIDEO_LAYER_ALPHA_S *pAlpha);
```

【参数】

| 返回值  | 描述            | 输入输出     |
| ------- | --------------- | ------------ |
| VoLayer | 图层索引        | 输入         |
| pAlpha  | alpha信息结构体 | 输入（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

pAlpha 结构体有结构体成员mAlphaMode，为0 时是点alpha 模式，此时每个像素都有自己单独的alpha，可以实现部分区域全透，部分区域半透，部分区域不透

的效果；为1 时是面alpha 模式，整个图层共用一个alpha，统一的透明度。需要注意的是YUV 格式下并不支持使用alpha，所以该格式下函数调用会失败，只有

ARGB 等带有alpha 模式的的图像才可以使用。

【举例】

无

#### 4.5.19 AW_MPI_VO_GetVideoLayerAlpha

【描述】

获取指定图层的alpha，包括alpha 模式以及其value

【语法】

```
ERRORTYPE AW_MPI_VO_GetVideoLayerAlpha(VO_LAYER, VO_VIDEO_LAYER_ALPHA_S *pAlpha);
```

【参数】

| 返回值  | 描述             | 输入输出     |
| ------- | ---------------- | ------------ |
| VoLayer | 图层索引         | 输入         |
| pAlpha  | alpha 信息结构体 | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无

【举例】

无

#### 4.5.20 AW_MPI_VO_CreateChn

【描述】

为指定的VO 图层创建一个指定编号的VO 组件通道。

【语法】

```
ERRORTYPE AW_MPI_VO_EnableChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |
| VoChn   | 通道号   | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.21 AW_MPI_VO_DestroyChn

【描述】

销毁指定VO 图层指定编号的VO 通道。

【语法】

```
ERRORTYPE AW_MPI_VO_DisableChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述     | 输入输出 |
| ------- | -------- | -------- |
| VoLayer | 图层索引 | 输入     |
| VoChn   | 通道号   | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数会销毁AW_MPI_VO_EnableChn 的所有资源。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.22 AW_MPI_VO_RegisterCallback

【描述】

为创建的VO 通道组件实例注册一个回调函数。

【语法】

```
ERRORTYPE AW_MPI_VO_RegisterCallback(VO_LAYER VoLayer, VO_CHN VoChn, MPPCallbackInfo *pCallback);
```

【参数】

| 返回值    | 描述               | 输入输出     |
| --------- | ------------------ | ------------ |
| VoLayer   | 图层索引           | 输入         |
| VoChn     | VO 通道号          | 输入         |
| pCallback | 回调函数信息结构体 | 输入（静态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数用于MPP_VO 模块向应用程序发送事件通知，如果应用程序不需要接收来自MPP_VO 模块的事件，那么也可以不注册该函数（但不建议这么做）。

pCallback 的cookie 成员存储应用程序自定义的结构体数据，callback 成员则需要指向应用程序的回调函数实体。回调函数的参数为：

```
Func(void cookie, MPP_CHN_SpChn, MPP_EVENT_TYPE event,void *pEventData)。
```

MPP_VO 模块定义的事件有以下类型：

```
MPP_EVENT_RELEASE_VIDEO_BUFFER, //VIDEO_FRAME_INFO_S for recorder/VIChannel::DoVdaThread,
ISE, VO, VENC
MPP_EVENT_VENC_TIMEOUT, //uint64_t*
MPP_EVENT_RELEASE_ISE_VIDEO_BUFFER0, //VIDEO_FRAME_INFO_S for recorder/VIChannel::
DoVdaThread, ISE, VO, VENC
MPP_EVENT_RELEASE_ISE_VIDEO_BUFFER1, //VIDEO_FRAME_INFO_S for recorder/VIChannel::
DoVdaThread, ISE, VO, VENC
MPP_EVENT_RELEASE_AUDIO_BUFFER, //AUDIO_FRAME_S
MPP_EVENT_BSFRAME_AVAILABLE, //CDXRecorderBsInfo
MPP_EVENT_ERROR_ENCBUFFER_OVERFLOW,
MPP_EVENT_NEED_NEXT_FD, // int muxerId
MPP_EVENT_RECORD_DONE, // int muxerId
MPP_EVENT_CAPTURE_AUDIO_DATA, // unsigned int size;
MPP_EVENT_NOTIFY_EOF = 0x100,
MPP_EVENT_SET_VIDEO_SIZE, //SIZE_S
MPP_EVENT_RENDERING_START,
```

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.23 AW_MPI_VO_SetChnDispBufNum

【描述】

设置VO 组件通道实例的缓存buf 数量。

【语法】

```
ERRORTYPE AW_MPI_VO_SetChnDispBufNum(VO_LAYER VoLayer, VO_CHN VoChn, unsigned int uBufNum);
```

【参数】

| 返回值  | 描述           | 输入输出     |
| ------- | -------------- | ------------ |
| VoLayer | 图层索引       | 输入         |
| VoChn   | VO 通道号      | 输入         |
| uBufNum | 缓存buf 的数量 | 输入（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数必须被调用，并且uBufNum 的数量要大于等于1，同时uBufNum 的数量不能超过16。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.24 AW_MPI_VO_GetChnDispBufNum

【描述】

获取VO 组件通道实例的缓存buf 数量。

【语法】

```
ERRORTYPE AW_MPI_VO_GetChnDispBufNum(VO_LAYER VoLayer, VO_CHN VoChn, unsigned int uBufNum);
```

【参数】

| 返回值  | 描述           | 输入输出     |
| ------- | -------------- | ------------ |
| VoLayer | 图层索引       | 输入         |
| VoChn   | VO             | 通道号输入   |
| uBufNum | 缓存buf 的数量 | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无

【举例】

无

#### 4.5.25 AW_MPI_VO_GetDisplaySize

【描述】

获取VO 组件通道实例图层的显示数据（图层的显示宽、高）。

【语法】

```
ERRORTYPE AW_MPI_VO_GetDisplaySize(VO_LAYER VoLayer, VO_CHN VoChn, SIZE_S *pDisplaySize);
```

【参数】

| 返回值       | 描述            | 输入输出     |
| ------------ | --------------- | ------------ |
| VoLayer      | 图层索引        | 输入         |
| VoChn        | VO 通道号       | 输入         |
| pDisplaySize | size 信息结构体 | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

pDisplaySize 结构体成员的Width 代表宽度，Height 代表高度。

【举例】

无

#### 4.5.26 AW_MPI_VO_StartChn

【描述】

通道开始工作（VO 组件状态设为StateExecuting），接收视频数据并送去显示。

【语法】

```
ERRORTYPE AW_MPI_VO_StartChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述      | 输入输出 |
| ------- | --------- | -------- |
| VoLayer | 图层索引  | 输入     |
| VoChn   | VO 通道号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

要在通道使能后，注册完回调函数之后再调用该函数。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.27 AW_MPI_VO_StopChn

【描述】

通道停止（VO 组件状态设为StateIdle），停止数据传输。

【语法】

```
ERRORTYPE AW_MPI_VO_StopChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述      | 输入输出 |
| ------- | --------- | -------- |
| VoLayer | 图层索引  | 输入     |
| VoChn   | VO 通道号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

停止数据传输之后并不会释放相关的资源，可以再次从停止状态恢复。

【举例】

```
sample_vo
sample_virvi2vo
sample_uvc2vo
sample_virvi2fish2vo
```

#### 4.5.28 AW_MPI_VO_PauseChn

【描述】

通道暂停（设置组件状态为StatePause），停止显示。

【语法】

```
ERRORTYPE AW_MPI_VO_PauseChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述      | 输入输出 |
| ------- | --------- | -------- |
| VoLayer | 图层索引  | 输入     |
| VoChn   | VO 通道号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无

【举例】

```
sample_demux2vdec2vo
```

#### 4.5.29 AW_MPI_VO_ResumeChn

【描述】

通道恢复（设置VO 组件状态为StateExecuting），开始数据传输。

```
【语法】
ERRORTYPE AW_MPI_VO_ResumeChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述      | 输入输出 |
| ------- | --------- | -------- |
| VoLayer | 图层索引  | 输入     |
| VoChn   | VO 通道号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

根据openMAX 标准的说法，各种状态的定义如下所示：

```
StateIdle：有资源，不传输数据。

StateExecuting：有资源，传输数据，处理数据。

StatePause：有资源，传输数据，不处理数据。
三个状态两两可以相互转换。
```

【举例】

```
sample_demux2vdec2vo
```

#### 4.5.30 AW_MPI_VO_Seek

【描述】

跳转播放。

【语法】

```
ERRORTYPE AW_MPI_VO_Seek(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述      | 输入输出 |
| ------- | --------- | -------- |
| VoLayer | 图层索引  | 输入     |
| VoChn   | VO 通道号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

MPP_VO 模块的跳转播放不是真正的“跳转”，真正的跳转在视频格式解析模块里面（可以跳转到指定的时间播放视频），该模块的跳转函数只是负责在设置跳转之

后将跳转之前缓存到的视频帧丢弃，否则会出现跳转之后播放到跳转前视频帧的情况。最好在跳播之后调用该函数。举例：现在播放到视频的第100ms，此时

MPP_VO 模块可能缓存了100ms 之后的几帧视频，然后同时发生了跳转事件，视频直接从100ms 跳转到了2000ms 处播放，那么需要调用该函数清除100ms 之

后的几帧缓存视频数据，从而保证跳转播放的连贯性。

【举例】

```
sample_demux2vdec2vo
```

#### 4.5.31 AW_MPI_VO_SetStreamEof

【描述】

根据参数标记视频流的结束（此时会停止视频的显示），状态转为StateIdle；或者取消视频流结束标记。

【语法】

```
ERRORTYPE AW_MPI_VO_SetStreamEof(VO_LAYER VoLayer, VO_CHN VoChn, BOOL bEofFlag);
```

【参数】

| 返回值   | 描述           | 输入输出 |
| -------- | -------------- | -------- |
| VoLayer  | 图层索引       | 输入     |
| VoChn    | VO 通道号      | 输入     |
| bEofFlag | 视频流结束标志 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

bEofFlag 为1 时表示视频流结束，为0 时取消视频结束标志。当设置为1 时VO 组件的状态会转为StateIdle，此时视频流会停止传输。

【举例】

```
sample_CodecParallel
sample_demux2vdec2vo
```

#### 4.5.32 AW_MPI_VO_ShowChn

【描述】

通道图层显示（去隐藏化）。

【语法】

```
ERRORTYPE AW_MPI_VO_ShowChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值   | 描述             | 输入输出 |
| -------- | ---------------- | -------- |
| VoLayerx | VoLayer 图层索引 | 输入     |
| VoChn    | VO 通道号        | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

如果通道本来就是处于show 状态，则不会有任何的变化，如果通道本来处于hide 状态，该函数会使得指定通道对应的图层变得可见。

【举例】

无

#### 4.5.33 AW_MPI_VO_HideChn

【描述】

通道图层隐藏（不可见）。

【语法】

```
ERRORTYPE AW_MPI_VO_HideChn(VO_LAYER VoLayer, VO_CHN VoChn);
```

【参数】

| 返回值  | 描述      | 输入输出 |
| ------- | --------- | -------- |
| VoLayer | 图层索引  | 输入     |
| VoChn   | VO 通道号 | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

通道隐藏只是在显示屏幕上面变得不可见，并不会销毁通道相关的任何资源，调用AW_MPI_VO_ShowChn之后通道对应的图层在显示屏幕上面会重新变为可见状

态。

【举例】
无

#### 4.5.34 AW_MPI_VO_GetChnPts

【描述】

获取VO 组件通道实例视频播放的时间戳，单位us。

【语法】

```
ERRORTYPE AW_MPI_VO_GetChnPts(VO_LAYER VoLayer, VO_CHN VoChn, uint64_t *pChnPts);
```

【参数】

| 返回值  | 描述               | 输入输出     |
| ------- | ------------------ | ------------ |
| VoLayer | 图层索引           | 输入         |
| VoChn   | VO 通道号          | 输入         |
| pChnPts | 时间戳（指针类型） | 输出（动态） |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

无
【举例】
无

#### 4.5.35 AW_MPI_VO_SendFrame

【描述】

发送一帧视频数据送去显示。

【语法】

```
ERRORTYPE AW_MPI_VO_SendFrame(VO_LAYER VoLayer, VO_CHN VoChn, VIDEO_FRAME_INDO_S *pstFrame,int nMilliSec);
```

【参数】

| 返回值    | 描述             | 输入输出     |
| --------- | ---------------- | ------------ |
| VoLayer   | 图层索引         | 输入         |
| VoChn     | VO 通道号        | 输入         |
| pstFrame  | 视频帧信息结构体 | 输入（动态） |
| nMilliSec | 等待时间，单位ms | 输入         |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

pstFrame 结构体里面包含视频帧id，视频帧大小、像素格式、物理地址、虚拟地址、时间戳等等。该函数一般用在非绑定的VO 组件中，此时视频数据是从外部文

件中读取到的，必须设置视频帧的id、宽度、高度、像素格式、物理地址、虚拟地址、时间戳。nMilliSec 参数代表等待时间，如果超过该时间，视频还没有被成功

发送，那么该帧视频数据就会被丢弃。

【举例】

```
sample_vo
sample_virvi2vo
```

#### 4.5.36 AW_MPI_VO_Debug_StoreFrame

【描述】

保存一帧视频数据，可用于截图。

【语法】

```
ERRORTYPE AW_MPI_VO_Debug_StoreFrame(VO_LAYER VoLayer, VO_CHN VoChn, unit64_t framePts);
```

【参数】

| 返回值   | 描述      | 输入输出 |
| -------- | --------- | -------- |
| VoLayer  | 图层索引  | 输入     |
| VoChn    | VO 通道号 | 输入     |
| framePts | 时间戳    | 输入     |

【返回值】

| 返回值  | 描述                              |
| ------- | --------------------------------- |
| SUCCESS | 成功                              |
| 错误码  | 参考mm_comm_vo.h 中的错误码描述。 |

【需求】

```
头文件：mpi_vo.h
库文件：libmpp_vo.so
```

【注意】

该函数可用于保存一帧视频数据到文件里面，framePts 参数指定了需要保存的视频数据所在的位置（以时间为坐标，单位ms）。如果找不到指定时间的帧，那么

程序就会选择最接近的帧进行保存。

【举例】

无

### 4.6 数据结构

#### 4.6.1 VO_PUB_ATTR_S

【说明】

VO 显示通道的设备接口类型、分辨率等。

【定义】

```
typedef struct VO_PUB_ATTR_S
{
unsigned int mBgColor; /* Background color of a device, in RGB
format. */
VO_INTF_TYPE_E enIntfType; /* Type of a VO interface, e.g.,
VO_INTF_LCD */
VO_INTF_SYNC_E enIntfSync; /* Type of a VO interface timing */
VO_SYNC_INFO_S stSyncInfo; /* Information about VO interface timings
*/
} VO_PUB_ATTR_S;
```

【成员】

| 成员名称   | 描述                         |
| ---------- | ---------------------------- |
| mBgColor   | 在RGB 格式下，设备的背景色。 |
| enIntfType | VO 显示设备接口类型。        |
| enIntfSync | VO 显示设备分辨率及频率。    |
| stSyncInfo | VO 接口的时间信息。          |

【注意事项】

无

【相关数据类型及接口】

```
/* vo inteface type */
#define VO_INTF_CVBS (0x01L<<0)
#define VO_INTF_YPBPR (0x01L<<1)
#define VO_INTF_VGA (0x01L<<2)
#define VO_INTF_BT656 (0x01L<<3)
#define VO_INTF_BT1120 (0x01L<<4)
#define VO_INTF_HDMI (0x01L<<5)
#define VO_INTF_LCD (0x01L<<6)
#define VO_INTF_BT656_H (0x01L<<7)
#define VO_INTF_BT656_L (0x01L<<8)
#define VO_INTF_LCD_6BIT (0x01L<<9)
#define VO_INTF_LCD_8BIT (0x01L<<10)
#define VO_INTF_LCD_16BIT (0x01L<<11)
typedef int VO_INTF_TYPE_E;
typedef enum VO_INTF_SYNC_E
{
VO_OUTPUT_PAL = 0,
VO_OUTPUT_NTSC,
VO_OUTPUT_1080P24,
VO_OUTPUT_1080P25,
VO_OUTPUT_1080P30,
VO_OUTPUT_720P50,
VO_OUTPUT_720P60,
VO_OUTPUT_1080I50,
VO_OUTPUT_1080I60,
VO_OUTPUT_1080P50,
VO_OUTPUT_1080P60,
VO_OUTPUT_3840x2160_24,
VO_OUTPUT_3840x2160_25,
VO_OUTPUT_3840x2160_30,
VO_OUTPUT_576P50,
VO_OUTPUT_480P60,
VO_OUTPUT_800x600_60, /* VESA 800 x 600 at 60 Hz (non-interlaced) */
VO_OUTPUT_1024x768_60, /* VESA 1024 x 768 at 60 Hz (non-interlaced) */
VO_OUTPUT_1280x1024_60, /* VESA 1280 x 1024 at 60 Hz (non-interlaced) */
VO_OUTPUT_1366x768_60, /* VESA 1366 x 768 at 60 Hz (non-interlaced) */
VO_OUTPUT_1440x900_60, /* VESA 1440 x 900 at 60 Hz (non-interlaced) CVT
Compliant */
VO_OUTPUT_1280x800_60, /* 1280*800@60Hz VGA@60Hz*/
VO_OUTPUT_1600x1200_60, /* VESA 1600 x 1200 at 60 Hz (non-interlaced) */
VO_OUTPUT_1680x1050_60, /* VESA 1680 x 1050 at 60 Hz (non-interlaced) */
VO_OUTPUT_1920x1200_60, /* VESA 1920 x 1600 at 60 Hz (non-interlaced) CVT (
Reduced Blanking)*/
VO_OUTPUT_640x480_60, /* VESA 640 x 480 at 60 Hz (non-interlaced) CVT */
VO_OUTPUT_960H_PAL, /* ITU-R BT.1302 960 x 576 at 50 Hz (interlaced)*/
VO_OUTPUT_960H_NTSC, /* ITU-R BT.1302 960 x 480 at 60 Hz (interlaced)*/
VO_OUTPUT_320X240_30, /* For ota5182 at 30 Hz just for hi3516d/hi3518ev200,
hi3516a not support*/
VO_OUTPUT_320X240_50, /* For ili9342 at 50 Hz ,just for hi3516d/hi3518ev200,
hi3516a not support */
VO_OUTPUT_240X320_50, /* For ili9341 at 50 Hz ,just for hi3516d/hi3518ev200,
hi3516a not support */
VO_OUTPUT_240X320_60,
VO_OUTPUT_USER,
VO_OUTPUT_BUTT
} VO_INTF_SYNC_E;
typedef struct VO_SYNC_INFO_S
{
BOOL mbSynm; /* sync mode(0:timing,as BT.656; 1:signal,as LCD) */
BOOL mbIop; /* interlaced or progressive display(0:i; 1:p) */
unsigned char mIntfb; /* interlace bit width while output */
unsigned short mVact ; /* vertical active area */
unsigned short mVbb; /* vertical back blank porch */
unsigned short mVfb; /* vertical front blank porch */
unsigned short mHact; /* herizontal active area */
unsigned short mHbb; /* herizontal back blank porch */
unsigned short mHfb; /* herizontal front blank porch */
unsigned short mHmid; /* bottom herizontal active area */
unsigned short mBvact; /* bottom vertical active area */
unsigned short mBvbb; /* bottom vertical back blank porch */
unsigned short mBvfb; /* bottom vertical front blank porch */
unsigned short mHpw; /* horizontal pulse width */
unsigned short mVpw; /* vertical pulse width */
BOOL mbIdv; /* inverse data valid of output */
BOOL mbIhs; /* inverse horizontal synch signal */
BOOL mbIvs; /* inverse vertical synch signal */
} VO_SYNC_INFO_S;
```

#### 4.6.2 RECT_S

【说明】

VO 显示的范围矩形框。

【定义】

```
typedef struct RECT_S {
    int X;
    int Y;
    unsigned int Width;
    unsigned int Height;
} RECT_S;
```

【成员】

| 成员名称 | 描述                       |
| -------- | -------------------------- |
| X        | 显示的X 坐标，单位：像素。 |
| Y        | 显示的Y 坐标，单位：像素。 |
| Width    | 显示的宽度，单位：像素。   |
| Height   | 显示的高度，单位：像素。   |

【注意事项】

无

【相关数据类型及接口】

无

#### 4.6.3 SIZE_S

【说明】

描述显示图层的宽高。

【定义】

```
typedef struct SIZE_S {
    unsigned int Width;
    unsigned int Height;
} SIZE_S;
```

【成员】

| 成员名称 | 描述                     |
| -------- | ------------------------ |
| Width    | 显示的宽度，单位：像素。 |
| Height   | 显示的高度，单位：像素。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 4.6.4 VO_VIDEO_LAYER_ATTR_S

【说明】

描述显示图层的属性。
【定义】

```
typedef struct VO_VIDEO_LAYER_ATTR_S
{
    RECT_S stDispRect; /* Display resolution */
    SIZE_S stImageSize; /* Canvas size of the video layer */
    unsigned int mDispFrmRt; /* Display frame rate */
    PIXEL_FORMAT_E enPixFormat; /* Pixel format of the video layer */
    BOOL bDoubleFrame; /* Whether to double frames */
    BOOL bClusterMode; /* Whether to take Cluster way to use memory*/
} VO_VIDEO_LAYER_ATTR_S;
```

【成员】

| 成员名称      | 描述                          |
| ------------- | ----------------------------- |
| stDispRect 。 | 图层的范围（X、Y 坐标，宽高） |
| stImageSize   | 图层画布大小。                |
| mDispFrmRt    | 显示频率。                    |
| enPixFormat   | 图层像素格式。                |
| bDoubleFrame  | 视频层倍帧开关。              |
| bClusterMode  | 视频层内存聚集使能开关。      |

【注意事项】

无

【相关数据类型及接口】

RECT_S、SIZE_S 对应的数据结构请参考前面对应的描述。PIXEL_FORMAT_E 数据结构如下：

```
typedef enum PIXEL_FORMAT_E
{
MM_PIXEL_FORMAT_RGB_1BPP = 0,
MM_PIXEL_FORMAT_RGB_2BPP,
MM_PIXEL_FORMAT_RGB_4BPP,
MM_PIXEL_FORMAT_RGB_8BPP,
MM_PIXEL_FORMAT_RGB_444,
MM_PIXEL_FORMAT_RGB_4444,
MM_PIXEL_FORMAT_RGB_555,
MM_PIXEL_FORMAT_RGB_565,
MM_PIXEL_FORMAT_RGB_1555,
/* 9 reserved */
MM_PIXEL_FORMAT_RGB_888,
MM_PIXEL_FORMAT_RGB_8888,
MM_PIXEL_FORMAT_RGB_PLANAR_888,
MM_PIXEL_FORMAT_RGB_BAYER_8BPP,
MM_PIXEL_FORMAT_RGB_BAYER_10BPP,
MM_PIXEL_FORMAT_RGB_BAYER_12BPP,
MM_PIXEL_FORMAT_RGB_BAYER_14BPP,
MM_PIXEL_FORMAT_RGB_BAYER, /* 16 bpp */
MM_PIXEL_FORMAT_YUV_A422,
MM_PIXEL_FORMAT_YUV_A444,
MM_PIXEL_FORMAT_YUV_PLANAR_422,
MM_PIXEL_FORMAT_YUV_PLANAR_420, //YU12
MM_PIXEL_FORMAT_YUV_PLANAR_444,
MM_PIXEL_FORMAT_YUV_SEMIPLANAR_422, //NV16
MM_PIXEL_FORMAT_YUV_SEMIPLANAR_420, //NV12
MM_PIXEL_FORMAT_YUV_SEMIPLANAR_444,
MM_PIXEL_FORMAT_UYVY_PACKAGE_422,
MM_PIXEL_FORMAT_YUYV_PACKAGE_422,
MM_PIXEL_FORMAT_VYUY_PACKAGE_422,
MM_PIXEL_FORMAT_YCbCr_PLANAR,
MM_PIXEL_FORMAT_SINGLE,
MM_PIXEL_FORMAT_YVU_PLANAR_420, //YV12
MM_PIXEL_FORMAT_YVU_SEMIPLANAR_422, //NV61
MM_PIXEL_FORMAT_YVU_SEMIPLANAR_420, //NV21
MM_PIXEL_FORMAT_YUV_AW_AFBC,
MM_PIXEL_FORMAT_YUV_AW_LBC_2_0X,
MM_PIXEL_FORMAT_YUV_AW_LBC_2_5X,
MM_PIXEL_FORMAT_YUV_AW_LBC_1_0X,
MM_PIXEL_FORMAT_YVYU_AW_PACKAGE_422,
MM_PIXEL_FORMAT_RAW_SBGGR8,
MM_PIXEL_FORMAT_RAW_SGBRG8,
MM_PIXEL_FORMAT_RAW_SGRBG8,
MM_PIXEL_FORMAT_RAW_SRGGB8,
MM_PIXEL_FORMAT_RAW_SBGGR10,
MM_PIXEL_FORMAT_RAW_SGBRG10,
MM_PIXEL_FORMAT_RAW_SGRBG10,
MM_PIXEL_FORMAT_RAW_SRGGB10,
MM_PIXEL_FORMAT_RAW_SBGGR12,
MM_PIXEL_FORMAT_RAW_SGBRG12,
MM_PIXEL_FORMAT_RAW_SGRBG12,
MM_PIXEL_FORMAT_RAW_SRGGB12,
MM_PIXEL_FORMAT_AW_NV21S = 0x0100, //NV21 Single buffer contain nv21 data.
MM_PIXEL_FORMAT_BUTT
} PIXEL_FORMAT_E;
```

#### 4.6.5 VO_VIDEO_LAYER_ALPHA_S

【说明】

描述图层的alpha 属性。

【定义】

```
typedef struct VO_VIDEO_LAYER_ALPHA_S
{
unsigned char mAlphaMode; /* 0: Pixel Mode, 1: Global Mode */
unsigned char mAlphaValue;
}VO_VIDEO_LAYER_ALPHA_S;
```

【成员】

| 成员名称    | 描述                                          |
| ----------- | --------------------------------------------- |
| mAlphaMode  | Alpha 的模式，0: Pixel Mode, 1: Global Mode。 |
| mAlphaValue | Alpha 的值。                                  |

【注意事项】

无

【相关数据类型及接口】

无

#### 4.6.6 VIDEO_FRAME_INFO_S

请参考视频输入章节中该数据结构的描述。

### 4.7 错误码

| 错误码     | 宏定义                                | 描述                                                  |
| ---------- | ------------------------------------- | ----------------------------------------------------- |
| 0xA00F8012 | ERR_VO_BUSY                           | VO 正忙                                               |
| 0xA00F800C | ERR_VO_NO_MEM                         | 没有足够的内存                                        |
| 0xA00F8006 | ERR_VO_NULL_PTR                       | 空指针                                                |
| 0xA00F8010 | ERR_VO_SYS_NOTREADY                   | VO 没有准备好                                         |
| 0xA00F8001 | ERR_VO_INVALID_DEVID                  | 无效的VO 设备ID                                       |
| 0xA00F8002 | ERR_VO_INVALID_CHNID                  | 无效的通道ID                                          |
| 0xA00F8003 | ERR_VO_ILLEGAL_PARAM                  | 非法参数                                              |
| 0xA00F8008 | ERR_VO_NOT_SUPPORT                    | 不支持                                                |
| 0xA00F8009 | ERR_VO_NOT_PERMIT                     | 没有权限，不允许                                      |
| 0xA00F806C | ERR_VO_INVALID_WBCID                  |                                                       |
| 0xA00F806D | ERR_VO_INVALID_LAYERID                | 非法的Layer ID                                        |
| 0xA00F8040 | ERR_VO_DEV_NOT_CONFIG                 | VO 设备没有被配置                                     |
| 0xA00F8041 | ERR_VO_DEV_NOT_ENABLE                 | VO 设备没有使能                                       |
| 0xA00F8042 | ERR_VO_DEV_HAS_ENABLED                | VO 设备已经使能                                       |
| 0xA00F8043 | ERR_VO_DEV_HAS_BINDED                 | VO 设备已经被绑定                                     |
| 0xA00F8044 | ERR_VO_DEV_NOT_BINDED                 | VO 设备没有被绑定                                     |
| 0xA00F8045 | ERR_VO_VIDEO_NOT_ENABLE               | 视频没有使能                                          |
| 0xA00F8046 | ERR_VO_VIDEO_NOT_DISABLE              | 视频处于使能状态                                      |
| 0xA00F8047 | ERR_VO_VIDEO_NOT_CONFIG               | 视频没有配置                                          |
| 0xA00F806E | ERR_VO_VIDEO_HAS_BINDED               | 视频已经绑定                                          |
| 0xA00F806F | ERR_VO_VIDEO_NOT_BINDED               | 视频没有绑定                                          |
| 0xA00F8048 | ERR_VO_CHN_NOT_DISABLE                | VO 通道处于使能状态                                   |
| 0xA00F8049 | ERR_VO_CHN_NOT_ENABLE                 | VO 通道没有使能                                       |
| 0xA00F804A | ERR_VO_CHN_NOT_CONFIG                 | VO 通道没有被配置                                     |
| 0xA00F804B | ERR_VO_CHN_NOT_ALLOC                  | VO 通道没有分配                                       |
| 0xA00F806B | ERR_VO_CHN_AREA_OVERLAP               | VO 通道区域重叠                                       |
| 0xA00F8014 | ERR_VO_CHN_SAMESTATE                  | 同样的状态，错误常见于状态转换                        |
| 0xA00F8015 | ERR_VO_CHN_INVALIDSTATE               | 非法的状态                                            |
| 0xA00F8016 | ERR_VO_CHN_INCORRECT_STATE_TRANSITION | 错误的状态转换                                        |
| 0xA00F8017 | ERR_VO_CHN_INCORRECT_STATE_OPERATION  | 错误的状态行为                                        |
| 0xA00F804C | ERR_VO_INVALID_PATTERN                | 无效的样式                                            |
| 0xA00F804D | ERR_VO_INVALID_POSITION               | 无效级联位置（例如：组件通道<br/>绑定端口属性不一致） |
| 0xA00F804E | ERR_VO_WAIT_TIMEOUT                   | 等待超时                                              |
| 0xA00F804F | ERR_VO_INVALID_VFRAME                 | 非法的视频帧                                          |
| 0xA00F8050 | ERR_VO_INVALID_RECT_PARA              | 非法的矩形参数（rect）                                |
| 0xA00F8051 | ERR_VO_SETBEGIN_ALREADY               | 已经设置为开始                                        |
| 0xA00F8052 | ERR_VO_SETBEGIN_NOTYET                | 还没有设置开始                                        |
| 0xA00F8053 | ERR_VO_SETEND_ALREADY                 | 已经设置为结束                                        |
| 0xA00F8054 | ERR_VO_SETEND_NOTYET                  | 还没有设置结束                                        |
| 0xA00F8055 | ERR_VO_GRP_INVALID_ID                 | UNUSED                                                |
| 0xA00F8056 | ERR_VO_GRP_NOT_CREATE                 | UNUSED                                                |
| 0xA00F8057 | ERR_VO_GRP_HAS_CREATED                | UNUSED                                                |
| 0xA00F8058 | ERR_VO_GRP_NOT_DESTROY                | UNUSED                                                |
| 0xA00F8059 | ERR_VO_GRP_CHN_FULL                   | UNUSED                                                |
| 0xA00F805A | ERR_VO_GRP_CHN_EMPTY                  | UNUSED                                                |
| 0xA00F805B | ERR_VO_GRP_CHN_NOT_EMPTY              | UNUSED                                                |
| 0xA00F805C | ERR_VO_GRP_INVALID_SYN_MODE           | UNUSED                                                |
| 0xA00F805D | ERR_VO_GRP_INVALID_BASE_PTS           | UNUSED                                                |
| 0xA00F805E | ERR_VO_GRP_NOT_START                  | UNUSED                                                |
| 0xA00F805F | ERR_VO_GRP_NOT_STOP                   | UNUSED                                                |
| 0xA00F8060 | ERR_VO_GRP_INVALID_FRMRATE            | UNUSED                                                |
| 0xA00F8061 | ERR_VO_GRP_CHN_HAS_REG                | UNUSED                                                |
| 0xA00F8062 | ERR_VO_GRP_CHN_NOT_REG                | UNUSED                                                |
| 0xA00F8063 | ERR_VO_GRP_CHN_NOT_UNREG              | UNUSED                                                |
| 0xA00F8064 | ERR_VO_GRP_BASE_NOT_CFG               | UNUSED                                                |
| 0xA00F8065 | ERR_VO_GFX_NOT_DISABLE                | 图形层处于使能状态                                    |
| 0xA00F8066 | ERR_VO_GFX_NOT_BIND                   | 图形层没有绑定                                        |
| 0xA00F8067 | ERR_VO_GFX_NOT_UNBIND                 | 图形层没有解绑                                        |
| 0xA00F8068 | ERR_VO_GFX_INVALID_ID                 | 非法的图形层ID                                        |

## 5 视频编码

### 5.1 概述

VENC 模块，即视频编码模块。本模块支持多路实时编码，且每路编码独立，编码协议和编码profile 可以不同。

VENC 模块的输入源包括以下两类：

• 用户态读取图像文件向编码模块发送数据；

• 视频输入（VI）模块采集的图像直接发送到编码模块；

目前支持的编码规格如下表所示：

| H.264 |      |      | JPEG | MJPEG | H.265 |
| ----- | ---- | ---- | ---- | ----- | ----- |
| BP    | MP   | HP   |      |       | MP    |
| 支持  | 支持 | 支持 | 支持 | 支持  | 支持  |

**技巧**
	MJPEG：MOTION JPEG

### 5.2 功能描述

典型的编码流程包括了输入图像的接收、图像的编码、以及码流的输出等过程。通道支持接收YUV 格式图像输入，支持格式为semi-planar YUV4:2:0、semi-

planar YVU4:2:0、planar YUV4:2:0 以及全志自定义aw-afbc 格式(yuv)。通道模块接收外部原始图像数据，而不关心图像数据是来自哪个外部模块。

![image-20230104160247752](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104160247752.png)

<center>图5-1: 典型的编码流程示意图</center>

每个venc 通道最多能绑定一个输入端口，一个输出端口。

模块buffer 使用情况：venc 模块包含输入frame manager 与输出编码bit stream manager。二者的buffer 使用/处理情况如下：

• 输入待编码frame(yuv)：venc 模块本身不对外提供frame 的buffer，由venc 输入端自已解决输入frame 的buffer，venc 模块内部frame buffer manager 在获

取in frame后，会通知venc 输入端frame 数据已经被处理，可以释放该frame 的buffer。对于venc模块输入端绑定情况，由venc 模块跟venc 模块输入端口组件

内部自行完成frame buffer的操作交互，不需要调用者再额外处理；对于venc 输入端口非绑定的情况，此时组件会发出MPP_EVENT_RELEASE_VIDEO_BUFFER 消

息，调用者收到此消息后可以自行对frame buffer 进行释放等操作。

• 编码输出bit stream：由venc 模块本身提供输出bit stream 的buffer，调用者在获取完已编码数据后必须及时归还buffer 给venc 模块。对于venc 输出端口绑定

方式，由venc 模块跟venc 输出端口组件内部自行完成bit stream buffer 操作交互，不需要再额外处理；对于venc 输出端非绑定方式，调用者在调用

AW_MPI_VENC_GetStream() 接口成功获取已编码bit stream 数据(处理) 后，需调用AW_MPI_VENC_ReleaseStream() 将bit stream buffer 还给venc 模块。

**参考示例：**

```
sample_venc（输入输出端口都非绑定）
sample_venc2muxer（输入端口非绑定输出绑定）
sample_virvi2venc（输入端口绑定输出端口非绑定）
sample_virvi2venc2muxer（输入端口与输出端口都绑定）
```

**注意事项：**

模块（通道）注销时，会等待自己所有对外提供的数据buffer 回收，因此对于绑定方式来讲，要注意各相关模块的注销顺序。如：venc -> mux 方式时, 注销时先

注销mux，再注销venc。

#### 5.2.1 缩放功能

编码支持缩放功能，对于YUV 非压缩格式和LBC 压缩格式，二者的缩放范围不同。

• YUV 非压缩格式的编码缩放：对于YUV 非压缩格式，编码器支持对输入源进行放大或者缩小编码，宽度和高度缩放的范围是[0.25, 8]，即最大放大8 倍，最小缩

小4 倍。

• LBC 压缩格式的编码缩放：对于LBC 压缩格式，编码器只支持对输入源进行放大编码，宽度和高度缩放的范围是[1, 2]，即最大放大2 倍。

实际缩放时的比例根据用户设定的输入源的分辨率和编码的分辨率自动计算，超出以上规格范围编码器会报错。输入源的宽度和编码输出的宽度要求16 对齐，输

入源的高度要求16 对齐，如果其不是8 对齐，建议对输入源的非16 对齐部分用最后一行的数据填充。

接口：

AW_MPI_VENC_SetChnAttr

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.2 旋转功能

编码器支持非压缩格式的90°、180°、270° 旋转、以及水平mirror。

接口：

```
AW_MPI_VENC_SetChnAttr
AW_MPI_VENC_SetHorizonFlip
```

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.3 码率控制

H264 和H265 编码支持CBR，VBR，FIXQP，QPMAP 的码率控制方式。MJPEG 编码只支持CBR 和FIXQP 的码率控制方式。

• CBR：固定比特率，即在码率统计时间内保证码率平稳，当前默认的码率统计时间是1s；如果用户设定的帧率与实际的帧率不一致，则实际的码率与设定的码率

与帧率成线性比例；

• VBR：可变比特率，即在码率统计时间内编码码率波动，从而保证编码图像质量稳定；当前通过编码驱动内部统计已编码帧的mv 信息，对整体运动状况作出估

计，为静态场景帧少分配目标比特量，为动态场景帧多分配目标比特量。用户可通过MotionParam 数据结构设定运动和静止场景的等级，以及运动帧和静止帧占

用码率的比例，具体请参看MotionParam 定义；

• FIXQP：使用固定qp 值，在整个编码过程中，所有帧的所有宏块都使用固定的qp 值，I 帧和P 帧可以使用不同的固定值；

• QPMAP：在该模式下，用户可以获取到上一帧的编每个宏块的qp 信息，通过该信息可控制下一帧编码的每个宏块的qp 信息。用户可通过

VideoEncSetParameter 的接口VENC_IndexParamMBInfoOutput， 开启每一帧的编码信息输出功能， 包括每一个宏块的qp 值，mad 值，sse 值， 调用该接口

时传递数据结构VencMBInfo 的指针； 通过VideoEncGetParameter 获取上一帧的整帧的qp、mad、sse 值， 接口为VENC_IndexParamMBSumInfoOutput 数

据结构为VencMBSumInfo； 用户可通过VideoEncSetParameter 的接口VENC_IndexParamMBModeCtrl 设置下一帧的编码细节，传递的数据结构为

VencMBModeCtrl，在VencMBModeCtrl 数据结构中有指针指向VencMBModeCtrlInfo 数组，该数组成员包括宏块qp 值，是否优先使用skip 预测模式，是
否打开该宏块的用户控制使能位，即用户可通过该接口控制每一个宏块的编码模式和qp 值；

接口：

AW_MPI_VENC_SetRcParam

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.4 裁剪编码

编码器支持从输入源中裁剪一部分进行编码。用户需要设定裁剪区域的起始坐标（x, y），以及裁剪区域的大小（width, height），起始坐标要求16 对齐，裁剪区

域的宽度和高度需要16 对齐。

![image-20230104160719335](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104160719335.png)

接口：

AW_MPI_VENC_SetCrop

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.5 彩转灰

VENC 支持把彩色图像转换成灰度图像进行编码。

接口：

AW_MPI_VENC_SetColor2Grey

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.6 3D 降噪

编码器支持3D 降噪功能。

接口：

AW_MPI_VENC_Set3DFilter

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.7 ROI 编码

ROI 是（region of interrest）的缩写，即感兴趣区域编码。编码器可以对用户设置的roi 区域进行特殊编码，roi 的设置包括起始坐标（x,y），区域大小

（width，height），以及QP 设置（QP 设置分为绝对QP 和相对QP，可通过VencROIConfig 数据结构的roi_abs_flag 使能位进行控制，roi_abs_flag 为1 表示绝

对QP 模式，直接使用该设定的QP 值作为整个区域的QP值，roi_abs_flag 为0 表示相对QP 模式，使用帧级QP 值加上该设定的QP 值作为区域的QP值，），编码

器共支持8 个该区域的设置，如果其中有区域重叠的话，则重叠区域使用index 值大的区域的QP 值，优先级从低到高依次为0-7。ROI 的起始坐标和宽度高度均需

要16 对齐。

下图示例编码图像采用FixQp 模式，设置图像Qp 为25，即图像中所有宏块Qp 值为25。ROI区域0 设置为绝对Qp 模式，Qp 值为10，索引为0；ROI 区域1 设置为

相对Qp 模式，Qp为-10，索引为1。区域0 的index 小于区域1 的index，所以在发生互相重叠的图像区域按高优先级的区域（区域1）Qp 设置。区域0 除了发生重

叠的部分的Qp 值等于10。区域1 的Qp值为25-10=15。

![image-20230104160929733](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104160929733.png)

<center>图5-3: ROI 编码</center>

接口：

AW_MPI_VENC_SetRoiCfg

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.8 非ROI 区域低帧率

非ROI 区域低帧率编码，即ROI 区域按正常帧率编码，非ROI 区域低帧率编码；用户可根据需要设置非ROI 区域的编码帧率。

接口：

AW_MPI_VENC_SetRoiBgFrameRate

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.9 P 帧帧内刷新

P 帧刷新ISlice/Intra 宏块行，可以为客户提供码流非常平滑的编码方式，每个I 帧和P 帧的大小可以非常接近。在网络带宽有限（如无线网络）的情况下，降低I 帧

过大带来的网络冲击，降低网传延时，降低网络传输出错的概率。

接口：

AW_MPI_VENC_SetIntraRefresh

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.10 OSD 叠加

venc 支持osd 叠加功能，osd 叠加最多可设置64 个区域，区域之间可以互相重合；osd 叠加包括三种类型，普通叠加功能，将用户指定的argb 数据叠加到指定的

位置上，将用户指定的argb数据叠加到指定的位置上并且根据背景的明暗程度反色叠加的图层亮度（即如果背景偏黑色则将图层叠加为白色，如果背景偏白色则将

图层叠加为黑色），将用户指定的yuv 数据填充到用户指定的区域中。

各个区域显示由优先级决定，优先级越大显示越在上层。

接口：

AW_MPI_VENC_SetRegion

示例：

参考《MPP_Sample_ 使用说明》中的sample_region。

#### 5.2.11 输入数据LBC 压缩模式省带宽

VENC 支持输入数据为LBC 模式的压缩数据格式，可有效节省DRAM 带宽，提高编码速度。

目前支持LBC1.0，LBC1.5，LBC2.0，LBC2.5 压缩数据格式。

LBC 压缩模式的限制
• LBC 压缩模式下编码不支持裁剪（crop），可使用VIPP 的裁剪功能AW_MPI_VI_SetCrop。
• LBC 压缩模式下编码不支持旋转（rotate）和镜像（mirror），可使用VIPP 的翻转（flip）和镜像（mirror）功能AW_MPI_VI_SetVippFlip 、

AW_MPI_VI_SetVippMirror。

接口：

AW_MPI_VENC_SetChnAttr

示例：

参考《MPP_Sample_ 使用说明》中的sample_virvi2venc2muxer。

#### 5.2.12 在线编码

VENC 支持在线编码功能。需要同时配置VIPP 和VENC 为在线模式，同时指定一致的共享buffer 个数（支持配置单buffer 模式和双buffer 模式）。

在线编码主要是指CSI 与VE 硬件在线传输视频采集数据。目的是为了节省buffer 占用。离线编码一般配置3 个buffer。若设置为在线编码双buufer 模式，则在线

编码比离线编码节省1 个buffer；若设置为在线编码单buffer 模式，则在线编码比离线编码节省2 个buffer。

在线编码的限制：

• 在线编码不支持旋转（Rotate）和鱼眼（Fisheye）。原因是旋转（Rotate）不从左上角开始取数，和在线的数据更新行为不兼容。

• 在线编码不支持彩转灰。原因是彩转灰功能主要的实现逻辑为：在ve 编码驱动层将uv 分量设置为0，由于在线模式ve 的图像数据与csi 直连的，驱动无法修改图

像数，故无法支持彩色转灰的功能。

• 在线编码不支持设置裁剪（crop）。原因是由于硬件限制，在线模式不支持crop 功能。

• 在线编码模式下，isp 只能连接一个Camera。如果要支持双Camera，另一个Camera 只能是并口，绕过ISP 经VIPP 输出。原因是在线编码模式下，isp 不能分时

复用，所以只能接一个mipi 接口。

• 在线编码模式下，只有VIPP0 支持在线模式。

• 在线编码模式下，VIPP0 不支持非绑定方式获取数据。原因是在线编码模式下，驱动CSI 与VE 绑定并直接传递数据，数据不经过MPP。

接口：

AW_MPI_VENC_SetChnAttr

注：VIPP 设置在线模式的接口为：AW_MPI_VI_SetVippAttr

示例：

参考《MPP_Sample_ 使用说明》中的sample_OnlineVenc。

### 5.3 状态图

![image-20230104161222067](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230104161222067.png)

<center>图5-4: VENC 状态图</center>

Venc 组件内部状态设定为：

• COMP_StateLoaded：组件初始创建状态。

• COMP_StateIdle：组件完成初始化，参数设置、资源配置完毕，随时可以运行的状态。

• COMP_StateExecuting：运行状态。

• COMP_StateInvalid：异常状态。

函数AW_MPI_VENC_CreateChn() 的实现过程会经过COMP_StateLoaded 状态，到达COMP_StateIdle。

组件内部状态转换的函数是：

SendCommand(..., COMP_CommandStateSet, 目标COMP_State, ...);

每个API 只能在允许的状态下调用，如果不在允许的状态下调用API，则无效。API 列表如下：

(允许被调用的状态栏填写Y)

| API                               | Idle | Executing |
| --------------------------------- | ---- | --------- |
| AW_MPI_VENC_CreateChn             |      |           |
| AW_MPI_VENC_DestroyChn            | Y    |           |
| AW_MPI_VENC_ResetChn              | Y    |           |
| AW_MPI_VENC_StartRecvPic          | Y    |           |
| AW_MPI_VENC_StartRecvPicEx        | Y    |           |
| AW_VENC_StopRecvPic               |      | Y         |
| AW_MPI_VENC_DestroyEncoder        | Y    |           |
| AW_MPI_VENC_Query                 | Y    | Y         |
| AW_MPI_VENC_RegisterCallback      | Y    | Y         |
| AW_MPI_VENC_SetChnAttr            | Y    | Y         |
| AW_MPI_VENC_GetChnAttr            | Y    | Y         |
| AW_MPI_VENC_GetStream             | Y    | Y         |
| AW_MPI_VENC_ReleaseStream         | Y    | Y         |
| AW_MPI_VENC_SendFrame             | Y    | Y         |
| AW_MPI_VENC_RequestIDR            |      | Y         |
| AW_MPI_VENC_GetHandle             | Y    | Y         |
| AW_MPI_VENC_SetRoiCfg             | Y    | Y         |
| AW_MPI_VENC_GetRoiCfg             | Y    | Y         |
| AW_MPI_VENC_SetRoiBgFrameRate     | Y    | Y         |
| AW_MPI_VENC_GetRoiBgFrameRate     | Y    | Y         |
| AW_MPI_VENC_SetH264Vui            | Y    | Y         |
| AW_MPI_VENC_GetH264Vui            | Y    | Y         |
| AW_MPI_VENC_SetH265Vui            | Y    | Y         |
| AW_MPI_VENC_GetH265Vui            | Y    | Y         |
| AW_MPI_VENC_GetH264SpsPpsInfo     | Y    | Y         |
| AW_MPI_VENC_GetH265SpsPpsInfo     | Y    | Y         |
| AW_MPI_VENC_SetJpegParam          | Y    | Y         |
| AW_MPI_VENC_GetJpegParam          | Y    | Y         |
| AW_MPI_VENC_SetJpegExifInfo       | Y    | Y         |
| AW_MPI_VENC_GetJpegExifInfo       | Y    | Y         |
| AW_MPI_VENC_GetJpegThumbBuffer    |      | Y         |
| AW_MPI_VENC_GetDayOrNight         | Y    | Y         |
| AW_MPI_VENC_SetDayOrNight         | Y    | Y         |
| AW_MPI_VENC_GetHighPassFilter     | Y    | Y         |
| AW_MPI_VENC_SetHighPassFilter     | Y    | Y         |
| AW_MPI_VENC_SetFrameRate          | Y    | Y         |
| AW_MPI_VENC_GetFrameRate          | Y    | Y         |
| AW_MPI_VENC_SetTimeLapse          | Y    | Y         |
| AW_MPI_VENC_GetTimeLapse          | Y    | Y         |
| AW_MPI_VENC_SetRcParam            | Y    | Y         |
| AW_MPI_VENC_GetRcParam            | Y    | Y         |
| AW_MPI_VENC_SetColor2Grey         | Y    | Y         |
| AW_MPI_VENC_GetColor2Grey         | Y    | Y         |
| AW_MPI_VENC_SetCrop               | Y    | Y         |
| AW_MPI_VENC_GetCrop               | Y    | Y         |
| AW_MPI_VENC_SetSuperFrameCfg      | Y    | Y         |
| AW_MPI_VENC_GetSuperFrameCfg      | Y    | Y         |
| AW_MPI_VENC_SetIntraRefresh       | Y    | Y         |
| AW_MPI_VENC_GetIntraRefresh       | Y    | Y         |
| AW_MPI_VENC_SetSmartP             | Y    | Y         |
| AW_MPI_VENC_GetSmartP             | Y    | Y         |
| AW_MPI_VENC_SetBrightness         | Y    | Y         |
| AW_MPI_VENC_GetBrightness         | Y    | Y         |
| AW_MPI_VENC_SetVEFreq             | Y    | Y         |
| AW_MPI_VENC_Set3DNR               | Y    | Y         |
| AW_MPI_VENC_Get3DNR               | Y    | Y         |
| AW_MPI_VENC_Set2DFilter           | Y    | Y         |
| AW_MPI_VENC_Set3DFilter           | Y    | Y         |
| AW_MPI_VENC_GetCacheState         | Y    | Y         |
| AW_MPI_VENC_SetRefParam           | Y    |           |
| AW_MPI_VENC_GetRefParam           | Y    | Y         |
| AW_MPI_VENC_SetHorizonFlip        | Y    | Y         |
| AW_MPI_VENC_GetHorizonFlip        | Y    | Y         |
| AW_MPI_VENC_SetAdaptiveIntraInP   | Y    |           |
| AW_MPI_VENC_SetH264SVCSkip        | Y    |           |
| AW_MPI_VENC_EnableNullSkip        | Y    |           |
| AW_MPI_VENC_EnablePSkip           | Y    |           |
| AW_MPI_VENC_ForbidDiscardingFrame | Y    |           |
| AW_MPI_VENC_EnableMotionSearch    |      | Y         |
| AW_MPI_VENC_GetMotionSearchResult |      | Y         |
| AW_MPI_VENC_SaveBsFile            | Y    | Y         |
| AW_MPI_VENC_SetProcSet            | Y    | Y         |
| AW_MPI_VENC_GetVe2IspParam        |      | Y         |
| AW_MPI_VENC_EnableWbYUV           | Y    |           |
| AW_MPI_VENC_GetThumbYUV           |      | Y         |

### 5.4 API 接口

视频编码模块主要提供视频编码通道的创建和销毁、视频编码通道的复位、开启和停止接收图像、设置和获取编码通道属性、获取和释放码流等功能。

VENC 目前对外支持的API 接口：
• AW_MPI_VENC_CreateChn ：创建组件。
• AW_MPI_VENC_DestroyChn ：销毁组件。
• AW_MPI_VENC_ResetChn ：重置组件到初始化状态。
• AW_MPI_VENC_StartRecvPic ：启动编码。
• AW_MPI_VENC_StartRecvPicEx ：启动编码，并且编码指定的帧数。
• AW_MPI_VENC_StopRecvPic ：停止编码。
• AW_MPI_VENC_DestroyEncoder ：销毁编码器。
• AW_MPI_VENC_Query ：查询组件实时信息。
• AW_MPI_VENC_RegisterCallback ：注册组件callback。
• AW_MPI_VENC_SetChnAttr ：设置编码通道属性，只能设置动态属性。
• AW_MPI_VENC_GetChnAttr ：获取编码通道属性。
• AW_MPI_VENC_GetStream ：获取编码后的码流。只能用于非绑定模式。
• AW_MPI_VENC_ReleaseStream ：归还码流。只能用于非绑定模式。
• AW_MPI_VENC_SendFrame ：发送待编码的图像。只能用于非绑定模式。
• AW_MPI_VENC_RequestIDR ：立即编码I 帧。
• AW_MPI_VENC_GetHandle ：获取编码器编码管道文件句柄。
• AW_MPI_VENC_SetRoiCfg ：设置编码器感兴趣区域。
• AW_MPI_VENC_GetRoiCfg ：获取编码器感兴趣区域。
• AW_MPI_VENC_SetRoiBgFrameRate ：设置感兴趣区域编码的背景帧率。
• AW_MPI_VENC_GetRoiBgFrameRate ：获取感兴趣区域编码的背景帧率。
• AW_MPI_VENC_SetH264Vui ：设置H264 VUI 参数。
• AW_MPI_VENC_GetH264Vui ：获取H264 VUI 参数。
• AW_MPI_VENC_SetH265Vui ：设置H265 VUI 参数。
• AW_MPI_VENC_GetH265Vui ：获取H265 VUI 参数。
• AW_MPI_VENC_GetH264SpsPpsInfo ：获取H264 编码帧头SPS、PPS。给MUX 组件使用。
• AW_MPI_VENC_GetH265SpsPpsInfo ：获取H265 编码帧头SPS、PPS。给MUX 组件使用。
• AW_MPI_VENC_SetJpegParam ：设置JPEG 编码参数。
• AW_MPI_VENC_GetJpegParam ：获取JPEG 编码参数。
• AW_MPI_VENC_SetJpegExifInfo ：设置JPEG 图片的描述信息。
• AW_MPI_VENC_GetJpegExifInfo ：获取JPEG 图片的描述信息。
• AW_MPI_VENC_GetJpegThumbBuffer ：获取JPEG 缩略图buffer 信息。
• AW_MPI_VENC_GetDayOrNight ：获取夜间模式。
• AW_MPI_VENC_SetDayOrNight ：设置夜间模式。
• AW_MPI_VENC_GetHighPassFilter ：获取高通滤波参数。
• AW_MPI_VENC_SetHighPassFilter ：设置高通滤波参数。
• AW_MPI_VENC_SetFrameRate ：设置编码通道的帧率控制属性。
• AW_MPI_VENC_GetFrameRate ：获取编码通道的帧率控制属性。
• AW_MPI_VENC_SetTimeLapse ：设置编码通道缩时/慢摄影编码的帧间隔时间。
• AW_MPI_VENC_GetTimeLapse ：获取编码通道缩时/慢摄影编码的帧间隔时间。
• AW_MPI_VENC_SetRcParam ：设置编码通道的码率控制属性。
• AW_MPI_VENC_GetRcParam ：获取编码通道的码率控制属性。
• AW_MPI_VENC_SetColor2Grey ：开启或关闭一个通道的彩转灰功能。
• AW_MPI_VENC_GetColor2Grey ：获取一个通道是否开启彩转灰功能。
• AW_MPI_VENC_SetCrop ：设置裁剪区域。
• AW_MPI_VENC_GetCrop ：获取裁剪区域。
• AW_MPI_VENC_SetSuperFrameCfg ：设置超大帧重编码处理参数。
• AW_MPI_VENC_GetSuperFrameCfg ：获取超大帧重编码处理参数。
• AW_MPI_VENC_SetIntraRefresh ：设置编码的P 帧使用帧内预测属性。
• AW_MPI_VENC_GetIntraRefresh ：获取编码的P 帧使用帧内预测属性。
• AW_MPI_VENC_SetSmartP ：设置编码的smart 编码属性。
• AW_MPI_VENC_GetSmartP ：获取编码的smart 编码属性。
• AW_MPI_VENC_SetBrightness ：设置编码的亮暗阈值属性。
• AW_MPI_VENC_GetBrightness ：获取编码的亮暗阈值属性。
• AW_MPI_VENC_SetVEFreq ：设置VE 的硬件频率。
• AW_MPI_VENC_Set2DFilter ：设置2D 降噪高级参数。
• AW_MPI_VENC_Get2DFilter ：获取2D 降噪高级参数。
• AW_MPI_VENC_Set3DFilter ：设置3D 降噪高级参数。
• AW_MPI_VENC_Get3DFilter ：获取3D 降噪高级参数。
• AW_MPI_VENC_GetCacheState ：获取视频编码库缓冲状态。
• AW_MPI_VENC_SetRefParam ：设置编码高级跳帧参考。
• AW_MPI_VENC_GetRefParam ：获取编码高级跳帧参考参数。
• AW_MPI_VENC_SetHorizonFlip ：开启或关闭水平镜像功能。
• AW_MPI_VENC_GetHorizonFlip ：获取水平镜像功能开关状态。
• AW_MPI_VENC_SetAdaptiveIntraInP ：设置自适应调整P 帧帧内预测等级属性。
• AW_MPI_VENC_SetH264SVCSkip ：设置时域可伸缩编码及跳帧。注意不能与插帧混用。
• AW_MPI_VENC_EnableNullSkip ：开启或关闭插空帧功能。
• AW_MPI_VENC_EnablePSkip ：开启或关闭插帧功能。
• AW_MPI_VENC_ForbidDiscardingFrame ：设置组件编码失败禁止丢帧模式。
• AW_MPI_VENC_EnableMotionSearch ：开启或关闭移动侦测功能。
• AW_MPI_VENC_GetMotionSearchResult ：获取移动侦测结果。
• AW_MPI_VENC_SaveBsFile ：设置编码库保存码流。
• AW_MPI_VENC_SetProcSet ：设置动态抓取VE 的proc 调试信息参数。
• AW_MPI_VENC_GetVe2IspParam ：获取VE2ISP 参数。
• AW_MPI_VENC_EnableWbYUV ：使能YUV 回写功能。
• AW_MPI_VENC_GetThumbYUV ：获取YUV Thumb 数据。

#### 5.4.1 AW_MPI_VENC_CreateChn

【描述】

创建一个编码通道。

【语法】

```
ERRORTYPE AW_MPI_VENC_CreateChn(VENC_CHN VeChn, const VENC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述                                 | 输入/输出 |
| ----- | ------------------------------------ | --------- |
| VeChn | 通道ID 号，范围[0, VENC_MAX_CHN_NUM) | 输入      |
| pAttr | 编码通道属性。                       | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

创建后状态为COMP_StateIdle。

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.2 AW_MPI_VENC_DestroyChn

【描述】

销毁一个编码通道。

【语法】

```
ERRORTYPE AW_MPI_VENC_DestroyChn(VENC_CHN VeChn);
```

【参数】

| 参数  | 描述                                   | 输入/输出 |
| ----- | -------------------------------------- | --------- |
| VeChn | 通道ID 号，范围：[0, VENC_MAX_CHN_NUM) | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.3 AW_MPI_VENC_ResetChn

【描述】

重置编码通道到初始化状态。

【语法】

ERRORTYPE AW_MPI_VENC_ResetChn(VENC_CHN VeChn);

【参数】

| 参数  | 描述                                   | 输入/输出 |
| ----- | -------------------------------------- | --------- |
| VeChn | 通道ID 号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.4 AW_MPI_VENC_StartRecvPic

【描述】

启动编码。

【语法】

```
ERRORTYPE AW_MPI_VENC_StartRecvPic(VENC_CHN VeChn);
```

【参数】

| 参数  | 描述                                   | 输入/输出 |
| ----- | -------------------------------------- | --------- |
| VeChn | 通道ID 号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
引起状态转换，切换到Executing。

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.5 AW_MPI_VENC_StartRecvPicEx

【描述】

启动编码，并且编码指定的帧数。

【语法】

ERRORTYPE AW_MPI_VENC_StartRecvPicEx(VENC_CHN VeChn, VENC_RECV_PIC_PARAM_S *pRecvParam);

【参数】

| 参数       | 描述                                   | 输入/输出 |
| ---------- | -------------------------------------- | --------- |
| VeChn      | 通道ID 号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| pRecvParam | 指定接收帧数。                         | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

引起状态转换，切换到Executing。

【举例】

无

#### 5.4.6 AW_MPI_VENC_StopRecvPic

【描述】

停止编码。

【语法】

```
ERRORTYPE AW_MPI_VENC_StopRecvPic(VENC_CHN VeChn);
```

【参数】

| 参数  | 描述                                    | 输入/输出 |
| ----- | --------------------------------------- | --------- |
| VeChn | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

引起状态转换，切换到Idle 状态。

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.7 AW_MPI_VENC_DestroyEncoder

【描述】

销毁编码器。

【语法】

```
ERRORTYPE AW_MPI_VENC_DestroyEncoder(VENC_CHN VeChn);
```

【参数】

| 参数  | 描述                                    | 输入/输出 |
| ----- | --------------------------------------- | --------- |
| VeChn | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc
```

#### 5.4.8 AW_MPI_VENC_Query

【描述】

查询编码通道状态。

【语法】

```
ERRORTYPE AW_MPI_VENC_Query(VENC_CHN VeChn, VENC_CHN_STAT_S *pStat);
```

【参数】

| 参数  | 描述                                    | 输入/输出 |
| ----- | --------------------------------------- | --------- |
| VeChn | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| pStat | 状态参数。                              | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】
无

#### 5.4.9 AW_MPI_VENC_RegisterCallback

【描述】

设置编码通道回调函数。

【语法】

```
ERRORTYPE AW_MPI_VENC_RegisterCallback(VENC_CHN VeChn, MPPCallbackInfo *pCallback);
```

【参数】

| 参数      | 描述                                    | 输入/输出 |
| --------- | --------------------------------------- | --------- |
| VeChn     | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| pCallback | 回调参数。                              | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.10 AW_MPI_VENC_SetChnAttr

【描述】

设置编码通道属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetChnAttr(VENC_CHN VeChn, const VENC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述                                    | 输入/输出 |
| ----- | --------------------------------------- | --------- |
| VeChn | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| pAttr | 通道属性。                              | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

只能设置动态属性。

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.11 AW_MPI_VENC_GetChnAttr

【描述】

获取编码通道属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetChnAttr(VENC_CHN VeChn, VENC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述                                    | 输入/输出 |
| ----- | --------------------------------------- | --------- |
| VeChn | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| pAttr | 通道属性。                              | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

```
sample_virvi2venc
```

#### 5.4.12 AW_MPI_VENC_GetStream

【描述】

获取编码器编码后的码流。

【语法】

ERRORTYPE AW_MPI_VENC_GetStream(VENC_CHN VeChn, VENC_STREAM_S *pStream, int nMilliSec);

【参数】

| 参数      | 描述                                                         | 输入/输出 |
| --------- | ------------------------------------------------------------ | --------- |
| VeChn     | 编码通道号。范围：[0, VENC_MAX_CHN_NUM)                      | 输入      |
| pStream   | 编码后的码流。                                               | 输出      |
| nMilliSec | 获取数据的超时时间。-1 表示阻塞模式；0 表示非阻塞模式；>0<br/>表示阻塞s32MilliSec 毫秒，超时则报错返回。取值范围：(0,+∞) | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅限于venc 组件非绑定模式。与AW_MPI_VENC_ReleaseStream 必须成对使用，否则编码器bit stream 内存不会被释放。

【举例】

```
sample_venc2muxer
sample_virvi
sample_multi_vi2venc2muxer
sample_virvi2eis2venc
```



#### 5.4.13 AW_MPI_VENC_ReleaseStream

【描述】

释放已获取的编码器编码码流（内存）。

【语法】

```
ERRORTYPE AW_MPI_VENC_ReleaseStream(VENC_CHN VeChn, VENC_STREAM_S *pStream);
```

【参数】

| 参数    | 描述                                    | 输入/输出 |
| ------- | --------------------------------------- | --------- |
| VeChn   | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| pStream | 通过GetStream 获取的编码码流。          | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅限于venc 组件非绑定模式。与AW_MPI_VENC_GetStream 必须成对使用，否则编码器bit stream 内存不会被释放。

【举例】

```
sample_venc2muxer
sample_virvi
sample_multi_vi2venc2muxer
sample_virvi2eis2venc
```

#### 5.4.14 AW_MPI_VENC_SendFrame

【描述】

向编码器传送待编码图像数据帧。

【语法】

```
ERRORTYPE AW_MPI_VENC_SendFrame(VENC_CHN VeChn, VIDEO_FRAME_INFO_S *pFrame ,int nMilliSec);
```

【参数】

| 参数      | 描述                                                         | 输入/输出 |
| --------- | ------------------------------------------------------------ | --------- |
| VeChn     | 编码通道号。范围：[0, VENC_MAX_CHN_NUM)                      | 输入      |
| pFrame    | 图像数据帧                                                   | 输入      |
| nMilliSec | 发送数据的超时时间。-1 表示阻塞模式；<br/> >0 表示阻塞s32MilliSec 毫秒，超时则报错返回。 | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅限venc 组件非绑定模式使用。

【举例】

```
sample_venc2muxer
sample_virvi
sample_multi_vi2venc2muxer
sample_virvi2eis2venc
```

#### 5.4.15 AW_MPI_VENC_RequestIDR

【描述】

立即编码I 帧。

【语法】

```
ERRORTYPE AW_MPI_VENC_RequestIDR(VENC_CHN VeChn, BOOL bInstant);
```

【参数】

| 参数     | 描述                                    | 输入/输出 |
| -------- | --------------------------------------- | --------- |
| VeChn    | 编码通道号。范围：[0, VENC_MAX_CHN_NUM) | 输入      |
| bInstant | 未使用。                                | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.16 AW_MPI_VENC_GetHandle

【描述】

获取编码器编码管道文件句柄。

【语法】

```
int AW_MPI_VENC_GetHandle (VENC_CHN VeChn);
```

【参数】

| 参数  | 描述                                      | 输入/输出 |
| ----- | ----------------------------------------- | --------- |
| VeChn | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |



【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| >= 0   | 句柄编号             |
| < 0    | 失败，其值见错误码。 |


【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_vi2venc2muxer
```

#### 5.4.17 AW_MPI_VENC_SetRoiCfg

【描述】

设置编码器感兴趣区域。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetRoiCfg(VENC_CHN VeChn, VENC_ROI_CFG_S *pVencRoiCfg);
```

【参数】

| 参数        | 描述                                      | 输入/输出 |
| ----------- | ----------------------------------------- | --------- |
| VeChn       | 编码通道号。范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pVencRoiCfg | 感兴趣区域。                              | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

```
sample_region
sample_twinchn_virvi2venc2ce
sample_vi2venc2muxer
```

#### 5.4.18 AW_MPI_VENC_GetRoiCfg

【描述】

获取编码器感兴趣区域。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetRoiCfg(VENC_CHN VeChn, unsigned int nIndex, VENC_ROI_CFG_S *pVencRoiCfg);
```

【参数】

| 参数        | 描述                                      | 输入/输出 |
| ----------- | ----------------------------------------- | --------- |
| VeChn       | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pVencRoiCfg | 感兴趣区域。                              | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】
无

#### 5.4.19 AW_MPI_VENC_SetRoiBgFrameRate

【描述】

设置感兴趣区域编码的背景帧率。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetRoiBgFrameRate(VENC_CHN VeChn, const VENC_ROIBG_FRAME_RATE_S *pstRoiBgFrmRate);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pstRoiBgFrmRate | 背景帧率信息。                            | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

```
sample_vi2venc2muxer
```

#### 5.4.20 AW_MPI_VENC_GetRoiBgFrameRate

【描述】

获取感兴趣区域编码的背景帧率。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetRoiBgFrameRate(VENC_CHN VeChn, VENC_ROIBG_FRAME_RATE_S *pstRoiBgFrmRate);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pstRoiBgFrmRate | 背景帧率信息。                            | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_vi2venc2muxer
```

#### 5.4.21 AW_MPI_VENC_SetH264Vui

【描述】

设置H264 VUI 参数。主要包括帧率等。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetH264Vui(VENC_CHN VeChn, const VENC_PARAM_H264_VUI_S *pH264Vui);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pH264Vui | H264 VUI 信息。                           | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_vi2venc2muxer
```

#### 5.4.22 AW_MPI_VENC_GetH264Vui

【描述】

获取H264 VUI 参数。主要包括帧率等。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetH264Vui(VENC_CHN VeChn, VENC_PARAM_H264_VUI_S *pH264Vui);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pH264Vui | H264 VUI 信息。                           | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_vi2venc2muxer
```

#### 5.4.23 AW_MPI_VENC_SetH265Vui

【描述】

设置H265 VUI 参数。主要包括帧率等。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetH265Vui(VENC_CHN VeChn, const VENC_PARAM_H265_VUI_S *pH265Vui);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pH265Vui | H265 VUI 信息。                           | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

```
sample_vi2venc2muxer
```

#### 5.4.24 AW_MPI_VENC_GetH265Vui

【描述】

获取H265 VUI 参数。主要包括帧率等。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetH265Vui(VENC_CHN VeChn, VENC_PARAM_H265_VUI_S *pH265Vui);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pH265Vui | H265 VUI 信息。                           | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_vi2venc2muxer
```

#### 5.4.25 AW_MPI_VENC_GetH264SpsPpsInfo

【描述】

获取编码器H264 编码的sps、pps 头信息。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetH264SpsPpsInfo(VENC_CHN VeChn, VencHeaderData*pH264SpsPpsInfo);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pH264SpsPpsInfo | sps、pps 信息。                           | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.26 AW_MPI_VENC_GetH265SpsPpsInfo

【描述】

获取编码器H265 编码的sps、pps 头信息。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetH265SpsPpsInfo(VENC_CHN VeChn, VencHeaderData *pH264SpsPpsInfo);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pH265SpsPpsInfo | sps、pps 信息。                           | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.27 AW_MPI_VENC_SetJpegParam

【描述】

设置JPEG 协议编码通道的高级参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetJpegParam(VENC_CHN VeChn, const VENC_PARAM_JPEG_S *pJpegParam);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pJpegParam | jpeg 编码参数。                           | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_venc
sample_uvcout
sample_virvi
sample_multi_vi2venc2muxer
```

#### 5.4.28 AW_MPI_VENC_GetJpegParam

【描述】

获取编码器jpeg 编码参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetJpegParam(VENC_CHN VeChn, const VENC_PARAM_JPEG_S *pJpegParam);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pJpegParam | jpeg 编码参数。                           | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.29 AW_MPI_VENC_SetJpegExifInfo

【描述】

设置JPEG 图片的描述信息，包括快门速度，曝光时间，GPS 信息，缩略图信息等。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetJpegExifInfo(VENC_CHN VeChn, const VENC_EXIFINFO_S*pJpegExifInfo);
```

【参数】

| 参数          | 描述                                      | 输入/输出 |
| ------------- | ----------------------------------------- | --------- |
| VeChn         | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pJpegExifInfo | jpegExif 编码参数。                       | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

JPEG 图片的描述信息，包括快门速度，曝光时间，GPS 信息，缩略图信息等。

【举例】

无

#### 5.4.30 AW_MPI_VENC_GetJpegExifInfo

【描述】

获取JPEG 图片的描述信息，包括快门速度，曝光时间，GPS 信息，缩略图信息等。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetJpegExifInfo(VENC_CHN VeChn, const VENC_EXIFINFO_S*pJpegExifInfo);
```

【参数】

| 参数          | 描述                                      | 输入/输出 |
| ------------- | ----------------------------------------- | --------- |
| VeChn         | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pJpegExifInfo | jpegExif 编码参数。                       | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

JPEG 图片的描述信息，包括快门速度，曝光时间，GPS 信息，缩略图信息等。

【举例】

无

#### 5.4.31 AW_MPI_VENC_GetJpegThumbBuffer

【描述】

获取编码器jpeg 缩略图编码buffer。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetJpegThumbBuffer(VENC_CHN VeChn, VENC_JPEG_THUMB_BUFFER_S *pThumbBuffer);
```

【参数】

| 参数         | 描述                                      | 输入/输出 |
| ------------ | ----------------------------------------- | --------- |
| VeChn        | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pThumbBuffer | 缩略图buffer                              | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi
sample_multi_vi2venc2muxer
```

#### 5.4.32 AW_MPI_VENC_GetDayOrNight

【描述】

获取夜间模式。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetDayOrNight(VENC_CHN VeChn, int *DayOrNight);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| DayOrNight | 夜间模式。                                | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.33 AW_MPI_VENC_SetDayOrNight

【描述】

设置夜间模式。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetDayOrNight(VENC_CHN VeChn, int *DayOrNight);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| DayOrNight | 夜间模式。                                | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.34 AW_MPI_VENC_GetHighPassFilter

【描述】

获取高通滤波参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetHighPassFilter(VENC_CHN VeChn, VencHighPassFilter *pHighPassFilter);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pHighPassFilter | 高通滤波参数。                            | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

高通滤波属于频率域滤波，它保留高频，抑制低频，是图像锐化的一种方式。

【举例】

无

#### 5.4.35 AW_MPI_VENC_SetHighPassFilter

【描述】

设置高通滤波参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetHighPassFilter(VENC_CHN VeChn, const VencHighPassFilter *pHighPassFilter);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pHighPassFilter | 高通滤波参数。                            | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

高通滤波属于频率域滤波，它保留高频，抑制低频，是图像锐化的一种方式。

【举例】

无

#### 5.4.36 AW_MPI_VENC_SetFrameRate

【描述】

设置编码通道帧率控制属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetFrameRate(VENC_CHN VeChn, const VENC_FRAME_RATE_S *pFrameRate);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pFrameRate | 帧率属性                                  | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_CodecParallel
sample_multi_vi2venc2muxer
sample_venc
sample_venc2muxer
sample_virvi2venc
```

#### 5.4.37 AW_MPI_VENC_GetFrameRate

【描述】

获取编码通道帧率。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetFrameRate(VENC_CHN VeChn, const VENC_FRAME_RATE_S *pFrameRate);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pFrameRate | 帧率属性。                                | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc
```

#### 5.4.38 AW_MPI_VENC_SetTimeLapse

【描述】

设置编码通道缩时/慢摄影编码的帧间隔时间。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetTimeLapse(VENC_CHN VeChn, int64_t nTimeLapse);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| nTimeLapse | 编码帧的间隔时间，单位微秒。静态属性。    | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

设置后，编码通道根据编码帧间隔时间选定输入帧进行编码，编码后的输出帧的PTS 根据编码通道目标输出帧率重新设置，从0 开始，以确保录制的文件播放时按

照输出帧率进行播放。

【举例】

```
sample_timelapse
sample_multi_vi2venc2muxer
```

#### 5.4.39 AW_MPI_VENC_GetTimeLapse

【描述】

获取编码通道缩时/慢摄影编码的帧间隔时间。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetTimeLapse(VENC_CHN VeChn, int64_t *pTimeLapse);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pTimeLapse | 编码帧的间隔时间，单位微秒。              | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.40 AW_MPI_VENC_SetColor2Grey

【描述】

开启或关闭一个通道的彩转灰功能。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetColor2Grey(VENC_CHN VeChn, const VENC_COLOR2GREY_S *pChnColor2Grey);
```

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pChnColor2Grey | 彩转灰配置信息。                          | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc2muxer
```

#### 5.4.41 AW_MPI_VENC_GetColor2Grey

【描述】

获取一个通道是否开启彩转灰功能。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetColor2Grey(VENC_CHN VeChn, VENC_COLOR2GREY_S *pChnColor2Grey);
```

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pChnColor2Grey | 获取开启或关闭彩转灰功能的参数。          | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc2muxer
```

#### 5.4.42 AW_MPI_VENC_SetCrop

【描述】

设置编码通道编码裁剪区域。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetCrop(VENC_CHN VeChn, const VENC_CROP_CFG_S *pCropCfg);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pCropCfg | 裁剪区域。动态属性。                      | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.43 AW_MPI_VENC_GetCrop

【描述】

获取编码通道编码裁剪区域。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetCrop(VENC_CHN VeChn, VENC_CROP_CFG_S *pCropCfg);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pCropCfg | 裁剪区域                                  | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】
无

#### 5.4.44 AW_MPI_VENC_SetSuperFrameCfg

【描述】

设置超大帧重编码处理参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetSuperFrameCfg(VENC_CHN VeChn, const VENC_SUPERFRAME_CFG_S *pSuperFrmParam);
```

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSuperFrmParam | 超大帧参数。                              | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.45 AW_MPI_VENC_GetSuperFrameCfg

【描述】

获取超大帧重编码处理参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetSuperFrameCfg(VENC_CHN VeChn,VENC_SUPERFRAME_CFG_S *pSuperFrmParam);
```

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSuperFrmParam | 超大帧参数。                              | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.46 AW_MPI_VENC_SetIntraRefresh

【描述】

P 帧帧内刷新。设置刷I 宏块的参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetIntraRefresh(VENC_CHN VeChn, VENC_PARAM_INTRA_REFRESH_S *pIntraRefresh)
```

【参数】

| 参数          | 描述                                      | 输入/输出 |
| ------------- | ----------------------------------------- | --------- |
| VeChn         | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pIntraRefresh | P 帧帧内刷新，刷I 宏块的设置参数。        | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc2muxer
```

#### 5.4.47 AW_MPI_VENC_GetIntraRefresh

【描述】

P 帧帧内刷新。获取刷I 宏块的参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetIntraRefresh(VENC_CHN VeChn, VENC_PARAM_INTRA_REFRESH_S *pIntraRefresh)
```

【参数】

| 参数          | 描述                                      | 输入/输出 |
| ------------- | ----------------------------------------- | --------- |
| VeChn         | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pIntraRefresh | P 帧帧内刷新，刷I 宏块的设置参数。        | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.48 AW_MPI_VENC_SetSmartP

【描述】

设置P 帧smart 编码参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetSmartP(VENC_CHN VeChn, VencSmartFun *pSmartPParam);
```

【参数】

| 参数         | 描述                                      | 输入/输出 |
| ------------ | ----------------------------------------- | --------- |
| VeChn        | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSmartPParam | smart 编码参数。                          | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.49 AW_MPI_VENC_GetSmartP

【描述】

获取smart 编码参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetSmartP(VENC_CHN VeChn, VencSmartFun *pSmartPParam);
```

【参数】

| 参数         | 描述                                      | 输入/输出 |
| ------------ | ----------------------------------------- | --------- |
| VeChn        | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSmartPParam | smart 编码参数。                          | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.50 AW_MPI_VENC_SetBrightness

【描述】

配置h264 和h265 编码的亮暗阈值属性，和smart 编码配合使用。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetBrightness(VENC_CHN VeChn, VencBrightnessS *pBrightness);
```

【参数】

| 参数        | 描述                                      | 输入/输出 |
| ----------- | ----------------------------------------- | --------- |
| VeChn       | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pBrightness | 亮暗阈值属性。                            | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.51 AW_MPI_VENC_GetBrightness

【描述】

获取亮暗阈值属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetBrightness(VENC_CHN VeChn, VencBrightnessS *pBrightness);
```

【参数】

| 参数         | 描述                                      | 输入/输出 |
| ------------ | ----------------------------------------- | --------- |
| VeChn        | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSmartPParam | 亮暗阈值属性。                            | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.52 AW_MPI_VENC_SetQPMAP

【描述】

设置编码的qp_map 属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetQPMAP(VENC_CHN VeChn, const VencMBModeCtrl *pQPMAP);
```

【参数】

| 参数   | 描述                                      | 输入/输出 |
| ------ | ----------------------------------------- | --------- |
| VeChn  | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pQPMAP | QP MAP 属性。                             | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.53 AW_MPI_VENC_SetQPMAPMBInfoOutput

【描述】

设置编码的宏块信息获取属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetQPMAPMBInfoOutput(VENC_CHN VeChn, const VencMBInfo *pQpMapMBInfo);
```

【参数】

| 参数         | 描述                                      | 输入/输出 |
| ------------ | ----------------------------------------- | --------- |
| VeChn        | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pQpMapMBInfo | QP MAP MB 输出属性。                      | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.54 AW_MPI_VENC_GetQPMAPMBSumInfoOutput

【描述】

获取编码的宏块信息和属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetQPMAPMBSumInfoOutput(VENC_CHN VeChn, VencMBSumInfo *pQpMapMBSumInfo);
```

【参数】

| 参数            | 描述                                      | 输入/输出 |
| --------------- | ----------------------------------------- | --------- |
| VeChn           | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pQpMapMBSumInfo | QP MAP MB 属性。                          | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.55 AW_MPI_VENC_SetVEFreq

【描述】

设置编码引擎时钟频率。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetVEFreq(VENC_CHN VeChn, int nFreq); //nFreq: MHz;
```

【参数】

| 参数  | 描述                                                         | 输入/输出 |
| ----- | ------------------------------------------------------------ | --------- |
| VeChn | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。                    | 输入      |
| nFreq | 引擎时钟频率，单位MHz。范围：[480, 532, 600]， <br/>默认480，推荐532。动态属性。 | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.56 AW_MPI_VENC_Set2DFilter

【描述】

设置2D 降噪高级参数。

【语法】

ERRORTYPE AW_MPI_VENC_Set2DFilter(VENC_CHN VeChn, const s2DfilterParam *p2DfilterParam);

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| p2DfilterParam | 3d 降噪高级参数。动态属性。               | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.57 AW_MPI_VENC_Get2DFilter

【描述】

获取2D 降噪高级参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_Get2DFilter(VENC_CHN VeChn, s2DfilterParam *p2DfilterParam);
```

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| p2DfilterParam | 3d 降噪高级参数。动态属性。               | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.58 AW_MPI_VENC_Set3DFilter

【描述】

设置3D 降噪高级参数。

【语法】

ERRORTYPE AW_MPI_VENC_Set3DFilter(VENC_CHN VeChn, const s3DfilterParam *p3DfilterParam);

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| p3DfilterParam | 3d 降噪高级参数。动态属性。               | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.59 AW_MPI_VENC_Get3DFilter

【描述】

获取3D 降噪高级参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_Get3DFilter(VENC_CHN VeChn, s3DfilterParam *p3DfilterParam);
```

【参数】

| 参数           | 描述                                      | 输入/输出 |
| -------------- | ----------------------------------------- | --------- |
| VeChn          | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| p3DfilterParam | 3d 降噪高级参数。动态属性。               | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc2muxer
```

#### 5.4.60 AW_MPI_VENC_GetCacheState

【描述】

获取视频编码库缓冲状态。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetCacheState(VENC_CHN VeChn, CacheState *pCacheState);
```

【参数】

| 参数        | 描述                                      | 输入/输出 |
| ----------- | ----------------------------------------- | --------- |
| VeChn       | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pCacheState | 视频编码库缓冲状态。动态属性。            | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.61 AW_MPI_VENC_SetRefParam

【描述】

设置编码高级跳帧参考。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetRefParam(VENC_CHN VeChn, const VENC_PARAM_REF_S *pstRefParam);
```

【参数】

| 参数        | 描述                                      | 输入/输出 |
| ----------- | ----------------------------------------- | --------- |
| VeChn       | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pstRefParam | 高级跳帧参考参数。静态属性。              | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_virvi2venc2muxer
```

#### 5.4.62 AW_MPI_VENC_GetRefParam

【描述】

获取编码高级跳帧参考参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetRefParam(VENC_CHN VeChn, VENC_PARAM_REF_S *pstRefParam);
```

【参数】

| 参数        | 描述                                      | 输入/输出 |
| ----------- | ----------------------------------------- | --------- |
| VeChn       | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pstRefParam | 高级跳帧参考参数。静态属性。              | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.63 AW_MPI_VENC_SetHorizonFlip

【描述】

设置编码水平镜像。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetHorizonFlip(VENC_CHN VeChn, BOOL bHorizonFlipFlag);
```

【参数】

| 参数             | 描述                                      | 输入/输出 |
| ---------------- | ----------------------------------------- | --------- |
| VeChn            | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| bHorizonFlipFlag | 是否水平镜像。动态属性。                  | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.64 AW_MPI_VENC_GetHorizonFlip

【描述】

获取编码水平镜像。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetHorizonFlip(VENC_CHN VeChn, BOOL *bpHorizonFlipFlag);
```

【参数】

| 参数             | 描述                                      | 输入/输出 |
| ---------------- | ----------------------------------------- | --------- |
| VeChn            | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| bHorizonFlipFlag | 是否水平镜像。动态属性。                  | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.65 AW_MPI_VENC_SetAdaptiveIntraInP

【描述】

设置自适应调整P 帧帧内预测等级属性。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetAdaptiveIntraInP(VENC_CHN VeChn, BOOL bAdaptiveIntraInPFlag);
```

【参数】

| 参数                  | 描述                                                        | 输入/输出 |
| --------------------- | ----------------------------------------------------------- | --------- |
| VeChn                 | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。                   | 输入      |
| bAdaptiveIntraInPFlag | 是否打开自适应调整P 帧帧内预测等级属性功能。<br/>静态属性。 | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.66 AW_MPI_VENC_SetH264SVCSkip

【描述】

设置时域可伸缩编码及跳帧。注意不能与插帧混用。

【语法】

```
ERRORTYPE AW_MPI_VENC_SetH264SVCSkip(VENC_CHN VeChn, VencH264SVCSkip *pSVCSkip);
```

【参数】

| 参数     | 描述                                      | 输入/输出 |
| -------- | ----------------------------------------- | --------- |
| VeChn    | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSVCSkip | 跳帧参数。静态属性。                      | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_multi_vi2venc2muxer
```

#### 5.4.67 AW_MPI_VENC_EnableNullSkip

【描述】

打开插空帧功能，在编码帧率不够的情况下，插入空帧达到预期帧率。

【语法】

```
ERRORTYPE AW_MPI_VENC_EnableNullSkip(VENC_CHN VeChn, BOOL bEnable);
```

【参数】

| 参数    | 描述                                      | 输入/输出 |
| ------- | ----------------------------------------- | --------- |
| VeChn   | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| bEnable | 打开插空帧功能。静态属性。                | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.68 AW_MPI_VENC_EnablePSkip

【描述】

打开插skip-P 帧功能，在编码帧率不够的情况下，插入skip-P 帧达到预期帧率。

【语法】

```
ERRORTYPE AW_MPI_VENC_EnablePSkip(VENC_CHN VeChn, BOOL bEnable);
```

【参数】

| 参数    | 描述                                      | 输入/输出 |
| ------- | ----------------------------------------- | --------- |
| VeChn   | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| bEnable | 打开插skip-P 帧功能。静态属性。           | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 5.4.69 AW_MPI_VENC_ForbidDiscardingFrame

【描述】

设置组件编码失败禁止丢帧模式。

【语法】

```
ERRORTYPE AW_MPI_VENC_ForbidDiscardingFrame(VENC_CHN VeChn, BOOL bForbid);
```

【参数】

| 参数    | 描述                                      | 输入/输出 |
| ------- | ----------------------------------------- | --------- |
| VeChn   | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| bForbid | 禁止丢帧标记。                            | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

```
sample_multi_vi2venc2muxer
```

#### 5.4.70 AW_MPI_VENC_SaveBsFile

【描述】

设置编码库保存码流。

【语法】

```
ERRORTYPE AW_MPI_VENC_SaveBsFile(VENC_CHN VeChn, VencSaveBSFile *pSaveParam);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pSaveParam | 设置参数决定保存码流的细节。动态属性。    | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】

无

#### 5.4.71 AW_MPI_VENC_SetProcSet

【描述】

设置动态抓取VE 的proc 调试信息参数。

【语法】

ERRORTYPE AW_MPI_VENC_SetProcSet(VENC_CHN VeChn, VeProcSet *pVeProcSet);

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pVeProcSet | proc 信息配置属性。动态属性。             | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】 

无
【举例】

```
sample_multi_vi2venc2muxer
```

#### 5.4.72 AW_MPI_VENC_GetVe2IspParam

【描述】

ISP 和VE 联动机制，获取VE2ISP 参数。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetVe2IspParam(VENC_CHN VeChn, VencVe2IspParam *pParam);
```

【参数】

| 参数   | 描述                                      | 输入/输出 |
| ------ | ----------------------------------------- | --------- |
| VeChn  | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pParam | VE2ISP 联动参数。                         | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】 

无

【举例】

```
sample_OnlineVenc
```

#### 5.4.73 AW_MPI_VENC_EnableWbYUV

【描述】

使能YUV 回写功能。

【语法】

```
ERRORTYPE AW_MPI_VENC_EnableWbYUV(VENC_CHN VeChn, BOOL bEnable);
```

【参数】

| 参数    | 描述                                      | 输入/输出 |
| ------- | ----------------------------------------- | --------- |
| VeChn   | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| bEnable | 使能标记。                                | 输入      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】 

无

【举例】

```
sample_OnlineVenc
```

#### 5.4.74 AW_MPI_VENC_GetThumbYUV

【描述】

获取YUV Thumb 信息。

【语法】

```
ERRORTYPE AW_MPI_VENC_GetThumbYUV(VENC_CHN VeChn, VencThumbInfo *pThumbInfo);
```

【参数】

| 参数       | 描述                                      | 输入/输出 |
| ---------- | ----------------------------------------- | --------- |
| VeChn      | 编码通道号，范围：[0, VENC_MAX_CHN_NUM)。 | 输入      |
| pThumbInfo | YUV Thumb 信息。                          | 输出      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_venc.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】 

无

【举例】	

```
sample_OnlineVenc
```

### 5.5 数据结构说明

#### 5.5.1 VENC_CHN_ATTR_S

【说明】

编码通道属性结构。

【定义】

```
typedef struct VENC_CHN_ATTR_S
{
    VENC_ATTR_S VeAttr; /*the attribute of video encoder*/
    VENC_RC_ATTR_S RcAttr; /*the attribute of rate ctrl*/
    VENC_GOP_ATTR_S GopAttr; /*the attribute of GOP*/
    sGdcParam GdcAttr; /*the attribute of GDC*/
    VENC_ENCPP_ATTR_S EncppAttr; /*the attribute of ENCPP*/
}VENC_CHN_ATTR_S;
```

【成员】

| 成员名称  | 描述           |
| --------- | -------------- |
| VeAttr    | 编码属性。     |
| RcAttr    | 码率控制属性。 |
| GopAttr   | Gop 属性。     |
| GdcAttr   | GDC 属性。     |
| EncppAttr | Encpp 属性。   |

【注意事项】

无

【相关数据类型及接口】

```
typedef struct VENC_ATTR_S
{
    PAYLOAD_TYPE_E Type; /*the type of payload*/
    union
    {
        VENC_ATTR_H264_S AttrH264e; /*attributes of h264*/
        VENC_ATTR_MJPEG_S AttrMjpeg; /*attributes of mjpeg*/
        VENC_ATTR_JPEG_S AttrJpeg; /*attributes of jpeg*/
        VENC_ATTR_MPEG4_S AttrMpeg4; /*attributes of mpeg4*/
		VENC_ATTR_H265_S AttrH265e; /*attributes of h265*/
	};
    int MaxKeyInterval; /* wanted key frame interval, dynamic
    param*/
    unsigned int SrcPicWidth; /* source width of a picture buffer sent
    to venc channel, in pixel*/
    unsigned int SrcPicHeight; /* source height of a picture buffer sent
    to venc channel, in pixel*/
    VIDEO_FIELD_E Field;
    PIXEL_FORMAT_E PixelFormat;
    enum v4l2_colorspace mColorSpace;
    ROTATE_E Rotate; /*encoder rotate angle.*/
    unsigned int mOnlineEnable; /* 1: online, 0: offline.*/
    unsigned int mOnlineShareBufNum; /* only for online. Number of share buffers of CSI and
    VE, support 1/2.*/
    unsigned int mDropFrameNum;
}VENC_ATTR_S;
typedef struct VENC_RC_ATTR_S
{
    VENC_RC_MODE_E mRcMode; /*the type of rc*/
    union
    {
        VENC_ATTR_H264_CBR_S mAttrH264Cbr;
        VENC_ATTR_H264_VBR_S mAttrH264Vbr;
        VENC_ATTR_H264_FIXQP_S mAttrH264FixQp;
        VENC_ATTR_H264_ABR_S mAttrH264Abr;
        VENC_ATTR_H264_QPMAP_S mAttrH264QpMap;
        VENC_ATTR_MPEG4_CBR_S mAttrMpeg4Cbr;
        VENC_ATTR_MPEG4_FIXQP_S mAttrMpeg4FixQp;
        VENC_ATTR_MPEG4_VBR_S mAttrMpeg4Vbr;
        VENC_ATTR_MJPEG_CBR_S mAttrMjpegeCbr;
        VENC_ATTR_MJPEG_FIXQP_S mAttrMjpegeFixQp;
        VENC_ATTR_MJPEG_VBR_S mAttrMjpegeVbr;
        VENC_ATTR_H265_CBR_S mAttrH265Cbr;
        VENC_ATTR_H265_VBR_S mAttrH265Vbr;
        VENC_ATTR_H265_FIXQP_S mAttrH265FixQp;
        VENC_ATTR_H265_ABR_S mAttrH265Abr;
        VENC_ATTR_H265_QPMAP_S mAttrH265QpMap;
    };
    void* pRcAttr ; /*the rc attribute which could be
    specified by user*/
}VENC_RC_ATTR_S;
typedef struct VENC_GOP_ATTR_S
{
    VENC_GOP_MODE_E enGopMode;
    union
    {
        VENC_GOP_NORMALP_S stNormalP; /*attributes of normal P*/
        VENC_GOP_DUALP_S stDualP; /*attributes of dual P*/
        VENC_GOP_SMARTP_S stSmartP; /*attributes of Smart P*/
        VENC_GOP_BIPREDB_S stBipredB; /*attributes of b */
    };
    int mGopSize;
}VENC_GOP_ATTR_S;
typedef struct {
    unsigned char bGDC_en;
    eGdcWarpType eWarpMode;
    eGdcMountType eMountMode;
    unsigned char bMirror;
    unsigned int calib_widht;
    unsigned int calib_height;
    float fx;
    float fy;
    float cx;
    float cy;
    float fx_scale;
    float fy_scale;
    float cx_scale;
    float cy_scale;
    eGdcLensDistModel eLensDistModel;
    float distCoef_wide_ra[3];
    float distCoef_wide_ta[2];
    float distCoef_fish_k[4];
    int centerOffsetX;
    int centerOffsetY;
    int rotateAngle;
    int radialDistortCoef;
    int trapezoidDistortCoef;
    int fanDistortCoef;
    int pan;
    int tilt;
    int zoomH;
    int zoomV;
    int scale;
    int innerRadius;
    float roll;
    float pitch;
    float yaw;
    eGdcPerspFunc perspFunc;
    float perspectiveProjMat[9];
    int birdsImg_width;
    int birdsImg_height;
    float mountHeight;
    float roiDist_ahead;
    float roiDist_left;
    float roiDist_right;
    float roiDist_bottom;
    int peaking_en;
    int peaking_clamp;
    int peak_m;
    int th_strong_edge;
    int peak_weights_strength;
}sGdcParam;
typedef struct VENC_ENCPP_ATTR_S
{
    BOOL mbEncppDisable; /*disable Encpp, FALSE:enable, TRUE:
    disable, default value:FALSE*/
    unsigned int mEncppSharpAttenCoefPer; /*Encpp sharp attenuation percentage
    coefficient, the default is 100%, no attenuation.*/
}VENC_ENCPP_ATTR_S;
```

#### 5.5.2 VENC_RECV_PIC_PARAM_S

【说明】

编码通道接收编码帧参数。

【定义】

```
typedef struct VENC_RECV_PIC_PARAM_S
{
int mRecvPicNum; /*Number of frames received and encoded by
the encoding channel*/
} VENC_RECV_PIC_PARAM_S;
```

【成员】

| 成员名称    | 描述                                 |
| ----------- | ------------------------------------ |
| mRecvPicNum | 编码通道接收并编码的帧数。暂不支持。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.3 VENC_CHN_STAT_S

【说明】

编码通道状态结构。

【定义】

```
typedef struct VENC_CHN_STAT_S
{
    unsigned int mLeftPics; /*left picture number */
    unsigned int mLeftStreamBytes; /*left stream bytes*/
    unsigned int mLeftStreamFrames; /*left stream frames*/
    unsigned int mCurPacks; /*pack number of current frame*/
    unsigned int mLeftRecvPics; /*Number of frames to be received.
    This member is valid after AW_MPI_VENC_StartRecvPicEx is called.*/
    unsigned int mLeftEncPics; /*Number of frames to be encoded.
    This member is valid after AW_MPI_VENC_StartRecvPicEx is called.*/
}VENC_CHN_STAT_S;
```

【成员】

| 成员名称          | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| mLeftPics         | 剩余图片量，待编码。                                         |
| mLeftStreamBytes  | 编码流剩余Byte 数，待取走。                                  |
| mLeftStreamFrames | 编码流剩余帧数，待取走。                                     |
| mCurPacks         | 当前帧的码流包个数，取值范围：[1]，<br/>当前只支持一帧一个码流包的模式。 |
| mLeftRecvPics     | 待接收图片量（仅AW_MPI_VENC_StartRecvPicEx 时有效），<br/>未使用。 |
| mLeftEncPics      | 已编码图片量（仅AW_MPI_VENC_StartRecvPicEx 时有效），<br/>未使用。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.4 MPPCallbackInfo

【说明】

MPP Callback 数据结构。

【定义】

```
typedef struct MPPCallbackInfo {
    void *cookie; //EyeseeRecorder*
    MPPCallbackFuncType callback; //MPPCallbackWrapper
} MPPCallbackInfo;
```

【成员】

| 成员名称          | 描述             |
| ----------------- | ---------------- |
| cookie callback   | 函数传递的参数。 |
| callback callback | 函数定义。       |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.5 VENC_STREAM_S

【说明】

编码通道编码输出流结构。

【定义】

```
typedef struct VENC_STREAM_S
{
    VENC_PACK_S *mpPack; /*stream pack attribute*/
    unsigned int mPackCount; /*the pack number of one frame stream*/
    unsigned int mSeq; /*the list number of stream*/
    union
    {
        VENC_STREAM_INFO_H264_S mH264Info; /*the stream info of h264*/
        VENC_STREAM_INFO_JPEG_S mJpegInfo; /*the stream info of jpeg*/
        VENC_STREAM_INFO_MPEG4_S mMpeg4Info; /*the stream info of mpeg4*/
        VENC_STREAM_INFO_H265_S mH265Info; /*the stream info of h265*/
    };
}VENC_STREAM_S;
```

【成员】

| 成员名称   | 描述                                                    |
| ---------- | ------------------------------------------------------- |
| mpPack     | 数据包数组，当前只填充第一个元素。                      |
| mSeq       | 编码库内部装载该帧的buffer 的id 号。取值范围：[0,255]。 |
| mH264Info  | H264 编码包信息，未使用。                               |
| mJpegInfo  | Jpeg 编码包信息，未使用。                               |
| mMpeg4Info | Mpeg4 编码包信息，未使用。                              |
| mH265Info  | H265 编码包信息，未使用。                               |

【注意事项】

无

【相关数据类型及接口】

```
typedef struct VENC_PACK_S
{
    unsigned char *mpAddr0; /*the virtual address of stream*/
    unsigned char *mpAddr1;
    unsigned char *mpAddr2; //for jpeg encoder, jpeg encoder may use three buffer to
    store mainPicture and thumbPicture.
    unsigned int mLen0; /*the length of stream*/
    unsigned int mLen1;
    unsigned int mLen2;
    uint64_t mPTS; /*PTS*/
    BOOL mbFrameEnd; /*frame end*/
    VENC_DATA_TYPE_U mDataType; /*the type of stream*/
    unsigned int mOffset;
    unsigned int mDataNum;
    VENC_PACK_INFO_S mPackInfo[8];
}VENC_PACK_S;
/*the data type of VENC*/
typedef union VENC_DATA_TYPE_U
{
    H264E_NALU_TYPE_E enH264EType; /*H264E NALU types*/
    JPEGE_PACK_TYPE_E enJPEGEType; /*JPEGE pack types*/
    MPEG4E_PACK_TYPE_E enMPEG4EType; /*MPEG4E pack types*/
    H265E_NALU_TYPE_E enH265EType; /*H264E NALU types*/
}VENC_DATA_TYPE_U;
typedef struct VENC_PACK_INFO_S
{
    VENC_DATA_TYPE_U mPackType;
    unsigned int mPackOffset;
    unsigned int mPackLength;
}VENC_PACK_INFO_S;
```

#### 5.5.6 VIDEO_FRAME_INFO_S

【说明】

定义视频图像帧信息结构体。

【定义】

```
typedef struct VIDEO_FRAME_INFO_S
{
VIDEO_FRAME_S VFrame;
unsigned int mId; //id identify frame uniquely
} VIDEO_FRAME_INFO_S;
```

【成员】

| 成员名称 | 描述                      |
| -------- | ------------------------- |
| VFrame   | 视频图像帧。              |
| mId      | 装填图像帧的buffer 的id。 |

【注意事项】

无
【相关数据类型及接口】

```
typedef struct VIDEO_FRAME_S
{
    unsigned int mWidth;
    unsigned int mHeight;
    VIDEO_FIELD_E mField;
    PIXEL_FORMAT_E mPixelFormat;
    VIDEO_FORMAT_E mVideoFormat;
    COMPRESS_MODE_E mCompressMode;
    unsigned int mPhyAddr[3];/* Y, U, V; Y, UV; Y, VU */
    void* mpVirAddr[3];
    unsigned int mStride[3];
    unsigned int mHeaderPhyAddr[3];
    void* mpHeaderVirAddr[3];
    unsigned int mHeaderStride[3];
    short mOffsetTop; /* top offset of show area */
    short mOffsetBottom; /* bottom offset of show area */
    short mOffsetLeft; /* left offset of show area */
    short mOffsetRight; /* right offset of show area */
    uint64_t mpts; /* unit:us */
    unsigned int mExposureTime; /* every frame exp time */
    unsigned int mFramecnt; /* rename mPrivateData to Framecnt_exp_start */
    int mEnvLV; /* environment luminance value */
    int mEnvLVAdj; /* environment luminance value Adj? */
    /* for frame specific informations.
    *e.g. this is a Long-Exposure frame, you can set mFrmFlag = (exp_time)<<16 | FF_LONGEXP
    .
    *e.g. somtimes, frame lost in kernel because of return time delay, then you can set
    * mFrmFlag = (lost_num)<<16 | FF_FRAME_LOST; and maybe Venc can insert empty frames.
    */
    unsigned int mWhoSetFlag; /* reserve(8bit)|COMP_TYPE(8bit)|DEV_NUM(8bit)|CHN_NUM(8
    bit) */
    uint64_t mFlagPts; /* when generate this flag, unit(us) */
    /* whats this flag, data(16bit)|flag(16bit), if you want a signed data, please use
    short data type */
    unsigned int mFrmFlag;
} VIDEO_FRAME_S;
```

#### 5.5.7 VENC_ROI_CFG_S

【说明】

定义编码感兴趣区域信息。

【定义】

```
/* ROI struct */
typedef struct VENC_ROI_CFG_S
{
unsigned int Index; /* Index of an ROI. The system
supports indexes ranging from 0 to 7 */
BOOL bEnable; /* Whether to enable this ROI */
BOOL bAbsQp; /* QP mode of an ROI.FALSE: relative QP.
TURE: absolute QP.*/
int Qp; /* QP value. */
RECT_S Rect; /* Region of an ROI*/
}VENC_ROI_CFG_S;
```

【成员】

| 成员名称                    | 描述                                                         |
| --------------------------- | ------------------------------------------------------------ |
| Index 索引号。范围：[0,7]。 | 动态属性。                                                   |
| bEnable 使能标记。          | 动态属性。                                                   |
| bAbsQp                      | 是否绝对Qp 值（FALSE: 相对Qp 值TRUE: 绝对Qp 值）动态属性。   |
| Qp                          | 当qp 模式是相对Qp 值时，取值范围[0, 51]，表示用该帧的qp 值减去 |
| Qp，                        | 作为绝对Qp 值；当Qp 模式是绝对qp 值时，取值范围[0,51]。动态属性。 |
| Rect                        | 区域范围，必须在图像范围内，X,Y,Width,Height 必须16 对齐。动态属性。 |

【注意事项】

无

【相关数据类型及接口】

```
typedef struct RECT_S {
    int X;
    int Y;
    unsigned int Width;
    unsigned int Height;
} RECT_S;
```

#### 5.5.8 VENC_ROIBG_FRAME_RATE_S

【说明】

定义编码感兴趣区域信息。

【定义】

```
typedef struct VENC_ROIBG_FRAME_RATE_S
{
    int mSrcFrmRate; /* Input frame rate of Roi backgroud*/
    int mDstFrmRate; /* Output frame rate of Roi backgroud */
}VENC_ROIBG_FRAME_RATE_S;
```

【成员】

| 成员名称    | 描述                     |
| ----------- | ------------------------ |
| mSrcFrmRate | ROI 背景原始输入帧帧率。 |
| mDstFrmRate | ROI 背景目标输出帧帧率。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.9 VencHeaderData

【说明】

sps、pps 数据信息。

【定义】

```
typedef struct VencHeaderData {
    unsigned char* pBuffer;
    unsigned int nLength;
}VencHeaderData;
```

【成员】



| 成员名称 | 描述                                                    |
| -------- | ------------------------------------------------------- |
| pBuffer  | sps、pps 信息的buffer 地址，buffer 是编码库内部buffer。 |
| nLength  | buffer 的有效数据长度。                                 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.10 VENC_PARAM_JPEG_S

【说明】

JPEG 协议编码通道的高级参数。

【定义】

```
typedef struct VENC_PARAM_JPEG_S
{
unsigned int Qfactor; /*image quality :[1,99]*/
unsigned char YQt[64]; /* y qt value */
unsigned char CbQt[64]; /* cb qt value */
unsigned char CrQt[64]; /* cr qt value */
unsigned int MCUPerECS; /*default value: 0, MCU number of one
ECS*/
} VENC_PARAM_JPEG_S;
```

【成员】

| 成员名称  | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| Qfactor   | JPEG 编码质量。范围：[0,100]，值越大，编码质量越高。动态属性。 |
| YQt       | 未使用                                                       |
| CbQt      | 未使用                                                       |
| CrQt      | 未使用                                                       |
| MCUPerECS | 未使用                                                       |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.11 VENC_EXIFINFO_S

【说明】

AW EXIF 信息结构，配置缩略图大小，以及供编码器生成jpeg 图片信息，信息可以随意填写。

【定义】

```
//need keep same to vencoder.h, DATA_TIME_LENGTH...
#define MM_DATA_TIME_LENGTH 24
#define MM_INFO_LENGTH 64
#define MM_GPS_PROCESS_METHOD_LENGTH 100
typedef struct VENC_EXIFINFO_S //aw
{
    unsigned char CameraMake[MM_INFO_LENGTH];
    unsigned char CameraModel[MM_INFO_LENGTH];
    unsigned char DateTime[MM_DATA_TIME_LENGTH];
    unsigned int ThumbWidth;
    unsigned int ThumbHeight;
    int Orientation; //value can be 0,90,180,270 degree
    unsigned int fr32ExposureTime; //tag 0x829A, FRACTION32()
    unsigned int fr32FNumber; //tag 0x829D, FRACTION32()
    short ISOSpeed;//tag 0x8827
    int ExposureBiasValueNum; //tag 0x9204
    short MeteringMode; //tag 0x9207, ExifMeteringModeType
    unsigned int fr32FocalLength; //tag 0x920A
    short WhiteBalance; //tag 0xA403
    // gps info
    int enableGpsInfo;
    double gps_latitude;
    double gps_longitude;
    double gps_altitude;
    long gps_timestamp;
    unsigned char gpsProcessingMethod[MM_GPS_PROCESS_METHOD_LENGTH];
    unsigned char CameraSerialNum[128]; //tag 0xA431 (exif 2.3 version)
    short FocalLengthIn35mmFilm; // tag 0xA405
    unsigned char ImageName[128]; //tag 0x010D
    unsigned char ImageDescription[128]; //tag 0x010E
    int thumb_quality; //[20, 100]
} VENC_EXIFINFO_S;
```

【成员】

| 成员名称              | 描述                                 |
| --------------------- | ------------------------------------ |
| CameraMake            | camera 厂商。                        |
| CameraModel           | camera 型号。                        |
| DateTime              | 日期时间。                           |
| ThumbWidth            | 编码通道生成的缩略图宽度。           |
| ThumbHeight           | 编码通道生成的缩略图高度。           |
| Orientation           | 方向。                               |
| fr32ExposureTime      | 曝光值。                             |
| fr32FNumber           | fr32F 编号。                         |
| ISOSpeed              | ISO 速度。                           |
| ExposureBiasValueNum  | 曝光偏差值编号。                     |
| MeteringMode          | 测光模式。                           |
| fr32FocalLength       | fr32 焦距。                          |
| WhiteBalance          | 白平衡。                             |
| enableGpsInfo         | 启用GPS 信息。                       |
| gps_latitude          | GPS 纬度。                           |
| gps_longitude         | GPS 经度。                           |
| gps_altitude          | GPS 海拔高度。                       |
| gps_timestamp         | GPS 时间戳。                         |
| gpsProcessingMethod   | GPS 处理方法。                       |
| CameraSerialNum       | 相机序列号。                         |
| FocalLengthIn35mmFilm | 35mm 胶卷焦距。                      |
| ImageName             | 图像名称。                           |
| ImageDescription      | 图像描述。                           |
| thumb_quality         | 设置缩略图编码质量。范围：[20,100]。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.12 VENC_JPEG_THUMB_BUFFER_S

【说明】

JPEG 缩略图buffer 信息。

【定义】

```
typedef struct VENC_JPEG_THUMB_BUFFER_S //aw
{
    unsigned char* ThumbAddrVir;
    unsigned int ThumbLen;
} VENC_JPEG_THUMB_BUFFER_S;
```

【成员】

| 成员名称     | 描述                                          |
| ------------ | --------------------------------------------- |
| ThumbAddrVir | jpeg 图片buffer 中的thumbPic 的起始虚拟地址。 |
| ThumbLen     | thumbPic 的长度。                             |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.13 VencHighPassFilter

【说明】

高通滤波器的可配置参数。

【定义】

```
typedef struct {
    unsigned char hp_filter_en;
    unsigned int hp_coef_shift; //* range[0 ~ 7], default: 3
    unsigned int hp_coef_th; //* range[0 ~ 7], default: 5
    unsigned int hp_contrast_th;//* range[0 ~ 63], default: 0
    unsigned int hp_mad_th; //* range[0 ~ 63], default: 0
}VencHighPassFilter;
```

【成员】

| 成员名称       | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| hp_filter_en   | 高通滤波使能开关。1：开；0：关。                             |
| hp_coef_shift  | 高通滤波系数偏移。范围：[0,7]，默认值：3。                   |
| hp_coef_th     | 高通滤波系数阈值。范围：[0,7]，默认值：5。                   |
| hp_contrast_th | 高通滤波比例阈值。范围：[0,63]，默认值：0。                  |
| hp_mad_th      | 高通滤波MAD（Mean Absolute Difference 平均绝对差值）阈值。<br/>范围：[0,63]，默认值：0。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.14 VENC_FRAME_RATE_S

【说明】

帧率设置结构。

【定义】

```
typedef struct VENC_FRAME_RATE_S
{
	int SrcFrmRate; /* Input frame rate of a channel*/
	int DstFrmRate; /* Output frame rate of a channel*/
} VENC_FRAME_RATE_S;
```

【成员】

| 成员名称   | 描述                                                   |
| ---------- | ------------------------------------------------------ |
| SrcFrmRate | 进入编码通道的帧率，取值范围：[1,240]。静态属性。      |
| DstFrmRate | 编码通道输出帧率，取值范围：(0,SrcFrmRate]。静态属性。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.15 VENC_RC_PARAM_S

【说明】

码率控制属性。

【定义】

```
typedef struct VENC_RC_PARAM_S
{
    unsigned int ThrdI[RC_TEXTURE_THR_SIZE]; /* just useful for h264/
    h265 and mpeg4 for now */
    unsigned int ThrdP[RC_TEXTURE_THR_SIZE];
    unsigned int RowQpDelta;
    union //judge by VENC_CHN_ATTR_S->mVeAttr->mType
    {
        VENC_PARAM_H264_CBR_S ParamH264Cbr;
        VENC_PARAM_H264_VBR_S ParamH264Vbr;
        VENC_PARAM_MJPEG_CBR_S ParamMjpegCbr;
        VENC_PARAM_MJPEG_VBR_S ParamMjpegVbr;
        VENC_PARAM_MPEG4_CBR_S ParamMpeg4Cbr;
        VENC_PARAM_MPEG4_VBR_S ParamMpeg4Vbr;
        VENC_PARAM_H265_CBR_S ParamH265Cbr;
        VENC_PARAM_H265_VBR_S ParamH265Vbr;
    };
    void* pRcParam; /*RC parameter which could be specified by usrer*/
    unsigned int product_mode; // VENC_PRODUCT_MODE_E. 0:normal mode:cdr/sdv;1:ipc;
    internal parameter used to affect encoding quality.
    unsigned int sensor_type; // eSensorType, VENC_ST_SP2305,VENC_ST_DIS_WDR
}VENC_RC_PARAM_S;
```

【成员】

| 成员名称      | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| ThrdI         | UNUSED。                                                     |
| ThrdP         | UNUSED。                                                     |
| RowQpDelta    | UNUSED。                                                     |
| ParamH264Cbr  | H264 CBR 模式下的码率控制参数。                              |
| ParamH264Vbr  | H264 VBR 模式下的码率控制参数。                              |
| ParamMjpegCbr | MJPEG CBR 模式下的码率控制参数。                             |
| ParamMjpegVbr | MJPEG VBR 模式下的码率控制参数。                             |
| ParamMpeg4Cbr | MPEG4 CBR 模式下的码率控制参数。                             |
| ParamMpeg4Vbr | MPEG4 VBR 模式下的码率控制参数。                             |
| ParamH265Cbr  | H265 CBR 模式下的码率控制参数。                              |
| ParamH265Vbr  | H265 VBR 模式下的码率控制参数。                              |
| pRcParam      | UNUSED。                                                     |
| product_mode  | 产品模式，0：VENC_PRODUCT_NORMAL_MODE，<br/>1：VENC_PRODUCT_IPC_MODE。 |
| sensor_type   | 传感器类型，0：VENC_ST_DIS_WDR，1：VENC_ST_EN_WDR。          |

【注意事项】

无

【相关数据类型及接口】

```
/* For RC */
#define RC_TEXTURE_THR_SIZE 12
#define RC_RQRATIO_SIZE 8
typedef struct VENC_PARAM_H264_CBR_S
{
    unsigned int MinIprop; /* the min ratio of i frame and p frame
    */
    unsigned int MaxIprop; /* the max ratio of i frame and p frame
    */
    unsigned int mMaxQp; /* the max QP value */
    unsigned int mMinQp; /* the min QP value */
    int IPQPDelta; /* the qp difference between the i frame
    and the before gop avarage qp; == Qp(P) - Qp(I) */
    int QualityLevel; /* quality of picture [1, 5] */
    int MaxReEncodeTimes; /* max number of re-encode times [0, 3]*/
    unsigned int MinIQp; /* min qp for i frame */
    int mMaxPqp; //default:50
    int mMinPqp; //default:10
    int mQpInit; //default:30
    int mbEnMbQpLimit; //default:0
}VENC_PARAM_H264_CBR_S;
typedef struct VENC_PARAM_H264_VBR_S
{
    int s32IPQPDelta; /* the qp difference between the i frame
    and the before gop avarage qp; == Qp(P) - Qp(I) */
    int s32ChangePos; /* Indicates the ratio of the current bit
    rate to the maximum
    bit rate when the QP value starts to
    be adjusted */
    unsigned int u32MinIprop; /* the min ratio of i frame and p frame
    */
    unsigned int u32MaxIprop; /* the max ratio of i frame and p frame
    */
    unsigned int u32MinIQP; /* min qp for i frame */
    int mMaxQp; /* RW; Range:[0, 51]; the max P B qp */
    int mMinQp; /* RW; Range:[0, 51]; the min P B qp,can not be larger
    than u32MaxQp */
    int mMaxPqp; //default:50
    int mMinPqp; //default:10
    int mQpInit; //default:30
    int mbEnMbQpLimit; //default:0
    //unsigned int mRatioChangeQp; /* range[50,100], default:85 */
    unsigned int mMovingTh; //range[1,31], 1:all frames are moving, 31:have no moving
    frame, default: 20, 0 means use default value.
    int mQuality; // range[1,10], 1:worst quality, 10:best quality, default:5, 0 means
    use default value.
    int mIFrmBitsCoef; //default:15
    int mPFrmBitsCoef; //default:10
}VENC_PARAM_H264_VBR_S;
typedef struct VENC_PARAM_MJPEG_CBR_S
{
    unsigned int MaxQfactor; /* the max Qfactor value*/
    unsigned int MinQfactor; /* the min Qfactor value */
    unsigned int RQRatio[RC_RQRATIO_SIZE]; /* the rate stabilization weight,
    100-u32RQRatio[i] is the sequence
    quality stabilization weight */
}VENC_PARAM_MJPEG_CBR_S;
typedef struct VENC_PARAM_MJPEG_VBR_S
{
    int s32DeltaQfactor; /* Indicates the maximum change of Qfactor
    values of frames
    when the picture quality changes */
    int s32ChangePos; /* Indicates the ratio of the current bit
    rate to the maximum
    bit rate when the Qfactor value
    starts to be adjusted */
}VENC_PARAM_MJPEG_VBR_S;
typedef struct VENC_PARAM_MPEG4_CBR_S
{
    unsigned int u32MinIprop; /* the min ratio of i frame and p frame*/
    unsigned int u32MaxIprop; /* the max ratio of i frame and p frame */
    unsigned int u32MaxQp; /* the max QP value*/
    unsigned int u32MinQp; /* the min QP value */
    unsigned int u32MaxPPDeltaQp; /* the max qp value difference between two
    successive P frame */
    unsigned int u32MaxIPDeltaQp; /* the max qp value difference between p
    frame and the next i frame */
    int s32IPQPDelta; /* the qp difference between the i frame
    and the before gop avarage qp*/
    unsigned int u32RQRatio[RC_RQRATIO_SIZE]; /* the rate stabilization weight,
    100-u32RQRatio[i] is the sequence
    quality stabilization weight */
}VENC_PARAM_MPEG4_CBR_S;
typedef struct VENC_PARAM_MPEG4_VBR_S
{
    int s32IPQPDelta; /* the qp difference between the i frame
    and the before gop avarage qp*/
    int s32ChangePos; /* Indicates the ratio of the current bit
    rate to the maximum
    bit rate when the QP value starts
    to be adjusted */
    unsigned int u32MinIprop; /* the min ratio of i frame and p frame */
    unsigned int u32MaxIprop; /* the max ratio of i frame and p frame */
}VENC_PARAM_MPEG4_VBR_S;
typedef struct VENC_PARAM_H264_CBR_S VENC_PARAM_H265_CBR_S;
typedef struct VENC_PARAM_H264_VBR_S VENC_PARAM_H265_VBR_S;
typedef enum VENC_PRODUCT_MODE_E
{
    VENC_PRODUCT_NORMAL_MODE = 0,
    VENC_PRODUCT_IPC_MODE = 1,
}VENC_PRODUCT_MODE_E;
```

#### 5.5.16 VENC_COLOR2GREY_S

【说明】

彩转灰结构。

【定义】

```
typedef struct VENC_COLOR2GREY_S
{
	BOOL bColor2Grey; /* Whether to enable Color2Grey.*/
}VENC_COLOR2GREY_S;
```

【成员】

| 成员名称    | 描述                                                         |
| ----------- | ------------------------------------------------------------ |
| bColor2Grey | 开启或关闭一个通道的彩转灰功能。TRUE：开启；FALSE：关闭。动态属性。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.17 VENC_CROP_CFG_S

【说明】

裁剪区域结构。

【定义】

```
typedef struct VENC_CROP_CFG_S
{
	BOOL bEnable; /* Crop region enable */
	RECT_S Rect; /* Crop region, note: X must be multi of 16 */
}VENC_CROP_CFG_S;
```

【成员】

| 成员名称 | 描述       |
| -------- | ---------- |
| bEnable  | 是否使能。 |
| Rect     | 裁剪区域。 |

【注意事项】

无

【相关数据类型及接口】

```
typedef struct RECT_S {
int X;
int Y;
unsigned int Width;
unsigned int Height;
} RECT_S;
```

#### 5.5.18 VENC_STREAM_BUF_INFO_S

【说明】

VBV Buffer 信息的结构体。

【定义】

```
typedef struct VENC_STREAM_BUF_INFO_S
{
unsigned int PhyAddr;
void *pUserAddr;
unsigned int BufSize;

} VENC_STREAM_BUF_INFO_S;
```

【成员】

| 成员名称  | 描述                        |
| --------- | --------------------------- |
| PhyAddr   | VBV Buffer 的起始物理地址。 |
| pUserAddr | VBV Buffer 的起始虚拟地址。 |
| BufSize   | VBV Buffer 的大小。         |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.19 VENC_SUPERFRAME_CFG_S

【说明】

超大帧重编码处理参数。

【定义】

```
typedef struct VENC_SUPERFRAME_CFG_S
{
    VENC_SUPERFRM_MODE_E enSuperFrmMode; /* Indicates the mode of
    processing the super frame,[SUPERFRM_NONE,SUPERFRM_DISCARD,SUPERFRM_REENCODE]*/
    unsigned int SuperIFrmBitsThr; /* Indicate the threshold of
    the super I frame
    for enabling the super frame
    processing mode */
    unsigned int SuperPFrmBitsThr; /* Indicate the threshold of
    the super P frame */
    unsigned int SuperBFrmBitsThr; /* Indicate the threshold of
    the super B frame */
}VENC_SUPERFRAME_CFG_S;
```

【成员】

| 成员名称         | 描述                     |
| ---------------- | ------------------------ |
| enSuperFrmMode   | 超大帧重编码处理模式。   |
| SuperIFrmBitsThr | 超大I 帧的阈值。         |
| SuperPFrmBitsThr | 超大P 帧的阈值。         |
| SuperBFrmBitsThr | 未使用。超大B 帧的阈值。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.20 VENC_PARAM_INTRA_REFRESH_S

【说明】

P 帧帧内刷新，刷I 宏块控制参数。

【定义】

```
typedef struct VENC_PARAM_INTRA_REFRESH_S
{
BOOL bRefreshEnable;
BOOL bISliceEnable;
unsigned int RefreshLineNum;
unsigned int ReqIQp;
}VENC_PARAM_INTRA_REFRESH_S;
```

【成员】

| 成员名称        | 描述                                                         |
| --------------- | ------------------------------------------------------------ |
| bRefreshEnable  | 是否开启P 帧帧内刷新功能。TRUE：开启；FALSE：关闭。静态属性。 |
| bISliceEnable   | 未使用。                                                     |
| RefreshLineNum  | 图像帧按列划分的区域个数。例如分为10 个区域，则每10 帧<br/>刷新一次。取值范围：(0, +∞]，推荐值8。静态属性。 |
| ReqIQp 未使用。 |                                                              |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.21 VencSmartFun

【说明】

smart 编码参数。

【定义】

```
typedef struct {
    unsigned char smart_fun_en;
    unsigned char img_bin_en;
    unsigned int img_bin_th;
    unsigned int shift_bits;
}VencSmartFun;
```

【成员】

| 成员名称     | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| smart_fun_en | Smart 功能开关标志。                                         |
| img_bin_en   | 二值化输出开关标志，当smart 标志设置为1 时该标志强制为1。    |
| img_bin_th   | 运动区域判别阈值，取值范围：[20,33]，默认值27。<br/>目前由编码驱动动态更新，用户设置无意义。 |
| shift_bits   | 阈值计算移位位数，取值范围：[1,3]，默认值2。<br/>该参数对smart 功能影响不大。 |

【注意事项】

本接口属于高级接口，用户可选择性调用，系统默认关闭该功能。

本接口在编码通道创建之后可动态设置。

【相关数据类型及接口】

无

#### 5.5.22 VencBrightnessS

【说明】

配置h264 和h265 编码的亮暗阈值属性，与smart 功能配合使用，对于smart 检索之外的非运动区域（即背景区域），如果超出过亮或过暗阈值，将会被Smart 功

能处理，默认值设置为60 /200，将这两个阈值往平均值调节，将会提高背景区域的压缩效率，但是显示效果可能会变差。

【定义】

```
typedef struct VencBrightnessS {
	unsigned int dark_th; //dark threshold, default 60, range[0, 255]
	unsigned int bright_th; //bright threshold, default 200, range[0, 255]
}VencBrightnessS;
```

【成员】



| 成员名称  | 描述                                         |
| --------- | -------------------------------------------- |
| dark_th   | 暗阈值，范围：[0, 255]，默认值60 静态属性。  |
| bright_th | 亮阈值，范围：[0, 255]，默认值200 静态属性。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.23 VencMBModeCtrl

【说明】

编码的宏块信息和属性。

【定义】

```
typedef struct {
    unsigned char mode_ctrl_en;
    unsigned char *p_info;
}VencMBModeCtrl;
```

【成员】

| 成员名称 | 描述                 |
| -------- | -------------------- |
| sum_mad  | 当前帧的sum mad 值。 |
| sum_qp   | 当前帧的sum qp 值。  |
| sum_sse  | 当前帧的sum sse 值。 |
| avg_sse  | 当前帧的sse 平均值。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.24 VencMBInfo

【说明】

编码的宏块信息和属性。

【定义】

```
typedef struct {
    unsigned int num_mb;
    VencMBInfoPara *p_para;
}VencMBInfo;
```

【成员】

| 成员名称 | 描述                         |
| -------- | ---------------------------- |
| num_mb   | 当前码流的宏块个数。         |
| p_para   | 当前帧编码后生成的宏块信息。 |

【注意事项】

无

【相关数据类型及接口】

```
#define MAX_NUM_MB (65536)
typedef struct {
    unsigned char mb_mad; // 宏块的mad值
    unsigned char mb_qp; // 宏块的qp值
    unsigned int mb_sse; // 宏块的sse值
    double mb_psnr; // 宏块的psnr值
}VencMBInfoPara;
```

#### 5.5.25 VencMBSumInfo

【说明】

编码的宏块信息和属性。

【定义】

```
typedef struct {
    unsigned int sum_mad;
    unsigned int sum_qp;
    unsigned long long sum_sse;
    unsigned int avg_sse;
}VencMBSumInfo;
```

【成员】

| 成员名称 | 描述                 |
| -------- | -------------------- |
| sum_mad  | 当前帧的sum mad 值。 |
| sum_qp   | 当前帧的sum qp 值。  |
| sum_sse  | 当前帧的sum sse 值。 |
| avg_sse  | 当前帧的sse 平均值。 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.26 CacheState

【说明】

编码库VBV Buffer 的缓冲状态。

【定义】

```
typedef struct CacheState {
    unsigned int mValidSizePercent; // 0~100
    unsigned int mValidSize; // unit:kB
    unsigned int mTotalSize; // unit:kB
} CacheState;
```

【成员】

| 成员名称          | 描述                    |
| ----------------- | ----------------------- |
| mValidSizePercent | 有效数据的百分比。      |
| mValidSize        | buffer 的有效数据长度。 |
| mTotalSize        | buffer 的总长度。       |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.27 VENC_PARAM_REF_S

【说明】

高级跳帧参考参数。

【定义】

```
typedef struct VENC_PARAM_REF_S
{
    unsigned int Base; /*Base layer period*/
    unsigned int Enhance; /*Enhance layer period*/
    BOOL bEnablePred; /*Whether some frames at the base layer are referenced by
    other frames at the base layer. When bEnablePred is FALSE, all frames at the base
    layer reference IDR frames.*/
} VENC_PARAM_REF_S;
```

【成员】

| 成员名称    | 描述                                     |
| ----------- | ---------------------------------------- |
| Base        | Base 层的周期。范围：[0, ＋ ∞)。         |
| Enhance     | Enhance 层的周期。范围：[0, ＋ ∞)。      |
| bEnablePred | base 层的帧是否被base 层其他帧用作参考。 |
| FALSE       | 表示base 层所有帧都参考IDR 帧。          |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.28 VencH264SVCSkip

【说明】

配置时域可伸缩编码及跳帧参数，不能与插针混用。

【定义】

```
typedef struct VencH264SVCSkip {
    T_LAYER nTemporalSVC;
    SKIP_FRAME nSkipFrame;
    int bEnableLayerRatio;
    unsigned int nLayerRatio[4];
}VencH264SVCSkip;
```

【成员】

| 成员名称          | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| nTemporalSVC      | 时域分层数。                                                 |
| nSkipFrame        | 跳帧倍数，若nTemporalSVC 为0，则可独立使用；否则没意义，<br/>实际跳帧受nTemporalSVC 控制。 |
| bEnableLayerRatio | 各层码率比例使能。                                           |
| nLayerRatio[4]    | nLayerRatio[0] ~ nLayerRatio[3] 分别代表1 ~ 4 层中<br/>码率/平均码率的比例，通过此值的设置可控制各层编码质量。 |

【注意事项】

不能与插针混用。

【相关数据类型及接口】

```
// The Amount of Temporal SVC Layers
typedef enum {
NO_T_SVC = 0,
T_LAYER_2 = 2,
T_LAYER_3 = 3,
T_LAYER_4 = 4
}T_LAYER;
// The Multiple of Skip_Frame
typedef enum {
NO_SKIP = 0,
SKIP_2 = 2,
SKIP_4 = 4,
SKIP_8 = 8
}SKIP_FRAME;
```

#### 5.5.29 VencSaveBSFile

【说明】

配置描述编码库保存码流参数。

【定义】

```
typedef struct VencSaveBSFile {
    char filename[256];
    unsigned char save_bsfile_flag;
    unsigned int save_start_time;
    unsigned int save_end_time;
}VencSaveBSFile;
```

【成员】

| 成员名称         | 描述                                                   |
| ---------------- | ------------------------------------------------------ |
| filename[256]    | 码流保存路径及名称。                                   |
| save_bsfile_flag | 是否开启保存码流功能                                   |
| save_start_time  | 距离开始编码的时间间隔，以该间隔作为保存码流的起始时间 |
| save_end_time    | 距离结束编码的时间间隔，以该间隔作为保存码流的结束时间 |

【注意事项】

无

【相关数据类型及接口】

无

#### 5.5.30 VeProcSet

【说明】

编码库的proc 信息设置。

【定义】

```
typedef struct VeProcSet {
    unsigned char bProcEnable;
    unsigned int nProcFreq;
    unsigned int nStatisBitRateTime;
    unsigned int nStatisFrRateTime;
}VeProcSet;
```

【成员】



| 成员名称             | 描述                                                         |
| -------------------- | ------------------------------------------------------------ |
| bProcEnable          | 是否开启proc 调试功能。                                      |
| nProcFreq            | 开启proc 调试功能时每隔多少帧更新一次编码通道参数信息。      |
| nStatisBitRateTime   | 码率统计时间间隔（即以该时间间隔作为proc 信息中的瞬时<br/>码率统计时间间隔），单位为毫秒，默认值是1000ms |
| nStatisFrRateTime 帧 | 率统计时间间隔（即以该时间间隔作为proc 信息中的瞬时<br/>帧率统计时间间隔），单位为毫秒，默认值是1000ms |

【注意事项】

无

【相关数据类型及接口】

无

### 5.6 错误码

| 错误码     | 宏定义                              | 描述                          |
| ---------- | ----------------------------------- | ----------------------------- |
| 0xA0088002 | ERR_VENC_INVALID_CHNID              | 无效的编码通道号              |
| 0xA0088003 | ERR_VENC_ILLEGAL_PARAM              | 编码参数设置无效              |
| 0xA0088004 | ERR_VENC_EXIST                      | 编码通道已经创建              |
| 0xA0088005 | ERR_VENC_UNEXIST                    | 编码通道未创建                |
| 0xA0088006 | ERR_VENC_NULL_PTR                   | 空指针                        |
| 0xA0088007 | ERR_VENC_NOT_CONFIG                 | 编码通道未配置                |
| 0xA0088008 | ERR_VENC_NOT_SUPPORT                | 操作不支持                    |
| 0xA0088009 | ERR_VENC_NOT_PERM                   | 操作不允许                    |
| 0xA008800C | ERR_VENC_NOMEM                      | 系统内存不足                  |
| 0xA008800D | ERR_VENC_NOBUF                      | 编码通道缓存分配失败          |
| 0xA008800F | ERR_VENC_BUF_FULL                   | 编码通道缓存满                |
| 0xA0088010 | ERR_VENC_SYS_NOTREADY               | 系统没有初始化                |
| 0xA0088012 | ERR_VENC_BUSY                       | 编码通道忙                    |
| 0xA0088014 | ERR_VENC_SAMESTATE                  | 编码通道状态相同              |
| 0xA0088015 | ERR_VENC_INVALIDSTATE               | 编码通道无效的状态            |
| 0xA0088016 | ERR_VENC_INCORRECT_STATE_TRANSITION | 编码通道不正确的状态<br/>转换 |
| 0xA0088017 | ERR_VENC_INCORRECT_STATE_OPERATION  | 编码通道不正确的状态<br/>操作 |

## 6 视频解码

### 6.1 概述

VDEC 模块，即视频解码模块。本模块支持多路解码，且每路解码通道独立。

一个完整的本地文件播放流程如下所示, 这里我们说的VDEC 模块仅指送数据包到解码器解码输出图像帧（YUV 数据）的过程。

![image-20230105094451683](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230105094451683.png)

<center>图6-1: 解码播放流程</center>

### 6.2 功能描述

VDEC 模块接收待解码流输入，内部线程完成解码工作。

VDEC 模块支持2 种数据输入输出方式：

绑定方式。主控模块将VDEC 模块的解码通道和待解码流输入组件、显示组件绑定，组件间内部

传递数据。不需主控模块干预数据流入流出。

非绑定方式。主控模块调用VDEC 模块的mpi 层调用接口送入待解码流，获取解码帧、归还解码帧。

VDEC 模块支持图像缩放、旋转等功能。宽度和高度可分别缩小至1/8 倍，实际宽高缩放比例用户可在解码器属性设置里面自定义设置(1/2 1/4 1/8)。支持旋转角度

为：90、180、270 度。



### 6.3 状态图

![image-20230105094618730](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230105094618730.png)

<center>图6-2: VDEC 状态图</center>

Vdec 组件内部状态设定为：

COMP_StateLoaded： 组件初始创建状态。COMP_StateIdle： 组件完成初始化， 参数设置、资源配置完毕， 随时可以运行的状态。COMP_StateExecuting： 运行状态。

COMP_StatePause：暂停状态。COMP_StateInvalid：异常状态。

API AW_MPI_VDEC_CreateChn() 的实现过程会经过COMP_StateLoaded 状态，到达COMP_StateIdle。组件内部状态转换的函数是：SendCommand(…, COMP_CommandStateSet,目标COMP_State, …)；

能够引起状态变化的API，见状态转换图。每个API 只能在允许的状态下调用，如果不在允许的状态下调用API，则无效。API 列表如下：(允许被调用的状态栏填写Y)

| API                            | Idle | Executing | Pause |
| ------------------------------ | ---- | --------- | ----- |
| AW_MPI_VDEC_CreateChn          |      |           |       |
| AW_MPI_VDEC_DestroyChn         | Y    |           |       |
| AW_MPI_VDEC_GetChnAttr         | Y    | Y         | Y     |
| AW_MPI_VDEC_StartRecvStream    | Y    |           | Y     |
| AW_MPI_VDEC_StopRecvStream     |      | Y         | Y     |
| AW_MPI_VDEC_Pause              |      | Y         |       |
| AW_MPI_VDEC_Resume             |      |           | Y     |
| AW_MPI_VDEC_Seek               | Y    | Y         | Y     |
| AW_MPI_VDEC_Query              | Y    | Y         | Y     |
| AW_MPI_VDEC_RegisterCallback   |      |           |       |
| AW_MPI_VDEC_SetStreamEof       | Y    | Y         | Y     |
| AW_MPI_VDEC_ResetChn           | Y    |           |       |
| AW_MPI_VDEC_SetChnParam        | Y    |           |       |
| AW_MPI_VDEC_GetChnParam        | Y    | Y         | Y     |
| AW_MPI_VDEC_SendStream         | Y    | Y         | Y     |
| AW_MPI_VDEC_GetImage           | Y    | Y         | Y     |
| AW_MPI_VDEC_ReleaseImage       | Y    | Y         | Y     |
| AW_MPI_VDEC_GetDoubleImage     | Y    | Y         | Y     |
| AW_MPI_VDEC_ReleaseDoubleImage | Y    | Y         | Y     |
| AW_MPI_VDEC_SetRotate          | Y    |           |       |
| AW_MPI_VDEC_GetRotate          | Y    | Y         | Y     |
| AW_MPI_VDEC_ReopenVideoEngine  | Y    | Y         | Y     |
| AW_MPI_VDEC_SetVEFreq          | Y    |           |       |
| AW_MPI_VDEC_SetVideoStreamInfo | Y    |           |       |
| AW_MPI_VDEC_ForceFramePackage  | Y    |           |       |

### 6.4 API 接口

视频解码模块主要提供视频解码通道（在本文档中通道等同于组件实例）的创建和销毁、视频解码通道的复位、开启和停止接收码流解码等功能。

VDEC 目前对外支持的API 接口：
• AW_MPI_VDEC_CreateChn ：创建视频解码通道。
• AW_MPI_VDEC_DestroyChn ：销毁视频解码通道。
• AW_MPI_VDEC_GetChnAttr ：获取解码通道属性。
• AW_MPI_VDEC_StartRecvStream ：开启解码通道。
• AW_MPI_VDEC_StopRecvStream ：关闭解码通道。
• AW_MPI_VDEC_Pause ：暂停解码。
• AW_MPI_VDEC_Resume ：恢复解码。
• AW_MPI_VDEC_Seek ：设置视频解码通道完成跳播后播放的准备。
• AW_MPI_VDEC_Query ：查询视频解码通道状态。
• AW_MPI_VDEC_RegisterCallback ：设置解码通道回调。
• AW_MPI_VDEC_SetStreamEof ：设置解码输入码流结束标志。
• AW_MPI_VDEC_ResetChn ：复位解码通道。
• AW_MPI_VDEC_SetChnParam ：设置解码通道参数。
• AW_MPI_VDEC_GetChnParam ：获取解码通道参数。
• AW_MPI_VDEC_SendStream ：发送待解码码流给解码通道进行解码。
• AW_MPI_VDEC_GetImage ：获取解码后的帧。
• AW_MPI_VDEC_ReleaseImage ：释放解码帧给解码通道。
• AW_MPI_VDEC_GetDoubleImage ：获取解码后的帧和子帧。
• AW_MPI_VDEC_ReleaseDoubleImage ：释放解码帧和子帧给解码通道。
• AW_MPI_VDEC_SetRotate ：设置解码旋转顺时针角度。
• AW_MPI_VDEC_GetRotate ：获取解码旋转顺时针角度。
• AW_MPI_VDEC_ReopenVideoEngine ：重置解码引擎。
• AW_MPI_VDEC_SetVEFreq ：设置VE 运行频率。
• AW_MPI_VDEC_SetVideoStreamInfo ：设置码流参数，供解码器配置解码参数进行解码。
• AW_MPI_VDEC_ForceFramePackage ：设置帧边界是否确定。

#### 6.4.1 AW_MPI_VDEC_CreateChn

【描述】

创建视频解码通道。

【语法】

```
ERRORTYPE AW_MPI_VDEC_CreateChn(VDEC_CHN VdChn, const VDEC_CHN_ATTR_S *pstAttr);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pstAttr  | 视频解码通道属性指针                          | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.2 AW_MPI_VDEC_DestroyChn

【描述】

销毁视频解码通道。

【语法】

ERRORTYPE AW_MPI_VDEC_DestroyChn(VDEC_CHN VdChn);

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.3 AW_MPI_VDEC_GetChnAttr

【描述】

获取解码通道属性。

【语法】

```
ERRORTYPE AW_MPI_VDEC_GetChnAttr(VDEC_CHN VdChn, VDEC_CHN_ATTR_S *pstAttr);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pstAttr  | 解码通道属性指针。                            | 输出      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.4 AW_MPI_VDEC_StartRecvStream

【描述】

开启解码通道，接收输入码流进行解码。组件状态转换为Comp_StateExecuting。

【语法】

```
ERRORTYPE AW_MPI_VDEC_StartRecvStream(VDEC_CHN VdChn);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

如果通道未创建，则返回失败AW_ERR_VENC_UNEXIST

如果当前已经开启接收，此接口也返回成功。

只有开启接收之后解码器才开始接收码流解码。

【举例】

无

#### 6.4.5 AW_MPI_VDEC_StopRecvStream

【描述】

停止编码通道接收输入数据。

【语法】

```
ERRORTYPE AW_MPI_VDEC_StopRecvStream(VDEC_CHN VdChn);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

如果通道未创建，则返回失败。

此接口并不判断当前是否停止接收，即如果当前已经停止接收，调用此接口也返回成功。

此接口用于解码通道停止接收码流解码，在解码通道销毁或复位前必须停止接收码流。

调用此接口仅停止接收码流解码，码流buffer 并不会被清除。

【举例】

无

#### 6.4.6 AW_MPI_VDEC_Pause

【描述】

暂停解码，解码组件状态转为COMP_StatePause。

【语法】

```
ERRORTYPE AW_MPI_VDEC_Pause(VDEC_CHN VdChn);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

只能从Comp_StateExecuting 状态转换到Comp_StatePause 状态，其他状态下返回失败。

此接口并不判断当前是否已经暂停，即如果当前已经暂停，调用此接口也返回成功。

【举例】

无

#### 6.4.7 AW_MPI_VDEC_Resume

【描述】

恢复解码，解码组件状态从COMP_StatePause 转为Comp_StateExecuting。

【语法】

ERRORTYPE AW_MPI_VDEC_Resume(VDEC_CHN VdChn);

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

只能从状态Comp_StatePause 状态执行，其他状态下返回失败。

【举例】

无

#### 6.4.8 AW_MPI_VDEC_Seek

【描述】

设置视频解码通道完成跳播后播放的准备。

【语法】

ERRORTYPE AW_MPI_VDEC_Seek(VDEC_CHN VdChn);

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.9 AW_MPI_VDEC_Query

【描述】

查询视频解码通道状态。

【语法】

ERRORTYPE AW_MPI_VDEC_Query(VDEC_CHN VdChn, VDEC_CHN_STAT_S *pstStat);

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pstStat  | 通道当前状态                                  | 输出      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.10 AW_MPI_VDEC_RegisterCallback

【描述】

设置解码通道回调

【语法】

```
ERRORTYPE AW_MPI_VDEC_RegisterCallback(VDEC_CHN VdChn, MPPCallbackInfo *pCallback);
```

【参数】

| 参数名称  | 描述                                          | 输入/输出 |
| --------- | --------------------------------------------- | --------- |
| VdChn     | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pCallback | 回调信息。                                    | 输出      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.11 AW_MPI_VDEC_SetStreamEof

【描述】

设置解码输入码流结束标志

【语法】

ERRORTYPE AW_MPI_VDEC_SetStreamEof(VDEC_CHN VdChn, BOOL bEofFlag)；

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| bEofFlag | 结束标记，TRUE：码流结束；FALSE：码流未结束。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.12 AW_MPI_VDEC_ResetChn

【描述】

复位解码通道，但不会重置已设置的解码参数，不会释放已分配的码流缓冲和视频帧。解码通道

复位后，缓冲数据都被清空，随时等待再次解码。

【语法】

ERRORTYPE AW_MPI_VDEC_ResetChn(VDEC_CHN VdChn);

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

Reset 并不存在的通道，返回失败AW_ERR_VENC_UNEXIST。

如果一个通道没有停止接收码流而reset 通道，则返回失败。

【举例】

无

#### 6.4.13 AW_MPI_VDEC_SetChnParam

【描述】

设置解码通道参数。

【语法】

```
ERRORTYPE AW_MPI_VDEC_SetChnParam(VDEC_CHN VdChn, VDEC_CHN_PARAM_S* pstParam);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pstParam | 解码通道参数                                  | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.14 AW_MPI_VDEC_GetChnParam

【描述】

获取解码通道参数。

【语法】

```
ERRORTYPE AW_MPI_VDEC_GetChnParam(VDEC_CHN VdChn, VDEC_CHN_PARAM_S* pstParam);
```

【参数】

| 参数名称 | 描述                                                         | 输入/输出 |
| -------- | ------------------------------------------------------------ | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。输入解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pstParam | 解码通道参数指针                                             | 输出      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.15 AW_MPI_VDEC_SendStream

【描述】

发送待解码码流给解码通道进行解码。

【语法】

```
ERRORTYPE AW_MPI_VDEC_SendStream(VDEC_CHN VdChn, const VDEC_STREAM_S *pstStream, int s32MilliSec);
```

【参数】

| 参数名称    | 描述                                                         | 输入/输出 |
| ----------- | ------------------------------------------------------------ | --------- |
| VdChn       | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。                | 输入      |
| pstStream   | 码流信息结构指针。                                           | 输入      |
| s32MilliSec | 发送码流超时时间。取值范围：[-1, +∞)-1：阻塞0： <br/>非阻塞>0：超时时间。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

超时时间s32MilliSec 的含义，-1 表示必须等到该stream 进入解码通道vbvBuffer 中；0：立刻返回结果，如果当前等待解码的vbvBuffer 满，返回失败；>0：如

果vbvBuffer 满，等待到设定的时间再返回超时。

仅用于组件非绑定方式

【举例】

无

#### 6.4.16 AW_MPI_VDEC_GetImage

【描述】

获取解码后的帧。

【语法】

```
ERRORTYPE AW_MPI_VDEC_GetImage(VDEC_CHN VdChn, VIDEO_FRAME_INFO_S *pstFrameInfo,int s32MilliSec);
```

【参数】

| 参数名称     | 描述                                                         | 输入/输出 |
| ------------ | ------------------------------------------------------------ | --------- |
| VdChn        | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。                | 输入      |
| pstFrameInfo | 解码帧结构体指针。                                           | 输出      |
| s32MilliSec  | 获取解码帧的超时时间。取值范围：  [-1, +∞)-1：阻塞0：非阻塞0：超时时间，单位毫秒。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅用于组件非绑定方式

【举例】

无

#### 6.4.17 AW_MPI_VDEC_ReleaseImage

【描述】

释放解码帧给解码通道。

【语法】

```
ERRORTYPE AW_MPI_VDEC_ReleaseImage(VDEC_CHN VdChn, VIDEO_FRAME_INFO_S *pstFrameInfo);
```

【参数】

| 参数名称     | 描述                                                 | 输入/输出 |
| ------------ | ---------------------------------------------------- | --------- |
| VdChn        | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。        | 输入      |
| pstFrameInfo | 帧结构体指针，使用时只需填写pstFramaInfo->mId 即可。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅用于组件非绑定方式

【举例】

无

#### 6.4.18 AW_MPI_VDEC_GetDoubleImage

【描述】

获取解码后的帧和子帧。

【语法】

```
ERRORTYPE AW_MPI_VDEC_GetDoubleImage(VDEC_CHN VdChn, VIDEO_FRAME_INFO_S *pFrameInfo,VIDEO_FRAME_INFO_S *pSubFrameInfo,int nMilliSec);
```

【参数】

| 参数名称     | 描述                                                         | 输入/输出 |
| ------------ | ------------------------------------------------------------ | --------- |
| VdChn        | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。                | 输入      |
| pstFrameInfo | 解码帧结构体指针                                             | 输出      |
| s32MilliSec  | 获取解码帧的超时时间。取值范围： <br/>[-1, +∞)-1：阻塞0：非阻塞0：超时时间，单位毫秒 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅用于组件非绑定方式

【举例】

无

#### 6.4.19 AW_MPI_VDEC_ReleaseDoubleImage

【描述】

释放解码帧和子帧给解码通道。

【语法】

```
ERRORTYPE AW_MPI_VDEC_ReleaseDoubleImage(VDEC_CHN VdChn, VIDEO_FRAME_INFO_S *pFrameInfo,VIDEO_FRAME_INFO_S *pSubFrameInfo);
```

【参数】

| 参数名称     | 描述                                                 | 输入/输出 |
| ------------ | ---------------------------------------------------- | --------- |
| VdChn        | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。        | 输入      |
| pstFrameInfo | 帧结构体指针，使用时只需填写pstFramaInfo->mId 即可。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

仅用于组件非绑定方式

【举例】

无

#### 6.4.20 AW_MPI_VDEC_SetRotate

【描述】

设置解码旋转顺时针角度。

【语法】

ERRORTYPE AW_MPI_VDEC_SetRotate(VDEC_CHN VdChn, ROTATE_E enRotate);
【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| enRotate | 旋转角度枚举类型。静态属性。                  | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

必须在解码开始前设置，解码过程中设置无效。

【举例】

无

#### 6.4.21 AW_MPI_VDEC_GetRotate

【描述】

获取解码旋转顺时针角度。

【语法】

```
ERRORTYPE AW_MPI_VDEC_GetRotate(VDEC_CHN VdChn, ROTATE_E *penRotate);
```

【参数】

| 参数名称  | 描述                                          | 输入/输出 |
| --------- | --------------------------------------------- | --------- |
| VdChn     | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| penRotate | 旋转角度枚举类型指针                          | 输出      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.22 AW_MPI_VDEC_ReopenVideoEngine

【描述】

重置解码引擎。解码库内部销毁vbvBuffer 和frame buffers。需要在解码通道检测到图像分辨率变化并通过callback 通知之后调用。

【语法】

```
ERRORTYPE AW_MPI_VDEC_ReopenVideoEngine(VDEC_CHN VdChn);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.23 AW_MPI_VDEC_SetVEFreq

【描述】

设置VE 运行频率。

【语法】

ERRORTYPE AW_MPI_VDEC_SetVEFreq(VDEC_CHN VeChn, int nFreq);

【参数】

| 参数名称 | 描述                                                         | 输入/输出 |
| -------- | ------------------------------------------------------------ | --------- |
| VeChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM) 和MM_INVALID_CHN。 | 输入      |
| nFreq    | 频率，单位：MHz                                              | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.24 AW_MPI_VDEC_SetVideoStreamInfo

【描述】

设置码流参数，供解码器配置解码参数进行解码。

【语法】

```
ERRORTYPE AW_MPI_VDEC_SetVideoStreamInfo(VDEC_CHN VdChn, VideoStreamInfo *pVideoStreamInfo)
```

【参数】

| 参数名称         | 描述                                          | 输入/输出 |
| ---------------- | --------------------------------------------- | --------- |
| VdChn            | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| pVideoStreamInfo | 码流信息                                      | 输入      |

【返回值】

| 返回值 | **描述**           |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】

无

【举例】

无

#### 6.4.25 AW_MPI_VDEC_ForceFramePackage

【描述】

设置帧边界是否确定。如果帧边界确定，解码器将跳过检测帧头的过程，加快解码速度。

【语法】

```
ERRORTYPE AW_MPI_VDEC_ForceFramePackage(VDEC_CHN VdChn, BOOL bFlag);
```

【参数】

| 参数名称 | 描述                                          | 输入/输出 |
| -------- | --------------------------------------------- | --------- |
| VdChn    | 解码通道号。取值范围：[0, VDEC_MAX_CHN_NUM)。 | 输入      |
| bFlag    | 帧边界是否确定                                | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_vdec.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

### 6.5 数据结构说明

#### 6.5.1 VIDEO_MODE_E

【说明】
解码器输入码流方式。
【定义】

```
typedef enum VIDEO_MODE_E {
VIDEO_MODE_STREAM = 0, /*send by stream*/
VIDEO_MODE_FRAME, /*send by frame*/
VIDEO_MODE_BUTT
} VIDEO_MODE_E;
```

【成员】

| 成员名称          | 描述   |
| ----------------- | ------ |
| VIDEO_MODE_STREAM | 流模式 |
| VIDEO_MODE_FRAME  | 帧模式 |
| VIDEO_MODE_BUTT   | 无效   |

【注意事项】
无
【相关数据类型及接口】

无

#### 6.5.2 VDEC_CHN_ATTR_S

【说明】
解码通道属性。
【定义】

```
typedef struct VDEC_CHN_ATTR_S {
PAYLOAD_TYPE_E mType; /* video type to be decoded */
unsigned int mBufSize; /* stream buf size(Byte) */
unsigned int mPriority; /* priority */
unsigned int mPicWidth; /* max pic width */
unsigned int mPicHeight; /* max pic height */
ROTATE_E mInitRotation; //clockwise rotation: val=0 no rotation, val=1 90 degree; val
=2 180 degree, val=3 270 degree
PIXEL_FORMAT_E mOutputPixelFormat;
BOOL mSubPicEnable; //support second picture flag, now just for mjpeg,20180103
int mSubPicWidthRatio; // val = 0 : 1; 1 : 1/2; 2 : 1/4; 3 : 1/8; 4 : 1/16
int mSubPicHeightRatio;//[0 4],
PIXEL_FORMAT_E mSubOutputPixelFormat; //sub channel output pixelformat
union {
VDEC_ATTR_JPEG_S mVdecJpegAttr; /* structure with jpeg or mjpeg type */
VDEC_ATTR_VIDEO_S mVdecVideoAttr; /* structure with video ( h264/mpeg4) */
};
int mnFrameBufferNum; /* set frame number which is malloc by vdeclib, 0 means any
number. only valid to jpeg.*/
int mExtraFrameNum; /* let vdeclib malloc more frame buffer base on initial frame
number.*/
} VDEC_CHN_ATTR_S;
```

【成员】

| 成员名称              | 描述                                                         |
| --------------------- | ------------------------------------------------------------ |
| mType                 | 解码类型                                                     |
| mBufSize              | vbvBuffer 的长度。单位字节。取值范围：[0, +∞)。<br/>0 表示解码通道自行决定。静态属性。 |
| mPriority             | 未使用。                                                     |
| mPicWidth             | 解码输出图片的最大宽度。范围：[0, 3840]。0 表示没有限制。<br/>如果原图宽度超过最大宽度，解码通道将进行压缩，压缩比为<br/>1/2,1/4,1/8。原图宽度不能超过3840，否则无法解码。<br/>静态属性。 |
| mPicHeight            | 解码输出图片的最大高度。范围：[0, 2160]。0 表示没有限制。<br/>如果原图高度超过最大高度，解码通道将进行压缩，压缩比为<br/>1/2,1/4,1/8。原图高度不能超过2160，否则无法解码。<br/>静态属性。 |
| mInitRotation         | 解码输出图片旋转角度。范围：[0,3]。1：顺时针旋转90 度；      |
| mInitRotation         | 2：顺时针旋转180 度；3：顺时针旋转270 度。静态属性。         |
| mOutputPixelFormat    | 解码输出图片像素格式。静态属性。                             |
| mSubPicEnable         | 子图解码开关。只支持MJPEG。                                  |
| mSubPicWidthRatio     | 子图宽占主图宽的比例。0:1, 1:1/2, 2:1/4, 3:1/8, 4:1/16。     |
| mSubPicHeightRatio    | 子图高占主图高的比例。取值同上。                             |
| mSubOutputPixelFormat | 子图输出的像素格式。                                         |
| mVdecJpegAttr         | 未使用。                                                     |
| mVdecVideoAttr        | 未使用。                                                     |
| mnFrameBufferNum      | 设置申请frame buffer 个数给解码库，0 表示默认值。<br/>仅对JPEG 有效。 |
| mExtraFrameNum        | 设置额外的frame buffer 个数给解码库，使其申请更大的<br/>bufer 。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 6.5.3 VDEC_STREAM_S

【说明】
解码器输入码流。
【定义】

```
typedef struct VDEC_STREAM_S {
unsigned char* pAddr; /* stream address */
unsigned int mLen; /* stream len */
uint64_t mPTS; /* time stamp */
BOOL mbEndOfFrame; /* is the end of a frame */
BOOL mbEndOfStream; /* is the end of all stream */
} VDEC_STREAM_S;
```

【成员】

| 成员名称      | 描述                 |
| ------------- | -------------------- |
| pAddr         | 输入码流地址         |
| mLen          | 输入码流数据长度     |
| mPTS          | 时间戳               |
| mbEndOfFrame  | 是否是一帧数据的结束 |
| mbEndOfStream | 是否是码流的结尾     |

【注意事项】
无
【相关数据类型及接口】
无

#### 6.5.4 VDEC_DECODE_ERROR_S

【说明】
解码器错误类型。
【定义】

```
typedef struct VDEC_DECODE_ERROR_S {
int mFormatErr; /* format error. eg: do not support filed */
int mPicSizeErrSet; /* picture width or height is larger than chnnel width or height
*/
int mStreamUnsprt; /* unsupport the stream specification */
int mPackErr; /* stream package error */
int mPrtclNumErrSet; /* protocol num is not enough. eg: slice, pps, sps */
int mRefErrSet; /* refrence num is not enough */
int mPicBufSizeErrSet; /* the buffer size of picture is not enough */
} VDEC_DECODE_ERROR_S;
```

【成员】

| 成员名称                         | 描述                |
| -------------------------------- | ------------------- |
| mFormatErr                       | 格式错误。          |
| mPicSizeErrSet                   | 图片大小超过限制。  |
| mStreamUnsprt                    | 不支持stream SPEC。 |
| mPackErr                         | stream 的包错误。   |
| mPrtclNumErrSet                  | 协议不满足要求。    |
| mRefErrSet                       | 参考帧不满足要求。  |
| mPicBufSizeErrSet Picture buffer | 大小不满足要求。    |

【注意事项】
无
【相关数据类型及接口】
无

#### 6.5.5 VDEC_CHN_STAT_S

【说明】
解码通道属性。
【定义】

```
typedef struct VDEC_CHN_STAT_S {
PAYLOAD_TYPE_E mType; /* video type to be decoded */
unsigned int mLeftStreamBytes; /* left stream bytes waiting for decode */
unsigned int mLeftStreamFrames; /* left frames waiting for decode,only valid for
H264D_MODE_FRAME */
unsigned int mLeftPics; /* pics waiting for output */
BOOL mbStartRecvStream; /* had started recv stream? */
unsigned int mRecvStreamFrames; /* how many frames of stream has been received. valid
when send by frame. */
unsigned int mDecodeStreamFrames; /* how many frames of stream has been decoded. valid
when send by frame. */
unsigned int mLeftDecodeStreamFrames; /* Number of frames to be decoded. This member
is valid after AW_MPI_VDEC_StartRecvStreamEx is called.*/
VDEC_DECODE_ERROR_S mVdecDecErr; /* information about decode error */
} VDEC_CHN_STAT_S;
```

【成员】

| 成员名称            | 描述                                                   |
| ------------------- | ------------------------------------------------------ |
| mType               | 解码类型                                               |
| mLeftStreamBytes    | 解码器输入有多少数据待解码                             |
| mLeftStreamFrames   | 解码器输入待解码数据有多少帧                           |
| mLeftPics           | 解码器输出剩余多少图片没有取                           |
| mbStartRecvStream   | 是否开始接收待解码数据                                 |
| mRecvStreamFrames   | 接收到的待解码数据有多少帧（按帧传送方式时），未使用。 |
| mDecodeStreamFrames | 解码出来的数据有多少帧（按帧传送方式时），未使用。     |
| mVdecDecErr         | 解码器错误类型，未使用。                               |

【注意事项】
无
【相关数据类型及接口】
无



#### 6.5.6 VDEC_CHN_PARAM_S

【说明】

解码通道参数。
【定义】

```
/*
* static parameter: must set after stop sending stream and all stream is decoded.
* dynamic parameter: can be set at any time.
*/
typedef struct VDEC_CHN_PARAM_S {
int mChanErrThr; /* threshold for stream error process, 0: discard with any error, 100
: keep data with any error */
int mChanStrmOFThr; /* threshold for stream overflow, 0~ , 0: nothing to do when stream
is overflow */
int mDecMode; /* decode mode , 0: deocde IPB frames, 1: only decode I frame & P frame ,
2: only decode I frame */
int mDecOrderOutput; /* frames output order ,0: the same with display order , 1: the
same with decoder order */
VIDEO_FORMAT_E mVideoFormat;
COMPRESS_MODE_E mCompressMode;
} VDEC_CHN_PARAM_S;
```

【成员】

| 成员名称        | 描述                                                         |
| --------------- | ------------------------------------------------------------ |
| mChanErrThr     | 未使用                                                       |
| mChanStrmOFThr  | 未使用                                                       |
| mDecMode        | 解码模式。0：普通解码；1：I 帧和P 帧解码；2：I 帧解码。<br/>目前只支持0 和1。动态属性。 |
| mDecOrderOutput | 未使用                                                       |
| mVideoFormat    | 未使用                                                       |
| mCompressMode   | 未使用                                                       |

【注意事项】
无
【相关数据类型及接口】
无

#### 6.5.7 VDEC_PRTCL_PARAM_S

【说明】
解码协议参数。
【定义】

```
typedef struct VDEC_PRTCL_PARAM_S {
int mMaxSliceNum; /* max slice num support */
int mMaxSpsNum; /* max sps num support */
int mMaxPpsNum; /* max pps num support */
int mDisplayFrameNum; /* display frame num */
} VDEC_PRTCL_PARAM_S;
```

【成员】

```
成员名称描述
mMaxSliceNum 最大slice 数量，未使用。
mMaxSpsNum 最大sps 数量，未使用。
mMaxPpsNum 最大pps 数量，未使用。
mDisplayFrameNum 显示帧数量，未使用。
```

【注意事项】
无
【相关数据类型及接口】
无

### 6.6 错误码

| 错误代码   | 宏定义                              | 描述                                                |
| ---------- | ----------------------------------- | --------------------------------------------------- |
| 0xA0058002 | ERR_VDEC_INVALID_CHNID              | 通道ID 超出合法范围                                 |
| 0xA0058003 | ERR_VDEC_ILLEGAL_PARAM              | 参数超出合法范围。                                  |
| 0xA0058004 | ERR_VDEC_EXIST                      | 试图申请或者创建已经存<br/>在的设备、通道或者资源。 |
| 0xA0058006 | ERR_VDEC_NULL_PTR                   | 函数参数中有空指针。                                |
| 0xA0058007 | ERR_VDEC_NOT_CONFIG                 | 使用前未配置。                                      |
| 0xA0058008 | ERR_VDEC_NOT_SUPPORT                | 不支持的参数或者功能。                              |
| 0xA0058009 | ERR_VDEC_NOT_PERM                   | 该操作不允许，如试图<br/>修改静态配置参数。         |
| 0xA0058005 | ERR_VDEC_UNEXIST                    | 试图使用或者销毁不存在<br/>的设备、通道或者资源。   |
| 0xA005800C | ERR_VDEC_NOMEM                      | 分配内存失败，如系统内<br/>存不足。                 |
| 0xA005800D | ERR_VDEC_NOBUF                      | 分配缓存失败，如申请的<br/>数据缓冲区太大。         |
| 0xA005800E | ERR_VDEC_BUF_EMPTY                  | 缓冲区中无数据。                                    |
| 0xA005800F | ERR_VDEC_BUF_FULL                   | 缓冲区中数据满。                                    |
| 0xA0058010 | ERR_VDEC_SYS_NOTREADY               | 系统没有初始化或没有加<br/>载相应模块。             |
| 0xA0058012 | ERR_VDEC_BUSY VENC                  | 系统忙。                                            |
| 0xA0058014 | ERR_VDEC_SAMESTATE                  | 状态相同。                                          |
| 0xA0058015 | ERR_VDEC_INVALIDSTATE               | 无效的状态。                                        |
| 0xA0058016 | ERR_VDEC_INCORRECT_STATE_TRANSITION | 状态转换出错。                                      |
| 0xA0058011 | ERR_VDEC_BADADDR                    | 非法地址。                                          |

## 7 MUX 模块

### 7.1 概述

MUX 模块，即文件封装模块。本模块以muxGroup 为单位，一个muxGroup 包含一个或多个mux 通道，属于同一muxGroup 的mux 通道对输入的同一视频、音频编码数据流进行封装。使用muxGroup 的原因是：有时不仅需要把视频、音频数据流封装为mp4 文件本地存储，同时还需封装为raw 码流或ts 码流通过网络传输，这时需要对接收的同一视频、音频流数据同时进行2 路封装处理（1 路处理对应一个mux 通道），故设计muxGroup。目前一个muxGroup 最多支持两个muxchn 输出。

![image-20230202120355674](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230202120355674.png)

### 7.2 功能描述与使用

mux 通道内部线程完成封装和写入（写卡）的功能。
mux 模块只支持绑定方式的数据输入。主控模块必须将muxGroup 组件和编码组件绑定。mux模块的数据输入对象是muxGroup。muxChannel 在group 内部接收处理数据。
一个muxGroup 输入端最多支持2 个输入绑定（video enc/audio enc）。

![image-20230202144823837](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230202144823837.png)

本地存储操作时，应用app 仅需要设置录像文件fd 与mux 进行互动。录像时，mux 会在当前录像文件结束前10 秒向app 应用发消息MPP_EVENT_NEXT_FD，获取下一个录像文件的句柄fd（mux 内部会对此fd 进行dup 操作，应用app 应自己close 该fd）；mux 在封装完一个文件后会向app 应用发送MPP_EVENT_RECORD_DONE 消息，表示一个录像文件已经完成。
对于非本地存储操作（如ts 网络传输），设置chn 属性时可设置mCallbackOutflag 标志（数据操作由外部回调完成），mux 会向应用发出消息MPP_EVENT_BSFRAME_AVAILABLE 消息，由应用自行处理数据。
mux 模块本身不对数据流进行任何的拷贝操作，所有的数据buffer 均由输入端绑定通道（venc或者aenc 组件实例）提供。因此在销毁muxGroup 和muxGroup 的输入绑定端的时候，mux-Group 必须先于输入绑定端组件销毁（销毁muxGroup 时会处理所有关联数据buffer），将相关的编码数据packet buffer 还给venc 或者aenc 组件。

#### 7.2.1 muxGroup 和muxChannel

![image-20230202144843440](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230202144843440.png)

如上图所示：muxGroup 和VEnc，AEnc 组件交互数据，Group 下的各muxChannel 处理同样的音视频数据，同时满足不同的封装要求。
Group 参数是配置给Group 下所有channel 的参数。channel 参数是单独设置给指定的channel 的。

Group 参数和channel 参数的优先级为：channel > group。即如果某个channel 的channel参数和group 参数有冲突，那么以channel 参数为准。
muxGroup 属性和muxChannel 属性的关系也是：channel > group。
muxChannel 必须归属于某个muxGroup 之下，muxGroup 同一操作其下的channel，如start, stop, reset 等。channel 和Group 的隶属关系，由调用者在创建muxChannel 时指定。必须先创建muxGroup，再创建muxChannel。

### 7.3 状态图

![image-20230202144908657](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230202144908657.png)

demux 组件内部状态设定为：
• COMP_StateLoaded：组件初始创建状态。
• COMP_StateIdle：组件完成初始化，参数设置、资源配置完毕，随时可以运行的状态。
• COMP_StateExecuting：运行状态。
• COMP_StatePause：暂停状态。
• COMP_StateInvalid：异常状态。
AW_MPI_MUX_CreateChn() 的实现过程会经过COMP_StateLoaded 状态， 到达COMP_StateIdle。

组件内部状态转换的函数是：SendCommand(…, COMP_CommandStateSet, 目标COMP_State, …)；能够引起状态变化的API，见状态转换图。
每个API 只能在允许的状态下调用，如果不在允许的状态下调用API，则无效。API 列表如下：(允许被调用的状态栏填写Y)

|                                        | Idle | Pause | Executing |
| -------------------------------------- | ---- | ----- | --------- |
| AW_MPI_MUX_CreateGrp                   |      |       |           |
| AW_MPI_MUX_DestroyGrp                  |      |       |           |
| AW_MPI_MUX_StartGrp                    | Y    |       |           |
| AW_MPI_MUX_StopGrp                     |      | Y     | Y         |
| AW_MPI_MUX_GetGrpAttr                  | Y    |       | Y         |
| AW_MPI_MUX_SetGrpAttr                  | Y    |       | Y         |
| AW_MPI_MUX_SetH264SpsPpsInfo           | Y    |       | Y         |
| AW_MPI_MUX_SetH265SpsPpsInfo           | Y    |       | Y         |
| AW_MPI_MUX_CreateChn                   | Y    |       | Y         |
| AW_MPI_MUX_DestroyChn                  | Y    |       | Y         |
| AW_MPI_MUX_GetChnAttr                  | Y    |       | Y         |
| AW_MPI_MUX_SetChnAttr                  | Y    |       | Y         |
| AW_MPI_MUX_SwitchFd                    |      |       | Y         |
| AW_MPI_MUX_SwitchFileNormal            |      |       | Y         |
| AW_MPI_MUX_RegisterCallback            |      |       | Y         |
| AW_MPI_MUX_GetCacheStatus              | Y    | Y     | Y         |
| AW_MPI_MUX_SetMuxCacheDuration         | Y    |       |           |
| AW_MPI_MUX_SetMuxCacheStrmIds          | Y    |       |           |
| AW_MPI_MUX_SetSwitchFileDurationPolicy | Y    |       |           |
| AW_MPI_MUX_GetSwitchFileDurationPolicy | Y    |       |           |
| AW_MPI_MUX_SetThmPic                   |      |       | Y         |

### 7.4 API 接口

MUX 模块主要提供muxGroup，mux 通道(在本文档中通道等同于组件实例) 的创建和销毁、通道的复位、开启和停止等功能。
MUX 目前对外支持的API 接口：

• AW_MPI_MUX_CreateGrp ：创建muxgroup。
• AW_MPI_MUX_DestroyGrp ：销毁muxgroup。
• AW_MPI_MUX_StartGrp ：启动muxGroup 接收数据。

• AW_MPI_MUX_StopGrp ：停止muxGroup 接收数据。
• AW_MPI_MUX_GetGrpAttr ：获取muxGroup 属性。
• AW_MPI_MUX_SetGrpAttr ：设置muxGroup 属性。
• AW_MPI_MUX_SetH264SpsPpsInfo ：设置muxgroup 的H264spspps 信息。
• AW_MPI_MUX_SetH265SpsPpsInfo ：设置muxgroup 的H265spspps 信息。
• AW_MPI_MUX_CreateChn ：创建mux 通道，必须指定归属的muxGroup。
• AW_MPI_MUX_DestroyChn ：销毁mux 通道，从muxGroup 中撤出。
• AW_MPI_MUX_GetChnAttr ：获取mux 通道属性。
• AW_MPI_MUX_SetChnAttr ：设置mux 通道属性。
• AW_MPI_MUX_SwitchFd ：切换（录像）文件句柄。
• AW_MPI_MUX_SwitchFileNormal ：设置正常切换（录像）文件。
• AW_MPI_MUX_RegisterCallback ：设置muxgroup 的回调函数。
• AW_MPI_MUX_GetCacheStatus ：获取mux group 的缓冲buffer 状态。
• AW_MPI_MUX_SetMuxCacheDuration ：设置mux group 的缓冲时间。用于缓冲音视频
编解码数据。
• AW_MPI_MUX_SetMuxCacheStrmIds ：设置mux group 的缓冲stream IDs。
• AW_MPI_MUX_SetSwitchFileDurationPolicy ：设置文件切换策略。
• AW_MPI_MUX_GetSwitchFileDurationPolicy ：获取文件切换策略。
• AW_MPI_MUX_SetThmPic ：设置获取缩略图的地址和size。

#### 7.4.1 AW_MPI_MUX_CreateGrp

【描述】
创建muxGroup。
【语法】

```
ERRORTYPE AW_MPI_MUX_CreateGrp(MUX_GRP muxGrp, MUX_GRP_ATTR_S *pGrpAttr);
```

【参数】

| 参数名称 | 描述                                           | 输入/输出 |
| -------- | ---------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |
| pGrpAttr | MUX GROUP 属性指针。                           | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.2 AW_MPI_MUX_DestroyGrp

【描述】
销毁muxGroup。
【语法】

```
ERRORTYPE AW_MPI_MUX_DestroyGrp(MUX_GRP muxGrp);
```

【参数】

| 参数名称 | 描述                                           | 输入/输出 |
| -------- | ---------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.3 AW_MPI_MUX_StartGrp

【描述】
启动muxGroup 接收数据。
【语法】

```
ERRORTYPE AW_MPI_MUX_StartGrp(MUX_GRP muxGrp);
```

【参数】

| 参数名称 | 描述                                           | 输入/输出 |
| -------- | ---------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.4 AW_MPI_MUX_StopGrp

【描述】
停止muxGroup 接收数据。
【语法】

```
ERRORTYPE AW_MPI_MUX_StopGrp(MUX_GRP muxGrp);
```

【参数】

| 参数名称 | 描述                                           | 输入/输出 |
| -------- | ---------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.5 AW_MPI_MUX_GetGrpAttr

【描述】
获取muxGroup 属性。
【语法】

```
ERRORTYPE AW_MPI_MUX_GetGrpAttr(MUX_GRP muxGrp, MUX_GRP_ATTR_S *pGrpAttr);
```

【参数】

| 参数名称          | 描述                                           | 输入/输出 |
| ----------------- | ---------------------------------------------- | --------- |
| muxGrp            | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |
| pGrpAttr muxGroup | 属性指针。                                     | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.6 AW_MPI_MUX_SetGrpAttr

【描述】
设置muxGroup 属性。

【语法】

```
ERRORTYPE AW_MPI_MUX_SetGrpAttr(MUX_GRP muxGrp, MUX_GRP_ATTR_S *pGrpAttr);
```

【参数】

| 参数名称          | 描述                                           | 输入/输出 |
| ----------------- | ---------------------------------------------- | --------- |
| muxGrp            | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |
| pGrpAttr muxGroup | 属性指针。                                     | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
如果通道未创建，则返回失败。
此接口并不判断当前是否已经暂停解析，如果已经暂停，调用此接口也返回成功。
【举例】
无

#### 7.4.7 AW_MPI_MUX_SetH264SpsPpsInfo

【描述】
设置muxgroup 的H264spspps 信息。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetH264SpsPpsInfo(MUX_GRP muxGrp, VencHeaderData *pH264SpsPpsInfo);
```

【参数】

| 参数名称        | 描述                                           | 输入/输出 |
| --------------- | ---------------------------------------------- | --------- |
| muxGrp          | MUX GROUP 号。取值范围：[0, MUX_MAX_GRP_NUM)。 | 输入      |
| pH264SpsPpsInfo | H264 spspps 信息头。                           | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.8 AW_MPI_MUX_SetH265SpsPpsInfo

【描述】
设置muxgroup 的spspps 信息。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetH265SpsPpsInfo(MUX_GRP muxGrp, VencHeaderData *pH264SpsPpsInfo);
```

【参数】

| 参数名称        | 描述                                                 | 输入/输出 |
| --------------- | ---------------------------------------------------- | --------- |
| muxGrp          | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| pH265SpsPpsInfo | H265 spspps 信息头。                                 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】

无

#### 7.4.9 AW_MPI_MUX_CreateChn

【描述】
创建mux 通道，必须指定归属的muxGroup。
【语法】

```
ERRORTYPE AW_MPI_MUX_CreateChn(MUX_GRP muxGrp, MUX_CHN muxChn, MUX_CHN_ATTR_S *pChnAttr，
int nFd);
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| muxChn   | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。         | 输入      |
| pChnAttr | mux 通道属性指针。                                   | 输入      |
| nFd      | 文件句柄。                                           | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.10 AW_MPI_MUX_DestroyChn

【描述】
销毁mux 通道，从muxGroup 中撤出。
【语法】

```
ERRORTYPE AW_MPI_MUX_DestroyChn(MUX_GRP muxGrp, MUX_CHN muxChn);
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| muxChn   | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。         | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.11 AW_MPI_MUX_GetChnAttr

【描述】
获取mux 通道属性。
【语法】

```
ERRORTYPE AW_MPI_MUX_GetChnAttr(MUX_GRP muxGrp, MUX_CHN muxChn, MUX_CHN_ATTR_S *pChnAttr);
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| muxChn   | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。         | 输入      |
| pChnAttr | mux 通道属性指针。                                   | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.12 AW_MPI_MUX_SetChnAttr

【描述】
设置mux 通道属性。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetChnAttr(MUX_GRP muxGrp, MUX_CHN muxChn, MUX_CHN_ATTR_S *pChnAttr);
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| muxChn   | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。         | 输入      |
| pChnAttr | mux 通道属性指针。                                   | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.13 AW_MPI_MUX_SwitchFd

【描述】
切换（录像）文件句柄。
【语法】

```
ERRORTYPE AW_MPI_MUX_SwitchFd(MUX_GRP muxGrp, MUX_CHN muxChn, int fd, int nFallocateLen);
```

【参数】

| 参数名称      | 描述                                                 | 输入/输出 |
| ------------- | ---------------------------------------------------- | --------- |
| muxGrp        | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| muxChn        | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。         | 输入      |
| pChnAttr      | mux 通道属性指针。                                   | 输出      |
| nFallocateLen | 文件长度。                                           | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.14 AW_MPI_MUX_SwitchFileNormal

【描述】
设置正常切换（录像）文件。
【语法】

```
ERRORTYPE AW_MPI_MUX_SwitchFileNormal(MUX_GRP muxGrp, MUX_CHN muxChn, int fd, int
nFallocateLen, BOOL bIncludeCache);
```

【参数】

| 参数名称      | 描述                                                 | 输入/输出 |
| ------------- | ---------------------------------------------------- | --------- |
| muxGrp        | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| muxChn        | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。         | 输入      |
| pChnAttr      | mux 通道属性指针。                                   | 输出      |
| bIncludeCache | 新文件是否包含cache 数据。                           | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.15 AW_MPI_MUX_RegisterCallback

【描述】
设置muxgroup 的回调函数。
【语法】

```
ERRORTYPE AW_MPI_MUX_RegisterCallback(MUX_GRP muxGrp, MPPCallbackInfo *pCallback);
```

【参数】

| 参数名称  | 描述                                                 | 输入/输出 |
| --------- | ---------------------------------------------------- | --------- |
| muxGrp    | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| pCallback | 回调参数指针                                         | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.16 AW_MPI_MUX_GetCacheStatus

【描述】
获取mux group 的缓冲buffer 状态。
【语法】

```
ERRORTYPE AW_MPI_MUX_GetCacheStatus(MUX_GRP muxGrp, CacheState *pCacheState);
```

【参数】

| 参数名称    | 描述                                                         | 输入/输出 |
| ----------- | ------------------------------------------------------------ | --------- |
| muxGrp      | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。         | 输入      |
| pCacheState | 缓冲状态。（有效buffer 占的百分比，<br/>有效buffer 大小，总buffer 大小。单位：KB。） | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.17 AW_MPI_MUX_SetMuxCacheDuration

【描述】

设置mux group 的缓冲时间。用于缓冲音视频编解码数据。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetMuxCacheDuration(MUX_GRP muxGrp, int nCacheMs);
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| nCacheMs | 缓冲时间，单位ms                                     | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.18 AW_MPI_MUX_SetMuxCacheStrmIds

【描述】
设置mux group 的缓冲stream IDs。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetMuxCacheStrmIds(MUX_GRP muxGrp, unsigned int nStreamIds);
```

【参数】

| 参数名称   | 描述                                                 | 输入/输出 |
| ---------- | ---------------------------------------------------- | --------- |
| muxGrp     | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| nStreamIds | stream ID。                                          | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.19 AW_MPI_MUX_SetSwitchFileDurationPolicy

【描述】
设置文件切换策略。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetSwitchFileDurationPolicy(MUX_GRP muxGrp, MUX_CHN muxChn,
RecordFileDurationPolicy ePolicy)
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| ePolicy  | 文件切换策略                                         | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.20 AW_MPI_MUX_GetSwitchFileDurationPolicy

【描述】
获取文件切换策略。
【语法】

```
ERRORTYPE AW_MPI_MUX_GetSwitchFileDurationPolicy(MUX_GRP muxGrp, MUX_CHN muxChn,
RecordFileDurationPolicy *pPolicy)
```

【参数】

| 参数名称 | 描述                                                 | 输入/输出 |
| -------- | ---------------------------------------------------- | --------- |
| muxGrp   | MUX GROUP 号。取值范围：<br/>[0, MUX_MAX_GRP_NUM) 。 | 输入      |
| pPolicy  | 文件切换策略                                         | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无

#### 7.4.21 AW_MPI_MUX_SetThmPic

【描述】
设置获取缩略图的地址和size。
【语法】

```
ERRORTYPE AW_MPI_MUX_SetThmPic(MUX_GRP muxGrp, MUX_CHN muxChn, char *p_thm_pic, int
thm_pic_size);
```

【参数】

| 参数名称              | 描述                                         | 输入/输出 |
| --------------------- | -------------------------------------------- | --------- |
| muxGrp MUX GROUP 号。 | 取值范围：[0, MUX_MAX_GRP_NUM)。             | 输入      |
| muxChn                | MUX chn 号。取值范围：[0, MUX_MAX_CHN_NUM)。 | 输入      |
| p_thm_pic             | 缩略图的地址。                               | 输入      |
| thm_pic_size          | 缩略图的size。                               | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【注意】
无
【举例】
无



### 7.5 数据类型

#### 7.5.1 MUX_GRP_ATTR_S

【说明】
mux group 属性数据结构体。
【定义】

```
/*Define attributes of mux GROUP*/
typedef struct MUX_GRP_ATTR_S
{
// video
int mVideoAttrValidNum;
VideoAttr mVideoAttr[6];
/*
int mHeight;
int mWidth;
int mVideoFrmRate; // *1000
int mCreateTime;
int mMaxKeyInterval;
PAYLOAD_TYPE_E mVideoEncodeType; //VENC_CODEC_H264
int mRotateDegree; //0, 90, 180, 270
int mVeChn;
*/
// audio
int mChannels;
int mBitsPerSample;
int mSamplesPerFrame; //sample_cnt_per_frame
int mSampleRate;
PAYLOAD_TYPE_E mAudioEncodeType; //AUDIO_ENCODER_AAC_TYPE
// text
PAYLOAD_TYPE_E mTextEncodeType;
}MUX_GRP_ATTR_S;
```

【成员】

| 成员名称             | 描述                                              |
| -------------------- | ------------------------------------------------- |
| mVideoAttrValidNum   | 视频属性有效个数。                                |
| mVideoAttr[6]        | 视频属性。                                        |
| mChannels            | 音频通路数，取值范围：[1,2]                       |
| mBitsPerSample       | 音频采样深度，取值范围：[16]                      |
| mSamplesPerFrame     | 音频每帧采样数，取值范围：[1024]                  |
| mSampleRate          | 音频采样率，取值范围：8000, 16000, 44100, 48000。 |
| mAudioEncodeType     | 音频编码类型。                                    |
| mTextEncodeType text | 编码类型。                                        |

【注意事项】
无
【相关数据类型及接口】
无

#### 7.5.2 MUX_CHN_ATTR_S

【说明】
muxChannel 属性参数结构体。
【定义】

```
/*Define attributes of mux channel*/
typedef struct MUX_CHN_ATTR_S
{
int mMuxerId;
MEDIA_FILE_FORMAT_E mMediaFileFormat;
int64_t mMaxFileDuration; //unit:ms
int64_t mMaxFileSizeBytes; //unit:byte
int mFallocateLen;
BOOL mCallbackOutFlag; //send data through callback.
FSWRITEMODE mFsWriteMode;
int mSimpleCacheSize;
BOOL bBufFromCacheFlag;
int mAddRepairInfo; //1: add, 0:not add.
int mMaxFrmsTagInterval; //unit:us, for mp4 repair
}MUX_CHN_ATTR_S;
```

【成员】

| 成员名称          | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| mMuxerId          | muxer 实例的id 号，由调用者指定，同一muxerGroup 下的<br/>muxerChannel 的muxerId 号不能重复。 |
| mMediaFileFormat  | 文件封装类型                                                 |
| mMaxFileDuration  | 文件最大持续时间（ms）                                       |
| mMaxFileSizeBytes | 文件最大长度                                                 |
| mFallocateLen     | 文件预分配长度                                               |
| mCallbackOutFlag  | 是否回调输出（用于网络传输），如果为TRUE，则不写文件<br/>系统，通过callback 输出数据。 |
| mFsWriteMode      | 写卡操作方式类型，只支持FSWRITEMODE_SIMPLECACHE 和<br/>FSWRITEMODE_DIRECT。 |
| mSimpleCacheSize  | simpleCahce 写卡模式下的cache 大小。                         |

【注意事项】
本地写卡时支持2 种写卡方式。
【相关数据类型及接口】
无

#### 7.5.3 CdxFdT

【说明】
CdxFdT 参数结构体。
【定义】

```
typedef struct CdxFdT
{
int mFd;
int mnFallocateLen;
//int mIsImpact;
int mMuxerId;
}CdxFdT;
```

| 成员名称       | 描述                         |
| -------------- | ---------------------------- |
| mFd            | 文件句柄                     |
| mnFallocateLen | 文件预分配长度，单位：字节。 |
| mIsImpact      | 是否是碰撞文件               |
| mMuxerId       | muxid                        |

【注意事项】
无
【相关数据类型及接口】
无

#### 7.5.4 RecordFileDurationPolicy

【说明】
录制文件的切换策略的枚举类型。
【定义】

```
typedef enum {
RecordFileDurationPolicy_MinDuration = 0,
RecordFileDurationPolicy_AverageDuration,
RecordFileDurationPolicy_AccurateDuration,
}RecordFileDurationPolicy;
```

【成员】

| 成员名称                                 | 描述                                                         |
| ---------------------------------------- | ------------------------------------------------------------ |
| RecordFileDurationPolicy_MinDuration     | 最小时长策略，录制时间必须要大<br/>于等于用户指定的时长。    |
| RecordFileDurationPolicy_AverageDuration | 平均时长策略，录制的文件的平均<br/>时长等于用户指定的时长，单个文<br/>件时长可以大于或小于用户指定时<br/>长。 |

【注意事项】
无
【相关数据类型及接口】
无

### 7.6 错误码

| 错误代码   | 宏定义                  | 描述                                            |
| ---------- | ----------------------- | ----------------------------------------------- |
| 0xA0658002 | ERR_MUX_INVALID_CHNID   | 通道ID 超出合法范围                             |
| 0xA0658003 | ERR_MUX_ILLEGAL_PARAM   | 参数超出合法范围                                |
| 0xA0658004 | ERR_MUX_EXIST >或者资源 | 试图申请或者创建已经存在的设备、通道<br/        |
| 0xA0658006 | ERR_MUX_NULL_PTR        | 函数参数中有空指针                              |
| 0xA0658007 | ERR_MUX_NOT_CONFIG      | 使用前未配置                                    |
| 0xA0658008 | ERR_MUX_NOT_SUPPORT     | 不支持的参数或者功能                            |
| 0xA0658009 | ERR_MUX_NOT_PERM        | 该操作不允许，如试图修改静态配置参数            |
| 0xA0658005 | ERR_MUX_UNEXIST         | 试图使用或者销毁不存在的设备、通道或<br/>者资源 |
| 0xA065800C | ERR_MUX_NOMEM           | 分配内存失败，如系统内存不足                    |
| 0xA065800D | ERR_MUX_NOBUF           | 分配缓存失败，如申请的数据缓冲区太大            |
| 0xA0658010 | ERR_MUX_SYS_NOTREADY    | 系统没有初始化或没有加载相应模块                |
| 0xA0658012 | ERR_MUX_BUSY MUX        | 系统忙                                          |

## 8 DEMUX 模块

### 8.1 概述

DEMUX 模块，即文件解封装模块。本模块支持创建多个demux 通道，每路通道的解封装过程独立。

### 8.2 功能描述

demux 通道内部线程完成读媒体文件，分包功能。
demux 模块输入、输出端口均支持绑定与绑定非方式。输入输出端口连接支持情况如下图所示。输入端口最多支持1 路clock 输入绑定，输出端口最多支持2 路输出绑定（vdec/adec）。
demux 通道支持只解析视频包或者只解析音频包；支持seek 解析。
注意事项：输出绑定方式时,demux 模块本身不分配存放解析包所需要的内存，相应内存由demux输出端绑定端口vdec/adec 模块分配。

![image-20230203095326876](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203095326876.png)

### 8.3 状态图

![image-20230203095343110](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203095343110.png)

demux 组件内部状态设定为：
• COMP_StateLoaded：组件初始创建状态。
• COMP_StateIdle：组件完成初始化，参数设置、资源配置完毕，随时可以运行的状态。
• COMP_StateExecuting：运行状态。
• COMP_StatePause：暂停状态。
• COMP_StateInvalid：异常状态。
AW_MPI_DEMUX_CreateChn() 的实现过程会经过COMP_StateLoaded 状态， 到达
COMP_StateIdle。
组件内部状态转换的函数是：SendCommand(…, COMP_CommandStateSet, 目标
COMP_State, …)；
能够引起状态变化的API，见状态转换图。
每个API 只能在允许的状态下调用，如果不在允许的状态下调用API，则无效。
API 列表如下：(允许被调用的状态栏填写Y)

| API                               | Idle | Pause | Executing | Invalid |
| --------------------------------- | ---- | ----- | --------- | ------- |
| AW_MPI_DEMUX_CreateChn            |      |       |           |         |
| AW_MPI_DEMUX_DestroyChn           | Y    | Y     | Y         | Y       |
| AW_MPI_DEMUX_RegisterCallback     |      |       |           |         |
| AW_MPI_DEMUX_SetChnAttr           | Y    |       | Y         |         |
| AW_MPI_DEMUX_GetChnAttr           | Y    |       | Y         |         |
| AW_MPI_DEMUX_GetMediaInfo         | Y    | Y     | Y         |         |
| AW_MPI_DEMUX_Start                | Y    | Y     |           |         |
| AW_MPI_DEMUX_Stop                 |      | Y     | Y         |         |
| AW_MPI_DEMUX_Pause                |      |       | Y         |         |
| AW_MPI_DEMUX_ResetChn             | Y    |       |           |         |
| AW_MPI_DEMUX_Seek                 |      | Y     | Y         |         |
| AW_MPI_DEMUX_getDmxOutPutBuf      |      |       | Y         |         |
| AW_MPI_DEMUX_releaseDmxBuf        |      |       | Y         |         |
| AW_MPI_DEMUX_SelectVideoStream    | Y    |       |           |         |
| AW_MPI_DEMUX_SelectAudioStream    | Y    |       |           |         |
| AW_MPI_DEMUX_SelectSubtitleStream | Y    |       |           |         |

### 8.4 API 接口

demux 模块主要提供demux 通道(在本文档中通道等同于组件实例) 的创建和销毁、通道的复位、开启和停止等功能。
DEMUX 目前对外支持的API 接口：

• AW_MPI_DEMUX_CreateChn ：创建demux 通道。
• AW_MPI_DEMUX_DestroyChn ：销毁demux 通道。
• AW_MPI_DEMUX_RegisterCallback ：设置通道回调。
• AW_MPI_DEMUX_SetChnAttr ：设置通道属性。
• AW_MPI_DEMUX_GetChnAttr ：获取通道属性。
• AW_MPI_DEMUX_GetMediaInfo ：获取解析出来的媒体信息。
• AW_MPI_DEMUX_Start ：开始解析。
• AW_MPI_DEMUX_Stop ：停止解析。
• AW_MPI_DEMUX_Pause ：暂停解析。
• AW_MPI_DEMUX_Seek ：跳转。
• AW_MPI_DEMUX_getDmxOutPutBuf ：取解析出来的数据包buffer（非绑定模式）。
• AW_MPI_DEMUX_releaseDmxBuf ：还buffer（与AW_MPI_DEMUX_getDmxOutPutBuf
成对使用）。
• AW_MPI_DEMUX_SelectVideoStream ：选择指定的视频流。
• AW_MPI_DEMUX_SelectAudioStream ：选择指定的音频流。

• AW_MPI_DEMUX_SelectSubtitleStream ：选择指定的Subtitle。

#### 8.4.1 AW_MPI_DEMUX_CreateChn

【描述】
创建demux 通道。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_CreateChn(DEMUX_CHN dmxChn, const DEMUX_CHN_ATTR_S *pstAttr);
```

【参数】

| 参数名称      | 描述                                       | 输入/输出 |
| ------------- | ------------------------------------------ | --------- |
| dmxChn demux  | 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| pstAttr demux | 通道属性指针                               | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.2 AW_MPI_DEMUX_DestroyChn

【描述】
销毁demux 通道。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_DestroyChn(DEMUX_CHN dmxChn);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.3 AW_MPI_DEMUX_RegisterCallback

【描述】
设置demux 通道回调。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_RegisterCallback(DEMUX_CHN dmxChn, MPPCallbackInfo *pCallback);
```

【参数】

| 参数名称  | 描述                                             | 输入/输出 |
| --------- | ------------------------------------------------ | --------- |
| dmxChn    | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| pCallback | 回调参数指针                                     | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.4 AW_MPI_DEMUX_SetChnAttr

【描述】
设置demux 通道属性。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_SetChnAttr(DEMUX_CHN dmxChn, DEMUX_CHN_ATTR_S *pAttr);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| pAttr    | 属性批针                                         | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.5 AW_MPI_DEMUX_GetChnAttr

【描述】
获取demux 通道属性。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_GetChnAttr(DEMUX_CHN dmxChn, DEMUX_CHN_ATTR_S *pstAttr);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| pstAttr  | 属性指针                                         | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.6 AW_MPI_DEMUX_GetMediaInfo

【描述】
获取demux 通道的媒体文件信息。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_GetMediaInfo(DEMUX_CHN dmxChn, DEMUX_MEDIA_INFO_S *pMediaInfo);
```

【参数】

| 参数名称   | 描述                                             | 输入/输出 |
| ---------- | ------------------------------------------------ | --------- |
| dmxChn     | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| pMediaInfo | 媒体信息指针                                     | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.7 AW_MPI_DEMUX_Start

【描述】
开启demux 通道，解析文件。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_Start(DEMUX_CHN dmxChn);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
如果通道未创建，则返回失败。
此接口并不判断当前是否已经开始解析，如果已经开始解析，调用此接口也返回成功。
【举例】
无

#### 8.4.8 AW_MPI_DEMUX_Stop

【描述】
停止demux 通道解析文件。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_Stop(DEMUX_CHN dmxChn);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
如果通道未创建，则返回失败。
此接口并不判断当前是否已经停止解析，如果已经停止，调用此接口也返回成功。
此接口用于demux 通道停止解析文件，在解码通道销毁或复位前必须停止解析文件。
【举例】
无

#### 8.4.9 AW_MPI_DEMUX_Pause

【描述】
暂停demux 通道解析文件。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_Pause(DEMUX_CHN dmxChn);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
如果通道未创建，则返回失败。
此接口并不判断当前是否已经暂停解析，如果已经暂停，调用此接口也返回成功。
【举例】
无

#### 8.4.10 AW_MPI_DEMUX_Seek

【描述】
跳转到媒体文件某个时间点解析。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_Seek(DEMUX_CHN dmxChn, int msec);
```

【参数】

| 参数名称 | 描述                                             | 输入/输出 |
| -------- | ------------------------------------------------ | --------- |
| dmxChn   | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| msec     | 时间点（ms）                                     | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
会清空已解析buffer list
【举例】
无

#### 8.4.11 AW_MPI_DEMUX_getDmxOutPutBuf

【描述】
获取demux 解析出来的数据包。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_getDmxOutPutBuf(DEMUX_CHN dmxChn, DemuxCompOutputBuffer *pDmxOutBuf,
int nMilliSec);
```

【参数】

| 参数名称   | 描述                                                         | 输入/输出 |
| ---------- | ------------------------------------------------------------ | --------- |
| dmxChn     | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。             | 输入      |
| pDmxOutBuf | 数据包指针。                                                 | 输出      |
| nMilliSec  | 获取数据的超时时间。-1 表示阻塞模式；0 表示<br/>非阻塞模式；>0 表示阻塞s32MilliSec 毫秒，超时<br/>则报错返回。 | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```



【注意】
仅适用于非绑定模式
【举例】
无

#### 8.4.12 AW_MPI_DEMUX_releaseDmxBuf

【描述】
释放demux 解析出来的数据包buffer

【语法】

```
ERRORTYPE AW_MPI_DEMUX_releaseDmxBuf(DEMUX_CHN dmxChn, DemuxCompOutputBuffer *pDmxOutBuf);
```

【参数】

| 参数名称   | 描述                                             | 输入/输出 |
| ---------- | ------------------------------------------------ | --------- |
| dmxChn     | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| pDmxOutBuf | 数据包指针。                                     | 输出      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```



【注意】
仅适用于非绑定模式，与AW_MPI_DEMUX_getDmxOutPutBuf 成对使用
【举例】
无

#### 8.4.13 AW_MPI_DEMUX_SelectVideoStream

【描述】
选择指定的视频流。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_SelectVideoStream(DEMUX_CHN dmxChn, int nVideoIndex);
```

【参数】

| 参数名称    | 描述                                             | 输入/输出 |
| ----------- | ------------------------------------------------ | --------- |
| dmxChn      | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| nVideoIndex | 视频索引，从0 开始。                             | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.14 AW_MPI_DEMUX_SelectAudioStream

【描述】
选择指定的音频流。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_SelectAudioStream(DEMUX_CHN dmxChn, int nAudioIndex);
```

【参数】

| 参数名称    | 描述                                             | 输入/输出 |
| ----------- | ------------------------------------------------ | --------- |
| dmxChn      | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| nAudioIndex | 音频索引，从0 开始。                             | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 8.4.15 AW_MPI_DEMUX_SelectSubtitleStream

【描述】
选择指定的Subtitle 。
【语法】

```
ERRORTYPE AW_MPI_DEMUX_SelectSubtitleStream(DEMUX_CHN dmxChn, int nSubtitleIndex);
```

【参数】

| 参数名称       | 描述                                             | 输入/输出 |
| -------------- | ------------------------------------------------ | --------- |
| dmxChn         | demux 通道号。取值范围：[0, DEMUX_MAX_CHN_NUM)。 | 输入      |
| nSubtitleIndex | Subtitle 索引，从0 开始。                        | 输入      |

【返回值】

| 返回值 | 描述               |
| ------ | ------------------ |
| 0      | 成功               |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mm_comm_demux.h、mm_common.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

### 8.5 数据类型

#### 8.5.1 STREAMTYPE_E

【说明】
流媒体类型。
【定义】

```
typedef enum STREAMTYPE_E{
STREAMTYPE_NETWORK,
STREAMTYPE_LOCALFILE,
}STREAMTYPE_E;
```

【成员】

| 成员名称             | 描述             |
| -------------------- | ---------------- |
| STREAMTYPE_NETWORK   | 网络stream。     |
| STREAMTYPE_LOCALFILE | 本地文件stream。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.2 SOURCETYPE_E

【说明】
源类型。
【定义】

```
typedef enum SOURCETYPE_E{
SOURCETYPE_FD,
SOURCETYPE_FILEPATH,
SOURCETYPE_WRITER_CALLBACK = 6, //for recoder writer
}SOURCETYPE_E;
```

【成员】

| 成员名称                   | 描述                   |
| -------------------------- | ---------------------- |
| SOURCETYPE_FD              | 文件来源是fd。         |
| SOURCETYPE_FILEPATH        | 文件来源是字符串路径。 |
| SOURCETYPE_WRITER_CALLBACK | 不支持。               |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.3 CEDARX_MEDIA_TYPE

【说明】
媒体类别。
【定义】

```
typedef enum CEDARX_MEDIA_TYPE{
CEDARX_MEDIATYPE_NORMAL = 0 ,
CEDARX_MEDIATYPE_RAWMUSIC ,
CEDARX_MEDIATYPE_3D_VIDEO ,
CEDARX_MEDIATYPE_DRM_VIDEO ,
CEDARX_MEDIATYPE_DRM_WVM_VIDEO ,
CEDARX_MEDIATYPE_DRM_ES_BASED_VIDEO,
CEDARX_MEDIATYPE_DRM_CONTAINNER_BASED_VIDEO,
CEDARX_MEDIATYPE_BD,
CEDARX_SOURCE_MULTI_URL,
}CEDARX_MEDIA_TYPE;
```

【成员】

| 成员名称                                         | 描述 |
| ------------------------------------------------ | ---- |
| CEDARX_MEDIATYPE_NORMAL<br/>                     |      |
| CEDARX_MEDIATYPE_RAWMUSIC<br/>                   |      |
| CEDARX_MEDIATYPE_3D_VIDEO<br/>                   |      |
| CEDARX_MEDIATYPE_DRM_VIDEO<br/>                  |      |
| CEDARX_MEDIATYPE_DRM_WVM_VIDEO<br/>              |      |
| CEDARX_MEDIATYPE_DRM_ES_BASED_VIDEO<br/>         |      |
| CEDARX_MEDIATYPE_DRM_CONTAINNER_BASED_VIDEO<br/> |      |
| CEDARX_MEDIATYPE_BD<br/>                         |      |
| CEDARX_SOURCE_MULTI_URL                          |      |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.4 DEMUX_DISABLE_TRACKINFO

【说明】
轨道类型
【定义】

```
typedef enum DEMUX_DISABLE_TRACKINFO {
DEMUX_DISABLE_AUDIO_TRACK = 0x01,
DEMUX_DISABLE_VIDEO_TRACK = 0x02,
DEMUX_DISABLE_SUBTITLE_TRACK = 0x04,
} DEMUX_DISABLE_TRACKINFO;
```

【成员】

| 成员名称                     | 描述     |
| ---------------------------- | -------- |
| DEMUX_DISABLE_AUDIO_TRACK    | 音频轨道 |
| DEMUX_DISABLE_VIDEO_TRACK    | 视频轨道 |
| DEMUX_DISABLE_SUBTITLE_TRACK | subtitle |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.5 DEMUX_CHN_ATTR_S

【说明】
通道属性。
【定义】

```
typedef struct DEMUX_CHN_ATTR_S
{
STREAMTYPE_E mStreamType;
SOURCETYPE_E mSourceType;
char* mSourceUrl;
int mFd;
int mDemuxDisableTrack; //DEMUX_DISABLE_AUDIO_TRACK
}DEMUX_CHN_ATTR_S;
```

【成员】

| 成员名称           | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| mStreamType;       | stream 类型                                                  |
| mSourceType        | 文件来源类别                                                 |
| mSourceUrl         | url 地址                                                     |
| mFd                | 文件句柄                                                     |
| mDemuxDisableTrack | 禁止解析的轨道类型，DEMUX_DISABLE_TRACKINFO<br/>枚举类型的组合。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.6 DEMUX_VIDEO_STREAM_INFO_S

【说明】
视频流信息。
【定义】

```
typedef struct DEMUX_VIDEO_STREAM_INFO_S
{
PAYLOAD_TYPE_E mCodecType;
int mWidth; //display width
int mHeight;
int mFrameRate; // x1000
int mAvgBitsRate;
int mMaxBitsRate;
int nCodecSpecificDataLen;
char* pCodecSpecificData;
}DEMUX_VIDEO_STREAM_INFO_S;
```

【成员】

| 成员名称              | 描述                            |
| --------------------- | ------------------------------- |
| mCodecType            | 视频编码类型                    |
| mWidth                | 视频图像宽度                    |
| mHeight               | 视频图像高度                    |
| mFrameRate            | 帧率，单位x1000。               |
| mAvgBitsRate          | 平均码率                        |
| mMaxBitsRate          | 最大码率                        |
| nCodecSpecificDataLen | Metadata size                   |
| pCodecSpecificData    | Buffer addr that store metadata |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.7 DEMUX_AUDIO_STREAM_INFO_S

【说明】
音频流信息。
【定义】

```
#define MAX_LANG_CHAR_SIZE (64)
typedef struct DEMUX_AUDIO_STREAM_INFO_S
{
PAYLOAD_TYPE_E mCodecType;
int mChannelNum;
int mBitsPerSample;
int mSampleRate;
int mAvgBitsRate;
int mMaxBitsRate;
unsigned char strLang[MAX_LANG_CHAR_SIZE];
}DEMUX_AUDIO_STREAM_INFO_S;
```

【成员】

| 成员名称       | 描述            |
| -------------- | --------------- |
| mCodecType     | 音频编码类型    |
| mChannelNum    | 音轨的声道数    |
| mBitsPerSample | sample 采样位数 |
| mSampleRate    | 采样率          |
| strLang        | 音轨名称        |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.8 DEMUX_SUBTITLE_STREAM_INFO_S

【说明】
subtitle 信息。
【定义】

```
#define MAX_LANG_CHAR_SIZE (64)
typedef struct DEMUX_SUBTITLE_STREAM_INFO_S
{
int xxx;
unsigned char strLang[MAX_LANG_CHAR_SIZE];
}DEMUX_SUBTITLE_STREAM_INFO_S;
```

【成员】

| 成员名称         | 描述   |
| ---------------- | ------ |
| xxx              | 预留。 |
| strLang subtitle | 名字。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 8.5.9 DEMUX_MEDIA_INFO_S

【说明】

媒体信息，包含：视频、音频和subtitle 。
【定义】

```
#define DEMUX_MAX_AUDIO_STREAM_NUM 32
#define DEMUX_MAX_VIDEO_STREAM_NUM 6
#define DEMUX_MAX_SUBTITLE_STREAM_NUM 32
typedef struct DEMUX_MEDIA_INFO_S
{
unsigned int mFileSize;
unsigned int mDuration; //unit: ms
int mAudioNum, mAudioIndex;
int mVideoNum, mVideoIndex;
int mSubtitleNum, mSubtitleIndex;
DEMUX_AUDIO_STREAM_INFO_S mAudioStreamInfo[DEMUX_MAX_AUDIO_STREAM_NUM];
DEMUX_VIDEO_STREAM_INFO_S mVideoStreamInfo[DEMUX_MAX_VIDEO_STREAM_NUM];
DEMUX_SUBTITLE_STREAM_INFO_S mSubtitleStreamInfo[DEMUX_MAX_SUBTITLE_STREAM_NUM];
}DEMUX_MEDIA_INFO_S;
```

【成员】

| 成员名称            | 描述                                                     |
| ------------------- | -------------------------------------------------------- |
| mDuration           | 文件时长。单位ms。                                       |
| mAudioNum           | 文件包含的音频轨道数量。                                 |
| mAudioIndex         | 选定播放的音频轨道index，范围[0, mAudioNum)。            |
| mVideoNum           | 文件包含的视频轨道数量。                                 |
| mVideoIndex         | 选定播放的视频轨道index，范围[0, mVideoNum)。            |
| mSubtitleNum        | 文件包含的字幕轨道数量，不支持。                         |
| mSubtitleIndex      | 选定播放的字幕轨道index，范围[0, mSubtitleNum)，不支持。 |
| mAudioStreamInfo    | audioTrack 的流信息数组                                  |
| mVideoStreamInfo    | videoTrack 的流信息数组                                  |
| mSubtitleStreamInfo | subtitleTrack 的流信息数组，未使用。                     |

【注意事项】
无
【相关数据类型及接口】
无

### 8.6 错误码

| 错误代码                           | 宏定义                  | 描述                                              |
| ---------------------------------- | ----------------------- | ------------------------------------------------- |
| 0xA0648002 ERR_DEMUX_INVALID_CHNID | 通道ID                  | 超出合法范围                                      |
| 0xA0648003                         | ERR_DEMUX_ILLEGAL_PARAM | 参数超出合法范围                                  |
| 0xA0648004                         | ERR_DEMUX_EXIST         | 试图申请或者创建已经存在的设备、通道<br/>或者资源 |
| 0xA0648006                         | ERR_DEMUX_NULL_PTR      | 函数参数中有空指针                                |
| 0xA0648007                         | ERR_DEMUX_NOT_CONFIG    | 使用前未配置                                      |
| 0xA0648008                         | ERR_DEMUX_NOT_SUPPORT   | 不支持的参数或者功能                              |
| 0xA0648009                         | ERR_DEMUX_NOT_PERM      | 该操作不允许，如试图修改静态配置参数              |
| 0xA0648005 者资源                  | ERR_DEMUX_UNEXIST       | 试图使用或者销毁不存在的设备、通道或<br/>         |
| 0xA064800C                         | ERR_DEMUX_NOMEM         | 分配内存失败，如系统内存不足                      |
| 0xA064800D                         | ERR_DEMUX_NOBUF         | 分配缓存失败，如申请的数据缓冲区太大              |
| 0xA0648010                         | ERR_DEMUX_SYS_NOTREADY  | 系统没有初始化或没有加载相应模块                  |
| 0xA0648012                         | ERR_DEMUX_BUSY VENC     | 系统忙                                            |

## 9 音频

### 9.1 概述

#### 9.1.1 音频输入输出

音频输入输出接口简称为AIO（Audio Input/Output）接口，用于向下对接alsa-lib，alsadriver和Audio Codec，向上提供api 对接应用程序，完成声音的录制和播放。AIO 接口分为两种类型：输入模式、输出模式。当为输入类型时，称为AIP，当为输出类型时，称为AOP。软件中负责抽象音频接口输入功能的单元，称之为AI 设备；负责抽象输出功能的单元，称之为AO 设备。一个AI 设备下可以挂多个AI 通道(组件)，实现音频数据复用。AIO 设备向下通过alsa-lib 与alsa 内核驱动对接，来进行pcm 数据交互、播放/采集控制、音量大小/静音状态调整等操作。AI 设备支持板卡mic 的声音采集，AO 设备支持lineout 和hdmi两种方式输出。
AIO 设备向上对接AIO 通道，AIO 通道通过各自的输入/输出端接口对接app。AI、AO 通道为单端口通道，AI 通道提供outport 用于向app 输出采集的pcm 数据，AO 通道提供input 通道用于app 向其送pcm 数据进行音频播放。例如，对于AI 组件，当pcm 和mixer 控件初始化完毕并且开始采集pcm 数据后，app 可以从AI 组件outport 拿pcm 数据，其inport 在内部实现固定绑定到音频采集的环型buffer；对于AO 组件，app 可以向其inport 不停地送pcm数据，其outport 内部实现了固定绑定到音频输出设备的环形buffer。

#### 9.1.2 音频编码解码

音频编解码组件简称为AEnc、ADec，用于压缩/解压缩pcm 数据。App 可创建多个AEnc、ADec 通道，各通道可设置不同编解码格式等参数，并且各通道独立运行，互不干扰。
AEnc 编码通道为双端口通道，其inport 接收外部送来的pcm 数据，而不关心数据来自哪个模块，例如可来自AI 通道，也可来自本地磁盘文件；其outport 用于输出编码码流，可送到muxer 模块、ADec 模块或本地磁盘文件。
ADec 解码通道也为双端口通道，其inport 接收压缩的音频码流，也不关心数据来自哪个模块，例如可来自demuxer 模块，也可来自网络，也可来自AEnc 模块；其outport 用于输出pcm数据，可送到AO 通道、AI 通道或本地磁盘文件。
从AI 组件获取了pcm 数据后，通常送编码器进行数据压缩，AEnc 组件即为音频编码的设备抽象。通过编码器类型和码率的设置，可以进行多种格式的音频压缩，目前包括以下格式：aac、mp3、adpcm、pcm、g711a、g711u、g726。
AEnc 组件为双端口(inport、outport) 组件，即app 可以操作输入端口和输出端口的数据，如向AEnc 输入端口送pcm 数据，编码完成后，app 再从AEnc 输出端口取压缩后的音频码流数据。
从AI 通道到AEnc 通道进行pcm 数据传递可以分为tunnel 方式(又称绑定方式) 和non-tunnel方式(又称非绑定方式)，tunnel 方式为组件之间内部自动传递数据方式，app 不用参与数据传递过程，而只需专注于应用层面的业务开发；non-tunnel 方式为app 主动管理pcm 数据，即从AI 组件拿数据，然后将其送给AEnc 组件，再从AEnc 组件输出端口拿编码后的数据，之后将其送muxer 组件或网传后，最后再利用该包数据向AEnc 组件还帧。
通过网络或文件解封装后得到的音频码流数据，需要送解码器进行解码以恢复为原始音频数据，ADec 组件即是对该功能的抽象。目前其支持的解码类型与编码类型相同。与AEnc 组件类似，其也为双端口组件，数据传递也包括tunnel 方式和non-tunnel 方式。其实现的功能与AEnc 正好相反，不再累述。

### 9.2 功能描述

AIO 设备、AI 通道、AO 通道、AEnc 通道、ADec 通道内部都有一个线程，其按状态机的方式工作，其状态转换图如下：

#### 9.2.1 AI 设备状态图

![image-20230203105551988](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105551988.png)

#### 9.2.2 AO 设备状态图

![image-20230203105602590](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105602590.png)

#### 9.2.3 AI 通道状态图

![image-20230203105615413](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105615413.png)

#### 9.2.4 AO 通道状态图

![image-20230203105626252](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105626252.png)

#### 9.2.5 AEnc 通道状态图

![image-20230203105639036](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105639036.png)

#### 9.2.6 ADec 通道状态图

![image-20230203105649759](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105649759.png)

#### 9.2.7 AIO 设备与通道

设备：从软硬件上划分，其属于硬件的范畴，由IC 设计决定其数量。
通道：属于软件上的虚拟范畴，可存在多个，即一个设备下可挂多个通道实例。例如，在多路录制时，一个AI 设备下挂多个AI 虚拟通道，则每个通道的输入数据都相同，因为其是由同一个音频硬件采集得到的；每个AI 通道后面又绑定其对应的AEnc 通道，通过对AEnc 设置不同的编码格式，可得到多路输入音频相同但编码格式不同的输出码流。如下为其拓扑图：

![image-20230203105700286](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230203105700286.png)

注意，目前mpp 在音频输出上只支持一个AO 设备下挂一个AO 通道，暂不支持多路AO 通道同时存在的混音功能。
mpi 通过提供ai/ao 通道的控制接口，间接地操作ai/ao 设备。在应用程序开发时，通过操作ai/ao 通道提供的接口，可完成ai/ao 设备使能、去使能等操作。

#### 9.2.8 音频回声消除

内核驱动采集播放出的音频数据，提供接口供获取。AI 通道获取播放的音频数据作为音频参考帧，利用回声消除算法，消除采集的音频数据中的相同音频帧。

#### 9.2.9 音频降噪

AI 通道将采集的音频数据，利用降噪库去除白噪声。

#### 9.2.10 音频混音

使用ALSA 的plugin dmix 将多个音频文件混音并播放。
• ALSA 配置
将asound.conf 配置文件放入到SDK 方案路径下的busybox-init-base-files/etc 下面，并更新固件。例如：

```
target/allwinner/v536-cdr/busybox-init-base-files
```

配置文件内容：

```
pcm.PlaybackRateDmix {
	type plug
	slave {
		pcm {
			type dmix
				ipc_key 1111
				ipc_perm 0666
			slave {
				pcm "hw:0,0"
				format S16_LE
				rate 16000
				channels 1
				period_size 1024
				periods 8
			}
		}
		channels 1
		rate 16000
	}
	rate_converter "linear"
}
```

ALSA 本身就有plugin dmix 混音plugin，但是其支持固定的format(S16)、rate(48000)、channels(2)、period_time(125000)。asound.conf 就是根据实际项目中的开发需求自定义的ALSA plugin dmix 配置参数。所以上述配置文件中type dmix 中嵌套的salve 设备定义参数，
可根据实际项目中的需求自行进行配置。

• kernel 配置
[device/config/chips/v833/configs/perf1/linux/config-4.9]
检查CONFIG_SYSVIPC 对应的配置是否enable？（CONFIG_SYSVIPC=y）
检查CONFIG_SND_PCM_TIMER 对应的配置项是否enable？（CONFIG_SND_PCM_TIMER=y）
• kernel dts 配置
[device/config/chips/v833/configs/perf1/board.dts]
修改daudio0 节点的pin 配置，不占用PH4 脚。PH4 留给gpio-spk 作为喇叭输出。
[lichee/linux-4.9/arch/arm/boot/dts/sun8iw19p1-pinctrl.dtsi] 和[lichee/linux-4.9/arch/arm/boot/dts/sun8iw19p1.的默认配置daudio0 节点多写了PH4，会导致speaker 没有声音输出，故在[device/config/chips/v833/configs/perf1/board.dts] 中修改，覆盖内核代码的配置。

### 9.3 音频接口调用流程介绍

使用mpp 进行音频的应用程序开发时，需特别注意接口调用流程及顺序，否则容易出现调用失败、段错误、帧节点回收出错等问题。

通常情况下，AI/AO 通道调用流程为：设备属性设置、设备使能、通道创建、通道使能、送pcm数据、停止通道、复位通道、销毁通道、设备去使能。
AEnc/ADec 通道调用流程类似：通道创建、启动通道、送/还pcm 数据或stream 数据、停止接收pcm 或stream、复位通道、销毁通道。

#### 9.3.1 AI 通道使用流程

进行音频采集，需打开ai 设备、创建ai 通道后才能进行音频pcm 的采集，参考例子为sample_ai.c，其流程如下：

```
Step1:AW_MPI_AI_SetPubAttr() //设置ai设备的pcm采集参数
Step2:AW_MPI_AI_Enable() //启动ai设备，目前可不调用
Step3:AW_MPI_AI_CreateChn() //创建ai通道，并将其挂到ai设备下
Step4:AW_MPI_AI_EnableChn() //运行ai通道
//AI设备往AI通道源源不断送pcm，App拿数据/还帧
loop
{
Step5:AW_MPI_AI_GetFrame() //app去拿pcm数据
Step6:AW_MPI_AI_ReleaseFrame() //app还帧给ai通道
}
Step7:AW_MPI_AI_DisableChn() //停止ai通道接收数据
Step8:AW_MPI_AI_ResetChn() //ai通道复位
Step9:AW_MPI_AI_DestroyChn() //销毁ai通道，并从ai设备下退出
Step10:AW_MPI_AI_Disable() //停止ai设备，目前可不调用
Step11:AW_MPI_AI_ClrPubAttr() //清除ai设备的pcm采集参数
```

其中，step2 的接口目前可不调用，其已经做到了step3 的接口中，其作用为在创建通道时根据需要来打开AI 设备。当AI 通道在第一次调用AW_MPI_AI_CreateChn() 时，其实现中会主动调用AW_MPI_AI_Enable() 打开AI 设备，第二个以及后面的通道在调用AW_MPI_AI_CreateChn() 创建通道时，其内部实现则不需再次打开AI 设备，而是直接单纯的创建组件。
其中，step9 的AW_MPI_AI_DestroyChn() 会将该通道从AI 设备所管理的多个通道列表中删除（即使ai 设备又采集到pcm 数据，但不会再往本通道传递了，而会送往其它AI 通道），接下来释放本通道的全部资源。
其中，step10 的AW_MPI_AI_Disable() 的接口可不调用，因其已经做到了step9 的接口实现中。当销毁通道(AW_MPI_AI_DestroyChn) 时，AI 通道从AI 设备下删除，若AI 设备下只包含一个AI 通道，则在销毁通道的同时会停止AI 设备，即最后一个通道在销毁通道时会连带关闭AI 设备。那么，当最后一个通道调用AW_MPI_AI_DestroyChn() 时，其内部实现会自动关闭AI 设备，用户无需手动调用Step10 的AW_MPI_AI_Disable()。

#### 9.3.2 AO 通道使用流程

进行音频播放，需创建ao 通道后才能进行音频pcm 数据的播放，参考例子为sample_ao.c，其流程如下：

• 建议使用的api 调用流程

```
Step1:AW_MPI_AO_CreateChn(AudioDevId, AoChn) //创建ao通道，并将其挂到ao设备下
Step2:AW_MPI_AO_StartChn(AudioDevId, AoChn) //运行ao通道
//用户往AO通道源源不断送pcm
loop
{
Step3:AW_MPI_AO_SendFrame() //app手动送pcm数据到ao通道
}
Step4:AW_MPI_AO_StopChn(AudioDevId, AoChn) //停止ao通道
Step5:AW_MPI_AO_DestroyChn(AudioDevId, AoChn) //销毁ao通道，并关闭ao设备
```

与之前的AO 通道使用流程相比，此次修改可直接调用AW_MPI_AO_CreateChn() 即可，AO组件内部会在第一次接收到音频数据时，会根据音频数据的参数对AO 设备属性进行设置并启用AO 设备。
• 对于主动设置AO 设备参数情况
在已知音频参数的情况下，在外部应用按照如下的api 调用顺序也是可以的，但是不建议使用这样的方式。因为AO 组件内部会在第一次接收到音频数据时，会根据音频数据的参数对AO 设备属性进行设置并启用AO 设备。

```
Step1:AW_MPI_AO_CreateChn(AudioDevId, AoChn) //创建ao通道，并将其挂到ao设备下
Step2:AW_MPI_AO_SetPubAttr(AudioDevId, AoChn, pstAttr) //设置ao设备的pcm参数，可不调用
Step3:AW_MPI_AO_Enable(AudioDevId, AoChn) //启动ao设备，可不调用
Step4:AW_MPI_AO_StartChn(AudioDevId, AoChn) //运行ao通道
//用户往AO通道源源不断送pcm
loop
{
Step5:AW_MPI_AO_SendFrame() //app手动送pcm数据到ao通道
}
Step6:AW_MPI_AO_StopChn(AudioDevId, AoChn) //停止ao通道
Step7:AW_MPI_AO_Disable(AudioDevId, AoChn) //停止ao设备，无需调用
Step8:AW_MPI_AO_ClrPubAttr(AudioDevId, AoChn) //清除ao设备的pcm参数，无需调用
Step9:AW_MPI_AO_DestroyChn(AudioDevId, AoChn) //销毁ao通道，并关闭ao设备
```

其中，AW_MPI_AO_DestroyChn() 会将本通道从AO 设备下删除，并关闭AO 设备，接下来释放本通道的全部资源。即该接口内部实现中已经调用了AW_MPI_AO_Disable() 接口和AW_MPI_AO_ClrPubAttr() 接口，用户在使用AO 做应用开发时可不调用它们。

#### 9.3.3 AEnc 通道调用流程

进行音频编码，需按照通道创建、启动通道、送pcm 数据、取stream 数据、还帧、停止通道、复位通道、销毁通道的顺序使用，参考例子为sample_aenc.c，其流程如下：

```
Step1:AW_MPI_AEnc_CreateChn() //创建通道
Step2:AW_MPI_AEnc_StartRecvPcm() //启动通道
//non-tunnel方式下用户往AEnc通道源源不断送pcm、取stream、还stream。。。
loop
{
Step3:AW_MPI_AEnc_SendFrame() //app手动送pcm数据到aenc通道
Step4:AW_MPI_AEnc_GetStream() //app手动拿编码数据
Step4:AW_MPI_AEnc_ReleaseStream() //app手动还帧到编码库
}
Step5:AW_MPI_AEnc_StopRecvPcm() //停止通道
Step6:AW_MPI_AEnc_ResetChn() //复位通道
Step7:AW_MPI_AEnc_DestroyChn() //销毁通道
```

注意，在non-tunnel 方式下，应用程序需手动方式送pcm 数据到aenc 通道，组件内部线程对pcm 数据进行编码，生成的stream 在输出队列中进行管理，等待用户取走；当用户取走stream 后，用户还需将该帧码流还给编码通道，以释放其占用的buffer。在tunnel 方式下，内部数据通路进行了动态绑定(AI-AEnc)，应用无需手动调用送帧、取帧、还帧的接口，因其在内部实现中自动被调用。

#### 9.3.4 ADec 通道调用流程

进行音频解码，需按照通道创建、启动通道、送stream 数据、取pcm 数据、还帧、停止通道、复位通道、销毁通道的顺序使用，参考例子为sample_adec.c，其流程如下：

```
Step1:AW_MPI_ADec_CreateChn() //创建通道
Step2:AW_MPI_ADec_StartRecvStream() //启动通道
//non-tunnel方式下用户往ADec通道源源不断送stream、取pcm、还pcm。。。
loop
{
Step3:AW_MPI_ADec_SendStream() //app手动送stream数据到adec通道
Step4:AW_MPI_ADec_GetFrame() //app手动拿pcm数据
Step4:AW_MPI_ADec_ReleaseFrame() //app手动还帧到解码库
}
Step5:AW_MPI_ADec_StopRecvStream() //停止通道
Step6:AW_MPI_ADec_ResetChn() //复位通道
Step7:AW_MPI_ADec_DestroyChn() //销毁通道
```

注意，在non-tunnel 方式下，应用程序需手动方式送stream 数据到adec 通道，组件内部线程对stream 数据进行解码，生成的pcm 在输出队列中进行管理，等待用户取走；当用户取走pcm 后，用户还需将该帧pcm 数据还给解码通道，以释放其占用的buffer。在tunnel 方式下，内部数据通路进行了动态绑定(ADec-AO)，应用无需手动调用送帧、取帧、还帧的接口，因其在内部实现中自动被调用。

### 9.4 API 接口

#### 9.4.1 音频输入

##### 9.4.1.1 AW_MPI_AI_SetPubAttr

【描述】
设置AI 设备属性。

【语法】

ERRORTYPE AW_MPI_AI_SetPubAttr(AUDIO_DEV AudioDevId, const AIO_ATTR_S *pstAttr);

【参数】

| 参数       | 描述              |      |
| ---------- | ----------------- | ---- |
| AudioDevId | 音频设备号。      | 输入 |
| pstAttr    | AI 设备属性指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
无
【举例】
无

##### 9.4.1.2 AW_MPI_AI_GetPubAttr

【描述】
获取AI 设备属性。
【语法】

```
ERRORTYPE AW_MPI_AI_GetPubAttr(AUDIO_DEV AudioDevId, AIO_ATTR_S *pstAttr);
```

【参数】



| 参数       | 描述              |      |
| ---------- | ----------------- | ---- |
| AudioDevId | 音频设备号。      | 输入 |
| pstAttr    | AI 设备属性指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
无
【举例】
无

##### 9.4.1.3 AW_MPI_AI_Enable

【描述】
启用AI(音频采集) 设备。
【语法】

```
ERRORTYPE AW_MPI_AI_Enable(AUDIO_DEV AudioDevId);
```

【参数】



| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

必须在启用前配置音频设备属性，否则返回属性未配置错误。
如果音频设备已经处于启用状态，则直接返回成功。此种场景常见于多路音视频同时录制时，最
早一路已经开始采集声音数据后，又创建一个recorder 进行音视频录制。多个AI 组件实例同时
运行时，音频数据复用，即硬件采集到的每帧pcm 数据分别送往不同AI 组件实例，又各自送往
其对应的AEnc 组件实例。
【举例】
无

##### 9.4.1.4 AW_MPI_AI_Disable

【描述】
禁用AI(音频采集) 设备。
【语法】

```
ERRORTYPE AW_MPI_AI_Disable(AUDIO_DEV AudioDevId);
```

【参数】



| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
如果音频采集设备已经处于禁用状态，则直接返回成功。
禁用音频设备前必须先禁用该设备下已启用的所有AI 通道。
要求在禁用AI 设备之前，先禁用与之关联、使用AI 的音频数据的AENC 通道和AO 设备，否
则可能导致该接口调用失败。
【举例】

多路音视频录制时，最先结束录制的recorder 在禁用音频设备时，会遍历使用该设备的AI 通
道。如果还有其它AI 通道在使用该音频设备，则只关闭该AI 通道而不关闭该音频设备就直接返
回；最后一个recorder 退出时，由于音频采集设备只被该recorder 的AI 通道占用，因此直接
关闭AI 通道和音频设备。
综上有，音频采集设备在被共享时，只有等到最后一次被禁用时才能真正释放。

##### 9.4.1.5 AW_MPI_AI_CreateChn

【描述】
创建AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_CreateChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
创建AI 通道前，必须保证先启用其所属的AI 设备，否则返回设备未启动的错误码。
创建AI 通道后才能调用启用通道(AW_MPI_AI_EnableChn) 接口。
【举例】
无

##### 9.4.1.6 AW_MPI_AI_DestroyChn

【描述】
销毁AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_DestroyChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】



| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
销毁AI 通道前，必须保证该AI 通道已被复位。
录音结束时的操作步骤：DisableChn->ResetChn->DestroyChn。
【举例】
无

##### 9.4.1.7 AW_MPI_AI_ResetChn

【描述】
复位AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_ResetChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】



| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
录音结束时的操作步骤：DisableChn->ResetChn->DestroyChn。
【举例】
无

##### 9.4.1.8 AW_MPI_AI_PauseChn

【描述】
暂停AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_PauseChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
用于录音过程中暂停本通道的声音采集，若同时存在其它AI 通道，并不影响其它通道的声音采集。
【举例】
无

##### 9.4.1.9 AW_MPI_AI_ResumeChn

【描述】
恢复AI 通道状态至运行态。
【语法】

```
ERRORTYPE AW_MPI_AI_ResumeChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

将AI 通道从暂停态转换为运行态，需配合AW_MPI_AI_PauseChn 接口使用。
【举例】
无

##### 9.4.1.10 AW_MPI_AI_EnableChn

【描述】
启用AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_EnableChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
启用AI 通道前，必须先启用其所属的AI 设备并且该AI 通道已被创建，否则返回设备未启动的
错误码。
【举例】
无

##### 9.4.1.11 AW_MPI_AI_DisableChn

【描述】

禁用AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_DisableChn(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】



| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

禁用AI 通道前，必须保证AI 设备已启用并且该AI 通道已处于运行状态，否则返回错误码。
【举例】
无

##### 9.4.1.12 AW_MPI_AI_GetFrame

【描述】
获取音频帧。
【语法】

```
ERRORTYPE AW_MPI_AI_GetFrame(AUDIO_DEV AudioDevId, AI_CHN AiChn, AUDIO_FRAME_S *pstFrm,
AEC_FRAME_S *pstAecFrm, int s32MilliSec);
```

【参数】



| 参数        | 描述                                                         |      |
| ----------- | ------------------------------------------------------------ | ---- |
| AudioDevId  | 音频设备号。                                                 | 输入 |
| AiChn       | AI 通道号                                                    | 输入 |
| pstFrm      | 音频帧结构体指针。                                           | 输出 |
| pstAecFrm   | 回声抵消参考帧结构体指针。                                   | 输出 |
| s32MilliSec | 获取数据的超时时间-1 表示阻塞模式，无数据时一直等待；0 表示非<br/>阻塞模式，无数据时则报错返回；>0 表示阻塞s32MilliSec 毫秒，<br/>超时则报错返回。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

如果AI 的回声抵消功能已使能，pstAecFrm 不能是空指针；如果AI 的回声抵消功能没有使能，
pstAecFrm 可以置为空。
AI 模块会缓存音频帧数据，用于用户态获取。缓存的深度通过AW_MPI_AI_SetChnParam 接
口设定，默认为0。
s32MilliSec 的值必须大于等于-1，等于-1 时采用阻塞模式获取数据，等于0 时采用非阻塞模式
获取数据，大于0 时，阻塞s32MilliSec 毫秒后，没有数据则返回超时并报错。
获取音频帧数据前，必须先使能对应的AI 设备和AI 通道。
【举例】
无

##### 9.4.1.13 AW_MPI_AI_ReleaseFrame

【描述】
释放音频帧。
【语法】

```
ERRORTYPE AW_MPI_AI_ReleaseFrame(AUDIO_DEV AudioDevId, AI_CHN AiChn, AUDIO_FRAME_S *
pstFrm, AEC_FRAME_S *pstAecFrm);
```

【参数】

| 参数       | 描述                       |      |
| ---------- | -------------------------- | ---- |
| AudioDevId | 音频设备号。               | 输入 |
| AiChn      | AI 通道号                  | 输入 |
| pstFrm     | 音频帧结构体指针。         | 输出 |
| pstAecFrm  | 回声抵消参考帧结构体指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

如果不需要释放回声抵消参考帧，pstAecFrm 置为NULL 即可。
当app 取走pcm 数据后，调用该api 可以释放AI 组件的pcmBufferManager 缓冲队列中的
对应的数据帧，释放出空间以便于存储采集到的最新的pcm 数据。
【举例】
无

##### 9.4.1.14 AW_MPI_AI_SetChnParam

【描述】
设置AI 通道属性。
【语法】

```
ERRORTYPE AW_MPI_AI_SetChnParam(AUDIO_DEV AudioDevId, AI_CHN AiChn, AI_CHN_PARAM_S *
pstChnParam);
```

【参数】



| 参数       | 描述                       |      |
| ---------- | -------------------------- | ---- |
| AudioDevId | 音频设备号。               | 输入 |
| AiChn      | AI 通道号                  | 输入 |
| pstAecFrm  | 回声抵消参考帧结构体指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
通道参数目前只有一个成员变量，用于设置用户获取音频帧的缓存深度，默认深度为0。该成员变
量的值不能大于30。
建议先调用AW_MPI_AI_GetChnParam 接口获取默认配置，再调用本接口修改配置，以便于
后续扩展。
【举例】
无

##### 9.4.1.15 AW_MPI_AI_GetChnParam

【描述】
获取AI 通道属性。
【语法】

```
ERRORTYPE AW_MPI_AI_GetChnParam(AUDIO_DEV AudioDevId, AI_CHN AiChn, AI_CHN_PARAM_S *
pstChnParam);
```

【参数】

| 参数       | 描述                       |      |
| ---------- | -------------------------- | ---- |
| AudioDevId | 音频设备号。               | 输入 |
| AiChn      | AI 通道号                  | 输入 |
| pstAecFrm  | 回声抵消参考帧结构体指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
无
【举例】
无

##### 9.4.1.16 AW_MPI_AI_EnableReSmp

【描述】
启用AI 重采样。
【语法】

```
ERRORTYPE AW_MPI_AI_EnableReSmp(AUDIO_DEV AudioDevId, AI_CHN AiChn, AUDIO_SAMPLE_RATE_E
enOutSampleRate);
```

【参数】

| 参数            | 描述                     |      |
| --------------- | ------------------------ | ---- |
| AudioDevId      | 音频设备号。             | 输入 |
| AiChn           | AI 通道号                | 输入 |
| enOutSampleRate | 音频重采样的输出采样率。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
在启用AI 通道之后，调用此接口启用重采样功能。
允许重复启用重采样功能，但必须保证后配置的属性与之前配置的属性一样。
在禁用AI 通道之后，如果重新启用AI 通道，并使用重采样功能，需调用此接口重新启用重采
样。
接口暂未实现。
【举例】
无

##### 9.4.1.17 AW_MPI_AI_DisableReSmp

【描述】
禁用AI 重采样。
【语法】

```
ERRORTYPE AW_MPI_AI_DisableReSmp(AUDIO_DEV AudioDevId, AI_CHN AiChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
不再使用AI 重采样功能的话，应该调用此接口将其禁用。

要求在调用此接口之前，先禁用使用该AI 设备相应通道音频数据的AENC 通道和AO 通道，否则可能导致该接口调用失败。
【举例】
无

##### 9.4.1.18 AW_MPI_AI_SetVqeAttr

【描述】
设置AI 的声音质量增强功能相关属性。
【语法】

```
ERRORTYPE AW_MPI_AI_SetVqeAttr(AUDIO_DEV AiDevId, AI_CHN AiChn,AI_VQE_CONFIG_S *
pstVqeConfig);
```

【参数】

| 参数         | 描述                               |      |
| ------------ | ---------------------------------- | ---- |
| AudioDevId   | 音频设备号。                       | 输入 |
| AiChn        | AI 通道号                          | 输入 |
| pstVqeConfig | 音频输入声音质量增强配置结构体指针 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
接口未实现。
【举例】
无

##### 9.4.1.19 AW_MPI_AI_GetVqeAttr

【描述】
获取AI 的声音质量增强功能相关属性。
【语法】

```
ERRORTYPE AW_MPI_AI_GetVqeAttr(AUDIO_DEV AiDevId, AI_CHN AiChn, AI_VQE_CONFIG_S *
pstVqeConfig);
```

【参数】

| 参数         | 描述                               |      |
| ------------ | ---------------------------------- | ---- |
| AudioDevId   | 音频设备号。                       | 输入 |
| AiChn        | AI 通道号                          | 输入 |
| pstVqeConfig | 音频输入声音质量增强配置结构体指针 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

获取声音质量增强功能相关属性前必须先设置相对应AI 通道的声音质量增强功能相关属性。
接口未实现。
【举例】
无

##### 9.4.1.20 AW_MPI_AI_EnableVqe

【描述】
启用AI 的声音质量增强功能。
【语法】

```
ERRORTYPE AW_MPI_AI_EnableVqe(AUDIO_DEV AiDevId, AI_CHN AiChn);
```

【注意】
启用声音质量增强功能前必须先启用相对应的AI 通道。
多次使能相同AI 通道的声音质量增强功能时，返回成功。
禁用AI 通道后，如果重新启用AI 通道，并使用声音质量增强功能，需调用此接口重新启用声音质量增强功能。
接口未实现。
【举例】
无

##### 9.4.1.21 AW_MPI_AI_DisableVqe

【描述】
禁用AI 的声音质量增强功能。
【语法】

```
ERRORTYPE AW_MPI_AI_DisableVqe(AUDIO_DEV AiDevId, AI_CHN AiChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | AI 通道号    | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
不再使用AI 声音质量增强功能时，应该调用此接口将其禁用。
多次禁用相同AI 通道的声音质量增强功能，返回成功。
接口未实现。
【举例】
无

##### 9.4.1.22 AW_MPI_AI_SetTrackMode

【描述】
设置AI 声道模式。
【语法】

```
ERRORTYPE AW_MPI_AI_SetTrackMode(AUDIO_DEV AudioDevId, AUDIO_TRACK_MODE_E enTrackMode);
```

【参数】

| 参数        | 描述          |      |
| ----------- | ------------- | ---- |
| AudioDevId  | 音频设备号。  | 输入 |
| enTrackMode | AI 声道模式。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AI 设备成功启用后再调用此接口。
该接口功能目前不支持。
AI 设备工作在I2S 模式时，支持设置声道模式，PCM 模式下不支持。
【举例】
无

##### 9.4.1.23 AW_MPI_AI_GetTrackMode

【描述】
获取AI 声道模式。
【语法】

```
ERRORTYPE AW_MPI_AI_GetTrackMode(AUDIO_DEV AudioDevId, AUDIO_TRACK_MODE_E *penTrackMode);
```

【参数】

| 参数        | 描述          |      |
| ----------- | ------------- | ---- |
| AudioDevId  | 音频设备号。  | 输入 |
| enTrackMode | AI 声道模式。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
在AI 设备成功启用后再调用此接口。
AI 设备工作在I2S 模式时，支持设置声道模式，PCM 模式下不支持。
接口未实现。
【举例】
无

##### 9.4.1.24 AW_MPI_AI_ClrPubAttr

【描述】
清空pub 属性。
【语法】

```
ERRORTYPE AW_MPI_AI_ClrPubAttr(AUDIO_DEV AudioDevId);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
清除设备属性前，需要先停止设备。
【举例】
无

##### 9.4.1.25 AW_MPI_AI_SaveFile

【描述】
开启音频输入保存文件功能。
【语法】

```
ERRORTYPE AW_MPI_AI_SaveFile(AUDIO_DEV AudioDevId, AI_CHN AiChn, AUDIO_SAVE_FILE_INFO_S
*pstSaveFileInfo);
```

【参数】



| 参数            | 描述                         |      |
| --------------- | ---------------------------- | ---- |
| AudioDevId      | 音频设备号。                 | 输入 |
| AiChn           | AI 通道号                    | 输入 |
| pstSaveFileInfo | 音频保存文件属性结构体指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

【注意】
无
【举例】
无

##### 9.4.1.26 AW_MPI_AI_QueryFileStatus

【描述】
查询AI 通道当前pcm 文件保存状态。
【语法】

```
ERRORTYPE AW_MPI_AI_QueryFile(AUDIO_DEV AudioDevId, AI_CHN AiChn, AUDIO_SAVE_FILE_INFO_S
*pstSaveFileInfo);
```

【参数】



| 参数            | 描述                         |      |
| --------------- | ---------------------------- | ---- |
| AudioDevId      | 音频设备号。                 | 输入 |
| AiChn           | AI 通道号                    | 输入 |
| pstSaveFileInfo | 音频保存文件属性结构体指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

【注意】
无
【举例】
无



##### 9.4.1.27 AW_MPI_AI_SetVqeVolume

【描述】
设置AI 设备音量大小。
【语法】

```
ERRORTYPE AW_MPI_AI_SetVqeVolume(AUDIO_DEV AudioDevId, AI_CHN AiChn, int s32VolumeDb);
```

【参数】

| 参数        | 描述               |            |
| ----------- | ------------------ | ---------- |
| AudioDevId  | 音频设备号。       | 输入       |
| AiChn       | AI                 | 通道号输入 |
| s32VolumeDb | 音频设备音量大小。 | 输入       |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
接口未实现。
【举例】
无

##### 9.4.1.28 AW_MPI_AI_GetVqeVolume

【描述】
获取AI 设备音量大小。
【语法】

```
ERRORTYPE AW_MPI_AI_GetVqeVolume(AUDIO_DEV AudioDevId, AI_CHN AiChn, int *ps32VolumeDb);
```

【参数】

| 参数         | 描述                   |            |
| ------------ | ---------------------- | ---------- |
| AudioDevId   | 音频设备号。           | 输入       |
| AiChn        | AI                     | 通道号输入 |
| ps32VolumeDb | 音频设备音量大小指针。 | 输出       |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
接口未实现。
【举例】
无

##### 9.4.1.29 AW_MPI_AI_RegisterCallback

【描述】
设备回调函数给AI 通道。
【语法】

```
ERRORTYPE AW_MPI_AI_RegisterCallback(AUDIO_DEV AudioDevId, AI_CHN AiChn, MPPCallbackInfo *
pCallback);
```

【参数】

| 参数       | 描述                   |            |
| ---------- | ---------------------- | ---------- |
| AudioDevId | 音频设备号。           | 输入       |
| AiChn      | AI                     | 通道号输入 |
| pCallback  | 来自app 层的回调信息。 | 输入       |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在音视频录制过程中，音频数据从AI 组件成功送到AEnc 组件后，通过该回调信息，将音频时间
长度送往recorder 主控模块（组件向框架传递消息），用于统计文件中的音频duration，以方
便进行音视频同步处理。
【举例】

无

##### 9.4.1.30 AW_MPI_AI_SetVolume

【描述】
设置AI 设备声音采集音量大小。
【语法】

```
ERRORTYPE AW_MPI_AI_SetVolume(AUDIO_DEV AudioDevId, int s32VolumeDb);
```

【参数】

| 参数        | 描述             |      |
| ----------- | ---------------- | ---- |
| AudioDevId  | 音频设备号。     | 输入 |
| s32VolumeDb | 待设置的音量值。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.1.31 AW_MPI_AI_GetVolume

【描述】
获取AI 设备声音采集音量值。
【语法】

```
ERRORTYPE AW_MPI_AI_GetVolume(AUDIO_DEV AudioDevId, int *ps32VolumeDb);
```

【参数】

| 参数         | 描述                 |      |
| ------------ | -------------------- | ---- |
| AudioDevId   | 音频设备号。         | 输入 |
| ps32VolumeDb | 待设置的音量值指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.1.32 AW_MPI_AI_SetMute

【描述】
设置AI 设备静音状态。
【语法】

```
ERRORTYPE AW_MPI_AI_SetMute(AUDIO_DEV AudioDevId, int bEnableFlag);
```

【参数】

| 参数        | 描述                 |      |
| ----------- | -------------------- | ---- |
| AudioDevId  | 音频设备号。         | 输入 |
| bEnableFlag | 待设置的静音标志值。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

参数bEnableFlag 为欲设置的静音状态值。当该值设置为1 时则表示设置AI 设备为静音状态，
为0 时为取消静音状态。
【举例】
无

##### 9.4.1.33 AW_MPI_AI_GetMute

【描述】
获取AI 设备静音状态值。
【语法】

```
ERRORTYPE AW_MPI_AI_GetMute(AUDIO_DEV AudioDevId, int *pbEnableFlag);
```

【参数】

| 参数         | 描述                     |      |
| ------------ | ------------------------ | ---- |
| AudioDevId   | 音频设备号。             | 输入 |
| pbEnableFlag | 待设置的静音状态值指针。 | 输出 |

返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.1.34 AW_MPI_AI_SetChnMute

【描述】
设置AI 虚通道的静音状态。
【语法】

```
ERRORTYPE AW_MPI_AI_SetChnMute(AUDIO_DEV AudioDevId, AI_CHN AiChn, BOOL bMute);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | 音频虚通道号 | 输入 |
| bMute      | 静音标志值   | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

参数bMute 为欲设置的静音状态值。当该值设置为1 时则表示设置AI 虚通道为静音状态，为0
时为取消静音状态。该接口只对指定的虚通道生效，通过软件清零方式实现。
【举例】
无

##### 9.4.1.35 AW_MPI_AI_GetChnMute

【描述】
获取AI 虚通道的静音状态值。
【语法】

```
ERRORTYPE AW_MPI_AI_GetChnMute(AUDIO_DEV AudioDevId, AI_CHN AiChn, BOOL* pbMute);
```

参数】

| 参数       | 描述           |      |
| ---------- | -------------- | ---- |
| AudioDevId | 音频设备号。   | 输入 |
| AiChn      | 音频虚通道号   | 输入 |
| pbMute     | 静音状态值指针 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.1.36 AW_MPI_AI_IgnoreData

【描述】
设置AI 虚通道忽略音频数据，不把音频数据传到后续组件。同时内部回调仍然正常调用，通知上
层数据是否忽略，数据的时间戳等。设计这个接口的目的是配合实现录制暂停功能。
【语法】

```
AW_MPI_AI_IgnoreData(AUDIO_DEV AudioDevId, AI_CHN AiChn, BOOL bIgnore);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AiChn      | 音频虚通道号 | 输入 |
| bIgnore    | 忽略标志值   | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

参数bIgnore 为欲设置的忽略标志值。当该值设置为1 时则表示设置AI 虚通道将忽略送入的音
频数据，为0 时正常处理状态。该接口只对指定的虚通道生效。
【举例】
无

##### 9.4.1.37 AW_MPI_AI_SuspendAns

【描述】
设置AI 设备暂停音频降噪。
【语法】

```
ERRORTYPE AW_MPI_AI_SuspendAns(AUDIO_DEV AudioDevId);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无。
【举例】
无

##### 9.4.1.38 AW_MPI_AI_ResumeAns

【描述】
设置AI 设备恢复音频降噪。
【语法】

```
ERRORTYPE AW_MPI_AI_ResumeAns(AUDIO_DEV AudioDevId);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

如果AW_MPI_AI_SetPubAttr() 设置属性时关闭了音频降噪，那么调用该接口无效。

【举例】
无

##### 9.4.1.39 AW_MPI_AI_SuspendAec

【描述】
设置AI 设备暂停回声消除。
【语法】

```
ERRORTYPE AW_MPI_AI_SuspendAec(AUDIO_DEV AudioDevId);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无。
【举例】
无

##### 9.4.1.40 AW_MPI_AI_ResumeAec

【描述】
设置AI 设备恢复回声消除。
【语法】

```
ERRORTYPE AW_MPI_AI_ResumeAec(AUDIO_DEV AudioDevId);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

如果AW_MPI_AI_SetPubAttr() 设置属性时关闭了回声消除，那么调用该接口无效。
【举例】
无

#### 9.4.2 音频输出

##### 9.4.2.1 AW_MPI_AO_SetPubAttr

【描述】
设置AO 设备属性。
【语法】

```
ERRORTYPE AW_MPI_AO_SetPubAttr(AUDIO_DEV AudioDevId,AO_CHN AoChn, const AIO_ATTR_S *pstAttr
);
```

【参数】

| 参数       | 描述                   |      |
| ---------- | ---------------------- | ---- |
| AudioDevId | 音频设备号。           | 输入 |
| AoChn      | AO 通道号。            | 输入 |
| pstAttr    | 音频输出设备属性指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在设置属性之前需要保证AO 处于禁用状态，如果处于启用状态则需要首先禁用AO 设备。AO 必须和DA 配合起来才能正常工作，用户必须清楚DA 发送的数据分布和通道的关系才能从正确的通道发送数据。
对接外置Codec 时，由于时序的问题，在AO 设备从模式下，建议用户先配置好对接的Codec，再配置AO 设备；而在AO 设备主模式下，建议用户先配置好AO 设备，再配置对接的Codec。
对接内置Codec 时，都需要先配置内置Codec，再配置AO 设备。
对接内置Codec 时，AI 设备0 和AO 设备0 的帧同步时钟与位流时钟不能共用，u32ClkSel需要配置为0。
AO 设备主模式时，决定AO 设备输出时钟的关键配置项是采样率、采样精度以及通道数目，采样精度乘以通道数目即为AO 设备时序一次采样的位宽。
扩展标志对AO 设备无效。
AO 设备属性结构体中其他项请参见AI 模块中相关接口的描述。
【举例】
无

##### 9.4.2.2 AW_MPI_AO_GetPubAttr

【描述】
获取AO 设备属性。
【语法】

```
ERRORTYPE AW_MPI_AO_GetPubAttr(AUDIO_DEV AudioDevId,AO_CHN AoChn, AIO_ATTR_S *pstAttr);
```

【参数】

| 参数       | 描述                   |      |
| ---------- | ---------------------- | ---- |
| AudioDevId | 音频设备号。           | 输入 |
| AoChn      | AO 通道号。            | 输入 |
| pstAttr    | 音频输出设备属性指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

获取的属性为前一次配置的属性。
如果从未配置过属性，则返回属性未配置的错误。
【举例】
无

##### 9.4.2.3 AW_MPI_AO_ClrPubAttr

【描述】
清除AO 设备属性。
【语法】

```
ERRORTYPE AW_MPI_AO_ClrPubAttr(AUDIO_DEV AudioDevId,AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

清除设备属性前，需要先停止设备。
【举例】
无

##### 9.4.2.4 AW_MPI_AO_Enable

【描述】
启用AO 通道，通过指定的AO 设备播出。AO 设备允许多个AO 通道混音后播出。
【语法】

```
ERRORTYPE AW_MPI_AO_Enable(AUDIO_DEV AudioDevId,AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

要求在启用前配置AO 设备属性，否则会返回属性未配置的错误。
如果AO 设备已经启用，则直接返回成功。
可以不调用本接口。AO 组件内部在启动时会调用本接口。
【举例】
无

##### 9.4.2.5 AW_MPI_AO_Disable

【描述】
禁用AO 设备上的指定AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_Disable(AUDIO_DEV AudioDevId,AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

如果AO 通道已经禁用，则直接返回成功。
【举例】
无

##### 9.4.2.6 AW_MPI_AO_CreateChn

【描述】
创建AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_CreateChn(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

先创建AO 通道，再启动AO 通道。
【举例】
无

##### 9.4.2.7 AW_MPI_AO_DestroyChn

【描述】
销毁AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_DestroyChn(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

销毁AO 通道时，该通道会从其所属的AO 设备的播放管理列表中退出，当只有该AO 通道占用
该AO 设备时，会主动关闭AO 设备；如果还有其AO 通道占用AO 设备，则等到最后一个AO
设备退出时，才会主动关闭AO 设备。
释放AO 通道流程：AO_StopChn->AO_Disable->AO_DestroyChn
【举例】
无

##### 9.4.2.8 AW_MPI_AO_StartChn

【描述】
启用AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_StartChn(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无。
【举例】
无

##### 9.4.2.9 AW_MPI_AO_StopChn

【描述】
停止AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_StopChn(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.2.10 AW_MPI_AO_RegisterCallback

【描述】
停止AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_RegisterCallback(AUDIO_DEV AudioDevId, AO_CHN AoChn, MPPCallbackInfo *
pCallback);
```

【参数】

| 参数       | 描述                   |      |
| ---------- | ---------------------- | ---- |
| AudioDevId | 音频设备号。           | 输入 |
| AoChn      | AO 通道号。            | 输入 |
| pCallback  | 来自app 层的回调信息。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.2.11 AW_MPI_AO_SendFrame

【描述】
以异步方式发送AO 音频帧。
【语法】

```
ERRORTYPE AW_MPI_AO_SendFrame(AUDIO_DEV AudioDevId, AO_CHN AoChn, const AUDIO_FRAME_S *
pstData, int s32MilliSec);
```

【参数】

| 参数        | 描述               |      |
| ----------- | ------------------ | ---- |
| AudioDevId  | 音频设备号。       | 输入 |
| AoChn       | AO 通道号。        | 输入 |
| pstData     | 音频帧结构体指针。 | 输入 |
| s32MilliSec | 无意义。           | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

该接口用于app 主动发送音频帧至AO 输出，如果AO 通道已经通过系统绑定（AW_MPI_SYS_Bind）
接口与AI 或ADEC 绑定，不需要也不建议调此接口。
以异步方式发送，PCMbuffer 是app 送入，ao 组件使用完后，通过回调函数返回buffer 给
app，因此app 需要做好buffer 管理，与ao 组件交互完成buffer 的使用。使用较为复杂，建
议app 使用AW_MPI_AO_SendFrameSync
调用该接口发送音频帧到AO 输出时，必须先使能对应的AO 通道。
【举例】
无

##### 9.4.2.12 AW_MPI_AO_SendFrameSync

【描述】
以同步方式发送AO 音频帧。
【语法】

```
ERRORTYPE AW_MPI_AO_SendFrameSync(AUDIO_DEV AudioDevId, AO_CHN AoChn, AUDIO_FRAME_S *
pstData);
```

【参数】

| 参数        | 描述               |      |
| ----------- | ------------------ | ---- |
| AudioDevId  | 音频设备号。       | 输入 |
| AoChn       | AO 通道号。        | 输入 |
| pstData     | 音频帧结构体指针。 | 输入 |
| s32MilliSec | 无意义。           | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

该接口用于app 主动发送音频帧至AO 输出，如果AO 通道已经通过系统绑定（AW_MPI_SYS_Bind）
接口与AI 或ADEC 绑定，不需要也不建议调此接口。
该接口返回时，数据已处理完成，app 可以释放buffer。
调用该接口发送音频帧到AO 输出时，必须先使能对应的AO 通道。
【举例】
无

##### 9.4.2.13 AW_MPI_AO_EnableReSmp

【描述】

启用AO 重采样。
【语法】

```
ERRORTYPE AW_MPI_AO_EnableReSmp(AUDIO_DEV AudioDevId, AO_CHN AoChn, AUDIO_SAMPLE_RATE_E
enInSampleRate);
```

【参数】

| 参数           | 描述                     |      |
| -------------- | ------------------------ | ---- |
| AudioDevId     | 音频设备号。             | 输入 |
| AoChn          | AO 通道号。              | 输入 |
| enInSampleRate | 音频重采样的输入采样率。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
应该在启用AO 通道之后，绑定AO 通道之前，调用此接口启用重采样功能。
允许重复启用重采样功能，但必须保证后配置的重采样输入采样率与之前配置的重采样输入采样
率一样。
在禁用AO 通道后，如果重新启用AO 通道，并使用重采样功能，需调用此接口重新启用重采
样。
AO 重采样的输入采样率必须与AO 设备属性配置的采样率不相同。
【举例】
无

##### 9.4.2.14 AW_MPI_AO_DisableReSmp

【描述】
禁用AO 重采样。

【语法】

```
ERRORTYPE AW_MPI_AO_DisableReSmp(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数           | 描述                     |      |
| -------------- | ------------------------ | ---- |
| AudioDevId     | 音频设备号。             | 输入 |
| AoChn          | AO 通道号。              | 输入 |
| enInSampleRate | 音频重采样的输入采样率。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

不再使用AO 重采样功能的话，应该调用此接口将其禁用。
【举例】
无

##### 9.4.2.15 AW_MPI_AO_PauseChn

【描述】
暂停AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_PauseChn(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】
AO 通道暂停后，如果绑定的ADEC 通道继续向此通道发送音频帧数据，发送的音频帧数据将会
被阻塞；而如果绑定的AI 通道继续向此通道发送音频帧数据，在通道缓冲未满的情况下则将音频
帧放入缓冲区，在满的情况下则将音频帧丢弃。
AO 通道为禁用状态时，不允许调用此接口暂停AO 通道。
【举例】
无

##### 9.4.2.16 AW_MPI_AO_ResumeChn

【描述】
恢复AO 通道。
【语法】

```
ERRORTYPE AW_MPI_AO_ResumeChn(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

AO 通道暂停后可以通过调用此接口重新恢复。
AO 通道为暂停状态或使能状态下，调用此接口返回成功；否则调用将返回错误。
【举例】
无

##### 9.4.2.17 AW_MPI_AO_Seek

【描述】
Player 跳播播放。
【语法】

```
ERRORTYPE AW_MPI_AO_Seek(AUDIO_DEV AudioDevId, AO_CHN AoChn);
```

【参数】

| 参数       | 描述         |      |
| ---------- | ------------ | ---- |
| AudioDevId | 音频设备号。 | 输入 |
| AoChn      | AO 通道号。  | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

用于播放视频文件时快进或快退到某一时刻。
【举例】
无

##### 9.4.2.18 AW_MPI_AO_SetTrackMode

【描述】
设置AO 设备声道模式。
【语法】

```
ERRORTYPE AW_MPI_AO_SetTrackMode(AUDIO_DEV AudioDevId,AO_CHN AoChn, AUDIO_TRACK_MODE_E
enTrackMode);
```

【参数】

| 参数        | 描述               |      |
| ----------- | ------------------ | ---- |
| AudioDevId  | 音频设备号。       | 输入 |
| AoChn       | AO 通道号。        | 输入 |
| enTrackMode | 音频设备声道模式。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AO 设备成功启用后再调用此接口。
AO 设备工作在I2S 模式时，支持设置声道模式，PCM 模式下不支持。
【举例】
无

##### 9.4.2.19 AW_MPI_AO_GetTrackMode

【描述】
获取AO 设备声道模式。
【语法】

```
ERRORTYPE AW_MPI_AO_GetTrackMode(AUDIO_DEV AudioDevId, AO_CHN AoChn,AUDIO_TRACK_MODE_E \*
penTrackMode);
```

【参数】

| 参数         | 描述                   |      |
| ------------ | ---------------------- | ---- |
| AudioDevId   | 音频设备号。           | 输入 |
| AoChn        | AO 通道号。            | 输入 |
| penTrackMode | 音频设备声道模式指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AO 设备成功启用后再调用此接口。
AO 设备工作在I2S 模式时，支持获取声道模式，PCM 模式下不支持。
【举例】
无

##### 9.4.2.20 AW_MPI_AO_SetDevVolume

【描述】
设置AO 设备音量大小。
【语法】

```
ERRORTYPE AW_MPI_AO_SetDevVolume(AUDIO_DEV AudioDevId, int s32VolumeDb);
```

【参数】

| 参数        | 描述         |                |
| ----------- | ------------ | -------------- |
| AudioDevId  | 音频设备号。 | 输入           |
| s32VolumeDb | AO           | 设备音量大小。 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AO 设备成功启用后再调用此接口。
音量大小s32VolumeDb 参数的范围为0~100 内的整数，不是db 的含义。
【举例】
无

##### 9.4.2.21 AW_MPI_AO_GetDevVolume

【描述】
获取AO 设备音量大小。
【语法】

```
ERRORTYPE AW_MPI_AO_GetDevVolume(AUDIO_DEV AudioDevId, int *ps32VolumeDb);
```

【参数】

| 参数         | 描述                  |      |
| ------------ | --------------------- | ---- |
| AudioDevId   | 音频设备号。          | 输入 |
| ps32VolumeDb | AO 设备音量大小指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AO 设备成功启用后再调用此接口。
【举例】
无

##### 9.4.2.22 AW_MPI_AO_SetDevMute

【描述】
设置AO 设备静音状态。
【语法】

```
ERRORTYPE AW_MPI_AO_SetDevMute(AUDIO_DEV AudioDevId, BOOL bEnable, AUDIO_FADE_S *pstFade);
```

【参数】

| 参数       | 描述                       |      |
| ---------- | -------------------------- | ---- |
| AudioDevId | 音频设备号。               | 输入 |
| bEnable    | 音频设备是否启用静音。     | 输入 |
| pstFade    | 淡入淡出结构体指针，暂无用 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AO 设备成功启用后再调用此接口。
调用此接口时，用户可以选择是否使用淡入淡出功能，如果不使用淡入淡出则将结构体指针赋为
空即可。（暂不支持pstFade 参数设置）
静音标志bEnable 为1 时，设置音频主通道静音。bEnable 为0 时，取消主通道静音，即恢复
声音，音量大小为设置静音前的值。

【举例】
无

##### 9.4.2.23 AW_MPI_AO_GetDevMute

【描述】
获取AO 设备静音状态。
【语法】

```
ERRORTYPE AW_MPI_AO_GetDevMute(AUDIO_DEV AudioDevId, BOOL *pbEnable, AUDIO_FADE_S *
pstFade);
```

【参数】

| 参数       | 描述                       |      |
| ---------- | -------------------------- | ---- |
| AudioDevId | 音频设备号。               | 输入 |
| bEnable    | 音频设备是否启用静音。     | 输入 |
| pstFade    | 淡入淡出结构体指针，暂无用 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

在AO 设备成功启用后再调用此接口。
静音状态值为1 时指示AO 设备目前处于静音状态；反之为正常工作状态。
【举例】
无

##### 9.4.2.24 AW_MPI_AO_SetStreamEof

【描述】
通知AO 组件码流传递完毕标志。
【语法】

```
ERRORTYPE AW_MPI_AO_SetStreamEof(AUDIO_DEV AudioDevId, AO_CHN AoChn, BOOL bEofFlag);
```

【参数】

| 参数       | 描述           |      |
| ---------- | -------------- | ---- |
| AudioDevId | 音频设备号。   | 输入 |
| AoChn      | AO 通道号。    | 输入 |
| bEofFlag   | 码流结束标志。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

播放完毕后，app 必须设置码流结束标志到AO 组件中。
【举例】
无

##### 9.4.2.25 AW_MPI_AO_SaveFile

【描述】
设置AO 组件pcm 数据的文件保存信息，此为调试接口。
【语法】

```
ERRORTYPE AW_MPI_AO_SaveFile(AUDIO_DEV AudioDevId, AO_CHN AoChn, AUDIO_SAVE_FILE_INFO_S *
pstSaveFileInfo);
```

【参数】

| 参数            | 描述               |      |
| --------------- | ------------------ | ---- |
| AudioDevId      | 音频设备号。       | 输入 |
| AoChn           | AO 通道号。        | 输入 |
| pstSaveFileInfo | 文件保存信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.2.26 AW_MPI_AO_QueryFileStatus

【描述】
查询AO 组件文件保存状态，此为调试接口。
【语法】

```
ERRORTYPE AW_MPI_AO_QueryFileStatus(AUDIO_DEV AudioDevId, AO_CHN AoChn,
AUDIO_SAVE_FILE_INFO_S *pstSaveFileInfo);
```

【参数】

| 参数            | 描述               |      |
| --------------- | ------------------ | ---- |
| AudioDevId      | 音频设备号。       | 输入 |
| AoChn           | AO 通道号。        | 输入 |
| pstSaveFileInfo | 文件保存信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

#### 9.4.3 音频编码

##### 9.4.3.1 AW_MPI_AENC_CreateChn

【描述】
创建音频编码通道。
【语法】

```
ERRORTYPE AW_MPI_AENC_CreateChn(AENC_CHN AeChn, const AENC_CHN_ATTR_S *pstAttr);
```

【参数】

| 参数            | 描述               |      |
| --------------- | ------------------ | ---- |
| AudioDevId      | 音频设备号。       | 输入 |
| AoChn           | AO 通道号。        | 输入 |
| pstSaveFileInfo | 文件保存信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.2 AW_MPI_AENC_DestroyChn

【描述】
销毁音频编码通道。
【语法】

```
ERRORTYPE AW_MPI_AENC_DestroyChn(AENC_CHN AeChn);
```

【参数】

| 参数  | 描述        |      |
| ----- | ----------- | ---- |
| AoChn | AO 通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

通道未创建的情况下调用此接口会返回成功。
如果正在获取/释放码流或者发送帧时销毁该通道，则会返回失败，用户同步处理时需要注意。
【举例】
无

##### 9.4.3.3 AW_MPI_AENC_SendFrame

【描述】
发送音频编码音频帧。
【语法】

```
ERRORTYPE AW_MPI_AENC_SendFrame(AENC_CHN AeChn,const AUDIO_FRAME_INFO_S *pFrameInfo);
```

【参数】

| 参数       | 描述                   |      |
| ---------- | ---------------------- | ---- |
| AoChn      | AO 通道号。            | 输入 |
| pFrameInfo | 音频pcm 帧结构体指针。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

发送pcm 信息接口是非阻塞接口，如果音频pcm 缓存区满，则直接返回失败。
该接口用于用户主动发送音频帧进行编码，如果AENC 通道已经通过系统绑定（AW_MPI_SYS_Bind）
接口与AI 绑定，不需要也不建议调此接口。
调用该接口发送音频编码音频帧时，必须先创建对应的编码通道。
【举例】
无

##### 9.4.3.4 AW_MPI_AENC_GetStream

【描述】
获取编码后码流。

【语法】

```
ERRORTYPE AW_MPI_AENC_GetStream(AENC_CHN AeChn, AUDIO_STREAM_S *pStream, int nMilliSec);
```

【参数】

| 参数      | 描述                                                         |      |
| --------- | ------------------------------------------------------------ | ---- |
| AoChn     | AO 通道号。                                                  | 输入 |
| pStream   | 音频编码属性指针。                                           | 输出 |
| nMilliSec | 获取数据的超时时间:-1 表示阻塞模式，无数据时一直等待；0 表示非<br/>阻塞模式，无数据时则报错返回；>0 表示阻塞nMilliSec 毫秒，超时<br/>则报错返回。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

必须创建通道后才可能获取码流，否则直接返回失败，如果在获取码流过程中销毁通道则会立刻
返回失败。
nMilliSec 的值必须大于等于-1，等于-1 时采用阻塞模式获取数据，等于0 时采用非阻塞模式获
取数据，大于0 时，阻塞nMilliSec 毫秒后，没有数据则返回超时并报错。
【举例】
无

##### 9.4.3.5 AW_MPI_AENC_ReleaseStream

【描述】
释放用户占用的编码码流。
【语法】

```
ERRORTYPE AW_MPI_AENC_ReleaseStream(AENC_CHN AeChn, AUDIO_STREAM_S *pStream);
```

【参数】

| 参数    | 描述               |      |
| ------- | ------------------ | ---- |
| AoChn   | AO 通道号。        | 输入 |
| pStream | 音频编码属性指针。 | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

用户通过AW_MPI_AENC_GetStream 接口获得编码数据后，必须尽快将该编码数据再还给编
码组件，以方便释放stream buffer 中占用的空间。
该接口配合AW_MPI_AENC_GetStream 一起使用，用于none-tunnel 方式来保存编码后的
数据，通常用于nvr 模式，将采集到的pcm 数据送编码，然后应用去拿编码数据，再去做文件封
装。
AI 组件与AEnc 组件通常用tunnel 方式进行数据传递（需进行bind 的操作）。AEnc 组件与
Muexer 组件通过tunnel 方式数据传递时，mpp 组件内部做封装处理，保存为本地文件；通过
none-tunnel 方式数据传递时，即应用主动拿编码数据，然后自行处理，或通过网络传走，或自
行封装写卡。
码流最好能够在使用完之后立即释放，如果不及时释放，会导致编码过程阻塞。
释放的码流必须是从该通道获取的码流，不得对码流信息结构体进行任何修改，否则会导致码流
不能释放，使此码流buffer 丢失，甚至导致程序异常。
释放码流时必须保证通道已经被创建，否则直接返回失败，如果在释放码流过程中销毁通道则会
立刻返回失败。
【举例】
无

##### 9.4.3.6 AW_MPI_AENC_StartRecvPcm

【描述】

启动音频编码组件。
【语法】

```
ERRORTYPE AW_MPI_AENC_StartRecvPcm(AENC_CHN AeChn);
```

【参数】

| 参数  | 描述        |      |
| ----- | ----------- | ---- |
| AoChn | AO 通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

该接口常用于绑定方式（AI、AENC 组件绑定）下，控制音频编码器的启动。如果APP 主动发
送音频帧进行编码，建议使用AW_MPI_AENC_SendFrame 接口，如果APP 本身不进行音频
数据管理，而希望系统主动处理，建议使用本接口。
【举例】
无

##### 9.4.3.7 AW_MPI_AENC_StopRecvPcm

【描述】
关闭音频编码组件。
【语法】

```
ERRORTYPE AW_MPI_AENC_StopRecvPcm(AENC_CHN AeChn);
```

【参数】

| 参数  | 描述        |      |
| ----- | ----------- | ---- |
| AoChn | AO 通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.8 AW_MPI_AENC_ResetChn

【描述】
复位AEnc 通道。
【语法】

```
ERRORTYPE AW_MPI_AENC_ResetChn(AENC_CHN AeChn);
```

【参数】

| 参数  | 描述        |      |
| ----- | ----------- | ---- |
| AoChn | AO 通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.9 AW_MPI_AENC_Query

【描述】
查询AEnc 通道内部数据状态。
【语法】

```
ERRORTYPE AW_MPI_AENC_Query(AENC_CHN AeChn, AENC_CHN_STAT_S *pStat);
```

【参数】

| 参数  | 描述                     |      |
| ----- | ------------------------ | ---- |
| AoChn | AO 通道号。              | 输入 |
| pStat | 来自app 的状态信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.10 AW_MPI_AENC_RegisterCallback

【描述】
向AEnc 通道注册回调信息。
【语法】

```
ERRORTYPE AW_MPI_AENC_RegisterCallback(AENC_CHN AeChn, MPPCallbackInfo *pCallback);
```

【参数】

| 参数  | 描述                     |      |
| ----- | ------------------------ | ---- |
| AoChn | AO 通道号。              | 输入 |
| pStat | 来自app 的状态信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```



【参数】

| 参数      | 描述                     |      |
| --------- | ------------------------ | ---- |
| AoChn     | AO 通道号。              | 输入 |
| pCallback | 来自app 的回调信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.11 AW_MPI_AENC_SetChnAttr

【描述】
设置AEnc 通道属性信息。
【语法】

```
ERRORTYPE AW_MPI_AENC_SetChnAttr(AENC_CHN AeChn, const AENC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述                         |      |
| ----- | ---------------------------- | ---- |
| AoChn | AO 通道号。                  | 输入 |
| pAttr | 来自app 的通道属性信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.12 AW_MPI_AENC_GetChnAttr

【描述】
获取AEnc 通道属性信息。
【语法】

```
ERRORTYPE AW_MPI_AENC_GetChnAttr(AENC_CHN AeChn, const AENC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述                         |      |
| ----- | ---------------------------- | ---- |
| AoChn | AO 通道号。                  | 输入 |
| pAttr | 来自app 的通道属性信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aio.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.3.13 AW_MPI_AENC_GetHandle

【描述】
获取AEnc 通道句柄。
【语法】

```
int AW_MPI_AENC_GetHandle(AENC_CHN AeChn);
```

【参数】

| 参数  | 描述        |      |
| ----- | ----------- | ---- |
| AoChn | AO 通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aenc.h、mm_common.h
```

【注意】
无
【举例】

无

#### 9.4.4 音频解码

##### 9.4.4.1 AW_MPI_ADEC_CreateChn

【描述】
创建音频解码通道。
【语法】



```
ERRORTYPE AW_MPI_ADEC_CreateChn(ADEC_CHN AdChn, ADEC_CHN_ATTR_S *pstAttr);
```

【参数】

| 参数  | 描述        |      |
| ----- | ----------- | ---- |
| AoChn | AO 通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_aenc.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.2 AW_MPI_ADEC_DestroyChn

【描述】
销毁音频解码通道。

【语法】

```
ERRORTYPE AW_MPI_ADEC_DestroyChn(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】
无
【举例】
无

##### 9.4.4.3 AW_MPI_ADEC_ResetChn

【描述】
复位ADec 通道。
【语法】

```
ERRORTYPE AW_MPI_ADEC_ResetChn(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.4 AW_MPI_ADEC_RegisterCallback

【描述】
向ADec 通道注册回调信息。
【语法】

```
ERRORTYPE AW_MPI_ADEC_RegisterCallback(ADEC_CHN ADecChn, MPPCallbackInfo *pCallback);
```

【参数】

| 参数      | 描述                       |      |
| --------- | -------------------------- | ---- |
| AdChn     | 音频解码通道号。           | 输入 |
| pCallback | 来自app 层的回调信息指针。 |      |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.5 AW_MPI_ADEC_SendStream

【描述】
向音频解码通道发送码流。
【语法】

```
ERRORTYPE AW_MPI_ADEC_SendStream(ADEC_CHN AdChn, const AUDIO_STREAM_S *pstStream,
BOOL bBlock);
```

【参数】

| 参数      | 描述                                  |      |
| --------- | ------------------------------------- | ---- |
| AdChn     | 音频解码通道号。                      | 输入 |
| pstStream | 音频码流指针。                        | 输入 |
| bBlock    | 阻塞标识。TRUE：阻塞。FALSE：非阻塞。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.6 AW_MPI_ADEC_ClearChnBuf

【描述】
清除ADEC 通道中当前的音频数据缓存。
【语法】

```
ERRORTYPE AW_MPI_ADEC_ClearChnBuf(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.7 AW_MPI_ADEC_GetFrame

【描述】
获取解码后音频帧。
【语法】

```
ERRORTYPE AW_MPI_ADEC_GetFrame(ADEC_CHN AdChn, AUDIO_FRAME_INFO_S *pstFrmInfo, BOOL
bBlock);
```

【参数】

| 参数       | 描述                                  |      |
| ---------- | ------------------------------------- | ---- |
| AdChn      | 音频解码通道号。                      | 输入 |
| pstFrmInfo | 音频帧指针。                          | 输出 |
| bBlock     | 阻塞标识。TRUE：阻塞。FALSE：非阻塞。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.8 AW_MPI_ADEC_ReleaseFrame

【描述】
释放从音频解码通道获取的音频帧。
【语法】

```
ERRORTYPE AW_MPI_ADEC_ReleaseFrame(ADEC_CHN AdChn, AUDIO_FRAME_INFO_S *pstFrmInfo);
```

【参数】

| 参数       | 描述             |      |
| ---------- | ---------------- | ---- |
| AdChn      | 音频解码通道号。 | 输入 |
| pstFrmInfo | 音频帧指针。     | 输出 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.9 AW_MPI_ADEC_SetStreamEof

【描述】
向解码器发送码流结束标识符，并清除码流buffer。
【语法】

```
ERRORTYPE AW_MPI_ADEC_SetStreamEof(ADEC_CHN AdChn, BOOL bEofFlag);
```

【参数】

| 参数     | 描述                                                         |           |
| -------- | ------------------------------------------------------------ | --------- |
| AdChn    | 音频解码通道号。                                             | 输入      |
| bEofFlag | 是否立即清除解码器内部的缓存数据。取值范围：FALSE：延时清除。<br/>不会立即清除解码器内部的缓存数据，解码会继续进行，直到剩余<br/>buffer 不足一帧数据时进行清除操作。TRUE：立即清除解码器内部缓<br/>存数据。 | <br/>输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.10 AW_MPI_ADEC_StartRecvStream

【描述】
启动ADEC 通道。
【语法】

```
ERRORTYPE AW_MPI_ADEC_StartRecvStream(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

在启动该通道前，该ADec 通道已经创建。否则返回错误码。
该api 的调用，其内部实现中，该组件由idle 状态过渡到executing 状态。
【举例】
无

##### 9.4.4.11 AW_MPI_ADEC_StopRecvStream

【描述】
停止ADEC 通道。
【语法】

```
ERRORTYPE AW_MPI_ADEC_StopRecvStream(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

在停止该通道前，需确保该ADec 通道已经创建。否则返回错误码。
该api 的调用，其内部实现中，该组件由executing 状态过渡到idle 状态。
【举例】
无

##### 9.4.4.12 AW_MPI_ADEC_SetChnAttr

【描述】
设置ADEC 通道属性。
【语法】

```
ERRORTYPE AW_MPI_ADEC_SetChnAttr(ADEC_CHN ADecChn, const ADEC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |
| pAttr | 音频帧属性。     | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.13 AW_MPI_ADEC_GetChnAttr

【描述】
获取ADEC 通道属性。
【语法】

```
ERRORTYPE AW_MPI_ADEC_GetChnAttr(ADEC_CHN ADecChn, ADEC_CHN_ATTR_S *pAttr);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |
| pAttr | 音频帧属性。     | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

无
【举例】
无

##### 9.4.4.14 AW_MPI_ADEC_Pause

【描述】
修改ADEC 通道中组件内部状态。
【语法】

```
ERRORTYPE AW_MPI_ADEC_Pause(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

组件只有在idle 或executing 状态下才能变换到pause 状态。常用于player 在播放时暂停。
【举例】

无

##### 9.4.4.15 AW_MPI_ADEC_Seek

【描述】
Player 跳播播放。
【语法】

```
ERRORTYPE AW_MPI_ADEC_Seek(ADEC_CHN AdChn);
```

【参数】

| 参数  | 描述             |      |
| ----- | ---------------- | ---- |
| AdChn | 音频解码通道号。 | 输入 |

【返回值】

| 返回值 | 描述                 |
| ------ | -------------------- |
| 0      | 成功                 |
| 非0    | 失败，其值见错误码。 |

【需求】

```
头文件：mm_comm_adec.h、mm_common.h
```

【注意】

播放器进行seek 跳转播放时，该接口在内部实现为刷新音频解码器内部的pcm 和bitstream 缓
冲管理器。
【举例】
无

### 9.5 数据结构



#### 9.5.1 音频输入输出

##### 9.5.1.1 AIO_ATTR_S

【说明】
定义音频输入输出设备属性结构。
【定义】

```
typedef struct AIO_ATTR_S
{
	AUDIO_SAMPLE_RATE_E enSamplerate;
	AUDIO_BIT_WIDTH_E enBitwidth;
	AIO_MODE_E enWorkmode;
	AUDIO_SOUND_MODE_E enSoundmode;
	unsigned int u32EXFlag;
	unsigned int u32FrmNum;
	unsigned int u32PtNumPerFrm;
	unsigned int u32ChnCnt;
	unsigned int u32ClkSel;
	unsigned int mPcmCardId;
	int ai_aec_en;
	int aec_delay_ms;
	int ai_ans_en;
	int ai_ans_mode;
	int ai_agc_en;
	AO_AGC_CONFIG_S ai_agc_cfg;
} AIO_ATTR_S;
```

【成员】

| 成员名称       | 描述                                                         | 其它说明                     |
| -------------- | ------------------------------------------------------------ | ---------------------------- |
| enSamplerate   | 音频采样率。                                                 | 支持。                       |
| enBitwidth     | 音频采样精度。                                               | 支持。                       |
| enWorkmode     | 音频输入输出工作模式。                                       | 暂不支持。                   |
| enSoundmode    | 音频声道模式。                                               | 暂不支持。                   |
| u32EXFlag      | 扩展标志。                                                   | 暂不支持。<br/>              |
| u32FrmNum      | 缓存帧数目。                                                 | 暂不支持。<br/>              |
| u32PtNumPerFrm | 每帧采样点个数。                                             | 暂不支持。<br/>              |
| u32ChnCnt      | 支持的通道数目。                                             | 支持。<br/>                  |
| u32ClkSel      | 配置AI 设备0 是否复用AO 设备0 的帧同步时钟及位流时钟。<br/>  | 暂不支持。<br/>              |
| mPcmCardId     | 配置声卡类型。                                               | 支持。<br/>                  |
| ai_aec_en      | 是否激活回声消除                                             | 支持<br/>                    |
| aec_delay_ms   | 音频采集端采集的回声，和回声播出时间的间隔。<br/>            | 如无特殊需求，默认为0。<br/> |
| ai_ans_en      | 是否开启降噪处理                                             | 支持<br/>                    |
| ai_ans_mode    | 降噪等级，范围[0,4]，数值越大，<br/>降噪强度越大，副作用也大。<br/> |                              |
| ai_agc_en      | 是否开启音频增益处理。                                       | 支持<br/>                    |
| ai_agc_cfg     | 音频增益参数配置。                                           |                              |

【注意事项】
在设置AIO 设备公共属性(AW_MPI_AI/AO_SetPubAttr) 时，其设备属性结构中三个field 需
填充正确的参数，这三个field 分别为enSamplerate、enBitwidth、u32ChnCnt。
在设置AO 设备公共属性时，还需再添加输出的声卡类型mPcmCardId：AudioCodec 和Snd-
Hdmi，其对应的输出接口，一种为lineout 方式，另一种为hdmi 输出方式。
【相关数据类型及接口】

```
AW_MPI_AI_SetPubAttr
AW_MPI_AO_SetPubAttr
```

##### 9.5.1.2 AI_CHN_PARAM_S

【说明】
定义通道参数结构体。
【定义】

```
typedef struct AI_CHN_PARAM_S
{
unsigned int u32UsrFrmDepth;
} AI_CHN_PARAM_S
```

【成员】

| 成员名称       | 描述             | 其它说明   |
| -------------- | ---------------- | ---------- |
| u32UsrFrmDepth | 音频帧缓存深度。 | 暂不支持。 |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.3 AUDIO_FRAME_S

【说明】
定义音频帧结构体。
【定义】

```
typedef struct AUDIO_FRAME_S
{
	AUDIO_BIT_WIDTH_E enBitwidth;
	AUDIO_SOUND_MODE_E enSoundmode;
	void *mpAddr;
	unsigned long long mTimeStamp;
	unsigned int mSeq;
	unsigned int mLen;
	unsigned int mId;
} AUDIO_FRAME_S;
```

【成员】

| 成员名称    | 描述                        | 其它说明        |
| ----------- | --------------------------- | --------------- |
| enBitwidth  | 音频采样精度。              | 支持。<br/>     |
| enSoundmode | 音频声道模式。              | 支持。<br/>     |
| mpAddr      | 音频帧数据虚拟地址。        | 支持。<br/>     |
| mTimeStamp  | 音频帧时间戳。以μs 为单位。 | 支持。          |
| mSeq        | 音频帧序号。                | 暂不支持。<br/> |
| mLen        | 音频帧长度。以byte 为单位。 | 支持。<br/>     |
| mId         | 音频帧ID。                  | 支持。          |

【注意事项】
mLen（音频帧长度）指1024 个sample 采样的数据长度，在位宽为16、单通道情况下，其值
为2048，在位宽为16、双通道情况下，其值为4096。
【相关数据类型及接口】
无

##### 9.5.1.4 AEC_FRAME_S

【说明】
定义音频回音消除参考帧信息结构体。
【定义】

```
typedef struct AEC_FRAME_S
{
	AUDIO_FRAME_S stRefFrame;
	BOOL bValid;
	BOOL bSysBind;
} AEC_FRAME_S;
```

| 成员名称   | 描述                     | 其它说明<br/> |
| ---------- | ------------------------ | ------------- |
| stRefFrame | 回音消除参考帧结构体。   | 支持。<br/>   |
| bValid     | 参考帧有效标志。         | 支持。<br/>   |
| bSysBind   | 组件间是否采用绑定方式。 | 支持。        |

【注意事项】
无
【相关数据类型及接口】

无

##### 9.5.1.5 AUDIO_AGC_CONFIG_S

【说明】
定义音频自动电平控制配置信息结构体。
【定义】

```
typedef struct AUDIO_AGC_CONFIG_S
{
BOOL bUsrMode;
signed char s8TargetLevel;
signed char s8NoiseFloor;
signed char s8MaxGain;
signed char s8AdjustSpeed;
signed char s8ImproveSNR;
signed char s8UseHighPassFilt;
signed char s8OutputMode;
short s16NoiseSupSwitch;
int s32Reserved;
} AUDIO_AGC_CONFIG_S;
```

【成员】

| 成员名称          | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| bUsrMode          | 是否采用用户模式：0 自动模式，1 用户模式，默认为0<br/>       |
| s8TargetLevel     | 目标电平。<br/>                                              |
| s8NoiseFloor      | 噪声底线。<br/>                                              |
| s8MaxGain         | 最大增益。<br/>                                              |
| s8AdjustSpeed     | 调整速度。<br/>                                              |
| s8ImproveSNR      | 提高信噪比开关。<br/>                                        |
| s8UseHighPassFilt | 打开高通滤波标志。<br/>                                      |
| s8OutputMode      | 输出模式, 低于NoiseFloor 的信号输出静音。范围：[0: 关闭, 1: 打开]<br/> |
| s16NoiseSupSwitch | 噪声抑制开关；范围{0, 1}，0 表示关闭，1 表示开启。<br/>      |
| s32Reserved       | 保留。                                                       |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.6 AI_AEC_CONFIG_S

【说明】
定义音频回声抵消配置信息结构体。
【定义】

```
typedef struct AI_AEC_CONFIG_S
{
	EC_PARAMS_T prms;
} AI_AEC_CONFIG_S;

typedef struct
{
	int enable_aec;
	AEC_PARAMS_T aec_prms;
	int enable_bdc;
	BDC_PARAMS_T bdc_prms;
	Int enable_cdc;
	DRC_PARAMS_T txdrc_prms;
	int enable_rxdrc;
	DRC_PARAMS_T rxdrc_prms;
	int enable_txeq;
	EQ_PARAMS_T txeq_prms;
	int enable_rxeq;
	EQ_PARAMS_T rxeq_prms;
    int enable_ns;
	NS_PARAMS_T ns_prms;
	int enable_txfade;
} EC_PARAMS_T;
```

【成员】

| 成员名称 | 其它说明                 |
| -------- | ------------------------ |
| prms     | 参考《音效库模块说明》。 |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.7 AUDIO_ANR_CONFIG_S

【说明】
定义音频环境噪声抑制功能配置信息结构体。
【定义】

```
typedef struct AUDIO_ANR_CONFIG_S
{
	BOOL bUsrMode;
	short s16NrIntensity;
	short s16NoiseDbThr;
	signed char s8SpProSwitch;
	int s32Reserved;
} AUDIO_ANR_CONFIG_S;
```

【成员】

| 成员名称       | 描述                                                   |
| -------------- | ------------------------------------------------------ |
| bUsrMode       | 是否采用用户模式：0 自动模式，1 用户模式，默认为0<br/> |
| s16NrIntensity | 降噪力度配置。<br/>                                    |
| s16NoiseDbThr  | 噪声门限配置。                                         |
| s8SpProSwitch  | 音乐检测开关。<br/>                                    |
| s32Reserved    | 保留。                                                 |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.8 AUDIO_HPF_CONFIG_S

【说明】
定义音频高通滤波功能配置信息结构体。
【定义】

```
typedef struct AUDIO_HPF_CONFIG_S
{
BOOL bUsrMode;
AUDIO_HPF_FREQ_E enHpfFreq;
} AUDIO_HPF_CONFIG_S;
```

【成员】

| 成员名称  | 描述                                              | 其它说明        |
| --------- | ------------------------------------------------- | --------------- |
| bUsrMode  | 是否采用用户模式：0 自动模式，1 用户模式，默认为0 | 暂不支持。<br/> |
| enHpfFreq | 高通滤波截止频率选择。                            | 暂不支持。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.9 AI_RNR_CONFIG_S

【说明】
定义音频输入高保真噪声抑制功能配置信息结构体。
【定义】

```
typedef struct AI_RNR_CONFIG_S
{
int sMaxNoiseSuppression;
int sOverlapPercent;
int sNonstat;
} AI_RNR_CONFIG_S;
```

【成员】

| 成员名称             | 其它说明        |
| -------------------- | --------------- |
| sMaxNoiseSuppression | 暂不支持。<br/> |
| sOverlapPercent      | 暂不支持。<br/> |
| sNonstat             | 暂不支持。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.10 AUDIO_EQ_CONFIG_S

【说明】
定义音频均衡器功能配置信息结构体。
【定义】

```
typedef struct AUDIO_EQ_CONFIG_S
{
	short s16GaindB[VQE_EQ_BAND_NUM];
	int s32Reserved;
} AUDIO_EQ_CONFIG_S;
```

【成员】

| 成员名称    | 描述<br/>              |
| ----------- | ---------------------- |
| s8GaindB    | EQ 频段增益调节。<br/> |
| s32Reserved | 保留。                 |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.11 AI_VQE_CONFIG_S

【说明】
定义音频输入声音质量增强配置信息结构体。
【定义】

```
typedef struct AI_VQE_CONFIG_S
{
	int bHpfOpen;
	int bAecOpen;
	int bAnrOpen;
	int bRnrOpen;
    int bAgcOpen;
	int bEqOpen;
	int bDrcOpen;
	int s32WorkSampleRate;
	int s32FrameSample;
	VQE_WORKSTATE_E enWorkstate;
	AUDIO_HPF_CONFIG_S stHpfCfg;
	AI_AEC_CONFIG_S stAecCfg;
	AUDIO_ANR_CONFIG_S stAnrCfg;
	AI_RNR_CONFIG_S stRnrCfg;
	AUDIO_AGC_CONFIG_S stAgcCfg;
	AUDIO_EQ_CONFIG_S stEqCfg;
	AI_DRC_CONFIG_S stDrcCfg;
} AI_VQE_CONFIG_S;
```

【成员】

| 成员名称          | 描述                                  |
| ----------------- | ------------------------------------- |
| bHpfOpen          | 高通滤波功能是否使能标志。<br/>       |
| bAecOpen          | 回声抵消功能是否使能标志。<br/>       |
| bAnrOpen          | 环境噪声抑制功能是否使能标志。<br/>   |
| bRnrOpen          | 高保真噪声抑制功能是否使能标志。<br/> |
| bAgcOpen          | 自动电平控制功能是否使能标志<br/>     |
| bEqOpen           | 均衡器功能是否使能标志<br/>           |
| bDrcOpen          | 录音宽动态功能是否使能标志<br/>       |
| s32WorkSampleRate | 工作采样频率。<br/>                   |
| s32FrameSample    | VQE 的帧长，即采样点数目。<br/>       |
| enWorkstate       | 工作模式。<br/>                       |
| stHpfCfg          | 高通滤波功能相关配置信息。<br/>       |
| stAecCfg          | 回声抵消功能相关配置信息。<br/>       |
| stAnrCfg          | 环境噪声抑止功能相关配置信息。<br/>   |
| stRnrCfg          | 高保真噪声抑制功能相关配置信息。<br/> |
| stAgcCfg          | 自动电平控制相关配置信息。<br/>       |
| stEqCfg           | 均衡器相关配置信息。<br/>             |
| stDrcCfg          | 录音宽动态相关配置信息。              |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.12 AO_VQE_CONFIG_S

【说明】

定义音频输出声音质量增强配置信息结构体。
【定义】

```
typedef struct AO_VQE_CONFIG_S
{
	int bHpfOpen;
	int bAnrOpen;
	int bAgcOpen;
	int bEqOpen;
	int bGainOpen;
	int s32WorkSampleRate;
	int s32FrameSample;
	VQE_WORKSTATE_E enWorkstate;
	AUDIO_HPF_CONFIG_S stHpfCfg;
	AUDIO_ANR_CONFIG_S stAnrCfg;
	AUDIO_AGC_CONFIG_S stAgcCfg;
	AUDIO_EQ_CONFIG_S stEqCfg;
	AUDIO_GAIN_CONFIG_S stGainCfg;
} AO_VQE_CONFIG_S;
```

【成员】

| 成员名称          | 描述<br/>                           |
| ----------------- | ----------------------------------- |
| bHpfOpen          | 高通滤波功能是否使能标志。<br/>     |
| bAnrOpen          | 降噪功能是否使能标志。<br/>         |
| bAgcOpen          | 自动电平控制功能是否使能标志<br/>   |
| bEqOpen           | 均衡器功能是否使能标志<br/>         |
| bGainOpen         | 增益功能是否使能标志<br/>           |
| s32WorkSampleRate | 工作采样频率。<br/>                 |
| s32FrameSample    | VQE 的帧长，即采样点数目。<br/>     |
| enWorkstate       | 工作模式。<br/>                     |
| stHpfCfg          | 高通滤波功能相关配置信息。<br/>     |
| stAnrCfg          | 环境噪声抑止功能相关配置信息。<br/> |
| stAgcCfg          | 自动电平控制相关配置信息。<br/>     |
| stEqCfg           | 均衡器相关配置信息。<br/>           |
| stGainCfg         | 增益相关配置信息。                  |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.13 AUDIO_STREAM_S

【说明】
定义音频码流结构体。
【定义】

```
typedef struct AUDIO_STREAM_S
{
	unsigned char *pStream;
	unsigned int mLen;
	unsigned long long mTimeStamp;
	unsigned int mId;
} AUDIO_STREAM_S;
```

【成员】

| 成员名称   | 描述                       |
| ---------- | -------------------------- |
| pStream    | 音频码流数据指针。         |
| mLen       | 音频码流长度。单位为byte。 |
| mTimeStamp | 音频码流时间戳。           |
| mId        | 音频码流序号。             |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.14 AO_CHN_STATE_S

【说明】
音频输出通道的数据缓存状态结构体。
【定义】

```
typedef struct AO_CHN_STATE_S
{
	unsigned int u32ChnTotalNum;
	unsigned int u32ChnFreeNum;
	unsigned int u32ChnBusyNum;
} AO_CHN_STATE_S;
```

【成员】

| 成员名称       | 描述<br/>                   |
| -------------- | --------------------------- |
| u32ChnTotalNum | 输出通道总的缓存块数。<br/> |
| u32ChnFreeNum> | 空闲缓存块数。<br/          |
| u32ChnBusyNum  | 被占用缓存块数。            |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.15 AUDIO_FADE_S

【说明】
音频输出设备淡入淡出配置结构体。
【定义】

```
typedef struct AUDIO_FADE_S
{
	BOOL bFade;
	AUDIO_FADE_RATE_E enFadeInRate;
	AUDIO_FADE_RATE_E enFadeOutRate;
} AUDIO_FADE_S;
```

【成员】

| 成员名称      | 描述<br/>                       |
| ------------- | ------------------------------- |
| bFade         | 是否开启淡入淡出功能。<br/>     |
| enFadeInRate  | 音频输出设备音量淡入速度。<br/> |
| enFadeOutRate | 音频输出设备音量淡出速度。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.16 AUDIO_SAMPLE_RATE_E

【说明】
定义音频采样率。
【定义】

```
typedef enum AUDIO_SAMPLE_RATE_E
{
AUDIO_SAMPLE_RATE_8000 = 8000, /* 8K samplerate*/
AUDIO_SAMPLE_RATE_12000 = 12000, /* 12K samplerate*/
AUDIO_SAMPLE_RATE_11025 = 11025, /* 11.025K samplerate*/
AUDIO_SAMPLE_RATE_16000 = 16000, /* 16K samplerate*/
AUDIO_SAMPLE_RATE_22050 = 22050, /* 22.050K samplerate*/
AUDIO_SAMPLE_RATE_24000 = 24000, /* 24K samplerate*/
AUDIO_SAMPLE_RATE_32000 = 32000, /* 32K samplerate*/
AUDIO_SAMPLE_RATE_44100 = 44100, /* 44.1K samplerate*/
AUDIO_SAMPLE_RATE_48000 = 48000, /* 48K samplerate*/
} AUDIO_SAMPLE_RATE_E;
```

【成员】

| 成员名称                | 描述<br/>             |
| ----------------------- | --------------------- |
| AUDIO_SAMPLE_RATE_8000  | 8kHz 采样率<br/>      |
| AUDIO_SAMPLE_RATE_12000 | 12kHz 采样率<br/>     |
| AUDIO_SAMPLE_RATE_11025 | 11.025kHz 采样率<br/> |
| AUDIO_SAMPLE_RATE_16000 | 16kHz 采样率<br/>     |
| AUDIO_SAMPLE_RATE_22050 | 22.05kHz 采样率<br/>  |
| AUDIO_SAMPLE_RATE_24000 | 24kHz 采样率<br/>     |
| AUDIO_SAMPLE_RATE_32000 | 32kHz 采样率<br/>     |
| AUDIO_SAMPLE_RATE_44100 | 44.1kHz 采样率<br/>   |
| AUDIO_SAMPLE_RATE_48000 | 48kHz 采样率          |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.17 AUDIO_BIT_WIDTH_E

【说明】
定义音频采样精度。
【定义】

```
typedef enum AUDIO_BIT_WIDTH_E
{
AUDIO_BIT_WIDTH_8 = 0, /* 8bit width */
AUDIO_BIT_WIDTH_16 = 1, /* 16bit width*/
AUDIO_BIT_WIDTH_24 = 2, /* 24bit width*/
AUDIO_BIT_WIDTH_32 = 3, /* 32bit width*/
} AUDIO_BIT_WIDTH_E;
```

【成员】

| 成员名称           | 描述                        |
| ------------------ | --------------------------- |
| AUDIO_BIT_WIDTH_8  | 采样精度为8bit 位宽。       |
| AUDIO_BIT_WIDTH_16 | 采样精度为16bit 位宽。<br/> |
| AUDIO_BIT_WIDTH_24 | 采样精度为24bit 位宽。<br/> |
| AUDIO_BIT_WIDTH_32 | 采样精度为32bit 位宽。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.18 AIO_MODE_E

【说明】
定义音频设备工作模式信息结构体。
【定义】

```
typedef enum AIO_MODE_E
{
AIO_MODE_I2S_MASTER = 0, /* AIO I2S master mode */
AIO_MODE_I2S_SLAVE, /* AIO I2S slave mode */
AIO_MODE_PCM_SLAVE_STD, /* AIO PCM slave standard mode */
AIO_MODE_PCM_SLAVE_NSTD, /* AIO PCM slave non-standard mode */
AIO_MODE_PCM_MASTER_STD, /* AIO PCM master standard mode */
AIO_MODE_PCM_MASTER_NSTD, /* AIO PCM master non-standard mode */
AIO_MODE_BUTT
} AIO_MODE_E;
```

【成员】

| 成员名称                 | 描述                     | 其它说明<br/>                  |
| ------------------------ | ------------------------ | ------------------------------ |
| AIO_MODE_I2S_MASTER      | I2S <br/>主模式          | 暂不支持。                     |
| AIO_MODE_I2S_SLAVE       | I2S 从模式               | 暂不支持。<br/>                |
| AIO_MODE_PCM_SLAVE_STD   | PCM 从模式（标准协议）   | 暂不支持。<br/>                |
| AIO_MODE_PCM_SLAVE_NSTD  | PCM 从模式               | （自定义协议） 暂不支持。<br/> |
| AIO_MODE_PCM_MASTER_STD  | PCM 主模式（标准协议）   | 暂不支持。                     |
| AIO_MODE_PCM_MASTER_NSTD | PCM 主模式（自定义协议） | 暂不支持。                     |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.19 AIO_SOUND_MODE_E

【说明】
定义音频声道模式结构体。
【定义】

```
typedef enum AIO_SOUND_MODE_E
{
	AUDIO_SOUND_MODE_MONO =0, /*mono*/
	AUDIO_SOUND_MODE_STEREO =1, /*stereo*/
} AUDIO_SOUND_MODE_E;
```

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.20 AUDIO_HPF_FREQ_E

【说明】
定义音频HPE 频率结构体。
【定义】

```
typedef enum AUDIO_HPF_FREQ_E
{
	AUDIO_HPF_FREQ_80 = 80, /* 80Hz */
	AUDIO_HPF_FREQ_120 = 120, /* 120Hz */
	AUDIO_HPF_FREQ_150 = 150, /* 150Hz */
} AUDIO_HPF_FREQ_E;
```

【成员】

| 成员名称           | 描述                   |
| ------------------ | ---------------------- |
| AUDIO_HPF_FREQ_80  | 截止频率为80Hz。<br/>  |
| AUDIO_HPF_FREQ_120 | 截止频率为120Hz。<br/> |
| AUDIO_HPF_FREQ_150 | 截止频率为150Hz        |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.21 AQE_WORKSTATE_E

【说明】
定义工作模式结构体。
【定义】

```
typedef enum VQE_WORKSTATE_E
{
VQE_WORKSTATE_COMMON = 0,
VQE_WORKSTATE_MUSIC = 1,
VQE_WORKSTATE_NOISY = 2,
} VQE_WORKSTATE_E;
```

【成员】

| 成员名称             | 描述<br/>       |
| -------------------- | --------------- |
| VQE_WORKSTATE_COMMON | 一般模式。<br/> |
| VQE_WORKSTATE_MUSIC  | 音乐模式。<br/> |
| VQE_WORKSTATE_NOISY  | 噪声模式。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.22 AUDIO_TRACK_MODE_E

【说明】
定义音频设备声道模式类型。
【定义】

```
typedef enum AUDIO_TRACK_MODE_E
{
AUDIO_TRACK_NORMAL = 0,
AUDIO_TRACK_BOTH_LEFT = 1,
AUDIO_TRACK_BOTH_RIGHT = 2,
AUDIO_TRACK_EXCHANGE = 3,
AUDIO_TRACK_MIX = 4,
AUDIO_TRACK_LEFT_MUTE = 5,
AUDIO_TRACK_RIGHT_MUTE = 6,
AUDIO_TRACK_BOTH_MUTE = 7,
} AUDIO_TRACK_MODE_E;
```

| 成员名称               | 描述                                                     | 其它说明<br/>   |
| ---------------------- | -------------------------------------------------------- | --------------- |
| AUDIO_TRACK_NORMAL     | 正常模式，不做处理<br/>                                  | 支持。          |
| AUDIO_TRACK_BOTH_LEFT  | 两个声道全部为左声道声音<br/>                            | 暂不支持。      |
| AUDIO_TRACK_BOTH_RIGHT | 两个声道全部为右声道声音                                 | 暂不支持。<br/> |
| AUDIO_TRACK_EXCHANGE   | 左右声道数据互换，左声道为右声道声音，右声道为左声道声音 | 暂不支持。<br/> |
| AUDIO_TRACK_MIX        | 左右两个声道输出为左右声道相加（混音）                   | 暂不支持。<br/> |
| AUDIO_TRACK_LEFT_MUTE  | 左声道静音，右声道播放原右声道声音                       | 暂不支持。<br/> |
| AUDIO_TRACK_RIGHT_MUTE | 右声道静音，左声道播放原左声道声音                       | 暂不支持。<br/> |
| AUDIO_TRACK_BOTH_MUTE  | 左右声道均静音                                           | 暂不支持。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.23 AUDIO_FADE_RATE_E

【说明】
定义音频输出设备淡入淡出速度类型。
【定义】

```
typedef enum AUDIO_FADE_RATE_E
{
	AUDIO_FADE_RATE_1 = 0,
	AUDIO_FADE_RATE_2 = 1,
	AUDIO_FADE_RATE_4 = 2,
	AUDIO_FADE_RATE_8 = 3,
	AUDIO_FADE_RATE_16 = 4,
	AUDIO_FADE_RATE_32 = 5,
	AUDIO_FADE_RATE_64 = 6,
	AUDIO_FADE_RATE_128 = 7,
} AUDIO_FADE_RATE_E;
```

【成员】

| 成员名称            | 描述<br/>                |
| ------------------- | ------------------------ |
| AUDIO_FADE_RATE_1 > | 1 个采样点改变一次<br/   |
| AUDIO_FADE_RATE_2   | 2 个采样点改变一次<br/>  |
| AUDIO_FADE_RATE_4   | 4 个采样点改变一次<br/>  |
| AUDIO_FADE_RATE_8   | 8 个采样点改变一次<br/>  |
| AUDIO_FADE_RATE_16  | 16 个采样点改变一次<br/> |
| AUDIO_FADE_RATE_32  | 32 个采样点改变一次<br/> |
| AUDIO_FADE_RATE_64  | 64 个采样点改变一次<br/> |
| AUDIO_FADE_RATE_128 | 128 个采样点改变一次     |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.24 G726_BPS_E

【说明】
定义G.726 编解码协议速率。
【定义】

```
typedef enum G726_BPS_E
{
G726_16K = 0, /* G726 16kbps, see RFC3551.txt 4.5.4 G726-16 */
G726_24K, /* G726 24kbps, see RFC3551.txt 4.5.4 G726-24 */
G726_32K, /* G726 32kbps, see RFC3551.txt 4.5.4 G726-32 */
G726_40K, /* G726 40kbps, see RFC3551.txt 4.5.4 G726-40 */
MEDIA_G726_16K, /* G726 16kbps for ASF ... */
MEDIA_G726_24K, /* G726 24kbps for ASF ... */
MEDIA_G726_32K, /* G726 32kbps for ASF ... */
MEDIA_G726_40K, /* G726 40kbps for ASF ... */
} G726_BPS_E;
```

【成员】

| 成员名称描述其它说明<br/> |                         |                 |
| ------------------------- | ----------------------- | --------------- |
| G726_16K                  | 16kbit/s G.726。        | 暂不支持。<br/> |
| G726_24K                  | 24kbit/s G.726。        | 暂不支持。<br/> |
| G726_32K                  | 32kbit/s G.726。        | 暂不支持。<br/> |
| G726_40K                  | 40kbit/s G.726。        | 暂不支持。<br/> |
| MEDIA_G726_16K            | G72616kbit/s for ASF。  | 暂不支持。<br/> |
| MEDIA_G726_24K            | G726 24kbit/s for ASF。 | 暂不支持。<br/> |
| MEDIA_G726_32K            | G726 32kbit/s for ASF。 | 暂不支持。<br/> |
| MEDIA_G726_40K            | G726 40kbit/s for ASF。 | 暂不支持。      |

【注意事项】
无
【相关数据类型及接口】
无

##### 9.5.1.25 ADPCM_TYPE_E

【说明】
定义ADPCM 编解码协议类型。
【定义】

```
typedef enum ADPCM_TYPE_E
{
ADPCM_TYPE_DVI4 = 0,
ADPCM_TYPE_IMA,
} ADPCM_TYPE_E;
```

【成员】

| 成员名称        | 描述                   | 其它说明<br/>   |
| --------------- | ---------------------- | --------------- |
| ADPCM_TYPE_DVI4 | 32kbit/s ADPCM(DVI4)。 | 暂不支持。<br/> |
| ADPCM_TYPE_IMA  | 32kbit/s ADPCM(IMA)。  | 暂不支持。      |

【注意事项】
无

【相关数据类型及接口】
无



#### 9.5.2 音频编码

##### 9.5.2.1 AENC_CHN_ATTR_S

【说明】
定义音频编码通道属性结构体。
【定义】



```
typedef struct AENC_CHN_ATTR_S
{
AENC_ATTR_S AeAttr;
}AENC_CHN_ATTR_S;
typedef struct AENC_ATTR_S
{
PAYLOAD_TYPE_E Type;
int sampleRate;
int channels;
int bitRate;
int bitsPerSample;
int attachAACHeader;
}AENC_ATTR_S;
```

【成员】

| 成员名称        | 描述                       | 其它说明    |
| --------------- | -------------------------- | ----------- |
| Type            | 音频解码协议类型。         | 支持。<br/> |
| sampleRate      | 音频数据采样率。           | 支持。<br/> |
| channels        | 通道数量(单或双通道)。     | 支持。<br/> |
| bitsPerSample   | 采样位宽。                 | 支持。      |
| attachAACHeader | 用于码流类型为AAC 的数据。 | 支持。      |
| bitRate         | 编码码率。                 | 支持。      |

【注意事项】
编码通道属性至少需填充四个field：Type、sampleRate、channels、bitsPerSample。在AAC 编码时，当通过网络传输希望每帧音频码流带头信息时，其中需设置attachAACHeader为1，当直接送muxer 而无需码流头信息时，设置attachAACHeader 为0 即
可。
在G726 编码时，需设置bitRate 参数(16k/24k/32k/40k)，用于调整G726 编码输出数据宽度(2bit/3bit/4bit/5bit)。如果设置为0，编码数据宽度自动调整为2bit。
【相关数据类型及接口】
无

#### 9.5.3 音频解码

##### 9.5.3.1 ADEC_CHN_ATTR_S

【说明】
定义音频解码通道属性结构体。
【定义】

```
typedef struct ADEC_CHN_ATTR_S
{
PAYLOAD_TYPE_E mType;
int sampleRate;
int channels;
int bitRate; // not use
int bitsPerSample;
int attachAACHeader;
}ADEC_CHN_ATTR_S;
```

【成员】

| 成员名称        | 描述                       | 其它说明    |
| --------------- | -------------------------- | ----------- |
| mType           | 音频解码协议类型。         | 支持。<br/> |
| sampleRate      | 音频数据采样率。           | 支持。<br/> |
| channels        | 通道数量(单或双通道)。     | 支持。<br/> |
| bitsPerSample   | 采样位宽。                 | 支持。      |
| attachAACHeader | 用于码流类型为AAC 的数据。 | 支持。      |

【注意事项】
无
【相关数据类型及接口】
无

#### 9.5.4 音频编解码器类型与数据格式要求

| 编码器类型 | 输入pcm                           | 格式输出                                        |
| ---------- | --------------------------------- | ----------------------------------------------- |
| aac        | 8k~48k采样率, 单/双通道,16 位宽   | 压缩率为10 左右。8k/单通道下输出约16kbps。<br/> |
| mp3        | 8k~48k采样率, 单/双通道,16 位宽   | 16k/24k/128kbps 由应用控制。默认16kbps。<br/>   |
| adpcm      | 8k 采样率, 单通道,16 位宽         | 8k 采样率、16 位宽。                            |
| g711a/u    | 8k 采样率, 单通道,16 位宽         | 8k 采样率、16 位宽。                            |
| g726       | 8k 采样率, 单通道,16 位宽         | 8k 采样率、16 位宽。                            |
| pcma       | 8k~192k 采样率, 单/双通道,16 位宽 | 根据输入调整输出。                              |

注意：
不同编码器对输入数据格式要求不同。acc 和mp3 编码器对输入数据格式要求只需保证16 位宽，对通道数量、采样率没有要求。adpcm、g711a/u、g726 编码器则对输入pcm 数据格式有较多限制，必须同时满足8k 采样率、单通道、16 位宽的要求(编码标准要求)。pcma 编码为非压缩编码器，在内部实现为直接将输入数据送输出。在做ai-aenc 开发时，如果需要输出adpcm、g711a/u、g726 格式的数据，那么在AI 设备属性需设置8k 采样率/单通道/16 位宽
的参数。
目前，AIO 设备的数据位宽(bitwidth) 只支持16 位，8、24、32 位宽大小暂不支持。

### 9.6 错误码

#### 9.6.1 音频输入错误码

| 错误码宏定义描述 |                      |                                 |
| ---------------- | -------------------- | ------------------------------- |
| 0xA0158001       | ERR_AI_INVALID_DEVID | 音频输入设备号无效<br/>         |
| 0xA0158002       | ERR_AI_INVALID_CHNID | 音频输入通道号无效<br/>         |
| 0xA0158003       | ERR_AI_ILLEGAL_PARAM | 音频输入参数设置无效<br/>       |
| 0xA0158006       | ERR_AI_NULL_PTR      | 输入参数空指针错误<br/>         |
| 0xA0158007       | ERR_AI_NOT_CONFIG    | 音频输入设备属性未设置<br/>     |
| 0xA0158008       | ERR_AI_NOT_SUPPORT   | 操作不支持<br/>                 |
| 0xA0158009       | ERR_AI_NOT_PERM      | 操作不允许<br/>                 |
| 0xA0158005       | ERR_AI_NOT_ENABLED   | 音频输入设备或通道没有使能<br/> |
| 0xA015800C       | ERR_AI_NOMEM         | 分配内存失败<br/>               |
| 0xA015800D       | ERR_AI_NOBUF         | 音频输入缓存不足<br/>           |
| 0xA015800E       | ERR_AI_BUF_EMPTY     | 音频输入缓存为空<br/>           |
| 0xA015800F       | ERR_AI_BUF_FULL      | 音频输入缓存为满<br/>           |
| 0xA0158010       | ERR_AI_SYS_NOTREADY  | 音频输入系统未初始化<br/>       |
| 0xA0158012       | ERR_AI_BUSY          | 音频输入系统忙                  |

#### 9.6.2 音频输出错误码

| 错误码     | 宏定义               | 描述<br/>                       |
| ---------- | -------------------- | ------------------------------- |
| 0xA0168001 | ERR_AO_INVALID_DEVID | 音频输出设备号无效<br/>         |
| 0xA0168002 | ERR_AO_INVALID_CHNID | 音频输出通道号无效<br/>         |
| 0xA0168003 | ERR_AO_ILLEGAL_PARAM | 音频输出参数设置无效<br/>       |
| 0xA0168006 | ERR_AO_NULL_PTR      | 音频输出参数空指针错误<br/>     |
| 0xA0168007 | ERR_AO_NOT_CONFIG    | 音频输出设备属性未设置<br/>     |
| 0xA0168008 | ERR_AO_NOT_SUPPORT   | 操作不支持<br/>                 |
| 0xA0168009 | ERR_AO_NOT_PERM      | 操作不允许<br/>                 |
| 0xA0168005 | ERR_AO_NOT_ENABLED   | 音频输出设备或通道没有使能<br/> |
| 0xA016800C | ERR_AO_NOMEM         | 系统内存不足<br/>               |
| 0xA016800D | ERR_AO_NOBUF         | 音频输出缓存不足<br/>           |
| 0xA016800E | ERR_AO_BUF_EMPTY     | 音频输出缓存为空<br/>           |
| 0xA016800F | ERR_AO_BUF_FULL      | 音频输出缓存为满<br/>           |
| 0xA0168010 | ERR_AO_SYS_NOTREADY  | 音频输出系统未初始化<br/>       |
| 0xA0168012 | ERR_AO_BUSY          | 音频输出系统忙                  |

#### 9.6.3 音频编码错误码

| 错误码     | 宏定义                 | 描述<br/>                 |
| ---------- | ---------------------- | ------------------------- |
| 0xA0178001 | ERR_AENC_INVALID_DEVID | 音频编码设备号无效<br/>   |
| 0xA0178002 | ERR_AENC_INVALID_CHNID | 音频编码通道号无效<br/>   |
| 0xA0178003 | ERR_AENC_ILLEGAL_PARAM | 音频编码参数设置无效<br/> |
| 0xA0178004 | ERR_AENC_EXIST         | 音频编码通道已经创建<br/> |
| 0xA0178005 | ERR_AENC_UNEXIST       | 音频编码通道未创建<br/>   |
| 0xA0178006 | ERR_AENC_NULL_PTR      | 输入参数空指针错误<br/>   |
| 0xA0178007 | ERR_AENC_NOT_CONFIG    | 编码通道未配置<br/>       |
| 0xA0178008 | ERR_AENC_NOT_SUPPORT   | 操作不被支持<br/>         |
| 0xA0178009 | ERR_AENC_NOT_PERM      | 操作不允许<br/>           |
| 0xA017800C | ERR_AENC_NOMEM         | 系统内存不足<br/>         |
| 0xA017800D | ERR_AENC_NOBUF         | 编码通道缓存分配失败<br/> |
| 0xA017800E | ERR_AENC_BUF_EMPTY     | 编码通道缓存空<br/>       |
| 0xA017800F | ERR_AENC_BUF_FULL      | 编码通道缓存满<br/>       |
| 0xA0178010 | ERR_AENC_SYS_NOTREADY  | 系统没有初始化<br/>       |
|            | ERR_AENC_ENCODER_ERR   | 音频编码数据错误          |

#### 9.6.4 音频解码错误码

| 错误码     | 宏定义                 | 描述<br/>                 |
| ---------- | ---------------------- | ------------------------- |
| 0xA0188001 | ERR_ADEC_INVALID_DEVID | 音频解码设备号无效<br/>   |
| 0xA0188002 | ERR_ADEC_INVALID_CHNID | 音频解码通道号无效<br/>   |
| 0xA0188003 | ERR_ADEC_ILLEGAL_PARAM | 音频解码参数设置无效<br/> |
| 0xA0188004 | ERR_ADEC_EXIST         | 音频解码通道已经创建<br/> |
| 0xA0188005 | ERR_ADEC_UNEXIST       | 音频解码通道未创建<br/>   |
| 0xA0188006 | ERR_ADEC_NULL_PTR      | 输入参数空指针错误<br/>   |
| 0xA0188007 | ERR_ADEC_NOT_CONFIG    | 解码通道属性未配置<br/>   |
| 0xA0188008 | ERR_ADEC_NOT_SUPPORT   | 操作不被支持<br/>         |
| 0xA0188009 | ERR_ADEC_NOT_PERM      | 操作不允许<br/>           |
| 0xA018800C | ERR_ADEC_NOMEM         | 系统内存不足<br/>         |
| 0xA018800D | ERR_ADEC_NOBUF         | 解码通道缓存分配失败<br/> |
| 0xA018800E | ERR_ADEC_BUF_EMPTY     | 解码通道缓存空<br/>       |
| 0xA018800F | ERR_ADEC_BUF_FULL      | 解码通道缓存满<br/>       |
| 0xA0188010 | ERR_ADEC_SYS_NOTREADY  | 系统没有初始化<br/>       |
|            | ERR_ADEC_DECODER_ERR   | 音频解码数据错误          |

## 10 REGION 模块

### 10.1 概述

用户一般都需要在视频中叠加OSD 用于显示一些特定的信息（如：通道号、时间戳等），必要时还会填充色块。这些叠加在视频上的OSD 和遮挡在视频上的色块统称为区域。REGION 模块，用于统一管理这些区域资源。
区域管理可以实现区域的创建，并叠加到视频中或对视频进行遮挡。例如，实际应用中，用户创建一个区域，通过AW_MPI_RGN_AttachToChn，将该区域叠加到某个通道（如VENC 通道）中。在通道进行调度时，则会将OSD 叠加在视频中。一个区域支持通过设置通道显示属性接口指定到多个通道中（如：多个VENC 通道，多个VideoScaler 通道，甚至多个VENC 和VideoScaler 通道），且支持在每个通道的显示属性（如位置、透明度等）都不同。

### 10.2 功能描述

支持区域叠加(overlay)、区域遮挡(cover)、物体矩形框标注(Object Rectangle Label，简写ORL) 三种方式。其中叠加支持位图加载、反色等功能，遮挡则支持纯色块的遮挡；矩形框标注仅画线。
区域在不同通道拥有不同的通道显示属性，比如显示位置、层次和区域是否显示等属性。vipp 通道不支持overlay, cover，只支持ORL。
venc 通道支持overlay,cover，不支持ORL。

### 10.3 状态

Этот компонент не имеет внутренних потоков, поэтому переходов состояния нет.

### 10.4 API 接口

REGION 目前对外支持的API 接口：

• AW_MPI_RGN_Create ：创建区域。
• AW_MPI_RGN_Destrory ：销毁区域。
• AW_MPI_RGN_GetAttr ：获取区域属性。
• AW_MPI_RGN_SetAttr ：设置区域属性。
• AW_MPI_RGN_SetBitMap ：设置区域位图。
• AW_MPI_RGN_AttachToChn ：将区域叠加到通道上。
• AW_MPI_RGN_DetachFrmChn ：将区域从通道中撤出。
• AW_MPI_RGN_SetDisplayAttr ：设置区域的通道显示属性。
• AW_MPI_RGN_GetDisplayAttr ：获取区域的通道显示属性。

#### 10.4.1 AW_MPI_RGN_Create

【描述】
创建区域。
【语法】

```
ERRORTYPE AW_MPI_RGN_Create(RGN_HANDLE Handle, const RGN_ATTR_S *pstRegion);
```

【参数】

| 参数名称  | 描述                                  | 输入/输出 |
| --------- | ------------------------------------- | --------- |
| Handle    | 区域句柄号。必须是未使用的Handle 号。 | 输入<br/> |
|           | 取值范围：[0, RGN_HANDLE_MAX)。       | 输入<br/> |
| pstRegion | 区域属性指针。                        | 输入      |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】
创建Cover 时，只需指定区域类型即可。其它的属性，如区域位置，层次等信息在调用AW_MPI_RGN_AttachToChn 接口时指定。
创建区域时，本接口只进行基本的参数的检查，譬如：最小宽高，最大宽高等；当区域attach 到通道上时，根据各通道模块支持类型的约束条件进行更加有针对性的参数检查，譬如支持的像素格式等。
对于准备添加到VENC 通道的区域，其区域的宽高，位置坐标参数必须能是16 的倍数，否则无法添加到VENC 通道。
【举例】
无

#### 10.4.2 AW_MPI_RGN_Destroy

【描述】
销毁区域。
【语法】

```
ERRORTYPE AW_MPI_RGN_Destroy(RGN_HANDLE Handle);
```

【参数】

| 参数名称 | 描述                                        | 输入/输出<br/> |
| -------- | ------------------------------------------- | -------------- |
| Handle   | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入           |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

#### 10.4.3 AW_MPI_RGN_GetAttr

【描述】
获取区域属性。
【语法】

```
ERRORTYPE AW_MPI_RGN_GetAttr(RGN_HANDLE Handle, RGN_ATTR_S *pstRegion);
```

【参数】

| 参数名称  | 描述                                        | 输入/输出<br/> |
| --------- | ------------------------------------------- | -------------- |
| Handle    | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstRegion | 区域属性指针。                              | 输出           |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】
无
【举例】
无

##### 10.4.4 AW_MPI_RGN_SetAttr

【描述】
设置区域属性。
【语法】

```
ERRORTYPE AW_MPI_RGN_SetAttr(RGN_HANDLE Handle, const RGN_ATTR_S *pstRegion);
```

【参数】

| 参数名称  | 描述                                        | 输入/输出<br/> |
| --------- | ------------------------------------------- | -------------- |
| Handle    | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstRegion | 区域属性指针。                              | 输出           |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】

当区域通过AW_MPI_RGN_AttachToChn 接口绑定到通道上时，本接口不可用于修改静态属
性，但可修改动态属性；当区域没有attach 到任何通道上时，本接口则既可用于修改静态属性，
也可用于修改动态属性。
【举例】
无

#### 10.4.5 AW_MPI_RGN_SetBitMap

【描述】
设置区域位图，即对区域进行位图填充。
【语法】

```
ERRORTYPE AW_MPI_RGN_SetBitMap(RGN_HANDLE Handle, const BITMAP_S *pstBitmap);
```

【参数】

| 参数名称  | 描述                                        | 输入/输出<br/> |
| --------- | ------------------------------------------- | -------------- |
| Handle    | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstRegion | 区域属性指针。                              | 输出           |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】

只对OVERLAY 类型的区域有效。
位图像素格式必须与区域像素格式一致。
当位图大小与区域大小不一致时，区域大小将被修改为与位图大小保持一致。
【举例】
无

#### 10.4.6 AW_MPI_RGN_AttachToChn

【描述】
将区域叠加到通道上。
【语法】

```
ERRORTYPE AW_MPI_RGN_AttachToChn(RGN_HANDLE Handle, const MPP_CHN_S *pstChn, const
RGN_CHN_ATTR_S *pstChnAttr);
```

【参数】

| 参数名称   | 描述                                        | 输入/输出<br/> |
| ---------- | ------------------------------------------- | -------------- |
| Handle     | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstChn     | 通道结构体指针。                            | 输入<br/>      |
| pstChnAttr | 区域通道显示属性指针。                      | 输入           |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】

目前为止，只能将区域叠加到VI 和VENC 两个通道上。
【举例】
无

#### 10.4.7 AW_MPI_RGN_DetachFromChn

【描述】
将区域从通道中撤出。
【语法】

```
ERRORTYPE AW_MPI_RGN_DetachFromChn(RGN_HANDLE Handle, const MPP_CHN_S *pstChn);
```

【参数】

| 参数名称 | 描述                                        | 输入/输出<br/> |
| -------- | ------------------------------------------- | -------------- |
| Handle   | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstChn   | 通道结构体指针。                            | 输入<br/>      |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】
无

#### 10.4.8 AW_MPI_RGN_SetDisplayAttr

【描述】
设置区域的通道显示属性。
【语法】

```
ERRORTYPE AW_MPI_RGN_SetDisplayAttr(RGN_HANDLE Handle, const MPP_CHN_S *pstChn, const
RGN_CHN_ATTR_S *pstChnAttr);
```

【参数】

| 参数名称   | 描述                                        | 输入/输出<br/> |
| ---------- | ------------------------------------------- | -------------- |
| Handle     | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstChn     | 通道结构体指针。                            | 输入<br/>      |
| pstChnAttr | 区域通道显示属性指针。                      | 输入           |

【返回值】

| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】

静态属性不能修改，动态属性可以修改。
【举例】
无

#### 10.4.9 AW_MPI_RGN_GetDisplayAttr

【描述】
获取区域的通道显示属性。
【语法】

```
ERRORTYPE AW_MPI_RGN_GetDisplayAttr(RGN_HANDLE Handle, const MPP_CHN_S *pstChn,
RGN_CHN_ATTR_S *pstChnAttr);
```

【参数】

| 参数名称   | 描述                                        | 输入/输出<br/> |
| ---------- | ------------------------------------------- | -------------- |
| Handle     | 区域句柄号。取值范围：[0, RGN_HANDLE_MAX)。 | 输入<br/>      |
| pstChn     | 通道结构体指针。                            | 输入<br/>      |
| pstChnAttr | 区域通道显示属性指针。                      | 输出           |

【返回值】



| 返回值 | 描述<br/>          |
| ------ | ------------------ |
| 0      | 成功<br/>          |
| 非0    | 失败，参见错误码。 |

【需求】

```
头文件：mpi_region.h
库文件：libmedia_mpp.so
```

【注意】

无
【举例】
无

### 10.5 数据类型

#### 10.5.1 RGN_TYPE_E

【说明】
定义区域类型。
【定义】

```
typedef enum RGN_TYPE_E
{
OVERLAY_RGN = 0, /* video overlay region */
COVER_RGN,
COVEREX_RGN,
OVERLAYEX_RGN,
ORL_RGN, //Object Rectangle Label
RGN_BUTT
} RGN_TYPE_E;
```



【成员】

| 成员名称      | 描述<br/>                           |
| ------------- | ----------------------------------- |
| OVERLAY_RGN   | 通道视频叠加区域。<br/>             |
| COVER_RGN     | 通道视频遮挡区域。<br/>             |
| COVEREX_RGN   | 扩展视频遮挡区域。不支持。<br/>     |
| OVERLAYEX_RGN | 扩展视频遮挡叠加区域。不支持。<br/> |
| ORL_RGN 。    | 物体矩形框标注                      |

【注意事项】
目前为止，COVEREX_RGN 和OVERLAYEX_RGN 不可用，是保留项。
【相关数据类型及接口】
无

#### 10.5.2 INVERT_COLOR_MODE_E

【说明】
OSD 反色模式。
【定义】

```
typedef enum INVERT_COLOR_MODE_E
{
LESSTHAN_LUM_THRESH = 0, /* the lum of the video is less than the lum threshold which
is set by u32LumThresh */
MORETHAN_LUM_THRESH, /* the lum of the video is more than the lum threshold which
is set by u32LumThresh */
LESSTHAN_LUMDIFF_THRESH, /* the lum diff between video and overlay area is less than
threshold */
MORETHAN_LUMDIFF_THRESH, /* the lum diff between video and overlay area is more than
threshold */
INVERT_COLOR_BUTT
}INVERT_COLOR_MODE_E;
```

【成员】

| 成员名称                | 描述<br/>                        |
| ----------------------- | -------------------------------- |
| LESSTHAN_LUM_THRESH     | 视频亮度低于阈值。<br/>          |
| MORETHAN_LUM_THRESH     | 视频亮度高于阈值。<br/>          |
| LESSTHAN_LUMDIFF_THRESH | 视频与叠加区域的亮度差低于阈值。 |
| MORETHAN_LUMDIFF_THRESH | 视频与叠加区域的亮度差高于阈值。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.3 OVERLAY_QP_INFO_S

【说明】
定义OSD 反色相关属性。
【定义】

```
typedef struct OVERLAY_QP_INFO_S
{
BOOL bAbsQp;
int mQp;
BOOL bQpDisable;
}OVERLAY_QP_INFO_S;
```

【成员】

| 成员名称   | 描述<br/>        |
| ---------- | ---------------- |
| bAbsQp     | 平均QP 值。<br/> |
| mQp        | QP 值。<br/>     |
| bQpDisable | QP 开关。        |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.4 OVERLAY_INVERT_COLOR_S

【说明】

定义OSD 反色相关属性。
【定义】

```
typedef struct OVERLAY_INVERT_COLOR_S
{
SIZE_S stInvColArea; //It must be multipe of 16 but not more than 64.
unsigned int mLumThresh; //The threshold to decide whether invert the
OSD's color or not.
INVERT_COLOR_MODE_E enChgMod;
BOOL bInvColEn; //The switch of inverting color.
}OVERLAY_INVERT_COLOR_S;
```

【成员】

| 成员名称     | 描述                                                         |
| ------------ | ------------------------------------------------------------ |
| stInvColArea | 单元反色区域，反色处理的基本单元。取值范围：高度：[16，64]，需要<br/>16 对齐。宽度：[16，64]，需要16 对齐。未使用。不支持单元反色区<br/>域 |
| mLumThresh   | 亮度阀值。暂未使用。<br/>                                    |
| enChgMod     | OSD反色触发模式。暂未使用。<br/>                             |
| bInvColEn    | OSD 反色开关。TRUE：开启反色；FALSE：关闭反色。              |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.5 OVERLAY_ATTR_S

【说明】
定义通道叠加区域属性结构体。
【定义】

```
typedef struct OVERLAY_ATTR_S
{
/* bitmap pixel format,now only support ARGB1555 or ARGB4444 */
PIXEL_FORMAT_E mPixelFmt;
/* background color, pixel format depends on "enPixelFmt" */
unsigned int mBgColor;
/* region size,W:[4,4096],align:2,H:[4,4096],align:2 */
SIZE_S mSize;
}OVERLAY_ATTR_S;
```

【成员】

| 成员名称  | 描述                                                         |
| --------- | ------------------------------------------------------------ |
| mPixelFmt | 像素格式，只支持ARGB1555 和ARGB8888 两种格式。               |
| mBgColor  | 未使用。<br/>                                                |
| mSize     | 区域宽高大小，宽度：[4，4096]，要求以2 对齐。<br/>高度：宽度：[4，4096]，要求以2 对齐。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.6 OVERLAY_CHN_ATTR_S

【说明】
定义通道叠加区域的通道显示属性。
【定义】

```
typedef struct OVERLAY_CHN_ATTR_S
{
/* X:[0,4096],align:4,Y:[0,4096],align:4 */
POINT_S stPoint;
/* background an foreground transparence when pixel format is ARGB1555
* the pixel format is ARGB1555,when the alpha bit is 1 this alpha is value!
* range:[0,128]
*/
unsigned int mFgAlpha;
/* background an foreground transparence when pixel format is ARGB1555
* the pixel format is ARGB1555,when the alpha bit is 0 this alpha is value!
* range:[0,128]
*/
unsigned int mBgAlpha;
unsigned int mLayer; /* OVERLAY region layer range:[0,7]*/
OVERLAY_QP_INFO_S stQpInfo;
OVERLAY_INVERT_COLOR_S stInvertColor;
}OVERLAY_CHN_ATTR_S;
```

【成员】

| 成员名称      | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| stPoint       | 区域位置：水平位置X:[0,4096], 要求以4 对齐。垂直位置Y:[0，4636],<br/>要求以4 对齐。 |
| mFgAlpha      | Alpha 位为1 的像素点的透明度（前景Alpha ），取值范围为[0,128]，<br/>值越小，越透明。只针对像素格式为MM_PIXEL_FORMAT_RGB_1555<br/>的bmp 图有意义，设置全局alpha。对所有overlay 有效。所以以最后<br/>一次设置的overlay 的通道属性为准。 |
| mBgAlpha      | Alpha 位为0 的像素点的透明度（背景Alpha ），取值范围为[0,128]，<br/>值越小，越透明。未使用。 |
| mLayer        | 区域层次，取值范围为：[0,63]，值越大，层次越高。<br/>        |
| stQpInfo      | 区域编码使用的QP 值，未使用。<br/>                           |
| stInvertColor | 区域反色配置信息。                                           |

【注意事项】
建议用户把Overlay 的起始位置和宽高限定为16 对齐。
【相关数据类型及接口】
无

#### 10.5.7 RGN_AREA_TYPE_E

【说明】
定义COVER、COVEREX_RGN 类型。
【定义】

```
typedef enum RGN_AREA_TYPE_E
{
AREA_RECT = 0,
AREA_QUAD_RANGLE,
AREA_BUTT
} RGN_AREA_TYPE_E;
```

【成员】

| 成员名称         | 描述<br/>                |
| ---------------- | ------------------------ |
| AREA_RECT        | 矩形区域。<br/>          |
| AREA_QUAD_RANGLE | 任意四边形区域。不支持。 |

【注意事项】

无
【相关数据类型及接口】
无

#### 10.5.8 RGN_QUADRANGLE_S

【说明】
定义四边形属性。
【定义】

```
typedef struct RGN_QUADRANGLE_S
{
BOOL bSolid; /* whether solid or dashed quadrangle */
unsigned int uThick; /* Line Width of quadrangle, valid when dashed
quadrangle */
POINT_S stPoint[4]; /* points of quadrilateral */
} RGN_QUADRANGLE_S;
```

【成员】

| 成员名称   | 描述<br/>                                             |
| ---------- | ----------------------------------------------------- |
| bSolid     | 定义四边形的类型。1：实心四边形，0：虚线四边形。<br/> |
| uThick     | 定义四边形的线宽，虚线四边形时有效。<br/>             |
| stPoint[4] | 定义四边形的顶点。                                    |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.9 COVER_CHN_ATTR_S

【说明】
定义通道遮挡区域的通道显示属性。
【定义】

```
typedef struct COVER_CHN_ATTR_S
{
RGN_AREA_TYPE_E enCoverType; /* rect or arbitary quadrilateral COVER */
union
{
RECT_S stRect; /* config of rect */
RGN_QUADRANGLE_S stQuadRangle; /* config of arbitary quadrilateral COVER */
};
unsigned int mColor;
unsigned int mLayer; /* COVER region layer */
}COVER_CHN_ATTR_S;
```

【成员】

| 成员名称     | 描述                                  |
| ------------ | ------------------------------------- |
| enCoverType  | 只支持AREA_RECT。<br/>                |
| stRect       | 区域矩形位置，宽高。<br/>             |
| stQuadRangle | 区域任意四边形位置形状。不支持。<br/> |
| mColor       | 区域颜色。ARGB 格式。<br/>            |
| mLayer       | 区域层次。范围：[0,7]。               |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.10 ORL_CHN_ATTR_S

【说明】
定义物体矩形框标注区域的通道显示属性。
【定义】

```
typedef struct ORL_CHN_ATTR_S
{
RGN_AREA_TYPE_E enAreaType; /* rect or arbitary quadrilateral line */
union
{
RECT_S stRect; /* config of rect */
RGN_QUADRANGLE_S stQuadRangle; /* config of arbitary quadrilateral line */
};
unsigned int mColor;
unsigned int mThick; //line width, (0,7]
unsigned int mLayer; /* Object Rectangle Label region layer */
}ORL_CHN_ATTR_S;
```

【成员】

| 成员名称     | 描述<br/>                             |
| ------------ | ------------------------------------- |
| enAreaType   | 只支持AREA_RECT。<br/>                |
| stRect       | 区域矩形位置，宽高。<br/>             |
| stQuadRangle | 区域任意四边形位置形状。不支持。<br/> |
| mColor       | 区域颜色。ARGB 格式。<br/>            |
| mThick       | 矩形框线条厚度。(0, 7]<br/>           |
| mLayer       | 区域层次。范围：[0,7]。               |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.11 COVEREX_CHN_ATTR_S

【说明】
定义通道遮挡区域的通道显示属性。兼容旧接口。
【定义】

```
typedef struct COVEREX_CHN_ATTR_S
{
RGN_AREA_TYPE_E enCoverType; /* rect or arbitary quadrilateral COVER */
union
{
RECT_S stRect; /* config of rect */
RGN_QUADRANGLE_S stQuadRangle; /* config of arbitary quadrilateral COVER */
};
unsigned int u32Color;
unsigned int u32Layer; /* COVEREX region layer range:[0,7] */
}COVEREX_CHN_ATTR_S;
```

【成员】

| 成员名称     | 描述<br/>                             |
| ------------ | ------------------------------------- |
| enCoverType  | 只支持AREA_RECT。<br/>                |
| stRect       | 区域矩形位置，宽高。<br/>             |
| stQuadRangle | 区域任意四边形位置形状。不支持。<br/> |
| u32Color     | 区域颜色。ARGB 格式。<br/>            |
| u32Layer     | 区域层次。范围：[0,7]。               |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.12 OVERLAYEX_ATTR_S

【说明】
定义通道叠加区域属性结构体。兼容旧接口。
【定义】

```
typedef struct OVERLAYEX_ATTR_S
{
PIXEL_FORMAT_E enPixelFmt;
/* background color, pixel format depends on "enPixelFmt" */
unsigned int u32BgColor;
/* region size,W:[4,1920],align:2,H:[4,1080],align:2 */
SIZE_S stSize;
}OVERLAYEX_ATTR_S;
```

【成员】

| 成员名称   | 描述<br/>                                                    |
| ---------- | ------------------------------------------------------------ |
| enPixelFm  | t 像素格式，只支持ARGB1555 和ARGB8888 两种格式。<br/>        |
| u32BgColor | 未使用。<br/>                                                |
| stSize     | 区域宽高大小，宽度：[4，4096]，要求以2 对齐。<br/>高度：宽度：[4，4096]，要求以2 对齐。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.13 OVERLAYEX_CHN_ATTR_S

【说明】

定义通道叠加区域的通道显示属性。兼容旧接口。

【定义】

```
typedef struct OVERLAYEX_CHN_ATTR_S
{
/* X:[0,4096],align:4,Y:[0,4636],align:4 */
POINT_S stPoint;
/* background an foreground transparence when pixel format is ARGB1555
* the pixel format is ARGB1555,when the alpha bit is 1 this alpha is value!
* range:[0,255]
*/
unsigned int u32FgAlpha;
/* background an foreground transparence when pixel format is ARGB1555
* the pixel format is ARGB1555,when the alpha bit is 0 this alpha is value!
* range:[0,255]
*/
unsigned int u32BgAlpha;
unsigned int u32Layer; /* OVERLAYEX region layer range:[0,15]*/
}OVERLAYEX_CHN_ATTR_S;
```

【成员】

| 成员名称   | 描述<br/>                                                    |
| ---------- | ------------------------------------------------------------ |
| stPoint    | 区域位置：水平位置X:[0,4096], 要求以4 对齐。垂直位置Y:[0，4636],<br/>要求以4 对齐。<br/> |
| u32FgAlpha | Alpha 位为1 的像素点的透明度（前景Alpha ），取值范围为[0,128]，<br/>值越小，越透明。只针对像素格式为MM_PIXEL_FORMAT_RGB_1555<br/>的bmp 图有意义，设置全局alpha。对所有overlay 有效。所以以最后<br/>一次设置的overlay 的通道属性为准。<br/> |
| u32BgAlpha | Alpha 位为0 的像素点的透明度（背景Alpha ），取值范围为[0,128]，<br/>值越小，越透明。未使用。<br/> |
| u32Layer   | 区域层次，取值范围为：[0,63]，值越大，层次越高。             |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.14 RGN_ATTR_U

【说明】

定义区域属性联合体。
【定义】

```
typedef union RGN_ATTR_U
{
OVERLAY_ATTR_S stOverlay; /* attribute of overlay region */
OVERLAYEX_ATTR_S stOverlayEx; /* attribute of overlayex region */
} RGN_ATTR_U;
```

【成员】

| 成员名称    | 描述<br/>                  |
| ----------- | -------------------------- |
| stOverlay   | 通道叠加区域属性。<br/>    |
| stOverlayEx | 扩展叠加区域属性。不支持。 |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.15 RGN_CHN_ATTR_U

【说明】
定义区域通道显示属性联合体。
【定义】

```
typedef union RGN_CHN_ATTR_U
{
OVERLAY_CHN_ATTR_S stOverlayChn; /* attribute of overlay region */
COVER_CHN_ATTR_S stCoverChn; /* attribute of cover region */
COVEREX_CHN_ATTR_S stCoverExChn; /* attribute of coverex region */
OVERLAYEX_CHN_ATTR_S stOverlayExChn; /* attribute of overlayex region */
ORL_CHN_ATTR_S stOrlChn; /* attribute of Object Rectangle Label
region */
} RGN_CHN_ATTR_U;
```

【成员】

| 成员名称       | 描述<br/>                               |
| -------------- | --------------------------------------- |
| stOverlayChn   | 叠加区域通道显示属性。<br/>             |
| stCoverChn     | 遮挡区域通道显示属性。<br/>             |
| stCoverExChn   | 扩展遮挡区域通道显示属性。不支持。<br/> |
| stOverlayExChn | 扩展叠加区域通道显示属性。不支持。      |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.16 RGN_ATTR_S

【说明】
定义区域属性结构体。
【定义】

```
typedef struct RGN_ATTR_S
{
RGN_TYPE_E enType; /* region type */
RGN_ATTR_U unAttr; /* region attribute */
} RGN_ATTR_S;
```

【成员】

| 成员名称 | 描述<br/>       |
| -------- | --------------- |
| enType   | 区域类型。<br/> |
| unAttr   | 区域属性。      |

【注意事项】
无
【相关数据类型及接口】
无

#### 10.5.17 RGN_CHN_ATTR_S

【说明】
定义区域属性结构体。
【定义】

```
typedef struct RGN_CHN_ATTR_S
{
BOOL bShow;
RGN_TYPE_E enType; /* region type */
RGN_CHN_ATTR_U unChnAttr; /* region attribute */
} RGN_CHN_ATTR_S;
```

【成员】

| 成员名称  | 描述<br/>           |
| --------- | ------------------- |
| bShow     | 区域是否显示。<br/> |
| enType    | 区域类型。<br/>     |
| unChnAttr | 区域通道显示属性。  |

【注意事项】
无
【相关数据类型及接口】
无

### 10.6 错误码

| 错误代码   | 宏定义                | 描述                                                         |
| ---------- | --------------------- | ------------------------------------------------------------ |
| 0xA0038001 | ERR_RGN_INVALID_DEVID | 设备ID 超出合法范围<br/>                                     |
| 0xA0038002 | ERR_RGN_INVALID_CHNID | 通道组号错误或无效区域句柄<br/>                              |
| 0xA0038003 | ERR_RGN_ILLEGAL_PARAM | 参数超出合法范围<br/>                                        |
| 0xA0038004 | ERR_RGN_EXIST         | 重复创建已存在的设备、通道或资源<br/>                        |
| 0xA0038005 | ERR_RGN_UNEXIST       | 试图使用或者销毁不存在的设备、通道或资源<br/>                |
| 0xA0038006 | ERR_RGN_NULL_PTR      | 函数参数中有空指针<br/>                                      |
| 0xA0038007 | ERR_RGN_NOT_CONFIG    | 模块没有配置。<br/>                                          |
| 0xA0038008 | ERR_RGN_NOT_SUPPORT   | 不支持的参数或者功能<br/>                                    |
| 0xA0038009 | ERR_RGN_NOT_PERM      | 该操作不允许，如试图修改静态配置参数<br/>                    |
| 0xA003800C | ERR_RGN_NOMEM         | 分配内存失败，如系统内存不足。<br/>                          |
| 0xA003800D | ERR_RGN_NOBUF         | 分配缓存失败，如申请的数据缓冲区太大<br/>0xA003800E ERR_RGN_BUF_EMPTY 缓冲区中无数据<br/> |
| 0xA003800F | ERR_RGN_BUF_FULL      | 缓冲区中数据满<br/>                                          |
| 0xA0038011 | ERR_RGN_BADADDR       | 地址非法。<br/>                                              |
| 0xA0038012 | ERR_RGN_BUSY          | 系统忙<br/>                                                  |
| 0xA0038010 | ERR_RGN_NOTREADY      | 系统没有初始化或没有加载相应模块                             |

## 11 UVC 输入模块

### 11.1 概述

UVC 输入模块的功能：设备为USB HOST 模式时连接UVC 设备，获取UVC 设备的视频图像
数据。

### 11.2 功能描述

• 支持符合USB 视频类(USB Video Class) 规范的摄像头设备。
• 支持MJPEG、YUY2 格式。
• 组件支持最多四个UVC 设备，每个设备支持最多四个虚通道。

#### 11.2.1 状态

![image-20230209102508601](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230209102508601.png)

#### 11.2.2 buffer 管理

#### 11.2.3 MJPEG

• 每个UVC 设备物理通道对应一段Buff 空间，Buff 空间数目由MPI 函数设定，由KernelDriver 层统一管理、分配、使用。
• 同一个UVC 设备下的所有虚通道与UVC 设备使用的是同一个buffer。

#### 11.2.4 YUV2

• 每个UVC 设备物理通道对应一段Buff 空间，Buff 空间数目由MPI 函数设定，组件内部拷贝buffer 数据并进行管理。
• 同一个UVC 设备下的所有虚通道与UVC 设备使用的是同一个buffer。

#### 11.2.5 绑定模式与非绑定模式

![image-20230209102524384](http://photos.100ask.net/allwinner-docs/v853/MPPApplication/image-20230209102524384.png)

##### 11.2.5.1 绑定模式

绑定情况下buffer 数据在组件内部传递。AW_MPI_UVC_GetFrame 与AW_MPI_UVC_ReleaseFrame不可使用。

##### 11.2.5.2 非绑定模式

用户通过AW_MPI_UVC_GetFrame 获取buffer 数据，使用AW_MPI_UVC_ReleaseFrame释放buffer 数据，必须成对使用。
注意：同一个虚拟通道，同一时间只能使用绑定，或者非绑定其中一种方式获取YUV 数据，不支持两种方式同时存在。

#### 11.2.6 使用准备

• 打开内核选项：CONFIG_USB_VIDEO_CLASS
• 需要设备为USB HOST 模式
• 插入UVC 设备，会自动识别UVC 设备并在/dev/ 目录下生成video 节点。

### 11.3 API 接口

UVC 目前对外支持的API 接口：
• AW_MPI_UVC_CreateDevice：创建一个UVC 设备。
• AW_MPI_UVC_DestroyDevice：销毁UVC 设备。
• AW_MPI_UVC_SetDeviceAttr：设置UVC 设备属性。
• AW_MPI_UVC_GetDeviceAttr：获取UVC 设备属性。
• AW_MPI_UVC_EnableDevice：启动UVC 设备。
• AW_MPI_UVC_DisableDevice：停止UVC 设备。
• AW_MPI_UVC_CreateVirChn：创建一个UVC 设备虚拟通道。
• AW_MPI_UVC_DestroyVirChn：销毁一个UVC 虚拟通道。
• AW_MPI_UVC_StartRecvPic：启动UVC 设备虚拟通道。
• AW_MPI_UVC_StopRecvPic：停止UVC 设备虚拟通道。
• AW_MPI_UVC_GetFrame：获取UVC 设备的一帧图像。
• AW_MPI_UVC_ReleaseFrame：释放UVC 设备图像内存资源。
• AW_MPI_UVC_SetBrightness：设置UVC 设备图像亮度。
• AW_MPI_UVC_GetBrightness：获取UVC 设备图像亮度。
• AW_MPI_UVC_SetContrast：设置UVC 设备图像对比度。
• AW_MPI_UVC_GetContrast：获取UVC 设备图像对比度。

• AW_MPI_UVC_SetHue：设置UVC 设备的图像色调。
• AW_MPI_UVC_GetHue：设置UVC 设备的图像色调。
• AW_MPI_UVC_SetSaturation：获取UVC 设备的图像饱和度。
• AW_MPI_UVC_GetSaturation：获取UVC 设备的图像饱和度。
• AW_MPI_UVC_SetSharpness：获取UVC 设备的锐度数值。
• AW_MPI_UVC_GetSharpness：获取UVC 设备的锐度数值。

#### 11.3.1 AW_MPI_UVC_GreateDevice

【描述】
创建一个UVC 设备。
【语法】

```
ERRORTYPE AW_MPI_UVC_CreateDevice(UVC_DEV UvcDev);
```

【参数】

| 参数名称 | 描述                 | 输入/输出<br/> |
| -------- | -------------------- | -------------- |
| UvcDev   | 需要创建的UVC 设备号 | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

【注意】
UVC_DEV 类型实际上是char * 类型，创建的UVC 设备号为UVC 生成的video 节点。如
/dev/video1。

#### 11.3.2 AW_MPI_UVC_DestroyDevice

【描述】
销毁UVC 设备。

【语法】

```
AW_MPI_UVC_DestroyDeviceERRORTYPE AW_MPI_UVC_DestroyDevice(UVC_DEV UvcDev);
```

【参数】

| 参数名称 | 描述                 | 类型    | 输入/输出<br/> |
| -------- | -------------------- | ------- | -------------- |
| UvcDev   | 需要销毁的UVC 设备号 | UVC_DEV | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.3 AW_MPI_UVC_SetDeviceAttr

【描述】
设置UVC 设备属性。
【语法】

```
ERRORTYPE AW_MPI_UVC_SetDeviceAttr(UVC_DEV UvcDev, UVC_ATTR_S *pAttr);
```



【参数】

| 参数名称 | 描述                   | 类型       | 输入/输出<br/> |
| -------- | ---------------------- | ---------- | -------------- |
| UvcDev   | UVC 设备号             | UVC_DEV    | 输入           |
| pAttr    | 需要设置的属性结构指针 | UVC_ATTR_S | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.4 AW_MPI_UVC_GetDeviceAttr

【描述】
获取UVC 设备属性。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetDeviceAttr(UVC_DEV UvcDev, UVC_ATTR_S *pAttr);
```

【参数】

| 参数名称 | 描述                   | 类型       | 输入/输出<br/> |
| -------- | ---------------------- | ---------- | -------------- |
| UvcDev   | UVC 设备号             | UVC_DEV    | 输入           |
| pAttr    | 需要设置的属性结构指针 | UVC_ATTR_S | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.5 AW_MPI_UVC_EnableDevice

【描述】
启动UVC 设备。
【语法】

```
ERRORTYPE AW_MPI_UVC_EnableDevice(UVC_DEV UvcDev) ;
```

【参数】

| 参数名称 | 描述                 | 类型    | 输入/输出<br/> |
| -------- | -------------------- | ------- | -------------- |
| UvcDev   | 需要启动的UVC 设备号 | UVC_DEV | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.6 AW_MPI_UVC_DisableDevice

【描述】
停止UVC 设备。
【语法】

```
ERRORTYPE AW_MPI_UVC_DisableDevice(UVC_DEV UvcDev);
```

【参数】

| 参数名称 | 描述                 | 类型    | 输入/输出<br/> |
| -------- | -------------------- | ------- | -------------- |
| UvcDev   | 需要停止的UVC 设备号 | UVC_DEV | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.7 AW_MPI_UVC_CreateVirChn

【描述】
创建一个UVC 设备虚拟通道。
【语法】

```
ERRORTYPE AW_MPI_UVC_CreateVirChn(UVC_DEV UvcDev, UVC_CHN UvcChn);
```

【参数】

| 参数名称 | 描述                    | 类型    | 输入/输出<br/> |
| -------- | ----------------------- | ------- | -------------- |
| UvcDev   | UVC 设备号              | UVC_DEV | 输入           |
| UvcChn   | 需要创建的UVC虚拟通道号 | UVC_CHN | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.8 AW_MPI_UVC_DestroyVirChn

【描述】
销毁一个UVC 虚拟通道。
【语法】

```
ERRORTYPE AW_MPI_UVC_DestroyVirChn(UVC_DEV UvcDev, UVC_CHN UvcChn);
```

【参数】

| 参数名称 | 描述          | 类型    | 输入/输出<br/> |
| -------- | ------------- | ------- | -------------- |
| UvcDev   | UVC 设备号    | UVC_DEV | 输入           |
| UvcChn   | UVC虚拟通道号 | UVC_CHN | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.9 AW_MPI_UVC_StartRecvPic

【描述】
启动UVC 设备虚拟通道。
【语法】

```
ERRORTYPE AW_MPI_UVC_StartRecvPic(UVC_DEV UvcDev, UVC_CHN UvcChn);
```

【参数】

| 参数名称 | 描述              | 类型    |
| -------- | ----------------- | ------- |
| UvcDev   | UVC 设备号        | UVC_DEV |
| UvcChn   | UVC设备虚拟通道号 | UVC_CHN |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.10 AW_MPI_UVC_StopRecvPic

【描述】

停止UVC 设备虚拟通道。
【语法】

```
ERRORTYPE AW_MPI_UVC_StopRecvPic(UVC_DEV UvcDev, UVC_CHN UvcChn);
```

【参数】

| 参数名称 | 描述              | 类型    | 输入/输出 |
| -------- | ----------------- | ------- | --------- |
| UvcDev   | UVC 设备号        | UVC_DEV | 输入      |
| UvcChn   | UVC设备虚拟通道号 | UVC_CHN | 输入      |

#### 11.3.11 AW_MPI_UVC_GetFrame

【描述】
获取UVC 设备的一帧图像，属性包括idth、height、field、pixelformat、timestamp、index
、VirAddr、mem_phy、size 等。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetFrame(UVC_DEV UvcDev, UVC_CHN UvcChn, VIDEO_FRAME_INFO_S *
pstFrameInfo, AW_S32 s32MilliSec);
```

【参数】

| 参数         | 描述                         | 类型               | 输入/输出<br/> |
| ------------ | ---------------------------- | ------------------ | -------------- |
| UvcDev       | UVC 设备号                   | UVC_DEV            | 输入<br/>      |
| UvcChn       | UVC 设备虚拟通道号           | UVC_CHN            | 输入<br/>      |
| pstFrameInfo | 帧信息                       | VIDEO_FRAME_INFO_S | 输出<br/>      |
| s32MilliSec  | Timeout 超时时间设置动态属性 | AW_S32             | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.12 AW_MPI_UVC_ReleaseFrame

【描述】
释放UVC 设备图像内存资源。
【语法】

```
ERRORTYPE AW_MPI_UVC_ReleaseFrame(UVC_DEV UvcDev, UVC_CHN UvcChn, VIDEO_FRAME_INFO_S *
pstFrameInfo);
```

【参数】

| 参数         | 描述               | 类型               | 输入/输出<br/> |
| ------------ | ------------------ | ------------------ | -------------- |
| UvcDev       | UVC 设备号         | UVC_DEV            | 输入<br/>      |
| UvcChn       | UVC 设备虚拟通道号 | UVC_CHN            | 输入<br/>      |
| pstFrameInfo | 帧信息             | VIDEO_FRAME_INFO_S | 输出<br/>      |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.13 AW_MPI_UVC_SetBrightness

【描述】

设置UVC 设备图像亮度。
【语法】

```
ERRORTYPE AW_MPI_UVC_SetBrightness(UVC_DEV UvcDev, int Value);
```

【参数】

| 参数   | 描述               | 类型    | 输入/输出<br/> |
| ------ | ------------------ | ------- | -------------- |
| UvcDev | UVC 设备号         | UVC_DEV | 输入<br/>      |
| Value  | 需要设置的亮度数值 | int     | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.14 AW_MPI_UVC_GetBrightness

【描述】
获取UVC 设备图像亮度。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetBrightness(UVC_DEV UvcDev, int *pValue);
```

【参数】

| 参数   | 描述       | 类型           | 输入/输出<br/> |
| ------ | ---------- | -------------- | -------------- |
| UvcDev | UVC 设备号 | UVC_DEV        | 输入<br/>      |
| pValue | int *      | 获取的亮度数值 | 输出           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.15 AW_MPI_UVC_SetContrast

【描述】
设置UVC 设备图像对比度。
【语法】

```
ERRORTYPE AW_MPI_UVC_SetContrast(UVC_DEV UvcDev, int Value);
```

【参数】

| 参数   | 描述                 | 类型    | 输入/输出<br/> |
| ------ | -------------------- | ------- | -------------- |
| UvcDev | UVC 设备号           | UVC_DEV | 输入<br/>      |
| Value  | 需要设置的对比度数值 | int     | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.16 AW_MPI_UVC_GetContrast

【描述】
获取UVC 设备图像对比度。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetContrast(UVC_DEV UvcDev, int *pValue)
```

【参数】

| 参数   | 描述             | 类型    | 输入/输出<br/> |
| ------ | ---------------- | ------- | -------------- |
| UvcDev | UVC 设备号       | UVC_DEV | 输入<br/>      |
| pValue | 获取的对比度数值 | int *   | 输出           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.17 AW_MPI_UVC_SetHue

【描述】
设置UVC 设备的图像色调。
【语法】

```
ERRORTYPE AW_MPI_UVC_SetHue(UVC_DEV UvcDev, int Value);
```

【参数】

| 参数   | 描述               | 类型    | 输入/输出<br/> |
| ------ | ------------------ | ------- | -------------- |
| UvcDev | UVC 设备号         | UVC_DEV | 输入<br/>      |
| Value  | 需要设置的色调数值 | int     | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.18 AW_MPI_UVC_GetHue

【描述】
设置UVC 设备的图像色调。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetHue(UVC_DEV UvcDev, int *Value);
```

【参数】

| 参数   | 描述           | 类型    | 输入/输出<br/> |
| ------ | -------------- | ------- | -------------- |
| UvcDev | UVC 设备号     | UVC_DEV | 输入<br/>      |
| Value  | 获取的色调数值 | int     | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.19 AW_MPI_UVC_SetSaturation

【描述】
获取UVC 设备的图像饱和度。
【语法】

```
ERRORTYPE AW_MPI_UVC_SetSaturation(UVC_DEV UvcDev, int Value);
```

【参数】

| 参数   | 描述                 | 类型    | 输入/输出<br/> |
| ------ | -------------------- | ------- | -------------- |
| UvcDev | UVC 设备号           | UVC_DEV | 输入<br/>      |
| Value  | 需要设置的饱和度数值 |         | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.20 AW_MPI_UVC_GetSaturation

【描述】
获取UVC 设备的图像饱和度。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetSaturation(UVC_DEV UvcDev, int *pValue);
```

【参数】

| 参数   | 描述               | 类型    | 输入/输出<br/> |
| ------ | ------------------ | ------- | -------------- |
| UvcDev | UVC 设备号         | UVC_DEV | 输入<br/>      |
| Value  | 需要设置饱和度数值 | int *   | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.21 AW_MPI_UVC_SetSharpness

【描述】
获取UVC 设备的锐度数值。
【语法】

```
ERRORTYPE AW_MPI_UVC_SetSharpness(UVC_DEV UvcDev, int Value);
```

【参数】

| 参数   | 描述               | 类型    | 输入/输出<br/> |
| ------ | ------------------ | ------- | -------------- |
| UvcDev | UVC 设备号         | UVC_DEV | 输入<br/>      |
| Value  | 需要设置的锐度数值 | int     | 输入           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

#### 11.3.22 AW_MPI_UVC_GetSharpness

【描述】
获取UVC 设备的锐度数值。
【语法】

```
ERRORTYPE AW_MPI_UVC_GetSharpness(UVC_DEV UvcDev, int *pValue);
```

参数】

| 参数   | 描述           | 类型    | 输入/输出<br/> |
| ------ | -------------- | ------- | -------------- |
| UvcDev | UVC 设备号     | UVC_DEV | 输入<br/>      |
| pValue | 获取的锐度数值 | int *   | 输出           |

【返回值】

| 返回值  | 描述<br/>                        |
| ------- | -------------------------------- |
| SUCCESS | 成功<br/>                        |
| 错误码  | 参考mm_comm_uvc.h 中的错误码描述 |

【需求】

```
头文件：mpi_uvc.h
库文件：libmpp_uvc.so
```

### 11.4 数据类型

#### 11.4.1 UVC_ATTR_S

【说明】
UVC 设备属性参数结构体。
【定义】

```
typedef struct UVC_ATTR_S
{
UVC_CAPTURE_FORMAT mPixelformat;
unsigned int mUvcVideo_Width;
unsigned int mUvcVideo_Height;
unsigned int mUvcVideo_Fps;
unsigned int mUvcVideo_BufCnt;
}UVC_ATTR_S;
```

11.4.2 UVC_CAPTURE_FORMAT
【说明】

定义UVC 设备采集图像格式。
【定义】

```
typedef enum UVC_CAPTURE_FORMAT
{
UVC_YUY2 = V4L2_PIX_FMT_YUYV,
UVC_NV12 = V4L2_PIX_FMT_YUV420,
UVC_H264 = V4L2_PIX_FMT_H264,
UVC_MJPEG = V4L2_PIX_FMT_MJPEG
}UVC_CAPTURE_FORMAT;
```

| 成员名称  | 描述<br/>     |
| --------- | ------------- |
| UVC_YUY2  | YUY2格式<br/> |
| UVC_NV12  | NV12格式<br/> |
| UVC_H264  | H264格式<br/> |
| UVC_MJPEG | MJPEG 格式    |

#### 11.4.3 VIDEO_FRAME_INFO_S

【说明】
定义视频图像帧信息结构体。
【定义】

```
typedef struct VIDEO_FRAME_INFO_S
{
VIDEO_FRAME_S VFrame;
unsigned int mId;
} VIDEO_FRAME_INFO_S;
```

【成员】

| 成员名称 | 描述<br/>               |
| -------- | ----------------------- |
| VFrame   | 视频图像帧<br/>         |
| mId      | 装填图像帧的buffer 的id |

#### 11.4.4 VIDEO_FRAME_ S

【说明】
定义视频原始图像帧结构。

```
typedef struct VIDEO_FRAME_S
{
unsigned int mWidth;
unsigned int mHeight;
VIDEO_FIELD_E mField;
PIXEL_FORMAT_E mPixelFormat;
VIDEO_FORMAT_E mVideoFormat;
COMPRESS_MODE_E mCompressMode;
unsigned int mPhyAddr[3];
void* mpVirAddr[3];
unsigned int mStride[3];
unsigned int mHeaderPhyAddr[3];
void* mpHeaderVirAddr[3];
unsigned int mHeaderStride[3];
short mOffsetTop;
short mOffsetBottom;
short mOffsetLeft;
short mOffsetRight;
uint64_t mpts;
unsigned int mExposureTime;
unsigned int mFramecnt;
VIDEO_SUPPLEMENT_S mSupplement;
int mEnvLV;
} VIDEO_FRAME_S;
```

【成员】

| 成员名称           | 描述                                                         |
| ------------------ | ------------------------------------------------------------ |
| mWidth             | 装填图像的buffer 的宽度<br/>                                 |
| mHeight            | 装填图像的buffer 的高度<br/>                                 |
| mField             | 帧场模式，目前支持VIDEO_FRAME_FIELD_FRAME。<br/>             |
| mPixelFormat       | 视频图像像素格式<br/>                                        |
| mVideoFormat       | 视频图像格式。只支持VIDEO_FORMAT_LINEAR。未使用<br/>         |
| mCompressMode      | 视频压缩格式<br/>                                            |
| mPhyAddr[3]        | 视频帧的yuv 分量的物理地址<br/>                              |
| mpVirAddr[3]       | 视频帧的yuv 分量的虚拟地址<br/>                              |
| mStride[3]         | 视频帧的yuv 分量的一行的跨度，单位为字节<br/>                |
| mHeaderPhyAddr[3]  | 未使用<br/>                                                  |
| mpHeaderVirAddr[3] | 未使用<br/>                                                  |
| mHeaderStride[3]   | 未使用<br/>                                                  |
| mOffsetTop         | 图像顶部剪裁宽度，单位为像素。图像帧第一行像素的Y 坐标<br/>  |
| mOffsetBottom      | 图像底部剪裁宽度，单位为像素。图像帧最后一行的Y 坐标加1<br/> |
| mOffsetLeft        | 图像左侧裁剪宽度，单位为像素。图像帧左侧像素的X 坐标<br/>    |
| mOffsetRight       | 图像右侧裁剪宽度，单位为像素。图像帧右侧想读的X 坐标加1<br/> |
| mpts               | 视频帧pts。单位微秒<br/>                                     |
| mTimeRef           | 未使用<br/>                                                  |
| mPrivateData       | 未使用<br/>                                                  |
| mSupplemet         | 未使用                                                       |
| mEnvLv             | 采集图像帧时的环境亮度值                                     |

#### 11.4.5 错误码

| 错误码     | 宏定义                             | 描述<br/>                       |
| ---------- | ---------------------------------- | ------------------------------- |
| 0xA01E0002 | ERR_UVC_INVALID_CHNID              | 无效的通道号<br/>               |
| 0xA01E0003 | ERR_UVC_ILLEGAL_PARAM              | 无效的参数<br/>                 |
| 0xA01E0004 | ERR_UVC_EXIST UVC                  | 设备已经存在<br/>               |
| 0xA01E0005 | ERR_UVC_UNEXIST UVC                | 设备不存在<br/>                 |
| 0xA01E0006 | ERR_UVC_NULL_PTR                   | 空指针错误<br/>                 |
| 0xA01E0007 | ERR_UVC_NOT_CONFIG                 | 模块未配置<br/>                 |
| 0xA01E0008 | ERR_UVC_NOT_SUPPORT                | 模块不支持<br/>                 |
| 0xA01E0009 | ERR_UVC_NOT_PERM                   | 不允许<br/>                     |
| 0xA01E000C | ERR_UVC_NOMEM                      | 无可用的内存<br/>               |
| 0xA01E000D | ERR_UVC_NOBUF                      | 无可用的缓存buffer<br/>         |
| 0xA01E000E | ERR_UVC_BUF_EMPTY                  | 缓冲区为空<br/>                 |
| 0xA01E000F | ERR_UVC_BUF_FULL                   | 缓冲区为满<br/>                 |
| 0xA01E0010 | ERR_UVC_SYS_NOTREADY               | 系统未准备完毕<br/>             |
| 0xA01E0012 | ERR_UVC_BUSY                       | 设备忙<br/>                     |
| 0xA01E0014 | ERR_UVC_SAMESTATE                  | 状态相同（常见于状态转换）<br/> |
| 0xA01E0015 | ERR_UVC_INVALIDSTATE               | 无效的状态<br/>                 |
| 0xA01E0016 | ERR_UVC_INCORRECT_STATE_TRANSITION | 不正确的状态转换<br/>           |
| 0xA01E0017 | ERR_UVC_INCORRECT_STATE_OPERATION  | 不正确的状态操作                |