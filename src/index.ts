interface FBXNode {
  name: string
  properties: string[]
  subnodes: FBXNode[]
}

const enum STATE {
  expectingNodeOrClose,
  expectingPropertyListContinuation,
}

/**
 * Returns the root node as FBXNode or null in case of an error
 * @param text the FBX text file content
 */
export function parse(text: string) {
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

    // Depending on State (expecting sub-node or node close, expecting property list continuation-if line ends with a comma)
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

        let propertyString = line.substring(firstCol + 1, line.length - (expectingSubnodes ? 1 : 0))
        const propertyStringList = propertyString.split(',')

        let properties: string[] = []
        for (const propertyString of propertyStringList) {
          const trimmed = propertyString.trim()
          if (trimmed === '') continue
          properties.push(trimmed)
        }
        if (propertyStringList[propertyStringList.length - 1] === '') state = STATE.expectingPropertyListContinuation

        const newNode: FBXNode = {
          name: nodeName,
          properties: properties,
          subnodes: [],
        }
        currentNode.subnodes.push(newNode)

        if (expectingSubnodes || state === STATE.expectingPropertyListContinuation) {
          path.push(newNode)
          currentNode = newNode
        }
      }
    } else if (state === STATE.expectingPropertyListContinuation) {
      // check end of line
      const expectingSubnodes = line[line.length - 1] === '{'

      let propertyString = line.substring(0, line.length - (expectingSubnodes ? 1 : 0))
      const propertyStringList = propertyString.split(',')

      let properties: string[] = []
      for (const propertyString of propertyStringList) {
        const trimmed = propertyString.trim()
        if (trimmed === '') continue
        properties.push(trimmed)
      }

      currentNode.properties = currentNode.properties.concat(properties)

      if (propertyStringList[propertyStringList.length - 1] !== '') state = STATE.expectingNodeOrClose

      if (!expectingSubnodes && state === STATE.expectingNodeOrClose) {
        path.pop()
        currentNode = path[path.length - 1]
      }
    }
  }

  return rootNode
}
