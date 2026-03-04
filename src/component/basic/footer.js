import React from 'react';

function Footer() {
  // Geçerli yılı al
  const currentYear = new Date().getFullYear();

  return (
    <footer className="siteFooter">
      <div className="site-shell footerShell">
        <div>
          Türk Mühendis ve Mimar Odaları Birliği, Kocatepe Mahallesi Selanik Caddesi No:19/1 06420 Çankaya/ANKARA
        </div>
        <div>
          Tel: 0 312 418 12 75 - Faks: 0 312 417 48 24 | tmmob@tmmob.org.tr - tmmob@hs03.kep.tr
        </div>
        <div>
          © {currentYear} | <a href="https://www.tmmob.org.tr/bilgi-edinme" style={{ color: '#fff', textDecoration: 'underline' }}>Bilgi Edinme</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
