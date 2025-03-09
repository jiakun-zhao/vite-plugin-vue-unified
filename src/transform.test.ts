import { toArray } from '@jiakun-zhao/utils'
import { stringifyFrontMatter } from 'remark-mdc'
import { describe, expect, it } from 'vitest'
import transform from '~/transform'

describe('layout', () => {
  it('string', async () => {
    const code = await handle({
      frontmatter: {
        layout: 'MarkdownLayout',
      },
    })
    expect(code).toMatchInlineSnapshot(`
      "<template>
      <MarkdownLayout><p><ProseA href="https://example.com">Link</ProseA></p>
      <h1>heading</h1></MarkdownLayout>
      </template>
      "
    `)
  })

  it('name', async () => {
    const code = await handle({
      frontmatter: {
        layout: {
          type: 'name',
          value: 'MarkdownLayout',
        },
      },
    })
    expect(code).toMatchInlineSnapshot(`
      "<template>
      <MarkdownLayout><p><ProseA href="https://example.com">Link</ProseA></p>
      <h1>heading</h1></MarkdownLayout>
      </template>
      "
    `)
  })

  it('file', async () => {
    const code = await handle({
      frontmatter: {
        layout: {
          type: 'file',
          value: 'path/to/component',
        },
      },
    })
    expect(code).toMatchInlineSnapshot(`
      "<script setup>
      import UnifiedMarkdownLayout from "path/to/component"
      </script>
      <template>
      <UnifiedMarkdownLayout><p><ProseA href="https://example.com">Link</ProseA></p>
      <h1>heading</h1></UnifiedMarkdownLayout>
      </template>
      "
    `)
  })
})

describe('vue', () => {
  it('frontmatter', async () => {
    const code = await handle({
      frontmatter: {
        title: 'Markdown Test',
        scripts: [
          'console.log("HelloWorld")',
        ],
        styles: [
          ':root{color-schema:light dark}',
        ],
      },
    })
    expect(code).toMatchInlineSnapshot(`
      "<script setup>
      const frontmatter = {"title":"Markdown Test"}
      console.log("HelloWorld")
      </script>
      <template>
      <p><ProseA href="https://example.com">Link</ProseA></p>
      <h1>heading</h1>
      </template>
      <style>
      :root{color-schema:light dark}
      </style>
      "
    `)
  })

  it('hoist', async () => {
    const code = await handle({
      frontmatter: {
        styles: [
          ':root{color-schema:light dark}',
        ],
      },
      content: [
        '# heading',
        '<style>html{color:#954}</style>',
        '<style lang="scss">body{color:#954}</style>',
        '<script>console.log("HelloWorld")</script>',
      ],
    })
    expect(code).toMatchInlineSnapshot(`
      "<script setup>
      console.log("HelloWorld")
      </script>
      <template>
      <h1>heading</h1>
      </template>
      <style>
      :root{color-schema:light dark}
      html{color:#954}
      body{color:#954}
      </style>
      "
    `)
  })
})

describe('component', () => {
  it('default', async () => {
    const code = await handle()
    expect(code).toMatchInlineSnapshot(`
      "<template>
      <p><ProseA href="https://example.com">Link</ProseA></p>
      <h1>heading</h1>
      </template>
      "
    `)
  })

  it('transform with frontmatter', async () => {
    const code = await handle({ frontmatter: { components: { h1: 'ProseH1' } } })
    expect(code).toMatchInlineSnapshot(`
      "<template>
      <p><ProseA href="https://example.com">Link</ProseA></p>
      <ProseH1>heading</ProseH1>
      </template>
      "
    `)
  })

  it('remark-mdc', async () => {
    const code = await handle({ content: ':inline-component' })
    expect(code).toMatchInlineSnapshot(`
      "<template>
      <inline-component></inline-component>
      </template>
      "
    `)

    const withFrontmatter = await handle({
      frontmatter: {
        scripts: [
          'import InlineComponent from "./InlineComponent.vue"',
        ],
      },
      content: ':inline-component',
    })
    expect(withFrontmatter).toMatchInlineSnapshot(`
      "<script setup>
      import InlineComponent from "./InlineComponent.vue"
      </script>
      <template>
      <inline-component></inline-component>
      </template>
      "
    `)

    const withScriptTag = await handle({
      content: [
        ':inline-component',
        '<script>import InlineComponent from "./InlineComponent.vue"</script>',
      ],
    })
    expect(withScriptTag).toMatchInlineSnapshot(`
      "<script setup>
      import InlineComponent from "./InlineComponent.vue"
      </script>
      <template>
      <inline-component></inline-component>
      </template>
      "
    `)
  })
})

describe('binding', () => {
  it('string', async () => {
    const code = await handle({
      frontmatter: {
        title: 'HelloWorld',
        scripts: [
          'const name = "Markdown"',
        ],
      },
      content: [
        '# {{frontmatter.title}}',
        '# {{name}}',
        ':inline-component{:data-name="{{name}}"}',
        ':inline-component{:name=""}',
      ],
    })
    expect(code).toMatchInlineSnapshot(`
      "<script setup>
      const frontmatter = {"title":"HelloWorld"}
      const name = "Markdown"
      </script>
      <template>
      <h1>{{frontmatter.title}}</h1>
      <h1>{{name}}</h1>
      <inline-component :data-name="{{name}}"></inline-component>
      <inline-component :name></inline-component>
      </template>
      "
    `)
  })
})

async function handle(options: { frontmatter?: any, content?: string | string[] } = {}) {
  const { frontmatter = {}, content = ['[Link](https://example.com)', '# heading'] } = options
  const code = stringifyFrontMatter(frontmatter, toArray(content).join('\n\n'))
  const components = {
    a: 'ProseA',
  }
  const result = await transform({ code, components })
  return result.code
    .replaceAll('</script>', '\n</script>\n')
    .replaceAll('<script setup>', '<script setup>\n')
    .replaceAll('<template>', '<template>\n')
    .replaceAll('</template>', '\n</template>\n')
    .replaceAll('<style>', '<style>\n')
    .replaceAll('</style>', '\n</style>\n')
}
