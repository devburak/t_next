

import { useState, useMemo, useEffect } from 'react';
import Layout from '@/component/basic/layout';
import dynamic from 'next/dynamic';
import ListComponent from '@/component/map/listComponent';
import SearchComponent from '@/component/map/searchComponent';
import { Divider } from '@mui/material';
import {normalizeText} from "../component/utils"

// import {  TileLayer } from 'react-leaflet';
const MapWithNoSSR = dynamic(() => import('@/component/map'), {
    ssr: false
});


const initialCenter = [39.92077, 32.85411];
const initialZoom = 9;
const desiredZoomLevel = 15;

const MapPage = () => {


    const markers = [
        {
            id: 'm1',
            position: [39.92077, 32.85411],
            popupContent: {
                title: "Ankara Merkez",
                content: "Bu Ankara'nın merkezidir.",
                files: [
                    { name: 'Dosya 1', link: '#' },
                    // Diğer dosyalar...
                ]
            },
            categories: ["Kent Suçları"]
        },
        // Diğer markerlar...
    ];

    const polygons = [
        {
            id: 'p1',
            positions: [
                [38.430200, 27.144481], // Kültürpark'ın kuzeybatı köşesi yakını
                [38.429308, 27.150206], // Kültürpark'ın kuzeydoğu köşesi yakını
                [38.425202, 27.149837], // Kültürpark'ın güneydoğu köşesi yakını
                [38.425991, 27.143669], // Kültürpark'ın güneybatı köşesi yakını
                [38.430200, 27.144481]  // Poligonu kapatmak için ilk noktayı tekrar ekliyoruz
            ],
            color: 'blue',
            popupContent: {
                title: "İzmir Kültürpark",
                content: "İzmir Kültürpark renavasyon ....",
                files: [
                    { name: 'Dosya 2', link: '#' }
                    // Diğer dosyalar...
                ]
            },
            categories: ["Kent Suçları"]
        }
        // Diğer alanlar...
    ];


    const polylines = [
        {
            id: 'l1',
            positions: [
                [40.991500, 29.027000], // Kadıköy Rıhtım Caddesi'nin başlangıç noktası yakını
                [40.990500, 29.026000], // Kadıköy Rıhtım Caddesi'nin bitiş noktası yakını
                // Gerekirse diğer noktalar...
            ],
            weight: 8, // Çizgi kalınlığını artırma
            color: 'red',
            popupContent: {
                title: "Kadıköy",
                content: "Bu Kadıköy'de bir çizginin içeriğidir.",
                files: [
                    { name: 'Dosya 1', link: '#' },
                    // Diğer dosyalar...
                ]
            },
            categories: ["Kent Suçları", "Eko Kırım"]

        },
        {
            id: 'l2',
            positions: [
              [41.2244, 32.6839], // Karadeniz sahil yolunun başlangıç noktası
              [41.2868, 31.7857], // Karadeniz sahil yolunun bitiş noktası
              // Daha fazla nokta eklenebilir...
            ],
            weight: 8, // Çizgi kalınlığı
            color: 'blue', // Çizgi rengi
            popupContent: {
              title: "Karadeniz Sahil Yolu",
              content: "Bu, Karadeniz sahil yolunun temsili bir rotasıdır.",
              files: [
                { name: 'Dosya 2', link: '#' },
                // Diğer dosyalar...
              ]
            },
            categories: ["TMMOB Davaları", "Eko Kırım"]
          }
          
        // Diğer polylines...
    ];

    const [mapCenter, setMapCenter] = useState(initialCenter);
    const [zoomLevel, setZoomLevel] = useState(initialZoom);
    const [ items, setItems] = useState([...polylines,...markers,...polygons]); 

    // Harita nesnesi state'i (MapWithNoSSR içinden alınır)
    const [map, setMap] = useState(null);

    const onSearch = (searchText, category="all") => {
        const filteredItems = [...polylines, ...markers, ...polygons].filter((item) => {
          const matchesCategory = category === 'all' || item.categories.includes(category);
          const matchesSearchText = normalizeText(item.popupContent.title).includes(normalizeText(searchText));
          return matchesCategory && matchesSearchText;
        });
      
        setItems(filteredItems); // Filtrelenmiş öğeleri state'e ata
      };
      

    const focusOnPoint = (position) => {
        console.log(position)
        setMapCenter(position);
        setZoomLevel(desiredZoomLevel);
    };

    useEffect(() => {
        console.log(map); // map state'i her güncellendiğinde çalışır

    }, [map]);


    return (
        <Layout LeftSide={<>
            <SearchComponent onSearch={onSearch} />
            <Divider />
            <ListComponent
                items={items}
                onItemSelect={focusOnPoint}
            /></>}>

            <MapWithNoSSR
                center={mapCenter}
                zoom={zoomLevel}
                scrollWheelZoom={false}
                ref={setMap}

                markers={markers} polylines={polylines} polygons={polygons}
            >

            </MapWithNoSSR>



        </Layout>
    );
};

export default MapPage;
