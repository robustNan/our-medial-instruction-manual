<script setup lang="ts">
import { defineProps } from "vue";
import initFiducialModule from "./fiducial";

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true },
});
const activedColor = "gold";
const fiducialModule = initFiducialModule(props.componentId, props.modelId);
</script>

<template>
  <div class="tool-operating">
    <h5>Fiducial markers Modify</h5>
    <div class="row">
      <button
        :style="{
          background: fiducialModule.draggable.primary ? activedColor : '',
        }"
        @click="fiducialModule.setDraggable"
      >
        Markers Draggable
      </button>
      <button
        :style="{
          background: fiducialModule.visible.primary ? activedColor : '',
        }"
        @click="fiducialModule.setVisible"
      >
        Markers Visible
      </button>

      <button @mousedown="fiducialModule.addMarker">Add</button>

      <label>
        MarkerID:
        <input :value="fiducialModule.markerIdRef.value" readonly />
      </label>
      <label>
        X:<input
          type="number"
          :value="fiducialModule.postionRef.value[0]"
          @change="(e) => fiducialModule.markerPositionModified(e, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="fiducialModule.postionRef.value[1]"
          @change="(e) => fiducialModule.markerPositionModified(e, 1)"
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          :value="fiducialModule.postionRef.value[2]"
          @change="(e) => fiducialModule.markerPositionModified(e, 2)"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.tool-operating h5 {
  color: burlywood;
  font-size: 12px;
  margin: 0 0 3px;
}

.row label {
  color: white;
  font-size: 12px;
}
</style>
