export function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ç/g, 'c')
      .toLowerCase();
  }
  