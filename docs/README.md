## 安装

```sh
npm install our-medical
```

    项目main.ts中使用use安装MedicalImage。参数选项非必传，但如果需要部署在内网中使用，cornerstone3D会调用[detect-gpu](https://github.com/pmndrs/detect-gpu)获取GPU配置信息，该过程需要请求detect-gpu中默认的外网地址，可以通过参数benchmarksURL修改请求地址。imageLoaderOptions接收的参数类型与dicomImageLoader中对[setOptions接口](https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/dicomImageLoader/src/imageLoader/internal/options.ts)接收的参数类型一致，提供图像数据请求不同状态的钩子函数。

```typescript
import MedicalImage from 'our-medical'
app.use(MedicalImage.install, {
  benchmarksURL: string | undefined,
  imageLoaderOptions: {} | undefined
})
```

## 功能

* [呈现影像](./display.md)
* [状态管理](./status.md)
* [工具扩展](./tools.md)
* [公共方法](./utilities.md)
