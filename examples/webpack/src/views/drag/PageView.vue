<script setup lang="ts">
// import { cache, utilities as csUtilites } from '@cornerstonejs/core'
// import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader'
import MedicalImage, { CONSTANT, managers, tools } from "our-medical";
import { ref, unref } from "vue";

import { SeriesNames, useSeriesProps } from "@/scripts/composables";

import CouchBlock from "./CouchBlock.vue";
import DosePointBlock from "./DosePointBlock.vue";
import FiducialBlock from "./FiducialBlock.vue";
import FrameBlock from "./FrameBlock.vue";
import ImageAndOriginBlock from "./ImageAndOriginBlock.vue";
import NailBlock from "./NailBlock.vue";
import ShotBlock from "./ShotBlock.vue";

const activedColor = "gold";
const componentId = "draggableToolTest";
const patientModelId = "patientModelId";

const layout = ref(CONSTANT.Layout.Primary);

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

function renderAll() {
  priPreosRefs.studiesId = priProps.studiesId;
  priPreosRefs.seriesId = priProps.seriesId;
  priPreosRefs.instances = priProps.instances;
  priPreosRefs.modality = priProps.modality;

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

const { toolsStateManager } = managers;

const dragToolOn = ref(false);

function addDragTool() {
  toolsStateManager.addATool(componentId, tools.DraggableDisplayTool);
  toolsStateManager.addATool(componentId, tools.DraggableTool);

  toolsStateManager.setDraggableDisplayToolEnabled(componentId);
}

function dragToolExchange() {
  if (unref(dragToolOn)) {
    toolsStateManager.setDraggableToolDisabled(componentId);
  } else {
    toolsStateManager.setDraggableToolActived(componentId);
  }

  dragToolOn.value = !unref(dragToolOn);
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

/* const levelData = ref([
  { color: 'rgb(208, 0, 0)', absolute: 5344 * 1, relative: 100, visible: true },
  { color: 'rgb(254, 0, 0)', absolute: 5344 * 0.95, relative: 95, visible: true },
  { color: 'rgb(254, 100, 12)', absolute: 5344 * 0.9, relative: 90, visible: true },
  { color: 'rgb(254, 180, 0)', absolute: 5344 * 0.85, relative: 85, visible: true },
  { color: 'rgb(248, 248, 0)', absolute: 5344 * 0.8, relative: 80, visible: true },
  { color: 'rgb(156, 254, 0)', absolute: 5344 * 0.7, relative: 70, visible: true },
  { color: 'rgb(0, 200, 0)', absolute: 5344 * 0.6, relative: 60, visible: true },
  { color: 'rgb(0, 254, 208)', absolute: 5344 * 0.5, relative: 50, visible: true },
  { color: 'rgb(0, 212, 254)', absolute: 5344 * 0.4, relative: 40, visible: true },
  { color: 'rgb(0, 140, 254)', absolute: 5344 * 0.3, relative: 30, visible: true },
  { color: 'rgb(0, 0, 192)', absolute: 5344 * 0.2, relative: 20, visible: true },
  { color: 'rgb(32, 0, 112)', absolute: 5344 * 0.1, relative: 10, visible: true }
])

function addLevelData() {
  managers.planStateManager.dose.setLevel(
    unref(levelData).map(v => ({ ...v })),
    [componentId]
  )
}

const planId_P = 'currentPlanShotGroupId'

const toolPri = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P

function loadPri() {
  // const headers = new Headers()
  // headers.append('Content-Type', 'application/octet-stream')
  fetch('/dose.vti', { method: 'get' }).then(async response => {
    if (response.status === 200) {
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()

      const imageDataReader = vtkXMLImageDataReader.newInstance()
      imageDataReader.parseAsArrayBuffer(arrayBuffer)

      // dose data
      const imageData = imageDataReader.getOutputData()

      const volumeId = utilities.idGenerator.seriesIdToVolumeId(priProps.seriesId)
      const volume = cache.getVolume(volumeId)
      const { origin } = volume

      imageData.setOrigin(origin)

      managers.planStateManager.dose.setDoseData(planId_P, imageData, [toolPri])
      managers.planStateManager.plan.setPlanId(toolPri, planId_P)

      console.log(
        'dose data range',
        csUtilites.getMinMax(imageData.getPointData().getScalars().getData())
      )
    }
  })
}

function loadDose() {
  addLevelData()
  managers.toolsStateManager.addATool(componentId, tools.DoseDisplayTool)
  managers.toolsStateManager.setAToolEnabled(componentId, tools.DoseDisplayTool.toolName)
  managers.planStateManager.dose.setDisplayType(CONSTANT.DOSE_DISPLAY_TYPES.F, [componentId])
  loadPri()
} */
</script>

<template>
  <div class="display-area">
    <MedicalImage
      :id="componentId"
      :layout="layout"
      :primary="priPreosRefs"
      :prefix-mark="{
        primary: { en: 'Current', zh: '当前计划' },
        secondary: { en: 'Compare', zh: '比较计划' },
      }"
      :secondary="secPropsRefs"
    />
  </div>

  <div class="component-operating">
    <div class="row">
      <select @change="changeLayout">
        <option :value="CONSTANT.Layout.Primary">Primary</option>
        <option :value="CONSTANT.Layout.Secondary">Secondary</option>
        <option :value="CONSTANT.Layout.SideBySide">SideBySide</option>
      </select>

      <button @click="renderAll">Render ALL</button>

      <button
        :style="{ background: dragToolOn ? activedColor : '' }"
        @click="dragToolExchange"
      >
        Draggable Tool Exchange
      </button>

      <button @click="addDragTool">add dragTool</button>
      <!-- <button @click="loadDose">load dose</button> -->
    </div>
  </div>

  <div class="tools">
    <ImageAndOriginBlock
      :component-id="componentId"
      :model-id="patientModelId"
    />
    <FiducialBlock :component-id="componentId" :model-id="patientModelId" />
    <FrameBlock :component-id="componentId" :model-id="patientModelId" />
    <NailBlock :component-id="componentId" :model-id="patientModelId" />
    <CouchBlock :component-id="componentId" :model-id="patientModelId" />
    <ShotBlock :component-id="componentId" :model-id="patientModelId" />
    <DosePointBlock :component-id="componentId" :model-id="patientModelId" />
  </div>
</template>

<style scoped>
.tool-operating h5 {
  color: burlywood;
  font-size: 12px;
  margin: 0 0 3px;
}

.row label {
  color: white;
  font-size: 12px;
}
</style>
