<script setup lang="ts">
import { defineExpose, defineProps } from "vue";
import initSegmentationModule from "./segmentation";

import type { Types } from "our-medical";
import type { PropType } from "vue";

const props = defineProps({
  id: { type: String, required: true },
  priProps: { type: Object as PropType<Types.SeriesProps>, required: true },
});

const activedColor = "gold";
const segmentationModule = initSegmentationModule(props.id, props.priProps);

defineExpose(segmentationModule);
</script>

<template>
  <div class="tool-operating">
    <div class="row">
      <button
        :style="{
          background: segmentationModule.segmentationDisplayRef.value
            ? activedColor
            : '',
        }"
        @click="segmentationModule.segmentationDisplay"
      >
        Segmentation Display
      </button>
      <button @click="segmentationModule.importContour">Import Contour</button>
      <button @click="segmentationModule.exportContour">Export Contour</button>
      <button
        :style="{
          background: segmentationModule.brushRef.value ? activedColor : '',
        }"
        @click="segmentationModule.brushToolActived"
      >
        Brush Tool
      </button>
      <button
        :style="{
          background: segmentationModule.pencilRef.value ? activedColor : '',
        }"
        @click="segmentationModule.pencilToolActived"
      >
        Pencil Tool
      </button>
      <button
        :style="{
          background: segmentationModule.deleteRef.value ? activedColor : '',
        }"
        @click="segmentationModule.deleteToolActived"
      >
        Delete Tool
      </button>
    </div>

    <div class="row">
      <button @click="segmentationModule.unsetActiveSegmentation">
        Select None
      </button>
      <button @click="segmentationModule.clearContour">Clear All Slices</button>
      <button @click="segmentationModule.clearSlice">
        Clear Current Slice
      </button>
      <button @click="segmentationModule.deleteExternal">
        Delete External
      </button>

      <label for="">
        <input
          type="range"
          min="2"
          max="40"
          step="1"
          v-model="segmentationModule.brushRadius.value"
        />
        {{ segmentationModule.brushRadius.value }}px
      </label>
    </div>

    <div class="row">
      <table border="1">
        <thead>
          <th>Name</th>
          <th>Volume ID</th>
          <th>Color</th>
          <th>Volume (cm³)</th>
          <th>Visible</th>
          <th>operation</th>
        </thead>
        <tbody>
          <tr
            v-for="volume in segmentationModule.volumeList"
            :key="volume.name"
          >
            <td>{{ volume.name }}</td>
            <td>{{ volume.volumeId }}</td>
            <td>
              <select
                @change="
                  (e) => segmentationModule.setRepresentationColor(volume, e)
                "
              >
                <option
                  v-for="(item, index) in segmentationModule.ColorLUT"
                  :selected="
                    item[0] === volume.color[0] &&
                    item[1] === volume.color[1] &&
                    item[2] === volume.color[2] &&
                    item[3] === volume.color[3]
                  "
                  :key="index"
                  :value="index"
                >
                  {{ item }}
                </option>
              </select>
            </td>
            <td>{{ volume.volumeValue }}</td>
            <td>{{ volume.visibility }}</td>
            <td>
              <button
                @click="() => segmentationModule.setActiveSegmentation(volume)"
              >
                Select
              </button>
              <button
                @click="
                  () => segmentationModule.setSegmentationVisible(volume, true)
                "
              >
                Visible
              </button>
              <button
                @click="
                  () => segmentationModule.setSegmentationVisible(volume, false)
                "
              >
                Hide
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.tool-operating {
  width: calc(50% - 15px);
}
</style>
