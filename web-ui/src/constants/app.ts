/**
 * Application constants and configuration
 */

export const APP_CONSTANTS = {
  TIMEOUTS: {
    ERROR_AUTO_HIDE: 8000,
    VERIFICATION_MIN_LOADING: 1000,
    TUTORIAL_DELAY: 800,
    BROKER_RETRY_DELAY: 2000,
  },
  LIMITS: {
    MAX_MESSAGE_LENGTH: 10000,
    MAX_ERROR_DISPLAY_LENGTH: 1000,
    TEXTAREA_MAX_HEIGHT: 120,
    SEARCH_RESULTS_LIMIT: 100,
    SESSION_HISTORY_LIMIT: 50,
  },
  UI: {
    VERIFICATION_EXPIRY_MINUTES: 20,
    LOW_BALANCE_THRESHOLD: 50000,
  },
  DATABASE: {
    DB_NAME: 'idb://chat-history-db',
    MAX_RETRIES: 3,
  },
  BLOCKCHAIN: {
    NEURON_DECIMALS: 18,
    MAX_SIGNER_RETRIES: 3,
  },
} as const;

// Contract addresses - these should be moved to environment variables
export const CONTRACT_ADDRESSES = {
  BROKER: process.env.NEXT_PUBLIC_BROKER_CONTRACT || "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
  LEDGER: process.env.NEXT_PUBLIC_LEDGER_CONTRACT || "0x0165878A594ca255338adfa4d48449f69242Eb8F",
  TOKEN: process.env.NEXT_PUBLIC_TOKEN_CONTRACT || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
} as const;

/**
 * Validate Ethereum address format
 */
export const validateContractAddress = (address: string): string => {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`Invalid contract address format: ${address}`);
  }
  return address;
};

// Validate addresses at startup
Object.values(CONTRACT_ADDRESSES).forEach(validateContractAddress);