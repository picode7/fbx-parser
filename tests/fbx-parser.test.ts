import * as FBX from '../src/index'

import * as fs from 'fs'
import { expect } from 'chai'

describe('Parsing', function () {
  let inputFileASCII: string
  let outputFileASCII: string
  let inputFileBinary: Uint8Array
  let inputFileBinaryUTF8: string
  let outputFileBinary: string

  before(async () => {
    inputFileASCII = await fs.readFileSync('./tests/data/ascii.fbx', 'utf8')
    outputFileASCII = await fs.readFileSync('./tests/data/ascii.json', 'utf8')
    inputFileBinary = await fs.readFileSync('./tests/data/binary.fbx')
    inputFileBinaryUTF8 = await fs.readFileSync('./tests/data/binary.fbx', 'utf-8')
    outputFileBinary = await fs.readFileSync('./tests/data/binary.json', 'utf-8')
  })

  it('ASCII file', function () {
    const result = FBX.parseText(inputFileASCII)
    const json = JSON.stringify(result, (k, v) => {
      if (typeof v === 'bigint') {
        if (v < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v.toString()
        return Number(v)
      }
      return v
    })
    // For some reason deep equal fails here without stringify/parse
    expect(JSON.parse(json)).deep.equal(JSON.parse(outputFileASCII))
  })

  it('Binary file', function () {
    const result = FBX.parseBinary(inputFileBinary)
    const json = JSON.stringify(result, (k, v) => {
      if (typeof v === 'bigint') {
        if (v < Number.MIN_SAFE_INTEGER || v > Number.MAX_SAFE_INTEGER) return v.toString()
        return Number(v)
      }
      return v
    })
    // For some reason deep equal fails here without stringify/parse
    expect(JSON.parse(json)).deep.equal(JSON.parse(outputFileBinary))
  })

  it('Empty ASCII file', function () {
    const result = FBX.parseText('')
    expect(result).deep.equal([])
  })

  it('Empty binary file', function () {
    const call = function () {
      FBX.parseBinary(new Uint8Array())
    }
    expect(call).to.throw('Not a binary FBX file')
  })
})
