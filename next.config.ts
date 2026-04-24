import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // output: "export",
  sassOptions: {
    includePaths: [path.join(__dirname, 'src/style')],
  },
  eslint:{
    ignoreDuringBuilds:true
  },
  async rewrites() {
    return [
      {
        source: '/', // the URL you want in browser
        destination: '/login-2',   // actual page under /pages/index.tsx
      },
     ];
  },

};

export default nextConfig;
