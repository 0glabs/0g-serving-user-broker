import { useCallback, useEffect, useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { createZGComputeNetworkBroker } from "0g-serving-broker";
import type { JsonRpcSigner } from "ethers";
import { BrowserProvider } from "ethers";

// Define the broker type to avoid import issues
type ZGComputeNetworkBroker = any;

export const neuronToA0gi = (value: bigint): number => {
  const divisor = BigInt(10 ** 18);
  const integerPart = value / divisor;
  const remainder = value % divisor;
  const decimalPart = Number(remainder) / Number(divisor);

  return Number(integerPart) + decimalPart;
};

const formatBalance = (value: number): string => {
  if (value === 0) return "0";

  if (value < 0.000001) {
    return value.toExponential(6);
  }

  const formatted = value.toFixed(18);
  return formatted.replace(/\.?0+$/, "");
};

interface InferenceInfo {
  provider: string;
  balance: string;
  requestedReturn: string;
}

interface FineTuningInfo {
  provider: string;
  balance: string;
  requestedReturn: string;
}

interface LedgerInfo {
  totalBalance: string;
  availableBalance: string;
  locked: string;
  inferences: InferenceInfo[];
  fineTunings: FineTuningInfo[];
}

interface Use0GBrokerReturn {
  broker: ZGComputeNetworkBroker | null;
  isInitializing: boolean;
  error: string | null;
  ledgerInfo: LedgerInfo | null;
  initializeBroker: () => Promise<void>;
  refreshLedgerInfo: () => Promise<void>;
  addLedger: (balance: number) => Promise<void>;
  depositFund: (amount: number) => Promise<void>;
}

export function use0GBroker(): Use0GBrokerReturn {
  const { isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [broker, setBroker] = useState<ZGComputeNetworkBroker | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ledgerInfo, setLedgerInfo] = useState<LedgerInfo | null>(null);

  const initializeBroker = useCallback(async () => {
    if (!walletClient || !isConnected) {
      return;
    }

    setIsInitializing(true);
    setError(null);

    try {
      // Add longer delay to ensure walletClient is fully ready after page refresh
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Verify walletClient is still available after delay
      if (!walletClient) {
        throw new Error("Wallet client became unavailable");
      }

      // Convert walletClient to ethers signer with retry
      let provider: BrowserProvider;
      let signer: JsonRpcSigner | undefined;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          provider = new BrowserProvider(walletClient);
          signer = await provider.getSigner();

          // Verify signer connection and chain
          const address = await signer.getAddress();
          const network = await provider.getNetwork();

          console.log("Signer verified:", {
            address,
            chainId: network.chainId,
          });
          break;
        } catch (signerError) {
          retryCount++;
          console.log(
            `Signer creation attempt ${retryCount} failed:`,
            signerError
          );

          if (retryCount >= maxRetries) {
            throw signerError;
          }

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Create broker instance with proper contract addresses
      if (!signer) {
        throw new Error("Failed to create signer");
      }
      const brokerInstance = await createZGComputeNetworkBroker(
        signer as any,
        "0x8A791620dd6260079BF849Dc5567aDC3F2FdC318",
        "0x0165878A594ca255338adfa4d48449f69242Eb8F",
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
      );
      setBroker(brokerInstance);

      console.log("Broker initialized successfully");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize broker";
      setError(errorMessage);
      console.error("Broker initialization error:", err);
    } finally {
      setIsInitializing(false);
    }
  }, [walletClient, isConnected]);

  const refreshLedgerInfo = useCallback(async () => {
    if (!broker) return;

    try {
      const { ledgerInfo, infers, fines } =
        await broker.ledger.ledger.getLedgerWithDetail();
      console.log("Refreshed ledger data:", { ledgerInfo, infers, fines });

      const totalBalance = neuronToA0gi(BigInt(ledgerInfo[0])); // Convert from neuron to A0GI
      const locked = neuronToA0gi(BigInt(ledgerInfo[1])); // Convert from neuron to A0GI
      const available = totalBalance - locked;

      // Process inference information
      const processedInferences: InferenceInfo[] = [];
      if (infers && infers.length > 0) {
        for (const infer of infers) {
          const provider = infer[0];
          const balance = formatBalance(neuronToA0gi(BigInt(infer[1])));
          const requestedReturn = formatBalance(neuronToA0gi(BigInt(infer[2])));
          processedInferences.push({ provider, balance, requestedReturn });
        }
      }

      // Process fine tuning information
      const processedFineTunings: FineTuningInfo[] = [];
      if (fines && fines.length > 0) {
        console.log("Processing fine tunings:", fines);
        for (const fine of fines) {
          const provider = fine[0];
          const balance = formatBalance(neuronToA0gi(BigInt(fine[1])));
          const requestedReturn = formatBalance(neuronToA0gi(BigInt(fine[2])));
          processedFineTunings.push({ provider, balance, requestedReturn });
        }
      }

      setLedgerInfo({
        totalBalance: formatBalance(totalBalance),
        availableBalance: formatBalance(available),
        locked: formatBalance(locked),
        inferences: processedInferences,
        fineTunings: processedFineTunings,
      });
    } catch (err: unknown) {
      console.error("Failed to refresh ledger info:", err);
      setLedgerInfo(null);
    }
  }, [broker]);

  const addLedger = useCallback(
    async (balance: number) => {
      if (!broker) {
        throw new Error("Broker not initialized");
      }

      try {
        console.log("Creating ledger with balance:", balance, "A0GI");
        const brokerSigner = (
          broker as { signer?: { getAddress(): Promise<string> } }
        ).signer;
        console.log(
          "Broker address:",
          brokerSigner ? await brokerSigner.getAddress() : "No signer"
        );
        console.log("Broker details:", { balance, type: typeof balance });

        await broker.ledger.addLedger(balance);
        await refreshLedgerInfo();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add ledger";
        throw new Error(errorMessage);
      }
    },
    [broker, refreshLedgerInfo]
  );

  const depositFund = useCallback(
    async (amount: number) => {
      if (!broker) {
        throw new Error("Broker not initialized");
      }

      try {
        // First try to check if ledger exists
        let hasLedger = false;
        try {
          const tmp = await broker.ledger.ledger.getLedgerWithDetail();
          console.log("Ledger exists:", tmp);
          hasLedger = true;
        } catch (ledgerError) {
          // Ledger doesn't exist yet
          console.log(
            "Ledger does not exist, will create new one",
            ledgerError
          );
          hasLedger = false;
        }

        if (hasLedger) {
          // Ledger exists, deposit funds
          await broker.ledger.depositFund(amount);
        } else {
          console.log("Creating new ledger with initial deposit", amount);
          console.log(typeof amount, "amount:", amount);
          await broker.ledger.addLedger(amount);
        }

        await refreshLedgerInfo();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to deposit funds";
        throw new Error(errorMessage);
      }
    },
    [broker, refreshLedgerInfo]
  );

  // Auto-initialize when wallet connects with retry mechanism
  useEffect(() => {
    if (isConnected && walletClient && !broker && !isInitializing) {
      const initWithRetry = async () => {
        try {
          await initializeBroker();
        } catch {
          console.log(
            "Initial broker initialization failed, retrying in 2s..."
          );
          setTimeout(() => {
            if (isConnected && walletClient && !broker) {
              initializeBroker();
            }
          }, 2000);
        }
      };
      initWithRetry();
    }
  }, [isConnected, walletClient, broker, isInitializing, initializeBroker]);

  // Reset state when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setBroker(null);
      setLedgerInfo(null);
      setError(null);
    }
  }, [isConnected]);

  return {
    broker,
    isInitializing,
    error,
    ledgerInfo,
    initializeBroker,
    refreshLedgerInfo,
    addLedger,
    depositFund,
  };
}
