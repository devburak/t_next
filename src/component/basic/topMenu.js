// components/TopMenu.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import {
    Box,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
    IconButton,
    useMediaQuery,
    useTheme,
    Menu,
    MenuItem,
    Collapse,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    ExpandLess,
    ExpandMore,
} from '@mui/icons-material';
import dynamic from 'next/dynamic';

import { StyledListItem, StyledListItemText } from './StyledListItem';
const SearchInput = dynamic(() => import('./searchInput'), { ssr: false });
// const menuItems = [
//     { name: 'ANASAYFA', path: '/', prfx: "/" },
//     {
//         name: 'TMMOB',
//         prfx: '/tmmob',
//         subItems: [
//             { name: 'TMMOB Hakkında', path: '/tmmob/tmmob-hakkinda' },
//             { name: 'Yönetim Kurulu', path: '/tmmob/yonetim-kurulu' },
//             // Diğer TMMOB alt menü öğeleri
//         ],
//     },
//     {
//         name: 'MEVZUAT',
//         prfx: '/hukuk',
//         subItems: [
//             { name: 'Ana Yönetmelik', path: '/hukuk/ana-yonetmelik' },
//             // Diğer Mevzuat alt menü öğeleri
//         ],
//     },
//     {
//         name: 'BELGELER',
//         prfx: '/belgeler',
//         subItems: [
//             { name: 'Genel Kurul Sonuç Bildirgesi', path: '/belgeler/genel-kurul-sonuc-bildirgesi' },
//             // Diğer Belgeler alt menü öğeleri
//         ],
//     },
//     {
//         name: 'ARŞİV',
//         prfx: '/arsiv',
//         subItems: [
//             { name: 'TMMOB Demokrasi Kurultayı 1998', path: '/demokrasi-kurultayi-1998' },
//             { name: 'Emek Platformu Programı 26 Eylül 2002', path: '/emek-platformu-26-eylul-2002' },
//             // Diğer Arşiv alt menü öğeleri
//         ],
//     },
//     {
//         name: 'YAYINLAR',
//         prfx: '/yayinlar',
//         subItems: [
//             { name: 'Birlik Haberleri', path: '/yayinlar/birlik-haberleri' },
//             { name: 'TMMOB Bülteni', path: '/yayinlar/tmmob-bulteni' },
//             { name: 'Kitaplar', path: '/yayinlar/kitaplar' },
//             // Diğer Yayinlar alt menü öğeleri
//         ],
//     },
//     {
//         name: 'ODALAR',
//         prfx: '/odalar',
//         path: '/odalar'
//     },
// ];
const menuItems = [
    { name: 'ANASAYFA', path: '/', prfx: "/" },
    {
      name: 'TMMOB',
      prfx: '/tmmob',
      subItems: [
        { name: 'TMMOB Hakkında', path: '/sayfa/tmmob-hakkinda' },
        { name: 'Yönetim Kurulu', path: '/tmmob/yonetim-kurulu' },
        { name: 'Yüksek Onur Kurulu', path: '/tmmob/yuksek-onur-kurulu' },
        { name: 'Denetleme Kurulu', path: '/tmmob/denetleme-kurulu' },
        { name: 'Genel Sekreterlik', path: '/sayfa/genel-sekreterlik' },
        { name: 'TMMOB Logosu', path: '/sayfa/tmmob-logosu' },
      ],
    },
    {
      name: 'MEVZUAT',
      prfx: '/hukuk',
      subItems: [
        { name: 'Yasal Çerçeve', path: '/hukuk/yasal-cerceve' },
        { name: 'Ana Yönetmelik', path: '/hukuk/ana-yonetmelik' },
        { name: 'Yönetmelikler', path: '/hukuk/yonetmelikler' },
        { name: 'Hukuk', path: 'https://www.tmmob.org.tr/hukuk/acilan-davalar?field_donem_tid=132' },
      ],
    },
    {
      name: 'BELGELER',
      prfx: '/belgeler',
      subItems: [
        { name: 'Genel Kurul Sonuç Bildirgesi', path: '/belgeler/genel-kurul-sonuc-bildirgesi' },
        { name: 'Sonuç Bildirgeleri', path: '/sonuc-bildirgeleri' },
        { name: 'Çalışma Programı', path: '/belgeler/calisma-programi' },
        { name: 'Yönetim Kurulu Kararları', path: '/belgeler/yonetim-kurulu-kararlari' },
        { name: 'Denetleme Kurulu Raporları', path: '/belgeler/denetleme-kurulu-raporlari' },
        { name: 'Çalışma Grupları', path: '/belgeler/calisma-gruplari' },
        { name: 'Çalışma Raporu', path: '/belgeler/calisma-raporu' },
      ],
    },
    {
      name: 'ARŞİV',
      prfx: '/arsiv',
      subItems: [
        { name: 'TMMOB Demokrasi Kurultayı 1998', path: '/etkinlik/tmmob-demokrasi-kurultayi-1998' },
        { name: 'Emek Platformu Programı 26 Eylül 2002', path: '/etkinlik/emek-platformu-2002' },
        { name: 'Mühendislik Mimarlık Kurultayı 2003', path: '/etkinlik/muhendislik-mimarlik-kurultayi-2003' },
        { name: 'Teoman Öztürk Belgeseli', path: 'https://www.tmmob.org.tr/video/teoman-ozturk-belgeseli' },
      ],
    },
    {
      name: 'YAYINLAR',
      prfx: '/yayinlar',
      subItems: [
        { name: 'Birlik Haberleri', path: '/yayin-turu/birlik-haberleri' },
        { name: 'TMMOB Bülteni', path: '/yayin-turu/tmmob-bulteni' },
        { name: 'Kitaplar', path: '/yayin-turu/kitap' },
        { name: 'Video Galerisi', path: 'https://www.tmmob.org.tr/video-galeri' },
      ],
    },
    { name: 'ODALAR', prfx: '/odalar', path: '/odalar' },
    { name: 'İKKLAR', prfx: '/ikk', path: '/ikk' },
  ];
  
function TopMenu() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mobileOpenMenus, setMobileOpenMenus] = useState({});
    const [desktopOpenMenu, setDesktopOpenMenu] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // Desktop submenu için anchor
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleMenuClick = (path) => {
        router.push(path);
        setDrawerOpen(false);
        handleCloseDesktopMenu();
    };

    // Mobil menüde alt menüyü açma/kapatma
    const handleMobileMenuToggle = (menuName) => {
        setMobileOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    // Masaüstü menüde alt menüyü açma
    const handleDesktopMenuOpen = (event, menuName) => {
        setAnchorEl(event.currentTarget);
        setDesktopOpenMenu(menuName);
    };

    // Masaüstü menüde alt menüyü kapatma
    const handleCloseDesktopMenu = () => {
        setAnchorEl(null);
        setDesktopOpenMenu(null);
    };

    // Aktif sayfa kontrolü
    const isActive = (path) => router.pathname === path;

    return (
        <Box>
            {isMobile ? (
                <>
                    {/* Mobil Üst Çubuk */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            bgcolor: '#fff',
                            height: '56px',
                            boxShadow: 1,
                        }}
                    >
                        {/* Hamburger Menü İkonu */}
                        <IconButton
                            onClick={handleDrawerToggle}
                            aria-label="open drawer"
                            edge="start"
                            color="inherit"
                            sx={{ mx: 1 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Arama Girişi */}
                        <Box sx={{ flexGrow: 1, mx: 1 }}>
                            <SearchInput />
                        </Box>
                    </Box>

                    {/* Mobil Menü için Drawer */}
                    <Drawer
                        anchor="left"
                        open={drawerOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true, // Daha iyi performans için mobilde tut
                        }}
                    >
                        <Box
                            sx={{
                                width: 250,
                                bgcolor: '#2C3E50',
                                height: '100%',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            role="presentation"
                        >
                            {/* Drawer içindeki Kapatma İkonu */}
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                                <IconButton aria-label="close drawer" onClick={handleDrawerToggle} sx={{ color: 'white' }}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Menü Öğeleri */}
                            <List>
                                {menuItems.map((item) => (
                                    <React.Fragment key={item.name}>
                                        {item.subItems ? (
                                            <>
                                                {/* Alt Menülü Menü Öğesi */}
                                                <ListItem
                                                    button
                                                    onClick={() => handleMobileMenuToggle(item.name)}
                                                    selected={isActive(item.path)}
                                                    sx={{
                                                        bgcolor: isActive(item.path) ? '#34495E' : 'inherit',
                                                    }}
                                                >
                                                    <ListItemText primary={item.name} />
                                                    {mobileOpenMenus[item.name] ? <ExpandLess sx={{fontSize:11}} /> : <ExpandMore sx={{fontSize:11}}/>}
                                                </ListItem>
                                                {/* Alt Menü Öğeleri */}
                                                <Collapse in={mobileOpenMenus[item.name]} timeout="auto" unmountOnExit>
                                                    <List component="div" disablePadding>
                                                        {item.subItems.map((subItem) => (
                                                            <ListItem
                                                                button
                                                                key={subItem.name}
                                                                onClick={() => handleMenuClick(subItem.path)}
                                                                selected={isActive(subItem.path)}
                                                                sx={{
                                                                    pl: 4,
                                                                    bgcolor: isActive(subItem.path) ? '#34495E' : 'inherit',
                                                                }}
                                                            >
                                                                <ListItemText primary={subItem.name} />
                                                            </ListItem>
                                                        ))}
                                                    </List>
                                                </Collapse>
                                            </>
                                        ) : (
                                            /* Alt Menüsüz Menü Öğesi */
                                            <StyledListItem
                                                button
                                                onClick={() => handleMenuClick(item.path)}
                                                selected={isActive(item.path)}
                                                sx={{
                                                    bgcolor: isActive(item.path) ? '#34495E' : 'inherit',
                                                }}
                                            >
                                                <StyledListItemText primary={item.name} />
                                            </StyledListItem>
                                        )}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Box>
                    </Drawer>
                </>
            ) : (
                /* Masaüstü Görünümü */
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        px: 2,
                        bgcolor: '#fff',
                        height: '56px',
                        boxShadow: 1,
                    }}
                >
                    {/* Menü Öğeleri */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {menuItems.map((item) => (
                            item.subItems ? (
                                <Box
                                    key={item.name}
                                    sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                                >
                                    {/* Alt Menülü Menü Öğesi */}
                                    <Button
                                        onClick={(e) => {
                                            if (desktopOpenMenu === item.name) {
                                                handleCloseDesktopMenu();
                                            } else {
                                                handleDesktopMenuOpen(e, item.name);
                                            }
                                        }}
                                        variant="text"
                                        sx={{
                                            color: isActive(item.path) ? '#ffffff' : 'inherit',
                                            bgcolor: isActive(item.path) ? '#2C3E50' : 'transparent',
                                            '&:hover': {
                                                bgcolor: '#2C3E50',
                                                color: '#ffffff',
                                            },
                                            textTransform: 'none',
                                            mx: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        aria-controls={desktopOpenMenu === item.name ? `${item.name}-menu` : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={desktopOpenMenu === item.name ? 'true' : undefined}
                                    >
                                        {item.name}
                                        {desktopOpenMenu === item.name ? <ExpandLess sx={{fontSize:14}} /> : <ExpandMore sx={{fontSize:14}}/>}
                                    </Button>
                                    {/* Alt Menü */}
                                    <Menu
                                        id={`${item.name}-menu`}
                                        anchorEl={anchorEl}
                                        open={desktopOpenMenu === item.name}
                                        onClose={handleCloseDesktopMenu}
                                        MenuListProps={{
                                            onMouseEnter: () => setDesktopOpenMenu(item.name),
                                            onMouseLeave: handleCloseDesktopMenu,
                                        }}
                                        anchorOrigin={{
                                            vertical: 'bottom',
                                            horizontal: 'left',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'left',
                                        }}
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {item.subItems.map((subItem) => (
                                            <MenuItem
                                                key={subItem.name}
                                                onClick={() => handleMenuClick(subItem.path)}
                                                selected={isActive(subItem.path)}
                                                sx={{
                                                    bgcolor: isActive(subItem.path) ? '#2C3E50' : 'inherit',
                                                    color: isActive(subItem.path) ? '#ffffff' : 'inherit',
                                                    '&:hover': {
                                                        bgcolor: '#2C3E50',
                                                        color: '#ffffff',
                                                    },
                                                }}
                                            >
                                                {subItem.name}
                                            </MenuItem>
                                        ))}
                                    </Menu>
                                </Box>
                            ) : (
                                /* Alt Menüsüz Menü Öğesi */
                                <Button
                                    key={item.name}
                                    onClick={() => handleMenuClick(item.path)}
                                    variant="text"
                                    sx={{
                                        color: isActive(item.path) ? '#ffffff' : 'inherit',
                                        bgcolor: isActive(item.path) ? '#2C3E50' : 'transparent',
                                        '&:hover': {
                                            bgcolor: '#2C3E50',
                                            color: '#ffffff',
                                        },
                                        textTransform: 'none',
                                        mx: 1,
                                    }}
                                >
                                    {item.name}
                                </Button>
                            )
                        ))}
                    </Box>

                    {/* Arama Girişi */}
                    <SearchInput />
                </Box>
            )}
        </Box>);
    }

    export default TopMenu;
