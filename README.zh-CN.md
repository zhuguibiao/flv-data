# flv data&middot; [![npm version](https://img.shields.io/npm/v/flv-data)](https://www.npmjs.com/package/flv-data)

在FLV文件的任何时间添加自定义脚本标记数据或元数据

[English](./README.md) | 简体中文
## 为什么做这个
项目中有一个**FLV直播流**，需要**实时显示算法分析结果画面**，因此，我要在FLV文件的每一帧添加自定义的**script tag** data，然后去展示他。
## 🎁 例子
[flv-data 在线demo](https://zhuguibiao.github.io/flv-data)

## 🚀 使用者指南
通过npm / yarn / pnpm下载安装代码

```bash
# 使用 npm
npm install flv-data -g

# 使用 yarn
yarn global add flv-data

# 使用 pnpm
pnpm install flv-data -g
```

使用flv-data运行指定文件、需要插入的数据、插入视频到的时间戳和输出目录
``` bash
flv-data -i input.flv -data test.json --t=1000 -o test.flv
```  

## 📑 文档

| 输入    | 类型                       | 描述                             |
| ------- | -------------------------- | -------------------------------- |
| `-i`    | `url string`               | input file 输入的文件目录        |
| `-data` | `url string or JSONString` | 插入的json数据目录或者JSONString |
| `-t`    | `timestamp`                | 插入视频到的时间戳               |
| `-o`    | `url string`               | 输出的文件目录                   |


## 其他
[flv.js 在线测试](http://bilibili.github.io/flv.js/demo/)

[FLV格式说明 video_file_format_spec for AMF](https://rtmp.veriskope.com/pdf/video_file_format_spec_v10.pdf)
