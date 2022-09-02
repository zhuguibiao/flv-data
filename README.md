# flv data&middot; [![npm version](https://img.shields.io/npm/v/flv-data)](https://www.npmjs.com/package/flv-data)

add custom script tag data or metadata at any time of the FLV file

English | [简体中文](./README.zh-CN.md)

##  demo
writing...

## Usage Instructions
npm

```bash
npm install flv-data -g
```

flv-data run demo
``` bash
flv-data -i input.flv -data test.json --t=500 -o test.flv
```  

## API

| Field   | Type                       | Description                      |
| ------- | -------------------------- | -------------------------------- |
| `-i`    | `url string`               | input file url|
| `-data` | `url string or JSONStirng` | metadata, is json url  or JSONStirng |
| `-t`    | `timestamp`                | video timestamp |
| `-o`    | `url string`               | output file url


## other
[flv.js online test](http://bilibili.github.io/flv.js/demo/)



[FLV video_file_format_spec for AMF](https://rtmp.veriskope.com/pdf/video_file_format_spec_v10.pdf)
