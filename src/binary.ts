import { FBXNode, FBXProperty, FBXData } from './shared'
import { BinaryReader } from '@picode/binary-reader'
import { inflate } from 'pako'

const MAGIC = Uint8Array.from('Kaydara FBX Binary\x20\x20\x00\x1a\x00'.split(''), (v) => v.charCodeAt(0))

// For debug purposes:
// const IND = '  '
// let ind = ''

/**
 * Returns a list of FBXNodes
 * @param binary the FBX binary file content
 */
export function parseBinary(binary: Uint8Array): FBXData {
  if (binary.length < MAGIC.length) throw 'Not a binary FBX file'
  const data = new BinaryReader(binary)
  const magic = data.readUint8Array(MAGIC.length).every((v, i) => v === MAGIC[i])
  if (!magic) throw 'Not a binary FBX file'
  const fbxVersion = data.readUint32()

  // console.log(`FBX Version: ${fbxVersion}`)
  const header64 = fbxVersion >= 7500

  const fbx: FBXData = []

  while (true) {
    const subnode = readNode(data, header64)
    if (subnode === null) break
    fbx.push(subnode)
  }

  return fbx
}

function readNode(data: BinaryReader, header64: boolean) {
  const endOffset = header64 ? Number(data.readUint64()) : data.readUint32()
  if (endOffset === 0) return null
  const numProperties = header64 ? Number(data.readUint64()) : data.readUint32()
  const propertyListLen = header64 ? Number(data.readUint64()) : data.readUint32()
  const nameLen = data.readUint8()
  const name = data.readArrayAsString(nameLen)

  const node: FBXNode = {
    name,
    props: [],
    nodes: [],
  }

  // console.log(`${ind}Node offset ${data.offset}:`, endOffset, numProperties, propertyListLen, nameLen, `"${name}"`)
  // ind += IND

  // Properties
  for (let i = 0; i < numProperties; ++i) {
    node.props.push(readProperty(data))
  }

  // Node List
  while (endOffset - data.offset > 13) {
    const subnode = readNode(data, header64)
    if (subnode !== null) node.nodes.push(subnode)
  }
  data.offset = endOffset

  // ind = ind.substr(0, ind.length - IND.length)

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
    S: () => data.readArrayAsString(data.readUint32()),
    R: () => Array.from(data.readUint8Array(data.readUint32())),
  }

  if (typeof read[typeCode] === 'undefined') throw `Unknown Property Type ${typeCode.charCodeAt(0)}`

  let value = read[typeCode]()

  // convert BigInt when ever possible
  const convertBigInt = (v: number) => {
    if (value < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v
    return Number(v)
  }
  if (typeCode === 'L') {
    value = convertBigInt(value)
  } else if (typeCode === 'l') {
    for (let i = 0; i < value.length; ++i) {
      value[i] = convertBigInt(value[i])
    }
  }

  // replace '\x00\x01' by '::' and flip like in the text files
  if (typeCode === 'S' && value.indexOf('\x00\x01') != -1) {
    value = (value as string).split('\x00\x01').reverse().join('::')
  }

  return value
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
