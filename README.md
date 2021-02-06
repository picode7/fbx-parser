# FBX Parser for JavaScript/TypeScript

[![npm](https://img.shields.io/npm/v/fbx-parser)](https://www.npmjs.com/package/fbx-parser)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/fbx-parser)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/picode7/fbx-parser/CI)](https://github.com/picode7/fbx-parser/actions)

This parser will parse FBX text files and convert them into a JavaScript-Object structure.

## Installation

```bash
npm install fbx-parser
```

## Usage

```ts
import * as FBXParser from 'fbx-parser'

// when encoding is known
const fbx = parseText(fbxString)
const fbx = parseBinary(fbxUint8Array)

// when file encoding is unknown
import * as fs from 'fs'
const file = 'file.fbx'
let fbx: FBX
try {
  // try binary file encoding
  fbx = parse(await fs.readFileSync(file))
} catch (e) {
  // try text file encoding
  fbx = parse(await fs.readFileSync(file, 'utf-8'))
}
```

Calling the parser will return the same raw structure of the FBX file:

```ts
type FBX = FBXNode[]

interface FBXNode {
  name: string
  props: FBXProperty[]
  nodes: FBXNode[]
}

type FBXProperty = boolean | number | BigInt | boolean[] | number[] | BigInt[] | string
```

```ts
// Get Settings
const globalSettings = fbx.subnodes.find((v) => v.name === 'GlobalSettings')
const properties70 = globalSettings.subnodes.find((v) => v.name === 'Properties70')
const upAxis = properties70.subnodes.find((v) => v.name === 'P' && v.properties[0] === '"UpAxis"').properties[4]

const connections = fbx.subnodes.find((v) => v.name === 'Connections')
const connectionsOnRoot = connections.subnodes.filter((v) => v.properties[2] === '0')
for (const connection of connectionsOnRoot) {
  const objectId = connection.properties[1]
}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](/LICENSE)

## Developer Documentation

### FBX Documentation

- <https://code.blender.org/2013/08/fbx-binary-file-format-specification/>
- <https://banexdevblog.wordpress.com/2014/06/23/a-quick-tutorial-about-the-fbx-ascii-format/>
- <https://archive.blender.org/wiki/index.php/User:Mont29/Foundation/FBX_File_Structure/#Animation>
- <https://code.blender.org/2013/08/fbx-binary-file-format-specification/>
- <https://github.com/ideasman42/pyfbx_i42>

### Resources

- FBX example file <https://www.ics.uci.edu/~djp3/classes/2014_03_ICS163/tasks/arMarker/Unity/arMarker/Assets/CactusPack/Meshes/Sprites/Rock_Medium_SPR.fbx>, <https://github.com/o5h/fbx/tree/master/testdata/FBX%202013>

### Tools

- FBX Converter by Autodesk <https://www.autodesk.com/developer-network/platform-technologies/fbx-converter-archives>
