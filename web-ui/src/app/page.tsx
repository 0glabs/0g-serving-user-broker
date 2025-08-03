"use client";

import React from "react";
import Link from "next/link";
import { useAccount } from 'wagmi';

export default function Home() {
  const { isConnected, address } = useAccount();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to 0G Compute Network
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore decentralized AI inference services with our SDK demonstration
        </p>
        
        {!isConnected ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              Connect Your Wallet to Get Started
            </h3>
            <p className="text-yellow-700">
              Please connect your MetaMask wallet to access the 0G Compute Network features.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Wallet Connected Successfully
            </h3>
            <p className="text-green-700">
              Connected to: {address}
            </p>
          </div>
        )}
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Ledger Management</h3>
          <p className="text-gray-600 mb-4">
            Manage your account balance, add funds, and view transaction history for AI services.
          </p>
          <Link
            href="/ledger"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Go to Ledger →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Fine-tuning</h3>
          <p className="text-gray-600 mb-4">
            Customize AI models with your own data. Train models specifically for your use case.
          </p>
          <Link
            href="/fine-tuning"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Go to Fine-tuning →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.9L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">AI Inference</h3>
          <p className="text-gray-600 mb-4">
            Chat with various AI models, test different providers, and experience decentralized AI.
          </p>
          <Link
            href="/inference"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Go to Inference →
          </Link>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
              <p className="text-gray-600">Connect your MetaMask wallet and switch to the 0G testnet.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fund Your Ledger</h3>
              <p className="text-gray-600">Add some 0G tokens to your ledger account to pay for AI services.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Start Using AI</h3>
              <p className="text-gray-600">Choose a provider and start chatting with AI models or fine-tune your own.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
