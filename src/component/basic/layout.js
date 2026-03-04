import React from 'react';
import Header from './header'; // Header bileşeninizin yolu
import Chambers from './chambers';
import Footer from './footer';
import TopMenu from './topMenu';
import { Grid, useTheme, useMediaQuery, Box } from '@mui/material';
import dynamic from 'next/dynamic';
import SidebarRail from './SidebarRail';

// Dynamically import Campaign with SSR disabled
const Campaign = dynamic(() => import('../campaign'), { ssr: false });


function Layout({ children , LeftSide , RigthSide}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasCustomLeftSide = Boolean(LeftSide);
  const showRightRail = typeof RigthSide === 'boolean' ? RigthSide : !hasCustomLeftSide;
  const mainColumnWidth = hasCustomLeftSide ? (showRightRail ? 6 : 9) : (showRightRail ? 9 : 12);

  return (
    <div>
      <Header />
      <TopMenu />
      <Box className="site-shell site-shell--content">
      <Grid container spacing={3}>
        {hasCustomLeftSide && (
          <Grid item xs={12} sm={3} order={isMobile ? 2 : 1}>
            {LeftSide}
          </Grid>
        )}
        <Grid item xs={12} sm={mainColumnWidth} order={isMobile ? 1 : 2}>
          <div style={{ padding: '5px' }}>
            {children}
          </div>
        </Grid>
        {showRightRail && (
          <Grid item xs={12} sm={3} order={isMobile ? 3 : 3}>
            <SidebarRail pageType="detail" />
          </Grid>
        )}
      </Grid>
      </Box>
      <Campaign pageType="detail" placement="popup" />
      <Campaign pageType="detail" placement="footer" layoutType="horizontal" />
      <Chambers />
      <Footer />
    </div>
  );
}

export default Layout;
