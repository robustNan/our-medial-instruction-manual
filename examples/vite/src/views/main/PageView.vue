<script setup lang="ts">
import { CONSTANT, managers, utilities } from 'our-medical'
import { ref, unref } from 'vue'

import { Discovery, Optima } from '@/data/electron_density'
import { SeriesNames, useSeriesProps } from '@/scripts/composables'

import DoseBlock from './DoseBlock.vue'
import SegmentationBlock from './SegmentationBlock.vue'

import type { Ref } from 'vue'

const { densityStateManager } = managers

densityStateManager.setElectronDensity(Optima.id, Optima.data)
densityStateManager.setElectronDensity(Discovery.id, Discovery.data)

const { Layout } = CONSTANT

const id = 'dose_&_segmentation'
const layout = ref(Layout.SideBySide)

function changeLayout(e: Event): void {
  const { target } = e
  layout.value = (target as HTMLSelectElement).value as CONSTANT.Layout
}

const axisLayout = ref(CONSTANT.AxisLayout.Horizontal)

function changeAxisLayout(e: Event): void {
  const { target } = e
  axisLayout.value = (target as HTMLSelectElement).value as CONSTANT.AxisLayout
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const { props: priProps, propsRefs: priPreosRefs } = useSeriesProps(SeriesNames.a_hfs_ct_ohif)
const { props: secProps, propsRefs: secPropsRefs } = useSeriesProps(SeriesNames.a_hfs_pt_ohif)

function renderPrimary() {
  priPreosRefs.studiesId = priProps.studiesId
  priPreosRefs.seriesId = priProps.seriesId
  priPreosRefs.instances = priProps.instances
  priPreosRefs.modality = priProps.modality
}

function renderSecondary() {
  secPropsRefs.studiesId = secProps.studiesId
  secPropsRefs.seriesId = secProps.seriesId
  secPropsRefs.instances = secProps.instances
  secPropsRefs.modality = secProps.modality
}

function renderAll() {
  renderPrimary()
  renderSecondary()
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

function unRenderPrimary() {
  priPreosRefs.studiesId = ''
  priPreosRefs.seriesId = ''
  priPreosRefs.instances = []
  priPreosRefs.modality = ''
}

function unRenderSecondary() {
  secPropsRefs.studiesId = ''
  secPropsRefs.seriesId = ''
  secPropsRefs.instances = []
  secPropsRefs.modality = ''
}

function unRenderAll() {
  unRenderPrimary()
  unRenderSecondary()
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const activedColor = 'gold'
const sliceSync = ref(true)
const pointSync = ref(true)
const setSliceSync = () => (sliceSync.value = !unref(sliceSync))
const setPointSync = () => (pointSync.value = !unref(pointSync))

const i18n: Ref<'en' | 'zh'> = ref('zh')

function i18nExchange() {
  if (unref(i18n) === 'en') {
    i18n.value = 'zh'
  } else {
    i18n.value = 'en'
  }
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const segmentationBlockRef = ref()

function capture() {
  let promise: Promise<string | void>
  if (segmentationBlockRef.value.volumeList[0].segmentationId) {
    const segmentation = {
      id: segmentationBlockRef.value.volumeList[0].segmentationId,
      index: segmentationBlockRef.value.volumeList[0].segmentIndex
    }
    promise = utilities.captureImage(id, segmentation)
  } else promise = utilities.captureImage(id)

  promise.then((v) => {
    console.log(v)
  })
}
</script>

<template>
  <div class="display-area">
    <MedicalImage
      :id="id"
      :i18n="i18n"
      :layout="layout"
      :axis-layout="axisLayout"
      :primary="priPreosRefs"
      :prefix-mark="{
        primary: { en: 'Primary', zh: '主序列' },
        secondary: { en: 'Secondary', zh: '次序列' }
      }"
      :secondary="secPropsRefs"
      :slice-sync="sliceSync"
      :point-sync="pointSync"
    />
  </div>

  <div class="component-operating">
    <div class="row">
      <select @change="changeLayout">
        <option :selected="layout === Layout.Primary" :value="Layout.Primary">Primary</option>
        <option :selected="layout === Layout.Secondary" :value="Layout.Secondary">Secondary</option>
        <option :selected="layout === Layout.SideBySide" :value="Layout.SideBySide">
          SideBySide
        </option>
      </select>

      <select @change="changeAxisLayout">
        <option :value="CONSTANT.AxisLayout.Horizontal">Horizontal</option>
        <option :value="CONSTANT.AxisLayout.Vertical">Vertical</option>
      </select>

      <button @click="i18nExchange">I18n</button>
      <button :style="{ background: sliceSync ? activedColor : '' }" @click="setSliceSync">
        Slice Sync
      </button>
      <button :style="{ background: pointSync ? activedColor : '' }" @click="setPointSync">
        Point Sync
      </button>
      <button @click="capture">Capture Viewports</button>
    </div>

    <div class="row">
      <button @click="renderPrimary">Render Pri</button>
      <button @click="renderSecondary">Render Sec</button>
      <button @click="renderAll">Render ALL</button>

      <button @click="unRenderPrimary">UnRender Pri</button>
      <button @click="unRenderSecondary">UnRender Sec</button>
      <button @click="unRenderAll">UnRender ALL</button>
    </div>
  </div>

  <div class="tools">
    <SegmentationBlock ref="segmentationBlockRef" :id="id" :priProps="priProps" />
    <DoseBlock :id="id" :priProps="priProps" :secProps="secProps" />
  </div>
</template>

<style scoped>
.tools {
  display: flex;
  justify-content: space-between;
}
</style>
