import * as fs from 'fs'

/**
 * Returns the root node as FBXNode or null in case of an error
 * @param binary the FBX binary file content
 */
// based on https://code.blender.org/2013/08/fbx-binary-file-format-specification/

// TODO: check https://github.com/ideasman42/pyfbx_i42

// cube from https://github.com/o5h/fbx/tree/master/testdata/FBX%202013

let debugIndent = ''
const DEBUG_INDENT = '    '
let log = ''

interface Data {
  binary: Uint8Array
  position: number
}

function readUInt32(data: Data) {
  const v = new DataView(data.binary.buffer, data.position, 4).getUint32(0, true)
  data.position += 4
  return v
}

function readInt16(data: Data) {
  const v = new DataView(data.binary.buffer, data.position, 4).getInt16(0, true)
  data.position += 4
  return v
}

function readInt32(data: Data) {
  const v = new DataView(data.binary.buffer, data.position, 4).getInt32(0, true)
  data.position += 4
  return v
}

function readInt64(data: Data) {
  const v = new DataView(data.binary.buffer, data.position, 8).getBigInt64(0, true)
  data.position += 8
  return v
}

function readFloat32(data: Data) {
  const v = new DataView(data.binary.buffer, data.position, 4).getFloat32(0, true)
  data.position += 4
  return v
}
function readFloat64(data: Data) {
  const v = new DataView(data.binary.buffer, data.position, 8).getFloat64(0, true)
  data.position += 8
  return v
}

function readUByte(data: Data) {
  return data.binary[data.position++].valueOf()
}

function readString(data: Data, length: number) {
  return String.fromCharCode.apply(null, data.binary.subarray(data.position, (data.position += length)) as any)
}

function readByteArray(data: Data, length: number) {
  return data.binary.subarray(data.position, (data.position += length))
}

function readChar(data: Data) {
  return String.fromCharCode(data.binary[data.position++].valueOf())
}

function readBoolByte(data: Data) {
  return data.binary[data.position++].valueOf() !== 0
}

function readPropertyArray(data: Data, decoder: (data: Data) => any) {
  const arrayLength = readUInt32(data)
  const encoding = readUInt32(data)
  const compressedLength = readUInt32(data)

  if (encoding === 1) {
    data.position += compressedLength
    return
    // throw new Error('Compression not supported') // TODO:
  }

  const value = []
  for (let i = 0; i < arrayLength; ++i) {
    value.push(decoder(data))
  }
  return value
}

/** 'Kaydara FBX Binary\x20\x20\x00\x1a\x00' */
const MAGIC = new Uint8Array([
  75,
  97,
  121,
  100,
  97,
  114,
  97,
  32,
  70,
  66,
  88,
  32,
  66,
  105,
  110,
  97,
  114,
  121,
  32,
  32,
  0,
  26,
  0,
])

function parse(binary: Uint8Array) {
  const data = { binary, position: 0 }
  const magic = readByteArray(data, MAGIC.length).every((v, i) => v === MAGIC[i])
  if (!magic) throw new Error('Not a binary FBX file')

  const fbxVersion = readUInt32(data)
  log += `${debugIndent}File: ${fbxVersion}\n`
  while (readNode(data) !== null) {}
}

function readNode(data: Data) {
  const endOffset = readUInt32(data)
  if (endOffset === 0) return null
  const numProperties = readUInt32(data)
  const propertyListLen = readUInt32(data)
  const nameLen = readUByte(data)
  const name = readString(data, nameLen)

  log += `${debugIndent}Node: ${name}\n`
  debugIndent += DEBUG_INDENT

  // Properties
  for (let i = 0; i < numProperties; ++i) {
    readProperty(data)
  }

  // Node List
  while (endOffset - data.position > 13) {
    readNode(data)
  }

  debugIndent = debugIndent.substr(0, debugIndent.length - DEBUG_INDENT.length)
  data.position = endOffset
  return endOffset
}

function readProperty(data: Data) {
  const typeCode = readChar(data)
  let value: any

  const read: { [index: string]: () => any } = {
    Y: () => readInt16(data),
    C: () => readBoolByte(data),
    I: () => readInt32(data),
    F: () => readFloat32(data),
    D: () => readFloat64(data),
    L: () => readInt64(data),
    f: () => readPropertyArray(data, readFloat32),
    d: () => readPropertyArray(data, readFloat64),
    l: () => readPropertyArray(data, readInt64),
    i: () => readPropertyArray(data, readInt32),
    b: () => readPropertyArray(data, readBoolByte),
    S: () => readString(data, readUInt32(data)).replace('\x00\x01', '::'),
    R: () => readByteArray(data, readUInt32(data)),
  }

  if (typeof read[typeCode] === 'undefined') throw new Error('Unknown Property Type')

  value = read[typeCode]()

  log += `${debugIndent}Property: ${typeCode} ${JSON.stringify(value, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  )}\n`
}

import * as path from 'path'
async function init() {
  log = ''
  const sourceFileName = 'tests/data/binary.fbx'
  // const sourceFileName = 'tests/data/FBX 2006/cube.fbx'
  parse(await fs.readFileSync(sourceFileName))

  const outFileName = path.join(
    path.dirname(sourceFileName),
    path.basename(sourceFileName, path.extname(sourceFileName)) + '.txt'
  )
  fs.writeFileSync(outFileName, log)
}

init()
