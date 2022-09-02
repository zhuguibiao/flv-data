var amf0dRules = {
  0x00: amf0decNumber,
  0x01: amf0decBool,
  0x02: amf0decString,
  0x03: amf0decObject,
  //    0x04: amf0decMovie, // Reserved
  0x05: amf0decNull,
  0x06: amf0decUndefined,
  0x07: amf0decRef,
  0x08: amf0decArray,
  // 0x09: amf0decObjEnd, // Should never happen normally
  0x0A: amf0decSArray,
  0x0B: amf0decDate,
  0x0C: amf0decLongString,
  //    0x0D: amf0decUnsupported, // Has been never originally implemented by Adobe!
  //    0x0E: amf0decRecSet, // Has been never originally implemented by Adobe!
  0x0F: amf0decXmlDoc,
  0x10: amf0decTypedObj
};

var amf0eRules = {
  'string': amf0encString,
  'integer': amf0encNumber,
  'double': amf0encNumber,
  'xml': amf0encXmlDoc,
  'object': amf0encObject,
  'array': amf0encArray,
  'sarray': amf0encSArray,
  'binary': amf0encString,
  'true': amf0encBool,
  'false': amf0encBool,
  'undefined': amf0encUndefined,
  'null': amf0encNull
};

function amfType(o) {
  var jsType = typeof o;
  if (o === null) return 'null';
  if (jsType == 'undefined') return 'undefined';
  if (jsType == 'number') {
    if (parseInt(o) == o) return 'integer';
    return 'double';
  }
  if (jsType == 'boolean') return o ? 'true' : 'false';
  if (jsType == 'string') return 'string';
  if (jsType == 'object') {
    if (o instanceof Array) {
      return 'sarray';
    }
    return 'object';
  }
  throw new Error('Unsupported type!')
}

/**
* AMF0 Decode Number
* @param buf
* @returns {{len: number, value: (*|Number)}}
*/
function amf0decNumber(buf) {
  return { len: 9, value: buf.readDoubleBE(1) }
}

/**
* AMF0 Encode Number
* @param num
* @returns {Buffer}
*/
function amf0encNumber(num) {
  var buf = Buffer.alloc(9);
  buf.writeUInt8(0x00, 0);
  buf.writeDoubleBE(num, 1);
  return buf;
}

/**
* AMF0 Decode Boolean
* @param buf
* @returns {{len: number, value: boolean}}
*/
function amf0decBool(buf) {
  return { len: 2, value: (buf.readUInt8(1) != 0) }
}

/**
* AMF0 Encode Boolean
* @param num
* @returns {Buffer}
*/
function amf0encBool(num) {
  var buf = Buffer.alloc(2);
  buf.writeUInt8(0x01, 0);
  buf.writeUInt8((num ? 1 : 0), 1);
  return buf;
}

/**
* AMF0 Decode Null
* @returns {{len: number, value: null}}
*/
function amf0decNull() {
  return { len: 1, value: null }
}

/**
* AMF0 Encode Null
* @returns {Buffer}
*/
function amf0encNull() {
  var buf = Buffer.alloc(1);
  buf.writeUInt8(0x05, 0);
  return buf;
}

/**
* AMF0 Decode Undefined
* @returns {{len: number, value: undefined}}
*/
function amf0decUndefined() {
  return { len: 1, value: undefined }
}

/**
* AMF0 Encode Undefined
* @returns {Buffer}
*/
function amf0encUndefined() {
  var buf = Buffer.alloc(1);
  buf.writeUInt8(0x06, 0);
  return buf;
}

/**
* AMF0 Decode Date
* @param buf
* @returns {{len: number, value: (*|Number)}}
*/
function amf0decDate(buf) {
  //    var s16 = buf.readInt16BE(1);
  var ts = buf.readDoubleBE(3);
  return { len: 11, value: ts }
}

/**
* AMF0 Encode Date
* @param ts
* @returns {Buffer}
*/
function amf0encDate(ts) {
  var buf = Buffer.alloc(11);
  buf.writeUInt8(0x0B, 0);
  buf.writeInt16BE(0, 1);
  buf.writeDoubleBE(ts, 3);
  return buf;
}

/**
* AMF0 Decode Object
* @param buf
* @returns {{len: number, value: {}}}
*/
function amf0decObject(buf) { // TODO: Implement references!
  var obj = {};
  var iBuf = buf.subarray(1);
  var len = 1;
  while (iBuf.readUInt8(0) != 0x09) {
    var prop = amf0decUString(iBuf);
    len += prop.len;
    if (iBuf.subarray(prop.len).readUInt8(0) == 0x09) {
      len++;
      break;
    }
    if (prop.value == '') break;
    var val = amf0DecodeOne(iBuf.subarray(prop.len));
    obj[prop.value] = val.value;
    len += val.len;
    iBuf = iBuf.subarray(prop.len + val.len);
  }
  return { len: len, value: obj }
}

/**
* AMF0 Encode Object
*/
function amf0encObject(o) {
  if (typeof o !== 'object') return;

  var data = Buffer.alloc(1);
  data.writeUInt8(0x03, 0); // Type object
  var k;
  for (k in o) {
    data = Buffer.concat([data, amf0encUString(k), amf0EncodeOne(o[k])]);
  }
  var termCode = Buffer.alloc(1);
  termCode.writeUInt8(0x09, 0);
  return Buffer.concat([data, amf0encUString(''), termCode]);
}

/**
* AMF0 Decode Reference
* @param buf
* @returns {{len: number, value: string}}
*/
function amf0decRef(buf) {
  var index = buf.readUInt16BE(1);
  return { len: 3, value: 'ref' + index }
}

/**
* AMF0 Encode Reference
* @param index
* @returns {Buffer}
*/
function amf0encRef(index) {
  var buf = Buffer.alloc(3);
  buf.writeUInt8(0x07, 0);
  buf.writeUInt16BE(index, 1);
  return buf;
}

/**
* AMF0 Decode String
* @param buf
* @returns {{len: *, value: (*|string|String)}}
*/
function amf0decString(buf) {
  var sLen = buf.readUInt16BE(1);
  return { len: 3 + sLen, value: buf.toString('utf8', 3, 3 + sLen) }
}

/**
* AMF0 Decode Untyped (without the type byte) String
* @param buf
* @returns {{len: *, value: (*|string|String)}}
*/
function amf0decUString(buf) {
  var sLen = buf.readUInt16BE(0);
  return { len: 2 + sLen, value: buf.toString('utf8', 2, 2 + sLen) }
}

/**
* Do AMD0 Encode of Untyped String
* @param s
* @returns {Buffer}
*/
function amf0encUString(s) {
  var data = Buffer.from(s, 'utf8');
  var sLen = Buffer.alloc(2);
  sLen.writeUInt16BE(data.length, 0);
  return Buffer.concat([sLen, data]);
}

/**
* AMF0 Encode String
* @param str
* @returns {Buffer}
*/
function amf0encString(str) {
  var buf = Buffer.alloc(3);
  buf.writeUInt8(0x02, 0);
  buf.writeUInt16BE(str.length, 1);
  return Buffer.concat([buf, Buffer.from(str, 'utf8')]);
}

/**
* AMF0 Decode Long String
* @param buf
* @returns {{len: *, value: (*|string|String)}}
*/
function amf0decLongString(buf) {
  var sLen = buf.readUInt32BE(1);
  return { len: 5 + sLen, value: buf.toString('utf8', 5, 5 + sLen) }
}

/**
* AMF0 Encode Long String
* @param str
* @returns {Buffer}
*/
function amf0encLongString(str) {
  var buf = Buffer.alloc(5);
  buf.writeUInt8(0x0C, 0);
  buf.writeUInt32BE(str.length, 1);
  return Buffer.concat([buf, Buffer.from(str, 'utf8')]);
}

/**
* AMF0 Decode Array
* @param buf
* @returns {{len: *, value: ({}|*)}}
*/
function amf0decArray(buf) {
  //    var count = buf.readUInt32BE(1);
  var obj = amf0decObject(buf.subarray(4));
  return { len: 5 + obj.len, value: obj.value }
}

/**
* AMF0 Encode Array
*/
function amf0encArray(a) {
  var l = 0;
  if (a instanceof Array) l = a.length; else l = Object.keys(a).length;
  var buf = Buffer.alloc(5);
  buf.writeUInt8(8, 0);
  buf.writeUInt32BE(l, 1);
  var data = amf0encObject(a);
  return Buffer.concat([buf, data.subarray(1)]);
}

/**
* AMF0 Encode Binary Array into binary Object
* @param aData
* @returns {Buffer}
*/
function amf0cnvArray2Object(aData) {
  var buf = Buffer.alloc(1);
  buf.writeUInt8(0x3, 0); // Object id
  return Buffer.concat([buf, aData.subarray(5)]);
}

/**
* AMF0 Encode Binary Object into binary Array
* @param oData
* @returns {Buffer}
*/
function amf0cnvObject2Array(oData) {
  var buf = Buffer.alloc(5);
  var o = amf0decObject(oData);
  var l = Object.keys(o).length;
  buf.writeUInt32BE(l, 1);
  return Buffer.concat([buf, oData.subarray(1)]);
}

/**
* AMF0 Decode XMLDoc
* @param buf
* @returns {{len: *, value: (*|string|String)}}
*/
function amf0decXmlDoc(buf) {
  var sLen = buf.readUInt16BE(1);
  return { len: 3 + sLen, value: buf.toString('utf8', 3, 3 + sLen) }
}

/**
* AMF0 Encode XMLDoc
* @param str
* @returns {Buffer}
*/
function amf0encXmlDoc(str) {
  var buf = Buffer.alloc(3);
  buf.writeUInt8(0x0F, 0);
  buf.writeUInt16BE(str.length, 1);
  return Buffer.concat([buf, Buffer.from(str, 'utf8')]);
}

/**
* AMF0 Decode Strict Array
* @param buf
* @returns {{len: number, value: Array}}
*/
function amf0decSArray(buf) {
  var a = [];
  var len = 5;
  var ret;
  for (var count = buf.readUInt32BE(1); count; count--) {
    ret = amf0DecodeOne(buf.subarray(len));
    a.push(ret.value);
    len += ret.len;
  }
  return { len: len, value: amf0markSArray(a) }
}

/**
* AMF0 Encode Strict Array
* @param a Array
*/
function amf0encSArray(a) {
  var buf = Buffer.alloc(5);
  buf.writeUInt8(0x0A, 0);
  buf.writeUInt32BE(a.length, 1);
  var i;
  for (i = 0; i < a.length; i++) {
    buf = Buffer.concat([buf, amf0EncodeOne(a[i])]);
  }
  return buf;
}

function amf0markSArray(a) {
  Object.defineProperty(a, 'sarray', { value: true });
  return a;
}

/**
* AMF0 Decode Typed Object
* @param buf
* @returns {{len: number, value: ({}|*)}}
*/
function amf0decTypedObj(buf) {
  var className = amf0decString(buf);
  var obj = amf0decObject(buf.subarray(className.len - 1));
  obj.value.__className__ = className.value;
  return { len: className.len + obj.len - 1, value: obj.value }
}

/**
* AMF0 Encode Typed Object
*/
function amf0encTypedObj() {
  throw new Error("Error: SArray encoding is not yet implemented!"); // TODO: Error
}

/**
* Decode one value from the Buffer according to the applied rules
* @param rules
* @param buffer
* @returns {*}
*/
function amfXDecodeOne(rules, buffer) {
  if (!rules[buffer.readUInt8(0)]) {
    console.log('Unknown field', buffer.readUInt8(0));
    throw new Error("Error: Unknown field");
  }
  return rules[buffer.readUInt8(0)](buffer);
}

/**
* Decode one AMF0 value
* @param buffer
* @returns {*}
*/
function amf0DecodeOne(buffer) {
  return amfXDecodeOne(amf0dRules, buffer);
}

/**
* Decode a buffer of AMF0 values
* @param buffer
* @returns {Array}
*/
function amf0Decode(buffer) {
  return amfXDecode(amf0dRules, buffer);
}

/**
* Encode one AMF value according to rules
* @param rules
* @param o
* @returns {*}
*/
function amfXEncodeOne(rules, o) {
  var f = rules[amfType(o)];
  if (f) return f(o)
  // throw new Error('Unsupported type for encoding!');
}

/**
* Encode one AMF0 value
* @param o
* @returns {*}
*/
function amf0EncodeOne(o) {
  return amfXEncodeOne(amf0eRules, o);
}

/**
* Encode an array of values into a buffer
* @param a
* @returns {Buffer}
*/
function amf0Encode(a) {
  var buf = Buffer.alloc(0);
  a.forEach(function (o) {
    buf = Buffer.concat([buf, amf0EncodeOne(o)]);
  });
  return buf;
}

/**
 * {
 *    tagName: {
 *      a:1,
 *      b:{c:1}
 *    }
 * }
 * @param o 
 * @returns {Buffer}
 */
function encodeflvTagData(o) {
  var targetName = Object.keys(o)[0]
  var targetNameBuf = amf0encString(targetName)
  var bodyBuf = amf0Encode([o[targetName]])
  var targetEndBuf = Buffer.alloc(3)
  targetEndBuf[2] = 9
  return Buffer.concat([targetNameBuf, bodyBuf, targetEndBuf])
}

module.exports = {
  encodeflvTagData: encodeflvTagData,
  amfType: amfType,
  amf0Encode: amf0Encode,
  amf0EncodeOne: amf0EncodeOne,
  amf0Decode: amf0Decode,
  amf0DecodeOne: amf0DecodeOne,
  amf0cnvA2O: amf0cnvArray2Object,
  amf0cnvO2A: amf0cnvObject2Array,
  amf0markSArray: amf0markSArray,
  amf0decArray: amf0decArray,
  amf0decBool: amf0decBool,
  amf0decDate: amf0decDate,
  amf0decLongString: amf0decLongString,
  amf0decNull: amf0decNull,
  amf0decNumber: amf0decNumber,
  amf0decObject: amf0decObject,
  amf0decRef: amf0decRef,
  amf0decSArray: amf0decSArray,
  amf0decString: amf0decString,
  amf0decTypedObj: amf0decTypedObj,
  amf0decUndefined: amf0decUndefined,
  amf0decXmlDoc: amf0decXmlDoc,
  amf0encArray: amf0encArray,
  amf0encBool: amf0encBool,
  amf0encDate: amf0encDate,
  amf0encLongString: amf0encLongString,
  amf0encNull: amf0encNull,
  amf0encNumber: amf0encNumber,
  amf0encObject: amf0encObject,
  amf0encRef: amf0encRef,
  amf0encSArray: amf0encSArray,
  amf0encString: amf0encString,
  amf0encTypedObj: amf0encTypedObj,
  amf0encUndefined: amf0encUndefined,
  amf0encXmlDoc: amf0encXmlDoc,
};