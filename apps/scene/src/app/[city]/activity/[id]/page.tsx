import DetailPage, {
  type DetailParams,
  generateDetailMetadata,
} from '@/components/detail/detail-route';

export const revalidate = 3600;

export const generateStaticParams = () => [];

export const generateMetadata = ({
  params,
}: {
  params: Promise<DetailParams>;
}) => generateDetailMetadata('activity', params);

const Page = ({ params }: { params: Promise<DetailParams> }) => (
  <DetailPage params={params} type="activity" />
);

export default Page;
