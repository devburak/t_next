export function normalizeText(text) {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/ğ/g, 'g').replace(/ü/g, 'u')
      .replace(/ş/g, 's').replace(/ı/g, 'i')
      .replace(/ö/g, 'o').replace(/ç/g, 'c')
      .toLowerCase();
  }
  

  export  function formattedDate (publishDate){
   return new Date(publishDate).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } 