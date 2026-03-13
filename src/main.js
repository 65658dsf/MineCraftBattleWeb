import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  create,
  NButton,
  NCard,
  NCheckbox,
  NCheckboxGroup,
  NConfigProvider,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NEmpty,
  NGrid,
  NGi,
  NImage,
  NInput,
  NLayout,
  NLayoutContent,
  NLayoutHeader,
  NModal,
  NScrollbar,
  NSpace,
  NStatistic,
  NTag,
  NText,
  NThing
} from 'naive-ui'
import App from './App.vue'
import router from './router'
import './styles.css'

const naive = create({
  components: [
    NButton,
    NCard,
    NCheckbox,
    NCheckboxGroup,
    NConfigProvider,
    NDescriptions,
    NDescriptionsItem,
    NDivider,
    NEmpty,
    NGrid,
    NGi,
    NImage,
    NInput,
    NLayout,
    NLayoutContent,
    NLayoutHeader,
    NModal,
    NScrollbar,
    NSpace,
    NStatistic,
    NTag,
    NText,
    NThing
  ]
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
app.mount('#app')
