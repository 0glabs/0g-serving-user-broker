"use client";

import { createLazyPage } from './PageLoader';

// 创建懒加载的页面组件
export const LazyHomePage = createLazyPage(
  () => import('../app/page'),
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-12">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
      </div>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 border">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LazyInferencePage = createLazyPage(
  () => import('../app/inference/page'),
  <div className="w-full">
    <div className="mb-3">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-300 p-5">
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex space-x-1 mt-4">
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const LazyLedgerPage = createLazyPage(
  () => import('../app/ledger/page'),
  <div className="w-full">
    <div className="mb-3">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
    <div className="bg-white rounded-t-xl border border-gray-200">
      <div className="flex border-b border-gray-200">
        <div className="px-6 py-4 bg-blue-50 flex-1">
          <div className="animate-pulse h-5 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="px-6 py-4 flex-1">
          <div className="animate-pulse h-5 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-6">
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
            <div className="h-8 bg-gray-200 rounded w-48"></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const LazyFineTuningPage = createLazyPage(
  () => import('../app/fine-tuning/page'),
  <div className="w-full">
    <div className="mb-3">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-28 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <div className="animate-pulse">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-96 mx-auto mb-6"></div>
        <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 mt-0.5"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-40 mt-3"></div>
            </div>
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0 mt-0.5"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const LazyChatPage = createLazyPage(
  () => import('./OptimizedChatPage').then(module => ({ default: module.OptimizedChatPage })),
  <div className="w-full h-full">
    <div className="mb-3">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 h-[calc(100vh-200px)] flex flex-col">
      {/* Provider selector */}
      <div className="border-b border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
      
      {/* Chat messages area */}
      <div className="flex-1 p-4 space-y-4">
        <div className="animate-pulse">
          {/* User message */}
          <div className="flex justify-end mb-4">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-200 rounded-2xl rounded-tr-sm p-3">
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
          
          {/* Assistant message */}
          <div className="flex justify-start mb-4">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-200 rounded-2xl rounded-tl-sm p-3">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          
          {/* Another user message */}
          <div className="flex justify-end mb-4">
            <div className="max-w-xs lg:max-w-md">
              <div className="bg-gray-200 rounded-2xl rounded-tr-sm p-3">
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="flex space-x-3">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);