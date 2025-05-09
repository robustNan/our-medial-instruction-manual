<p align="center">
    <img src="http://www.ourunited.com/img/logoVi.d1e48778.png" title="" alt="" data-align="center">
</p>

### our-medical 简介

    our-medical是由[西安大医集团股份有限公司](http://www.ourunited.com/)前端项目组基于[cornerstone3D](https://www.cornerstonejs.org/)开发，用于显示DICOM医学影像的[vue](https://cn.vuejs.org/)组件（支持[Typescript](https://www.typescriptlang.org/)，暂不开放源码敬请谅解），部分功能基于公司项目需求实现可能不适合其他开发者使用。

### 功能

* 医学影像显示
* 体积勾画
* 剂量场显示
* 患者原点、基准标记点、影像中心、头框点、靶点、治疗床等可拖拽元素
* 手动配准

### 已知问题

* 体积勾画仅支持HFS的序列，其他序列存在勾画问题不适用（可以使用cornerstone3D中的勾画工具替代）
* 在视口中重叠显示两套序列时，通过volumeStateManager.setOpacity接口设置此序列透明度时，可能会呈现处非线性变化的结果。这可能与序列的层厚有关，目前采用 [1.0 - Math.pow(1.0 - opacity, interval)](https://github.com/cornerstonejs/cornerstone3D/pull/661)的方式计算最终设置到视口中的实际透明度，但最终效果仍不够理想

### 安装使用

```sh
npm install our-medical 
```

    使用教程请结合examples中的代码，查阅docs