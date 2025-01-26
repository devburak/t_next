// components/Header.js
import React from 'react';
import Image from 'next/image';
import { IconButton } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useRouter } from 'next/router';

function Header() {
    const router = useRouter();

    const handleGoHome = () => {
        router.push('/');
    };

    return (
        <div className="headerBackground">
            {/* Logo Bölümü */}
            <div className="logo" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
                <Image
                    src="https://storage.ikon-x.com.tr/2024/02/tmmob.png"
                    alt="TMMOB Logo"
                    width={296} // Resmin orijinal genişliği
                    height={81} // Resmin orijinal yüksekliği
                    objectFit="contain"
                />
            </div>

            {/* Sosyal Medya İkonları Bölümü */}
            <div className="socialIcons">
                <a href="https://www.facebook.com/tmmob1954/" target="_blank" rel="noopener noreferrer">
                    <IconButton aria-label="Facebook" color="inherit" size='small'>
                        <FacebookIcon />
                    </IconButton>
                </a>
                <a href="https://x.com/tmmob1954" target="_blank" rel="noopener noreferrer">
                    <IconButton aria-label="X" color="inherit"  size='small'>
                        <XIcon />
                    </IconButton>
                </a>
                <a href="https://www.instagram.com/tmmob1954/" target="_blank" rel="noopener noreferrer">
                    <IconButton aria-label="Instagram" color="inherit"  size='small'>
                        <InstagramIcon />
                    </IconButton>
                </a>
                <a href="https://www.youtube.com/channel/UCcueF3RXjWfm0koMg1OnAXQ" target="_blank" rel="noopener noreferrer">
                    <IconButton aria-label="YouTube" color="inherit" size='small'>
                        <YouTubeIcon />
                    </IconButton>
                </a>
            </div>
        </div>
    );
}

export default Header;
