/**
 * Stellar Configuration
 * Re-exported from centralized API_CONFIG for backward compatibility
 */

import { 
  API_CONFIG,
  buildHorizonUrl,
  buildRpcUrl,
  getContractAddress,
  getTokenAddress,
  getNetworkPassphrase,
  isTestnet,
  getNetworkName
} from './api-config'

// Re-export for backward compatibility
export const STELLAR_CONFIG = API_CONFIG.STELLAR

// Re-export helper functions
export {
  buildHorizonUrl,
  buildRpcUrl,
  getContractAddress,
  getTokenAddress,
  getNetworkPassphrase,
  isTestnet,
  getNetworkName
}
