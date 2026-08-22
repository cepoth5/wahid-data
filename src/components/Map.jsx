import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';
import '@geoman-io/leaflet-geoman-free';
import * as turf from '@turf/turf';
import { useAssets } from '../context/AssetContext';

const SALATIGA_CENTER = [-7.15, 110.45];

function GeomanInit({ onDrawCreated, isDrawing, setIsDrawing }) {
  const map = useMap();

  useEffect(() => {
    if (isDrawing) {
      map.pm.enableDraw('Polygon');
    } else {
      map.pm.disableDraw();
    }
  }, [isDrawing, map]);

  useEffect(() => {
    map.pm.addControls({
      position: 'topleft',
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawRectangle: false,
      drawCircle: false,
      drawText: false,
      editMode: true,
      dragMode: false,
      cutPolygon: true,
      removalMode: true,
      drawPolygon: true,
    });
    
    // Set custom styles for drawing
    map.pm.setPathOptions({
      color: '#b48842',
      fillColor: '#d4ad67',
      fillOpacity: 0.35,
      weight: 3,
    });

    map.on('pm:create', (e) => {
      const layer = e.layer;
      const geojson = layer.toGeoJSON();
      const area = turf.area(geojson);
      const m2 = Math.round(area);
      const ha = Number((area / 10000).toFixed(4));
      
      const coords = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
      const center = coords.reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0]);
      center[0] /= coords.length;
      center[1] /= coords.length;

      setIsDrawing(false);

      onDrawCreated({
        coordinates: coords,
        center: center,
        areaM2: m2,
        areaHa: ha,
        area: new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(area) + ' m²',
      }, layer);
    });

    return () => {
      map.pm.removeControls();
      map.off('pm:create');
    };
  }, [map, onDrawCreated, setIsDrawing]);

  return null;
}

export default function AssetMap({ selectedId, onSelectAsset, onAddAsset, isDrawing, setIsDrawing }) {
  const { assets, updateAsset } = useAssets();
  const [base, setBase] = useState('satellite');
  const mapRef = useRef(null);

  const getStatusMeta = (status) => {
    return {
      green: ['Produktif', '#2b9d70', '#e9f5ef'],
      orange: ['Perlu atensi', '#d88932', '#fbf0e3'],
      blue: ['Belum dinilai', '#518fcf', '#edf4fb'],
      red: ['Risiko tinggi', '#d75d58', '#fbeceb']
    }[status] || ['Unknown', '#888', '#eee'];
  };

  const handleDrawCreated = (polygonData, layer) => {
    // Remove the temp layer drawn by Geoman, as it will be managed by React state once saved
    layer.remove();
    onAddAsset(polygonData); // Pass to parent to show modal
  };

  useEffect(() => {
    if (selectedId && mapRef.current) {
      const asset = assets.find(a => a.id === selectedId);
      if (asset && asset.center) {
        mapRef.current.flyTo(asset.center, 16, { duration: 1 });
      }
    }
  }, [selectedId, assets]);

  return (
    <main className="relative h-[62vh] md:h-full w-full overflow-hidden order-1 md:order-2">
      <div className="absolute z-[1000] right-[9px] md:right-[15px] top-[9px] md:top-[15px] flex gap-[6px] pointer-events-auto items-center">
        <div className="hidden md:flex flex-col bg-[#fffdf9e8] backdrop-blur-[12px] shadow-[0_10px_30px_#4b3d2917] border border-[#ffffffb0] p-[6px_10px] rounded-[8px] text-left">
          <strong className="block text-[10px] leading-tight font-bold">Peta aset</strong>
          <span className="block text-[#8f887e] text-[7px] mt-[1px]">Salatiga & sekitarnya</span>
        </div>
        <button 
          onClick={() => mapRef.current?.flyTo(SALATIGA_CENTER, 11, {duration: 1})}
          className="h-[36px] md:h-[37px] rounded-[8px] px-[8px] md:px-[11px] border border-[#ffffffaa] bg-[#fffdf9e8] text-[#5d574e] text-[8px] md:text-[9px] font-black"
        >⌂ Overview</button>
        <button 
          onClick={() => setBase(b => b === 'satellite' ? 'street' : 'satellite')}
          className="h-[36px] md:h-[37px] rounded-[8px] px-[8px] md:px-[11px] border border-[#ffffffaa] bg-[#fffdf9e8] text-[#5d574e] text-[8px] md:text-[9px] font-black"
        >◉ {base === 'satellite' ? 'Street' : 'Satellite'}</button>
      </div>

      <MapContainer 
        center={SALATIGA_CENTER} 
        zoom={11} 
        className="absolute inset-0 z-0" 
        ref={mapRef}
        zoomControl={false} // Geoman and zoom controls can be placed custom
      >
        {base === 'satellite' ? (
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" maxZoom={19} maxNativeZoom={18} />
        ) : (
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" maxZoom={19} />
        )}

        <GeomanInit 
          onDrawCreated={handleDrawCreated} 
          isDrawing={isDrawing} 
          setIsDrawing={setIsDrawing} 
        />

        {assets.map(a => {
          if (!a.coordinates || a.coordinates.length < 3) return null;
          const [, color] = getStatusMeta(a.status);
          
          return (
            <Polygon 
              key={a.id} 
              positions={a.coordinates} 
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.38, weight: 3 }}
              eventHandlers={{
                click: () => onSelectAsset(a.id),
                // Handle edits if we want to allow Geoman to edit existing react-leaflet polygons
                pmUpdate: (e) => {
                  const layer = e.layer;
                  const geojson = layer.toGeoJSON();
                  const area = turf.area(geojson);
                  const coords = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
                  const center = coords.reduce((acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]], [0, 0]);
                  center[0] /= coords.length;
                  center[1] /= coords.length;
                  
                  updateAsset(a.id, {
                    coordinates: coords,
                    center: center,
                    areaM2: Math.round(area),
                    areaHa: Number((area / 10000).toFixed(4)),
                    area: new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(area) + ' m²',
                  });
                }
              }}
            >
              <Tooltip sticky><strong>{a.icon} {a.name}</strong></Tooltip>
            </Polygon>
          );
        })}
      </MapContainer>

      <div className="absolute z-[1000] right-[9px] md:right-[15px] bottom-[9px] md:bottom-[15px] p-[8px] md:p-[10px] rounded-[9px] bg-[#fffdf9e8] text-[#716a61] text-[8px] shadow-[0_10px_30px_#4b3d2917] hidden md:block">
        <b className="block uppercase tracking-[0.8px] mb-[7px]">Status aset</b>
        <span className="block mt-[5px]"><i className="inline-block w-[6px] h-[6px] rounded-full mr-[6px] bg-[#2b9d70]"></i>Produktif</span>
        <span className="block mt-[5px]"><i className="inline-block w-[6px] h-[6px] rounded-full mr-[6px] bg-[#d88932]"></i>Perlu atensi</span>
        <span className="block mt-[5px]"><i className="inline-block w-[6px] h-[6px] rounded-full mr-[6px] bg-[#518fcf]"></i>Belum dinilai</span>
      </div>
    </main>
  );
}
