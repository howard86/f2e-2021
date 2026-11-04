import Layout from '@/components/layout/layout';
import LoadingScreen from '@/components/loading-screen';
import { SCENES_PAGE_PROPS } from '@/constants/page-props';

const Loading = () => (
  <Layout {...SCENES_PAGE_PROPS}>
    <LoadingScreen mainColor={SCENES_PAGE_PROPS.mainColor} minH="400px" />
  </Layout>
);

export default Loading;
