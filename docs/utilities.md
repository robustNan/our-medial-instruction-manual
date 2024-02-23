## 公共方法

    utilities中提供了许多方法共使用，这里介绍部分考虑到面向开发者的功能

```typescript
import { Enums, type Types as coreTypes } from '@cornerstonejs/core'
import { utilites } from '@/components/medical'

/**
 * 组件截图，第二个参数为一个分割体积的id和segmentIndex值（非必选）
 * 如果输入第二个参数在捕获图像时可以根据体积轮廓将轮廓外的影像剔除
 */
utilities.captureImage(
  id: MedicalComponentID,
  { id: string; index: number }
).then(value => {
  // ...
})

// 根据序列中心点生成一套默认的头框位置数据
utilities.createDefaultFrame(seriesId: string)

// 根据输入的studyId和seriesID获取序列metadat
utilities.getMetaData(
  wadoRsRoot: string,
  studyInstanceUID: string,
  seriesInstanceUID: string,
  options?: {
    headers?: Record<string, string>
    scalePT?: boolean
  }
)

// 判断点位置是否在指定的segmentation中
utilities.pointInSegmentation(segmentationId: string, point: coreTypes.Point3)


// 判断输入点是否在指定体积的外包围盒内
utilities.pointInVolumeBoundingBox(
  volumeId: string,
  point: coreTypes.Point3,
  orientation?: 'x' | 'y' | 'z'
)

/**
 * 线程池构造函数，在Vite和Webpack环境下测试发现传入一个Worker的构造函数是更好的选择
 * 这样在worker文件中可以引入其他模块的功能
 *
 * 引入worker构造函数
 * vite: import Worker from '../***.worker.js?worker'
 * webpack: import Worker from '../***.worker.js'
 */
utilities.ThreadPool(
  WorkerConstructor: (new () => Worker) | { scriptURL: string | URL; options?: WorkerOptions | undefined },
  maxWorkers?: number
)

// 通过序列ID生成体积ID，这样可以获取到与组件内部一致的体积ID
utilities.idGenerator.seriesIdToVolumeId(seriesId: string)

// 获取工具组中存在指定segmentationId的视口对象, 指定了axis可以获取到更精确的视口对象
utilities.viewportsFindor.getViewportsWithSegmentationId(
  toolGroupId: DisplayComponentID,
  segmentationId: string,
  axis?: Enums.OrientationAxis
)
```