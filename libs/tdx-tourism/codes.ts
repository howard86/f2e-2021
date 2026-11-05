// Label maps for the integer / enum codes in TDX Tourism V2 records. The
// OpenAPI spec carries no labels for them; the authoritative source is the
// 交通部觀光署「觀光資料標準 V2.1」(media.taiwan.net.tw/Upload/觀光資料標準V2.1.pdf),
// 附錄二「代碼表」. Section numbers below are that appendix's. Labels are the
// Chinese names from the PDF with the English gloss and any "— …" subtitle
// dropped. Reserved ranges (e.g. cuisine 6~95) have no entry on purpose: an
// unknown code yields no label and is omitted from tags, never guessed.

export type CodeLabels = Readonly<Record<number, string>>;
export type EnumLabels = Readonly<Record<string, string>>;

/** §14 景點類型代碼 (AttractionClassEnum) */
export const ATTRACTION_CLASSES: CodeLabels = {
  1: '文化類',
  2: '生態類',
  3: '文化資產類',
  4: '宗教廟宇類',
  5: '藝術類',
  6: '商圈商店類',
  7: '國家公園類',
  8: '國家風景區類',
  9: '休閒農業類',
  10: '溫泉類',
  11: '自然風景類',
  12: '遊憩類',
  13: '體育健身類',
  14: '觀光工廠類',
  15: '都會公園類',
  16: '森林遊樂區類',
  17: '平地森林園區類',
  18: '國家自然公園類',
  19: '公園綠地類',
  20: '觀光遊樂業類',
  21: '原住民文化類',
  22: '客家文化類',
  23: '交通場站類',
  24: '水域環境類',
  25: '藝文場館類',
  26: '生態場館類',
  27: '娛樂場館類',
  254: '其他',
};

/** §15 文化資產級別代碼 (AssetsClassEnum) */
export const ASSETS_CLASSES: CodeLabels = {
  0: '非屬文化資產',
  1: '國定',
  2: '直轄市定',
  3: '縣(市)定',
  4: '重要',
  5: '一般',
  9: '其他',
};

/** §16 活動類型代碼 (EventClassEnum), including the 1xx / 2xx sub-types. */
export const EVENT_CLASSES: CodeLabels = {
  1: '節慶活動',
  2: '藝文活動',
  3: '年度活動',
  4: '遊憩活動',
  5: '地方社區型活動',
  9: '其他活動',
  101: '傳統民俗型',
  102: '宗教信仰型',
  103: '原住民文化型',
  104: '客家文化型',
  105: '藝文慶典活動',
  106: '生態體驗型',
  107: '地方特產型',
  108: '娛樂型活動',
  109: '體育賽會活動',
  110: '商貿會展型',
  201: '音樂',
  202: '戲劇',
  203: '舞蹈',
  204: '親子',
  205: '獨立音樂',
  206: '展覽',
  207: '講座',
  208: '電影',
  209: '綜藝',
  210: '競賽',
  211: '徵選',
  212: '演唱會',
  213: '研習課程',
  214: '閱讀',
  215: '其他藝文活動',
};

/** §17 活動狀態代碼 (EventStatusEnum) */
export const EVENT_STATUSES: EnumLabels = {
  EventCancelled: '活動取消',
  EventPostponed: '活動延期',
  EventRescheduled: '活動改期',
  EventScheduled: '活動照期舉行',
};

/** §18 餐飲料理類型代碼 (CuisineClassEnum) */
export const CUISINE_CLASSES: CodeLabels = {
  1: '台灣小吃/台菜',
  2: '中式料理',
  3: '港式料理',
  4: '日式料理',
  5: '韓式料理',
  96: '南亞料理',
  97: '東南亞料理',
  98: '美式/歐式料理',
  99: '其他異國料理',
  100: '夜市小吃',
  101: '甜點冰品',
  102: '麵包糕點',
  103: '非酒精飲品',
  104: '酒類飲品',
  105: '燒烤/鐵板燒',
  106: '火鍋',
  107: '海鮮',
  108: '牛排',
  109: '速食',
  110: '連鎖餐飲',
  111: '吃到飽',
  112: '便當/自助餐',
  113: '牛肉麵',
  114: '粥品',
  115: '地方特產',
  116: '伴手禮/禮盒',
  200: '純素飲食',
  201: '素食飲食',
  202: '清真飲食',
  203: '無麩質飲食',
  204: '健康飲食',
  254: '其他',
};

/** §19 餐飲特色資料代碼 (RestaurantFeatureEnum) */
export const RESTAURANT_FEATURES: CodeLabels = {
  1: '素食餐廳',
  2: '無障礙餐廳',
  3: '寵物友善',
  4: '兒童友善',
  5: '性別友善',
  6: '禁菸餐廳',
  7: '現場音樂表演',
  8: '室外雅座',
  9: '頂樓座位',
  10: '餐桌服務',
  99: '其他服務',
  101: '內用',
  102: '外帶',
  103: '外送',
  104: '預訂',
  105: '免下車服務',
  106: '外燴',
  107: '團膳',
  108: '路邊取貨',
  109: '無接觸送餐服務',
  201: '米其林指南一星',
  202: '米其林指南二星',
  203: '米其林指南三星',
  204: '米其林指南必比登推薦',
  205: '米其林綠星',
  206: '穆斯林認證餐廳',
  254: '其他',
};

/** §20 旅宿類型代碼 (HotelClassEnum) */
export const HOTEL_CLASSES: CodeLabels = {
  1: '國際觀光旅館',
  2: '一般觀光旅館',
  3: '一般旅館',
  4: '民宿',
  9: '其他',
};

/** §21 星級旅館代碼 (HotelStarsEnum) */
export const HOTEL_STARS: CodeLabels = {
  0: '無',
  1: '1星級',
  2: '2星級',
  3: '3星級',
  4: '4星級',
  5: '5星級',
  6: '卓越5星級',
};

/** §9 營運服務狀態代碼 (ServiceStatusEnum) */
export const SERVICE_STATUSES: CodeLabels = {
  0: '永久停止',
  1: '正常營運',
  2: '非營運時段',
  3: '暫時停止營運',
  9: '營運狀態待確認',
};

/** §13 設施資料代碼 (FacilityEnum); reserved ranges have no entry. */
export const FACILITIES: CodeLabels = {
  1: '廁所',
  2: '通用廁所/性別友善廁所',
  3: '哺集乳室',
  4: '飲水機',
  5: '電梯',
  6: '電扶梯',
  7: '無線網路',
  8: '諮詢站資訊',
  9: '置物櫃',
  10: '停車場',
  11: '自動體外除顫器',
  20: '無障礙通路',
  21: '無障礙廁所',
  22: '無障礙浴室',
  23: '無障礙客房',
  24: '無障礙座椅席位',
  25: '無障礙停車位',
  40: '穆斯林祈禱室',
  41: '穆斯林淨下設備',
  42: '穆斯林小淨設備',
  50: '3C 充電服務',
  51: '電動車充電服務',
  52: '簡易急救箱',
  53: '輪椅借用',
  54: '老花眼鏡借用',
  55: '手杖借用',
  56: '嬰兒車借用',
  57: '手搖車借用',
  58: '雨具借用',
  59: '吹風機借用',
  60: '自行車簡易維修工具',
  61: '充氣設備',
  254: '其他',
};

/** §11 付款方式代碼 (PaymentMethodEnum) */
export const PAYMENT_METHODS: EnumLabels = {
  Cash: '現金',
  CreditCard: '信用卡',
  MobilePayment: '行動支付',
  Others: '其他方式付款',
  SmartCard: '電子票證',
};

/** §8 組織單位類型代碼 (OrganizationClassEnum), the event-related ones. */
export const ORGANIZATION_CLASSES: EnumLabels = {
  Advisor: '指導單位',
  CoOrganizer: '協辦單位',
  ExecutiveOrganizer: '承辦單位',
  Operator: '營運單位',
  Organizer: '主辦單位',
  Sponsor: '贊助單位',
};

/** Label for a code, or undefined when the table has no entry for it. */
export const labelOf = (
  table: CodeLabels,
  code: number | null | undefined,
): string | undefined =>
  code === null || code === undefined ? undefined : table[code];

/** Labels for a list of codes; unknown codes are omitted, duplicates kept once. */
export const labelsOf = (
  table: CodeLabels,
  codes: readonly number[] | null | undefined,
): string[] => [
  ...new Set(
    (codes ?? []).flatMap((code) => {
      const label = table[code];

      return label ? [label] : [];
    }),
  ),
];
