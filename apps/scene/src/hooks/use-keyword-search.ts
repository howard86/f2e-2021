import { useCallback, useState } from 'react';

import type { ApiResponse } from '@/lib/api';

interface KeywordArgs {
  keyword: string;
}

// Structural subset of an RTK Query lazy hook result, so one hook serves
// every keyword endpoint.
type LazySearch<T> = readonly [
  (args: KeywordArgs) => unknown,
  {
    data?: ApiResponse<T[]>;
    error?: unknown;
    isError: boolean;
    isFetching: boolean;
    isUninitialized: boolean;
    originalArgs?: KeywordArgs;
  },
  ...unknown[],
];

type SearchStatus = 'idle' | 'loading' | 'error' | 'empty' | 'success';

const isNotFound = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === 404;

const useKeywordSearch = <T>([trigger, result]: LazySearch<T>) => {
  const [keyword, setKeyword] = useState('');
  const submittedKeyword = result.originalArgs?.keyword ?? '';

  const search = useCallback(() => {
    const trimmed = keyword.trim();

    if (trimmed) {
      trigger({ keyword: trimmed });
    }
  }, [keyword, trigger]);

  const retry = useCallback(() => {
    trigger({ keyword: submittedKeyword });
  }, [submittedKeyword, trigger]);

  const items = result.data?.success === true ? result.data.data : undefined;

  let status: SearchStatus = 'success';

  if (result.isUninitialized) {
    status = 'idle';
  } else if (result.isFetching) {
    status = 'loading';
  } else if (isNotFound(result.error)) {
    // The API answers a no-match search with 404.
    status = 'empty';
  } else if (result.isError || !items) {
    status = 'error';
  } else if (items.length === 0) {
    status = 'empty';
  }

  return {
    items: items ?? [],
    keyword,
    retry,
    search,
    setKeyword,
    status,
    submittedKeyword,
  };
};

export default useKeywordSearch;
