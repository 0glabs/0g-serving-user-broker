"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSearchParams } from "next/navigation";
import { use0GBroker } from "../hooks/use0GBroker";
import { useChatHistory } from "../hooks/useChatHistory";
import { useOptimizedDataFetching } from "../hooks/useOptimizedDataFetching";

// Import original types and utilities
import { ChatMessage } from "./ChatMessage";
import { ProviderSelector } from "./ProviderSelector";

// Convert neuron to A0GI (1 A0GI = 10^18 neuron)
const neuronToA0gi = (value: bigint): number => {
  const divisor = BigInt(10 ** 18);
  const integerPart = value / divisor;
  const remainder = value % divisor;
  const decimalPart = Number(remainder) / Number(divisor);
  return Number(integerPart) + decimalPart;
};

// Convert A0GI to neuron (currently unused but may be needed later)
/*
const a0giToNeuron = (value: number): bigint => {
  const valueStr = value.toFixed(18);
  const parts = valueStr.split('.');
  
  // Handle integer part
  const integerPart = parts[0];
  let integerPartAsBigInt = BigInt(integerPart) * BigInt(10 ** 18);
  
  // Handle fractional part if it exists
  if (parts.length > 1) {
    let fractionalPart = parts[1];
    while (fractionalPart.length < 18) {
      fractionalPart += '0';
    }
    if (fractionalPart.length > 18) {
      fractionalPart = fractionalPart.slice(0, 18); // Truncate to avoid overflow
    }
    
    const fractionalPartAsBigInt = BigInt(fractionalPart);
    integerPartAsBigInt += fractionalPartAsBigInt;
  }
  
  return integerPartAsBigInt;
};
*/

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp?: number;
  chatId?: string;
  isVerified?: boolean | null;
  isVerifying?: boolean;
}

interface Provider {
  address: string;
  model: string;
  name: string;
  verifiability: string;
  url?: string;
  endpoint?: string;
  inputPrice?: number;
  outputPrice?: number;
  inputPriceNeuron?: bigint;
  outputPriceNeuron?: bigint;
}

// Official providers based on the documentation
const OFFICIAL_PROVIDERS: Provider[] = [
  {
    address: "0xf07240Efa67755B5311bc75784a061eDB47165Dd",
    model: "llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    verifiability: "TEE (TeeML)",
  },
  {
    address: "0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3",
    model: "deepseek-r1-70b",
    name: "DeepSeek R1 70B",
    verifiability: "TEE (TeeML)",
  },
  {
    address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    model: "llama-3.3-70b-instruct",
    name: "Llama 3.3 70B Instruct",
    verifiability: "TEE (TeeML)",
  },
];

interface OptimizedChatPageProps {
  className?: string;
}

export function OptimizedChatPage({ className }: OptimizedChatPageProps) {
  const { isConnected, address } = useAccount();
  const { broker, isInitializing } = use0GBroker();
  const searchParams = useSearchParams();
  // const router = useRouter(); // May be needed for future navigation

  // State
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: "You are a helpful assistant that provides accurate information.",
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [isStreaming, setIsStreaming] = useState(false); // For future streaming support
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Optimized providers data fetching
  const { data: providers, loading: providersLoading } = useOptimizedDataFetching<Provider[]>({
    fetchFn: async () => {
      if (!broker) throw new Error('Broker not available');
      
      try {
        const services = await broker.inference.listService();
        console.log("Real services:", services);

        const transformedProviders: Provider[] = services.map((service: unknown) => {
          const serviceObj = service as {
            provider?: string;
            model?: string;
            name?: string;
            verifiability?: string;
            url?: string;
            inputPrice?: bigint;
            outputPrice?: bigint;
          };
          
          const providerAddress = serviceObj.provider || "";
          const modelName = serviceObj.model || "Unknown Model";
          const providerName = serviceObj.name || serviceObj.model || "Unknown Provider";
          const verifiability = serviceObj.verifiability || "TEE";
          const serviceUrl = serviceObj.url || "";

          const inputPrice = serviceObj.inputPrice
            ? neuronToA0gi(serviceObj.inputPrice * BigInt(1000000))
            : undefined;
          const outputPrice = serviceObj.outputPrice
            ? neuronToA0gi(serviceObj.outputPrice * BigInt(1000000))
            : undefined;

          return {
            address: providerAddress,
            model: modelName,
            name: providerName,
            verifiability: verifiability,
            url: serviceUrl,
            inputPrice,
            outputPrice,
            inputPriceNeuron: serviceObj.inputPrice,
            outputPriceNeuron: serviceObj.outputPrice,
          };
        });

        return transformedProviders;
      } catch (err) {
        console.error("Error fetching providers:", err);
        return OFFICIAL_PROVIDERS;
      }
    },
    cacheKey: 'chat-providers',
    cacheTTL: 2 * 60 * 1000, // 2 minutes cache
    dependencies: [broker],
    skip: !broker,
  });

  // Initialize chat history hook
  const chatHistory = useChatHistory({
    walletAddress: address || '',
    providerAddress: selectedProvider?.address,
    autoSave: true,
  });

  // Handle provider selection from URL or default
  useEffect(() => {
    if (!providers || providers.length === 0) return;
    
    const providerParam = searchParams.get('provider');
    
    if (providerParam && !selectedProvider) {
      const targetProvider = providers.find(
        p => p.address.toLowerCase() === providerParam.toLowerCase()
      );
      if (targetProvider) {
        setSelectedProvider(targetProvider);
      } else if (providers.length > 0) {
        setSelectedProvider(providers[0]);
      }
    } else if (!selectedProvider && providers.length > 0) {
      setSelectedProvider(providers[0]);
    }
  }, [providers, selectedProvider, searchParams]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
      }, 5000);
    }
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || !selectedProvider || !broker || isLoading) {
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: Date.now(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - replace with actual broker call
      const response = await broker.inference.chat({
        provider: selectedProvider.address,
        messages: [...messages, userMessage].map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: response.content || "I apologize, but I couldn't generate a response.",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to chat history
      chatHistory.addMessage(userMessage);
      chatHistory.addMessage(assistantMessage);

    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, selectedProvider, broker, isLoading, messages, chatHistory]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-200">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Wallet Not Connected</h3>
          <p className="text-gray-600">Please connect your wallet to start chatting with AI providers.</p>
        </div>
      </div>
    );
  }

  // Show loading state only for critical loading (broker initialization)
  const isCriticalLoading = isInitializing;
  const displayProviders = providers || OFFICIAL_PROVIDERS;

  return (
    <div className={`w-full h-full flex flex-col bg-gray-50 ${className || ''}`}>
      {/* Provider Selection Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">AI Chat</h1>
            <p className="text-sm text-gray-500">
              {selectedProvider ? `Chatting with ${selectedProvider.name}` : 'Select a provider to start'}
            </p>
          </div>
          
          {isCriticalLoading ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="text-sm">Initializing...</span>
            </div>
          ) : (
            <div className="relative">
              <ProviderSelector
                providers={displayProviders}
                selectedProvider={selectedProvider}
                onProviderSelect={setSelectedProvider}
                loading={providersLoading}
              />
              {/* Inline loading indicator for provider data */}
              {providersLoading && (
                <div className="absolute -top-1 -right-1">
                  <div className="animate-spin rounded-full h-3 w-3 border border-blue-600 border-t-transparent"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 py-2 bg-red-50 border-b border-red-200">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.slice(1).map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              isLast={index === messages.length - 2}
            />
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4 shadow-sm border max-w-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm text-gray-500">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input Area */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 min-w-0">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedProvider ? `Message ${selectedProvider.name}...` : "Select a provider to start chatting"}
                disabled={!selectedProvider || isLoading || isCriticalLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || !selectedProvider || isLoading || isCriticalLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          
          {selectedProvider && (
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>Model: {selectedProvider.model}</span>
                <span>•</span>
                <span>Provider: {selectedProvider.verifiability}</span>
                {selectedProvider.inputPrice !== undefined && (
                  <>
                    <span>•</span>
                    <span>Input: {selectedProvider.inputPrice.toFixed(4)} A0GI/1M tokens</span>
                  </>
                )}
              </div>
              <div>Press Enter to send, Shift+Enter for new line</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OptimizedChatPage;