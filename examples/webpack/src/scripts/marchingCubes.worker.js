import vtkDataArray from "@kitware/vtk.js/Common/Core/DataArray";
import vtkDataSetAttributes from "@kitware/vtk.js/Common/DataModel/DataSetAttributes";
import vtkImageData from "@kitware/vtk.js/Common/DataModel/ImageData";
import vtkImageMarchingCubes from "@kitware/vtk.js/Filters/General/ImageMarchingCubes.js";

// import type { Types } from "@cornerstonejs/core";

/** @typedef {[number, number, number]} Point3 */
/** @typedef {[number, number, number, number, number, number, number, number, number]} Mat3 */

/**
 * @param {{data: {
 *   dimensions: Point3
 *   direction: Mat3
 *   origin: Point3
 *   scalarData: Uint8Array | Uint16Array | Uint32Array
 *   spacing: Point3
 *   value: number
 * }}} {data}
 */
self.onmessage = ({ data }) => {
  const { dimensions, direction, origin, scalarData, spacing, value } = data;

  const dataArray = vtkDataArray.newInstance({
    size: scalarData.length,
  });
  dataArray.setData(scalarData, 1);
  dataArray.setName("Pixels");

  const pointData = vtkDataSetAttributes.newInstance();
  // pointData.addArray(dataArray)
  pointData.setScalars(dataArray);

  const imageData = vtkImageData.newInstance();
  imageData.setDimensions(dimensions);
  imageData.setDirection(direction);
  imageData.setOrigin(origin);
  imageData.setPointData(pointData);
  imageData.setSpacing(spacing);

  const marchingCubes = vtkImageMarchingCubes.newInstance({
    computeNormals: true,
    mergePoints: true,
  });
  marchingCubes.addInputData(imageData);
  marchingCubes.setContourValue(value);

  const polyData = marchingCubes.getOutputData();

  self.postMessage({
    pointData: polyData.getPointData().getArrayByName("Normals").getData(),
    points: polyData.getPoints().getData(),
    polys: polyData.getPolys().getData(),
  });
};
