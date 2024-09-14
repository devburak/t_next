import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Box } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function LeftSide() {
  const [value, setValue] = useState(0);
  const [content, setContent] = useState([]);
  const apiBaseUrl = process.env.API_BASE_URL;
  
  const handleChange = async (event, newValue) => {
    setValue(newValue);
    const tabName = event.target.getAttribute('name'); // Sekmenin adını al

    // API'den veri çekme
    try {
      const response = await fetch(`${apiBaseUrl}/content/byCategoryName/${tabName}`);
      if (!response.ok) {
        throw new Error('Veri çekme hatası');
      }
      const data = await response.json();
      setContent(data.docs); // İçeriği güncelle
    } catch (error) {
      console.error('API hatası:', error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
        <Tab label="Haberler" {...a11yProps(0)} name="haberler" />
        <Tab label="İKK Haberleri" {...a11yProps(1)} name="ikk-haberleri" />
        <Tab label="Basın Açıklamaları" {...a11yProps(2)} name="basin-aciklamalari" />
      </Tabs>
      <TabPanel value={value} index={0}>
        {/* İçeriği burada göster */}
        {content&& content?.map((item, index) => (
          <div key={index}>{item.title}</div>
        ))}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {/* İçeriği burada göster */}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {/* İçeriği burada göster */}
      </TabPanel>
    </Box>
  );
}

export default LeftSide;
