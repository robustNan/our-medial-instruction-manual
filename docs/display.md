## 呈现影像

```typescript
<script setup lang="ts">
  import { ref } from 'vue'
  import { CONSTANT, type Types, utilities } from 'our-medical'

  // 组件ID，在不使用组件提供的工具组管理时非必传
  const componentId = ''

  // 组件的国际化响应式配置，可选值：'zh'|'en'
  const i18n = ref('zh')

  /**
   * 组件的序列布局响应式配置，可选值：
   * CONSTANT.Layout.Primary
   * CONSTANT.Layout.Secondary
   * CONSTANT.Layout.SideBySide
   * CONSTANT.Layout.Fusion
   */  
  const layout = ref(CONSTANT.Layout.Primary)

  /**
   * 组件中单个序列内的布局方向响应式配置，可选值：
   * CONSTANT.AxisLayout.Horizontal
   * CONSTANT.AxisLayout.Vertical
   */  
  const axisLayout = ref(CONSTANT.AxisLayout.Horizontal)

  // DICOMweb地址
  const WADO_RS_ROOT = 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb'

  // 主序列信息 - CT
  const primaryObj: Types.SeriesProps = reactive({
    studiesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    seriesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
    instances: [],
    modality: '',
    densityId: '' //可选，序列关联的电子密度配置ID
  })

  // 获取主序列metadata
  utilities
    .getMetaData(WADO_RS_ROOT, primaryObj.studiesId, primaryObj.seriesId)
    .then(({ imageIds, modality }) => {
      primaryObj.instances = imageIds
      primaryObj.modality = modality
    })

  // 次序列信息 - PET
  const secondaryObj: Types.SeriesProps = reactive({
    studiesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    seriesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.879445243400782656317561081015',
    instances: [],
    modality: ''
  })

  // 获取次序列metadata
  utilities
    .getMetaData(WADO_RS_ROOT, secondaryObj.studiesId, secondaryObj.seriesId)
    .then(({ imageIds, modality }) => {
      secondaryObj.instances = imageIds
      secondaryObj.modality = modality
    })

  // 主次序列各轴位视口中的标签显示，非必传，为空时不显示
  const prefixMark = {
    primary: { en: 'Primary', zh: '主序列' },
    secondary: { en: 'Secondary', zh: '次序列' }
  }

  // 主次序列在各轴位上滚动切层同步响应式配置
  const sliceSync = ref(false)

  // SideBySide显示模式下，当主次序列相同轴位都在最大视口中显示时是否同步显示鼠标点
  const pointSync = ref(false)

  // 配置组件颜色主题，非必传
  const color = {
    header: 'black', //顶部工具栏
    border: 'blue', //视口边框
    canvas: [0.25, 0.5, 0.25], //画布底色，数值范围0-1
    dropdownSelect: 'rgba(126, 88, 246, 0.6)' //轴位切换选框中的选中项背景色
  }
</script>

<template>
  <MedicalImage
    :id="componentId"
    :i18n="i18n"
    :layout="layout"
    :primary="primaryObj"
    :secondary="secondaryObj"
    :prefix-mark="prefixMark"
    :slice-sync="sliceSync"
    :point-sync="pointSync"
    :color="color"
  />
</template>
```
