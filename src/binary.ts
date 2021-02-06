import { inflate } from 'pako'

type FBXProperty = boolean | number | BigInt | boolean[] | number[] | BigInt[] | string | Uint8Array

interface FBXNode {
  name: string
  props: FBXProperty[]
  nodes: FBXNode[]
}

const MAGIC = Uint8Array.from('Kaydara FBX Binary\x20\x20\x00\x1a\x00'.split(''), (v) => v.charCodeAt(0))

/**
 * Returns the root node as FBXNode or null in case of an error
 * @param binary the FBX binary file content
 */
function parse(binary: Uint8Array) {
  const data = { binary, position: 0 }
  const magic = readByteArray(data, MAGIC.length).every((v, i) => v === MAGIC[i])
  if (!magic) throw new Error('Not a binary FBX file')
  const fbxVersion = readUInt32(data)

  const rootNode: FBXNode = {
    name: '',
    props: [],
    nodes: [],
  }

  while (true) {
    const subnode = readNode(data)
    if (subnode === null) break
    rootNode.nodes.push(subnode)
  }

  return rootNode
}

function readNode(data: Data) {
  const endOffset = readUInt32(data)
  if (endOffset === 0) return null
  const numProperties = readUInt32(data)
  const propertyListLen = readUInt32(data)
  const nameLen = readUByte(data)
  const name = readString(data, nameLen)

  const node: FBXNode = {
    name,
    props: [],
    nodes: [],
  }

  // Properties
  for (let i = 0; i < numProperties; ++i) {
    node.props.push(readProperty(data))
  }

  // Node List
  while (endOffset - data.position > 13) {
    const subnode = readNode(data)
    if (subnode !== null) node.nodes.push(subnode)
  }
  data.position = endOffset

  return node
}

function readProperty(data: Data) {
  const typeCode = readChar(data)

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

  return read[typeCode]()
}

interface Data {
  binary: Uint8Array
  position: number
}

function readUInt32(data: Data) {
  const v = new DataView(data.binary.buffer, data.binary.byteOffset + data.position, 4).getUint32(0, true)
  data.position += 4
  return v
}

function readInt16(data: Data) {
  const v = new DataView(data.binary.buffer, data.binary.byteOffset + data.position, 4).getInt16(0, true)
  data.position += 4
  return v
}

function readInt32(data: Data) {
  const v = new DataView(data.binary.buffer, data.binary.byteOffset + data.position, 4).getInt32(0, true)
  data.position += 4
  return v
}

function readInt64(data: Data) {
  const v = new DataView(data.binary.buffer, data.binary.byteOffset + data.position, 8).getBigInt64(0, true)
  data.position += 8
  return v
}

function readFloat32(data: Data) {
  const v = new DataView(data.binary.buffer, data.binary.byteOffset + data.position, 4).getFloat32(0, true)
  data.position += 4
  return v
}
function readFloat64(data: Data) {
  const v = new DataView(data.binary.buffer, data.binary.byteOffset + data.position, 8).getFloat64(0, true)
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
  const arrayData: Data = { binary: readByteArray(data, compressedLength), position: 0 }

  if (encoding == 1) {
    arrayData.binary = inflate(arrayData.binary)
  }

  const value = []
  for (let i = 0; i < arrayLength; ++i) {
    value.push(decoder(arrayData))
  }

  return value
}

// Test

import * as path from 'path'
import * as fs from 'fs'

async function init() {
  const sourceFileName = 'tests/data/binary.fbx'
  // const sourceFileName = 'tests/data/FBX 2006/cube.fbx'
  let json = parse(await fs.readFileSync(sourceFileName))

  const outFileName = path.join(
    path.dirname(sourceFileName),
    path.basename(sourceFileName, path.extname(sourceFileName)) + '.json'
  )
  fs.writeFileSync(
    outFileName,
    JSON.stringify(json, (k, v) => (typeof v === 'bigint' ? v.toString() : v), 2)
  )
}

init()
