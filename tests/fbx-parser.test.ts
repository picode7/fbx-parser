import * as FBX from '../src/index'

import * as fs from 'fs'
import { expect } from 'chai'

describe('Parsing', function () {
  let inputFile: string
  let outputFile: string
  before(async () => {
    inputFile = await fs.readFileSync('./tests/data/Rock_Medium_SPR.fbx', 'utf8')
  })
  before(async () => {
    outputFile = await fs.readFileSync('./tests/data/Rock_Medium_SPR.json', 'utf8')
  })
  it('Test file', function () {
    const result = FBX.parse(inputFile)
    expect(result).deep.equal(JSON.parse(outputFile))
  })

  it('Empty file', function () {
    const result = FBX.parse('')
    expect(result).equal(null)
  })
})
