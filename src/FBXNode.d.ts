export type FBXProperty = boolean | number | BigInt | boolean[] | number[] | BigInt[] | string | Uint8Array

export interface FBXNode {
  name: string
  props: FBXProperty[]
  nodes: FBXNode[]
}
