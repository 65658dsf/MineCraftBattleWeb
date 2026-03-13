<template>
  <n-config-provider :breakpoints="breakpoints" :theme-overrides="themeOverrides">
    <div class="app-shell">
      <header class="app-header">
        <div class="brand-container">
          <div class="brand">MINECRAFT BATTLE</div>
          <div class="brand-subtitle">我的世界斗蛐蛐</div>
        </div>
        <n-space align="center" :size="20">
          <router-link class="nav-link" to="/">首页</router-link>
          <router-link class="nav-link" to="/bestiary">生物图鉴</router-link>
        </n-space>
      </header>
      <main class="app-content">
        <router-view />
      </main>
    </div>
  </n-config-provider>
</template>

<script setup>
const breakpoints = {
  xs: 0,
  sm: 768,
  md: 992,
  lg: 1200,
  xl: 1600,
  xxl: 1900
}

const themeOverrides = {
  common: {
    fontFamily: "'VT323', monospace",
    borderRadius: '0px',
    primaryColor: '#5D9C59',
    primaryColorHover: '#7CFC00',
    primaryColorPressed: '#487A45',
  },
  Card: {
    borderRadius: '0px',
    color: '#C6C6C6',
    borderColor: '#373737',
    textColor: '#3F3F3F',
    titleTextColor: '#212121',
    boxShadow: 'none' // 我们用 CSS 覆盖了
  }
}
</script>

<style scoped>
.app-content {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.brand-container {
  display: flex;
  flex-direction: column;
}

.brand {
  font-size: 20px;
  color: #FFF;
  text-shadow: 2px 2px 0 #000;
}

.brand-subtitle {
  font-family: var(--font-pixel-text);
  font-size: 14px;
  color: #DDD;
  text-shadow: 1px 1px 0 #000;
}
</style>
