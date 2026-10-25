window.SEED_DATA = {
 "fields": [
  {
   "key": "param_name",
   "name": "参数",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": true,
   "sort": 1
  },
  {
   "key": "method",
   "name": "方法(标准号)",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 2
  },
  {
   "key": "applicable_type",
   "name": "适用类型",
   "group": "基本信息",
   "type": "multiselect",
   "unit": "",
   "filterable": false,
   "sort": 3,
   "options": [
    "地表水",
    "地下水",
    "工业废水",
    "生活污水",
    "城镇污水",
    "灌溉水",
    "其他"
   ]
  },
  {
   "key": "rr_lod",
   "name": "检出限",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 4
  },
  {
   "key": "rr_loq",
   "name": "定量限",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 5
  },
  {
   "key": "detect_range",
   "name": "检测范围",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 6
  },
  {
   "key": "rr_round",
   "name": "修约",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 7
  },
  {
   "key": "rr_nd",
   "name": "未检出",
   "group": "基本信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 8
  },
  {
   "unit": "",
   "filterable": false,
   "type": "text",
   "key": "sample_collection",
   "name": "样品采集",
   "group": "样品信息",
   "sort": 9
  },
  {
   "key": "storage_pairs",
   "name": "样品保存",
   "group": "样品信息",
   "type": "pairs",
   "unit": "",
   "filterable": false,
   "sort": 10,
   "subs": [
    {
     "k": "method",
     "label": "保存方式"
    },
    {
     "k": "period",
     "label": "保存时效"
    }
   ]
  },
  {
   "key": "ss_solutions",
   "name": "标准溶液",
   "group": "标准曲线",
   "type": "pairs",
   "unit": "",
   "filterable": false,
   "sort": 11,
   "subs": [
    {
     "k": "name",
     "label": "名称"
    },
    {
     "k": "conc",
     "label": "浓度"
    },
    {
     "k": "expiry",
     "label": "时效"
    }
   ]
  },
  {
   "key": "qc_curve_points",
   "name": "系列点",
   "group": "标准曲线",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 12
  },
  {
   "key": "qc_blank",
   "name": "空白",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 13
  },
  {
   "key": "qc_parallel",
   "name": "平行数量",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 14
  },
  {
   "unit": "",
   "filterable": false,
   "type": "text",
   "key": "qc_parallel_tol",
   "name": "平行允差",
   "group": "质控措施",
   "sort": 15
  },
  {
   "key": "qc_spike_count",
   "name": "加标数",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 16
  },
  {
   "key": "qc_spike_conc",
   "name": "标液浓度",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 17
  },
  {
   "unit": "",
   "filterable": false,
   "type": "text",
   "key": "qc_spike_vol",
   "name": "加标体积",
   "group": "质控措施",
   "sort": 18
  },
  {
   "key": "qc_spike_amount",
   "name": "加标量",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 19
  },
  {
   "unit": "",
   "filterable": false,
   "type": "text",
   "key": "qc_spike_range",
   "name": "合格范围",
   "group": "质控措施",
   "sort": 20
  },
  {
   "unit": "",
   "filterable": false,
   "key": "qc_check_conc",
   "name": "校核浓度",
   "group": "质控措施",
   "type": "text",
   "sort": 21
  },
  {
   "unit": "",
   "filterable": false,
   "key": "qc_check_dev_type",
   "name": "偏差类型",
   "group": "质控措施",
   "type": "select",
   "options": [
    "相对偏差",
    "相对误差"
   ],
   "sort": 22
  },
  {
   "unit": "",
   "filterable": false,
   "key": "qc_check_dev_value",
   "name": "偏差值",
   "group": "质控措施",
   "type": "text",
   "sort": 23
  },
  {
   "key": "qc_qc_count",
   "name": "质控数",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 24
  },
  {
   "key": "qc_qc_no",
   "name": "质控号",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 25
  },
  {
   "key": "qc_true_value",
   "name": "真值范围",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 26
  },
  {
   "key": "sample_storage",
   "name": "保存时效",
   "group": "样品信息",
   "type": "text",
   "unit": "",
   "filterable": true,
   "hidden": true,
   "sort": 27
  },
  {
   "key": "ss_reserve",
   "name": "储备液",
   "group": "标准曲线",
   "type": "text",
   "unit": "",
   "filterable": false,
   "hidden": true,
   "sort": 28
  },
  {
   "key": "ss_middle",
   "name": "中间液",
   "group": "标准曲线",
   "type": "text",
   "unit": "",
   "filterable": false,
   "hidden": true,
   "sort": 29
  },
  {
   "key": "ss_use",
   "name": "使用液",
   "group": "标准曲线",
   "type": "text",
   "unit": "",
   "filterable": false,
   "hidden": true,
   "sort": 30
  },
  {
   "key": "qc_checkpoint",
   "name": "校核点",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "hidden": true,
   "sort": 31
  },
  {
   "key": "qc_control",
   "name": "质量控制",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "hidden": true,
   "sort": 32
  },
  {
   "key": "save_method",
   "name": "保存方式",
   "group": "样品信息",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 33,
   "hidden": true
  },
  {
   "key": "std_curve",
   "name": "标准曲线",
   "group": "标准曲线",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 34,
   "hidden": true
  },
  {
   "key": "qc_sample",
   "name": "质控样品",
   "group": "质控措施",
   "type": "text",
   "unit": "",
   "filterable": false,
   "sort": 35,
   "hidden": true
  }
 ],
 "records": [
  {
   "data": {
    "param_name": "pH",
    "method": "HJ 1147—2020 （含14848、3838和5084）",
    "sample_storage": "2h",
    "ss_reserve": "/",
    "ss_middle": "/",
    "ss_use": "3个月",
    "rr_round": "后1位（温度）",
    "rr_nd": "/",
    "rr_lod": "/",
    "rr_loq": "/",
    "qc_curve_points": "25℃：4.00、6.86、9.18",
    "qc_blank": "/",
    "qc_parallel": "1/20",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1/20",
    "qc_qc_no": "(2026)ZK-88",
    "qc_true_value": "7.65±0.05",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "2h"
     }
    ],
    "ss_solutions": [
     {
      "name": "使用液",
      "conc": "",
      "expiry": "3个月"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "pH",
    "method": "DZ/T 0064.5—2021",
    "sample_storage": "现场",
    "ss_reserve": "/",
    "ss_middle": "/",
    "ss_use": "3个月",
    "rr_round": "后2位",
    "rr_nd": "/",
    "rr_lod": "/",
    "rr_loq": "/",
    "qc_curve_points": "25℃：4.00、6.86、9.18",
    "qc_blank": "/",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1/5",
    "qc_qc_no": "(2026)ZK-88",
    "qc_true_value": "7.65±0.05",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "现场",
      "period": ""
     }
    ],
    "ss_solutions": [
     {
      "name": "使用液",
      "conc": "",
      "expiry": "3个月"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "pH",
    "method": "GB/T 5750.4—2023(8.1)",
    "sample_storage": "12h",
    "ss_reserve": "/",
    "ss_middle": "/",
    "ss_use": "3个月",
    "rr_round": "后2位",
    "rr_nd": "/",
    "rr_lod": "/",
    "rr_loq": "/",
    "qc_curve_points": "25℃：4.00、6.86、9.18",
    "qc_blank": "/",
    "qc_parallel": "1/5",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1",
    "qc_qc_no": "(2026)ZK-88",
    "qc_true_value": "7.65±0.05",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "12h"
     }
    ],
    "ss_solutions": [
     {
      "name": "使用液",
      "conc": "",
      "expiry": "3个月"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "pH",
    "method": "GB 8538—2022(6)",
    "sample_storage": "现场",
    "ss_reserve": "/",
    "ss_middle": "/",
    "ss_use": "3个月",
    "rr_round": "后2位",
    "rr_nd": "/",
    "rr_lod": "/",
    "rr_loq": "/",
    "qc_curve_points": "25℃：4.00、6.86、9.18",
    "qc_blank": "/",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "现场",
      "period": ""
     }
    ],
    "ss_solutions": [
     {
      "name": "使用液",
      "conc": "",
      "expiry": "3个月"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "pH",
    "method": "NY/T 1121.2—2006",
    "sample_storage": "",
    "ss_reserve": "/",
    "ss_middle": "/",
    "ss_use": "3个月",
    "rr_round": "后2位（温度）",
    "rr_nd": "/",
    "rr_lod": "/",
    "rr_loq": "/",
    "qc_curve_points": "25℃：4.00、6.86、9.18",
    "qc_blank": "/",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1",
    "qc_qc_no": "SRS-6",
    "qc_true_value": "9.30±0.07",
    "qc_control": "",
    "storage_pairs": [],
    "ss_solutions": [
     {
      "name": "使用液",
      "conc": "",
      "expiry": "3个月"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "挥发酚",
    "method": "HJ 503—2009 （含14848和3838）",
    "sample_storage": "24h",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1个月",
    "ss_use": "1 ug/mL 现用现配",
    "rr_round": "<0.1:后4位 >=0.1:保留3位",
    "rr_nd": "0.0003 ND",
    "rr_lod": "0.0003 mg/L",
    "rr_loq": "0.001 mg/L",
    "qc_curve_points": "0.00、0.25、0.50、1.00、3.00、5.00、7.00、10.00  ug",
    "qc_blank": "1",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "2 mL",
    "qc_spike_conc": "0.008 mg/L",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "校核点相对误差<10%",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1个月"
     },
     {
      "name": "使用液",
      "conc": "1 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "挥发酚",
    "method": "DZ/T 0064.73—2021",
    "sample_storage": "24h",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1个月",
    "ss_use": "1 ug/mL 现用现配",
    "rr_round": "后3位",
    "rr_nd": "<0.002",
    "rr_lod": "/",
    "rr_loq": "0.002 mg/L",
    "qc_curve_points": "0.00、0.50、1.00、5.00、10.00、15.00、20.00  ug",
    "qc_blank": "2",
    "qc_parallel": "1/5",
    "qc_spike_count": "1/5",
    "qc_spike_amount": "2 mL",
    "qc_spike_conc": "2 ug",
    "qc_checkpoint": "/",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "参考DZ/T 0130",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1个月"
     },
     {
      "name": "使用液",
      "conc": "1 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "挥发酚",
    "method": "GB/T 5750.4—2023(12.1)",
    "sample_storage": "24h",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1个月",
    "ss_use": "1 ug/mL 现用现配",
    "rr_round": "后3位",
    "rr_nd": "<0.002",
    "rr_lod": "/",
    "rr_loq": "0.002 mg/L",
    "qc_curve_points": "0.00、0.50、1.00、2.00、4.00、6.00、8.00、10.00  ug",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "2 mL",
    "qc_spike_conc": "2 ug",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1个月"
     },
     {
      "name": "使用液",
      "conc": "1 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "挥发酚",
    "method": "GB 8538—2022(46.1)",
    "sample_storage": "24h",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1个月",
    "ss_use": "1 ug/mL 现用现配",
    "rr_round": "后3位",
    "rr_nd": "<0.002",
    "rr_lod": "/",
    "rr_loq": "0.002 mg/L",
    "qc_curve_points": "0.00、0.50、1.00、2.00、4.00、6.00、8.00、10.00  ug",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "2 mL",
    "qc_spike_conc": "2 ug",
    "qc_checkpoint": "/",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1个月"
     },
     {
      "name": "使用液",
      "conc": "1 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "总磷",
    "method": "GB 11893—1989",
    "sample_storage": "24h 冷冻1月",
    "ss_reserve": "50 mg/L 6个月",
    "ss_middle": "/",
    "ss_use": "2 ug/mL 现用现配",
    "rr_round": "后2位",
    "rr_nd": "0.01 ND",
    "rr_lod": "/",
    "rr_loq": "0.01 mg/L",
    "qc_curve_points": "0.00、1.00、2.00、6.00、10.00、20.00、30.00  ug",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "1 mL",
    "qc_spike_conc": "2 ug",
    "qc_checkpoint": "/",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     },
     {
      "method": "冷冻",
      "period": "1月"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "50 mg/L",
      "expiry": "6个月"
     },
     {
      "name": "使用液",
      "conc": "2 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "磷酸盐",
    "method": "DZ/T 0064.61—2021",
    "sample_storage": "10d",
    "ss_reserve": "500 mg/L 3个月",
    "ss_middle": "/",
    "ss_use": "10 mg/L 现用现配",
    "rr_round": "后2位",
    "rr_nd": "<0.04",
    "rr_lod": "/",
    "rr_loq": "0.04 mg/L",
    "qc_curve_points": "0.00、0.02、0.04、0.10、0.20、0.40、1.00、2.00 mg/L",
    "qc_blank": "2",
    "qc_parallel": "1/5",
    "qc_spike_count": "1/5",
    "qc_spike_amount": "0.5 mL",
    "qc_spike_conc": "0.1 mg/L",
    "qc_checkpoint": "1/20",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "参考DZ/T 0130 校核点相对偏差<=5%",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "10d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "500 mg/L",
      "expiry": "3个月"
     },
     {
      "name": "使用液",
      "conc": "10 mg/L",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1/20"
   }
  },
  {
   "data": {
    "param_name": "全磷",
    "method": "NY/T 88-1988",
    "sample_storage": "/",
    "ss_reserve": "100 mg/L 1年",
    "ss_middle": "/",
    "ss_use": "5 mg/L 现用现配",
    "rr_round": "后3位",
    "rr_nd": "/",
    "rr_lod": "0.008% （内部）",
    "rr_loq": "/",
    "qc_curve_points": "0.00、0.02、0.04、0.06、0.08、1.00 mg/L",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1",
    "qc_qc_no": "(2026)ZK-54",
    "qc_true_value": "166±24 mg/kg",
    "qc_control": "平行绝对相差<=0.005%",
    "storage_pairs": [],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "5 mg/L",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "有效磷",
    "method": "HJ 704—2014",
    "sample_storage": "/",
    "ss_reserve": "100 mg/L 1年",
    "ss_middle": "/",
    "ss_use": "5 mg/L 现用现配",
    "rr_round": "后1位 （最多保留3位）",
    "rr_nd": "/",
    "rr_lod": "0.5 mg/kg",
    "rr_loq": "2.0 mg/kg",
    "qc_curve_points": "0.00、0.10、0.20、0.30、0.40、0.50、0.60 mg/L",
    "qc_blank": "2",
    "qc_parallel": "1/10",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1",
    "qc_qc_no": "(2026)ZK-54",
    "qc_true_value": "1.1±0.3 mg/kg",
    "qc_control": "<=10：绝对差<=3 10-25：相对差<=40% 25-100：绝对差<=15 >100：相对差<=25%",
    "storage_pairs": [],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "5 mg/L",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "有效磷",
    "method": "NY/T 1121.7—2014",
    "sample_storage": "/",
    "ss_reserve": "100 mg/L 1年",
    "ss_middle": "/",
    "ss_use": "5 mg/L 现用现配",
    "rr_round": "后1位",
    "rr_nd": "/",
    "rr_lod": "0.5 mg/kg",
    "rr_loq": "/",
    "qc_curve_points": "0.00、0.10、0.20、0.40、0.60、0.80、1.00 mg/L",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "1",
    "qc_qc_no": "(2026)ZK-54",
    "qc_true_value": "1.1±0.3 mg/kg",
    "qc_control": "<10：绝对差<=0.5 10-20：绝对差<=1.0 >20：相对差<=5%",
    "storage_pairs": [],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "5 mg/L",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "锌",
    "method": "GB 7475—1987 （含3838和5084）",
    "sample_storage": "14d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1年",
    "ss_use": "10 mg/L 6个月",
    "rr_round": "后2位",
    "rr_nd": "0.05 ND",
    "rr_lod": "/",
    "rr_loq": "0.05 mg/L",
    "qc_curve_points": "0.00、0.05、0.10、0.30、0.50、0.70、1.00 mg/L（可调）",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "0.1 mg/L",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "14d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "10 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "锌",
    "method": "DZ/T 0064.83—2021 （含14848）",
    "sample_storage": "7d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1年",
    "ss_use": "10 mg/L 6个月",
    "rr_round": "后3位",
    "rr_nd": "<0.010 0.003 ND",
    "rr_lod": "0.003 mg/L",
    "rr_loq": "0.010 mg/L",
    "qc_curve_points": "0.00、0.01、0.05、0.10、0.50、0.70、1.00 mg/L",
    "qc_blank": "2",
    "qc_parallel": "1/5",
    "qc_spike_count": "1/10",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "0.1 mg/L",
    "qc_checkpoint": "1/10",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "参考DZ/T 0130 校核点相对偏差<=5%",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "7d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "10 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1/10"
   }
  },
  {
   "data": {
    "param_name": "锌",
    "method": "GB/T 5750.6—2023(8.1)",
    "sample_storage": "14d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1年",
    "ss_use": "10 mg/L 6个月",
    "rr_round": "后2位",
    "rr_nd": "<0.05",
    "rr_lod": "/",
    "rr_loq": "0.05 mg/L",
    "qc_curve_points": "0.00、0.05、0.10、0.30、0.50、0.70、1.00 mg/L（可调）",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "0.1 mg/L",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "14d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "10 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "锌",
    "method": "GB 8538—2022(18.1)",
    "sample_storage": "6m",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1年",
    "ss_use": "10 mg/L 6个月",
    "rr_round": "后2位",
    "rr_nd": "<0.05",
    "rr_lod": "/",
    "rr_loq": "0.05 mg/L",
    "qc_curve_points": "0.00、0.05、0.10、0.30、0.50、0.70、1.00 mg/L（可调）",
    "qc_blank": "2",
    "qc_parallel": "1/1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "0.1 mg/L",
    "qc_checkpoint": "1",
    "qc_qc_count": "2",
    "qc_qc_no": "(2025)ZK-11",
    "qc_true_value": "0.80±0.056 mg/L",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "6m"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "10 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "铁",
    "method": "GB 11911—1989 （含3838）",
    "sample_storage": "14d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "/",
    "ss_use": "50 mg/L 6个月",
    "rr_round": "后2位",
    "rr_nd": "0.03 ND",
    "rr_lod": "/",
    "rr_loq": "0.03 mg/L",
    "qc_curve_points": "0.00、0.10、0.20、0.50、1.00、2.00、5.00 mg/L（可调）",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "0.5 mg/L",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "14d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "使用液",
      "conc": "50 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "锰",
    "method": "GB 11911—1989 （含14848和3838）",
    "sample_storage": "14d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "/",
    "ss_use": "25 mg/L 6个月",
    "rr_round": "后2位",
    "rr_nd": "0.01 ND",
    "rr_lod": "/",
    "rr_loq": "0.01 mg/L",
    "qc_curve_points": "0.00、0.05、0.10、0.25、0.50、1.00、2.50 mg/L（可调）",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "0.25 mg/L",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "14d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "使用液",
      "conc": "25 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "银",
    "method": "HJ 1451—2026（石墨）",
    "sample_storage": "14d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "10 mg/L 6个月",
    "ss_use": "100 ug/L 1个月",
    "rr_round": "",
    "rr_nd": "0.4 ND",
    "rr_lod": "0.4 ug/L",
    "rr_loq": "1.6 ug/L",
    "qc_curve_points": "0.00、2.00、4.00、6.00、8.00、10.00 ug/L",
    "qc_blank": "2",
    "qc_parallel": "1/20",
    "qc_spike_count": "1/20",
    "qc_spike_amount": "0.2 mL",
    "qc_spike_conc": "2 ug/L",
    "qc_checkpoint": "1/20",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "14d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "10 mg/L",
      "expiry": "6个月"
     },
     {
      "name": "使用液",
      "conc": "100 ug/L",
      "expiry": "1个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1/20"
   }
  },
  {
   "data": {
    "param_name": "银",
    "method": "HJ 1443—2026（火焰）",
    "sample_storage": "14d",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100 mg/L 1年",
    "ss_use": "10 mg/L 6个月",
    "rr_round": "",
    "rr_nd": "0.02 ND",
    "rr_lod": "0.02 mg/L",
    "rr_loq": "0.08 mg/L",
    "qc_curve_points": "0.00、0.10、0.20、0.40、0.50、1.00 mg/L",
    "qc_blank": "2",
    "qc_parallel": "1/20",
    "qc_spike_count": "1/20",
    "qc_spike_amount": "0.2 mL",
    "qc_spike_conc": "0.2 mg/L",
    "qc_checkpoint": "1/20",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "14d"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1年"
     },
     {
      "name": "使用液",
      "conc": "10 mg/L",
      "expiry": "6个月"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1/20"
   }
  },
  {
   "data": {
    "param_name": "溶解氧",
    "method": "HJ 506—2009",
    "sample_storage": "24h",
    "ss_reserve": "/",
    "ss_middle": "/",
    "ss_use": "/",
    "rr_round": "",
    "rr_nd": "/",
    "rr_lod": "0",
    "rr_loq": "0",
    "qc_curve_points": "/",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "甲醛",
    "method": "HJ 601—2011",
    "sample_storage": "24h",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100mg/L 1个月",
    "ss_use": "10 ug/mL 现用现配",
    "rr_round": "后2位",
    "rr_nd": "0.05 ND",
    "rr_lod": "0.05 mg/L",
    "rr_loq": "0.20 mg/L",
    "qc_curve_points": "0.0、5.0、10.0、30.0、50.0、80.0 ug",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.25 mL",
    "qc_spike_conc": "2.5 ug",
    "qc_checkpoint": "1",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "校核点相对偏差<=10% 平行相对偏差<20% 加标回收率：80-120%",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "1个月"
     },
     {
      "name": "使用液",
      "conc": "10 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "甲醛",
    "method": "GB/T 5750.10—2023(11.1)",
    "sample_storage": "24h",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "10 mg/L 1个月",
    "ss_use": "1 ug/mL 现用现配",
    "rr_round": "后2位",
    "rr_nd": "<0.05",
    "rr_lod": "/",
    "rr_loq": "0.05 mg/L",
    "qc_curve_points": "0.00、0.25、0.50、1.00、2.00、3.00、4.00、5.00 ug",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.5 mL",
    "qc_spike_conc": "0.5 ug",
    "qc_checkpoint": "1",
    "qc_qc_count": "1",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "10 mg/L",
      "expiry": "1个月"
     },
     {
      "name": "使用液",
      "conc": "1 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": [],
    "qc_check_conc": "1"
   }
  },
  {
   "data": {
    "param_name": "臭氧",
    "method": "GB/T 5750.11—2023(9.2)",
    "sample_storage": "现场",
    "ss_reserve": "0.77 g/L 4个月",
    "ss_middle": "/",
    "ss_use": "1.54 mg/L 现用现配",
    "rr_round": "后2位",
    "rr_nd": "<0.01",
    "rr_lod": "/",
    "rr_loq": "0.01 mg/L",
    "qc_curve_points": "/",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "/",
    "qc_spike_amount": "/",
    "qc_spike_conc": "/",
    "qc_checkpoint": "/",
    "qc_qc_count": "/",
    "qc_qc_no": "/",
    "qc_true_value": "/",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "现场",
      "period": ""
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "0.77 g/L",
      "expiry": "4个月"
     },
     {
      "name": "使用液",
      "conc": "1.54 mg/L",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  },
  {
   "data": {
    "param_name": "苯胺类",
    "method": "GB 11889—19891",
    "sample_storage": "24h 冷藏2周",
    "ss_reserve": "1000 mg/L 市售",
    "ss_middle": "100mg/L 3个月",
    "ss_use": "10 ug/mL 现用现配",
    "rr_round": "后2位",
    "rr_nd": "0.03 ND",
    "rr_lod": "",
    "rr_loq": "0.03 mg/L",
    "qc_curve_points": "0.0、2.5、5.0、10.0、20.0、30.0、40.0 ug",
    "qc_blank": "2",
    "qc_parallel": "1",
    "qc_spike_count": "1",
    "qc_spike_amount": "0.1 mL",
    "qc_spike_conc": "10 ug",
    "qc_checkpoint": "",
    "qc_qc_count": "",
    "qc_qc_no": "",
    "qc_true_value": "",
    "qc_control": "",
    "storage_pairs": [
     {
      "method": "常温",
      "period": "24h"
     },
     {
      "method": "冷藏",
      "period": "2周"
     }
    ],
    "ss_solutions": [
     {
      "name": "储备液",
      "conc": "1000 mg/L",
      "expiry": "市售"
     },
     {
      "name": "中间液",
      "conc": "100 mg/L",
      "expiry": "3个月"
     },
     {
      "name": "使用液",
      "conc": "10 ug/mL",
      "expiry": "现用现配"
     }
    ],
    "applicable_type": []
   }
  }
 ]
};
