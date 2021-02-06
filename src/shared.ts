export type FBX = FBXNode[]

export interface FBXNode {
  name: string
  props: FBXProperty[]
  nodes: FBXNode[]
}

export type FBXProperty = boolean | number | BigInt | boolean[] | number[] | BigInt[] | string
