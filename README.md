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
let fbx: FBXData
try {
  // try binary file encoding
  fbx = parseBinary(fs.readFileSync(file))
} catch (e) {
  // try text file encoding
  fbx = parseText(fs.readFileSync(file, 'utf-8'))
}
// ...
```

Using FBXReader Util

```ts
const root = new FBXReader(fbx)

// Get Settings
const upAxis = root.node('GlobalSettings')?.node('Properties70')?.node('P', { 0: 'UpAxis' })?.prop(4, 'number')

const connectionsOnRoot = root.('Connections').nodes({ 2: 0 }) || []
for (const connection of connectionsOnRoot) {
  const objectId = connection.prop(1)
}
```

Consider checking out and contributing to the [FBX](https://github.com/picode7/fbx) project (`npm install @picode/fbx`) which provides an advanced interface to use the FBX data.

```ts
import { FBX, FBXAxes } from '@picode/fbx'
import * as FBXParser from 'fbx-parser'

const fbx = new FBX(FBXParser.parse(await fs.readFileSync(fbxFile)))
const upAxes = fbx.globalSettings.getUpAxes() ?? FBXAxes.Y

const model = fbx.getModel('MyModel')

const rotKeyY = model.getRotationKey(upAxes)
const rotationsYTimes = rotKeyY?.getTime()
const rotationsYValues = rotKeyY?.getValue()
```

Direct Access

```ts
// Get Settings
const globalSettings = fbx.nodes.find((v) => v.name === 'GlobalSettings')
const properties70 = globalSettings.nodes.find((v) => v.name === 'Properties70')
const upAxis = properties70.nodes.find((v) => v.name === 'P' && v.props[0] === '"UpAxis"').properties[4]

const connections = fbx.nodes.find((v) => v.name === 'Connections')
const connectionsOnRoot = connections.nodes.filter((v) => v.props[2] === '0')
for (const connection of connectionsOnRoot) {
  const objectId = connection.props[1]
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
- <https://help.autodesk.com/view/FBX/2016/ENU/?guid=__files_GUID_2ADB9BCE_15EA_485F_87C2_32D43F2D219D_htm>

### Resources

- FBX example file <https://www.ics.uci.edu/~djp3/classes/2014_03_ICS163/tasks/arMarker/Unity/arMarker/Assets/CactusPack/Meshes/Sprites/Rock_Medium_SPR.fbx>, <https://github.com/o5h/fbx/tree/master/testdata/FBX%202013>

### Tools

- FBX Converter by Autodesk <https://www.autodesk.com/developer-network/platform-technologies/fbx-converter-archives>
