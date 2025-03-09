import type { Root } from 'hast'
import { isString } from '@jiakun-zhao/utils'
import { map } from 'unist-util-map'

export default function rehypeBinding() {
  return function (tree: Root) {
    return map(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'binding')
        return node
      const { value } = node.properties
      return isString(value)
        ? { type: 'raw', value: `{{${value}}}` }
        : node
    }) as Root
  }
}
