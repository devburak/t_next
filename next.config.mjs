/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
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
      }],
  //  domains: ['storage.ikon-x.com.tr'], // İzin verilen harici resim kaynakları listesi
  },
};

export default nextConfig;
