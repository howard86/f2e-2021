import EmptyState from './empty-state';

/** Shown when TDX is rate-limited or down, so a page degrades instead of failing. */
const UnavailableState = ({ retryHref }: { retryHref: string }) => (
  <EmptyState
    action={{ href: retryHref, label: '重新載入' }}
    description="觀光資料來源暫時忙碌，請稍候一分鐘再試。"
    title="資料暫時無法載入"
  />
);

export default UnavailableState;
