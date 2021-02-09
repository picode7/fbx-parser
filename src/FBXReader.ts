import { FBX, FBXNode, FBXProperty } from './shared'

class FBXReaderNode {
  public fbxNode: FBXNode

  constructor(fbxNode: FBXNode) {
    this.fbxNode = fbxNode
  }

  private nodeFilter(a?: string | { [index: number]: FBXProperty }, b?: { [index: number]: FBXProperty }) {
    let name: string | undefined = undefined
    let propFilter: { [index: number]: FBXProperty } | undefined = undefined
    if (typeof a === 'string') {
      name = a
      if (typeof b !== 'undefined') propFilter = b
    } else propFilter = a

    let filter: (node: FBXNode) => boolean
    if (typeof propFilter !== 'undefined') {
      let propFilterFunc = (node: FBXNode) => {
        for (const prop in propFilter) {
          const index = parseInt(prop)
          if (node.props[index] !== propFilter[index]) return false
        }
        return true
      }

      if (typeof name !== 'undefined') {
        filter = (node) => node.name === name && propFilterFunc(node)
      } else {
        filter = propFilterFunc
      }
    } else {
      filter = (node) => node.name === name
    }

    return filter
  }

  /**
   * Returns the first matching node
   * @param name filter for node name
   * @param propFilter filter for property by index and value
   */
  node(name: string, propFilter?: { [index: number]: FBXProperty }): FBXReaderNode | undefined
  node(propFilter?: { [index: number]: FBXProperty }): FBXReaderNode | undefined
  node(a?: string | { [index: number]: FBXProperty }, b?: { [index: number]: FBXProperty }): FBXReaderNode | undefined {
    const node = this.fbxNode.nodes.find(this.nodeFilter(a, b))
    if (typeof node === 'undefined') return
    return new FBXReaderNode(node)
  }

  /**
   * Returns all matching nodes
   * @param name filter for node name
   * @param propFilter filter for property by index and value
   */
  nodes(name: string, propFilter?: { [index: number]: FBXProperty }): FBXReaderNode[]
  nodes(propFilter?: { [index: number]: FBXProperty }): FBXReaderNode[]
  nodes(a?: string | { [index: number]: FBXProperty }, b?: { [index: number]: FBXProperty }): FBXReaderNode[] {
    const nodes = this.fbxNode.nodes.filter(this.nodeFilter(a, b)).map((node) => new FBXReaderNode(node))
    return nodes
  }

  /**
   * Returns the value of the property
   * @param index index of the property
   * @param type test for property type, otherwise return undefined
   */
  prop(index: number, type: 'boolean'): boolean | undefined
  prop(index: number, type: 'number'): number | undefined
  prop(index: number, type: 'bigint'): bigint | undefined
  prop(index: number, type: 'string'): string | undefined
  prop(index: number, type: 'boolean[]'): boolean[] | undefined
  prop(index: number, type: 'number[]'): number[] | undefined
  prop(index: number, type: 'bigint[]'): bigint[] | undefined
  prop(index: number): FBXProperty | undefined
  prop(
    index: number,
    type?: 'boolean' | 'number' | 'bigint' | 'string' | 'boolean[]' | 'number[]' | 'bigint[]'
  ): FBXProperty | undefined {
    const prop = this.fbxNode.props[index]
    if (typeof type === 'undefined') return prop
    if (type === 'boolean') return typeof prop === 'boolean' ? prop : undefined
    if (type === 'number') return typeof prop === 'number' ? prop : undefined
    if (type === 'bigint') return typeof prop === 'bigint' ? prop : undefined
    if (type === 'string') return typeof prop === 'string' ? prop : undefined
    // array types
    if (!Array.isArray(prop)) return undefined
    if (prop.length == 0) return prop
    if (type === 'boolean[]') return typeof prop[0] === 'boolean' ? prop : undefined
    if (type === 'number[]') return typeof prop[0] === 'number' ? prop : undefined
    if (type === 'bigint[]') return typeof prop[0] === 'bigint' ? prop : undefined
  }
}

export class FBXReader extends FBXReaderNode {
  public fbx: FBX

  constructor(fbx: FBX) {
    const rootNode: FBXNode = {
      name: '',
      props: [],
      nodes: fbx,
    }

    super(rootNode)

    this.fbx = fbx
  }
}
