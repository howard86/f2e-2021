import DetailSkeleton from '@/components/detail/detail-skeleton';
import Layout from '@/components/layout/layout';

const Loading = () => (
  <Layout colorPalette="restaurants">
    <DetailSkeleton />
  </Layout>
);

export default Loading;
