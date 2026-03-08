import fs from 'node:fs';
import path from 'node:path';

/** @type {import('next').NextConfig} */
const distDir = process.env.NEXT_DIST_DIR || '.next';
const PROD_API_BASE_URL = 'https://api.tmmob.org.tr/api';
const PROD_SITE_URL = 'https://newt6491032g.tmmob.org.tr';
const isProduction = process.env.NODE_ENV === 'production';

function isLocalAddress(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return (
    normalized.includes('127.0.0.1') ||
    normalized.includes('localhost')
  );
}

function normalizeProductionEnv() {
  if (!isProduction) {
    return;
  }

  const apiEnvKeys = ['API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL'];
  for (const key of apiEnvKeys) {
    const current = String(process.env[key] || '').trim();
    if (!current || isLocalAddress(current)) {
      process.env[key] = PROD_API_BASE_URL;
      console.warn(
        `[next-config] ${key} was ${current || 'empty'} in production, forced to ${PROD_API_BASE_URL}`
      );
    }
  }

  const currentSiteUrl = String(process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!currentSiteUrl || isLocalAddress(currentSiteUrl)) {
    process.env.NEXT_PUBLIC_SITE_URL = PROD_SITE_URL;
    console.warn(
      `[next-config] NEXT_PUBLIC_SITE_URL was ${currentSiteUrl || 'empty'} in production, forced to ${PROD_SITE_URL}`
    );
  }
}

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

normalizeProductionEnv();

const nextConfig = {
  // Keep dev output separate from production builds so mixed server
  // artifacts do not produce missing vendor chunk errors.
  distDir,
  reactStrictMode: true,
  async redirects() {
    return [
      // /icerik/:slug -> /:slug (301 permanent redirect for SEO)
      {
        source: '/icerik/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ];
  },
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
