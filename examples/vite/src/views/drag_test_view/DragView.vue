<script setup lang="ts">
import { ref, unref } from 'vue'
import MedicalImage, { CONSTANT, managers, tools, utilities } from 'our-medical'

import initFrameModule from './frame'
import initOriginModule from './origin'
import initShotModule from './shot'
import initNailModule from './nail'
import initImageCenter from './imageCenter'
import initCouchModule from './couch'
import initFiducialModule from './fiducial'
import initDosePtModule from './dose_point'

import { cache, utilities as csUtilites } from '@cornerstonejs/core'
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader'
import { SeriesNames, useSeriesProps } from '@/scripts/composables'

const activedColor = 'gold'
const componentId = 'draggableToolTest'
const patientModelId = 'patientModelId'

const layout = ref(CONSTANT.Layout.Primary)

function changeLayout(e: GlobalEventHandlersEventMap['change']): void {
  const { target } = e
  layout.value = (target as HTMLSelectElement).value as CONSTANT.Layout
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */
const { props: priProps, propsRefs: priPreosRefs } = useSeriesProps(SeriesNames.a_hfs_ct_ohif)

const { props: secProps, propsRefs: secPropsRefs } = useSeriesProps(SeriesNames.a_hfs_pt_ohif)

function renderAll() {
  priPreosRefs.studiesId = priProps.studiesId
  priPreosRefs.seriesId = priProps.seriesId
  priPreosRefs.instances = priProps.instances
  priPreosRefs.modality = priProps.modality

  secPropsRefs.studiesId = secProps.studiesId
  secPropsRefs.seriesId = secProps.seriesId
  secPropsRefs.instances = secProps.instances
  secPropsRefs.modality = secProps.modality
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const { draggableStateManager, toolsStateManager } = managers

utilities.getInitialized().then(() => {
  // toolsStateManager.addATool(componentId, tools.DraggableDisplayTool)
  // toolsStateManager.addATool(componentId, tools.DraggableTool)
  // toolsStateManager.setDraggableDisplayToolEnabled(componentId)
})

const dragToolOn = ref(false)

function dragToolExchange() {
  if (unref(dragToolOn)) {
    toolsStateManager.setDraggableToolDisabled(componentId)
  } else {
    toolsStateManager.setDraggableToolActived(componentId)
  }

  dragToolOn.value = !unref(dragToolOn)
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const frameModule = initFrameModule(componentId, patientModelId)
const originModule = initOriginModule(componentId, patientModelId)
const shotModule = initShotModule(componentId, patientModelId)
const nailModule = initNailModule(componentId, patientModelId)
const imageCenter = initImageCenter(componentId, patientModelId)
const couchModule = initCouchModule(componentId, patientModelId)
const fiducialModule = initFiducialModule(componentId, patientModelId)
const dosePtModule = initDosePtModule(componentId, patientModelId)

const levelData = ref([
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
    unref(levelData).map((v) => ({ ...v })),
    [componentId]
  )
}

const planId_P = 'currentPlanShotGroupId'

const toolPri = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P

function loadPri() {
  // const headers = new Headers()
  // headers.append('Content-Type', 'application/octet-stream')
  fetch('/dose.vti', { method: 'get' }).then(async (response) => {
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

function addDragTool() {
  toolsStateManager.addATool(componentId, tools.DraggableDisplayTool)
  toolsStateManager.addATool(componentId, tools.DraggableTool)

  toolsStateManager.setDraggableDisplayToolEnabled(componentId)
}

function loadDose() {
  addLevelData()
  managers.toolsStateManager.addATool(componentId, tools.DoseDisplayTool)
  managers.toolsStateManager.setAToolEnabled(componentId, tools.DoseDisplayTool.toolName)
  managers.planStateManager.dose.setDisplayType(CONSTANT.DOSE_DISPLAY_TYPES.F, [componentId])
  loadPri()
}
</script>

<template>
  <main>
    <div style="height: 525px; width: 1649px; margin: auto">
      <MedicalImage
        :id="componentId"
        :layout="layout"
        :primary="priPreosRefs"
        :prefix-mark="{
          primary: { en: 'Current', zh: '当前计划' },
          secondary: { en: 'Compare', zh: '比较计划' }
        }"
        :secondary="secPropsRefs"
      />
    </div>

    <div style="width: 1649px; margin: 20px auto 0">
      <div class="row">
        <select @change="changeLayout">
          <option :value="CONSTANT.Layout.Primary">Primary</option>
          <option :value="CONSTANT.Layout.Secondary">Secondary</option>
          <option :value="CONSTANT.Layout.SideBySide">SideBySide</option>
        </select>

        <button @click="renderAll">Render ALL</button>

        <button :style="{ background: dragToolOn ? activedColor : '' }" @click="dragToolExchange">
          Draggable Tool Exchange
        </button>

        <button @click="addDragTool">Add DragTool</button>
        <button @click="loadDose">Load Dose</button>
      </div>

      <!-- origin -->
      <div class="row">
        <h5>Origin State Modify</h5>
        <button
          :style="{
            background: originModule.draggable[draggableStateManager.DraggableElementType.origin]
              ? activedColor
              : ''
          }"
          @click="originModule.setDraggable"
        >
          Origin Draggable
        </button>

        <button
          :style="{
            background: originModule.visible[draggableStateManager.DraggableElementType.origin]
              ? activedColor
              : ''
          }"
          @click="originModule.setVisible"
        >
          Origin Visible
        </button>

        <label>
          X:
          <input
            type="number"
            :value="originModule.positionRef.value[0]"
            @change="originModule.originModified($event, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="originModule.positionRef.value[1]"
            @change="originModule.originModified($event, 1)"
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            :value="originModule.positionRef.value[2]"
            @change="originModule.originModified($event, 2)"
          />
        </label>
      </div>

      <div class="row">
        <h5>Image Center</h5>
        <button
          :style="{
            background: imageCenter.draggable.primary ? activedColor : ''
          }"
          @click="imageCenter.setDraggable"
        >
          ImageCenter Draggable
        </button>

        <button
          :style="{
            background: imageCenter.visible.primary ? activedColor : ''
          }"
          @click="imageCenter.setVisible"
        >
          ImageCenter Visible
        </button>

        <button @click="() => imageCenter.addCenter(originModule.positionRef.value)">Add</button>

        <button @click="imageCenter.deleteCenter">Delete</button>

        <label>
          X:
          <input
            type="number"
            :value="imageCenter.centerRef.value[0]"
            @change="imageCenter.centerModified($event, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="imageCenter.centerRef.value[1]"
            @change="imageCenter.centerModified($event, 1)"
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            :value="imageCenter.centerRef.value[2]"
            @change="imageCenter.centerModified($event, 2)"
          />
        </label>
      </div>

      <div class="row">
        <h5>Fiducial markers Modify</h5>

        <button
          :style="{ background: fiducialModule.draggable.primary ? activedColor : '' }"
          @click="fiducialModule.setDraggable"
        >
          Markers Draggable
        </button>
        <button
          :style="{ background: fiducialModule.visible.primary ? activedColor : '' }"
          @click="fiducialModule.setVisible"
        >
          Markers Visible
        </button>

        <button @mousedown="fiducialModule.addMarker">Add</button>

        <label>
          MarkerID:
          <input :value="fiducialModule.markerIdRef.value" readonly />
        </label>
        <label>
          X:<input
            type="number"
            :value="fiducialModule.postionRef.value[0]"
            @change="(e) => fiducialModule.markerPositionModified(e, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="fiducialModule.postionRef.value[1]"
            @change="(e) => fiducialModule.markerPositionModified(e, 1)"
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            :value="fiducialModule.postionRef.value[2]"
            @change="(e) => fiducialModule.markerPositionModified(e, 2)"
          />
        </label>
      </div>

      <div class="row">
        <h5>Shot State Modify</h5>

        <button
          :style="{ background: shotModule.draggable.primary ? activedColor : '' }"
          @click="shotModule.setDraggable"
        >
          Shot Draggable
        </button>
        <button
          :style="{ background: shotModule.visible.primary ? activedColor : '' }"
          @click="shotModule.setVisible"
        >
          Shot Visible
        </button>

        <button @mousedown="shotModule.dragAddShot">Add Shot</button>
        <button @mousedown="shotModule.removeShot">Remove Shot</button>
      </div>

      <div class="row">
        <label>
          ShotID:
          <input :value="shotModule.shotId.value" @change="shotModule.setShotId" />
        </label>
        <label>
          X:<input
            type="number"
            :value="shotModule.shotPosition.value[0]"
            @change="(e) => shotModule.setPosition(e, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="shotModule.shotPosition.value[1]"
            @change="(e) => shotModule.setPosition(e, 1)"
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            :value="shotModule.shotPosition.value[2]"
            @change="(e) => shotModule.setPosition(e, 2)"
          />
        </label>
        <label>
          Num:
          <input
            type="number"
            :value="shotModule.shotNumber.value"
            @change="shotModule.setNumber"
          />
        </label>
        <label>
          Size:
          <input
            type="number"
            :value="shotModule.shotCollSize.value"
            @change="shotModule.setSize"
          />
        </label>
      </div>

      <div class="row">
        <h5>Frame State Modify</h5>

        <button
          :style="{ background: frameModule.extractedDraggable.primary ? activedColor : '' }"
          @click="frameModule.setExtractedDraggable"
        >
          Extracted Draggable
        </button>
        <button @click="frameModule.autoRegist">Auto</button>
        <button @click="frameModule.manualRegist">Manual</button>
        <button @click="frameModule.sureFrame">Sure</button>
        <button @click="frameModule.frameRegisted">Registed</button>
        <button
          :style="{ background: frameModule.extractedVisible.primary ? activedColor : '' }"
          @click="frameModule.setExtractedVisible"
        >
          Extracted Visible
        </button>
        <button
          :style="{ background: frameModule.fittingVisible.primary ? activedColor : '' }"
          @click="frameModule.setFittingVisible"
        >
          Fitting Visible
        </button>
        <button
          :style="{ background: frameModule.physicsVisible.primary ? activedColor : '' }"
          @click="frameModule.setPhysicsVisible"
        >
          Physics Visible
        </button>
        <button @click="frameModule.resetExtractedPoints">Reset Extracted Data</button>

        <label>
          X:<input
            type="number"
            :value="frameModule.currFrameExtractedPosition.value[0]"
            @change="(e) => frameModule.setPosition(e, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="frameModule.currFrameExtractedPosition.value[1]"
            @change="(e) => frameModule.setPosition(e, 1)"
          />
        </label>
        <label>
          Z:
          <input :value="frameModule.currFrameExtractedPosition.value[2]" readonly />
        </label>
      </div>

      <div class="row">
        <h5>Nail Modify</h5>

        <button
          :style="{ background: nailModule.nailDraggable.primary ? activedColor : '' }"
          @click="nailModule.setDraggable"
        >
          Nail Draggable
        </button>
        <button @mousedown="nailModule.startDrag">Add Nail</button>

        <select @change="nailModule.nailChange">
          <option
            v-for="(item, index) in nailModule.nailsData"
            :selected="nailModule.selectedNail.value === index"
            :key="item.key"
            :value="item.key"
          >
            {{ item.name }}
          </option>
        </select>
        <button
          :style="{ background: nailModule.nailVisible.primary ? activedColor : '' }"
          @click="nailModule.setVisible"
        >
          Nail Visible
        </button>

        <label>
          X:<input
            type="number"
            :value="nailModule.positionRef.value[0]"
            @change="(e) => nailModule.setPosition(e, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="nailModule.positionRef.value[1]"
            @change="(e) => nailModule.setPosition(e, 1)"
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            :value="nailModule.positionRef.value[2]"
            @change="(e) => nailModule.setPosition(e, 2)"
          />
        </label>
      </div>

      <div class="row">
        <h5>Couch Modify</h5>

        <button
          :style="{ background: couchModule.draggable.primary ? activedColor : '' }"
          @click="couchModule.setDraggable"
        >
          Couch Draggable
        </button>

        <button
          :style="{ background: couchModule.visible.primary ? activedColor : '' }"
          @click="couchModule.setVisible"
        >
          Couch Visible
        </button>

        <button @mousedown="couchModule.addPrimary">Add</button>

        <button @mousedown="couchModule.removePrimary">Delete</button>

        <label>
          X:<input
            type="number"
            :value="couchModule.couchRef.value[0]"
            @change="(e) => couchModule.couchModified(e, 0)"
          />
        </label>
        <label>
          Y:
          <input
            type="number"
            :value="couchModule.couchRef.value[1]"
            @change="(e) => couchModule.couchModified(e, 1)"
          />
        </label>
        <label>
          Z:
          <input
            type="number"
            :value="couchModule.couchRef.value[2]"
            @change="(e) => couchModule.couchModified(e, 2)"
          />
        </label>
      </div>

      <div class="row">
        <h5>Dose Point State Modify</h5>

        <button
          :style="{ background: dosePtModule.draggable.primary ? activedColor : '' }"
          @click="dosePtModule.setDraggable"
        >
          DosePt Draggable
        </button>

        <button
          :style="{ background: dosePtModule.visible.primary ? activedColor : '' }"
          @click="dosePtModule.setVisible"
        >
          DosePt Visible
        </button>

        <button @mousedown="dosePtModule.dragAddDosePt">Add DosePt</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.row {
  margin-bottom: 5px;
}

.row * {
  margin-right: 5px;
  outline: none;
  border: none;
  border-radius: 3px;
  font-size: 14px;
}

.row h5 {
  margin: 15px 0 5px;
  color: burlywood;
}

.row label {
  color: white;
}
</style>
