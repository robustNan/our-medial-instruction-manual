// declare module 'medical-image-vue-component'

// 解决src/components/medical/scripts/cornerstone_init.ts中找不到模块类型声明的报错
declare module "@cornerstonejs/dicom-image-loader";

// 解决src/components/medical/customTools/brush/strategies/fillCircle中找不到模块类型声明的报错
declare module "@kitware/vtk.js/Filters/General/ImageMarchingCubes.js";
declare module "@kitware/vtk.js/Filters/General/ImageMarchingSquares";
declare module "@kitware/vtk.js/Imaging";

declare module "@doodle3d/clipper-lib" {
  type Point = { X: number; Y: number };

  interface Clipper {
    PointInPolygon: (point: Point, path: Point[]) => number;
    Orientation: (path: Point[]) => boolean;
  }

  const Module: { Clipper: Clipper };

  export default Module;
}
