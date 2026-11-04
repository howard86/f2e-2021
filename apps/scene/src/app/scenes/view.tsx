'use client';

import {
  Button,
  Flex,
  SimpleGrid,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import type React from 'react';
import { BsGrid3X3GapFill } from 'react-icons/bs';

import Background from '@/components/background';
import SceneCard, { type SceneCardProps } from '@/components/scene-card';
import SceneModal from '@/components/scene-modal';
import SearchBar from '@/components/search-bar';
import SearchResults from '@/components/search-list-view';
import SectionBanner, { SectionBannerLink } from '@/components/section-banner';
import useKeywordSearch from '@/hooks/use-keyword-search';
import { useLazyGetSceneCardsQuery } from '@/services/local';
import background from '@/static/background/scenes.png';
import wordOne from '@/static/background/scenes-1.png';
import wordTwo from '@/static/background/scenes-2.png';

interface ScenesViewProps {
  scenes: SceneCardProps[];
}

const renderScene = (scene: SceneCardProps) => (
  <SceneCard key={scene.href} {...scene} />
);

const ScenesView = ({ scenes }: ScenesViewProps): React.ReactElement => {
  const search = useKeywordSearch<SceneCardProps>(useLazyGetSceneCardsQuery());
  const isModalCentered = useBreakpointValue({ base: false, md: true });
  const modal = useDisclosure();

  return (
    <>
      <Background
        bgColor="colorPalette.muted"
        image={background}
        name="景點"
        wordOne={wordOne}
        wordOneAlt="景"
        wordTwo={wordTwo}
        wordTwoAlt="點"
      >
        <Flex align="center" flexDir={['column', 'row']} mt="4" w="full">
          <SearchBar
            flex="1"
            onSubmit={search.search}
            onValueChange={search.setKeyword}
            value={search.keyword}
          />
          <Button
            flexShrink={0}
            m="4"
            onClick={modal.onOpen}
            size="lg"
            variant="subtle"
          >
            <BsGrid3X3GapFill />
            進階搜尋
          </Button>
        </Flex>
      </Background>

      <Flex
        bgGradient="to-b"
        flexDir="column"
        gradientFrom="colorPalette.muted"
        gradientTo="white"
      >
        <SearchResults renderItem={renderScene} search={search} />
        <SectionBanner
          action={
            <SectionBannerLink href="/scenes">查看更多</SectionBannerLink>
          }
          // TODO: fix with CSS selector
          mt={
            search.status === 'idle' || search.status === 'error'
              ? 0
              : undefined
          }
          title="熱門景點"
        />
        <SimpleGrid columns={[1, 2, 3]} gap={6} mx="8">
          {scenes.map(renderScene)}
        </SimpleGrid>
      </Flex>
      <SceneModal
        onClose={modal.onClose}
        open={modal.open}
        placement={isModalCentered ? 'center' : 'top'}
      />
    </>
  );
};

export default ScenesView;
