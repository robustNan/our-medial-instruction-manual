import { eventTarget } from '@cornerstonejs/core'
import { CONSTANT, managers, utilities } from 'our-medical'
import { reactive } from 'vue'

import type { Types } from 'our-medical'
import type { Ref } from 'vue'

const { draggableStateManager, toolsStateManager } = managers

export default function initShotModule(componentId: string, patientModelId: string) {
  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const toolGroupId_P = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P
  const toolGroupId_S = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.S

  const planId_P = 'currentPlanShotGroupId'
  const planId_S = 'comparePlanShotGroupId'

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

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
    const visibleRefs = draggableStateManager.draggable.getVisibleRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    visible.primary = visibleRefs.primary.get(draggableStateManager.DraggableElementType.dosePt)
    visible.secondary = visibleRefs.secondary.get(draggableStateManager.DraggableElementType.dosePt)

    const draggableRefs = draggableStateManager.draggable.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    draggable.primary = draggableRefs.primary.get(draggableStateManager.DraggableElementType.dosePt)
    draggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.dosePt
    )
  })

  function setDraggable() {
    // 只在主序列上拖拽
    draggableStateManager.draggable.setDosePointDraggable(toolGroupId_P, !draggable.primary)
  }

  function setVisible() {
    // 在主次序列上显示
    draggableStateManager.draggable.setDosePointVisible(componentId, !visible.primary)
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  function dragAddDosePt() {
    toolsStateManager.setHeaderToolDisabled(componentId, true)

    utilities.dragAddDosePoint(componentId, {
      // planId: planId_P, //非必传，鼠标抬起口根据视口ToolGroupID对应的PlanID自动指定
      number: 1,
      addedCallback(e /* Types.EventTypes.NewPointFromDragEvent */) {
        console.log(e)
      }
      /* beforeAddHook: async (viewport, points) => {
        console.log(viewport, points)
        return true
      } */
    })
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  eventTarget.addEventListener(
    CONSTANT.Events.DOSE_PT_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.DosePtModifiedFromDragEvent) => console.log(detail)
  )

  eventTarget.addEventListener(
    CONSTANT.Events.DOSE_PT_REMOVED_FROM_DRAG,
    ({ detail }: Types.EventTypes.DosePtRemovedFromDragEvent) => console.log(detail)
  )

  eventTarget.addEventListener(
    CONSTANT.Events.DOSE_PT_UPDATE_DOSE,
    ({ detail }: Types.EventTypes.DosePtsUpdateDoseEvent) => console.log(detail)
  )

  return {
    draggable,
    visible,
    setDraggable,
    setVisible,
    dragAddDosePt
  }
}
