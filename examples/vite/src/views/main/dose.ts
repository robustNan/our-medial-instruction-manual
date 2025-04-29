import { cache, utilities as coreUtil, eventTarget } from '@cornerstonejs/core'
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader'
import { CONSTANT, managers, tools, utilities } from 'our-medical'
import { ref, unref } from 'vue'

import type { Types } from 'our-medical'

export default function initDoseModule(
  id: string,
  priProps: Types.SeriesProps,
  secProps: Types.SeriesProps
) {
  const { planStateManager, toolsStateManager } = managers

  const toolPri = id + '|' + CONSTANT.TOOL_GROUP_TYPE.P
  const toolSec = id + '|' + CONSTANT.TOOL_GROUP_TYPE.S

  const planId_P = 'currentPlanShotGroupId'
  const planId_S = 'comparePlanShotGroupId'

  const levelData = ref([
    { color: 'rgb(208, 0, 0)', absolute: 5344 * 1, relative: 100, visible: true },
    { color: 'rgb(254, 0, 0)', absolute: 5344 * 0.95, relative: 95, visible: true },
    { color: 'rgb(254, 100, 12)', absolute: 5344 * 0.9, relative: 90, visible: true },
    { color: 'rgb(254, 180, 0)', absolute: 5344 * 0.85, relative: 85, visible: true },
    { color: 'rgb(248, 248, 0)', absolute: 5344 * 0.8, relative: 80, visible: true },
    { color: 'rgb(156, 254, 0)', absolute: 5344 * 0.7, relative: 70, visible: true },
    { color: 'rgb(0, 200, 0)', absolute: 5344 * 0.6, relative: 60, visible: true },
    { color: 'rgb(0, 254, 208)', absolute: 5344 * 0.5, relative: 50, visible: true },
    { color: 'rgb(0, 212, 254)', absolute: 5344 * 0.4, relative: 40, visible: true },
    { color: 'rgb(0, 140, 254)', absolute: 5344 * 0.3, relative: 30, visible: true },
    { color: 'rgb(0, 0, 192)', absolute: 5344 * 0.2, relative: 20, visible: true },
    { color: 'rgb(32, 0, 112)', absolute: 5344 * 0.1, relative: 10, visible: true }
  ])

  function addLevelData() {
    planStateManager.dose.setLevel(
      unref(levelData).map((v) => ({ ...v })),
      [id]
    )
  }
  addLevelData()

  function loadPri() {
    // const headers = new Headers()
    // headers.append('Content-Type', 'application/octet-stream')
    fetch('/dose.vti', { method: 'get' }).then(async (response) => {
      if (response.status === 200) {
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()

        const imageDataReader = vtkXMLImageDataReader.newInstance()
        imageDataReader.parseAsArrayBuffer(arrayBuffer)

        // dose data
        const imageData = imageDataReader.getOutputData()

        const volumeId = utilities.idGenerator.seriesIdToVolumeId(priProps.seriesId)
        const volume = cache.getVolume(volumeId)
        if (!volume) return

        const { origin } = volume

        imageData.setOrigin(origin)

        planStateManager.dose.setDoseData(planId_P, imageData, [toolPri])
        planStateManager.plan.setPlanId(toolPri, planId_P)

        console.log(
          'dose data range',
          coreUtil.getMinMax(imageData.getPointData().getScalars().getData())
        )
      }
    })
  }

  function loadSec() {
    fetch('/dose.vti', { method: 'get' }).then(async (response) => {
      if (response.status === 200) {
        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()

        const imageDataReader = vtkXMLImageDataReader.newInstance()
        imageDataReader.parseAsArrayBuffer(arrayBuffer)

        // dose data
        const imageData = imageDataReader.getOutputData()

        const volumeId = utilities.idGenerator.seriesIdToVolumeId(secProps.seriesId)
        const volume = cache.getVolume(volumeId)
        if (!volume) return

        const { origin } = volume

        imageData.setOrigin(origin)

        planStateManager.dose.setDoseData(planId_S, imageData, [toolSec])
        planStateManager.plan.setPlanId(toolSec, planId_S)
      }
    })
  }

  function deleteDose() {
    planStateManager.dose.deleteDoseData(planId_P, [toolPri])
    planStateManager.dose.deleteDoseData(planId_S, [toolSec])
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  function relativeExchange(e: Event, i: number) {
    const target = e.target as HTMLSelectElement
    const value = target.value

    levelData.value[i].absolute = 5344 * (Number(value) / 100)
    levelData.value[i].relative = Number(value)
    addLevelData()
  }

  function visibleExchange(e: Event, i: number) {
    const target = e.target as HTMLInputElement
    const checked = target.checked

    levelData.value[i].visible = checked
    addLevelData()
  }

  function legendTypeChange(v: CONSTANT.DOSE_LEGENDS) {
    planStateManager.dose.setLegendsType(v, [id])
  }

  function displayTypeChange(v: CONSTANT.DOSE_DISPLAY_TYPES) {
    planStateManager.dose.setDisplayType(v, [id])
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  const doseDisplayRef = ref(false)

  function doseDisplay() {
    toolsStateManager.addATool(id, tools.DoseDisplayTool)
    toolsStateManager.setAToolEnabled(id, tools.DoseDisplayTool.toolName)

    doseDisplayRef.value = true
  }

  /**
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   * ---------- ---------- ---------- ---------- ---------- ---------- ---------- ---------- ----------
   */

  eventTarget.addEventListener(
    CONSTANT.Events.DOSE_DRAWED,
    (e: Types.EventTypes.DoseRenderedEvent) => {
      console.log(e.detail)
    }
  )

  return {
    levelData,
    loadPri,
    loadSec,
    deleteDose,
    relativeExchange,
    visibleExchange,
    legendTypeChange,
    displayTypeChange,
    doseDisplayRef,
    doseDisplay
  }
}
