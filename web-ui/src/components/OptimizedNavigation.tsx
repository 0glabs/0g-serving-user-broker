"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";



interface OptimizedLinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  preload?: boolean;
  onNavigationStart?: () => void;
}

export const OptimizedLink: React.FC<OptimizedLinkProps> = ({
  href,
  className,
  children,
  preload = true,
  onNavigationStart,
}) => {
  const router = useRouter();
  const [isNavigating] = useState(false);

  useEffect(() => {
    // 预加载页面资源
    if (preload && href !== "#") {
      router.prefetch(href);
    }
  }, [href, preload, router]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isNavigating) return;
    
    // 触发导航状态
    onNavigationStart?.();
    
    // 立即导航，不设置本地 loading 状态
    router.push(href);
  };

  return (
    <Link 
      href={href} 
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
};

// Navigation loading context
import { createContext, useContext } from "react";

interface NavigationContextValue {
  isNavigating: boolean;
  setIsNavigating: (value: boolean) => void;
  targetRoute: string | null;
  setTargetRoute: (route: string | null) => void;
  targetPageType: string | null;
  setTargetPageType: (type: string | null) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);
  const [targetPageType, setTargetPageType] = useState<string | null>(null);
  const pathname = usePathname();

  // 监听路由变化，重置导航状态
  useEffect(() => {
    // 延迟重置状态，让 loading 显示一小段时间
    const timer = setTimeout(() => {
      setIsNavigating(false);
      setTargetRoute(null);
      setTargetPageType(null);
    }, 300); // 300ms 后重置状态

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <NavigationContext.Provider
      value={{
        isNavigating,
        setIsNavigating,
        targetRoute,
        setTargetRoute,
        targetPageType,
        setTargetPageType,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

// GlobalNavigationLoader removed - using SimpleLoader in main content area instead