import { OpenWalletHandler } from './open-wallet/open-wallet.handler.js';
import { CloseWalletHandler } from './close-wallet/close-wallet.handler.js';
import { FreezeWalletHandler } from './freeze-wallet/freeze-wallet.handler.js';
import { UnfreezeWalletHandler } from './unfreeze-wallet/unfreeze-wallet.handler.js';

export const CommandHandlers = [
  OpenWalletHandler,
  CloseWalletHandler,
  FreezeWalletHandler,
  UnfreezeWalletHandler,
];
