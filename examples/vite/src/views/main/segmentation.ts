import { eventTarget, Enums } from '@cornerstonejs/core'
import { SegmentationDisplayTool } from '@cornerstonejs/tools'
import { merge } from 'lodash'
import { CONSTANT, managers, tools, utilities } from 'our-medical'
import { reactive, ref, unref, watch } from 'vue'
import color_map from '@/data/color_map'

import type { Types as coreTypes } from '@cornerstonejs/core'
import type { Types } from 'our-medical'

export default function initSegmentationModule(id: string, priProps: Types.SeriesProps) {
  const { segmentationStateManager, toolsStateManager } = managers

  const ColorLUT: coreTypes.ColorLUT = [[0, 0, 0, 0]]
  for (const iterator of color_map) {
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

  function importContour() {
    fetch('external-data.json').then((response) => {
      response.json().then((value) => {
        console.time('create external by contoursdata finish')

        const { segmentationId, volumeFillAsync /* volumeLoaderAsync */ } =
          segmentationStateManager.createSegmentationByContoursData(
            { ...volumeList[0], seriesId: priProps.seriesId },
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
        /* segmentationStateManager.updateSegmentationByContoursData(
          {
            segmentationId: volumeList[0].segmentationId,
            segmentIndex: volumeList[0].segmentIndex
          },
          value
        )
        volumeList[0].volumeValue = value.volumeValue / 1000 */
      })
    })

    fetch('lung-data.json').then((response) => {
      response.json().then((value) => {
        console.time('create lung by contoursdata finish')

        const { segmentationId, volumeFillAsync } =
          segmentationStateManager.createSegmentationByContoursData(
            { ...volumeList[1], seriesId: priProps.seriesId },
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

  async function exportContour() {
    const contourData = await segmentationStateManager.getContourData(volumeList[0].segmentationId)
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

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

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
        seriesId: priProps.seriesId
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

  function setRepresentationColor(volumeInfo: any, e: Event) {
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

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const segmentationDisplayRef = ref(false)

  function segmentationDisplay() {
    if (unref(segmentationDisplayRef)) {
      toolsStateManager.setAToolDisabled(id, SegmentationDisplayTool.toolName)
    } else {
      toolsStateManager.addATool(id, SegmentationDisplayTool)
      toolsStateManager.setAToolEnabled(id, SegmentationDisplayTool.toolName)
    }

    segmentationDisplayRef.value = !unref(segmentationDisplayRef)
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const brushRadius = ref(10)

  watch(brushRadius, (value) => {
    toolsStateManager.setBrushRadius(id, value)
  })

  const brushRef = ref(false)

  function brushToolActived() {
    if (unref(brushRef)) {
      toolsStateManager.setAToolDisabled(id)
    } else {
      if (unref(pencilRef)) {
        toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
        pencilRef.value = false
      }

      if (unref(deleteRef)) {
        toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
        deleteRef.value = false
      }

      toolsStateManager.addATool(id, tools.AdvanceBrushTool)
      toolsStateManager.setAToolActived(id, tools.AdvanceBrushTool.toolName)
    }

    brushRef.value = !unref(brushRef)
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const pencilRef = ref(false)

  function pencilToolActived() {
    if (unref(pencilRef)) {
      toolsStateManager.setAToolDisabled(id)
    } else {
      if (unref(brushRef)) {
        toolsStateManager.setAToolDisabled(id, tools.AdvanceBrushTool.toolName)
        brushRef.value = false
      }

      if (unref(deleteRef)) {
        toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
        deleteRef.value = false
      }

      toolsStateManager.addATool(id, tools.SimplePencilTool)
      toolsStateManager.setAToolActived(id, tools.SimplePencilTool.toolName)
    }

    pencilRef.value = !unref(pencilRef)
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const deleteRef = ref(false)

  function deleteToolActived() {
    if (unref(deleteRef)) {
      toolsStateManager.setAToolDisabled(id)
    } else {
      if (unref(brushRef)) {
        toolsStateManager.setAToolDisabled(id, tools.AdvanceBrushTool.toolName)
        brushRef.value = false
      }

      if (unref(pencilRef)) {
        toolsStateManager.setAToolDisabled(id, tools.SimplePencilTool.toolName)
        pencilRef.value = false
      }

      toolsStateManager.addATool(id, tools.ContourDeleteTool)
      toolsStateManager.setAToolActived(id, tools.ContourDeleteTool.toolName)
    }

    deleteRef.value = !unref(deleteRef)
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  function clearContour() {
    segmentationStateManager.resetSegmentation(volumeList[0].segmentationId)
  }

  function clearSlice() {
    const toolGroupId: Types.DisplayComponentID = `${id}|${CONSTANT.TOOL_GROUP_TYPE.P}`

    for (const iterator of volumeList) {
      if (!iterator.segmentationId) continue

      // 获取主序列视口
      const viewports = utilities.viewportsFindor.getViewportsWithSegmentationId(
        toolGroupId,
        iterator.segmentationId,
        Enums.OrientationAxis.AXIAL
      )

      if (!viewports.length) continue

      // 数组第一为轴状位视口
      const [viewport] = viewports
      const camera = viewport.getCamera()

      if (!camera.focalPoint) continue

      // 清除轴状位方向上指定层上当个体积的勾画轮廓
      segmentationStateManager.removeContoursOnSlice(
        { segmentationId: iterator.segmentationId, segmentIndex: iterator.segmentIndex },
        camera.focalPoint[2]
      )
    }
  }

  function deleteExternal() {
    segmentationStateManager.deleteSegmentation(id, [volumeList[0].segmentationId])
    volumeList[0].segmentationId = ''
    volumeList[0].volumeValue = 0
    unsetActiveSegmentation()
  }

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

  return {
    ColorLUT,
    volumeList,
    importContour,
    exportContour,
    setActiveSegmentation,
    unsetActiveSegmentation,
    setSegmentationVisible,
    setRepresentationColor,
    segmentationDisplayRef,
    segmentationDisplay,
    brushRadius,
    brushRef,
    brushToolActived,
    pencilRef,
    pencilToolActived,
    deleteRef,
    deleteToolActived,
    clearContour,
    clearSlice,
    deleteExternal
  }
}
