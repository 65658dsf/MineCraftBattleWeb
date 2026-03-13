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

function getImageByFileName(fileName, modules, ext, mobName) {
  // 1. Try with the original filename (e.g. 001_鸡.json -> 001_鸡.png)
  let path = `../assets/mobs/images/${fileName.replace('.json', ext)}`
  if (modules[path]) return modules[path]

  // 2. Try with just the mob name (e.g. 鸡.png) if mobName is provided
  if (mobName) {
    path = `../assets/mobs/images/${mobName}${ext}`
    if (modules[path]) return modules[path]
  }

  // 3. Try with filename without numbers (e.g. 001_鸡.json -> 鸡.png)
  const nameWithoutNumber = fileName.replace(/^\d+_/, '').replace('.json', '')
  path = `../assets/mobs/images/${nameWithoutNumber}${ext}`
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
            const mobName = data.name
            return {
              ...data,
              fileName,
              nameEn: normalizeNameEn(data, fileName),
              imagePng: getImageByFileName(fileName, imagePngModules, '.png', mobName),
              imageWebp: getImageByFileName(fileName, imageWebpModules, '.webp', mobName)
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
