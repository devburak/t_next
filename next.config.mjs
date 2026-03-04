import fs from 'node:fs';
import path from 'node:path';

/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';

function cleanupConflictingCategoryRoutes() {
  const dynamicExtensions = ['js', 'jsx', 'ts', 'tsx'];
  const categoryDirectories = [
    path.join(process.cwd(), 'pages', 'kategori'),
    path.join(process.cwd(), 'src', 'pages', 'kategori'),
  ];

  const legacyCategoryFiles = [];
  const slugCategoryFiles = [];

  for (const directoryPath of categoryDirectories) {
    for (const extension of dynamicExtensions) {
      const legacyPath = path.join(directoryPath, `[category].${extension}`);
      const slugPath = path.join(directoryPath, `[categorySlug].${extension}`);

      if (fs.existsSync(legacyPath)) {
        legacyCategoryFiles.push(legacyPath);
      }

      if (fs.existsSync(slugPath)) {
        slugCategoryFiles.push(slugPath);
      }
    }
  }

  if (legacyCategoryFiles.length === 0 || slugCategoryFiles.length === 0) {
    return;
  }

  for (const legacyFile of legacyCategoryFiles) {
    try {
      fs.unlinkSync(legacyFile);
      console.warn(
        `[next-config] Removed legacy dynamic route file to avoid conflict: ${legacyFile}`
      );
    } catch (error) {
      console.warn(
        `[next-config] Failed to remove legacy route file: ${legacyFile}. ${error.message}`
      );
    }
  }
}

cleanupConflictingCategoryRoutes();

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
