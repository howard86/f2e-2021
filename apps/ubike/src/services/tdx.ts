import { BikeService } from '@f2e/tdx-bike';
import { resolveTdxCredentials, TdxService } from '@f2e/tdx-core';

const service = new TdxService(resolveTdxCredentials(process.env));

export const bikeService = new BikeService(service);
