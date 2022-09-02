#!/usr/bin/env node
const fs = require('fs')
const Utils = require('./utils.js')
const parseArgs = require('minimist')
const ora = require('ora');
const spinner = ora('Loading...');

const options = parseArgs(process.argv.slice(2), {
  default: {
    i: './input.flv',
    data: './test.json',
    t: 0,
    o: './test.flv'
  },
});
const { inputUrl, outputUrl, jsonData, timestamp } = handleOptions(options)

try {
  spinner.start('read file');
  const inputFile = fs.readFileSync(inputUrl);
  spinner.succeed('read file success')

  parseChunks(new Uint8Array(inputFile).buffer).then(videoInfoList => {
    let curTime = timestamp
    let index = findTimeStampIndex(curTime, videoInfoList)
    // if time > video end time => time=video end time
    if (index === videoInfoList.length) {
      curTime = videoInfoList[index - 1].timestamp
      index = videoInfoList.length - 1
    }
    writeFlvFile(inputFile, videoInfoList[index].offset, addScriptTagData(jsonData, curTime))
  })
} catch (err) {
  spinner.fail('read error: ' + err)
}

/**
 * @param chunk 
 * @returns promise
 */
function parseChunks(chunk) {
  if (new Uint8Array(chunk)[0] !== 70) {
    throw new Error('expected flv file, please check it');
  }
  return new Promise((resolve, reject) => {
    let offset = 13;
    const videoInfoList = [];

    while (offset < chunk.byteLength) {
      let vB = Buffer.from(chunk)
      if (offset + 11 + 4 > chunk.byteLength) {
        break;
      }
      let tagType = vB.readUInt8(offset, 1);
      let dataSize = vB.readUIntBE(offset + 1, 3);
      if (offset + 11 + dataSize + 4 > chunk.byteLength) {
        break;
      }
      let timestamp = vB.readUIntBE(offset + 4, 3);
      let streamId = vB.readUIntBE(offset + 7, 1);

      switch (tagType) {
        case 8:  // Audio  TODO: do some Audio edit
          break;
        case 9:  // Video
          videoInfoList.push({ offset, dataSize: dataSize, timestamp, streamId, tagType })
          break;
        case 18:  // ScriptDataObject  TODO: do some ScriptDataObject edit
          break;
      }
      offset += 11 + dataSize + 4;  // tagBody + dataSize + prevTagSize
    }
    resolve(videoInfoList)
  })
}

/**
 * 
 * @param {*} dataJson 
 * @param {*} timeStamp 
 * @param {*} streamId 
 * @param {*} timestampExtrended 
 * @return {Buffer}
 *  tag header 
  * tagType            1byte
  * datasize           3byte 
  * timeStamp          3byte
  * timestampExtrended 1byte   
  * streamId           3byte
  * tag Header 11 bit lengrh
  * tag-bodysize === datasize
 */
function addScriptTagData(dataJson, timeStamp = 0, streamId = 0, timestampExtrended = 0) {
  // tag body
  const tagBodyBuffer = Utils.encodeflvTagData(dataJson)
  let tagHeaderBuffer = Buffer.alloc(11)
  // tag
  tagHeaderBuffer.writeInt8(18, 0)
  // datasize
  tagHeaderBuffer.writeUIntBE(tagBodyBuffer.length, 1, 3)
  // timeStamp
  tagHeaderBuffer.writeUIntBE(timeStamp, 4, 3)
  // timestampExtrended
  tagHeaderBuffer.writeUIntBE(timestampExtrended, 7, 1)
  // streamId
  tagHeaderBuffer.writeUIntBE(streamId, 8, 3)
  // prev tag size
  let prevTagBuffer = Buffer.alloc(4)
  prevTagBuffer.writeInt32BE(tagBodyBuffer.length + 11, 0)
  let tagAllBuffer = Buffer.concat([tagHeaderBuffer, tagBodyBuffer, prevTagBuffer])
  return tagAllBuffer
}

function writeFlvFile(inputFile, offset, centerBuffer) {
  let inpBuf = Buffer.from(inputFile)
  let sliceLeft = inpBuf.subarray(0, offset)
  let sliceRight = inpBuf.subarray(offset, inpBuf.length)
  try {
    spinner.start('write file start')
    fs.writeFileSync(outputUrl, Buffer.concat([sliceLeft, centerBuffer, sliceRight]));
    spinner.succeed('write file succeed')
  }
  catch (err) {
    spinner.fail('error: ' + err)
  }
}

/**
 * Binary Search
 * @param {*} target 
 * @param {*} list 
 * @returns index
 */
function findTimeStampIndex(target, list) {
  const length = list.length;
  if (!target) return 1
  if (list[length - 1].timestamp < target) {
    return length;
  }
  let left = 0;
  let right = length - 1;
  while (left < right) {
    let mid = (left + right) >>> 1;
    if (target > list[mid].timestamp) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return right;
}

function handleOptions(options) {
  if (!options.i) {
    throw new Error('no input file')
  }
  options.inputUrl = options.i;
  options.outputUrl = options.o;
  if (options.data.indexOf('.json') > -1) {
    options.jsonData = require(options.data)
  } else {
    options.jsonData = JSON.parse(options.data)
  }
  options.timestamp = options.t;
  return options
}
