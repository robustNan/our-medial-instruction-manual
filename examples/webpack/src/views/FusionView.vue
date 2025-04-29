<script setup lang="ts">
import { SeriesNames, useSeriesProps } from "@/scripts/composables";
import { eventTarget } from "@cornerstonejs/core";
import { vec3 } from "gl-matrix";
import MedicalImage, {
  CONSTANT,
  managers,
  tools,
  utilities,
} from "our-medical";
import { nextTick, reactive, ref, unref, watch } from "vue";

import type { Types as coreTypes } from "@cornerstonejs/core";
import type { Types } from "our-medical";

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

// const { props: priProps, propsRefs: priPreosRefs } = useSeriesProps(SeriesNames.cbos_ct)
// const { props: secProps, propsRefs: secPropsRefs } = useSeriesProps(SeriesNames.cbos_mr)

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

const activedColor = "gold";
const registrationRef = ref(false);

function manual() {
  if ((registrationRef.value = !unref(registrationRef))) {
    managers.toolsStateManager.addATool(
      id + "|" + CONSTANT.TOOL_GROUP_TYPE.P,
      tools.ManualRegistrationTool
    );
    managers.toolsStateManager.setAToolActived(
      id + "|" + CONSTANT.TOOL_GROUP_TYPE.P,
      tools.ManualRegistrationTool.toolName
    );
  } else {
    managers.toolsStateManager.setAToolDisabled(
      id + "|" + CONSTANT.TOOL_GROUP_TYPE.P,
      tools.ManualRegistrationTool.toolName
    );
  }
}

const state = reactive({
  degrees: [0, 0, 0],
  translation: [0, 0, 0],
});

function reset() {
  // 接受过配准的序列reset时应该调用setVolumeFromOriginal而不是这里的resetVolume
  const options = {
    componentIds: [id],
    angle: [0, 0, 0] as coreTypes.Point3,
    translation: [0, 0, 0] as coreTypes.Point3,
    isDegrees: true,
  };
  managers.volumeStateManager.setVolumeTransform(
    secPropsRefs.seriesId,
    options,
    true
  );
}

function auto() {
  const priVolumeProps = managers.seriesStateManager.getVolumeProps(
    utilities.idGenerator.seriesIdToVolumeId(priPreosRefs.seriesId)
  );
  const secVolumeProps = managers.seriesStateManager.getVolumeProps(
    utilities.idGenerator.seriesIdToVolumeId(secPropsRefs.seriesId)
  );

  if (priVolumeProps && secVolumeProps) {
    const translation = vec3.subtract(
      vec3.create(),
      priVolumeProps.center,
      secVolumeProps.center
    );
    const options = {
      componentIds: [id],
      angle: [...state.degrees] as coreTypes.Point3,
      translation: translation as coreTypes.Point3,
      isDegrees: true,
    };
    managers.volumeStateManager.setVolumeTransform(
      secPropsRefs.seriesId,
      options,
      true
    );
  }
}

eventTarget.addEventListener(
  CONSTANT.Events.VOLUME_TRANSFORM,
  (e: Types.EventTypes.VolumeTransformEvent) => {
    const { degrees, translation } = e.detail.state;
    state.degrees[0] = degrees[0];
    state.degrees[1] = degrees[1];
    state.degrees[2] = degrees[2];

    state.translation[0] = translation[0];
    state.translation[1] = translation[1];
    state.translation[2] = translation[2];
  }
);

function transformInputEnterHandler() {
  const options = {
    componentIds: [id],
    angle: [...state.degrees] as coreTypes.Point3,
    translation: [...state.translation] as coreTypes.Point3,
    isDegrees: true,
  };
  managers.volumeStateManager.setVolumeTransform(
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
  <div class="display-area">
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

  <div class="component-operating">
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
      <button
        :style="{
          background: registrationRef ? activedColor : '',
        }"
        @click="manual"
      >
        Manual Registration
      </button>
      <button @click="reset">Reset</button>
    </div>
  </div>

  <div class="tools">
    <div class="tool-operating">
      <div class="row">
        <label for="">
          <!-- <input type="number" v-model="transparency" /> -->
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            v-model="transparency"
            style="width: 500px"
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
        <label>
          <span>min {{ secondaryRange[0] }}:</span>
          <input :value="secondaryVOI[0]" readonly />
        </label>

        <label>
          <span>max {{ secondaryRange[1] }}:</span>
          <input type="number" step="1" v-model="secondaryVOI[1]" />
        </label>
      </div>

      <div class="row">
        <label>
          <span>R-L (mm):</span>
          <input
            type="number"
            step="1"
            v-model="state.translation[0]"
            @keydown.enter="transformInputEnterHandler"
          />
        </label>
        <label>
          <span>A-P (mm):</span>
          <input
            type="number"
            step="1"
            v-model="state.translation[1]"
            @keydown.enter="transformInputEnterHandler"
          />
        </label>
        <label>
          <span>I-S (mm):</span>
          <input
            type="number"
            step="1"
            v-model="state.translation[2]"
            @keydown.enter="transformInputEnterHandler"
          />
        </label>
      </div>

      <div class="row">
        <label>
          <span>φ (°):</span>
          <input
            type="number"
            step="1"
            v-model="state.degrees[0]"
            @keydown.enter="transformInputEnterHandler"
          />
        </label>
        <label>
          <span>θ (°):</span>
          <input
            type="number"
            step="1"
            v-model="state.degrees[1]"
            @keydown.enter="transformInputEnterHandler"
          />
        </label>
        <label>
          <span>ψ (°):</span>
          <input
            type="number"
            step="1"
            v-model="state.degrees[2]"
            @keydown.enter="transformInputEnterHandler"
          />
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.row {
  margin-bottom: 10px;
}

.row * {
  margin-right: 5px;
}
</style>
