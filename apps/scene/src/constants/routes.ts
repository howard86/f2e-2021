interface Route {
  href: string;
  label: string;
}

const ROUTES: Route[] = [
  { href: '/scenes', label: '景點' },
  { href: '/restaurants', label: '美食' },
  { href: '/hotels', label: '住宿' },
  { href: '/events', label: '活動' },
  { href: '/transports', label: '交通' },
  { href: '/saved', label: '收藏' },
];

export default ROUTES;
