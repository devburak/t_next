/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig = {
  // Keep dev output separate from production builds so mixed server
  // artifacts do not produce missing vendor chunk errors.
  distDir: isDevelopment ? '.next-dev' : '.next',
  reactStrictMode: true,
  images: {
    minimumCacheTTL: 604800,
    remotePatterns:[
      {
        protocol: 'https', // Görsel URL'sinin protokolü
        hostname: 'storage.ikon-x.com.tr', // Domain adı
        port: '', // Eğer özel bir port varsa belirtin, yoksa boş bırakın
        pathname: '/**', // Alt dizinleri ve tüm yolları kabul etmek için
      },{
        protocol: 'https', // Görsel URL'sinin protokolü
        hostname: 'www.tmmob.org.tr', // Domain adı
        port: '', // Eğer özel bir port varsa belirtin, yoksa boş bırakın
        pathname: '/**', // Alt dizinleri ve tüm yolları kabul etmek için
      },{
        protocol: 'https',
        hostname: 'img.youtube.com',
        port: '',
        pathname: '/**',
      }],
  //  domains: ['storage.ikon-x.com.tr'], // İzin verilen harici resim kaynakları listesi
  },
};

export default nextConfig;
