<script setup lang="ts">
import initDosePtModule from './dose_point'

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true }
})
const activedColor = 'gold'
const dosePtModule = initDosePtModule(props.componentId, props.modelId)
</script>

<template>
  <div class="tool-operating">
    <h5>Dose Point State Modify</h5>
    <div class="row">
      <button
        :style="{ background: dosePtModule.draggable.primary ? activedColor : '' }"
        @click="dosePtModule.setDraggable"
      >
        DosePt Draggable
      </button>

      <button
        :style="{ background: dosePtModule.visible.primary ? activedColor : '' }"
        @click="dosePtModule.setVisible"
      >
        DosePt Visible
      </button>

      <button @mousedown="dosePtModule.dragAddDosePt">Add DosePt</button>
    </div>
  </div>
</template>

<style scoped>
.tool-operating h5 {
  color: burlywood;
  font-size: 12px;
  margin: 0 0 3px;
}
</style>
