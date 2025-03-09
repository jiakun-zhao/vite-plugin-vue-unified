import type { Element, ElementContent, Properties, Root } from 'hast'
import type { VFile } from 'vfile'
import type { Layout } from '~/types'
import { isString } from '@jiakun-zhao/utils'
import { visit } from 'unist-util-visit'

declare module 'vfile' {
  interface DataMap {
    styles: string[]
    scripts: string[]
    layout: string | Layout
    components: Record<string, string>
  }
}

function createElement(tagName: string, children: ElementContent[] = [], properties: Properties = {}): Element {
  return {
    type: 'element',
    tagName,
    children,
    properties
  }
}

export default function rehypeVue() {
  return function (tree: Root, vfile: VFile) {
    const {
      layout,
      scripts = [],
      styles = [],
      components = {},
      ...frontmatter
    } = vfile.data ?? {}

    const hasFrontmatter = Object.keys(frontmatter).length

    if (hasFrontmatter)
      scripts.unshift(`const frontmatter = ${JSON.stringify(frontmatter)}`)

    visit(tree, 'element', (node) => {
      node.tagName = components[node.tagName] ?? node.tagName
    })

    let layoutName: string | undefined
    if (layout) {
      const { type, value } = isString(layout) ? { type: 'name', value: layout } as Layout : layout
      layoutName = value
      if (type === 'file') {
        layoutName = 'UnifiedMarkdownLayout'
        scripts.unshift(`import ${layoutName} from ${JSON.stringify(value)}`)
      }
    }

    const children = tree.children.filter(it => it.type !== 'doctype')
    tree.children = [{
      type: 'element',
      tagName: 'template',
      properties: {},
      children: [],
      content: {
        type: 'root',
        children: layoutName
          ? [createElement(layoutName, children, hasFrontmatter ? { ':frontmatter': 'frontmatter' } : {})]
          : children,
      },
    }]

    if (scripts.length) {
      tree.children.unshift({
        type: 'element',
        tagName: 'script',
        properties: { setup: true },
        children: [{
          type: 'raw',
          value: scripts.join('\n'),
        }],
      })
    }

    if (styles.length) {
      tree.children.push({
        type: 'element',
        tagName: 'style',
        properties: {},
        children: [{
          type: 'raw',
          value: styles.join('\n'),
        }],
      })
    }

    return tree
  }
}
