import "@/styles/globals.css";
import "../styles/fs.css";
import "../styles/custom.css";
// import 'leaflet/dist/leaflet.css';
import '../component/editor/themes/PlaygroundEditorTheme.css';
import 'react-calendar/dist/Calendar.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
