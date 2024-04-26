import { reactive, ref, unref, type Ref } from 'vue'
import { eventTarget, type Types as coreTypes } from '@cornerstonejs/core'
import { CONSTANT, managers, utilities, type Types } from 'our-medical'

const { draggableStateManager, planStateManager } = managers
const {
  draggable: draggableManager,
  registe: registeManager,
  shot: shotManager
} = draggableStateManager

export default function initShotModule(componentId: string, patientModelId: string) {
  const shotId = ref('')
  const shotPosition = ref([0, 0, 0])
  const shotNumber = ref(0)
  const shotCollSize = ref(0)

  function setOnShotIdChange(shotId: string) {
    const shotAnnotation = shotManager.get(planId_P, shotId)

    if (shotAnnotation) {
      const { points, number, collSize } = shotAnnotation.data.handles
      shotPosition.value[0] = points[0][0]
      shotPosition.value[1] = points[0][1]
      shotPosition.value[2] = points[0][2]

      if (number) shotNumber.value = number

      shotCollSize.value = collSize
    }
  }

  function setShotId(e: Event) {
    const target = e.target as HTMLInputElement

    planStateManager.shot.setCurrShotId(patientModelId, target.value, [componentId])

    setOnShotIdChange(target.value)
  }

  function setPosition(e: Event, index: number) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)

    shotPosition.value[index] = value

    shotManager.update(
      planId_P,
      unref(shotId),
      { point: unref(shotPosition) as coreTypes.Point3 },
      [componentId]
    )
  }

  function setNumber(e: Event) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)

    shotNumber.value = value

    shotManager.update(planId_P, unref(shotId), { number: unref(shotNumber) }, [componentId])
  }

  function setSize(e: Event) {
    const target = e.target as HTMLInputElement
    const value = Number(target.value)

    shotCollSize.value = value

    shotManager.update(planId_P, unref(shotId), { collSize: unref(shotCollSize) }, [componentId])
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const toolGroupId_P = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.P
  const toolGroupId_S = componentId + '|' + CONSTANT.TOOL_GROUP_TYPE.S

  const planId_P = 'currentPlanShotGroupId'
  const planId_S = 'comparePlanShotGroupId'

  draggableStateManager.setModelId(componentId, patientModelId)

  // 通过状态管理优于在工具配置中设置，工具中设置必须在工具Actived之后才能设置
  planStateManager.plan.setPlanId(toolGroupId_P, planId_P)
  planStateManager.plan.setPlanId(toolGroupId_S, planId_S)

  // 添加靶点拖拽删除前的确认钩子
  registeManager.registeShotRemoveHook(componentId, async () => true)

  // 添加靶点拖拽结束后的确认钩子
  registeManager.registeShotMoveHook(componentId, async () => true)

  shotManager.add(patientModelId, planId_P, {
    pointId: 'current-plan-shot-1',
    point: [0, 0, -141],
    collSize: 18, //calibre
    number: 1
  })

  shotManager.add(patientModelId, planId_P, {
    pointId: 'current-plan-shot-2',
    point: [100, 0, -141],
    collSize: 18, //calibre
    number: 2
  })

  shotManager.add(patientModelId, planId_P, {
    pointId: 'current-plan-shot-3',
    point: [100, 100, -141],
    collSize: 18, //calibre
    number: 3
  })

  shotManager.add(patientModelId, planId_P, {
    pointId: 'current-plan-shot-4',
    point: [0, 100, -141],
    collSize: 18, //calibre
    number: 4
  })

  shotManager.add(patientModelId, planId_S, {
    pointId: 'compare-plan-shot-4',
    point: [0, 0, -141],
    collSize: 18, //calibre
    number: 1
  })

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
    const visibleRefs = draggableManager.getVisibleRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    visible.primary = visibleRefs.primary.get(draggableStateManager.DraggableElementType.shot)
    visible.secondary = visibleRefs.secondary.get(draggableStateManager.DraggableElementType.shot)

    const draggableRefs = draggableManager.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap
      secondary: Types.DraggableElementRefMap
    }

    draggable.primary = draggableRefs.primary.get(draggableStateManager.DraggableElementType.shot)
    draggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.shot
    )
  })

  function setDraggable() {
    // 只在主序列上拖拽
    draggableManager.setShotDraggable(toolGroupId_P, !draggable.primary)
  }

  function setVisible() {
    // 在主次序列上显示
    draggableManager.setShotVisible(componentId, !visible.primary)
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

  function dragAddShot() {
    managers.toolsStateManager.setHeaderToolDisabled(componentId, true)

    utilities.dragAddShot(componentId, {
      // planId: planId_P, //非必传，鼠标抬起后根据视口ToolGroupID对应的PlanID自动指定
      // shotId: '', //非必传
      collSize: 18,
      number: 1,
      addedCallback(e /* Types.EventTypes.NewPointFromDragEvent */) {
        console.log(e)
      },
      beforeAddHook: async (viewport, points) => {
        console.log(viewport, points)
        return true
      }
    })
  }

  function removeShot() {
    // 组件外部调用接口删除靶点时应传入组件ID更新渲染
    shotManager.remove(planId_P, unref(shotId), [componentId])
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  eventTarget.addEventListener(
    CONSTANT.Events.SHOT_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.ShotModifiedFromDragEvent) => {
      console.log(CONSTANT.Events.SHOT_MODIFIED_FROM_DRAG, detail)

      if (detail.id === unref(shotId)) {
        shotPosition.value = [...detail.position]
      }
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.SHOT_REMOVED_FROM_DRAG,
    ({ detail }: Types.EventTypes.ShotRemovedFromDragEvent) => {
      console.log(CONSTANT.Events.SHOT_REMOVED_FROM_DRAG, detail)
    }
  )

  eventTarget.addEventListener(
    CONSTANT.Events.CURR_SHOT_ID_MODIFIED,
    ({ detail }: Types.EventTypes.UniquelyShotIdModifiedEvent) => {
      shotId.value = detail.shotId

      setOnShotIdChange(detail.shotId)
    }
  )

  return {
    shotId,
    shotPosition,
    shotNumber,
    shotCollSize,
    setShotId,
    setPosition,
    setNumber,
    setSize,
    draggable,
    visible,
    setDraggable,
    setVisible,
    dragAddShot,
    removeShot
  }
}
