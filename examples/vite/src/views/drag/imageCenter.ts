import { eventTarget } from '@cornerstonejs/core'
import { CONSTANT, managers, utilities } from 'our-medical'
import { reactive, ref } from 'vue'

import type { Types as coreTypes } from '@cornerstonejs/core'
import type { Types } from 'our-medical'
import type { Ref } from 'vue'

const { draggableStateManager } = managers
const {
  draggable: draggableManager,
  imageCenter: imageCenterManager,
  registe: registeManager
} = draggableStateManager

export default function initImageCenter(componentId: string, patientModelId: string) {
  const centerRef = ref([0, 0, -141])

  function centerModified(event: Event, index: number) {
    const target = event.target as HTMLInputElement
    const value = Number(target.value)

    centerRef.value[index] = value

    imageCenterManager.update(patientModelId, centerRef.value as coreTypes.Point3, [componentId])
  }

  function addCenter(origin: coreTypes.Point3) {
    centerRef.value[0] = origin[0]
    centerRef.value[1] = origin[1]
    centerRef.value[2] = origin[2]

    imageCenterManager.add(
      patientModelId,
      {
        point: centerRef.value as coreTypes.Point3
      },
      [toolGroupId_P]
    )
  }

  function deleteCenter() {
    centerRef.value = [0, 0, 0]

    imageCenterManager.remove(patientModelId, [componentId])
  }

  eventTarget.addEventListener(
    CONSTANT.Events.IMAGE_CENTER_MODIFIED,
    ({ detail }: Types.EventTypes.ImageCenterModifiedFromDragEvent) => {
      const { position } = detail

      centerRef.value[0] = position[0]
      centerRef.value[1] = position[1]
      centerRef.value[2] = position[2]
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.IMGAE_CENTER_REMOVED_FROM_DRAG,
    ({ detail }: Types.EventTypes.ImageCenterRemovedFromDragEvent) => {
      detail
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.IMAGE_CENTER_DRAG_END,
    ({ detail }: Types.EventTypes.ImageCenterModifiedFromDragEvent) => {
      console.log(detail)
    }
  )

  const toolGroupId_P = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P
  //const toolGroupId_S = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.S

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

    visible.primary = visibleRefs.primary.get(draggableStateManager.DraggableElementType.center)
    visible.secondary = visibleRefs.secondary.get(draggableStateManager.DraggableElementType.center)

    const draggableRefs = draggableManager.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    draggable.primary = draggableRefs.primary.get(draggableStateManager.DraggableElementType.center)
    draggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.center
    )
  })

  function setDraggable() {
    // 只在主序列上拖拽
    draggableManager.setImageCenterDraggable(toolGroupId_P, !draggable.primary)
  }

  function setVisible() {
    // 在主次序列上显示
    draggableManager.setImageCenterVisible(componentId, !visible.primary)
  }

  //影像中心拖拽删除钩子
  registeManager.registeImageCenterRemoveHook(componentId, async () => true)

  return {
    centerRef,
    draggable,
    visible,
    centerModified,
    addCenter,
    deleteCenter,
    setDraggable,
    setVisible
  }
}
