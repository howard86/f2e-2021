import type { SceneClass } from '../scenes';

import type { City } from './shared-types';

export const THEMES: SceneClass[] = [
  '休閒農業類',
  '其他',
  '古蹟類',
  '國家公園類',
  '國家風景區類',
  '小吃/特產類',
  '廟宇類',
  '文化類',
  '林場類',
  '森林遊樂區類',
  '溫泉類',
  '生態類',
  '自然風景類',
  '藝術類',
  '觀光工廠類',
  '遊憩類',
  '都會公園類',
  '體育健身類',
];

export const CITIES: (City & keyof typeof CityMap)[] = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義縣',
  '嘉義市',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '金門縣',
  '澎湖縣',
  '連江縣',
];

export const BIKE_CITIES: City[] = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
  '基隆市',
  // '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義縣',
  '嘉義市',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '金門縣',
  '澎湖縣',
  '連江縣',
];

export const BUS_ESTIMATE_CITIES: City[] = ['桃園市', '臺中市', '高雄市'];

export const MAJOR_CITIES: City[] = [
  '臺北市',
  '新北市',
  '桃園市',
  '臺中市',
  '臺南市',
  '高雄市',
];

export const COUNTIES: City[] = [
  '基隆市',
  '新竹市',
  '新竹縣',
  '苗栗縣',
  '彰化縣',
  '南投縣',
  '雲林縣',
  '嘉義縣',
  '嘉義市',
  '屏東縣',
  '宜蘭縣',
  '花蓮縣',
  '臺東縣',
  '金門縣',
  '澎湖縣',
  '連江縣',
];

export enum CityMap {
  '臺北市' = 'taipei',
  '新北市' = 'newtaipei',
  '桃園市' = 'taoyuan',
  '臺中市' = 'taichung',
  '臺南市' = 'tainan',
  '高雄市' = 'kaohsiung',
  '基隆市' = 'keelung',
  '新竹市' = 'hsinchu',
  '新竹縣' = 'hsinchucounty',
  '苗栗縣' = 'miaolicounty',
  '彰化縣' = 'changhuacounty',
  '南投縣' = 'nantoucounty',
  '雲林縣' = 'yunlincounty',
  '嘉義縣' = 'chiayicounty',
  '嘉義市' = 'chiayi',
  '屏東縣' = 'pingtungcounty',
  '宜蘭縣' = 'yilancounty',
  '花蓮縣' = 'hualiencounty',
  '臺東縣' = 'taitungcounty',
  '金門縣' = 'kinmencounty',
  '澎湖縣' = 'penghucounty',
  '連江縣' = 'lienchiangcounty',
}

export enum PTXCityMap {
  '臺北市' = 'Taipei',
  '新北市' = 'NewTaipei',
  '桃園市' = 'Taoyuan',
  '臺中市' = 'Taichung',
  '臺南市' = 'Tainan',
  '高雄市' = 'Kaohsiung',
  '基隆市' = 'Keelung',
  '新竹市' = 'Hsinchu',
  '新竹縣' = 'HsinchuCounty',
  '苗栗縣' = 'MiaoliCounty',
  '彰化縣' = 'ChanghuaCounty',
  '南投縣' = 'NantouCounty',
  '雲林縣' = 'YunlinCounty',
  '嘉義縣' = 'ChiayiCounty',
  '嘉義市' = 'Chiayi',
  '屏東縣' = 'PingtungCounty',
  '宜蘭縣' = 'YilanCounty',
  '花蓮縣' = 'HualienCounty',
  '臺東縣' = 'TaitungCounty',
  '金門縣' = 'KinmenCounty',
  '澎湖縣' = 'PenghuCounty',
  '連江縣' = 'LienchiangCounty',
}

export enum CitySlugMap {
  'taipei' = '臺北市',
  'newtaipei' = '新北市',
  'taoyuan' = '桃園市',
  'taichung' = '臺中市',
  'tainan' = '臺南市',
  'kaohsiung' = '高雄市',
  'keelung' = '基隆市',
  'hsinchu' = '新竹市',
  'hsinchucounty' = '新竹縣',
  'miaolicounty' = '苗栗縣',
  'changhuacounty' = '彰化縣',
  'nantoucounty' = '南投縣',
  'yunlincounty' = '雲林縣',
  'chiayicounty' = '嘉義縣',
  'chiayi' = '嘉義市',
  'pingtungcounty' = '屏東縣',
  'yilancounty' = '宜蘭縣',
  'hualiencounty' = '花蓮縣',
  'taitungcounty' = '臺東縣',
  'kinmencounty' = '金門縣',
  'penghucounty' = '澎湖縣',
  'lienchiangcounty' = '連江縣',
}

export enum CityCodeSlugMap {
  'CHA' = 'changhuacounty',
  'CYQ' = 'chiayicounty',
  'HSQ' = 'hsinchucounty',
  'HUA' = 'hualiencounty',
  'ILA' = 'yilancounty',
  'KIN' = 'kinmencounty',
  'LIE' = 'lienchiangcounty',
  'MIA' = 'miaolicounty',
  'NAN' = 'nantoucounty',
  'PEN' = 'penghucounty',
  'PIF' = 'pingtungcounty',
  'TTT' = 'taitungcounty',
  'YUN' = 'yunlincounty',
  'CYI' = 'chiayicounty',
  'HSZ' = 'hsinchu',
  'KEE' = 'keelung',
  'KHH' = 'kaohsiung',
  'NWT' = 'newtaipei',
  'TAO' = 'taoyuan',
  'TNN' = 'tainan',
  'TPE' = 'taipei',
  'TXG' = 'taichung',
}
