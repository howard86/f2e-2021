export type Category =
  | 'activities'
  | 'hotels'
  | 'restaurants'
  | 'scenes'
  | 'transports';

interface CategoryMeta {
  label: string;
}

export const CATEGORIES: Record<Category, CategoryMeta> = {
  activities: { label: '活動' },
  hotels: { label: '住宿' },
  restaurants: { label: '美食' },
  scenes: { label: '景點' },
  transports: { label: '交通' },
};
