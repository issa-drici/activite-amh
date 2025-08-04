declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface PWAConfig {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    sw?: string;
  }
  
  function withPWA(config: NextConfig & { pwa?: PWAConfig }): NextConfig;
  
  export = withPWA;
} 