import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Menu, MenuItem, useMediaQuery, useTheme,Box } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import SearchInput from './searchInput';

const menuItems = [
    { name: 'ANASAYFA', path: '/', prfx: "/" },
    {
        name: 'TMMOB',
        prfx: '/tmmob',
        subItems: [
            { name: 'TMMOB Hakkında', path: '/tmmob/tmmob-hakkinda' },
            { name: 'Yönetim Kurulu', path: '/tmmob/yonetim-kurulu' },
            // Diğer TMMOB alt menü öğeleri
        ],
    },
    {
        name: 'MEVZUAT',
        prfx: '/hukuk',

        subItems: [
            { name: 'Ana Yönetmelik', path: '/hukuk/ana-yonetmelik' },
            // Diğer Mevzuat alt menü öğeleri
        ],
    },
    {
        name: 'BELGELER',
        prfx: '/belgeler',
        subItems: [
            { name: 'Genel Kurul Sonuç Bildirgesi', path: '/belgeler/genel-kurul-sonuc-bildirgesi' },
            // Diğer Belgeler alt menü öğeleri
        ],
    },
    {
        name: 'ARŞİV',
        prfx: '/arsiv',
        subItems: [
            { name: 'TMMOB Demokrasi Kurultayı 1998', path: '/demokrasi-kurultayi-1998' },
            { name: 'Emek Platformu Programı 26 Eylül 2002', path: '/demokrasi-kurultayi-1998' },
            // Diğer Belgeler alt menü öğeleri
        ],
    },
    {
        name: 'YAYINLAR',
        prfx: '/yayinlar',
        subItems: [
            { name: 'Birlik Haberleri', path: '/birlik-haberleri' },
            { name: 'TMMOB Bülteni', path: '/tmmob-bulteni' },
            { name: 'Kitaplar', path: '/kitaplar' },
            // Diğer Belgeler alt menü öğeleri
        ],
    },
    {
        name: 'ODALAR',
        prfx: '/odalar',
        path: '/odalar'
        
    },
];


function TopMenu() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleClick = (event, index) => {
        const item = menuItems[index];
        
        // Eğer menü öğesinin bir path'i var ve alt menü öğeleri yoksa, o linke yönlendir
        if (item.path && !item.subItems) {
            router.push(item.path);
        } else {
            // Eğer alt menü öğeleri varsa, alt menüyü aç
            setAnchorEl(event.currentTarget);
            setSelectedIndex(index);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const isActive = (prfx) => {
        // Ana sayfa için kontrol
        if (prfx === '/' && router.pathname === '/') {
            return true;
        }
        // Ana sayfa dışındaki diğer sayfalar için kontrol
        else if (prfx !== '/' && router.pathname.startsWith(prfx)) {
            return true;
        }
        return false;
    };


    return (
        <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row', // Mobil cihazlarda alt alta, diğer durumlarda yan yana
            justifyContent: 'space-between', // Menü öğelerini sola, arama kutusunu sağa yasla
            alignItems: 'center', // İçeriği dikey olarak ortala
            width: '100%', // Box'ın tam genişliği kaplamasını sağla
            px:2
        }}>
            <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row', // Mobilde alt alta, diğer durumlarda yan yana
        alignItems: 'center', // İçeriği dikey olarak ortala
    }}>
            {menuItems.map((item, index) => (
                <React.Fragment key={item.name}>
                    <Button
                        aria-controls={item.subItems ? "simple-menu" : undefined}
                        aria-haspopup="true"
                        onClick={(event) => handleClick(event, index)}
                        variant={isActive(item.prfx) ? "contained" : "text"}
                        color={isActive(item.prfx) ? "primary" : "inherit"}
                        size='large'
                        sx={{
                            my:0.5 , // Menü öğeleri arasında boşluk
                            borderRadius:0
                        }}
                        endIcon={item.subItems ? (Boolean(anchorEl) && selectedIndex === index ? <ExpandLess /> : <ExpandMore />) : null}
                    >
                        {item.name}
                    </Button>
                    {item.subItems && (
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl) && selectedIndex === index}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                        >
                            {item.subItems.map((subItem, subIndex) => (
                                <MenuItem
                                    key={subItem.name}
                                    onClick={() => {
                                        handleClose();
                                        router.push(subItem.path);
                                    }}
                                >
                                    {subItem.name}
                                </MenuItem>
                            ))}
                        </Menu>
                    )}
                </React.Fragment>
            ))}
            </Box>
           <SearchInput />
        </Box>
    );
}

export default TopMenu;