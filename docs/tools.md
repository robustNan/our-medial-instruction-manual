## 工具扩展

    基于cornerstone3D中的BaseTool类扩展了一些常用工具，部分工具直接集成在视口中显示必要的信息，还有其他一些工具来支持。

### 勾画工具

    在使用勾画工具前需要确保分割体积已创建，创建方法可查看分割体积管理。分割体积的渲染仍然依赖cornerstone3D中的SegmentationDisplayTool，需要确保将其添加至组件Tool Group中并激活。

```typescript
import { SegmentationDisplayTool } from '@cornerstonejs/tools'
import { managers } from 'our-medical'

const { toolsStateManager } = managers

// 向组件ToolGroup中添加SegmentationDisplayTool
toolsStateManager.addATool(ComponentID, SegmentationDisplayTool)

// 修改SegmentationDisplayTool激活状态
toolsStateManager.setAToolEnabled(ComponentID, SegmentationDisplayTool.toolName)
toolsStateManager.setAToolDisabled(ComponentID, SegmentationDisplayTool.toolName)
```

    勾画工具在鼠标抬起后都会触发分割体积管理模块中的caleContourData重新计算勾画体积生成ContourData并触发CONTOUR_DATA_MODIFIED事件。

#### AdvanceBrushTool

    cornerstone3D中已提供BrushTool，但不支持对勾画产生的孔洞进行自动填充，AdvanceBrushTool在BrushTool的基础上对这一点进行了改进，目前能够很好的支持Circle勾画，但对Sphere的勾画支持欠佳。支持多轴位。

```typescript
import { managers, tools } from 'our-medical'

const { toolsStateManager } = managers
const { AdvanceBrushTool } = tools

// 向组件ToolGroup中添加AdvanceBrushTool
toolsStateManager.addATool(ComponentID, AdvanceBrushTool)

// 修改AdvanceBrushTool激活状态
toolsStateManager.setAToolActived(ComponentID, AdvanceBrushTool.toolName)
toolsStateManager.setAToolDisabled(ComponentID, AdvanceBrushTool.toolName)

// 设置AdvanceBrushTool笔刷尺寸
toolsStateManager.setBrushRadius(ComponentID, radius: number)
```

#### SimplePencilTool

    SimplePencilTool是一个简单的自由画笔工具，通过勾画一个封闭的轮廓来填充分割体积的voxels。支持多轴位。

```typescript
import { managers, tools } from 'our-medical'

const { toolStateManager } = managers
const { SimplePencilTool} = tools

// 向组件ToolGroup中添加SimplePencilTool
toolsStateManager.addATool(ComponentID, SimplePencilTool)

// 修改SimplePencilTool激活状态
toolsStateManager.setAToolActived(ComponentID, SimplePencilTool.toolName)
toolsStateManager.setAToolDisabled(ComponentID, SimplePencilTool.toolName)
```

#### ContourDeleteTool

    ContourDeleteTool提供交互式的删除视口中轮廓的功能。支持多轴位。

```typescript
import { managers, tools } from 'our-medical'

const { toolsStateManager } = managers
const { ContourDeleteTool} = tools

// 向组件ToolGroup中添加ContourDeleteTool
toolsStateManager.addATool(ComponentID, ContourDeleteTool)

// 修改ContourDeleteTool激活状态
toolsStateManager.setAToolActived(ComponentID, ContourDeleteTool.toolName)
toolsStateManager.setAToolDisabled(ComponentID, ContourDeleteTool.toolName)
```

### 剂量场渲染 - DoseDisplayTool

    在使用DoseDisplayTool前需要确保计划管理dose模块中已设置了剂量场数据。

```typescript
import { SegmentationDisplayTool } from '@cornerstonejs/tools'
import { managers, tools } from 'our-medical'

const { toolsStateManager } = managers
const { DoseDisplayTool } = tools

// 向组件ToolGroup中添加DoseDisplayTool 
toolsStateManager.addATool(ComponentID, DoseDisplayTool)

// 修改DoseDisplayTool 激活状态
toolsStateManager.setAToolEnabled(ComponentID, DoseDisplayTool.toolName)
toolsStateManager.setAToolDisabled(ComponentID, DoseDisplayTool.toolName)

// 剂量场渲染结束事件
eventTarget.addEventListener(
  CONSTANT.Events.DOSE_DRAWED,
  (event: Types.EventTypes.DoseRenderedEvent) => void
)
```

### 拖拽工具

    在cornerstone3D中，相同操作类型的工具只能有一个处于Actived状态，our-medical中将一些常用的拖拽元素集成在基于AnnotationTool和AnnotationDisplayTool开发的工具中，命名为DraggableTool和DraggableDisplayTool，分别负责元素的交互与渲染，目前实现了与伽马放射治疗计划制定相关的患者原点、影像中心、基准标记点、头框点及头钉点、治疗床、靶点及剂量点的拖拽与渲染 。

#### 使用拖拽工具

```typescript
import { managers, tools } from '@/components/medical'

const { toolsStateManager } = mnagers
const { DraggableDisplayTool, DraggableTool } = tools

// 添加拖拽工具至组件中 
toolsStateManager.addATool(ComponentID, DraggableDisplayTool)
toolsStateManager.addATool(ComponentID, DraggableTool)

// 设置拖拽元素渲染工具状态
toolsStateManager.setDraggableDisplayToolEnabled(ComponentID)
toolsStateManager.setDraggableDisplayToolDisabled(ComponentID)

/**
 * 设置拖拽工具的状态，设置为Actived后并不能立即开始拖拽，
 * 元素的可拖拽属性需要单独设置，可查看拖拽管理中draggable子模块中的描述
 */
toolsStateManager.setDraggableToolActived(ComponentID)
toolsStateManager.setDraggableToolDisabled(ComponentID)
```

#### 拖拽添加方法

    utilities中定义个剂量点、靶点、头钉点和基准标记点的拖拽添加方法，可以结合视口为的Button元素mousedown事件实现视口外向视口内添加拖拽元素的功能

```typescript
import type { Types as coreTypes } from '@cornerstonejs/core'
import type { Types as toolsTypes } from '@cornerstonejs/tools'
import { utilities, type Types } from '@/components/medical'

// 用于实现拖拽加添剂量点靶点
utilities.dragAddShot(ComponentID, {
  planId?: string, //非必传，鼠标抬起后根据视口ComponentID对应的PlanID自动指定
  shotId?: string,
  collSize: number,
  number?: number,
  targetId?: string,
  addedCallback?: (e: Types.EventTypes.NewPointFromDragEvent) => void,
  beforeAddHook?: (
    viewport: coreTypes.IViewport,
    points: toolsTypes.IPoints
  ) => Promise<boolean>
})

// 用于实现拖拽加添剂量点
utilities.dragAddDosePoint(ComponentID, {
  planId?: string, //非必传，鼠标抬起口根据视口ComponentID对应的PlanID自动指定
  number?: number,
  addedCallback: (e: Types.EventTypes.NewPointFromDragEvent) => void,
  beforeAddHook: (
    viewport: coreTypes.IViewport,
    points: toolsTypes.IPoints
  ) => Promise<boolean>
})

// 用于实现拖拽加添头钉点
utilities.dragAddNail(ComponentID, {
  number?: number,
  addedCallback: (e: Types.EventTypes.NewPointFromDragEvent) => void,
  beforeAddHook: (
    viewport: coreTypes.IViewport,
    points: toolsTypes.IPoints
  ) => Promise<boolean>
})

// 用于实现拖拽添加基准标记点
utilities.dragAddFiducial(ComponentID, {
  color: string,
  addedCallback: (e: Types.EventTypes.NewPointFromDragEvent) => void,
  beforeAddHook: (
    viewport: coreTypes.IViewport,
    points: toolsTypes.IPoints
  ) => Promise<boolean>
})
```

#### 拖拽元素事件

    拖拽元素的交互操作会触发对应事件将信息返回给开发者。

##### origin

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 患者原点被拖拽
eventTarget.addEventListener(
  CONSTANT.Events.ORIGIN_MODIFIED_FROM_DRAG,
  (event: Types.EventTypes.OriginModifiedFromDragEvent) => void
)

// 患者原点拖拽结束
eventTarget.addEventListener(
  CONSTANT.Events.ORIGIN_DRAG_END,
  (event: Types.EventTypes.OriginModifiedFromDragEvent) => void
)
```

##### frame

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 当前选中的头框提取点变化
eventTarget.addEventListener(
  CONSTANT.Events.CURR_FRAME_VERTICE_INFO_MODIFIED,
  (event: Types.EventTypes.CurrFrameVerticeInfoModifiedEvent) => void
)

// 头框提取点位置变化
eventTarget.addEventListener(
  CONSTANT.Events.FRAME_VERTICE_MOVED,
  (event: Types.EventTypes.FrameVerticeMovedEvent) => void
)

// 头框位置变化
eventTarget.addEventListener(
  CONSTANT.Events.FRAME_MOVED,
  (event: Types.EventTypes.FrameMovedEvent) => void
)

// 头框拖拽或提取点拖拽结束
eventTarget.addEventListener(
  CONSTANT.Events.FRAME_DRAG_END,
  (event: Types.EventTypes.FrameMovedEvent) => void
)
```

##### shot

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 靶点拖拽
eventTarget.addEventListener(
  CONSTANT.Events.SHOT_MODIFIED_FROM_DRAG,
  (event: Types.EventTypes.ShotModifiedFromDragEvent) => void
)

// 靶点拖拽删除
eventTarget.addEventListener(
  CONSTANT.Events.SHOT_REMOVED_FROM_DRAG,
  (event: Types.EventTypes.ShotRemovedFromDragEvent) => void
)

// 当前选中靶点变化
eventTarget.addEventListener(
  CONSTANT.Events.CURR_SHOT_ID_MODIFIED,
  (event: Types.EventTypes.UniquelyShotIdModifiedEvent) => void
)

// 新靶点被拖拽添加
eventTarget.addEventListener(
  CONSTANT.Events.NEW_SHOT_FROM_DRAG,
  (event: Types.EventTypes.NewPointFromDragEvent) => void
)
```

##### nail

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 头钉点被拖拽
eventTarget.addEventListener(
  CONSTANT.Events.NAIL_MODIFIED_FROM_DRAG,
  (event: Types.EventTypes.NailModifiedFromDragEvent) => void
)

// 新头钉点被拖拽添加
eventTarget.addEventListener(
  CONSTANT.Events.NEW_NAIL_FROM_DRAG,
  (event: Types.EventTypes.NewPointFromDragEvent) => void
)

// 当前选中头钉点变化
eventTarget.addEventListener(
  CONSTANT.Events.CURR_NAIL_MODIFIED,
  (event: Types.EventTypes.NailModifiedFromDragEvent) => void
)
```

##### imageCenter

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 影像中心被拖拽
eventTarget.addEventListener(
  CONSTANT.Events.IMAGE_CENTER_MODIFIED,
  (event: Types.EventTypes.ImageCenterModifiedFromDragEvent) => void
)

// 影像中心拖拽结束
eventTarget.addEventListener(
  CONSTANT.Events.IMAGE_CENTER_DRAG_END,
  (event: Types.EventTypes.ImageCenterModifiedFromDragEvent) => void
)

// 影像中心拖拽删除
eventTarget.addEventListener(
  CONSTANT.Events.IMGAE_CENTER_REMOVED_FROM_DRAG,
  (event: Types.EventTypes.ImageCenterRemovedFromDragEvent) => void
)
```

##### couch

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 治疗床被拖拽
eventTarget.addEventListener(
  CONSTANT.Events.COUCH_MODIFIED_FROM_DRAG,
  (event: Types.EventTypes.CouchModifiedFromDragEvent) => void
)

// 治疗床拖拽结束
eventTarget.addEventListener(
  CONSTANT.Events.COUCH_DRAG_END,
  (event: Types.EventTypes.CouchModifiedFromDragEvent) => void
)
```

##### fiducial

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 基准标记点被拖拽
eventTarget.addEventListener(
  CONSTANT.Events.FIDUCIAL_MODIFIED_FROM_DRAG,
  (event: Types.EventTypes.FiducialFromDragEvent) => void
)

// 基准标记点被拖拽删除
eventTarget.addEventListener(
  CONSTANT.Events.FIDUCIAL_REMOVED_FROM_DRAG,
  (event: Types.EventTypes.FiducialRemoveFromDragEvent) => void
)

// 拖拽添加基准标记点
eventTarget.addEventListener(
  CONSTANT.Events.NEW_FIDUCIAL_FROM_DRAG,
  (event: Types.EventTypes.NewPointFromDragEvent) => void
)
```

##### dosePoint

```typescript
import { eventTarget } from '@cornerstonejs-core'
import { CONSTANT, type Types } from '@/components/medical'

// 剂量点被拖拽
eventTarget.addEventListener(
  CONSTANT.Events.DOSE_PT_MODIFIED_FROM_DRAG,
  (event: Types.EventTypes.DosePtModifiedFromDragEvent) => void
)

// 剂量点被拖拽删除
eventTarget.addEventListener(
  CONSTANT.Events.DOSE_PT_REMOVED_FROM_DRAG,
  (event: Types.EventTypes.DosePtRemovedFromDragEvent) => void
)

// 剂量点批量更新剂量事件，发生在剂量场变化时
eventTarget.addEventListener(
  CONSTANT.Events.DOSE_PT_UPDATE_DOSE,
  (event: Types.EventTypes.DosePtsUpdateDoseEvent) => void
)

// 拖拽添加剂量点
eventTarget.addEventListener(
  CONSTANT.Events.NEW_DOSE_PT_FROM_DRAG,
  (event: Types.EventTypes.NewPointFromDragEvent) => void
)
```