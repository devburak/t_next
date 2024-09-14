import React, { useEffect, useState,useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon ,useMap} from 'react-leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import PopupContent from './popupContent';



const MapComponent = ({ center, zoom, markers, polylines, polygons}) => {
    // const [position, setPosition] = useState(() => map.getCenter())
    // const [map, setMap] = useState(null); // Harita nesnesi için state

    // useEffect(() => {
    //     console.log(map)
    //     if (map) {
    //         map.setView(center, zoom); // Harita nesnesi varsa, merkez ve zoom seviyesini güncelle
    //     }
    // }, [map, center, zoom]); // map, center veya zoom değişikliklerinde tetikle

    // const [position, setPosition] = useState(map.getCenter())
    // const onMove = useCallback(() => {
    //     setPosition(map.getCenter())
    //   }, [map])
    
    //   useEffect(() => {
    //     map.on('move', onMove)
    //     return () => {
    //       map.off('move', onMove)
    //     }
    //   }, [map, onMove])

    function MapView() {
        let map = useMap();
        map.setView(center, zoom);
         //Sets geographical center and zoom for the view of the map
        return null;
      }

      const mapRef = useRef(null);

      useEffect(() => {
        if (mapRef.current && mapRef.current.setView) { // Check if mapRef.current exists and has setView
            mapRef.current.setView(center, zoom); // Use mapRef.current.setView to access the map
        } else {
            console.error("Map instance not yet available or setView method not found.");
        }
    }, [center, zoom]); // Update map view on center or zoom changes

    return (
        <MapContainer 
            center={center} 
            zoom={zoom} 
            style={{ height: '80vh', width: '100%' }} 
            ref={mapRef}
            // whenCreated={setMap} // Harita oluşturulduğunda, harita nesnesini setMap ile state'e kaydet
             whenCreated={(map) => setMap(map)}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {markers && markers.map((marker, idx) => (
                <Marker key={idx} position={marker.position}>
                    <Popup>
                        <PopupContent {...marker.popupContent} />
                    </Popup>
                </Marker>
            ))}
            {polylines && polylines.map((line, idx) => (
                <Polyline key={idx} positions={line.positions} color={line.color}>
                    <Popup>
                        <PopupContent {...line.popupContent} />
                    </Popup>
                </Polyline>
            ))}
            {polygons && polygons.map((polygon, idx) => (
                <Polygon key={idx} positions={polygon.positions} color={polygon.color}>
                    <Popup>
                        <PopupContent {...polygon.popupContent} />
                    </Popup>
                </Polygon>
            ))}
            <MapView />
        </MapContainer>
    );
};

export default MapComponent;
