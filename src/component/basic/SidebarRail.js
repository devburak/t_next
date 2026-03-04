import React from 'react';
import { Box } from '@mui/material';
import dynamic from 'next/dynamic';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import TitleComponent from './TitleComponent';
import QuickAccessMenu from '../QuickAccessMenu';

const DynamicCalendar = dynamic(() => import('../calendar'), { ssr: false });
const Campaign = dynamic(() => import('../campaign'), { ssr: false });

function SidebarRail({ pageType = 'detail' }) {
  return (
    <>
      <Box sx={{ backgroundColor: 'inherit', p: '4px' }}>
        <Campaign pageType={pageType} placement="left_menu" layoutType="square" />
        <Box mb={1}>
          <TitleComponent icon={<CalendarMonthIcon />} title={'Etkinlikler'} link={'/takvim'} />
          <DynamicCalendar />
        </Box>
      </Box>
      <Box sx={{ backgroundColor: 'inherit', p: '16px 4px' }}>
        <QuickAccessMenu />
      </Box>
    </>
  );
}

export default SidebarRail;
