<script setup lang="ts">
import { merge } from 'lodash'
import { reactive, ref, unref } from 'vue'
import MedicalImage, { CONSTANT, managers, utilities } from 'our-medical'

import {
  Enums as coreEnums,
  cache,
  RenderingEngine,
  getRenderingEngine,
  utilities as coreUtils
} from '@cornerstonejs/core'
import {
  addTool,
  Enums as toolsEnums,
  PanTool,
  SegmentationDisplayTool,
  ToolGroupManager,
  TrackballRotateTool,
  ZoomTool
} from '@cornerstonejs/tools'
import type { Types as coreTypes } from '@cornerstonejs/core'

import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray'
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader'
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes.js'
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData'
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor'
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper'

import { Discovery, Optima } from '@/data/electron_density'
import ColorMap from '@/data/color_map'
import { SeriesNames, useSeriesProps } from '@/scripts/composables'
import marchingCubesWorker from '@/scripts/marchingCubes.worker?worker'

const { densityStateManager, segmentationStateManager, toolsStateManager } = managers

densityStateManager.setElectronDensity(Optima.id, Optima.data)
densityStateManager.setElectronDensity(Discovery.id, Discovery.data)

const { Layout } = CONSTANT

const id = 'view3d'
const layout = ref(Layout.Primary)

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

function renderPrimary() {
  priPreosRefs.studiesId = priProps.studiesId
  priPreosRefs.seriesId = priProps.seriesId
  priPreosRefs.instances = priProps.instances
  priPreosRefs.modality = priProps.modality
}

function renderAll() {
  renderPrimary()
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const activedColor = 'gold'
const display = ref(false)

function segmentationDisplay() {
  if (unref(display)) {
    toolsStateManager.setAToolDisabled(id, SegmentationDisplayTool.toolName)
  } else {
    toolsStateManager.addATool(id, SegmentationDisplayTool)
    toolsStateManager.setAToolEnabled(id, SegmentationDisplayTool.toolName)
  }

  display.value = !unref(display)
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const ColorLUT: coreTypes.ColorLUT = [[0, 0, 0, 0]]
for (const iterator of ColorMap) {
  const color = iterator.split(',').map(v => Number(v))
  ColorLUT.push(color.concat(255) as coreTypes.Color)
}

const volumeBasic = { segmentationId: '', volumeValue: 0, visibility: true }
const volumeList = reactive([
  merge(
    { name: 'External', volumeId: 'external', segmentIndex: 1, color: ColorLUT[1] },
    volumeBasic
  ),
  merge({ name: 'PTV', volumeId: 'ptv', segmentIndex: 2, color: ColorLUT[2] }, volumeBasic),
  merge({ name: 'GTV', volumeId: 'gtv', segmentIndex: 3, color: ColorLUT[3] }, volumeBasic),
  merge({ name: 'Organ', volumeId: 'organ', segmentIndex: 4, color: ColorLUT[4] }, volumeBasic)
])

function importContour() {
  fetch('external-data.json').then(response => {
    response.json().then(value => {
      console.time('create external by contoursdata finish')

      const { segmentationId, volumeFillAsync /* volumeLoaderAsync */ } =
        segmentationStateManager.createSegmentationByContoursData(
          { ...volumeList[0], seriesId: priPreosRefs.seriesId },
          value
        )

      volumeList[0].segmentationId = segmentationId
      volumeList[0].volumeValue = value.volumeValue / 1000

      segmentationStateManager
        .addRepresentationsAsync(id, [segmentationId], false)
        .then(toolGroupRepresentationUIDMap => {
          if (toolGroupRepresentationUIDMap) {
            // 如果返回Map对象表示添加成功
            for (const toolGroupId of toolGroupRepresentationUIDMap.keys()) {
              // 设置toolGroup中的分割体积颜色
              segmentationStateManager.setRepresentationColor(
                toolGroupId,
                segmentationId,
                volumeList[0].segmentIndex,
                volumeList[0].color
              )
            }
          }
        })

      volumeFillAsync.then(() => {
        console.timeEnd('create external by contoursdata finish')
      })
    })
  })

  fetch('lung-data.json').then(response => {
    response.json().then(value => {
      console.time('create lung by contoursdata finish')

      const { segmentationId, volumeFillAsync } =
        segmentationStateManager.createSegmentationByContoursData(
          { ...volumeList[1], seriesId: priPreosRefs.seriesId },
          value
        )

      volumeList[1].segmentationId = segmentationId
      volumeList[1].volumeValue = value.volumeValue / 1000

      segmentationStateManager
        .addRepresentationsAsync(id, [segmentationId], false)
        .then(toolGroupRepresentationUIDMap => {
          if (toolGroupRepresentationUIDMap) {
            // 如果返回Map对象表示添加成功
            for (const toolGroupId of toolGroupRepresentationUIDMap.keys()) {
              // 设置toolGroup中的分割体积颜色
              segmentationStateManager.setRepresentationColor(
                toolGroupId,
                segmentationId,
                volumeList[1].segmentIndex,
                volumeList[1].color
              )
            }
          }
        })

      volumeFillAsync.then(() => {
        console.timeEnd('create lung by contoursdata finish')
      })
    })
  })
}

const levelPolyData = new Map()

const pool = new utilities.ThreadPool(marchingCubesWorker, navigator.hardwareConcurrency || 4)

async function importDoseVolume() {
  const response = await fetch('/dose.vti', { method: 'get' })

  const blob = await response.blob()
  const arrayBuffer = await blob.arrayBuffer()

  const imageDataReader = vtkXMLImageDataReader.newInstance()
  imageDataReader.parseAsArrayBuffer(arrayBuffer)

  // dose data
  const imageData = imageDataReader.getOutputData()

  const volumeId = utilities.idGenerator.seriesIdToVolumeId(priProps.seriesId)
  const volume = cache.getVolume(volumeId)
  const { /* metadata */ origin } = volume

  imageData.setOrigin(origin)

  /**
   * 不能将直接获取到的scalarData传入子线程，需要构建成SharedArray
   * Uncaught (in promise) RangeError: Array buffer allocation failed
   */
  const scalarData = coreUtils.createFloat32SharedArray(
    imageData.getPointData().getScalars().getNumberOfValues()
  )
  scalarData.set(imageData.getPointData().getScalars().getData())

  console.clear()
  console.time('dose-plane-time')

  const allPr = []

  for (const iterator of levelData.value) {
    allPr.push(
      pool
        .addTask({
          dimensions: imageData.getDimensions(),
          direction: imageData.getDirection(),
          origin,
          scalarData,
          spacing: imageData.getSpacing(),
          value: iterator.absolute
        })
        .then((data: any) => {
          const polyData = vtkPolyData.newInstance()

          polyData.getPoints().setData(data.points, 3)
          polyData.getPolys().setData(data.polys)

          const nData = new Float32Array(data.pointData)
          const normals = vtkDataArray.newInstance({
            numberOfComponents: 3,
            values: nData,
            name: 'Normals'
          })
          polyData.getPointData().setNormals(normals)

          levelPolyData.set(iterator.absolute, polyData)
        })
    )
  }

  console.log(pool)

  Promise.all(allPr).then(() => {
    console.timeEnd('dose-plane-time')
    // terminate all workers when done, 如果不执行terminate线程将一直存在等待下次调用
    // pool.terminate()
    console.log(pool)
  })
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const view3DRef = ref(null)
const viewportId = 'viewport-3d'
const toolId = 'viewport-3d-tool'
const renderId = 'test-dose-render'

async function display3D() {
  const element = unref(view3DRef)

  if (element) {
    const r = new RenderingEngine(renderId)

    r.enableElement({
      viewportId,
      type: coreEnums.ViewportType.VOLUME_3D,
      element,
      defaultOptions: {
        orientation: coreEnums.OrientationAxis.CORONAL,
        background: [0.15, 0.15, 0.15]
      }
    })

    const viewport3D = r.getViewport(viewportId)

    const externalVolume = cache.getVolume(volumeList[0].segmentationId)
    const marchingCubes = vtkImageMarchingCubes.newInstance({
      computeNormals: true,
      mergePoints: true
    })
    marchingCubes.setInputData(externalVolume.imageData)
    marchingCubes.setContourValue(1)

    const externalPolyData = marchingCubes.getOutputData()
    const externalActor = vtkActor.newInstance()
    const externalMapper = vtkMapper.newInstance()
    externalActor.setMapper(externalMapper)
    externalMapper.addInputData(externalPolyData)

    externalActor.getProperty().setAmbient(0.8)
    externalActor.getProperty().setColor(0, 1, 0)
    externalActor.getProperty().setDiffuse(0.7)
    externalActor.getProperty().setOpacity(0.1)
    externalActor.getProperty().setSpecular(0.8)
    externalActor.getProperty().setSpecularPower(20)

    viewport3D.addActor({ uid: 'external', actor: externalActor })

    const ptvVolume = cache.getVolume(volumeList[1].segmentationId)
    marchingCubes.setInputData(ptvVolume.imageData)
    marchingCubes.setMergePoints(true)
    marchingCubes.setComputeNormals(true)
    marchingCubes.setContourValue(2)

    const ptvPolyData = marchingCubes.getOutputData()
    const ptvActor = vtkActor.newInstance()
    const ptvMapper = vtkMapper.newInstance()
    ptvActor.setMapper(ptvMapper)
    ptvMapper.addInputData(ptvPolyData)

    ptvActor.getProperty().setAmbient(0.8)
    ptvActor.getProperty().setColor(1, 0, 0)
    ptvActor.getProperty().setDiffuse(0.7)
    ptvActor.getProperty().setOpacity(0.2)
    ptvActor.getProperty().setSpecular(0.8)
    ptvActor.getProperty().setSpecularPower(20)

    viewport3D.addActor({ uid: 'ptv', actor: ptvActor })

    for (const { absolute, color, relative } of levelData.value) {
      const doseActor = vtkActor.newInstance()
      const doseMapper = vtkMapper.newInstance()
      doseActor.setMapper(doseMapper)
      doseMapper.addInputData(levelPolyData.get(absolute))
      // doseMapper.addInputConnection(levelPolyData.get(absolute))

      const [r, g, b] = color
        .replace(/(rgb\()|(\))/g, '')
        .split(',')
        .map(Number)

      doseActor.getProperty().setAmbient(1)
      doseActor.getProperty().setColor(r / 255, g / 255, b / 255)
      doseActor.getProperty().setDiffuse(0)
      doseActor.getProperty().setOpacity(0.4)
      doseActor.getProperty().setSpecular(0.4)
      doseActor.getProperty().setSpecularPower(20)

      viewport3D.addActor({ uid: `test-${relative}%`, actor: doseActor })
    }

    ;(viewport3D as coreTypes.IVolumeViewport).resetCamera()
    viewport3D.render()

    const toolGroup = ToolGroupManager.createToolGroup(toolId)

    if (toolGroup) {
      addTool(TrackballRotateTool)

      toolGroup.addViewport(viewportId, r.id)

      toolGroup.addTool(TrackballRotateTool.toolName, {
        configuration: { volumeId: volumeList[0].segmentationId }
      })

      toolGroup.addTool(ZoomTool.toolName)
      toolGroup.addTool(PanTool.toolName)

      toolGroup.setToolActive(TrackballRotateTool.toolName, {
        bindings: [
          {
            mouseButton: toolsEnums.MouseBindings.Primary
          }
        ]
      })

      toolGroup.setToolActive(ZoomTool.toolName, {
        bindings: [
          {
            mouseButton: toolsEnums.MouseBindings.Primary,
            modifierKey: toolsEnums.KeyboardBindings.Shift
          }
        ]
      })

      toolGroup.setToolActive(PanTool.toolName, {
        bindings: [
          {
            mouseButton: toolsEnums.MouseBindings.Primary,
            modifierKey: toolsEnums.KeyboardBindings.Ctrl
          }
        ]
      })
    }
  }
}

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

function visibleExchange(e: Event, i: number) {
  const target = e.target as HTMLInputElement
  const checked = target.checked

  levelData.value[i].visible = checked
  reDisplay3D()
}

async function reDisplay3D() {
  const r = getRenderingEngine(renderId)

  if (r) {
    const viewport3D = r.getViewport(viewportId)

    for (const { relative, visible } of levelData.value) {
      const actorEntry = viewport3D.getActor(`test-${relative}%`)
      actorEntry.actor.setVisibility(visible)
    }

    viewport3D.render()
  }
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
          secondary: { en: 'Secondary', zh: '次序列' }
        }"
      />
    </div>

    <div style="width: 1649px; margin: 20px auto 0">
      <div class="row">
        <select @change="changeLayout">
          <option :selected="layout === Layout.Primary" :value="Layout.Primary">Primary</option>
          <option :selected="layout === Layout.Secondary" :value="Layout.Secondary">
            Secondary
          </option>
          <option :selected="layout === Layout.SideBySide" :value="Layout.SideBySide">
            SideBySide
          </option>
        </select>
        <button @click="renderAll">Render ALL</button>

        <button :style="{ background: display ? activedColor : '' }" @click="segmentationDisplay">
          Segmentation Display
        </button>

        <button @click="importContour">Import Contour</button>
        <button @click="importDoseVolume">Import Dose</button>

        <button @click="display3D">3D View</button>
      </div>

      <div
        ref="view3DRef"
        style="background: rgb(38, 38, 38); height: 525px; width: 1400px; float: left"
      ></div>

      <div style="float: left">
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
                  @change="e => visibleExchange(e, index)"
                />
              </td>
            </tr>
          </tbody>
        </table>
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
