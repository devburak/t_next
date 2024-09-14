import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
function Header() {

  return (
    <div className="headerBackground">
      <Link href="/"><Image
        src="https://storage.ikon-x.com.tr/2024/02/tmmob.png"
        alt="TMMOB Logo"
        width={296} // Resmin orijinal genişliğini kullanın
        height={81} // Resmin orijinal yüksekliğini kullanın
        objectFit="contain"
      /></Link>
    </div>
    
  );
}

export default Header;
