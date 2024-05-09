<script setup lang="ts">
import { managers } from 'our-medical'
import initImageCenter from './imageCenter'
import initOriginModule from './origin'

const { draggableStateManager } = managers

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true }
})
const activedColor = 'gold'
const imageCenter = initImageCenter(props.componentId, props.modelId)
const originModule = initOriginModule(props.componentId, props.modelId)
</script>

<template>
  <div class="tool-operating">
    <h5>Origin State Modify</h5>
    <div class="row">
      <button
        :style="{
          background: originModule.draggable[draggableStateManager.DraggableElementType.origin]
            ? activedColor
            : ''
        }"
        @click="originModule.setDraggable"
      >
        Origin Draggable
      </button>

      <button
        :style="{
          background: originModule.visible[draggableStateManager.DraggableElementType.origin]
            ? activedColor
            : ''
        }"
        @click="originModule.setVisible"
      >
        Origin Visible
      </button>

      <label>
        X:
        <input
          type="number"
          :value="originModule.positionRef.value[0]"
          @change="originModule.originModified($event, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="originModule.positionRef.value[1]"
          @change="originModule.originModified($event, 1)"
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          :value="originModule.positionRef.value[2]"
          @change="originModule.originModified($event, 2)"
        />
      </label>
    </div>
  </div>

  <div class="tool-operating">
    <h5>Image Center</h5>
    <div class="row">
      <button
        :style="{
          background: imageCenter.draggable.primary ? activedColor : ''
        }"
        @click="imageCenter.setDraggable"
      >
        ImageCenter Draggable
      </button>

      <button
        :style="{
          background: imageCenter.visible.primary ? activedColor : ''
        }"
        @click="imageCenter.setVisible"
      >
        ImageCenter Visible
      </button>

      <button @click="() => imageCenter.addCenter(originModule.positionRef.value)">Add</button>

      <button @click="imageCenter.deleteCenter">Delete</button>

      <label>
        X:
        <input
          type="number"
          :value="imageCenter.centerRef.value[0]"
          @change="imageCenter.centerModified($event, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="imageCenter.centerRef.value[1]"
          @change="imageCenter.centerModified($event, 1)"
        />
      </label>
      <label>
        Z:
        <input
          type="number"
          :value="imageCenter.centerRef.value[2]"
          @change="imageCenter.centerModified($event, 2)"
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
