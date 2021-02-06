import { FBXNode, FBXProperty } from './FBXNode'
import { BinaryReader } from '@picode/binary-reader'
import { inflate } from 'pako'

const MAGIC = Uint8Array.from('Kaydara FBX Binary\x20\x20\x00\x1a\x00'.split(''), (v) => v.charCodeAt(0))

/**
 * Returns the root node as FBXNode or null in case of an error
 * @param binary the FBX binary file content
 */
export function parse(binary: Uint8Array) {
  const data = new BinaryReader(binary)
  const magic = data.readUint8Array(MAGIC.length).every((v, i) => v === MAGIC[i])
  if (!magic) throw new Error('Not a binary FBX file')
  const fbxVersion = data.readUint32()

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

function readNode(data: BinaryReader) {
  const endOffset = data.readUint32()
  if (endOffset === 0) return null
  const numProperties = data.readUint32()
  const propertyListLen = data.readUint32()
  const nameLen = data.readUint8()
  const name = data.readArrayAsString(nameLen)

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
  while (endOffset - data.offset > 13) {
    const subnode = readNode(data)
    if (subnode !== null) node.nodes.push(subnode)
  }
  data.offset = endOffset

  return node
}

function readProperty(data: BinaryReader) {
  const typeCode = data.readUint8AsString()

  const read: { [index: string]: () => any } = {
    Y: () => data.readInt16(),
    C: () => data.readUint8AsBool(),
    I: () => data.readInt32(),
    F: () => data.readFloat32(),
    D: () => data.readFloat64(),
    L: () => data.readInt64(),
    f: () => readPropertyArray(data, (r) => r.readFloat32()),
    d: () => readPropertyArray(data, (r) => r.readFloat64()),
    l: () => readPropertyArray(data, (r) => r.readInt64()),
    i: () => readPropertyArray(data, (r) => r.readInt32()),
    b: () => readPropertyArray(data, (r) => r.readUint8AsBool()),
    S: () => data.readArrayAsString(data.readUint32()).replace('\x00\x01', '::'),
    R: () => data.readUint8Array(data.readUint32()),
  }

  if (typeof read[typeCode] === 'undefined') throw new Error(`Unknown Property Type ${typeCode.charCodeAt(0)}`)

  return read[typeCode]()
}

function readPropertyArray(data: BinaryReader, reader: (r: BinaryReader) => FBXProperty) {
  const arrayLength = data.readUint32()
  const encoding = data.readUint32()
  const compressedLength = data.readUint32()
  let arrayData = new BinaryReader(data.readUint8Array(compressedLength))

  if (encoding == 1) {
    arrayData = new BinaryReader(inflate(arrayData.binary))
  }

  const value = []
  for (let i = 0; i < arrayLength; ++i) {
    value.push(reader(arrayData))
  }

  return value
}

// Test

import * as path from 'path'
import * as fs from 'fs'

async function init() {
  // const sourceFileName = 'tests/data/binary.fbx'
  const sourceFileName = 'tests/data/binary.fbx'
  let json = parse(await fs.readFileSync(sourceFileName))

  const outFileName = path.join(
    path.dirname(sourceFileName),
    path.basename(sourceFileName, path.extname(sourceFileName)) + '.json'
  )
  fs.writeFileSync(
    outFileName,
    JSON.stringify(
      json,
      (k, v) => {
        if (typeof v === 'bigint') {
          if (v < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v.toString()
          return Number(v)
        }
        return v
      },
      2
    )
  )
}

init()
