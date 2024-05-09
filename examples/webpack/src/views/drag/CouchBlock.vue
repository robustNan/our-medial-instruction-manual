<script setup lang="ts">
import { defineProps } from "vue";
import initCouchModule from "./couch";

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true },
});
const activedColor = "gold";
const couchModule = initCouchModule(props.componentId, props.modelId);
</script>

<template>
  <div class="tool-operating">
    <h5>Couch Modify</h5>
    <div class="row">
      <button
        :style="{
          background: couchModule.draggable.primary ? activedColor : '',
        }"
        @click="couchModule.setDraggable"
      >
        Couch Draggable
      </button>

      <button
        :style="{ background: couchModule.visible.primary ? activedColor : '' }"
        @click="couchModule.setVisible"
      >
        Couch Visible
      </button>

      <button @mousedown="couchModule.addPrimary">ADD</button>

      <button @mousedown="couchModule.removePrimary">Delete</button>

      <label>
        X:<input
          type="number"
          :value="couchModule.couchRef.value[0]"
          @change="(e) => couchModule.couchModified(e, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="couchModule.couchRef.value[1]"
          @change="(e) => couchModule.couchModified(e, 1)"
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          :value="couchModule.couchRef.value[2]"
          @change="(e) => couchModule.couchModified(e, 2)"
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
