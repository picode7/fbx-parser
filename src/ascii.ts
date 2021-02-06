import { FBX, FBXNode, FBXProperty } from './shared'

const enum STATE {
  expectingNodeOrClose,
  expectingPropertyListContinuation,
}

/**
 * Returns a list of FBXNodes
 * @param ascii the FBX ascii file content
 */
export function parseText(ascii: string): FBX {
  const lines = ascii.split('\n')

  const rootNode: FBXNode = {
    name: '',
    props: [],
    nodes: [],
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
        if (path.length === 1) throw 'FBX syntax error'
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

        let properties: FBXProperty[] = []
        for (const propertyString of propertyStringList) {
          const trimmed = propertyString.trim()
          if (trimmed === '') continue
          const value = convertProperty(trimmed)
          if (typeof value === 'undefined') continue
          properties.push(value)
        }
        if (propertyStringList[propertyStringList.length - 1] === '') state = STATE.expectingPropertyListContinuation

        const newNode: FBXNode = {
          name: nodeName,
          props: properties,
          nodes: [],
        }
        currentNode.nodes.push(newNode)

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

      let properties: FBXProperty[] = []
      for (const propertyString of propertyStringList) {
        const trimmed = propertyString.trim()
        if (trimmed === '' || trimmed === '}') continue
        const value = convertProperty(trimmed)
        if (typeof value === 'undefined') continue
        properties.push(value)
      }

      currentNode.props = currentNode.props.concat(properties)

      if (propertyStringList[propertyStringList.length - 1] !== '') state = STATE.expectingNodeOrClose

      if (!expectingSubnodes && state === STATE.expectingNodeOrClose) {
        path.pop()
        currentNode = path[path.length - 1]
      }
    }
  }

  // nodes with name a seem to actually just be an array prop and handled like a prop in binary
  function correctArrays(node: FBXNode) {
    if (node.nodes.length === 1 && node.props.length === 0 && node.nodes[0].name === 'a') {
      node.props = [node.nodes[0].props as any]
      node.nodes = []
    } else {
      for (const childNode of node.nodes) {
        correctArrays(childNode)
      }
    }
  }
  correctArrays(rootNode)

  return rootNode.nodes
}

/**
 * Auto detects and converts the property type
 * @param prop
 */

function convertProperty(prop: string): FBXProperty | undefined {
  if (prop[0] == '*') return undefined // e.g. array size
  if (prop[0] == '"') return prop.substr(1, prop.length - 2)
  if (prop == 'T') return true
  if (prop == 'F') return false
  if (prop == 'Y') return true
  if (prop == 'N') return false
  if (prop.indexOf('.') != -1) return parseFloat(prop)
  const n = BigInt(prop)
  if (n < Number.MIN_SAFE_INTEGER || n > Number.MAX_SAFE_INTEGER) return n
  return Number(n)
}
