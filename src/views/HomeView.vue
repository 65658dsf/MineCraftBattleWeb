<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">WELCOME TO BATTLE</h1>
      <p class="hero-subtitle">我的世界 · 斗蛐蛐 · 生物图鉴</p>
    </div>

    <n-grid x-gap="24" y-gap="24" cols="1 sm:2 m:4" responsive="screen">
      <n-gi>
        <div class="mc-stat-card">
          <div class="stat-label">收录生物</div>
          <div class="stat-value">{{ mobCount }}</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="mc-stat-card">
          <div class="stat-label">玩法核心</div>
          <div class="stat-value">升星羁绊</div>
        </div>
      </n-gi>
      <n-gi>
        <div class="mc-stat-card">
          <div class="stat-label">战斗节奏</div>
          <div class="stat-value">自动技能</div>
        </div>
      </n-gi>
      <n-gi>
        <router-link to="/bestiary" class="mc-stat-card interactive">
          <div class="stat-label">开始探索</div>
          <div class="stat-value">ENTER ></div>
        </router-link>
      </n-gi>
    </n-grid>

    <div class="mc-panel-section">
      <h2 class="section-title">GAME FEATURES</h2>
      <n-grid x-gap="24" y-gap="24" cols="1 md:3" responsive="screen">
        <n-gi>
          <div class="feature-box">
            <h3 class="feature-title">阵容构筑</h3>
            <p class="feature-desc">
              根据职业定位与技能机制搭配前排承伤、后排输出和功能辅助，平衡容错与爆发能力。
            </p>
          </div>
        </n-gi>
        <n-gi>
          <div class="feature-box">
            <h3 class="feature-title">升星成长</h3>
            <p class="feature-desc">
              通过击杀与回合推进获取成长收益，关键生物升星后会解锁更强战场影响力。
            </p>
          </div>
        </n-gi>
        <n-gi>
          <div class="feature-box">
            <h3 class="feature-title">图鉴查询</h3>
            <p class="feature-desc">
              前往生物图鉴可按名称与分类快速筛选，并查看每只生物完整技能与背景信息。
            </p>
          </div>
        </n-gi>
      </n-grid>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useBestiaryStore } from '../stores/bestiary'

const bestiaryStore = useBestiaryStore()

onMounted(() => {
  bestiaryStore.ensureLoaded()
})

const mobCount = computed(() => bestiaryStore.mobs.length)
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.hero-section {
  text-align: center;
  padding: 40px 0;
  border-bottom: 4px solid var(--mc-border-shadow);
  background: rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
}

.hero-title {
  font-family: var(--font-pixel-title);
  font-size: 3rem;
  color: #FFF;
  text-shadow: 4px 4px 0 #000;
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-family: var(--font-pixel-text);
  font-size: 1.5rem;
  color: #CCC;
  margin: 0;
  text-shadow: 2px 2px 0 #000;
}

.mc-stat-card {
  background: var(--mc-bg-panel);
  border: 4px solid #000;
  padding: 20px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 4px 4px 0 rgba(0,0,0,0.5);
  transition: transform 0.1s;
}

.mc-stat-card.interactive:hover {
  background: #D0D0D0;
  transform: translateY(-2px);
  cursor: pointer;
}

.stat-label {
  font-family: var(--font-pixel-text);
  font-size: 1.2rem;
  color: #555;
  margin-bottom: 8px;
}

.stat-value {
  font-family: var(--font-pixel-title);
  font-size: 1.5rem;
  color: #222;
}

.mc-panel-section {
  background: rgba(0, 0, 0, 0.3);
  padding: 32px;
  border: 2px dashed var(--mc-border-shadow);
}

.section-title {
  font-family: var(--font-pixel-title);
  color: #FFF;
  text-align: center;
  margin-bottom: 32px;
  text-shadow: 2px 2px 0 #000;
}

.feature-box {
  background: #3a3a3a;
  border: 2px solid #000;
  padding: 16px;
  height: 100%;
  color: #FFF;
}

.feature-title {
  font-family: var(--font-pixel-title);
  color: var(--mc-accent-green);
  margin: 0 0 12px 0;
  font-size: 1.1rem;
  text-shadow: 2px 2px 0 #000;
}

.feature-desc {
  font-family: var(--font-pixel-text);
  font-size: 1.1rem;
  line-height: 1.4;
  color: #DDD;
  margin: 0;
}
</style>
