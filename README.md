# FBX Parser for JavaScript/TypeScript

This parser will parse FBX text files and convert them into a JavaScript-Object structure.

## Installation

```bash
npm install fbx-parser
```

## Usage

```ts
parseFBX(fbxTextFileString) // returns FBXNode
```

Calling the parser will return the same raw structure of the FBX file, starting with the root node named `''`:

```ts
interface FBXNode {
  name: string
  properties: string[]
  subnodes: FBXNode[]
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
- https://archive.blender.org/wiki/index.php/User:Mont29/Foundation/FBX_File_Structure/#Animation

### Resources

- FBX example file <https://www.ics.uci.edu/~djp3/classes/2014_03_ICS163/tasks/arMarker/Unity/arMarker/Assets/CactusPack/Meshes/Sprites/Rock_Medium_SPR.fbx>
