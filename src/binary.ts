import * as fs from 'fs'

/**
 * Returns the root node as FBXNode or null in case of an error
 * @param binary the FBX binary file content
 */
// based on https://code.blender.org/2013/08/fbx-binary-file-format-specification/

let debugIndent = ''
const DEBUG_INDENT = '    '

/** 'Kaydara FBX Binary  \x00' */
const MAGIC = new Uint8Array([75, 97, 121, 100, 97, 114, 97, 32, 70, 66, 88, 32, 66, 105, 110, 97, 114, 121, 32, 32, 0])

function parseBinary(binary: Uint8Array) {
  const magic = binary.subarray(0, 20).every((v, i) => v === MAGIC[i])
  const fbxVersion = byteArrayToLong(binary.subarray(23, 26))

  console.log('File:' /*magic, fbxVersion*/)

  let offset = 27
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  offset = parseNode(binary, offset)
  // seems to end with another 13 NULL bytes
  //   console.log(binary.subarray(offset).length, binary.subarray(offset), binary.subarray(offset).toString())
}

function parseNode(binary: Uint8Array, offset: number) {
  const endOffset = byteArrayToLong(binary.subarray(offset, (offset += 4)))
  const numProperties = byteArrayToLong(binary.subarray(offset, (offset += 4)))
  const propertyListLen = byteArrayToLong(binary.subarray(offset, (offset += 4)))
  const nameLen = binary[offset++].valueOf()

  const name = String.fromCharCode.apply(null, binary.subarray(offset, (offset += nameLen)) as any)

  console.log(debugIndent + 'Node:', name)
  debugIndent += DEBUG_INDENT

  for (let i = 0; i < numProperties; ++i) {
    offset = parseProperty(binary, offset)
  }

  while (endOffset - offset > 13) {
    // Nested List
    offset = parseNode(binary, offset)
  }

  debugIndent = debugIndent.substr(0, debugIndent.length - DEBUG_INDENT.length)
  return endOffset
}

function parseProperty(binary: Uint8Array, offset: number) {
  const typeCode = String.fromCharCode(binary[offset++].valueOf())
  let value: any

  // Primitive Types
  if (typeCode === 'C') {
    // 1 bit boolean (1: true, 0: false) encoded as the LSB of a 1 Byte value.
    value = binary[offset++].valueOf() !== 0
    // TODO: check..
  } else if (typeCode === 'I') {
    // 4 byte signed Integer
    value = byteArrayToLong(binary.subarray(offset, (offset += 4)))
    // TODO: check..
  } else if (typeCode === 'D') {
    // 8 byte double-precision IEEE 754 number
    value = new DataView(binary.buffer, offset, 8).getFloat64(0, true)
    offset += 8
  } else if (typeCode === 'L') {
    // 8 byte signed Integer
    value = new DataView(binary.buffer, offset, 8).getBigInt64(0, true)
    offset += 8
    // TODO: check..
  }

  // Array Types
  else if (typeCode === 'f' || typeCode === 'd' || typeCode === 'l' || typeCode === 'i' || typeCode === 'b') {
    const arrayLength = byteArrayToLong(binary.subarray(offset, (offset += 4)))
    const encoding = byteArrayToLong(binary.subarray(offset, (offset += 4)))
    const compressedLength = byteArrayToLong(binary.subarray(offset, (offset += 4)))

    if (encoding == 0) {
      if (typeCode === 'f') {
        // Array of 4 byte single-precision IEEE 754 number
        value = []
        for (let i = 0; i < arrayLength; ++i) {
          // TODO: seems wrong
          value.push(new DataView(binary.buffer, offset, 4).getFloat32(0, true))
          offset += 4
        }
      } else if (typeCode === 'd') {
        // Array of 8 byte double-precision IEEE 754 number
        value = []
        for (let i = 0; i < arrayLength; ++i) {
          value.push(new DataView(binary.buffer, offset, 8).getFloat64(0, true))
          offset += 8
        }
      } else if (typeCode === 'l') {
        // Array of 8 byte double-precision IEEE 754 number
        value = []
        for (let i = 0; i < arrayLength; ++i) {
          value.push(new DataView(binary.buffer, offset, 8).getBigInt64(0, true))
          offset += 8
        }
      } else if (typeCode === 'i') {
        // Array of 4 byte signed Integer
        value = []
        for (let i = 0; i < arrayLength; ++i) {
          value.push(new DataView(binary.buffer, offset, 4).getInt32(0, true))
          offset += 4
        }
      } else {
        // TODO: implement all known
        console.log(debugIndent + 'Property Error:', typeCode, value)
        throw new Error()
      }
    } else {
      // TODO:
      // deflate/zip-compressed buffer of length CompressedLength bytes.
      // The buffer can for example be decoded using zlib.
      console.log(debugIndent + 'deflate/zip not implemented', arrayLength / 8, encoding, compressedLength)
      offset += compressedLength
      //   throw new Error('deflate/zip not implemented')
    }
  }

  // Special types
  else if (typeCode === 'S') {
    // String
    const length = byteArrayToLong(binary.subarray(offset, (offset += 4)))
    value = String.fromCharCode.apply(null, binary.subarray(offset, (offset += length)) as any)
  } else if (typeCode === 'R') {
    // Raw binary data
    const length = byteArrayToLong(binary.subarray(offset, (offset += 4)))
    value = binary.subarray(offset, (offset += length))
  }

  // Unknown
  else {
    // TODO: implement all known
    console.log(debugIndent + 'Property Error:', typeCode, value)
    throw new Error()
  }

  console.log(debugIndent + 'Property:', typeCode, value)
  return offset // TODO:
}

async function init() {
  parseBinary(await fs.readFileSync('../tests/data/binary.fbx'))
}

let byteArrayToLong = function (byteArray: Uint8Array) {
  var value = 0
  for (var i = byteArray.length - 1; i >= 0; i--) {
    value = value * 256 + byteArray[i]
  }

  return value
}
init()
