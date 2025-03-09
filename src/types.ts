import type { PluggableList } from 'unified'
import type { FilterPattern } from 'vite'

interface SharedOptions {
  components: Record<string, string>
  remarkPlugins: PluggableList
  rehypePlugins: PluggableList
}

export interface PluginOptions extends Partial<SharedOptions> {
  include?: FilterPattern
  exclude?: FilterPattern
}

export interface TransformOptions extends Partial<SharedOptions> {
  code: string
  id?: string
}

export interface Layout {
  type: 'name' | 'file'
  value: string
}
