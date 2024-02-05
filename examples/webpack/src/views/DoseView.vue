<script setup lang="ts">
import { ref, unref } from "vue";
import { cache, utilities as csUtilites } from "@cornerstonejs/core";

import vtkXMLImageDataReader from "@kitware/vtk.js/IO/XML/XMLImageDataReader";

import MedicalImage, {
  CONSTANT,
  managers,
  tools,
  utilities,
} from "our-medical";
import { Discovery, Optima } from "@/data/electron_density";
import { SeriesNames, useSeriesProps } from "@/scripts/composables";

managers.densityStateManager.setElectronDensity(Optima.id, Optima.data);
managers.densityStateManager.setElectronDensity(Discovery.id, Discovery.data);

const { Layout, DOSE_LEGENDS, DOSE_DISPLAY_TYPES } = CONSTANT;

const id = "dose";
const toolPri = id + "|" + CONSTANT.TOOL_GROUP_TYPE.P;
const toolSec = id + "|" + CONSTANT.TOOL_GROUP_TYPE.S;
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

function renderAll() {
  renderPrimary();
  renderSecondary();
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

// const activedColor = 'gold'

const levelData = ref([
  { color: "rgb(208, 0, 0)", absolute: 5344 * 1, relative: 100, visible: true },
  {
    color: "rgb(254, 0, 0)",
    absolute: 5344 * 0.95,
    relative: 95,
    visible: true,
  },
  {
    color: "rgb(254, 100, 12)",
    absolute: 5344 * 0.9,
    relative: 90,
    visible: true,
  },
  {
    color: "rgb(254, 180, 0)",
    absolute: 5344 * 0.85,
    relative: 85,
    visible: true,
  },
  {
    color: "rgb(248, 248, 0)",
    absolute: 5344 * 0.8,
    relative: 80,
    visible: true,
  },
  {
    color: "rgb(156, 254, 0)",
    absolute: 5344 * 0.7,
    relative: 70,
    visible: true,
  },
  {
    color: "rgb(0, 200, 0)",
    absolute: 5344 * 0.6,
    relative: 60,
    visible: true,
  },
  {
    color: "rgb(0, 254, 208)",
    absolute: 5344 * 0.5,
    relative: 50,
    visible: true,
  },
  {
    color: "rgb(0, 212, 254)",
    absolute: 5344 * 0.4,
    relative: 40,
    visible: true,
  },
  {
    color: "rgb(0, 140, 254)",
    absolute: 5344 * 0.3,
    relative: 30,
    visible: true,
  },
  {
    color: "rgb(0, 0, 192)",
    absolute: 5344 * 0.2,
    relative: 20,
    visible: true,
  },
  {
    color: "rgb(32, 0, 112)",
    absolute: 5344 * 0.1,
    relative: 10,
    visible: true,
  },
]);

function addLevelData() {
  managers.planStateManager.dose.setLevel(
    unref(levelData).map((v) => ({ ...v })),
    [id]
  );
}

function visibleExchange(e: Event, i: number) {
  const target = e.target as HTMLInputElement;
  const checked = target.checked;

  levelData.value[i].visible = checked;
  addLevelData();
}

const planId_P = "currentPlanShotGroupId";
const planId_S = "comparePlanShotGroupId";

function display() {
  addLevelData();
  managers.toolsStateManager.addATool(id, tools.DoseDisplayTool);
  managers.toolsStateManager.setAToolEnabled(
    id,
    tools.DoseDisplayTool.toolName
  );
}

function loadPri() {
  fetch("/dose.vti", { method: "get" }).then(async (response) => {
    if (response.status === 200) {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const imageDataReader = vtkXMLImageDataReader.newInstance();
      imageDataReader.parseAsArrayBuffer(arrayBuffer);

      // dose data
      const imageData = imageDataReader.getOutputData();

      const volumeId = utilities.idGenerator.seriesIdToVolumeId(
        priProps.seriesId
      );
      const volume = cache.getVolume(volumeId);
      const { origin } = volume;

      imageData.setOrigin(origin);

      managers.planStateManager.dose.setDoseData(planId_P, imageData, [
        toolPri,
      ]);
      managers.planStateManager.plan.setPlanId(toolPri, planId_P);

      console.log(
        "dose data range",
        csUtilites.getMinMax(imageData.getPointData().getScalars().getData())
      );
    }
  });
}

function loadSec() {
  // const headers = new Headers()
  // headers.append('Content-Type', 'application/octet-stream')
  fetch("/dose.vti", { method: "get" }).then(async (response) => {
    if (response.status === 200) {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const imageDataReader = vtkXMLImageDataReader.newInstance();
      imageDataReader.parseAsArrayBuffer(arrayBuffer);

      // dose data
      const imageData = imageDataReader.getOutputData();

      const volumeId = utilities.idGenerator.seriesIdToVolumeId(
        secProps.seriesId
      );
      const volume = cache.getVolume(volumeId);
      const { origin } = volume;

      imageData.setOrigin(origin);

      managers.planStateManager.dose.setDoseData(planId_S, imageData, [
        toolSec,
      ]);
      managers.planStateManager.plan.setPlanId(toolSec, planId_S);
    }
  });
}

function deleteDose() {
  managers.planStateManager.dose.deleteDoseData(planId_P, [toolPri]);
  managers.planStateManager.dose.deleteDoseData(planId_S, [toolSec]);
}

function legendTypeChange(v: CONSTANT.DOSE_LEGENDS) {
  managers.planStateManager.dose.setLegendsType(v, [id]);
}

function displayTypeChange(v: CONSTANT.DOSE_DISPLAY_TYPES) {
  managers.planStateManager.dose.setDisplayType(v, [id]);
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const imageURL = ref("");

/**
 * @description 验证SVG导出为PNG图片
 */
function svgToImageData() {
  utilities.captureImage(id).then((value) => {
    console.log(value);
    if (typeof value === "string") imageURL.value = value;
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
        :axis-layout="CONSTANT.AxisLayout.Horizontal"
        slice-sync
        point-sync
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
        </select>

        <button @click="renderAll">Render ALL</button>
        <button @click="loadPri">Load Pri</button>
        <button @click="loadSec">Load Sec</button>
        <button @click="deleteDose">Delete Dose</button>
        <button @click="display">Display Dose</button>
      </div>

      <div class="row">
        <button @click="legendTypeChange(DOSE_LEGENDS.A)">Absolute</button>
        <button @click="legendTypeChange(DOSE_LEGENDS.R)">Relative</button>
        <button @click="svgToImageData">Capture Viewports</button>
        <button @click="displayTypeChange(DOSE_DISPLAY_TYPES.L)">Line</button>
        <button @click="displayTypeChange(DOSE_DISPLAY_TYPES.F)">Fill</button>
      </div>

      <div class="row">
        <table border="1">
          <thead>
            <th>Absolute</th>
            <th>Relative</th>
            <th>Visible</th>
          </thead>
          <tbody>
            <tr v-for="(item, index) in levelData" :key="index">
              <td>{{ item.absolute.toFixed(2) }}</td>
              <td>{{ item.relative }}</td>
              <td>
                <input
                  type="checkbox"
                  :checked="item.visible"
                  @change="(e) => visibleExchange(e, index)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <img :src="imageURL" />
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
