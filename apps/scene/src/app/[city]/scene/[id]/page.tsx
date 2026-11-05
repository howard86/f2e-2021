import DetailPage, {
  type DetailParams,
  generateDetailMetadata,
} from '@/components/detail/detail-route';

export const revalidate = 86_400;

export const generateStaticParams = () => [];

export const generateMetadata = ({
  params,
}: {
  params: Promise<DetailParams>;
}) => generateDetailMetadata('scene', params);

const Page = ({ params }: { params: Promise<DetailParams> }) => (
  <DetailPage params={params} type="scene" />
);

export default Page;
