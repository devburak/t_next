import React from 'react';
import { CampaignProvider } from '../component/campaign/CampaignContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import "@/styles/globals.css";
import "../styles/fs.css";
import "../styles/custom.css";
// // import 'leaflet/dist/leaflet.css';
// import '../component/editor/themes/PlaygroundEditorTheme.css';
// import '../component/LX/nodes/ImageNode.css'; // Diğer stil dosyaları
// import '../component/LX/nodes/InlineImageNode.css' // Diğer stil dosyaları
// import '../component/LX/nodes/PageBreakNode/index.css'
// import 'react-calendar/dist/Calendar.css';
// import '../component/LX/nodes/PollNode.css';
// import '../component/LX/nodes/StickyNode.css';
// import '../component/LX/plugins/FloatingLinkEditorPlugin/index.css';
// import '../component/LX/plugins/FloatingTextFormatToolbarPlugin/index.css';
// import '../component/LX/themes/PlaygroundEditorTheme.css';
// import '../component/LX/themes/StickyEditorTheme.css';
// import '../component/LX/ui/Button.css';
// import '../component/LX/ui/ContentEditable.css';
// import '../component/LX/ui/Placeholder.js';
// import '../component/LX/ui/Input.css';
// import '../component/LX/ui/Select.css';


export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CampaignProvider>
      {/* CssBaseline, tarayıcı stil sıfırlaması ve temel stilleri ekler */}
      <CssBaseline />
      <Component {...pageProps} />
      </CampaignProvider>
    </ThemeProvider>
  );
}
