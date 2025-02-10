/** @type {import('next').NextConfig} */
const nextConfig = {
    // eslint ignoreDuringBuilds :: https://nextjs.org/docs/app/api-reference/next-config-js/eslint
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
};

export default nextConfig;
