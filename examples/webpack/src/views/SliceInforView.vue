<script setup lang="ts">
import { ref, unref } from "vue";
import MedicalImage, { CONSTANT, managers, utilities } from "our-medical";
import { Discovery, Optima } from "@/data/electron_density";
import { SeriesNames, useSeriesProps } from "@/scripts/composables";

managers.densityStateManager.setElectronDensity(Optima.id, Optima.data);
managers.densityStateManager.setElectronDensity(Discovery.id, Discovery.data);

const { Layout } = CONSTANT;

const id = "slice";
const layout = ref(Layout.SideBySide);

function changeLayout(e: Event): void {
  const { target } = e;
  layout.value = (target as HTMLSelectElement).value as CONSTANT.Layout;
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const { props: priProps, propsRefs: priPreosRefs } = useSeriesProps(
  SeriesNames.a_hfs_ct_ohif
);
priPreosRefs.densityId = Discovery.id;

const { props: secProps, propsRefs: secPropsRefs } = useSeriesProps(
  SeriesNames.a_hfs_pt_ohif
);

function renderPrimary() {
  priPreosRefs.studiesId = priProps.studiesId;
  priPreosRefs.seriesId = priProps.seriesId;
  priPreosRefs.instances = priProps.instances;
  priPreosRefs.modality = priProps.modality;
}

function renderSecondary() {
  secPropsRefs.studiesId = secProps.studiesId;
  secPropsRefs.seriesId = secProps.seriesId;
  secPropsRefs.instances = secProps.instances;
  secPropsRefs.modality = secProps.modality;
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

function renderAll() {
  renderPrimary();
  renderSecondary();
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const activedColor = "gold";

const sliceSync = ref(true);

function setSliceSync() {
  sliceSync.value = !unref(sliceSync);
}

const pointSync = ref(true);

function setPointSync() {
  pointSync.value = !unref(pointSync);
}

function captureImage() {
  utilities.captureImage(id).then((value) => {
    console.log(value);
  });
}
</script>

<template>
  <main>
    <div style="height: 525px; width: 1649px; margin: auto">
      <MedicalImage
        :id="id"
        :layout="layout"
        :primary="priPreosRefs"
        :prefix-mark="{
          primary: { en: 'Primary', zh: '主序列' },
          secondary: { en: 'Secondary', zh: '次序列' },
        }"
        :secondary="secPropsRefs"
        :slice-sync="sliceSync"
        :point-sync="pointSync"
        :axis-layout="CONSTANT.AxisLayout.Horizontal"
      />
    </div>

    <div style="width: 1649px; margin: 20px auto 0">
      <div class="row">
        <select @change="changeLayout">
          <option :selected="layout === Layout.Primary" :value="Layout.Primary">
            Primary
          </option>
          <option
            :selected="layout === Layout.Secondary"
            :value="Layout.Secondary"
          >
            Secondary
          </option>
          <option
            :selected="layout === Layout.SideBySide"
            :value="Layout.SideBySide"
          >
            SideBySide
          </option>
          <option :selected="layout === Layout.Fusion" :value="Layout.Fusion">
            Fusion
          </option>
        </select>

        <button @click="renderAll">Render ALL</button>

        <button
          :style="{ background: sliceSync ? activedColor : '' }"
          @click="setSliceSync"
        >
          Slice Sync
        </button>

        <button
          :style="{ background: pointSync ? activedColor : '' }"
          @click="setPointSync"
        >
          Point Sync
        </button>

        <button @click="captureImage">Capture</button>
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
