"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAccount } from "wagmi";
import { useSearchParams, useRouter } from "next/navigation";
import { use0GBroker } from "../../../../hooks/use0GBroker";
import { useChatHistory } from "../../../../hooks/useChatHistory";

// Convert neuron to A0GI (1 A0GI = 10^18 neuron)
const neuronToA0gi = (value: bigint): number => {
  const divisor = BigInt(10 ** 18);
  const integerPart = value / divisor;
  const remainder = value % divisor;
  const decimalPart = Number(remainder) / Number(divisor);
  return Number(integerPart) + decimalPart;
};

// Convert A0GI to neuron
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
import ReactMarkdown from "react-markdown";

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

export function OptimizedChatPage() {
  const { isConnected, address } = useAccount();
  const { broker, isInitializing, ledgerInfo, refreshLedgerInfo } = use0GBroker();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful assistant that provides accurate information.",
      timestamp: Date.now(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [serviceMetadata, setServiceMetadata] = useState<{
    endpoint: string;
    model: string;
  } | null>(null);
  const [providerAcknowledged, setProviderAcknowledged] = useState<
    boolean | null
  >(null);
  const [isVerifyingProvider, setIsVerifyingProvider] = useState(false);
  // Note: Deposit modal is now handled globally in LayoutContent
  const [providerBalance, setProviderBalance] = useState<number | null>(null);
  const [providerBalanceNeuron, setProviderBalanceNeuron] = useState<bigint | null>(null);
  const [showFundingAlert, setShowFundingAlert] = useState(false);
  const [fundingAlertMessage, setFundingAlertMessage] = useState("");
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopping, setIsTopping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<'verify' | 'topup' | null>(null);
  
  // Chat history state
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Message & { sessionId: string })[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Initialize chat history hook
  const chatHistory = useChatHistory({
    walletAddress: address || '',
    providerAddress: selectedProvider?.address,
    autoSave: true,
  });

  // Handle provider change - clear current session to start fresh
  const previousProviderRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (selectedProvider?.address && 
        previousProviderRef.current !== undefined && 
        previousProviderRef.current !== selectedProvider.address) {
      // Only clear when we actually switch providers, not on initial load
      setMessages([
        {
          role: "system",
          content: "You are a helpful assistant that provides accurate information.",
          timestamp: Date.now(),
        },
      ]);
    }
    previousProviderRef.current = selectedProvider?.address;
  }, [selectedProvider?.address]);

  // Custom setError function with auto-hide after 8 seconds
  const setErrorWithTimeout = (errorMessage: string | null) => {
    // Clear existing timeout
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    
    setError(errorMessage);
    
    // Set timeout to clear error after 8 seconds
    if (errorMessage) {
      errorTimeoutRef.current = setTimeout(() => {
        setError(null);
        errorTimeoutRef.current = null;
      }, 8000);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".provider-dropdown")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Fetch real providers when broker is available
  useEffect(() => {
    const fetchProviders = async () => {
      if (broker) {
        try {
          // Use the broker to get real service list
          const services = await broker.inference.listService();
          console.log("Real services:", services);

          // Transform services to Provider format
          const transformedProviders: Provider[] = services.map(
            (service: unknown) => {
              // Type assertion for service properties
              const serviceObj = service as {
                provider?: string;
                model?: string;
                name?: string;
                verifiability?: string;
                url?: string;
                inputPrice?: bigint;
                outputPrice?: bigint;
              };
              // Type guard to ensure service has the required properties
              const providerAddress = serviceObj.provider || "";
              const modelName = serviceObj.model || "Unknown Model";
              const providerName =
                serviceObj.name || serviceObj.model || "Unknown Provider";
              const verifiability = serviceObj.verifiability || "TEE";
              const serviceUrl = serviceObj.url || "";

              console.log("serviceObj.inputPrice", serviceObj.inputPrice);
              console.log("serviceObj.outputPrice", serviceObj.outputPrice);

              // Convert prices from neuron to A0GI per million tokens
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
            }
          );

          setProviders(transformedProviders);

          // Check for provider parameter from URL
          const providerParam = searchParams.get('provider');
          
          if (providerParam && !selectedProvider) {
            // Try to find the provider by address
            const targetProvider = transformedProviders.find(
              p => p.address.toLowerCase() === providerParam.toLowerCase()
            );
            if (targetProvider) {
              setSelectedProvider(targetProvider);
            } else if (transformedProviders.length > 0) {
              // Fallback to first provider if specified provider not found
              setSelectedProvider(transformedProviders[0]);
            }
          } else if (!selectedProvider && transformedProviders.length > 0) {
            // Set the first provider as selected if none is selected
            setSelectedProvider(transformedProviders[0]);
          }
        } catch (err: unknown) {
          console.error("Error fetching providers:", err);
          // Fallback to mock data if real data fetch fails
          setProviders(OFFICIAL_PROVIDERS);
          
          // Check for provider parameter from URL
          const providerParam = searchParams.get('provider');
          
          if (providerParam && !selectedProvider) {
            // Try to find the provider by address
            const targetProvider = OFFICIAL_PROVIDERS.find(
              p => p.address.toLowerCase() === providerParam.toLowerCase()
            );
            if (targetProvider) {
              setSelectedProvider(targetProvider);
            } else if (OFFICIAL_PROVIDERS.length > 0) {
              // Fallback to first provider if specified provider not found
              setSelectedProvider(OFFICIAL_PROVIDERS[0]);
            }
          } else if (!selectedProvider && OFFICIAL_PROVIDERS.length > 0) {
            setSelectedProvider(OFFICIAL_PROVIDERS[0]);
          }
        }
      }
    };

    fetchProviders();
  }, [broker, selectedProvider]);

  // Note: Global ledger check is now handled in LayoutContent component

  // Refresh ledger info when broker is available
  useEffect(() => {
    if (broker && refreshLedgerInfo) {
      console.log("Refreshing ledger info...");
      refreshLedgerInfo();
    }
  }, [broker, refreshLedgerInfo]);

  // Fetch service metadata when provider is selected
  useEffect(() => {
    const fetchServiceMetadata = async () => {
      if (broker && selectedProvider) {
        try {
          // Step 5.1: Get the request metadata
          const metadata = await broker.inference.getServiceMetadata(
            selectedProvider.address
          );
          console.log("Service metadata:", metadata);
          setServiceMetadata(metadata);
        } catch (err: unknown) {
          console.error("Error fetching service metadata:", err);
          setServiceMetadata(null);
        }
      }
    };

    fetchServiceMetadata();
  }, [broker, selectedProvider]);

  // Fetch provider acknowledgment status when provider is selected
  useEffect(() => {
    const fetchProviderAcknowledgment = async () => {
      if (broker && selectedProvider) {
        try {
          const acknowledged = await broker.inference.userAcknowledged(
            selectedProvider.address
          );
          console.log("Provider acknowledged:", acknowledged);
          setProviderAcknowledged(acknowledged);
          
          // Check if we should show tutorial
          const tutorialKey = `tutorial_seen_${selectedProvider.address}`;
          if (!localStorage.getItem(tutorialKey) && showTutorial) {
            // If provider is already acknowledged, skip to topup step
            if (acknowledged) {
              setTutorialStep('topup');
            }
          }
        } catch (err: unknown) {
          console.error("Error fetching provider acknowledgment:", err);
          setProviderAcknowledged(false);
        }
      }
    };

    fetchProviderAcknowledgment();
  }, [broker, selectedProvider, showTutorial]);

  // Fetch provider balance when provider is selected
  useEffect(() => {
    const fetchProviderBalance = async () => {
      if (broker && selectedProvider) {
        try {
          const account = await broker.inference.getAccount(selectedProvider.address);
          if (account && account.balance) {
            const balanceInA0gi = neuronToA0gi(account.balance);
            console.log("Provider balance:", balanceInA0gi);
            setProviderBalance(balanceInA0gi);
            setProviderBalanceNeuron(account.balance);
          } else {
            setProviderBalance(0);
            setProviderBalanceNeuron(BigInt(0));
          }
        } catch (err: unknown) {
          console.error("Error fetching provider balance:", err);
          setProviderBalance(null);
          setProviderBalanceNeuron(null);
        }
      }
    };

    fetchProviderBalance();
  }, [broker, selectedProvider]);

  // Initialize tutorial when provider changes
  useEffect(() => {
    if (selectedProvider) {
      const tutorialKey = `tutorial_seen_${selectedProvider.address}`;
      const hasSeenTutorial = localStorage.getItem(tutorialKey);
      
      console.log('Tutorial check:', {
        provider: selectedProvider.address,
        hasSeenTutorial,
        providerAcknowledged
      });
      
      if (!hasSeenTutorial) {
        // Small delay to ensure UI is ready
        const timer = setTimeout(() => {
          console.log('Starting tutorial');
          setShowTutorial(true);
          // If provider is already acknowledged, start with topup step
          if (providerAcknowledged === true) {
            console.log('Provider already acknowledged, showing topup step');
            setTutorialStep('topup');
          } else {
            console.log('Provider not acknowledged, showing verify step');
            setTutorialStep('verify');
          }
        }, 800);
        
        return () => clearTimeout(timer);
      }
    }
  }, [selectedProvider, providerAcknowledged]);

  // Function to scroll to a specific message
  const scrollToMessage = useCallback((targetContent: string) => {
    const messageElements = document.querySelectorAll('[data-message-content]');
    for (const element of messageElements) {
      if (element.getAttribute('data-message-content')?.includes(targetContent.substring(0, 50))) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the message temporarily
        element.classList.add('bg-yellow-100');
        setTimeout(() => {
          element.classList.remove('bg-yellow-100');
        }, 2000);
        break;
      }
    }
  }, []);

  // Function to handle history clicks with optional message targeting
  const handleHistoryClick = useCallback(async (sessionId: string, targetMessageContent?: string) => {
    console.log('handleHistoryClick called:', { sessionId, targetMessageContent });
    
    // Clear any previous message targeting when clicking regular history
    if (!targetMessageContent) {
      lastTargetMessageRef.current = null;
    }
    
    try {
      // Reset loading/streaming states for history navigation
      setIsLoading(false);
      setIsStreaming(false);
      
      // Set flag to prevent auto-scrolling to bottom
      isLoadingHistoryRef.current = true;
      
      console.log('Loading session:', sessionId);
      
      // Load session and get messages directly from database
      await chatHistory.loadSession(sessionId);
      
      // Import dbManager directly to get fresh data
      const { dbManager } = await import('../../../../lib/database');
      const sessionMessages = await dbManager.getMessages(sessionId);
      
      console.log('Session loaded successfully:', { 
        sessionId, 
        messagesCount: sessionMessages.length,
        firstMessage: sessionMessages[0]?.content?.substring(0, 50)
      });
      
      // Convert database messages to UI format
      const historyMessages: Message[] = sessionMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        chatId: msg.session_id, // Use session_id for chatId
        isVerified: msg.is_verified,
        isVerifying: msg.is_verifying,
      }));

      // Add system message if needed
      const hasSystemMessage = historyMessages.some(msg => msg.role === 'system');
      if (!hasSystemMessage && historyMessages.length > 0) {
        historyMessages.unshift({
          role: "system",
          content: "You are a helpful assistant that provides accurate information.",
          timestamp: Date.now(),
        });
      }

      setMessages(historyMessages);
      
      // If we have a target message, scroll to it after a delay
      if (targetMessageContent) {
        lastTargetMessageRef.current = targetMessageContent;
        setTimeout(() => {
          scrollToMessage(targetMessageContent);
        }, 300);
      } else {
        // Clear highlighting from previous targeted messages
        setTimeout(() => {
          const highlightedElements = document.querySelectorAll('.bg-yellow-100');
          highlightedElements.forEach(el => el.classList.remove('bg-yellow-100'));
        }, 100);
      }
      
      // Reset flags
      setTimeout(() => {
        isLoadingHistoryRef.current = false;
        isUserScrollingRef.current = false;
      }, 200);
      
    } catch (err) {
      console.error('Failed to load session:', err);
      isLoadingHistoryRef.current = false;
    }
  }, [chatHistory, scrollToMessage]);

  // Simple debounced search using useEffect and setTimeout
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const results = await chatHistory.searchMessages(searchQuery);
        const searchMessages: (Message & { sessionId: string })[] = results.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
          chatId: msg.chat_id,
          isVerified: msg.is_verified,
          isVerifying: msg.is_verifying,
          sessionId: msg.session_id || '', // Add session_id from database result
        }));
        setSearchResults(searchMessages);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // Only depend on searchQuery

  // Track sessions for reference
  const lastLoadedSessionRef = useRef<string | null>(null);

  // Auto scroll to bottom when messages change (but not for verification updates or history navigation)
  const previousMessagesRef = useRef<Message[]>([]);
  const isUserScrollingRef = useRef(false);
  const isLoadingHistoryRef = useRef(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastTargetMessageRef = useRef<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);
  const lastClickedSessionRef = useRef<string | null>(null);
  
  // Initialize click tracking on component mount
  useEffect(() => {
    lastClickTimeRef.current = 0;
    lastClickedSessionRef.current = null;
    lastTargetMessageRef.current = null;
  }, []);
  
  // Track user scroll behavior to stop auto-scroll when user manually scrolls up
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (!isNearBottom && isStreaming) {
        // User scrolled up during streaming, stop auto-scroll
        isUserScrollingRef.current = true;
      } else if (isNearBottom) {
        // User is back near bottom, resume auto-scroll
        isUserScrollingRef.current = false;
      }
    };

    messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [isStreaming]);
  
  useEffect(() => {
    const scrollToBottom = () => {
      if (isUserScrollingRef.current) return; // Don't scroll if user is manually scrolling
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Check if this is just a verification status update
    const isVerificationUpdate = () => {
      const prev = previousMessagesRef.current;
      if (prev.length !== messages.length) return false;
      
      // Check if only verification fields changed
      for (let i = 0; i < messages.length; i++) {
        const current = messages[i];
        const previous = prev[i];
        
        // If content, role, or timestamp changed, it's not just verification
        if (current.content !== previous.content || 
            current.role !== previous.role ||
            current.timestamp !== previous.timestamp ||
            current.chatId !== previous.chatId) {
          return false;
        }
      }
      return true;
    };

    // Don't auto-scroll if:
    // 1. It's just a verification update
    // 2. It's a history navigation (loading history)
    // 3. User is manually scrolling during streaming
    if (!isVerificationUpdate() && !isLoadingHistoryRef.current && !isUserScrollingRef.current) {
      const timeoutId = setTimeout(scrollToBottom, 100);
      // Update the ref after scrolling decision
      previousMessagesRef.current = [...messages];
      return () => clearTimeout(timeoutId);
    }
    
    // Update the ref even if we don't scroll
    previousMessagesRef.current = [...messages];
  }, [messages, isLoading, isStreaming]);

  const sendMessage = async () => {
    console.log("sendMessage called:", {
      inputMessage: inputMessage.trim(),
      selectedProvider: !!selectedProvider,
      broker: !!broker,
      serviceMetadata: !!serviceMetadata,
      selectedProviderAddress: selectedProvider?.address,
    });

    if (!inputMessage.trim() || !selectedProvider || !broker) {
      console.log("Early return due to missing requirements");
      return;
    }

    // For now, let's add a simple demo response to test if the function works
    console.log("Adding demo response...");
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);
    
    // Save user message to database and get session ID (await to ensure session is created)
    let currentSessionForAssistant: string | null = null;
    try {
      currentSessionForAssistant = await chatHistory.addMessage({
        role: userMessage.role,
        content: userMessage.content,
        chat_id: undefined,
        is_verified: null,
        is_verifying: false,
      });
    } catch (err) {
      console.error('Failed to save user message:', err);
    }
    setInputMessage("");
    setIsLoading(true);
    setIsStreaming(true);
    setErrorWithTimeout(null);
    
    // Reset textarea height
    setTimeout(() => {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.style.height = '40px';
      }
    }, 0);
    
    let firstContentReceived = false;

    // Demo response commented out - using real API
    // setTimeout(() => {
    //   const assistantMessage: Message = {
    //     role: "assistant",
    //     content: "Demo response - real API integration is being debugged.",
    //     timestamp: Date.now(),
    //   };
    //   setMessages((prev) => [...prev, assistantMessage]);
    //   setIsLoading(false);
    // }, 1000);

    // Continue with real API call
    try {
      // If serviceMetadata is not available, try to fetch it first
      let currentMetadata = serviceMetadata;
      if (!currentMetadata) {
        console.log("Fetching service metadata...");
        currentMetadata = await broker.inference.getServiceMetadata(
          selectedProvider.address
        );
        setServiceMetadata(currentMetadata);
        if (!currentMetadata) {
          throw new Error("Failed to get service metadata");
        }
      }

      // Step 5.2: Get the request headers (may trigger auto-funding)
      console.log("Getting request headers...");
      
      // Funding operations removed
      
      // Prepare the actual messages array that will be sent to the API
      const messagesToSend = [
        ...messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
        { role: userMessage.role, content: userMessage.content },
      ];
      
      let headers;
      try {
        headers = await broker.inference.getRequestHeaders(
          selectedProvider.address,
          JSON.stringify(messagesToSend)
        );
        
        
        console.log("Request headers obtained successfully");
      } catch (headerError) {
        throw headerError;
      }

      // Step 6: Send a request to the service use stream
      console.log("Sending request to:", currentMetadata.endpoint);
      const { endpoint, model } = currentMetadata;

      const response = await fetch(`${endpoint}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          messages: [
            ...messages
              .filter((m) => m.role !== "system")
              .map((m) => ({ role: m.role, content: m.content })),
            { role: userMessage.role, content: userMessage.content },
          ],
          model: model,
          stream: true,
        }),
      });

      if (!response.ok) {
        // Try to get detailed error message from response body
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorBody = await response.text();
          if (errorBody) {
            // Try to parse as JSON first
            try {
              const errorJson = JSON.parse(errorBody);
              errorMessage = JSON.stringify(errorJson, null, 2);
            } catch {
              // If not JSON, use the raw text
              errorMessage = errorBody;
            }
          }
        } catch {
          // If can't read body, keep original message
        }
        throw new Error(errorMessage);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      // Initialize streaming response
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: Date.now(),
        isVerified: null,
        isVerifying: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let buffer = "";
      let chatId = "";
      let completeContent = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (!chatId && parsed.id) {
                  chatId = parsed.id;
                }

                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  // Hide loading indicator on first content received
                  if (!firstContentReceived) {
                    setIsLoading(false);
                    firstContentReceived = true;
                  }
                  
                  completeContent += content;
                  setMessages((prev) =>
                    prev.map((msg, index) =>
                      index === prev.length - 1
                        ? {
                            ...msg,
                            content: completeContent,
                            chatId,
                            isVerified: msg.isVerified,
                            isVerifying: msg.isVerifying,
                          }
                        : msg
                    )
                  );

                  // Trigger auto-scroll during streaming only if user isn't manually scrolling
                  setTimeout(() => {
                    if (!isUserScrollingRef.current) {
                      messagesEndRef.current?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }
                  }, 50);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Update final message with complete content and chatId
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? {
                ...msg,
                content: completeContent,
                chatId,
                isVerified: msg.isVerified || null,
                isVerifying: msg.isVerifying || false,
              }
            : msg
        )
      );

      // Save assistant message to database in the background using the same session
      if (completeContent.trim() && currentSessionForAssistant) {
        // Directly save to database using the session ID we got from user message
        try {
          const { dbManager } = await import('../../../../lib/database');
          await dbManager.saveMessage(currentSessionForAssistant, {
            role: "assistant",
            content: completeContent,
            timestamp: Date.now(),
            chat_id: chatId,
            is_verified: null,
            is_verifying: false,
            provider_address: selectedProvider?.address || '',
          });
        } catch (err) {
          console.error('Failed to save assistant message:', err);
        }
      }

      // Ensure loading is stopped even if no content was received
      if (!firstContentReceived) {
        setIsLoading(false);
      }
      // Always stop streaming when done
      setIsStreaming(false);
    } catch (err: unknown) {
      console.error("Error with real API:", err);
      let errorMessage = "Failed to send message. Please try again.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        try {
          errorMessage = JSON.stringify(err, null, 2);
        } catch {
          errorMessage = String(err);
        }
      }
      
      setErrorWithTimeout(`Chat error: ${errorMessage}`);


      // Remove the loading message if it exists
      setMessages((prev) =>
        prev.filter((msg) => msg.role !== "assistant" || msg.content !== "")
      );
      
      // Ensure loading is stopped in case of error
      if (!firstContentReceived) {
        setIsLoading(false);
      }
      // Always stop streaming in case of error
      setIsStreaming(false);
    }
  };

  // Step 7: Process the response (verification function)
  const verifyResponse = async (message: Message, messageIndex: number) => {
    console.log("🔍 verifyResponse called:", { message, messageIndex });

    if (!broker || !selectedProvider || !message.chatId) {
      console.log("❌ Verification cancelled - missing requirements:", {
        broker: !!broker,
        selectedProvider: !!selectedProvider,
        chatId: !!message.chatId,
      });
      return;
    }

    // Set verifying state and reset previous verification result
    console.log("⏳ Setting verifying state to TRUE...");
    setMessages((prev) => {
      const updated = prev.map((msg, index) =>
        index === messageIndex
          ? { ...msg, isVerifying: true, isVerified: null }
          : msg
      );
      console.log("📝 Updated messages:", updated[messageIndex]);
      return updated;
    });

    // Force a re-render to ensure state change is visible
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      console.log("Calling broker.inference.processResponse...");

      // Add minimum loading time to ensure user sees the loading effect
      const [isValid] = await Promise.all([
        broker.inference.processResponse(
          selectedProvider.address,
          message.content,
          message.chatId
        ),
        new Promise((resolve) => setTimeout(resolve, 1000)), // Minimum 1 second loading
      ]);

      console.log("Verification result:", isValid);

      // Update verification result with visual feedback
      console.log("✅ Setting verification result:", isValid);
      setMessages((prev) => {
        const updated = prev.map((msg, index) =>
          index === messageIndex
            ? { ...msg, isVerified: isValid, isVerifying: false }
            : msg
        );
        console.log("📝 Final updated message:", updated[messageIndex]);
        return updated;
      });

      // Show visual feedback notification
      if (isValid) {
        console.log("✅ Response verified successfully!");
      } else {
        console.log("❌ Response verification failed!");
      }
    } catch (err: unknown) {
      console.error("❌ Error verifying response:", err);
      // Mark as verification failed with minimum loading time
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("❌ Setting verification failed state");
      setMessages((prev) => {
        const updated = prev.map((msg, index) =>
          index === messageIndex
            ? { ...msg, isVerified: false, isVerifying: false }
            : msg
        );
        console.log("📝 Error updated message:", updated[messageIndex]);
        return updated;
      });
    }
  };

  // Remove clearChat function since we removed the Clear Chat button

  const startNewChat = async () => {
    // Create new session (this won't trigger sync due to hasManuallyLoadedSession flag)
    await chatHistory.createNewSession();
    
    // Reset UI to clean state
    setMessages([
      {
        role: "system",
        content:
          "You are a helpful assistant that provides accurate information.",
        timestamp: Date.now(),
      },
    ]);
    setErrorWithTimeout(null);
    
    // Reset click tracking to ensure first history click works
    lastClickTimeRef.current = 0;
    lastClickedSessionRef.current = null;
    lastTargetMessageRef.current = null;
    
    // Update tracking to prevent sync on this new session
    lastLoadedSessionRef.current = chatHistory.currentSessionId;
  };

  const verifyProvider = async () => {
    if (!broker || !selectedProvider) {
      console.log("Cannot verify - missing broker or provider");
      return;
    }

    setIsVerifyingProvider(true);
    setErrorWithTimeout(null);

    try {
      console.log("Acknowledging provider:", selectedProvider.address);
      await broker.inference.acknowledgeProviderSigner(
        selectedProvider.address
      );

      // Refresh the acknowledgment status
      const acknowledged = await broker.inference.userAcknowledged(
        selectedProvider.address
      );
      setProviderAcknowledged(acknowledged);

      console.log("Provider verification completed:", acknowledged);
      
      // Progress tutorial to top-up step if tutorial is active
      if (showTutorial && tutorialStep === 'verify' && acknowledged) {
        setTutorialStep('topup');
      }
    } catch (err: unknown) {
      console.error("Error verifying provider:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to verify provider. Please try again.";
      setErrorWithTimeout(`Verification error: ${errorMessage}`);
    } finally {
      setIsVerifyingProvider(false);
    }
  };

  // Note: handleDeposit is now handled globally in LayoutContent

  const handleTopUp = async () => {
    if (!broker || !selectedProvider || !topUpAmount || parseFloat(topUpAmount) <= 0) {
      console.log("Invalid top up amount or missing requirements");
      return;
    }

    setIsTopping(true);
    setErrorWithTimeout(null);

    try {
      console.log("Topping up:", topUpAmount, "A0GI to provider:", selectedProvider.address);
      const amountInA0gi = parseFloat(topUpAmount);
      const amountInNeuron = a0giToNeuron(amountInA0gi);
      
      console.log("Amount in neuron:", amountInNeuron.toString());
      
      // Call the transfer function with neuron amount
      await broker.ledger.transferFund(
        selectedProvider.address,
        'inference',
        amountInNeuron
      );

      console.log("Top up successful");
      setShowTopUpModal(false);
      setTopUpAmount("");

      // Refresh provider balance
      const account = await broker.inference.getAccount(selectedProvider.address);
      if (account && account.balance) {
        const balanceInA0gi = neuronToA0gi(account.balance);
        setProviderBalance(balanceInA0gi);
        setProviderBalanceNeuron(account.balance);
      }
      
      // Complete tutorial if active
      if (showTutorial && tutorialStep === 'topup') {
        setShowTutorial(false);
        setTutorialStep(null);
        // Mark tutorial as seen for this provider
        localStorage.setItem(`tutorial_seen_${selectedProvider.address}`, 'true');
      }
    } catch (err: unknown) {
      console.error("Error topping up:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to top up. Please try again.";
      setErrorWithTimeout(`Top up error: ${errorMessage}`);
    } finally {
      setIsTopping(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center border border-blue-200">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wallet Not Connected
          </h3>
          <p className="text-gray-600">
            Please connect your wallet to access AI inference features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3">
        <div className="flex items-center space-x-3 mb-2">
          <button
            onClick={() => router.push('/inference')}
            className="text-gray-600 hover:text-gray-900 transition-colors p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Inference</h1>
            <p className="text-xs text-gray-500">
              Chat with AI models from decentralized providers
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1 break-words whitespace-pre-wrap">
                {(() => {
                  try {
                    // Try to parse as JSON if it looks like JSON
                    if (error.trim().startsWith('{') && error.trim().endsWith('}')) {
                      const parsed = JSON.parse(error);
                      return JSON.stringify(parsed, null, 2);
                    }
                    return error;
                  } catch {
                    return error;
                  }
                })()}
              </p>
            </div>
            <button
              onClick={() => setErrorWithTimeout(null)}
              className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
              title="Close error message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showFundingAlert && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Provider Funding</h3>
              <p className="text-sm text-blue-700 mt-1">{fundingAlertMessage}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex bg-white rounded-xl border border-gray-200" style={{ height: 'calc(100vh - 175px)' }}>
        {/* History Sidebar */}
        {showHistorySidebar && (
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Chat History</h3>
                {(isLoading || isStreaming) && (
                  <div className="flex items-center text-xs text-orange-600">
                    <div className="animate-spin rounded-full h-3 w-3 border border-orange-400 border-t-transparent mr-1"></div>
                    <span>AI responding...</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isLoading || isStreaming}
                  className={`w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isLoading || isStreaming ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                  }`}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {/* Search Results */}
              {searchQuery ? (
                <div className="p-2">
                  {isSearching ? (
                    <div className="p-4 text-center text-gray-500 text-sm flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                      Searching...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      No messages found for "{searchQuery}"
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs text-gray-500 font-medium px-2 py-1">
                        {searchResults.length} result(s) found
                      </div>
                      {searchResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 bg-white border border-gray-200 rounded-lg transition-colors ${
                            isLoading || isStreaming 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:bg-blue-50 hover:border-blue-200 cursor-pointer'
                          }`}
                          onClick={async () => {
                            if (result.sessionId && !isLoading && !isStreaming) {
                              try {
                                // Clear search first
                                setSearchQuery('');
                                setSearchResults([]);
                                
                                // Load the session and scroll to the specific message
                                await handleHistoryClick(result.sessionId, result.content);
                              } catch (err) {
                                console.error('Failed to load session from search result:', err);
                              }
                            }
                          }}
                        >
                          <div className="text-xs text-gray-500 mb-1 flex items-center justify-between">
                            <span>
                              {result.role === 'user' ? 'You' : 'Assistant'} • {' '}
                              {result.timestamp ? new Date(result.timestamp).toLocaleDateString() : 'Unknown date'}
                            </span>
                            <span className="text-blue-500 hover:text-blue-600 font-medium">
                              View →
                            </span>
                          </div>
                          <div className="text-sm text-gray-900 overflow-hidden" style={{ 
                            display: '-webkit-box', 
                            WebkitLineClamp: 2, 
                            WebkitBoxOrient: 'vertical' 
                          }}>
                            {result.content.length > 100 
                              ? result.content.substring(0, 100) + '...' 
                              : result.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Session List */
                chatHistory.sessions.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No chat history yet
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {chatHistory.sessions.map((session) => (
                    <div
                      key={session.session_id}
                      className={`relative group rounded-lg text-sm transition-colors ${
                        chatHistory.currentSessionId === session.session_id
                          ? 'bg-blue-50 border border-blue-200'
                          : isLoading || isStreaming
                          ? 'bg-gray-100 border border-transparent'
                          : 'hover:bg-gray-50 border border-transparent'
                      }`}
                    >
                      <button
                        onClick={() => handleHistoryClick(session.session_id)}
                        disabled={isLoading || isStreaming}
                        className={`w-full text-left p-3 pr-10 rounded-lg transition-colors ${
                          isLoading || isStreaming
                            ? 'text-gray-400 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900 truncate">
                          {session.title || 'Untitled Chat'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(session.updated_at).toLocaleDateString()}
                        </div>
                      </button>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoading && !isStreaming) {
                            chatHistory.deleteSession(session.session_id);
                          }
                        }}
                        disabled={isLoading || isStreaming}
                        className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-colors opacity-0 group-hover:opacity-100 ${
                          isLoading || isStreaming
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Delete chat history"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
        {/* Chat Header with Provider Selection */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-center flex-wrap gap-2 sm:flex-nowrap">
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Provider Selection Dropdown */}
              <div className="relative min-w-[200px] sm:min-w-[400px] lg:min-w-[500px] provider-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border border-gray-300 rounded-md pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isInitializing || providers.length === 0}
                >
                  {isInitializing ? (
                    <span className="text-gray-500">Loading providers...</span>
                  ) : providers.length === 0 ? (
                    <span className="text-gray-500">
                      No providers available
                    </span>
                  ) : selectedProvider ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">
                          {selectedProvider.name}
                        </span>
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-600 text-xs">
                          {selectedProvider.address.slice(0, 8)}...
                          {selectedProvider.address.slice(-6)}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedProvider.verifiability}
                        </span>
                        {OFFICIAL_PROVIDERS.some(
                          (op) => op.address === selectedProvider.address
                        ) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            0G
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500">Select a provider</span>
                  )}
                </button>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {providers.map((provider) => {
                      const isOfficial = OFFICIAL_PROVIDERS.some(
                        (op) => op.address === provider.address
                      );
                      return (
                        <div
                          key={provider.address}
                          onClick={() => {
                            setSelectedProvider(provider);
                            setIsDropdownOpen(false);
                          }}
                          className="px-3 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">
                                {provider.name}
                              </span>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-600 text-xs">
                                {provider.address.slice(0, 8)}...
                                {provider.address.slice(-6)}
                              </span>
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {provider.verifiability}
                              </span>
                              {isOfficial && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  0G
                                </span>
                              )}
                            </div>
                            {(provider.inputPrice !== undefined ||
                              provider.outputPrice !== undefined) && (
                              <div className="text-xs text-gray-500 pl-0">
                                {provider.inputPrice !== undefined && (
                                  <span>
                                    Input: {provider.inputPrice.toFixed(2)}{" "}
                                    A0GI
                                  </span>
                                )}
                                {provider.inputPrice !== undefined &&
                                  provider.outputPrice !== undefined && (
                                    <span className="mx-1">·</span>
                                  )}
                                {provider.outputPrice !== undefined && (
                                  <span>
                                    Output: {provider.outputPrice.toFixed(2)}{" "}
                                    A0GI
                                  </span>
                                )}
                                <span className="ml-1">/ million tokens</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Provider Info - Copy Address Only */}
              {selectedProvider && (
                <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap sm:flex-nowrap gap-1">
                  {providerAcknowledged !== null && (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        providerAcknowledged
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        {providerAcknowledged ? (
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                      {providerAcknowledged ? "Verified" : "Not Verified"}
                    </span>
                  )}
                  {/* Price Information */}
                  {(selectedProvider.inputPrice !== undefined ||
                    selectedProvider.outputPrice !== undefined) && (
                    <div className="relative group/price">
                      <div className="inline-flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="flex items-center">
                          {selectedProvider.inputPrice !== undefined && (
                            <span>
                              {selectedProvider.inputPrice.toFixed(2)}
                            </span>
                          )}
                          {selectedProvider.inputPrice !== undefined &&
                            selectedProvider.outputPrice !== undefined && (
                              <span className="mx-1">/</span>
                            )}
                          {selectedProvider.outputPrice !== undefined && (
                            <span>
                              {selectedProvider.outputPrice.toFixed(2)}
                            </span>
                          )}
                          <span className="ml-1 text-gray-500 hidden sm:inline">
                            A0GI/M
                          </span>
                        </span>
                      </div>
                      {/* Price Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/price:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                        <div className="font-semibold mb-1">Price per Million Tokens</div>
                        {selectedProvider.inputPrice !== undefined && (
                          <div>Input: {selectedProvider.inputPrice.toFixed(2)} A0GI</div>
                        )}
                        {selectedProvider.outputPrice !== undefined && (
                          <div>Output: {selectedProvider.outputPrice.toFixed(2)} A0GI</div>
                        )}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Provider Balance */}
                  <div className="inline-flex items-center space-x-1">
                    <div className="relative group/balance">
                      <div 
                        className="inline-flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>{(providerBalance ?? 0).toFixed(2)} A0GI</span>
                      </div>
                      
                      {/* Full Balance Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/balance:opacity-100 transition-opacity duration-200 pointer-events-none z-20 whitespace-nowrap">
                        <div className="font-semibold mb-1">Balance: {providerBalance?.toFixed(18) ?? '0'} A0GI</div>
                        <div className="text-gray-400 text-[10px] mt-1">Sub-account for this provider</div>
                        <div className="text-gray-400 text-[10px]">Auto-transfers from main account</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Low Balance Warning */}
                    {providerBalanceNeuron !== null &&
                     selectedProvider.inputPriceNeuron !== undefined && 
                     selectedProvider.outputPriceNeuron !== undefined && 
                     providerBalanceNeuron <= BigInt(50000) * (selectedProvider.inputPriceNeuron + selectedProvider.outputPriceNeuron) && (
                      <div className="relative group/warning">
                        <svg 
                          className="w-3.5 h-3.5 text-yellow-600" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        
                        {/* Warning Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover/warning:opacity-100 transition-opacity duration-200 pointer-events-none z-30 whitespace-nowrap">
                          Balance is low. Provider may refuse to reply.
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                            <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Top Up Button */}
                  {selectedProvider && (
                    <div className="relative group">
                      <button
                        onClick={() => {
                          setShowTopUpModal(true);
                          // Close tutorial when top-up button is clicked
                          if (showTutorial && tutorialStep === 'topup') {
                            setShowTutorial(false);
                            setTutorialStep(null);
                            // Mark tutorial as completed for this provider
                            if (selectedProvider) {
                              localStorage.setItem(`tutorial_seen_${selectedProvider.address}`, 'true');
                            }
                          }
                        }}
                        className={`p-1.5 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors ${
                          showTutorial && tutorialStep === 'topup'
                            ? 'ring-4 ring-blue-400 ring-opacity-75 animate-pulse relative z-50'
                            : ''
                        }`}
                        title="Top up"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                      {/* Tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                        Top up provider account
                        <div className="absolute top-full right-2 -mt-1">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="relative group">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(selectedProvider.address)
                      }
                      className="p-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      title="Copy address"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      Copy address
                      <div className="absolute top-full right-2 -mt-1">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (!isLoading && !isStreaming) {
                    setShowHistorySidebar(!showHistorySidebar);
                  }
                }}
                disabled={isLoading || isStreaming}
                className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1 ${
                  isLoading || isStreaming
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Toggle chat history"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>History</span>
              </button>
              <button
                onClick={() => {
                  if (!isLoading && !isStreaming) {
                    startNewChat();
                  }
                }}
                disabled={isLoading || isStreaming}
                className={`px-3 py-1 rounded-md text-sm transition-colors flex items-center space-x-1 ${
                  isLoading || isStreaming
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Start new chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .map((message, originalIndex) => ({ message, originalIndex }))
            .filter(({ message }) => message.role !== "system")
            .map(({ message, originalIndex }, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div className="flex items-start space-x-2 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2 break-words transition-colors ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                    style={{ maxWidth: '100%', overflowWrap: 'break-word' }}
                    data-message-content={message.content.substring(0, 100)}
                  >
                    <div className="text-sm">
                      {message.role === "assistant" ? (
                        <div className="markdown-content">
                          <ReactMarkdown
                            components={{
                              h1: ({ children }) => (
                                <h1 className="text-xl font-bold mb-3 mt-4 text-gray-900">
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold mb-2 mt-3 text-gray-900">
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-semibold mb-2 mt-3 text-gray-900">
                                  {children}
                                </h3>
                              ),
                              p: ({ children }) => (
                                <p className="mb-2 text-gray-800 leading-relaxed">
                                  {children}
                                </p>
                              ),
                              strong: ({ children }) => (
                                <strong className="font-semibold text-gray-900">
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className="italic text-gray-800">
                                  {children}
                                </em>
                              ),
                              code: ({ children }) => (
                                <code className="bg-blue-50 text-blue-600 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              pre: ({ children }) => (
                                <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 my-3 overflow-x-auto text-sm">
                                  {children}
                                </pre>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-2 text-gray-800">
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-2 text-gray-800">
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1 text-gray-800">
                                  {children}
                                </li>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500 pl-4 my-3 text-gray-700 italic">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ href, children }) => (
                                <a
                                  href={href}
                                  className="text-blue-600 hover:underline"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap break-words" style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', maxWidth: '100%' }}>
                          {message.content}
                        </div>
                      )}
                    </div>
                    {message.timestamp && (
                      <div
                        className={`flex items-center justify-between text-xs mt-1 ${
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-gray-500"
                        }`}
                      >
                        <span>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>

                        {/* Verification controls - only show for assistant messages that are complete */}
                        {message.role === "assistant" &&
                          message.chatId &&
                          !isLoading &&
                          !isStreaming &&
                          (() => {
                            const isExpired =
                              message.timestamp &&
                              Date.now() - message.timestamp > 20 * 60 * 1000; // 20 minutes
                            return (
                              <div className="flex items-center">
                                {/* Verification button for initial verification */}
                                {!message.isVerifying &&
                                  (message.isVerified === null ||
                                    message.isVerified === undefined) && (
                                    <button
                                      onClick={() => {
                                        if (!isExpired) {
                                          console.log(
                                            "🖱️ Verify button clicked!",
                                            { message, originalIndex }
                                          );
                                          verifyResponse(
                                            message,
                                            originalIndex
                                          );
                                        }
                                      }}
                                      className={`px-1.5 py-0.5 rounded-full border transition-colors text-xs ${
                                        isExpired
                                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                          : "bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200"
                                      }`}
                                      title={
                                        isExpired
                                          ? "Verification information is only retained for 20 minutes"
                                          : "Verify response authenticity with TEE"
                                      }
                                      disabled={!!isExpired}
                                    >
                                      Verify
                                    </button>
                                  )}

                                {/* Verification loading indicator */}
                                {message.isVerifying && (
                                  <div className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 rounded-full border border-blue-200">
                                    <div className="animate-spin rounded-full h-2.5 w-2.5 border border-blue-400 border-t-transparent mr-1"></div>
                                    <span className="text-xs text-blue-600">
                                      Verifying...
                                    </span>
                                  </div>
                                )}

                                {/* Verification status display */}
                                {!message.isVerifying &&
                                  message.isVerified !== null &&
                                  message.isVerified !== undefined && (
                                    <button
                                      onClick={() => {
                                        if (!isExpired) {
                                          verifyResponse(
                                            message,
                                            originalIndex
                                          );
                                        }
                                      }}
                                      className={`px-1.5 py-0.5 rounded-full border transition-all duration-300 group relative text-xs ${
                                        isExpired
                                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                                          : message.isVerified
                                          ? "bg-green-50 hover:bg-blue-100 text-green-600 hover:text-blue-600 border-green-200 hover:border-blue-200"
                                          : "bg-red-50 hover:bg-blue-100 text-red-600 hover:text-blue-600 border-red-200 hover:border-blue-200"
                                      }`}
                                      title={
                                        isExpired
                                          ? "Verification information is only retained for 20 minutes"
                                          : message.isVerified
                                          ? "TEE Verified - Click to verify again"
                                          : "TEE Verification Failed - Click to retry"
                                      }
                                      disabled={!!isExpired}
                                    >
                                      {/* Default text - shown when not hovering */}
                                      <span
                                        className={
                                          isExpired ? "" : "group-hover:hidden"
                                        }
                                      >
                                        {isExpired
                                          ? "Expired"
                                          : message.isVerified
                                          ? "Valid"
                                          : "Invalid"}
                                      </span>

                                      {/* Hover text - shown when hovering and not expired */}
                                      {!isExpired && (
                                        <span className="hidden group-hover:inline">
                                          Verify
                                        </span>
                                      )}
                                    </button>
                                  )}
                              </div>
                            );
                          })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                  <span className="text-sm text-gray-600">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Invisible element for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-3 items-end">
            <textarea
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                // Auto-resize textarea
                const textarea = e.target as HTMLTextAreaElement;
                textarea.style.height = 'auto';
                textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (providerAcknowledged === false) {
                    verifyProvider();
                  } else if (inputMessage.trim() && !isLoading && !isStreaming) {
                    sendMessage();
                  }
                }
              }}
              placeholder={isLoading || isStreaming ? "AI is responding..." : "Type your message... (Shift+Enter for new line)"}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              rows={1}
              disabled={isLoading || isStreaming}
            />
            <button
              onClick={() => {
                if (providerAcknowledged === false) {
                  console.log("Verifying provider...");
                  // Close tutorial when verify button is clicked
                  if (showTutorial && tutorialStep === 'verify') {
                    setShowTutorial(false);
                    setTutorialStep(null);
                  }
                  verifyProvider();
                } else {
                  console.log("Button clicked!");
                  sendMessage();
                }
              }}
              disabled={
                providerAcknowledged === false
                  ? isVerifyingProvider
                  : !inputMessage.trim() || isLoading || isStreaming
              }
              className={`${
                providerAcknowledged === false
                  ? "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400"
                  : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
              } text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
                showTutorial && tutorialStep === 'verify' && providerAcknowledged === false
                  ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse relative z-50'
                  : ''
              }`}
              title={
                providerAcknowledged === false
                  ? "Verify provider to enable messaging"
                  : `Button status: ${
                      !inputMessage.trim() || isLoading || isStreaming ? "disabled" : "enabled"
                    }`
              }
            >
              {isLoading || isStreaming || isVerifyingProvider ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {providerAcknowledged === false ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  )}
                </svg>
              )}
              <span>
                {providerAcknowledged === false ? "Verify Provider" : "Send"}
              </span>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Note: Deposit modal is now handled globally in LayoutContent */}

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur effect */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
            }}
            onClick={() => {
              if (!isTopping) {
                setShowTopUpModal(false);
                setTopUpAmount("");
              }
            }}
          />

          {/* Modal content */}
          <div className="relative z-10 mx-auto p-8 w-96 bg-white rounded-xl shadow-2xl border border-gray-100">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Top Up Provider Account
                </h3>
                <button
                  onClick={() => {
                    if (!isTopping) {
                      setShowTopUpModal(false);
                      setTopUpAmount("");
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={isTopping}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Total Balance Display */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Main Account Balance</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {ledgerInfo ? (
                      <span>{ledgerInfo.totalBalance} A0GI</span>
                    ) : (
                      <span className="text-gray-400">Loading...</span>
                    )}
                  </div>
                </div>

                {/* Provider Balance Display */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">Provider Account Balance</div>
                  <div className="text-lg font-semibold text-blue-900">
                    <span>{(providerBalance ?? 0).toFixed(6)} A0GI</span>
                  </div>
                </div>

                {/* Transfer Amount Input */}
                <div>
                  <label
                    htmlFor="top-up-amount"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Transfer Amount (A0GI)
                  </label>
                  <input
                    type="number"
                    id="top-up-amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                    min="0"
                    step="0.000001"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                    disabled={isTopping}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Transfer funds from your main account to the provider sub-account
                  </p>
                </div>

                <button
                  onClick={handleTopUp}
                  disabled={
                    isTopping ||
                    !topUpAmount ||
                    parseFloat(topUpAmount) <= 0 ||
                    !ledgerInfo ||
                    parseFloat(topUpAmount) > parseFloat(ledgerInfo.totalBalance)
                  }
                  className="w-full px-4 py-3 bg-blue-600 text-white text-base font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isTopping ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </span>
                  ) : (
                    "Transfer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Overlay */}
      {showTutorial && tutorialStep && (
        <>
          {/* Dark overlay */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setShowTutorial(false);
              setTutorialStep(null);
            }}
          />
          
          {/* Floating tutorial message */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm mx-4">
              {tutorialStep === 'verify' && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Verify Provider
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Verify that the provider is running in a verifiable TEE environment
                  </p>
                </>
              )}
              {tutorialStep === 'topup' && (
                <>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Top Up Provider
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Fund the provider with a certain amount (excess funds can be refunded)
                  </p>
                </>
              )}
              <button
                onClick={() => {
                  setShowTutorial(false);
                  setTutorialStep(null);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
