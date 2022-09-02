# [flv data](https://github.com/zhuguibiao/flv-data)

在FLV文件的任何时间添加自定义脚本标记数据或元数据

[English](./README.md) | 简体中文
## 🎁 例子
撰写中...

## 🚀  使用者指南
通过npm下载安装代码

```bash
 npm install flv-data -g
```

使用flv-data运行指定文件、需要插入的数据、插入视频到的时间戳和输出目录
``` bash
flv-data -i input.flv -data test.json --t=500 -o test.flv
```  

## 📑  文档

| 输入    | 类型                       | 描述                             |
| ------- | -------------------------- | -------------------------------- |
| `-i`    | `url string`               | input file 输入的文件目录        |
| `-data` | `url string or JSONStirng` | 插入的json数据目录或者jsonStirng |
| `-t`    | `timestamp`                | 插入视频到的时间戳               |
| `-o`    | `url string`               | 输出的文件目录                   |


## 其他
[flv.js online test](http://bilibili.github.io/flv.js/demo/)
[FLV video_file_format_spec for AMF](https://rtmp.veriskope.com/pdf/video_file_format_spec_v10.pdf)
