<script setup lang="ts">
import { merge } from 'lodash'
import { reactive, ref, unref, watch } from 'vue'
import { eventTarget, Enums } from '@cornerstonejs/core'
import { SegmentationDisplayTool } from '@cornerstonejs/tools'
import { Discovery, Optima } from '@/data/electron_density'
import { SeriesNames, useSeriesProps } from '@/scripts/composables'
import MedicalImage, { CONSTANT, managers, tools, utilities } from 'our-medical'
import ColorMap from '@/data/color_map'

import type { Types as coreTypes } from '@cornerstonejs/core'
import type { Types } from 'our-medical'

const { densityStateManager, segmentationStateManager, toolsStateManager } = managers

densityStateManager.setElectronDensity(Optima.id, Optima.data)
densityStateManager.setElectronDensity(Discovery.id, Discovery.data)

const { Layout } = CONSTANT

const id = 'segmentation'
const layout = ref(Layout.SideBySide)

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

const activedColor = 'gold'
const sliceSync = ref(false)
const pointSync = ref(false)
const setSliceSync = () => (sliceSync.value = !unref(sliceSync))
const setPointSync = () => (pointSync.value = !unref(pointSync))

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

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

const brush = ref(false)

function brushToolActived() {
  if (unref(brush)) {
    toolsStateManager.setAToolDisabled(id)
  } else {
    if (unref(pencil)) {
      toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
      pencil.value = false
    }

    if (unref(contourDelete)) {
      toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
      contourDelete.value = false
    }

    toolsStateManager.addATool(id, tools.AdvanceBrushTool)
    toolsStateManager.setAToolActived(id, tools.AdvanceBrushTool.toolName)
  }

  brush.value = !unref(brush)
}

const brushRadius = ref(10)

watch(brushRadius, (value) => {
  toolsStateManager.setBrushRadius(id, value)
})

/* function circleBrush() {
  toolsStateManager.setBrushStrategy(id, 'FILL_INSIDE_CIRCLE')
}

function sphereBrush() {
  toolsStateManager.setBrushStrategy(id, 'FILL_INSIDE_SPHERE')
} */

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const ColorLUT: coreTypes.ColorLUT = [[0, 0, 0, 0]]
for (const iterator of ColorMap) {
  const color = iterator.split(',').map((v) => Number(v))
  ColorLUT.push(color.concat(255) as coreTypes.Color)
}

// segmentation.state.addColorLUT(ColorLUT, 1)

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

function setActiveSegmentation(volumeInfo: any) {
  // 切换体积是不执行重建，迅速切换显示效果
  /* segmentationStateManager
    .setActiveSegmentation(
      id,
      { ...volumeInfo },
      { activeMaximize: false, inactiveMinimize: false }
    )
    .then(segment => {
      console.log(segment)
    }) */

  if (volumeInfo.segmentationId) {
    // 切换分割体积时可以显示加载动画，通过then在成功后隐藏加载动画
    segmentationStateManager.setActiveSegmentation(id, { ...volumeInfo }).then((segment) => {
      console.log(segment)
    })
  } else {
    // 依赖序列体积创建分割体积
    const { segmentationId, volumeLoaderAsync } = segmentationStateManager.createSegmentation({
      volumeId: volumeInfo.volumeId,
      seriesId: priPreosRefs.seriesId
    })
    volumeInfo.segmentationId = segmentationId

    // 向toolGroup中添加分割体积representation
    segmentationStateManager
      .addRepresentationsAsync(id, [volumeInfo])
      .then((toolGroupRepresentationUIDMap) => {
        if (toolGroupRepresentationUIDMap) {
          // 如果返回Map对象表示添加成功
          for (const toolGroupId of toolGroupRepresentationUIDMap.keys()) {
            // 设置toolGroup中的分割体积颜色
            segmentationStateManager.setRepresentationColor(
              toolGroupId,
              volumeInfo.segmentationId,
              volumeInfo.segmentIndex,
              volumeInfo.color
            )
          }
        }
      })

    // 体积加载后设置为当前勾画体积
    volumeLoaderAsync.then(() => {
      // 切换分割体积时可以显示加载动画，通过then在成功后隐藏加载动画
      segmentationStateManager
        .setActiveSegmentation(
          id,
          { ...volumeInfo },
          { activeMaximize: false, inactiveMinimize: true }
        )
        .then((segment) => {
          console.log(segment)
        })
    })
  }
}

function unsetActiveSegmentation() {
  // 切换勾画体积时可以显示加载等候，通过then在切换勾画体积成功后隐藏加载动画
  segmentationStateManager.setActiveSegmentation(id).then((segment) => {
    console.log(segment)
  })
}

function setSegmentationVisible(volumeInfo: any, visibility?: boolean) {
  segmentationStateManager.setSegmentationsVisibility(id, [volumeInfo], visibility)
  volumeInfo.visibility = visibility
}

function setRepresentationColor(volumeInfo: any, e: GlobalEventHandlersEventMap['change']) {
  const target = e.target as HTMLSelectElement
  const value = target.value
  const index = Number(value)

  volumeInfo.color = ColorLUT[index]

  segmentationStateManager.setRepresentationColor(
    id,
    volumeInfo.segmentationId,
    volumeInfo.segmentIndex,
    volumeInfo.color
  )
}

function exportContour() {
  const contourData = segmentationStateManager.getContourData(volumeList[0].segmentationId)
  if (contourData) {
    const data = {
      bounds: contourData.bounds,
      contours: {},
      direction: contourData.direction,
      dimensions: contourData.dimensions,
      origin: contourData.origin,
      spacing: contourData.spacing,
      volumeValue: contourData.volumeValue
    }

    for (const [slice, contour] of contourData.contours) {
      Reflect.set(data.contours, slice, contour)
    }

    const blob = new Blob([JSON.stringify(data)], { type: 'text/json' })

    const downloadLink = document.createElement('a')
    downloadLink.download = 'data.json'
    downloadLink.style.display = 'none'
    downloadLink.href = URL.createObjectURL(blob)
    document.body.appendChild(downloadLink)
    downloadLink.click()

    document.body.removeChild(downloadLink)
  }
}

function importContour() {
  fetch('external-data.json').then((response) => {
    response.json().then((value) => {
      console.time('create external by contoursdata finish')

      const { segmentationId, volumeFillAsync /* volumeLoaderAsync */ } =
        segmentationStateManager.createSegmentationByContoursData(
          { ...volumeList[0], seriesId: priPreosRefs.seriesId },
          value
        )

      volumeList[0].segmentationId = segmentationId

      segmentationStateManager
        .addRepresentationsAsync(id, [volumeList[0]], false)
        .then((toolGroupRepresentationUIDMap) => {
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

      volumeFillAsync.then((value) => {
        console.timeEnd('create external by contoursdata finish')
        volumeList[0].volumeValue = value.volumeValue / 1000
      })

      // 模拟勾画中的体积进行插值运算后更新体积，输入的勾画数据不可超出已有体积边界
      /* const volumeValue = segmentationStateManager.updateSegmentationByContoursData(
        {
          segmentationId: volumeList[0].segmentationId,
          segmentIndex: volumeList[0].segmentIndex
        },
        value
      )
      volumeList[0].volumeValue = volumeValue / 1000 */
    })
  })

  fetch('lung-data.json').then((response) => {
    response.json().then((value) => {
      console.time('create lung by contoursdata finish')

      const { segmentationId, volumeFillAsync } =
        segmentationStateManager.createSegmentationByContoursData(
          { ...volumeList[1], seriesId: priPreosRefs.seriesId },
          value
        )

      volumeList[1].segmentationId = segmentationId

      segmentationStateManager
        .addRepresentationsAsync(id, [volumeList[1]], false)
        .then((toolGroupRepresentationUIDMap) => {
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

      volumeFillAsync.then((value) => {
        console.timeEnd('create lung by contoursdata finish')
        volumeList[1].volumeValue = value.volumeValue / 1000
      })
    })
  })
}

function clearContour() {
  segmentationStateManager.resetSegmentation(volumeList[0].segmentationId)
  volumeList[0].volumeValue = 0
}

function clearSlice() {
  const toolGroupId = `${id}|${CONSTANT.TOOL_GROUP_TYPE.P}`

  // 获取轴状位视口
  const viewports = utilities.viewportsFindor.getViewportsWithSegmentationId(
    toolGroupId,
    volumeList[0].segmentationId,
    Enums.OrientationAxis.AXIAL
  )

  if (viewports.length) {
    const [viewport] = viewports
    const camera = viewport.getCamera()

    if (camera.focalPoint) {
      segmentationStateManager.removeContoursOnSlice(
        {
          segmentationId: volumeList[0].segmentationId,
          segmentIndex: volumeList[0].segmentIndex
        },
        camera.focalPoint[2]
      )
    }
  }
}

function deleteExternal() {
  segmentationStateManager.deleteSegmentation(id, [volumeList[0].segmentationId])
  volumeList[0].segmentationId = ''
  volumeList[0].volumeValue = 0
  unsetActiveSegmentation()
}

/* function pointInSegmentation() {
  console.log(utilities.pointInSegmentation(volumeList[0].segmentationId, [0, 0, -141]))
} */

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

eventTarget.addEventListener(
  CONSTANT.Events.CONTOUR_DATA_MODIFIED,
  (arg: Types.EventTypes.ContourDataModifiedEvent) => {
    const { segmentationId, volumeValue, volumeId } = arg.detail
    for (const iterator of volumeList) {
      if (iterator.volumeId === volumeId && iterator.segmentationId === segmentationId) {
        iterator.volumeValue = volumeValue / 1000
        break
      }
    }
  }
)

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */
const pencil = ref(false)
function pencilToolActived() {
  if (unref(pencil)) {
    toolsStateManager.setAToolDisabled(id)
  } else {
    if (unref(brush)) {
      toolsStateManager.setAToolDisabled(id, tools.AdvanceBrushTool.toolName)
      brush.value = false
    }

    if (unref(contourDelete)) {
      toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
      contourDelete.value = false
    }

    toolsStateManager.addATool(id, tools.SimplePencilTool)
    toolsStateManager.setAToolActived(id, tools.SimplePencilTool.toolName)
  }

  pencil.value = !unref(pencil)
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */
const contourDelete = ref(false)
function deleteToolActived() {
  if (unref(contourDelete)) {
    toolsStateManager.setAToolDisabled(id)
  } else {
    if (unref(brush)) {
      toolsStateManager.setAToolDisabled(id, tools.AdvanceBrushTool.toolName)
      brush.value = false
    }

    if (unref(pencil)) {
      toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
      pencil.value = false
    }

    toolsStateManager.addATool(id, tools.ContourDeleteTool)
    toolsStateManager.setAToolActived(id, tools.ContourDeleteTool.toolName)
  }

  contourDelete.value = !unref(contourDelete)
}

/**
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
 */

const imageURL = ref('')

function svgToImageData() {
  utilities
    .captureImage(id, {
      id: volumeList[0].segmentationId,
      index: volumeList[0].segmentIndex
    })
    .then((value) => {
      console.log(value)
      if (typeof value === 'string') imageURL.value = value
    })
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
        :secondary="secPropsRefs"
        :slice-sync="sliceSync"
        :point-sync="pointSync"
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
        <button :style="{ background: sliceSync ? activedColor : '' }" @click="setSliceSync">
          Slice Sync
        </button>
        <button :style="{ background: pointSync ? activedColor : '' }" @click="setPointSync">
          Point Sync
        </button>
        <button @click="svgToImageData">Capture Viewports</button>
      </div>

      <div class="row">
        <button :style="{ background: display ? activedColor : '' }" @click="segmentationDisplay">
          Segmentation Display
        </button>

        <button :style="{ background: brush ? activedColor : '' }" @click="brushToolActived">
          Brush Tool
        </button>

        <button :style="{ background: pencil ? activedColor : '' }" @click="pencilToolActived">
          Pencil Tool
        </button>

        <button
          :style="{ background: contourDelete ? activedColor : '' }"
          @click="deleteToolActived"
        >
          Delete Tool
        </button>
      </div>

      <div class="row">
        <button @click="unsetActiveSegmentation">Select None</button>
        <button @click="exportContour">Export Contour</button>
        <button @click="importContour">Import Contour</button>
        <button @click="clearContour">Clear All Slices</button>
        <button @click="clearSlice">Clear Current Slice</button>
        <button @click="deleteExternal">Delete External</button>
      </div>

      <div class="row">
        <table border="1">
          <thead>
            <th>Name</th>
            <th>Volume ID</th>
            <th>Color</th>
            <th>Volume (cm³)</th>
            <th>Visible</th>
            <th>operation</th>
          </thead>
          <tbody>
            <tr v-for="volume in volumeList" :key="volume.name">
              <td>{{ volume.name }}</td>
              <td>{{ volume.volumeId }}</td>
              <td>
                <select @change="(e) => setRepresentationColor(volume, e)">
                  <option
                    v-for="(item, index) in ColorLUT"
                    :selected="
                      item[0] === volume.color[0] &&
                      item[1] === volume.color[1] &&
                      item[2] === volume.color[2] &&
                      item[3] === volume.color[3]
                    "
                    :key="index"
                    :value="index"
                  >
                    {{ item }}
                  </option>
                </select>
              </td>
              <td>{{ volume.volumeValue }}</td>
              <td>{{ volume.visibility }}</td>
              <td>
                <button @click="() => setActiveSegmentation(volume)">Select</button>
                <button @click="() => setSegmentationVisible(volume, true)">Visible</button>
                <button @click="() => setSegmentationVisible(volume, false)">Hide</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="row">
        <label for="">
          <input type="range" min="2" max="40" step="1" v-model="brushRadius" />
          {{ brushRadius }}px
        </label>
      </div>

      <img :src="imageURL" />
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
