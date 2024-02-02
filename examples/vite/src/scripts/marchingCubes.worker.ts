import vtkDataArray from '@kitware/vtk.js/Common/Core/DataArray'
import vtkDataSetAttributes from '@kitware/vtk.js/Common/DataModel/DataSetAttributes'
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData'
import vtkImageMarchingCubes from '@kitware/vtk.js/Filters/General/ImageMarchingCubes.js'

import type { Types } from '@cornerstonejs/core'

type Data = {
  dimensions: Types.Point3
  direction: Types.Mat3
  origin: Types.Point3
  scalarData: Types.PixelDataTypedArray
  spacing: Types.Point3
  value: number //vtkImageMarchingCubes.setContourValue(value)
}

export default self.onmessage = ({ data }: MessageEvent<Data>) => {
  const { dimensions, direction, origin, scalarData, spacing, value } = data

  const dataArray = vtkDataArray.newInstance({
    size: scalarData.length
  })
  dataArray.setData(scalarData, 1)
  dataArray.setName('Pixels')

  const pointData = vtkDataSetAttributes.newInstance()
  // pointData.addArray(dataArray)
  pointData.setScalars(dataArray)

  const imageData = vtkImageData.newInstance()
  imageData.setDimensions(dimensions)
  imageData.setDirection(direction)
  imageData.setOrigin(origin)
  imageData.setPointData(pointData)
  imageData.setSpacing(spacing)

  // debugger

  const marchingCubes = vtkImageMarchingCubes.newInstance({
    computeNormals: true,
    mergePoints: true
  })
  marchingCubes.addInputData(imageData)
  marchingCubes.setContourValue(value)

  const polyData = marchingCubes.getOutputData()

  self.postMessage({
    pointData: polyData.getPointData().getArrayByName('Normals').getData(),
    points: polyData.getPoints().getData(),
    polys: polyData.getPolys().getData()
  })
}
