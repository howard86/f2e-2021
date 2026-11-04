export type Category =
  | 'activities'
  | 'hotels'
  | 'restaurants'
  | 'scenes'
  | 'transports';

interface CategoryMeta {
  label: string;
  /** Page whose keyword search the header search button opens. */
  searchHref: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  activities: { label: '活動', searchHref: '/scenes' },
  hotels: { label: '住宿', searchHref: '/hotels' },
  restaurants: { label: '美食', searchHref: '/restaurants' },
  scenes: { label: '景點', searchHref: '/scenes' },
  transports: { label: '交通', searchHref: '/scenes' },
};
