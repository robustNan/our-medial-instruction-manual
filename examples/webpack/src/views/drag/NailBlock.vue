<script setup lang="ts">
import { defineProps } from "vue";
import initNailModule from "./nail";

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true },
});
const activedColor = "gold";
const nailModule = initNailModule(props.componentId, props.modelId);
</script>

<template>
  <div class="tool-operating">
    <h5>Nail Modify</h5>
    <div class="row">
      <button
        :style="{
          background: nailModule.nailDraggable.primary ? activedColor : '',
        }"
        @click="nailModule.setDraggable"
      >
        Nail Draggable
      </button>
      <button @mousedown="nailModule.startDrag">ADD Nail</button>

      <select @change="nailModule.nailChange">
        <option
          v-for="(item, index) in nailModule.nailsData"
          :selected="nailModule.selectedNail.value === index"
          :key="item.key"
          :value="item.key"
        >
          {{ item.name }}
        </option>
      </select>
      <button
        :style="{
          background: nailModule.nailVisible.primary ? activedColor : '',
        }"
        @click="nailModule.setVisible"
      >
        Nail Visible
      </button>

      <label>
        X:<input
          type="number"
          :value="nailModule.positionRef.value[0]"
          @change="(e) => nailModule.setPosition(e, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="nailModule.positionRef.value[1]"
          @change="(e) => nailModule.setPosition(e, 1)"
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          :value="nailModule.positionRef.value[2]"
          @change="(e) => nailModule.setPosition(e, 2)"
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
