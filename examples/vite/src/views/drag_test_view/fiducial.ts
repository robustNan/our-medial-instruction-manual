import { CONSTANT, utilities, type Types, managers } from 'our-medical'
import type { FiducialAnnotation } from 'our-medical/types'
import { eventTarget, type Types as coreTypes } from '@cornerstonejs/core'
import { reactive, ref, type Ref } from 'vue'

const { draggableStateManager } = managers
const {
  draggable: draggableManager,
  fiducial: fiducialManager,
  registe: registeManager
} = draggableStateManager

export default function initFiducialModule(componentId: string, patientModelId: string) {
  fiducialManager.add(patientModelId, {
    pointId: 'marker-1',
    point: [0, 0, -141],
    color: 'lightgreen'
  })

  fiducialManager.add(patientModelId, {
    pointId: 'marker-2',
    point: [100, 0, -141],
    color: 'red'
  })

  fiducialManager.add(patientModelId, {
    pointId: 'marker-3',
    point: [0, 100, -141],
    color: 'skyblue'
  })

  const draggable: { primary: Ref<boolean> | undefined; secondary: Ref<boolean> | undefined } =
    reactive({
      primary: undefined,
      secondary: undefined
    })

  const visible: { primary: Ref<boolean> | undefined; secondary: Ref<boolean> | undefined } =
    reactive({
      primary: undefined,
      secondary: undefined
    })

  utilities.getInitialized().then(() => {
    const visibleRefs = draggableManager.getVisibleRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    visible.primary = visibleRefs.primary.get(draggableStateManager.DraggableElementType.fiducial)
    visible.secondary = visibleRefs.secondary.get(
      draggableStateManager.DraggableElementType.fiducial
    )

    const draggableRefs = draggableManager.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    draggable.primary = draggableRefs.primary.get(
      draggableStateManager.DraggableElementType.fiducial
    )
    draggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.fiducial
    )
  })

  const postionRef = ref([0, 0, 0])
  const markerIdRef = ref()

  function markerPositionModified(e: Event, i: number) {
    const target = e.target as HTMLInputElement
    postionRef.value[i] = Number(target.value)
    fiducialManager.update(
      patientModelId,
      {
        pointId: markerIdRef.value,
        point: <coreTypes.Point3>postionRef.value
      },
      [componentId]
    )
  }

  eventTarget.addEventListener(
    CONSTANT.Events.FIDUCIAL_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.FiducialFromDragEvent) => {
      const { id, position } = detail
      markerIdRef.value = id

      postionRef.value[0] = position[0]
      postionRef.value[1] = position[1]
      postionRef.value[2] = position[2]
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.FIDUCIAL_REMOVED_FROM_DRAG,
    ({ detail }: Types.EventTypes.FiducialRemoveFromDragEvent) => {
      console.log(detail)
    }
  )

  function setDraggable() {
    //主序列、次序列均可拖拽
    draggableManager.setFiducialDraggable(componentId, !draggable.primary)
  }

  function setVisible() {
    //隐藏
    draggableManager.setFiducialVisible(componentId, !visible.primary)
  }

  function addMarker() {
    managers.toolsStateManager.setHeaderToolDisabled(componentId, true)

    utilities.dragAddFiducial(componentId, {
      color: 'red',
      addedCallback(e /* Types.EventTypes.NewPointFromDragEvent */) {
        const annotation = <FiducialAnnotation>e.detail.annotation

        markerIdRef.value = annotation.annotationUID
        const position = annotation.data.handles.points[0]

        postionRef.value[0] = position[0]
        postionRef.value[1] = position[1]
        postionRef.value[2] = position[2]
      },
      beforeAddHook: async (viewport, points) => {
        console.log(viewport, points)
        return true
      }
    })
  }

  // 添加基准标记点拖拽删除前的确认钩子
  registeManager.registeFiducialRemoveHook(componentId, async () => true)

  return {
    draggable,
    visible,
    postionRef,
    markerIdRef,
    addMarker,
    markerPositionModified,
    setDraggable,
    setVisible
  }
}
