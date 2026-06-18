import { describe, it, expect } from 'vitest'
import { useAppStore, stripImageHostSecrets } from './appStore'

describe('useAppStore', () => {
  it('should not persist colors derived from accent', () => {
    const partial = (useAppStore as unknown as { persist: { getOptions: () => { partialize?: (state: unknown) => unknown } } }).persist.getOptions().partialize
    if (!partial) throw new Error('partialize is undefined')

    const state = useAppStore.getState()
    const persisted = partial(state) as Record<string, unknown>

    expect(persisted).toHaveProperty('accent')
    expect(persisted).toHaveProperty('accentDark')
    expect(persisted).not.toHaveProperty('colors')
  })

  it('should strip secrets from image host config before persistence', () => {
    useAppStore.setState({
      imageHostConfig: {
        activeType: 'oss',
        oss: { region: 'cn-hangzhou', bucket: 'demo', accessKeyId: 'AK', accessKeySecret: 'SK' },
      },
    })

    const stripped = stripImageHostSecrets(useAppStore.getState().imageHostConfig)
    expect(stripped.oss?.accessKeyId).toBe('')
    expect(stripped.oss?.accessKeySecret).toBe('')
    expect(stripped.oss?.region).toBe('cn-hangzhou')
    expect(stripped.oss?.bucket).toBe('demo')
  })
})
