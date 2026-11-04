'use client';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { useServerInsertedHTML } from 'next/navigation';
import { type ReactNode, useState } from 'react';

// Collects Emotion styles during SSR and flushes them into <head> through
// useServerInsertedHTML. Without it, Chakra renders inline <style> tags in the
// body that the client never reproduces, which breaks hydration.
const EmotionRegistry = ({ children }: { children: ReactNode }) => {
  const [{ cache, flush }] = useState(() => {
    const emotionCache = createCache({ key: 'css' });
    emotionCache.compat = true;

    const previousInsert = emotionCache.insert;
    let inserted: string[] = [];

    emotionCache.insert = (...args) => {
      const [, serialized] = args;
      if (emotionCache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return previousInsert(...args);
    };

    const flushInserted = () => {
      const previouslyInserted = inserted;
      inserted = [];
      return previouslyInserted;
    };

    return { cache: emotionCache, flush: flushInserted };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }

    return (
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Emotion-generated CSS from our own theme
        dangerouslySetInnerHTML={{
          __html: names.map((name) => cache.inserted[name]).join(''),
        }}
        data-emotion={`${cache.key} ${names.join(' ')}`}
      />
    );
  });

  return <CacheProvider value={cache}>{children}</CacheProvider>;
};

export default EmotionRegistry;
