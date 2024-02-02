import { reactive, ref, type Ref } from 'vue'
import { eventTarget, type Types as coreTypes } from '@cornerstonejs/core'
import { CONSTANT, managers, utilities, type Types } from 'our-medical'
// import { frameRegisteType } from 'our-medical/constant'

const { draggableStateManager } = managers
const { draggable: draggableManager, frame: frameManager } = draggableStateManager

export default function initFrameModule(componentId: string, patientModelId: string) {
  function resetExtractedPoints() {
    const defaultFrame = utilities.createDefaultFrame(
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561'
    )

    if (!defaultFrame) return

    const extractedPoints: [
      number,
      { points: coreTypes.Point3[]; options: Types.FramePointsStyleOption }
    ][] = defaultFrame.map((points, index) => [
      index,
      {
        points,
        options: {
          pointColor: 'yellow',
          selectedColor: 'skyblue',
          lineColor: 'yellow',
          lineWidth: 1,
          lineDash: [4, 4],
          fontSize: '16px'
        }
      }
    ])

    frameManager.setExtractedPoints(patientModelId, new Map(extractedPoints), [componentId])
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  type BooleanRefs = { primary: Ref<boolean> | undefined; secondary: Ref<boolean> | undefined }

  const extractedDraggable: BooleanRefs = reactive({ primary: undefined, secondary: undefined })
  const extractedVisible: BooleanRefs = reactive({ primary: undefined, secondary: undefined })
  const fittingVisible: BooleanRefs = reactive({ primary: undefined, secondary: undefined })
  const physicsVisible: BooleanRefs = reactive({ primary: undefined, secondary: undefined })

  utilities.getInitialized().then(() => {
    const draggableRefs = draggableManager.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    extractedDraggable.primary = draggableRefs.primary.get(
      draggableStateManager.DraggableElementType.frameExt
    )
    extractedDraggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.frameExt
    )

    const visibleRefs = draggableManager.getVisibleRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    extractedVisible.primary = visibleRefs.primary.get(
      draggableStateManager.DraggableElementType.frameExt
    )
    extractedVisible.secondary = visibleRefs.secondary.get(
      draggableStateManager.DraggableElementType.frameExt
    )

    fittingVisible.primary = visibleRefs.primary.get(
      draggableStateManager.DraggableElementType.frameFit
    )
    fittingVisible.secondary = visibleRefs.secondary.get(
      draggableStateManager.DraggableElementType.frameFit
    )

    physicsVisible.primary = visibleRefs.primary.get(
      draggableStateManager.DraggableElementType.framePhy
    )
    physicsVisible.secondary = visibleRefs.secondary.get(
      draggableStateManager.DraggableElementType.framePhy
    )
  })

  function setExtractedDraggable() {
    // 只在主序列上拖拽
    draggableManager.setFrameExtDraggable(
      componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P,
      !extractedDraggable.primary
    )
  }

  function setExtractedVisible() {
    // 在主次序列上显示
    draggableManager.setFrameExtVisible(componentId, !extractedVisible.primary)
  }

  function setFittingVisible() {
    // 在主次序列上显示
    draggableManager.setFrameFitVisible(componentId, !fittingVisible.primary)
  }

  function setPhysicsVisible() {
    // 在主次序列上显示
    draggableManager.setFramePhyVisible(componentId, !physicsVisible.primary)
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const currFrameExtractedInfor = { index: 0, position: 0 }

  const currFrameExtractedPosition: Ref<coreTypes.Point3> = ref([0, 0, 0])

  eventTarget.addEventListener(
    CONSTANT.Events.CURR_FRAME_VERTICE_INFO_MODIFIED,
    ({ detail }: Types.EventTypes.CurrFrameVerticeInfoModifiedEvent) => {
      const { index, point, position } = detail

      currFrameExtractedInfor.index = index
      currFrameExtractedInfor.position = position
      point.forEach((v, i) => (currFrameExtractedPosition.value[i] = v))
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.FRAME_VERTICE_MOVED,
    ({ detail }: Types.EventTypes.FrameVerticeMovedEvent) => {
      /* { modelId, index, point, position } */
      const { point } = detail
      point.forEach((v, i) => (currFrameExtractedPosition.value[i] = v))
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.FRAME_MOVED,
    ({ detail }: Types.EventTypes.FrameMovedEvent) => {
      /* { modelId, points, position } */
      const { points } = detail
      points[currFrameExtractedInfor.index].forEach(
        (v, i) => (currFrameExtractedPosition.value[i] = v)
      )
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.FRAME_DRAG_END,
    ({ detail }: Types.EventTypes.FrameDragEndEvent) => {
      /* { modelId, index, points, position } */
      //const { modelId, index, points, position } = detail
      console.log(detail)
    }
  )

  function setPosition(e: Event, i: number) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)

    currFrameExtractedPosition.value[i] = value

    frameManager.updateExtractedPoint(
      patientModelId,
      {
        // ...currFrameExtractedInfor,
        point: [currFrameExtractedPosition.value[0], currFrameExtractedPosition.value[1]]
      },
      [componentId]
    )

    console.log(
      utilities.pointInVolumeBoundingBox(
        'cornerstoneStreamingImageVolume:1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
        currFrameExtractedPosition.value
      )
    )
  }

  function autoRegist() {
    const defaultFrame = utilities.createDefaultFrame(
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561'
    )

    if (!defaultFrame) return

    const extractedPoints: [
      number,
      { points: coreTypes.Point3[]; options: Types.FramePointsStyleOption }
    ][] = defaultFrame.map((points, index) => [
      index,
      {
        points,
        options: {
          pointColor: 'yellow',
          selectedColor: 'skyblue',
          lineColor: 'yellow',
          lineWidth: 1,
          lineDash: [4, 4],
          fontSize: '16px'
        }
      }
    ])

    frameManager.setExtractedPoints(patientModelId, new Map(extractedPoints), [componentId])
  }

  function manualRegist() {
    const defaultFrame = utilities.createDefaultFrame(
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561'
    )

    if (!defaultFrame) return

    const extractedPoints: [
      number,
      { points: coreTypes.Point3[]; options: Types.FramePointsStyleOption }
    ][] = defaultFrame.map((points, index) => [
      index,
      {
        points,
        options: {
          pointColor: 'yellow',
          selectedColor: 'skyblue',
          lineColor: 'red',
          lineWidth: 1,
          lineDash: [4, 4],
          fontSize: '16px'
        }
      }
    ])

    frameManager.setExtractedPoints(patientModelId, new Map(extractedPoints), [componentId])
  }

  function sureFrame() {
    const defaultFrame = utilities.createDefaultFrame(
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561'
    )
    if (!defaultFrame) return

    const fittingPoints: [number, { points: coreTypes.Point3[] }][] = defaultFrame.map(
      (points: coreTypes.Point3[], index) => [
        index,
        {
          points: points.map((item) => {
            const point: coreTypes.Point3 = [...item]
            point[0] = point[0] - 1
            return point
          })
        }
      ]
    )

    const physicsPoints: [number, { points: coreTypes.Point3[]; deviations: number[] }][] =
      defaultFrame.map((points: coreTypes.Point3[], index) => [
        index,
        {
          points: points.map((item) => {
            const point: coreTypes.Point3 = [...item]
            point[0] = point[0] + 1
            return point
          }),
          deviations: [1, 2, 3, 4, 5, 6]
        }
      ])

    frameManager.setFittingPoints(patientModelId, new Map(fittingPoints), [componentId])
    frameManager.setPhysicsPoints(patientModelId, new Map(physicsPoints), [componentId])

    frameManager.updateExtractedPointsStyle(
      patientModelId,
      {
        position: currFrameExtractedInfor.position,
        options: {
          pointColor: 'red',
          lineColor: 'red'
        }
      },
      [componentId]
    )
  }

  function frameRegisted() {
    frameManager.updateExtractedPointsStyle(
      patientModelId,
      {
        options: {
          pointColor: 'red',
          lineColor: 'red'
        }
      },
      [componentId]
    )
    frameManager.setFrameRegisted(patientModelId, true, [componentId])
  }

  return {
    resetExtractedPoints,
    extractedDraggable,
    extractedVisible,
    fittingVisible,
    physicsVisible,
    setExtractedDraggable,
    setExtractedVisible,
    setFittingVisible,
    setPhysicsVisible,
    currFrameExtractedPosition,
    setPosition,
    autoRegist,
    manualRegist,
    sureFrame,
    frameRegisted
  }
}
