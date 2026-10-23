const [major, minor, patch] = process.versions.node.split(".").map(Number);
if (major !== 24 || minor < 22 || (minor === 22 && patch < 1)) {
  console.error(
    `Node.js 24.22.1 veya daha yeni bir 24.x güvenlik sürümü gerekli. Geçerli sürüm: ${process.version}. Proje dizininde nvm install && nvm use çalıştırın.`,
  );
  process.exitCode = 1;
}
