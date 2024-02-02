import { reactive } from 'vue'
import { utilities } from 'our-medical'
import type { Types } from 'our-medical'

enum SeriesNames {
  a_hfs_ct_wangf = 'ALIGNED_HFS_CT_WANG_FEI', //王飞本地dicomServer
  a_ffp_ct_our = 'ALIGNED_FFP_OUR',
  a_ffs_ct_our = 'ALIGNED_FFS_OUR',
  a_hfs_ct_ohif = 'ALIGNED_HFS_CT_OHIF',
  a_hfs_pt_ohif = 'ALIGNED_HFS_PT_OHIF',
  n_hfs_mr_ohif = 'NON_ALIGNED_HFS_MR_OHIF'
}

const WADO_RS_ROOT = {
  [SeriesNames.a_hfs_ct_wangf]: 'http://192.168.94.6:12003/dicomweb', //王飞本地dicomServer
  [SeriesNames.a_ffp_ct_our]: 'http://192.168.94.33:8080/dcm4chee-arc/aets/DCM4CHEE/rs',
  [SeriesNames.a_ffs_ct_our]: 'http://192.168.94.33:8080/dcm4chee-arc/aets/DCM4CHEE/rs',
  [SeriesNames.a_hfs_ct_ohif]: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
  [SeriesNames.a_hfs_pt_ohif]: 'https://d3t6nz73ql33tx.cloudfront.net/dicomweb',
  [SeriesNames.n_hfs_mr_ohif]: 'https://d33do7qe4w26qo.cloudfront.net/dicomweb'
}

const SERIES = {
  [SeriesNames.a_hfs_ct_wangf]: {
    studiesId: '1.2.840.113729.1.55126.6292.2022.9.29.1.45.32.23.1048',
    seriesId: '1.2.840.113729.1.55126.6292.2022.9.29.1.47.2.64.1053'
  },
  [SeriesNames.a_ffp_ct_our]: {
    studiesId: '1.2.840.113704.1.111.5808.1560485784.26',
    seriesId: '1.2.840.113704.1.111.2104.1560485932.6'
  },
  [SeriesNames.a_ffs_ct_our]: {
    studiesId: '1.2.840.113704.1.111.5808.1560485573.24',
    seriesId: '1.2.840.113704.1.111.1356.1560485735.6'
  },
  [SeriesNames.a_hfs_ct_ohif]: {
    studiesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    seriesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561'
  },
  [SeriesNames.a_hfs_pt_ohif]: {
    studiesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    seriesId: '1.3.6.1.4.1.14519.5.2.1.7009.2403.879445243400782656317561081015'
  },
  [SeriesNames.n_hfs_mr_ohif]: {
    studiesId: '1.3.12.2.1107.5.2.32.35162.30000015050317233592200000046',
    seriesId: '1.3.12.2.1107.5.2.32.35162.1999123112191238897317963.0.0.0'
  }
}

// function useSeriesProps(name: keyof typeof WADO_RS_ROOT)
function useSeriesProps(name: SeriesNames) {
  const props: Types.SeriesProps = Object.assign({ instances: [], modality: '' }, SERIES[name])

  utilities
    .getMetaData(WADO_RS_ROOT[name], props.studiesId, props.seriesId)
    .then(({ imageIds, modality }) => {
      props.instances = imageIds
      props.modality = modality
    })

  const propsRefs: Types.SeriesProps = reactive({
    studiesId: '',
    seriesId: '',
    instances: [],
    modality: ''
  })

  return { props, propsRefs }
}

export { SeriesNames, useSeriesProps }
