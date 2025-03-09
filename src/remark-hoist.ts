import type { Root } from 'mdast'
import type { VFile } from 'vfile'
import { objectEntries } from '@jiakun-zhao/utils'
import { visit } from 'unist-util-visit'

type Groups = Record<'scripts' | 'styles', string | undefined>

export default function remarkHoist() {
  return function (tree: Root, vfile: VFile) {
    vfile.data.scripts ??= []
    vfile.data.styles ??= []
    const RE = /<style[^>]*>(?<styles>.+?)<\/style>|<script[^>]*>(?<scripts>.+?)<\/script>/g

    visit(tree, 'html', (node) => {
      Array.from(node.value.matchAll(RE)).forEach((it) => {
        if (!it.groups)
          return
        objectEntries(it.groups as Groups).forEach(([key, value]) => {
          value && vfile.data[key]?.push(value)
        })
      })
    })
  }
}
