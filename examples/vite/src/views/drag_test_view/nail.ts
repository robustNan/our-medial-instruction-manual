import { reactive, ref, type Ref } from 'vue'
import { eventTarget, type Types as coreTypes } from '@cornerstonejs/core'
import { managers, utilities, type Types, CONSTANT } from 'our-medical'

type nail = {
  key: number
  name: string
  point: coreTypes.Point3 | undefined
}

export default function initNailModule(componentId: string, patientModelId: string) {
  const { draggableStateManager } = managers

  function nailSetting() {
    const nail = new Map()

    nail.set(0, [0, 0, -141])
    nail.set(3, [75, 75, -135])

    draggableStateManager.nail.set(patientModelId, nail, [
      componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P
    ])
  }

  nailSetting()

  const nailsData: nail[] = reactive([])

  const selectedNail = ref(0)

  for (let i = 0; i < 8; i++) {
    nailsData.push({
      key: i,
      name: i + 1 + ' nail',
      point: undefined
    })
  }

  function nailChange(e: GlobalEventHandlersEventMap['change']) {
    const { target } = e
    selectedNail.value = (target as HTMLSelectElement).selectedIndex

    if (nailDraggable.primary)
      draggableStateManager.nail.setCurrNail(
        patientModelId,
        selectedNail.value,
        [componentId],
        true
      )
  }

  function startDrag() {
    managers.toolsStateManager.setHeaderToolDisabled(componentId, true)

    utilities.dragAddNail(componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P, {
      number: selectedNail.value,
      addedCallback(e /* Types.EventTypes.NewNailFromDragEvent */) {
        console.log(e)
      },
      beforeAddHook: async (viewport, points) => {
        console.log(viewport, points)
        return true
      }
    })
  }

  type BooleanRefs = { primary: Ref<boolean> | undefined; secondary: Ref<boolean> | undefined }
  const nailDraggable: BooleanRefs = reactive({ primary: undefined, secondary: undefined })
  const nailVisible: BooleanRefs = reactive({ primary: undefined, secondary: undefined })

  utilities.getInitialized().then(() => {
    const visibleRefs = draggableStateManager.draggable.getVisibleRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    nailVisible.primary = visibleRefs.primary.get(draggableStateManager.DraggableElementType.nail)
    nailVisible.secondary = visibleRefs.secondary.get(
      draggableStateManager.DraggableElementType.nail
    )

    const draggableRefs = draggableStateManager.draggable.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    nailDraggable.primary = draggableRefs.primary.get(
      draggableStateManager.DraggableElementType.nail
    )
    nailDraggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.nail
    )
  })

  function setDraggable() {
    // 只在主序列上拖拽
    draggableStateManager.draggable.setNailDraggable(
      componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P,
      !nailDraggable.primary
    )

    if (nailDraggable.primary) {
      draggableStateManager.nail.setCurrNail(
        patientModelId,
        selectedNail.value,
        [componentId],
        true
      )
    } else {
      draggableStateManager.nail.clearCurrNail(patientModelId, [componentId])
    }
  }

  function setVisible() {
    // 在主次序列上显示
    draggableStateManager.draggable.setNailVisible(componentId, !nailVisible.primary)
  }

  const positionRef: Ref<coreTypes.Point3> = ref([0, 0, 0])

  function setPosition(e: Event, i: number) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)

    positionRef.value[i] = value

    draggableStateManager.nail.updata(
      patientModelId,
      {
        point: positionRef.value
      },
      [componentId]
    )
  }

  eventTarget.addEventListener(
    CONSTANT.Events.NAIL_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.NailModifiedFromDragEvent) => {
      const { point } = detail
      point.forEach((v, i) => (positionRef.value[i] = v))
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.CURR_NAIL_MODIFIED,
    ({ detail }: Types.EventTypes.NailModifiedFromDragEvent) => {
      const { index, point } = detail
      selectedNail.value = index
      if (point) point.forEach((v, i) => (positionRef.value[i] = v))
      else for (let i = 0; i < 3; i++) positionRef.value[i] = 0
    }
  )

  draggableStateManager.registe.registeNailRemoveHook(componentId, async () => false)

  return {
    nailSetting,
    nailsData,
    selectedNail,
    nailDraggable,
    nailVisible,
    nailChange,
    startDrag,
    setDraggable,
    setVisible,
    positionRef,
    setPosition
  }
}
