<script setup lang="ts">
import { nextTick, ref, unref, type Ref } from "vue";
import type { Types } from "our-medical";
import MedicalImage, { CONSTANT, managers } from "our-medical";
import { Discovery, Optima } from "@/data/electron_density";
import { SeriesNames, useSeriesProps } from "@/scripts/composables";

managers.densityStateManager.setElectronDensity(Optima.id, Optima.data);
managers.densityStateManager.setElectronDensity(Discovery.id, Discovery.data);

const id = "main";

const layout = ref(CONSTANT.Layout.Primary);

function changeLayout(e: Event): void {
  const { target } = e;
  layout.value = (target as HTMLSelectElement).value as CONSTANT.Layout;
}

const axisLayout = ref(CONSTANT.AxisLayout.Horizontal);

function changeAxisLayout(e: Event): void {
  const { target } = e;
  axisLayout.value = (target as HTMLSelectElement).value as CONSTANT.AxisLayout;
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const { props: priProps, propsRefs: priPreosRefs } = useSeriesProps(
  SeriesNames.a_hfs_ct_ohif
);

const { props: secProps, propsRefs: secPropsRefs } = useSeriesProps(
  SeriesNames.a_hfs_pt_ohif
);

function renderCT() {
  priPreosRefs.studiesId = priProps.studiesId;
  priPreosRefs.seriesId = priProps.seriesId;
  priPreosRefs.instances = priProps.instances;
  priPreosRefs.modality = priProps.modality;

  nextTick(() => {
    testGetSeriesGrayscaleStatistics(priPreosRefs.seriesId);
  });
}

function renderPT() {
  secPropsRefs.studiesId = secProps.studiesId;
  secPropsRefs.seriesId = secProps.seriesId;
  secPropsRefs.instances = secProps.instances;
  secPropsRefs.modality = secProps.modality;

  nextTick(() => {
    testGetSeriesGrayscaleStatistics(secPropsRefs.seriesId);
  });
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

function renderAll() {
  renderCT();
  renderPT();
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

function unRenderCT() {
  priPreosRefs.studiesId = "";
  priPreosRefs.seriesId = "";
  priPreosRefs.instances = [];
  priPreosRefs.modality = "";
}

function unRenderPT() {
  secPropsRefs.studiesId = "";
  secPropsRefs.seriesId = "";
  secPropsRefs.instances = [];
  secPropsRefs.modality = "";
}

function unRenderAll() {
  unRenderCT();
  unRenderPT();
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

/**
 * 一种取消异步获取到灰度统计数据后执行的方式,因为异步可能获取到数据时已不再需要这份数据
 * 也可以通过then中的id判断是否还需要处理这份数据
 */
// let cancelFn: (() => void) | null = null

function testGetSeriesGrayscaleStatistics(seriesId: string) {
  /* let cancel = false

  if (cancelFn) cancelFn()

  cancelFn = () => {
    cancel = true
    cancelFn = null
  }

  setTimeout(() => {
    if (cancelFn) cancelFn()
  }, 500) */

  managers.grayscaleStateManager
    .getSeriesGrayscaleStatistics(seriesId)
    .then(
      (data: { id: string; data: Types.GrayscaleStatistics } | undefined) => {
        /* if (cancel) {
        console.log('do nothing')
      } else {
        console.log('do something')
      } */

        console.log(data);
      }
    );
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const sliceSync = ref(true);
const pointSync = ref(true);
const setSliceSync = () => (sliceSync.value = !unref(sliceSync));
const setPointSync = () => (pointSync.value = !unref(pointSync));
/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const i18n: Ref<"en" | "zh"> = ref("zh");

function i18nExchange() {
  if (unref(i18n) === "en") {
    i18n.value = "zh";
  } else {
    i18n.value = "en";
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
        :axis-layout="axisLayout"
        :primary="priPreosRefs"
        :prefix-mark="{
          primary: { en: 'Primary', zh: '主序列' },
          secondary: { en: 'Secondary', zh: '次序列' },
        }"
        :secondary="secPropsRefs"
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

        <select @change="changeAxisLayout">
          <option :value="CONSTANT.AxisLayout.Horizontal">Horizontal</option>
          <option :value="CONSTANT.AxisLayout.Vertical">Vertical</option>
        </select>

        <button
          :style="{ background: sliceSync ? 'gold' : '' }"
          @click="setSliceSync"
        >
          Slice Sync
        </button>

        <button
          :style="{ background: pointSync ? 'gold' : '' }"
          @click="setPointSync"
        >
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
