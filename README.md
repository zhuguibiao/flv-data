# flv data&middot; [![npm version](https://img.shields.io/npm/v/flv-data)](https://www.npmjs.com/package/flv-data)

add custom script tag data or metadata at any time of the FLV file

English | [简体中文](./README.zh-CN.md)

## Why Do It？
There is an **FLV live stream** in my project, and the result of algorithm analysis needs to be displayed **in real time**. Therefore, I will add custom **script tag** data to each frame of the FLV file, and then display it.

## Demo
[flv-data online demo](https://zhuguibiao.github.io/flv-data)

## Usage Instructions
npm / yarn / pnpm

```bash
# Using npm
npm install flv-data -g

# Using yarn
yarn global add flv-data

# Using pnpm
pnpm install flv-data -g
```

flv-data run demo
``` bash
flv-data -i input.flv -data test.json --t=1000 -o test.flv
```  

## API

| Field   | Type                       | Description                      |
| ------- | -------------------------- | -------------------------------- |
| `-i`    | `url string`               | input file url|
| `-data` | `url string or JSONString` | metadata, is json url  or JSONString |
| `-t`    | `timestamp`                | video timestamp |
| `-o`    | `url string`               | output file url


## Other
[flv.js online test](http://bilibili.github.io/flv.js/demo/)

[FLV video_file_format_spec for AMF](https://rtmp.veriskope.com/pdf/video_file_format_spec_v10.pdf)
## License
Remult is [MIT Licensed](./LICENSE)
