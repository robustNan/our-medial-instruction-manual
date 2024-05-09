<script setup lang="ts">
import initFrameModule from './frame'

const props = defineProps({
  componentId: { type: String, required: true },
  modelId: { type: String, required: true }
})
const activedColor = 'gold'
const frameModule = initFrameModule(props.componentId, props.modelId)
</script>

<template>
  <div class="tool-operating">
    <h5>Frame State Modify</h5>
    <div class="row">
      <button
        :style="{ background: frameModule.extractedDraggable.primary ? activedColor : '' }"
        @click="frameModule.setExtractedDraggable"
      >
        Extracted Draggable
      </button>
      <button @click="frameModule.autoRegist">Auto</button>
      <button @click="frameModule.manualRegist">Manual</button>
      <button @click="frameModule.sureFrame">Sure</button>
      <button @click="frameModule.frameRegisted">Registed</button>
      <button
        :style="{ background: frameModule.extractedVisible.primary ? activedColor : '' }"
        @click="frameModule.setExtractedVisible"
      >
        Extracted Visible
      </button>
      <button
        :style="{ background: frameModule.fittingVisible.primary ? activedColor : '' }"
        @click="frameModule.setFittingVisible"
      >
        Fitting Visible
      </button>
      <button
        :style="{ background: frameModule.physicsVisible.primary ? activedColor : '' }"
        @click="frameModule.setPhysicsVisible"
      >
        Physics Visible
      </button>
      <button @click="frameModule.resetExtractedPoints">Reset Extracted Data</button>

      <label>
        X:<input
          type="number"
          :value="frameModule.currFrameExtractedPosition.value[0]"
          @change="(e) => frameModule.setPosition(e, 0)"
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          :value="frameModule.currFrameExtractedPosition.value[1]"
          @change="(e) => frameModule.setPosition(e, 1)"
        />
      </label>
      <label>
        Z:
        <input :value="frameModule.currFrameExtractedPosition.value[2]" readonly />
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
