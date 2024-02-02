<script setup lang="ts">
import { nextTick, reactive, ref, unref, type Ref } from 'vue'
import { BidirectionalTool, DragProbeTool } from '@cornerstonejs/tools'
// import MedicalImage, { CONSTANT, type Types, utilities, managers } from 'our-medical'
import MedicalImage, { CONSTANT, type Types, utilities, managers } from 'our-medical'

const id = 'main'

const layout = ref(CONSTANT.Layout.Primary)

function changeLayout(e: GlobalEventHandlersEventMap['change']): void {
  const { target } = e
  layout.value = (target as HTMLSelectElement).value as CONSTANT.Layout
}

const WADO_RS_ROOT = 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'

const primaryInfor: Types.SeriesProps = {
  studiesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
  seriesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
  instances: [],
  modality: ''
}
utilities
  .getMetaData(WADO_RS_ROOT, primaryInfor.studiesId, primaryInfor.seriesId)
  .then(({ imageIds, modality }) => {
    primaryInfor.instances = imageIds
    primaryInfor.modality = modality
  })

const secondaryInfor: Types.SeriesProps = {
  // PT
  studiesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
  seriesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.879445243400782656317561081015',
  // MR
  // studiesId: '1.2.840.113619.2.5.1762583153.215519.978957063.78',
  // seriesId: '1.2.840.113619.2.5.1762583153.215519.978957063.135',
  instances: [],
  modality: ''
}
utilities
  .getMetaData(WADO_RS_ROOT, secondaryInfor.studiesId, secondaryInfor.seriesId)
  .then(({ imageIds, modality }) => {
    secondaryInfor.instances = imageIds
    secondaryInfor.modality = modality
  })

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const primaryObj: Types.SeriesProps = reactive({
  studiesId: '',
  seriesId: '',
  instances: [],
  modality: '',
  densityId: ''
})

function renderCT() {
  primaryObj.studiesId = primaryInfor.studiesId
  primaryObj.seriesId = primaryInfor.seriesId
  primaryObj.instances = primaryInfor.instances
  primaryObj.modality = primaryInfor.modality

  nextTick(() => {
    testGetSeriesGrayscaleStatistics(primaryObj.seriesId)
  })
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const secondaryObj: Types.SeriesProps = reactive({
  studiesId: '',
  seriesId: '',
  instances: [],
  modality: ''
})

function renderPT() {
  secondaryObj.studiesId = secondaryInfor.studiesId
  secondaryObj.seriesId = secondaryInfor.seriesId
  secondaryObj.instances = secondaryInfor.instances
  secondaryObj.modality = secondaryInfor.modality

  nextTick(() => {
    testGetSeriesGrayscaleStatistics(secondaryObj.seriesId)
  })
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

function renderAll() {
  renderCT()
  renderPT()
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

function unRenderCT() {
  primaryObj.studiesId = ''
  primaryObj.seriesId = ''
  primaryObj.instances = []
  primaryObj.modality = ''
}

function unRenderPT() {
  secondaryObj.studiesId = ''
  secondaryObj.seriesId = ''
  secondaryObj.instances = []
  secondaryObj.modality = ''
}

function unRenderAll() {
  unRenderCT()
  unRenderPT()
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

/**
 * 一中取消异步获取到灰度统计数据后执行的方式,因为异步可能获取到数据时已不再需要这份数据
 * 也可以通过then中的id判断是否还需要处理这份数据
 */
let cancelFn: (() => void) | null = null

function testGetSeriesGrayscaleStatistics(seriesId: string) {
  let cancel = false

  if (cancelFn) cancelFn()

  cancelFn = () => {
    cancel = true
    cancelFn = null
  }

  setTimeout(() => {
    if (cancelFn) cancelFn()
  }, 500)

  managers.grayscaleStateManager
    .getSeriesGrayscaleStatistics(seriesId)
    .then((data: { id: string; data: Types.GrayscaleStatistics } | undefined) => {
      if (cancel) {
        console.log('do nothing')
      } else {
        console.log('do something')
      }

      console.log(data)
    })
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

let rectToolIsOn = ref(false)

function openRectTool() {
  const _id = id + '|primary'
  if (unref(rectToolIsOn)) {
    managers.toolsStateManager.setAToolDisabled(_id)
  } else {
    managers.toolsStateManager.addATool(_id, BidirectionalTool)
    managers.toolsStateManager.setAToolActived(_id, BidirectionalTool.toolName)
  }

  rectToolIsOn.value = !unref(rectToolIsOn)
}

let dragToolIsOn = ref(false)

function openDragProbeTool() {
  const _id = id + '|secondary'
  if (unref(dragToolIsOn)) {
    managers.toolsStateManager.setAToolDisabled(_id)
  } else {
    managers.toolsStateManager.addATool(_id, DragProbeTool)
    managers.toolsStateManager.setAToolActived(_id, DragProbeTool.toolName)
  }

  dragToolIsOn.value = !unref(dragToolIsOn)
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const sliceSync = ref(false)

function sliceSyncExchange() {
  sliceSync.value = !unref(sliceSync)
}

const pointSync = ref(false)

function pointSyncExchange() {
  pointSync.value = !unref(pointSync)
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const i18n: Ref<'en' | 'zh'> = ref('zh')

function i18nExchange() {
  if (unref(i18n) === 'en') {
    i18n.value = 'zh'
  } else {
    i18n.value = 'en'
  }
}
</script>

<template>
  <main>
    <div style="height: 525px; width: 1649px; margin: auto">
      <MedicalImage
        :id="id"
        :i18n="i18n"
        :layout="layout"
        :primary="primaryObj"
        :prefix-mark="{
          primary: { en: 'Primary', zh: '主序列' },
          secondary: { en: 'Secondary', zh: '次序列' }
        }"
        :secondary="secondaryObj"
        :slice-sync="sliceSync"
        :point-sync="pointSync"
      />
    </div>

    <div style="width: 1649px; margin: 20px auto 0">
      <div class="row">
        <select @change="changeLayout">
          <option :value="CONSTANT.Layout.Primary">Primary</option>
          <option :value="CONSTANT.Layout.Secondary">Secondary</option>
          <option :value="CONSTANT.Layout.SideBySide">SideBySide</option>
        </select>

        <button :style="{ background: rectToolIsOn ? 'gold' : '' }" @click="openRectTool">
          BidirectionalTool
        </button>

        <button :style="{ background: dragToolIsOn ? 'gold' : '' }" @click="openDragProbeTool">
          DragProbeTool
        </button>

        <button :style="{ background: sliceSync ? 'gold' : '' }" @click="sliceSyncExchange">
          Slice Sync
        </button>

        <button :style="{ background: pointSync ? 'gold' : '' }" @click="pointSyncExchange">
          Point Sync
        </button>

        <button @click="i18nExchange">I18n</button>
      </div>

      <div class="row">
        <button @click="renderCT">Render CT</button>
        <button @click="renderPT">Render PT</button>
        <button @click="renderAll">Render ALL</button>
      </div>

      <div class="row">
        <button @click="unRenderCT">UnRender CT</button>
        <button @click="unRenderPT">UnRender PT</button>
        <button @click="unRenderAll">UnRender ALL</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.row {
  margin-bottom: 10px;
}

.row * {
  margin-right: 5px;
}
</style>
