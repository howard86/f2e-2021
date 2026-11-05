import { BusService } from '@f2e/tdx-bus';
import { resolveTdxCredentials, TdxService } from '@f2e/tdx-core';

const service = new TdxService(resolveTdxCredentials(process.env));

export const busService = new BusService(service);
