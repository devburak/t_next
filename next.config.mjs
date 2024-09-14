/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['storage.ikon-x.com.tr'], // İzin verilen harici resim kaynakları listesi
  },
};

export default nextConfig;
