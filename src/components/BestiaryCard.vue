<template>
  <div class="mc-item-card" @click="$emit('view', mob)">
    <div class="card-inner">
      <div class="image-wrapper mc-border-inset">
        <n-image
          :src="imageSrc"
          :alt="mob.name"
          width="100%"
          object-fit="contain"
          preview-disabled
          lazy
          class="mob-image"
        >
          <template #placeholder>
            <div class="mob-placeholder"></div>
          </template>
        </n-image>
      </div>
      
      <div class="card-content">
        <div class="mob-name">{{ mob.name }}</div>
        <div class="mob-stats">
          <span class="stat hp">
            <span class="icon">❤</span> {{ mob.baseStats?.health ?? '-' }}
          </span>
          <span class="stat atk">
            <span class="icon">⚔</span> {{ mob.baseStats?.attack ?? '-' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mob: {
    type: Object,
    required: true
  },
  hoverable: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view'])

const placeholderSrc =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><filter id="b"><feGaussianBlur stdDeviation="1.5"/></filter><rect width="100%" height="100%" fill="%23d9e3f0" filter="url(%23b)"/></svg>'

const imageSrc = computed(() => {
  return props.mob.imagePng || props.mob.imageWebp || placeholderSrc
})
</script>

<style scoped>
.mc-item-card {
  background: #8B8B8B;
  border: 2px solid #000;
  border-top-color: #FFF;
  border-left-color: #FFF;
  border-bottom-color: #373737;
  border-right-color: #373737;
  padding: 8px;
  cursor: pointer;
  transition: all 0.1s;
  height: 100%;
}

.mc-item-card:hover {
  background: #A0A0A0;
  border-color: #FFF;
  transform: scale(1.02);
  z-index: 1;
}

.card-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
}

.image-wrapper {
  background: #555;
  padding: 8px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
}

.mob-name {
  font-family: var(--font-pixel-text);
  color: #FFF;
  font-size: 16px;
  text-align: center;
  text-shadow: 1px 1px 0 #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mob-stats {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
}

.stat {
  font-family: var(--font-pixel-text);
  font-size: 14px;
  color: #DDD;
  display: flex;
  align-items: center;
  gap: 4px;
  text-shadow: 1px 1px 0 #000;
}

.stat.hp .icon { color: #FF5555; }
.stat.atk .icon { color: #FFAA00; }

.mob-placeholder {
  width: 100%;
  height: 100%;
  background: #444;
}
</style>
