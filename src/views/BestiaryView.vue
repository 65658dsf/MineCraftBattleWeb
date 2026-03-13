<template>
  <div class="bestiary-container">
    <div class="mc-filter-panel">
      <div class="filter-header">
        <span class="pixel-icon">🔍</span>
        <span class="filter-title">SEARCH & FILTER</span>
      </div>
      
      <div class="search-box">
        <input 
          v-model="keyword"
          class="mc-input"
          placeholder="搜索生物"
        />
      </div>

      <div class="filter-group">
        <div class="group-title">CATEGORIES</div>
        <n-scrollbar style="max-height: 200px;">
          <n-checkbox-group v-model:value="selectedCategories">
            <div class="checkbox-list">
              <n-checkbox
                v-for="category in categoryOptions"
                :key="category"
                :value="category"
                :label="category"
                class="mc-checkbox"
              />
            </div>
          </n-checkbox-group>
        </n-scrollbar>
      </div>

      <div class="result-count">
        FOUND: {{ filteredMobs.length }} MOBS
      </div>
    </div>

    <div class="mob-list-container">
      <n-empty v-if="!filteredMobs.length" effect="NO MOBS FOUND" class="mc-empty">
        <template #icon>
          <span style="font-size: 48px;">🧟</span>
        </template>
      </n-empty>

      <div v-else-if="shouldUseVirtual" class="virtual-wrap mc-border-inset">
        <virtual-list
          class="virtual-list"
          :data-key="'rowIndex'"
          :data-sources="virtualRows"
          :data-component="VirtualRow"
          :keeps="12"
          :estimate-size="380"
          :extra-props="{ cols: currentCols, hoverable, onView: openDetail }"
        />
      </div>

      <div v-else class="grid-container">
        <n-grid :cols="gridCols" x-gap="16" y-gap="16" responsive="screen">
          <n-gi v-for="mob in filteredMobs" :key="mob.fileName">
            <BestiaryCard :mob="mob" :hoverable="hoverable" @view="openDetail" />
          </n-gi>
        </n-grid>
      </div>
    </div>
  </div>

  <n-modal
    v-model:show="showModal"
    :mask-closable="true"
    :close-on-esc="true"
    transform-origin="center"
  >
    <div class="mc-gui-window">
      <div class="gui-header">
        <span class="gui-title">MOB INFO: {{ activeMob?.name }}</span>
        <button class="close-btn" @click="showModal = false">×</button>
      </div>
      
      <div class="gui-content" v-if="activeMob">
        <div class="gui-grid">
          <div class="mob-preview">
            <div class="image-slot mc-border-inset">
              <n-image
                :src="getMobImage(activeMob)"
                :alt="activeMob.name"
                width="100%"
                object-fit="contain"
                lazy
                preview-disabled
              >
                <template #placeholder>
                  <div class="mob-placeholder"></div>
                </template>
              </n-image>
            </div>
            <div class="mob-tags">
              <span class="mc-tag">{{ activeMob.category || 'UNKNOWN' }}</span>
              <span class="mc-tag-id">{{ activeMob.id }}</span>
            </div>
          </div>

          <div class="mob-stats">
            <div class="stat-row">
              <span class="stat-label">HEALTH</span>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill health" :style="{width: Math.min(activeMob.baseStats?.health * 2, 100) + '%'}"></div>
              </div>
              <span class="stat-num">{{ activeMob.baseStats?.health }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">ATTACK</span>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill attack" :style="{width: Math.min(activeMob.baseStats?.attack * 5, 100) + '%'}"></div>
              </div>
              <span class="stat-num">{{ activeMob.baseStats?.attack }}</span>
            </div>
            
            <div class="mc-divider"></div>

            <div class="skill-section">
              <div class="section-label">SKILLS</div>
              <div v-for="skill in activeMob.skills || []" :key="skill.name" class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-type">[{{ skill.type }}]</span>
                </div>
                <div class="skill-desc">{{ skill.effect }}</div>
              </div>
            </div>

            <div class="mc-divider"></div>

            <div class="story-section">
              <div class="section-label">LORE</div>
              <p class="lore-text">{{ activeMob.story }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref } from 'vue'
import VirtualList from 'vue3-virtual-scroll-list'
import BestiaryCard from '../components/BestiaryCard.vue'
import { useBestiaryStore } from '../stores/bestiary'

const bestiaryStore = useBestiaryStore()

const keyword = ref('')
const selectedCategories = ref([])
const showModal = ref(false)
const activeMob = ref(null)
const currentCols = ref(4)
const hoverable = ref(false)

const placeholderSrc =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><filter id="b"><feGaussianBlur stdDeviation="1.5"/></filter><rect width="100%" height="100%" fill="%23d9e3f0" filter="url(%23b)"/></svg>'

const updateLayoutState = () => {
  const width = window.innerWidth
  if (width < 768) currentCols.value = 2
  else if (width < 992) currentCols.value = 3
  else if (width < 1200) currentCols.value = 4
  else currentCols.value = 5
  hoverable.value = window.matchMedia('(hover: hover)').matches && width >= 992
}

onMounted(async () => {
  await bestiaryStore.ensureLoaded()
  updateLayoutState()
  window.addEventListener('resize', updateLayoutState, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayoutState)
})

const categoryOptions = computed(() => bestiaryStore.categories)

const filteredMobs = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return bestiaryStore.mobs.filter((mob) => {
    const passKeyword =
      !q ||
      mob.name?.toLowerCase().includes(q) ||
      mob.nameEn?.toLowerCase().includes(q)
    const passCategory =
      selectedCategories.value.length === 0 || selectedCategories.value.includes(mob.category)
    return passKeyword && passCategory
  })
})

const shouldUseVirtual = computed(() => filteredMobs.value.length > 100)

const virtualRows = computed(() => {
  const rows = []
  for (let i = 0; i < filteredMobs.value.length; i += currentCols.value) {
    rows.push({
      rowIndex: i,
      items: filteredMobs.value.slice(i, i + currentCols.value)
    })
  }
  return rows
})

const gridCols = computed(() => `2 sm:3 md:4 lg:${currentCols.value}`)

const getMobImage = (mob) => {
  if (mob.imagePng) return mob.imagePng
  if (mob.imageWebp) return mob.imageWebp
  return placeholderSrc
}

const openDetail = (mob) => {
  activeMob.value = mob
  showModal.value = true
}

const VirtualRow = defineComponent({
  name: 'VirtualRow',
  props: {
    source: {
      type: Object,
      required: true
    },
    cols: {
      type: Number,
      required: true
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    onView: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: 'virtual-row' },
        h(
          'div',
          {
            class: 'virtual-row-grid',
            style: `grid-template-columns: repeat(${props.cols}, minmax(0, 1fr));`
          },
          props.source.items.map((mob) =>
            h(BestiaryCard, {
              key: mob.fileName,
              mob,
              hoverable: props.hoverable,
              onView: props.onView
            })
          )
        )
      )
  }
})
</script>

<style scoped>
.bestiary-container {
  display: flex;
  gap: 20px;
  flex-direction: column;
}

@media (min-width: 768px) {
  .bestiary-container {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* 侧边筛选栏 */
.mc-filter-panel {
  background: var(--mc-bg-panel);
  border: 4px solid #000;
  border-top-color: var(--mc-border-light);
  border-left-color: var(--mc-border-light);
  border-bottom-color: var(--mc-border-shadow);
  border-right-color: var(--mc-border-shadow);
  padding: 16px;
  width: 100%;
  flex-shrink: 0;
}

@media (min-width: 768px) {
  .mc-filter-panel {
    width: 280px;
    position: sticky;
    top: 20px;
  }
}

.filter-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--mc-border-shadow);
}

.filter-title {
  font-family: var(--font-pixel-title);
  color: var(--mc-text-title);
  font-size: 14px;
}

.search-box {
  margin-bottom: 20px;
}

.mc-input {
  width: 100%;
  background: #000;
  color: #FFF;
  border: 2px solid var(--mc-border-shadow);
  border-bottom-color: var(--mc-border-light);
  border-right-color: var(--mc-border-light);
  padding: 8px;
  font-family: var(--font-pixel-text);
  font-size: 16px;
  outline: none;
}

.mc-input:focus {
  background: #222;
  border-color: #FFF;
}

.group-title {
  font-family: var(--font-pixel-title);
  font-size: 12px;
  color: #555;
  margin-bottom: 8px;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-count {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px dashed var(--mc-border-shadow);
  font-family: var(--font-pixel-text);
  color: #555;
  text-align: center;
}

/* 列表容器 */
.mob-list-container {
  flex-grow: 1;
  width: 100%;
}

.mc-empty {
  background: var(--mc-bg-panel);
  border: 4px solid #000;
  padding: 40px;
  font-family: var(--font-pixel-title);
}

/* 详情弹窗 GUI */
.mc-gui-window {
  background: #C6C6C6;
  border: 4px solid #000;
  border-top-color: #FFF;
  border-left-color: #FFF;
  border-bottom-color: #555;
  border-right-color: #555;
  width: min(800px, 90vw);
  display: flex;
  flex-direction: column;
  box-shadow: 10px 10px 0 rgba(0,0,0,0.5);
}

.gui-header {
  background: #3a3a3a;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #000;
}

.gui-title {
  font-family: var(--font-pixel-title);
  color: #FFF;
  font-size: 14px;
}

.close-btn {
  background: #FF5555;
  border: 2px solid #000;
  border-top-color: #FFAAAA;
  border-left-color: #FFAAAA;
  border-bottom-color: #AA0000;
  border-right-color: #AA0000;
  color: #FFF;
  font-family: var(--font-pixel-title);
  width: 24px;
  height: 24px;
  line-height: 20px;
  text-align: center;
  cursor: pointer;
}

.close-btn:active {
  border-top-color: #AA0000;
  border-left-color: #AA0000;
  border-bottom-color: #FFAAAA;
  border-right-color: #FFAAAA;
}

.gui-content {
  padding: 20px;
}

.gui-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 600px) {
  .gui-grid {
    grid-template-columns: 200px 1fr;
  }
}

.image-slot {
  background: #8B8B8B;
  padding: 10px;
  image-rendering: pixelated;
}

.mob-tags {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mc-tag {
  background: #3a3a3a;
  color: #FFF;
  padding: 4px 8px;
  font-family: var(--font-pixel-text);
  text-align: center;
  border: 2px solid #000;
}

.mc-tag-id {
  font-size: 12px;
  color: #555;
  text-align: center;
  font-family: monospace;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.stat-label {
  width: 60px;
  font-family: var(--font-pixel-title);
  font-size: 12px;
}

.stat-bar-bg {
  flex-grow: 1;
  height: 16px;
  background: #373737;
  border: 2px solid #000;
}

.stat-bar-fill {
  height: 100%;
}

.stat-bar-fill.health { background: #FF5555; }
.stat-bar-fill.attack { background: #FFAA00; }

.stat-num {
  width: 40px;
  text-align: right;
  font-family: var(--font-pixel-text);
}

.mc-divider {
  height: 2px;
  background: #555;
  border-bottom: 2px solid #FFF;
  margin: 16px 0;
}

.section-label {
  font-family: var(--font-pixel-title);
  color: #333;
  margin-bottom: 8px;
  font-size: 14px;
}

.skill-item {
  background: rgba(255,255,255,0.1);
  border: 1px dashed #555;
  padding: 8px;
  margin-bottom: 8px;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.skill-name {
  font-weight: bold;
  color: #222;
}

.skill-type {
  font-size: 12px;
  color: #555;
}

.skill-desc {
  font-size: 14px;
  color: #333;
}

.lore-text {
  font-style: italic;
  color: #444;
  line-height: 1.4;
  background: #D4CBA8; /* 书本纸张色 */
  padding: 10px;
  border: 2px solid #5C4033;
}
</style>