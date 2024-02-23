<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import type { Types as coreTypes } from "@cornerstonejs/core";
import type { Types } from "our-medical";
import MedicalImage, { CONSTANT, managers, tools } from "our-medical";
import { SeriesNames, useSeriesProps } from "@/scripts/composables";

const { Layout } = CONSTANT;

const id = "fusion";
const layout = ref(Layout.Fusion);

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

const { props: secProps, propsRefs: secPropsRefs } = useSeriesProps(
  SeriesNames.a_hfs_pt_ohif
);

function renderCT() {
  priPreosRefs.studiesId = priProps.studiesId;
  priPreosRefs.seriesId = priProps.seriesId;
  priPreosRefs.instances = priProps.instances;
  priPreosRefs.modality = priProps.modality;

  nextTick(() => {
    testGetSeriesGrayscaleStatistics(priProps.seriesId);
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

const primaryRange = ref([0, 0]);
const secondaryRange = ref([0, 0]);

function testGetSeriesGrayscaleStatistics(seriesId: string) {
  managers.grayscaleStateManager
    .getSeriesGrayscaleStatistics(seriesId)
    .then(
      (result: { id: string; data: Types.GrayscaleStatistics } | undefined) => {
        console.log(result);

        if (result) {
          if (result.id === priPreosRefs.seriesId) {
            primaryRange.value[0] = result.data.min;
            primaryRange.value[1] = result.data.max;
          } else if (result.id === secPropsRefs.seriesId) {
            secondaryRange.value[0] = result.data.min;
            secondaryRange.value[1] = result.data.max;
          }
        }
      }
    );
}

function renderAll() {
  renderCT();
  renderPT();
}

function manual() {
  managers.toolsStateManager.addATool(
    id + "|" + CONSTANT.TOOL_GROUP_TYPE.P,
    tools.ManualRegistrationTool
  );
  managers.toolsStateManager.setAToolActived(
    id + "|" + CONSTANT.TOOL_GROUP_TYPE.P,
    tools.ManualRegistrationTool.toolName
  );
}

function reset() {
  // 接受过配准的序列reset时应该调用setVolumeFromOriginal而不是这里的resetVolume
  managers.volumeStateManager.resetVolume(secPropsRefs.seriesId, {
    componentIds: [id],
    immediate: true,
  });
}

function auto() {
  /* const options = {
    componentIds: [id],
    angle: [0.0304229, -0.00297256, -0.142616].map(v => -v) as coreTypes.Point3, // 来自ITK配准的数据需要将旋转量全部乘-1
    center: [0, -185, 121.8] as coreTypes.Point3,
    translation: [-4.669, 184.801, -95.9747].map(v => -v) as [number, number, number] // 来自ITK配准的数据需要将偏移量全部乘-1
  } */

  const options = {
    componentIds: [id],
    angle: [0.215159, -0.00553356, -0.074691].map((v) => v) as coreTypes.Point3, // FFP和FFS的序列配准数据不需要乘-1
    center: [-0.341797, -64.6582, -278.5] as coreTypes.Point3,
    translation: [-7.12317, 165.655, -174.968].map(
      (v) => -v
    ) as coreTypes.Point3, // 来自ITK配准的数据需要将偏移量全部乘-1
  };

  managers.volumeStateManager.setVolumeFromOriginal(
    secPropsRefs.seriesId,
    options
  );
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */
const rgbPresetNames = managers.volumeStateManager.getColorMap();
const selectColormap = ref("Grayscale");

function changeColormap(e: Event) {
  const { target } = e;
  const { value } = target as HTMLSelectElement;

  managers.volumeStateManager.setColor(id, value);
}

const transparency = ref(50);

watch(transparency, (value) => {
  managers.volumeStateManager.setOpacity(id, Number(value) / 100);
});

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const primaryVOI = ref([-160, 239]);

watch(
  () => primaryVOI.value[1],
  (value) => {
    managers.seriesStateManager.setVOIRange(priPreosRefs.seriesId, {
      lower: primaryVOI.value[0],
      upper: value,
    });
  }
);

watch(
  () => primaryVOI.value[0],
  (value) => {
    managers.seriesStateManager.setVOIRange(priPreosRefs.seriesId, {
      lower: value,
      upper: primaryVOI.value[1],
    });
  }
);

const secondaryVOI = ref([0, 66453]);

watch(
  () => secondaryVOI.value[1],
  (value) => {
    managers.seriesStateManager.setVOIRange(secPropsRefs.seriesId, {
      lower: 0,
      upper: value,
    });
  }
);
</script>

<template>
  <main>
    <!-- <div style="height: 525px; width: 1649px; margin: auto"> -->
    <div style="height: 725px; width: 1649px; margin: auto">
      <MedicalImage
        :id="id"
        :layout="layout"
        :primary="priPreosRefs"
        :prefix-mark="{
          primary: { en: 'Primary', zh: '主序列' },
          secondary: { en: 'Secondary', zh: '次序列' },
        }"
        :secondary="secPropsRefs"
        slice-sync
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

        <button @click="auto">Auto Registration</button>

        <button @click="manual">Manual Registration</button>

        <button @click="reset">Reset</button>
      </div>

      <div class="row">
        <label for="">
          <!-- <input type="number" v-model="transparency" /> -->
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            v-model="transparency"
          />
          {{ transparency }}
        </label>

        <select @change="changeColormap">
          <option
            v-for="item in rgbPresetNames"
            :key="item"
            :selected="selectColormap === item"
            :value="item"
          >
            {{ item }}
          </option>
        </select>
      </div>

      <div class="row">
        <label>
          <span>min {{ primaryRange[0] }}:</span>
          <input type="number" step="1" v-model="primaryVOI[0]" />
        </label>

        <label>
          <span>max {{ primaryRange[1] }}:</span>
          <input type="number" step="1" v-model="primaryVOI[1]" />
        </label>
      </div>

      <div class="row">
        <label>
          <span>min {{ secondaryRange[0] }}:</span>
          <input :value="secondaryVOI[0]" readonly />
        </label>

        <label>
          <span>max {{ secondaryRange[1] }}:</span>
          <input type="number" step="1" v-model="secondaryVOI[1]" />
        </label>
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
