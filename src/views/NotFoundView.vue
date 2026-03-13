<template>
  <n-card title="页面不存在" embedded>
    <n-space vertical>
      <n-text>你访问的页面不存在，请返回首页或进入生物图鉴。</n-text>
      <n-space>
        <router-link class="nav-link" to="/">返回首页</router-link>
        <router-link class="nav-link" to="/bestiary">进入图鉴</router-link>
      </n-space>
    </n-space>
  </n-card>
</template>
