<script setup lang="ts">
import initShotModule from './shot'

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true }
})
const activedColor = 'gold'
const shotModule = initShotModule(props.componentId, props.modelId)
</script>

<template>
  <div class="tool-operating">
    <h5>Shot State Modify</h5>
    <div class="row">
      <button
        :style="{ background: shotModule.draggable.primary ? activedColor : '' }"
        @click="shotModule.setDraggable"
      >
        Shot Draggable
      </button>
      <button
        :style="{ background: shotModule.visible.primary ? activedColor : '' }"
        @click="shotModule.setVisible"
      >
        Shot Visible
      </button>

      <button @mousedown="shotModule.dragAddShot">Add Shot</button>
      <button @mousedown="shotModule.removeShot">Remove Shot</button>

      <label>
        ShotID:
        <input :value="shotModule.shotId.value" @change="shotModule.setShotId" />
      </label>
      <label>
        X:<input
          type="number"
          :value="shotModule.shotPosition.value[0]"
          @change="(e) => shotModule.setPosition(e, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="shotModule.shotPosition.value[1]"
          @change="(e) => shotModule.setPosition(e, 1)"
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          :value="shotModule.shotPosition.value[2]"
          @change="(e) => shotModule.setPosition(e, 2)"
        />
      </label>
      <label>
        Num:
        <input type="number" :value="shotModule.shotNumber.value" @change="shotModule.setNumber" />
      </label>
      <label>
        Size:
        <input type="number" :value="shotModule.shotCollSize.value" @change="shotModule.setSize" />
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
