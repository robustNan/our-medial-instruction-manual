import { CONSTANT, utilities, type Types, managers } from "our-medical";
import { eventTarget, type Types as coreTypes } from "@cornerstonejs/core";
import { reactive, ref, type Ref } from "vue";

const { draggableStateManager, planStateManager } = managers;
const { draggable: draggableManager, couch: couchManager } =
  draggableStateManager;

export default function initCouchModule(
  componentId: string,
  patientModelId: string
) {
  const couchOffset: coreTypes.Point3 = [0, 0, 0];
  const primaryCouchSize: coreTypes.Point3 = [300, 25, 1850]; //[width thickness length]

  /**
   *      ___A___
   *     /      /| B
   *    /      / /
   *   /      / / C
   *  /______/ /
   *  |______|/
   *
   * A->width  B->thickness  C->length
   *
   * 治疗床原点位于长方体A边的中点点上
   * 通过 +thickness/2 和 -length/2 计算出治疗床几何中心点
   */
  const couchCenter = [
    couchOffset[0],
    couchOffset[1] + primaryCouchSize[1] / 2,
    couchOffset[2] - primaryCouchSize[2] / 2,
  ];

  const couch_S: Types.Couch = {
    couchSize: [500, 25, 1000],
    point: [0, 0, -141],
    originRender: (point: coreTypes.Point3) => {
      const str = point.map((v) => (v / 10).toFixed(2)).join(",");
      return str.slice(0, str.length - 1);
    },
  };

  const planId_P = "currentPlanShotGroupId";
  const planId_S = "comparePlanShotGroupId";

  const toolGroupId_P = componentId + "|" + CONSTANT.TOOL_GROUP_TYPE.P;
  const toolGroupId_S = componentId + "|" + CONSTANT.TOOL_GROUP_TYPE.S;

  planStateManager.plan.setPlanId(toolGroupId_P, planId_P);
  planStateManager.plan.setPlanId(toolGroupId_S, planId_S);

  couchManager.add(patientModelId, planId_S, couch_S, [toolGroupId_S]);

  const draggable: {
    primary: Ref<boolean> | undefined;
    secondary: Ref<boolean> | undefined;
  } = reactive({
    primary: undefined,
    secondary: undefined,
  });

  const visible: {
    primary: Ref<boolean> | undefined;
    secondary: Ref<boolean> | undefined;
  } = reactive({
    primary: undefined,
    secondary: undefined,
  });

  utilities.getInitialized().then(() => {
    const visibleRefs = draggableManager.getVisibleRefs(componentId) as {
      primary: Types.DraggableElementRefMap;
      secondary: Types.DraggableElementRefMap;
    };

    visible.primary = visibleRefs.primary.get(
      draggableStateManager.DraggableElementType.couch
    );
    visible.secondary = visibleRefs.secondary.get(
      draggableStateManager.DraggableElementType.couch
    );

    const draggableRefs = draggableManager.getDraggableRefs(componentId) as {
      primary: Types.DraggableElementRefMap;
      secondary: Types.DraggableElementRefMap;
    };

    draggable.primary = draggableRefs.primary.get(
      draggableStateManager.DraggableElementType.couch
    );
    draggable.secondary = draggableRefs.secondary.get(
      draggableStateManager.DraggableElementType.couch
    );
  });

  function setDraggable() {
    draggableManager.setCouchDraggable(toolGroupId_P, !draggable.primary);
  }

  function setVisible() {
    draggableManager.setCouchVisible(componentId, !visible.primary);
  }

  /** @type {*} 治疗床原点 */
  const couchRef = ref([0, 0, 0]);

  /** @type {*} 患者原点 */
  const originRef = ref([0, 0, -141]);

  function addPrimary() {
    const point: coreTypes.Point3 = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      point[i] = originRef.value[i] + couchCenter[i] + couchRef.value[i];
    }

    const couch_P: Types.Couch = {
      couchSize: primaryCouchSize,
      point,
      originRender: (point: coreTypes.Point3) => {
        const str = point
          .map((v, i) =>
            ((v - originRef.value[i] - couchCenter[i]) / 10).toFixed(2)
          )
          .join(",");
        return str.slice(0, str.length - 1);
      },
    };

    couchManager.add(patientModelId, planId_P, couch_P, [componentId]);
  }

  function removePrimary() {
    couchManager.remove(planId_P, [componentId]);
  }

  function couchModified(event: Event, index: number) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    couchRef.value[index] = value;

    const pointInWorld: coreTypes.Point3 = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      pointInWorld[i] = originRef.value[i] + couchCenter[i] + couchRef.value[i];
    }

    couchManager.update(planId_P, pointInWorld, [componentId]);
  }

  eventTarget.addEventListener(
    CONSTANT.Events.ORIGIN_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.OriginModifiedFromDragEvent) => {
      originRef.value[0] = detail.position[0];
      originRef.value[1] = detail.position[1];
      originRef.value[2] = detail.position[2];
    }
  );

  eventTarget.addEventListener(
    CONSTANT.Events.COUCH_MODIFIED_FROM_DRAG,
    ({ detail }: Types.EventTypes.CouchModifiedFromDragEvent) => {
      const { position } = detail;

      for (let i = 0; i < 3; i++) {
        couchRef.value[i] = position[i] - originRef.value[i] - couchCenter[i];
      }
    }
  );

  eventTarget.addEventListener(
    CONSTANT.Events.COUCH_DRAG_END,
    ({ detail }: Types.EventTypes.CouchModifiedFromDragEvent) => {
      const { position } = detail;

      for (let i = 0; i < 3; i++) {
        couchRef.value[i] = position[i] - originRef.value[i] - couchCenter[i];
      }
    }
  );

  return {
    draggable,
    visible,
    couchRef,
    setDraggable,
    setVisible,
    addPrimary,
    removePrimary,
    couchModified,
  };
}
