"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAccount } from "wagmi";
import { Sidebar } from "./Sidebar";
import { use0GBroker } from "../hooks/use0GBroker";
import { NavigationProvider, useNavigation } from "./OptimizedNavigation";
import SimpleLoader from "./SimpleLoader";

interface LayoutContentProps {
  children: React.ReactNode;
}

// 内部组件来处理主内容区域的加载状态
const MainContentArea: React.FC<{ children: React.ReactNode; isHomePage: boolean }> = ({ 
  children, 
  isHomePage 
}) => {
  const { isNavigating, targetRoute } = useNavigation();

  if (isNavigating) {
    return (
      <main className="p-4">
        <SimpleLoader message={`Loading ${targetRoute || 'page'}...`} />
      </main>
    );
  }

  return (
    <main className="p-4">
      {isHomePage ? (
        <div className="container mx-auto px-4 py-8">{children}</div>
      ) : (
        children
      )}
    </main>
  );
};

export const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { isConnected } = useAccount();
  const { broker } = use0GBroker();
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Global account check - triggers when wallet connects and broker is ready
  useEffect(() => {
    const checkLedger = async () => {
      if (broker && isConnected && !isHomePage) {
        try {
          console.log("Global ledger check...");
          const ledger = await broker.ledger.getLedger();
          console.log("Ledger:", ledger);
          // If ledger doesn't exist, show deposit modal
          if (!ledger) {
            console.log("No ledger found, showing deposit modal globally");
            setShowDepositModal(true);
          }
        } catch (err: unknown) {
          console.error("Error checking ledger globally:", err);
          // If error occurs, assume no ledger exists
          setShowDepositModal(true);
        }
      }
    };
    checkLedger();
  }, [broker, isConnected, isHomePage]);

  // Step 1: Create account only
  const handleCreateAccount = async () => {
    if (!broker) return;
    
    setIsLoading(true);
    try {
      await broker.ledger.addLedger(0);
      setShowDepositModal(false);
      setShowTopUpModal(true); // Show top-up modal after account creation
      console.log("Account created successfully");
    } catch (err: unknown) {
      console.error("Error creating account:", err);
      // Keep modal open on error
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle deposit
  const handleDeposit = async (amount: number) => {
    if (!broker) return;
    
    setIsLoading(true);
    try {
      await broker.ledger.depositFund(amount);
      setShowTopUpModal(false);
      console.log("Deposit successful:", amount, "A0GI");
    } catch (err: unknown) {
      console.error("Error depositing:", err);
      // Keep modal open on error
    } finally {
      setIsLoading(false);
    }
  };

  // Skip deposit
  const handleSkipDeposit = () => {
    setShowTopUpModal(false);
    console.log("User skipped initial deposit");
  };

  return (
    <NavigationProvider>
      <div className={`min-h-screen bg-gray-50 ${isHomePage ? "pt-20" : "pl-52 pt-20"}`}>
        {isHomePage ? null : <Sidebar />}
        <MainContentArea isHomePage={isHomePage}>
          {children}
        </MainContentArea>
      </div>

      {/* Global Account Creation Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Create Your Account
              </h3>
              <p className="text-gray-600 text-sm">
                Welcome to 0G Compute Network! Create your account to get started.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleCreateAccount}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create My Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top-up Modal - Step 2 */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Account Created Successfully!
              </h3>
              <p className="text-gray-600 text-sm">
                Would you like to add some funds to your account now?
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleDeposit(0.1)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Adding..." : "0.1 A0GI"}
                </button>
                <button
                  onClick={() => handleDeposit(1)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Adding..." : "1 A0GI"}
                </button>
                <button
                  onClick={() => handleDeposit(5)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Adding..." : "5 A0GI"}
                </button>
                <button
                  onClick={() => handleDeposit(10)}
                  disabled={isLoading}
                  className="px-4 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "Adding..." : "10 A0GI"}
                </button>
              </div>
              
              <button
                onClick={handleSkipDeposit}
                disabled={isLoading}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </NavigationProvider>
  );
};
