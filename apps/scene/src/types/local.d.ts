declare namespace Local {
  import { City } from '@f2e/tdx-core';

  interface SearchQuery {
    city: City;
    keyword: string;
  }
}
