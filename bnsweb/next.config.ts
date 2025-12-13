import type { NextConfig } from 'next';
import path from 'path';

const apiport = process.env.NEXT_PUBLIC_API_PORT;
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIME: new Date().toLocaleString(),
  },
  /* config options here */
  trailingSlash: false,
  //output: "export",
  output: process.env.NODE_ENV !== 'development' ? 'export' : 'standalone',
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  experimental: {
    proxyTimeout: 1000 * 120, // 120 seconds
  },
  // 테스트 단계에서만 동작하도록.
  rewrites:
    process.env.NODE_ENV === 'development'
      ? async () => {
          return [
            {
              source: '/api/:path*',
              destination: apiport
                ? `http://127.0.0.1:${apiport}/api/:path*`
                : 'http://127.0.0.1:3011/api/:path*',
            },
            // {
            //   source: '/req/:path*',
            //   destination: 'https://api.vworld.kr/req/:path*', // cors 문제로 추가
            // },
          ];
        }
      : undefined,
};

export default nextConfig;
