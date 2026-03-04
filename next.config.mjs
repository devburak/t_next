import fs from 'node:fs';
import path from 'node:path';

/** @type {import('next').NextConfig} */
const isDevelopment = process.env.NODE_ENV === 'development';

function removeLegacyDynamicRouteFiles({
  relativeDirectory,
  preferredParam,
  legacyParams,
}) {
  const dynamicExtensions = ['js', 'jsx', 'ts', 'tsx'];
  const routeDirectories = [
    path.join(process.cwd(), 'pages', relativeDirectory),
    path.join(process.cwd(), 'src', 'pages', relativeDirectory),
  ];

  const preferredEntries = [];
  const legacyFiles = [];
  const legacyDirectories = [];

  for (const directoryPath of routeDirectories) {
    for (const extension of dynamicExtensions) {
      const preferredPath = path.join(
        directoryPath,
        `[${preferredParam}].${extension}`
      );
      if (fs.existsSync(preferredPath)) {
        preferredEntries.push(preferredPath);
      }

      for (const legacyParam of legacyParams) {
        const legacyPath = path.join(directoryPath, `[${legacyParam}].${extension}`);
        if (fs.existsSync(legacyPath)) {
          legacyFiles.push(legacyPath);
        }
      }
    }

    const preferredDirectoryPath = path.join(directoryPath, `[${preferredParam}]`);
    if (
      fs.existsSync(preferredDirectoryPath) &&
      fs.statSync(preferredDirectoryPath).isDirectory()
    ) {
      preferredEntries.push(preferredDirectoryPath);
    }

    for (const legacyParam of legacyParams) {
      const legacyDirectoryPath = path.join(directoryPath, `[${legacyParam}]`);
      if (
        fs.existsSync(legacyDirectoryPath) &&
        fs.statSync(legacyDirectoryPath).isDirectory()
      ) {
        legacyDirectories.push(legacyDirectoryPath);
      }
    }
  }

  if (
    (legacyFiles.length === 0 && legacyDirectories.length === 0) ||
    preferredEntries.length === 0
  ) {
    return;
  }

  for (const legacyFile of legacyFiles) {
    try {
      fs.unlinkSync(legacyFile);
      console.warn(
        `[next-config] Removed legacy dynamic route file to avoid conflict (${relativeDirectory}): ${legacyFile}`
      );
    } catch (error) {
      console.warn(
        `[next-config] Failed to remove legacy route file (${relativeDirectory}): ${legacyFile}. ${error.message}`
      );
    }
  }

  for (const legacyDirectory of legacyDirectories) {
    try {
      fs.rmSync(legacyDirectory, { recursive: true, force: true });
      console.warn(
        `[next-config] Removed legacy dynamic route directory to avoid conflict (${relativeDirectory}): ${legacyDirectory}`
      );
    } catch (error) {
      console.warn(
        `[next-config] Failed to remove legacy route directory (${relativeDirectory}): ${legacyDirectory}. ${error.message}`
      );
    }
  }
}

removeLegacyDynamicRouteFiles({
  relativeDirectory: 'kategori',
  preferredParam: 'categorySlug',
  legacyParams: ['category'],
});

removeLegacyDynamicRouteFiles({
  relativeDirectory: 'yayin-turu',
  preferredParam: 'kategori',
  legacyParams: ['slug'],
});

removeLegacyDynamicRouteFiles({
  relativeDirectory: '',
  preferredParam: 'slug',
  legacyParams: ['kategori'],
});

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
