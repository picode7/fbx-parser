interface FBXNode {
  name: string
  properties: (string | number)[]
  subnodes: FBXNode[]
}

const enum STATE {
  expectingNodeOrClose,
  expectingPropertieListContinuation,
}

function parseFBX(text: string) {
  const lines = text.split('\n')

  const rootNode: FBXNode = {
    name: '',
    properties: [],
    subnodes: [],
  }
  let currentNode: FBXNode = rootNode
  let path: FBXNode[] = [currentNode]
  let state = STATE.expectingNodeOrClose

  for (let line of lines) {
    line = line.trim()

    // Empty Line
    if (line.length === 0) continue

    // Comment Line
    if (line[0] === ';') continue

    // Depending on State (expecting sub-node or node close, expecting propertie list continuation-if line ends with a comma)
    if (state === STATE.expectingNodeOrClose) {
      // Node Close
      if (line[0] === '}') {
        // Can't close when in root node
        if (path.length === 1) throw Error()
        path.pop()
        currentNode = path[path.length - 1]
      } else {
        // find colon after the the node name
        const firstCol = line.indexOf(':')

        let nodeName = line.substring(0, firstCol)
        nodeName = nodeName.trim()

        // check end of line
        const expectingSubnodes = line[line.length - 1] === '{'

        let propertieString = line.substring(firstCol + 1, line.length - (expectingSubnodes ? 1 : 0))
        const propertieStringList = propertieString.split(',')

        let properties: (string | number)[] = []
        for (const propertieString of propertieStringList) {
          const trimmed = propertieString.trim()
          if (trimmed === '') continue
          properties.push(trimmed)
        }
        if (propertieStringList[propertieStringList.length - 1] === '') state = STATE.expectingPropertieListContinuation

        const newNode: FBXNode = {
          name: nodeName,
          properties: properties,
          subnodes: [],
        }
        currentNode.subnodes.push(newNode)

        if (expectingSubnodes || state === STATE.expectingPropertieListContinuation) {
          path.push(newNode)
          currentNode = newNode
        }
      }
    } else if (state === STATE.expectingPropertieListContinuation) {
      // check end of line
      const expectingSubnodes = line[line.length - 1] === '{'

      let propertieString = line.substring(0, line.length - (expectingSubnodes ? 1 : 0))
      const propertieStringList = propertieString.split(',')

      let properties: (string | number)[] = []
      for (const propertieString of propertieStringList) {
        const trimmed = propertieString.trim()
        if (trimmed === '') continue
        properties.push(trimmed)
      }

      currentNode.properties = currentNode.properties.concat(properties)

      if (propertieStringList[propertieStringList.length - 1] !== '') state = STATE.expectingNodeOrClose

      if (!expectingSubnodes && state === STATE.expectingNodeOrClose) {
        path.pop()
        currentNode = path[path.length - 1]
      }
    }
  }

  return rootNode
}
