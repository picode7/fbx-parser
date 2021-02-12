// ts-node examples/nodejs/index.ts
import * as fs from 'fs'
import { parseBinary } from '../../src'

async function init() {
  const file = './tests/data/binary.fbx'
  const fbx = parseBinary(fs.readFileSync(file))
}
init()
