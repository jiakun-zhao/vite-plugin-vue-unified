import type { Plugin } from 'vite'
import type { PluginOptions } from '~/types'
import { createFilter } from 'vite'
import transformToVue from '~/transform'
import { name } from '../package.json'

export default function vitePluginMarkdown(options: PluginOptions = {}): Plugin {
  const {
    components,
    remarkPlugins,
    rehypePlugins,
    include = /\.(?:md|markdown)(?:$|\?)/,
    exclude,
  } = options

  const filter = createFilter(include, exclude)
  const transform = (code: string, id?: string) => transformToVue({ code, id, components, remarkPlugins, rehypePlugins })

  return {
    name,
    enforce: 'pre',
    async transform(code, id) {
      if (filter(id))
        return await transform(code, id)
    },
    async handleHotUpdate(ctx) {
      if (!filter(ctx.file))
        return
      const defaultRead = ctx.read
      ctx.read = async function () {
        const markdown = await defaultRead()
        const { code } = await transform(markdown, ctx.file)
        return code
      }
    },
  }
}
