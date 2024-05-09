<script setup lang="ts">
import { CONSTANT } from 'our-medical'
import initDoseModule from './dose'

import type { Types } from 'our-medical'
import type { PropType } from 'vue'

const props = defineProps({
  id: { type: String, required: true },
  priProps: { type: Object as PropType<Types.SeriesProps>, required: true },
  secProps: { type: Object as PropType<Types.SeriesProps>, required: true }
})

const { DOSE_DISPLAY_TYPES, DOSE_LEGENDS } = CONSTANT
const activedColor = 'gold'
const doseModule = initDoseModule(props.id, props.priProps, props.secProps)
</script>

<template>
  <div class="tool-operating">
    <div class="row">
      <button
        :style="{ background: doseModule.doseDisplayRef.value ? activedColor : '' }"
        @click="doseModule.doseDisplay"
      >
        Display Dose
      </button>
      <button @click="doseModule.loadPri">Load Pri</button>
      <button @click="doseModule.loadSec">Load Sec</button>
      <button @click="doseModule.deleteDose">Delete Dose</button>
      <button @click="doseModule.legendTypeChange(DOSE_LEGENDS.A)">Absolute</button>
      <button @click="doseModule.legendTypeChange(DOSE_LEGENDS.R)">Relative</button>
      <button @click="doseModule.displayTypeChange(DOSE_DISPLAY_TYPES.L)">Line</button>
      <button @click="doseModule.displayTypeChange(DOSE_DISPLAY_TYPES.F)">Fill</button>
    </div>

    <div class="row dose-row">
      <table border="1">
        <thead>
          <th>Absolute</th>
          <th>Relative</th>
          <th>Visible</th>
        </thead>
        <tbody>
          <tr v-for="(item, index) in doseModule.levelData.value.slice(0, 6)" :key="index">
            <td>{{ item.absolute.toFixed(2) }}</td>
            <td>
              <select @change="(e) => doseModule.relativeExchange(e, index)">
                <option
                  v-for="(value, index) in [
                    100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 1
                  ]"
                  :key="index"
                  :selected="item.relative === value"
                >
                  {{ value }}
                </option>
              </select>
            </td>
            <td>
              <input
                type="checkbox"
                :checked="item.visible"
                @change="(e) => doseModule.visibleExchange(e, index)"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <table border="1">
        <thead>
          <th>Absolute</th>
          <th>Relative</th>
          <th>Visible</th>
        </thead>
        <tbody>
          <tr v-for="(item, index) in doseModule.levelData.value.slice(6)" :key="index">
            <td>{{ item.absolute.toFixed(2) }}</td>
            <td>
              <select @change="(e) => doseModule.relativeExchange(e, index + 6)">
                <option
                  v-for="(value, index) in [
                    100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10, 1
                  ]"
                  :key="index"
                  :selected="item.relative === value"
                >
                  {{ value }}
                </option>
              </select>
            </td>
            <td>
              <input
                type="checkbox"
                :checked="item.visible"
                @change="(e) => doseModule.visibleExchange(e, index + 6)"
              />
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

.dose-row {
  display: flex;
}
</style>
