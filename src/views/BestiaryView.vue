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
      <button class="batch-export-btn" :disabled="isBatchExporting" @click="openBatchExportModal">
        {{ isBatchExporting ? `批量导出中 ${batchProgress}` : '批量导出图鉴' }}
      </button>
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
    v-model:show="showBatchSelectModal"
    :mask-closable="!isBatchExporting"
    :close-on-esc="!isBatchExporting"
    transform-origin="center"
  >
    <div class="batch-select-modal">
      <div class="batch-select-title">选择要导出的生物</div>
      <div class="batch-select-subtitle">
        当前筛选 {{ filteredMobs.length }} 项，已选择 {{ batchSelectedKeys.length }} 项
      </div>
      <div class="batch-select-tools">
        <button class="batch-tool-btn" :disabled="isBatchExporting" @click="selectAllBatchTargets">
          全选
        </button>
        <button class="batch-tool-btn" :disabled="isBatchExporting" @click="clearBatchTargets">
          清空
        </button>
      </div>
      <n-scrollbar class="batch-select-scroll">
        <n-checkbox-group v-model:value="batchSelectedKeys">
          <div class="batch-select-list">
            <n-checkbox
              v-for="mob in filteredMobs"
              :key="mob.fileName"
              :value="mob.fileName"
              :label="mob.name"
              class="batch-select-item"
            />
          </div>
        </n-checkbox-group>
      </n-scrollbar>
      <div class="batch-select-actions">
        <button class="batch-cancel-btn" :disabled="isBatchExporting" @click="showBatchSelectModal = false">
          取消
        </button>
        <button
          class="batch-confirm-btn"
          :disabled="isBatchExporting || batchSelectedKeys.length === 0"
          @click="confirmBatchExportSelection"
        >
          {{ isBatchExporting ? `导出中 ${batchProgress}` : '开始导出' }}
        </button>
      </div>
    </div>
  </n-modal>

  <n-modal
    v-model:show="showModal"
    :mask-closable="true"
    :close-on-esc="true"
    transform-origin="center"
  >
    <div ref="captureRef" class="mc-gui-window">
      <div class="gui-header">
        <span class="gui-title">生物信息: {{ activeMob?.name }}</span>
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
            </div>
          </div>

          <div class="mob-stats">
            <div class="stat-row">
              <span class="stat-label">
                <img class="stat-icon" :src="heartIcon" alt="" />
                <span>HEALTH</span>
              </span>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill health" :style="{width: Math.min(activeMob.baseStats?.health * 2, 100) + '%'}"></div>
              </div>
              <span class="stat-num">{{ activeMob.baseStats?.health }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">
                <img class="stat-icon" :src="swordIcon" alt="" />
                <span>ATTACK</span>
              </span>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill attack" :style="{width: Math.min(activeMob.baseStats?.attack * 5, 100) + '%'}"></div>
              </div>
              <span class="stat-num">{{ activeMob.baseStats?.attack }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">
                <img class="stat-icon" :src="shieldIcon" alt="" />
                <span>DEFENSE</span>
              </span>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill defense" :style="{width: Math.min(activeMob.baseStats?.defense * 10, 100) + '%'}"></div>
              </div>
              <span class="stat-num">{{ activeMob.baseStats?.defense }}</span>
            </div>
            
            <div class="mc-divider"></div>

            <div class="skill-section">
              <div class="section-label">SKILLS</div>
              <div
                v-for="skill in activeMob.skills || []"
                :key="skill.name"
                class="skill-item"
                :class="getSkillClass(skill)"
              >
                <div class="skill-header">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-type">{{ getSkillTag(skill) }}</span>
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
        <button class="download-btn" :disabled="isDownloading" @click="downloadBestiaryPage">
          {{ isDownloading ? '导出中...' : '下载图鉴' }}
        </button>
      </div>
    </div>
  </n-modal>

  <div ref="batchCaptureRef" class="mc-gui-window export-mode export-hidden" v-if="exportMob">
    <div class="gui-content">
      <div class="export-title">{{ exportMob.name }} · 生物图鉴</div>
      <div class="gui-grid">
        <div class="mob-preview">
          <div class="image-slot mc-border-inset">
            <n-image
              :src="getMobImage(exportMob)"
              :alt="exportMob.name"
              width="100%"
              object-fit="contain"
              preview-disabled
            />
          </div>
          <div class="mob-tags">
            <span class="mc-tag">{{ exportMob.category || 'UNKNOWN' }}</span>
          </div>
        </div>
        <div class="mob-stats">
          <div class="stat-row">
            <span class="stat-label">
              <img class="stat-icon" :src="heartIcon" alt="" />
              <span>HEALTH</span>
            </span>
            <div class="stat-bar-bg">
              <div class="stat-bar-fill health" :style="{width: Math.min(exportMob.baseStats?.health * 2, 100) + '%'}"></div>
            </div>
            <span class="stat-num">{{ exportMob.baseStats?.health }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">
              <img class="stat-icon" :src="swordIcon" alt="" />
              <span>ATTACK</span>
            </span>
            <div class="stat-bar-bg">
              <div class="stat-bar-fill attack" :style="{width: Math.min(exportMob.baseStats?.attack * 5, 100) + '%'}"></div>
            </div>
            <span class="stat-num">{{ exportMob.baseStats?.attack }}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">
              <img class="stat-icon" :src="shieldIcon" alt="" />
              <span>DEFENSE</span>
            </span>
            <div class="stat-bar-bg">
              <div class="stat-bar-fill defense" :style="{width: Math.min(exportMob.baseStats?.defense * 10, 100) + '%'}"></div>
            </div>
            <span class="stat-num">{{ exportMob.baseStats?.defense }}</span>
          </div>

          <div class="mc-divider"></div>

          <div class="skill-section">
            <div class="section-label">SKILLS</div>
            <div
              v-for="skill in exportMob.skills || []"
              :key="skill.name"
              class="skill-item"
              :class="getSkillClass(skill)"
            >
              <div class="skill-header">
                <span class="skill-name">{{ skill.name }}</span>
                <span class="skill-type">{{ getSkillTag(skill) }}</span>
              </div>
              <div class="skill-desc">{{ skill.effect }}</div>
            </div>
          </div>

          <div class="mc-divider"></div>

          <div class="story-section">
            <div class="section-label">LORE</div>
            <p class="lore-text">{{ exportMob.story }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineComponent, h, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import VirtualList from 'vue3-virtual-scroll-list'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import BestiaryCard from '../components/BestiaryCard.vue'
import { useBestiaryStore } from '../stores/bestiary'
import swordIcon from '../assets/icon/剑.svg'
import heartIcon from '../assets/icon/爱心.svg'
import shieldIcon from '../assets/icon/盾牌保卫.svg'

const bestiaryStore = useBestiaryStore()

const keyword = ref('')
const selectedCategories = ref([])
const showModal = ref(false)
const activeMob = ref(null)
const captureRef = ref(null)
const batchCaptureRef = ref(null)
const isDownloading = ref(false)
const isBatchExporting = ref(false)
const batchProgress = ref('')
const showBatchSelectModal = ref(false)
const batchSelectedKeys = ref([])
const exportMob = ref(null)
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

const openBatchExportModal = () => {
  if (isBatchExporting.value || filteredMobs.value.length === 0) return
  batchSelectedKeys.value = filteredMobs.value.map((mob) => mob.fileName)
  showBatchSelectModal.value = true
}

const selectAllBatchTargets = () => {
  batchSelectedKeys.value = filteredMobs.value.map((mob) => mob.fileName)
}

const clearBatchTargets = () => {
  batchSelectedKeys.value = []
}

const toSafeName = (name, fallback) => {
  return String(name || fallback || '生物').replace(/[\\/:*?"<>|]/g, '-')
}

const renderExportCanvasForMob = async (mob) => {
  exportMob.value = mob
  await nextTick()
  if (!batchCaptureRef.value) return null
  return html2canvas(batchCaptureRef.value, {
    useCORS: true,
    backgroundColor: '#1d1d1d',
    width: 1920,
    height: 1080,
    windowWidth: 1920,
    windowHeight: 1080,
    scale: 1
  })
}

const downloadBestiaryPage = async () => {
  if (!captureRef.value || isDownloading.value || !activeMob.value) return
  isDownloading.value = true
  try {
    const targetWidth = 1920
    const targetHeight = 1080
    const clone = captureRef.value.cloneNode(true)
    clone.classList.add('export-mode')
    clone.querySelectorAll('.download-btn, .gui-header').forEach((el) => el.remove())
    const cloneContent = clone.querySelector('.gui-content')
    if (cloneContent) {
      const exportTitle = document.createElement('div')
      exportTitle.className = 'export-title'
      exportTitle.textContent = `${activeMob.value.name} · 生物图鉴`
      cloneContent.prepend(exportTitle)
    }
    Object.assign(clone.style, {
      position: 'fixed',
      left: '-100000px',
      top: '0',
      width: `${targetWidth}px`,
      height: `${targetHeight}px`,
      maxWidth: 'none',
      margin: '0',
      transform: 'none',
      overflow: 'hidden',
      zIndex: '-1'
    })
    document.body.appendChild(clone)
    await new Promise((resolve) => requestAnimationFrame(resolve))
    const sourceCanvas = await html2canvas(clone, {
      useCORS: true,
      backgroundColor: '#1d1d1d',
      width: targetWidth,
      height: targetHeight,
      windowWidth: targetWidth,
      windowHeight: targetHeight,
      scale: 1
    })
    clone.remove()
    const link = document.createElement('a')
    const safeName = toSafeName(activeMob.value.name, '生物')
    link.download = `${safeName}-图鉴-1920x1080.png`
    link.href = sourceCanvas.toDataURL('image/png')
    link.click()
  } finally {
    document.querySelectorAll('.mc-gui-window').forEach((el) => {
      if (el.style.left === '-100000px') {
        el.remove()
      }
    })
    isDownloading.value = false
  }
}

const batchExportBestiary = async (mobs) => {
  if (isBatchExporting.value) return
  if (!mobs.length) return
  isBatchExporting.value = true
  batchProgress.value = `0/${mobs.length}`
  const zip = new JSZip()
  try {
    for (let index = 0; index < mobs.length; index += 1) {
      const mob = mobs[index]
      batchProgress.value = `${index + 1}/${mobs.length}`
      const canvas = await renderExportCanvasForMob(mob)
      if (!canvas) continue
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) continue
      const base = toSafeName(mob.name, mob.fileName?.replace('.json', ''))
      zip.file(`${String(index + 1).padStart(3, '0')}-${base}-图鉴.png`, blob)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const link = document.createElement('a')
    link.download = `生物图鉴-${mobs.length}项-1920x1080.zip`
    link.href = URL.createObjectURL(zipBlob)
    link.click()
    URL.revokeObjectURL(link.href)
  } finally {
    exportMob.value = null
    batchProgress.value = ''
    isBatchExporting.value = false
  }
}

const confirmBatchExportSelection = async () => {
  if (isBatchExporting.value) return
  const selectedSet = new Set(batchSelectedKeys.value)
  const targets = filteredMobs.value.filter((mob) => selectedSet.has(mob.fileName))
  if (!targets.length) return
  showBatchSelectModal.value = false
  await batchExportBestiary(targets)
}

const isStarSkill = (skill) => {
  return skill?.triggerCondition?.includes('升星')
}

const getSkillTag = (skill) => {
  if (isStarSkill(skill)) return '升星技'
  if (skill?.type === '主动') return '主动'
  return '被动'
}

const getSkillClass = (skill) => {
  if (isStarSkill(skill)) return 'skill-item--star'
  if (skill?.type === '主动') return 'skill-item--active'
  return 'skill-item--passive'
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

.batch-export-btn {
  margin-top: 12px;
  width: 100%;
  min-height: 42px;
  border: 2px solid #000;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #555;
  border-right-color: #555;
  background: rgba(37, 99, 235, 0.9);
  color: #fff;
  font-family: var(--font-pixel-text);
  font-size: 18px;
  cursor: pointer;
}

.batch-export-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.batch-select-modal {
  width: min(620px, 92vw);
  background: #c6c6c6;
  border: 4px solid #000;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #555;
  border-right-color: #555;
  padding: 16px;
}

.batch-select-title {
  font-family: var(--font-pixel-title);
  font-size: 18px;
  color: #222;
  margin-bottom: 6px;
}

.batch-select-subtitle {
  font-family: var(--font-pixel-text);
  font-size: 16px;
  color: #444;
  margin-bottom: 12px;
}

.batch-select-tools {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.batch-tool-btn {
  min-height: 34px;
  padding: 4px 12px;
  border: 2px solid #000;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #555;
  border-right-color: #555;
  background: #8b8b8b;
  color: #fff;
  font-family: var(--font-pixel-text);
  font-size: 16px;
  cursor: pointer;
}

.batch-tool-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.batch-select-scroll {
  max-height: 360px;
  border: 2px solid #000;
  border-top-color: #555;
  border-left-color: #555;
  border-bottom-color: #fff;
  border-right-color: #fff;
  background: rgba(0, 0, 0, 0.15);
}

.batch-select-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}

.batch-select-item {
  background: rgba(255, 255, 255, 0.15);
  padding: 4px 6px;
}

.batch-select-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.batch-cancel-btn,
.batch-confirm-btn {
  min-height: 38px;
  padding: 6px 14px;
  border: 2px solid #000;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #555;
  border-right-color: #555;
  color: #fff;
  font-family: var(--font-pixel-text);
  font-size: 18px;
  cursor: pointer;
}

.batch-cancel-btn {
  background: #6b7280;
}

.batch-confirm-btn {
  background: #2563eb;
}

.batch-cancel-btn:disabled,
.batch-confirm-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
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
  position: relative;
  padding: 20px;
  padding-bottom: 72px;
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

.mob-stats {
  display: grid;
  grid-template-columns: max-content 1fr max-content;
  column-gap: 16px;
  row-gap: 8px;
  align-items: center;
}

.stat-row {
  display: contents;
}

.stat-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-pixel-title);
  font-size: 12px;
  white-space: nowrap;
}

.stat-icon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.stat-bar-bg {
  width: 100%;
  height: 16px;
  background: #373737;
  border: 2px solid #000;
}

.stat-bar-fill {
  height: 100%;
}

.stat-bar-fill.health { background: #FF5555; }
.stat-bar-fill.attack { background: #FFAA00; }
.stat-bar-fill.defense { background: #55a7ff; }

.stat-num {
  text-align: right;
  font-family: var(--font-pixel-text);
  white-space: nowrap;
  justify-self: end;
}

.mc-divider {
  grid-column: 1 / -1;
  height: 2px;
  background: #555;
  border-bottom: 2px solid #FFF;
  margin: 16px 0;
}

.skill-section,
.story-section {
  grid-column: 1 / -1;
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

.skill-item--active {
  background: rgba(255, 128, 0, 0.18);
  border-color: rgba(255, 140, 0, 0.65);
}

.skill-item--passive {
  background: rgba(110, 110, 110, 0.2);
  border-color: rgba(90, 90, 90, 0.75);
}

.skill-item--star {
  background: rgba(110, 72, 255, 0.22);
  border-color: rgba(128, 92, 255, 0.78);
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
  color: #fff;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.35);
}

.skill-item--active .skill-type {
  background: rgba(255, 140, 0, 0.55);
}

.skill-item--passive .skill-type {
  background: rgba(80, 80, 80, 0.55);
}

.skill-item--star .skill-type {
  background: rgba(128, 92, 255, 0.65);
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

.download-btn {
  position: absolute;
  left: 20px;
  bottom: 20px;
  min-height: 40px;
  padding: 8px 14px;
  border: 2px solid #000;
  border-top-color: #fff;
  border-left-color: #fff;
  border-bottom-color: #555;
  border-right-color: #555;
  background: rgba(37, 99, 235, 0.85);
  color: #fff;
  font-family: var(--font-pixel-text);
  font-size: 18px;
  cursor: pointer;
}

.download-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.export-hidden {
  position: fixed;
  left: -100000px;
  top: 0;
  width: 1920px;
  height: 1080px;
  max-width: none;
  margin: 0;
  transform: none;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
}

.mc-gui-window.export-mode {
  background:
    linear-gradient(135deg, rgba(53, 60, 72, 0.96) 0%, rgba(38, 43, 52, 0.98) 100%),
    repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.03) 0 6px, transparent 6px 12px);
  border-top-color: #dce6f5;
  border-left-color: #dce6f5;
  border-bottom-color: #1b1f27;
  border-right-color: #1b1f27;
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.5);
}

.mc-gui-window.export-mode .gui-content {
  height: 100%;
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.mc-gui-window.export-mode .export-title {
  font-family: var(--font-pixel-title);
  font-size: 42px;
  color: #f5f7ff;
  text-shadow: 0 4px 0 rgba(0, 0, 0, 0.45);
  letter-spacing: 1px;
  border-left: 8px solid #60a5fa;
  padding-left: 16px;
}

.mc-gui-window.export-mode .gui-grid {
  flex: 1;
  grid-template-columns: 380px 1fr;
  gap: 28px;
}

.mc-gui-window.export-mode .mob-preview,
.mc-gui-window.export-mode .mob-stats {
  background: rgba(16, 21, 29, 0.48);
  border: 2px solid rgba(255, 255, 255, 0.16);
  padding: 18px;
}

.mc-gui-window.export-mode .image-slot {
  padding: 18px;
  background: #1b2129;
}

.mc-gui-window.export-mode .mc-tag {
  font-size: 24px;
  padding: 8px 12px;
  background: rgba(58, 90, 56, 0.86);
  border-color: rgba(220, 245, 220, 0.45);
}

.mc-gui-window.export-mode .stat-label,
.mc-gui-window.export-mode .stat-num {
  font-size: 20px;
  color: #f3f5fa;
}

.mc-gui-window.export-mode .stat-icon {
  width: 20px;
  height: 20px;
}

.mc-gui-window.export-mode .stat-bar-bg {
  height: 22px;
  border-color: #0d1117;
  background: #202938;
}

.mc-gui-window.export-mode .section-label {
  font-size: 24px;
  color: #f6f7fb;
  margin-bottom: 12px;
}

.mc-gui-window.export-mode .skill-item {
  padding: 12px;
  margin-bottom: 12px;
  border-width: 2px;
}

.mc-gui-window.export-mode .skill-name {
  font-size: 22px;
  color: #f2f3f7;
}

.mc-gui-window.export-mode .skill-type {
  font-size: 16px;
}

.mc-gui-window.export-mode .skill-desc {
  font-size: 18px;
  color: #eef1f8;
  line-height: 1.5;
}

.mc-gui-window.export-mode .lore-text {
  font-size: 18px;
  line-height: 1.55;
}
</style>
