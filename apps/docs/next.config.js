import { withTamagui } from '@tamagui/next-plugin';

/** @type {import('next').NextConfig} */
let nextConfig = {
  // output: 'export', // If you are doing a static export
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.ctfassets.net',
      },
    ],
    unoptimized: true, // Assuming this is for static export or to simplify build
  },
  transpilePackages: [
    "react-native",
    "react-native-svg",
    "tamagui",
    "ui",
    // Add other react-native related packages if needed, e.g., specific Tamagui plugins
  ],
};

const tamaguiPlugin = withTamagui({
  components: ['tamagui', 'ui'],
  config: './tamagui.config.ts',
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  // Ensure these are false for app directory, true for pages directory
  appDir: true, 
  // Optional: more Tamagui next-plugin options here
});

// Wrapping the export in a function as Vercel sometimes prefers this
const finalConfig = tamaguiPlugin(nextConfig);

export default finalConfig;
