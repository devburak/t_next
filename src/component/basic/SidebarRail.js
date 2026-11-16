import React from 'react';
import { Box, Stack, Typography, Skeleton } from '@mui/material';
import dynamic from 'next/dynamic';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuickAccessMenu from '../QuickAccessMenu';

const DynamicCalendar = dynamic(() => import('../calendar'), {
  ssr: false,
  loading: () => (
    <Box
      aria-label="Etkinlikler yükleniyor"
      sx={{ height: { xs: 476, sm: 484 }, p: 2, border: '1px solid var(--site-border)', borderRadius: 4 }}
    >
      <Skeleton height={40} />
      <Skeleton height={300} />
      <Skeleton height={32} />
    </Box>
  ),
});
const Campaign = dynamic(() => import('../campaign'), { ssr: false });

function SidebarRail({
  pageType = 'detail',
  initialRightMenuItems = null,
  disableRightMenuFetch = false,
}) {
  return (
    <>
      <Box sx={{ backgroundColor: 'inherit', p: { xs: 0, sm: '4px' } }}>
        <Campaign pageType={pageType} placement="left_menu" layoutType="square" />
        <Box mb={1} sx={{ maxWidth: { xs: 'none', sm: 480 }, mx: { xs: -2, sm: 'auto' } }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ p: 2, color: 'var(--site-ink)' }}
          >
            <CalendarMonthIcon sx={{ color: 'var(--tmmob-red)' }} />
            <Typography component="h2" sx={{ m: 0, fontSize: '20px !important', fontWeight: 700 }}>
              Etkinlikler
            </Typography>
          </Stack>
          <DynamicCalendar />
        </Box>
      </Box>
      <Box sx={{ backgroundColor: 'inherit', p: '16px 4px' }}>
        <QuickAccessMenu
          initialMenuItems={initialRightMenuItems}
          disableClientFetch={disableRightMenuFetch}
        />
      </Box>
    </>
  );
}

export default SidebarRail;
