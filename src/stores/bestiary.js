import { defineStore } from 'pinia'

const mobModules = import.meta.glob('../assets/mobs/*.json')
const imagePngModules = import.meta.glob('../assets/mobs/images/*.png', {
  eager: true,
  import: 'default'
})
const imageWebpModules = import.meta.glob('../assets/mobs/images/*.webp', {
  eager: true,
  import: 'default'
})

function normalizeNameEn(data, fileName) {
  if (data.nameEn) return data.nameEn
  if (typeof data.id === 'string' && data.id.includes(':')) {
    return data.id.split(':')[1]
  }
  return fileName.replace(/^\d+_/, '').replace('.json', '')
}

function getImageByFileName(fileName, modules, ext) {
  const path = `../assets/mobs/images/${fileName.replace('.json', ext)}`
  return modules[path] || ''
}

export const useBestiaryStore = defineStore('bestiary', {
  state: () => ({
    mobs: [],
    loaded: false,
    loading: false
  }),
  getters: {
    categories(state) {
      return [...new Set(state.mobs.map((mob) => mob.category).filter(Boolean))]
    }
  },
  actions: {
    async ensureLoaded() {
      if (this.loaded || this.loading) return
      this.loading = true
      try {
        const entries = Object.entries(mobModules)
        const modules = await Promise.all(entries.map(([, loader]) => loader()))
        this.mobs = modules
          .map((mod, index) => {
            const path = entries[index][0]
            const fileName = path.split('/').pop()
            const data = mod.default ?? mod
            return {
              ...data,
              fileName,
              nameEn: normalizeNameEn(data, fileName),
              imagePng: getImageByFileName(fileName, imagePngModules, '.png'),
              imageWebp: getImageByFileName(fileName, imageWebpModules, '.webp')
            }
          })
          .sort((a, b) => a.fileName.localeCompare(b.fileName, 'zh-CN'))
        this.loaded = true
      } finally {
        this.loading = false
      }
    }
  }
})
