export type City =
  | 'Taipei'
  | 'NewTaipei'
  | 'Taoyuan'
  | 'Taichung'
  | 'Tainan'
  | 'Kaohsiung'
  | 'Keelung'
  | 'Hsinchu'
  | 'HsinchuCounty'
  | 'MiaoliCounty'
  | 'ChanghuaCounty'
  | 'NantouCounty'
  | 'YunlinCounty'
  | 'ChiayiCounty'
  | 'Chiayi'
  | 'PingtungCounty'
  | 'YilanCounty'
  | 'HualienCounty'
  | 'TaitungCounty'
  | 'KinmenCounty'
  | 'PenghuCounty'
  | 'LienchiangCounty';

export const Cities: City[] = [
  'Taipei',
  'NewTaipei',
  'Taoyuan',
  'Taichung',
  'Tainan',
  'Kaohsiung',
  'Keelung',
  'Hsinchu',
  'HsinchuCounty',
  'MiaoliCounty',
  'ChanghuaCounty',
  'NantouCounty',
  'YunlinCounty',
  'ChiayiCounty',
  'Chiayi',
  'PingtungCounty',
  'YilanCounty',
  'HualienCounty',
  'TaitungCounty',
  'KinmenCounty',
  'PenghuCounty',
  'LienchiangCounty',
];

export const majorCities: City[] = [
  'Taipei',
  'NewTaipei',
  'Taoyuan',
  'Taichung',
  'Tainan',
  'Kaohsiung',
];

export const counties: City[] = [
  'Keelung',
  'Hsinchu',
  'HsinchuCounty',
  'MiaoliCounty',
  'ChanghuaCounty',
  'NantouCounty',
  'YunlinCounty',
  'ChiayiCounty',
  'Chiayi',
  'PingtungCounty',
  'YilanCounty',
  'HualienCounty',
  'TaitungCounty',
  'KinmenCounty',
  'PenghuCounty',
  'LienchiangCounty',
];

export const CitySet = new Set(Cities);

export const CityMap = {
  CHA: 'ChanghuaCounty',
  ChanghuaCounty: '彰化縣',
  Chiayi: '嘉義市',
  ChiayiCounty: '嘉義縣',
  CYI: 'ChiayiCounty',
  CYQ: 'ChiayiCounty',
  HSQ: 'HsinchuCounty',
  HSZ: 'Hsinchu',
  Hsinchu: '新竹市',
  HsinchuCounty: '新竹縣',
  HUA: 'HualienCounty',
  HualienCounty: '花蓮縣',
  ILA: 'YilanCounty',
  Kaohsiung: '高雄市',
  KEE: 'Keelung',
  Keelung: '基隆市',
  KHH: 'Kaohsiung',
  KIN: 'KinmenCounty',
  KinmenCounty: '金門縣',
  LIE: 'LienchiangCounty',
  LienchiangCounty: '連江縣',
  MIA: 'MiaoliCounty',
  MiaoliCounty: '苗栗縣',
  NAN: 'NantouCounty',
  NantouCounty: '南投縣',
  NewTaipei: '新北市',
  NWT: 'NewTaipei',
  PEN: 'PenghuCounty',
  PenghuCounty: '澎湖縣',
  PIF: 'PingtungCounty',
  PingtungCounty: '屏東縣',
  TAO: 'Taoyuan',
  Taichung: '臺中市',
  Tainan: '臺南市',

  Taipei: '臺北市',
  TaitungCounty: '臺東縣',
  Taoyuan: '桃園市',
  TNN: 'Tainan',
  TPE: 'Taipei',
  TTT: 'TaitungCounty',
  TXG: 'Taichung',
  YilanCounty: '宜蘭縣',
  YUN: 'YunlinCounty',
  YunlinCounty: '雲林縣',
  南投縣: 'NantouCounty',
  嘉義市: 'Chiayi',
  嘉義縣: 'ChiayiCounty',
  基隆市: 'Keelung',
  宜蘭縣: 'YilanCounty',
  屏東縣: 'PingtungCounty',
  彰化縣: 'ChanghuaCounty',
  新北市: 'NewTaipei',
  新竹市: 'Hsinchu',
  新竹縣: 'HsinchuCounty',
  桃園市: 'Taoyuan',
  澎湖縣: 'PenghuCounty',
  臺中市: 'Taichung',
  臺北市: 'Taipei',
  臺南市: 'Tainan',
  臺東縣: 'TaitungCounty',
  花蓮縣: 'HualienCounty',
  苗栗縣: 'MiaoliCounty',
  連江縣: 'LienchiangCounty',
  金門縣: 'KinmenCounty',
  雲林縣: 'YunlinCounty',
  高雄市: 'Kaohsiung',
};
