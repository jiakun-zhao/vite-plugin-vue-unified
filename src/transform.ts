import type { TransformOptions } from '~/types'
import { isString } from '@jiakun-zhao/utils'
import rehypeStringify from 'rehype-stringify'
import remarkMdc, { parseFrontMatter } from 'remark-mdc'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import rehypeBinding from '~/rehype-binding'
import rehypeVue from '~/rehype-vue'
import remarkHoist from '~/remark-hoist'

export default async function (options: string | TransformOptions) {
  const {
    code,
    id: path,
    components,
    remarkPlugins = [],
    rehypePlugins = [],
  } = isString(options) ? { code: options } : options

  const { data, content: value } = parseFrontMatter(code)
  Object.assign(data.components ??= {}, components)
  const result = await unified()
    .use(remarkParse)
    .use(remarkMdc)
    .use(remarkHoist)
    .use(remarkPlugins)
    .use(remarkRehype)
    .use(rehypeBinding)
    .use(rehypeVue)
    .use(rehypePlugins)
    .use(rehypeStringify)
    .process({ value, data, path })
  return {
    code: result.value.toString(),
    map: { mappings: '' } as const,
  }
}
