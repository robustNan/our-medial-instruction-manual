import { reactive, ref, unref, type Ref } from 'vue'
import { eventTarget, type Types as coreTypes } from '@cornerstonejs/core'
import { CONSTANT, managers, utilities, type Types } from 'our-medical'

const { draggableStateManager } = managers
const { draggable: draggableManager, origin: originManager } = draggableStateManager

export default function initOriginModule(componentId: string, patientModelId: string) {
  const positionRef: Ref<coreTypes.Point3> = ref([0, 0, -141])

  // 添加患者原点数据并返回了ID
  const originId = originManager.add(patientModelId, {
    // annotationUID: 'test draggable origin point Id',
    point: [0, 0, -141]
  })

  /**
   * @description 输入框中输入数值手动修改患者原点位置
   * @author jiannan.jiao
   * @date 09/10/2023
   * @param {Event} e
   * @param {number} i
   */
  function originModified(e: Event, i: number) {
    const target = e.target as HTMLInputElement
    positionRef.value[i] = Number(target.value)
    originManager.update(originId, positionRef.value, [componentId])
  }

  eventTarget.addEventListener(
    CONSTANT.Events.ORIGIN_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.OriginModifiedFromDragEvent) => {
      positionRef.value[0] = detail.position[0]
      positionRef.value[1] = detail.position[1]
      positionRef.value[2] = detail.position[2]
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.ORIGIN_DRAG_END,
    ({ detail }: Types.EventTypes.OriginModifiedFromDragEvent) => {
      console.log(detail)
    }
  )

  const _componentId = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P

  const draggable: { [x: string]: Ref<boolean> | null } = reactive({
    [draggableStateManager.DraggableElementType.origin]: null
  })

  const visible: { [x: string]: Ref<boolean> | null } = reactive({
    [draggableStateManager.DraggableElementType.origin]: null
  })

  // 这里使用getInitialized()和onMounted()都可以，主要是为了保证页面中的组件初始化完成
  utilities.getInitialized().then(() => {
    const draggableRefs = draggableManager.getDraggableRefs(
      _componentId
    ) as Types.DraggableElementRefMap

    const visibleRefs = draggableManager.getVisibleRefs(
      _componentId
    ) as Types.DraggableElementRefMap

    draggable[draggableStateManager.DraggableElementType.origin] = draggableRefs.get(
      draggableStateManager.DraggableElementType.origin
    ) as Ref<boolean>

    visible[draggableStateManager.DraggableElementType.origin] = visibleRefs.get(
      draggableStateManager.DraggableElementType.origin
    ) as Ref<boolean>
  })

  function setDraggable() {
    // 只在主序列上拖拽
    draggableManager.setOriginDraggable(
      _componentId,
      !unref(draggable[draggableStateManager.DraggableElementType.origin])
    )
  }

  function setVisible() {
    // 在主次序列上显示
    draggableManager.setOriginVisible(
      componentId,
      !unref(visible[draggableStateManager.DraggableElementType.origin])
    )
  }

  return {
    positionRef,
    draggable,
    visible,
    originModified,
    setDraggable,
    setVisible
  }
}
