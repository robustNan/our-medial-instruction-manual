import './assets/style.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import MedicalImage from 'our-medical'

const app = createApp(App)

app.use(router)
app.use(MedicalImage.install, {
  benchmarksURL: './node_modules/detect-gpu/dist/benchmarks',
  imageLoaderOptions: {
    beforeSend(
      xhr: XMLHttpRequest,
      imageId: string,
      defaultHeaders: Record<string, string>
      // params: OurTypes.LoaderXhrRequestParams
    ) {
      Reflect.set(defaultHeaders, 'Ots-Auth', 'test-token-123456789')
    }
  }
})

app.mount('#app')
