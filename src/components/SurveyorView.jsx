import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import { Compass, Play, Square, RotateCcw, Save, ShieldAlert, LogOut } from 'lucide-react';
import * as turf from '@turf/turf';
import { useAssets } from '../context/AssetContext';
import 'leaflet/dist/leaflet.css';

// Component to dynamically update map center to surveyor's current position
function CenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export default function SurveyorView({ onLogout }) {
  const { addAsset } = useAssets();
  const [currentPos, setCurrentPos] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [path, setPath] = useState([]); // Array of [lat, lng]
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Land');
  
  const watchIdRef = useRef(null);

  // Watch position constantly for current location pointer & accuracy indicator
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("Geolocation tidak didukung oleh browser Anda.");
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy: acc } = position.coords;
      const newPos = [latitude, longitude];
      setCurrentPos(newPos);
      setAccuracy(acc);

      // If we are actively tracking and accuracy is high enough (< 6 meters)
      if (isTracking && acc <= 6) {
        setPath((prev) => {
          if (prev.length === 0) return [newPos];
          
          // Prevent logging duplicates if distance is less than 1.5 meters
          const lastPoint = prev[prev.length - 1];
          const from = turf.point([lastPoint[1], lastPoint[0]]);
          const to = turf.point([longitude, latitude]);
          const distanceMeters = turf.distance(from, to, { units: 'kilometers' }) * 1000;

          if (distanceMeters > 1.5) {
            return [...prev, newPos];
          }
          return prev;
        });
      }
    };

    const handleError = (error) => {
      console.error("Gagal mendapatkan lokasi GPS:", error.message);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isTracking]);

  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
      setPath([]); // Reset path for a new recording session
      setIsTracking(true);
    }
  };

  const handleReset = () => {
    if (confirm("Reset seluruh rute perekaman GPS?")) {
      setPath([]);
      setIsTracking(false);
    }
  };

  const calculateArea = () => {
    if (path.length < 3) return { sqm: 0, pretty: '0 m²' };
    
    // Turf requires coordinate sequence in [lng, lat] and closed polygon [first point = last point]
    const turfCoords = [...path.map(p => [p[1], p[0]]), [path[0][1], path[0][0]]];
    const poly = turf.polygon([turfCoords]);
    const sqm = Math.round(turf.area(poly));
    const pretty = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(sqm) + ' m²';
    return { sqm, pretty };
  };

  const handleSave = () => {
    if (path.length < 3) {
      alert("Minimal dibutuhkan 3 titik koordinat untuk membuat batas lahan.");
      return;
    }
    setShowSaveModal(true);
  };

  const submitAsset = () => {
    if (!assetName.trim()) {
      alert("Nama aset wajib diisi.");
      return;
    }

    const { sqm, pretty } = calculateArea();
    const ha = Number((sqm / 10000).toFixed(4));
    
    // Calculate geographic center
    const centerLat = path.reduce((sum, p) => sum + p[0], 0) / path.length;
    const centerLng = path.reduce((sum, p) => sum + p[1], 0) / path.length;

    const newAsset = {
      name: assetName.trim(),
      type: assetType,
      status: 'blue',
      owner: 'PT Putra Wahid Pratama',
      price: 'Belum diinput',
      value: 'Belum diinput',
      legal: 'Belum diinput',
      area: pretty,
      areaM2: sqm,
      areaHa: ha,
      center: [centerLat, centerLng],
      coordinates: path,
      updatedBy: 'Surveyor Lapangan'
    };

    // If land specific defaults
    if (assetType === 'Land') {
      newAsset.land_stage = 'Pematangan';
      newAsset.land_condition = 'Clear & Clean';
    }

    addAsset(newAsset);
    alert("Aset lapangan berhasil disimpan!");
    setPath([]);
    setAssetName('');
    setShowSaveModal(false);
  };

  const getAccuracyColor = () => {
    if (!accuracy) return 'bg-gray-400';
    if (accuracy <= 4) return 'bg-[#2b9d70]'; // Green (Excellent)
    if (accuracy <= 8) return 'bg-[#d88932]'; // Yellow/Orange (Moderate)
    return 'bg-[#d75d58]'; // Red (Poor)
  };

  const { pretty: currentAreaPretty } = calculateArea();

  return (
    <div className="flex flex-col h-[100dvh] bg-[#fbfaf8] overflow-hidden">
      {/* Mobile Top Header */}
      <header className="h-[60px] px-4 border-b border-[#e7e3da] bg-white flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e5c271] text-[#26322c] grid place-items-center font-black text-sm">W</div>
          <div>
            <h1 className="text-xs font-bold leading-tight">Peninjau Lahan</h1>
            <span className="text-[8px] text-[#8e887f] block uppercase tracking-wider">Wahid Field Surveyor</span>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 text-[#8e887f] hover:text-[#d75d58] transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Map Area */}
      <div className="flex-1 relative">
        <MapContainer
          center={currentPos || [-7.15, 110.45]}
          zoom={17}
          className="w-full h-full z-0"
          zoomControl={false}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
            maxZoom={19}
            maxNativeZoom={18}
          />
          
          {currentPos && <CenterMap coords={currentPos} />}
          
          {/* Current Pos Marker */}
          {currentPos && (
            <CircleMarker 
              center={currentPos} 
              radius={8} 
              pathOptions={{ fillColor: '#518fcf', fillOpacity: 0.8, color: '#white', weight: 2 }}
            >
              <Popup>Posisi Anda saat ini (Akurasi: ±{accuracy?.toFixed(1)}m)</Popup>
            </CircleMarker>
          )}

          {/* Tracked Polyline */}
          {path.length > 0 && (
            <Polyline
              positions={path}
              pathOptions={{ color: '#b48842', weight: 4, dashArray: '5, 5' }}
            />
          )}

          {/* Filled Polygon (when we have 3+ points) */}
          {path.length >= 3 && (
            <Polygon
              positions={path}
              pathOptions={{ color: '#2b9d70', fillColor: '#2b9d70', fillOpacity: 0.25, weight: 2 }}
            />
          )}
        </MapContainer>

        {/* GPS Accuracy Pill */}
        <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-[#fffdf9e8] backdrop-blur-md px-3 py-2 rounded-xl border border-[#ffffffaa] shadow-sm">
          <span className={`w-3 h-3 rounded-full ${getAccuracyColor()} animate-pulse`} />
          <div className="text-[9px] font-black text-[#5d574e]">
            {accuracy ? `AKURASI GPS: ±${accuracy.toFixed(1)}m` : 'MENCARI GPS...'}
          </div>
        </div>

        {/* Dynamic Area Indicator */}
        {path.length >= 3 && (
          <div className="absolute top-4 right-4 z-[1000] bg-[#fffdf9e8] backdrop-blur-md px-3 py-2 rounded-xl border border-[#ffffffaa] shadow-sm text-right">
            <span className="block text-[7px] font-bold text-[#8c857b] uppercase">LUAS SEMENTARA</span>
            <strong className="block text-[14px] text-[#a7792d]">{currentAreaPretty}</strong>
          </div>
        )}
      </div>

      {/* Surveyor GPS Controls */}
      <div className="p-4 bg-white border-t border-[#e7e3da] shrink-0 flex flex-col gap-3 shadow-lg z-[1000]">
        <div className="text-[8px] font-black tracking-[1px] text-[#8e887f] text-center">
          {isTracking 
            ? '🔴 SEDANG MEREKAM - BERJALANLAH MENGELILINGI BATAS LAHAN' 
            : '💡 JALAN KE SUDUT LAHAN, LALU TEKAN MULAI UNTUK MEREKAM'}
        </div>
        
        <div className="flex gap-2">
          {/* Main Toggle Button */}
          <button
            onClick={toggleTracking}
            className={`flex-1 h-14 rounded-xl flex items-center justify-center gap-2 font-black text-[11px] text-white shadow-md transition-colors ${
              isTracking 
                ? 'bg-[#d75d58] hover:bg-[#c3514c]' 
                : 'bg-[#26332d] hover:bg-[#1f2924]'
            }`}
          >
            {isTracking ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                JEDA PEREKAMAN
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                MULAI GPS TRACKING
              </>
            )}
          </button>

          {/* Reset button */}
          {path.length > 0 && (
            <button
              onClick={handleReset}
              className="w-14 h-14 rounded-xl bg-[#eeeae3] hover:bg-[#e4ded2] flex items-center justify-center text-[#5d574e] shadow-inner transition-colors"
              title="Reset Rute"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Lock / Save Button */}
          {path.length >= 3 && !isTracking && (
            <button
              onClick={handleSave}
              className="w-14 h-14 rounded-xl bg-[#2b9d70] hover:bg-[#23815c] text-white flex items-center justify-center shadow-md transition-colors"
              title="Simpan Batas Aset"
            >
              <Save className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Simplified Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[9999] bg-[#2c271f66] backdrop-blur-[6px] flex items-end justify-center">
          <div className="w-full bg-[#fffdfa] rounded-t-[18px] p-6 shadow-xl max-h-[80vh] overflow-auto pb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[8px] font-black tracking-wider text-[#a08f72] uppercase">KUNCI DATA</span>
                <h2 className="text-lg font-black -tracking-wide">Simpan Batas GPS</h2>
              </div>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="w-8 h-8 rounded-lg bg-[#f0ece5] text-[#777] font-bold"
              >×</button>
            </div>

            <div className="bg-[#f2eee7] p-3 rounded-lg flex justify-between items-center mb-4">
              <div>
                <span className="text-[7px] text-[#8e887b] block uppercase">LUAS AKHIR</span>
                <strong className="text-lg text-[#a7792d]">{currentAreaPretty}</strong>
              </div>
              <div className="text-right">
                <span className="text-[7px] text-[#8e887b] block uppercase">JUMLAH TITK GPS</span>
                <strong className="text-sm text-[#5d574e]">{path.length} Titik</strong>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="block text-[9px] font-black text-[#68645c]">
                Nama Aset Lapangan
                <input 
                  type="text" 
                  value={assetName} 
                  onChange={e => setAssetName(e.target.value)} 
                  placeholder="Contoh: Tanah Baru Sidorejo" 
                  className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] outline-none"
                />
              </label>

              <label className="block text-[9px] font-black text-[#68645c]">
                Kategori Aset
                <select 
                  value={assetType} 
                  onChange={e => setAssetType(e.target.value)}
                  className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] outline-none"
                >
                  <option>Land</option>
                  <option>Residential / Property</option>
                  <option>Commercial</option>
                  <option>Other</option>
                </select>
              </label>

              <button 
                onClick={submitAsset}
                className="w-full h-12 mt-4 bg-[#26332d] text-white text-[10px] font-black rounded-lg shadow-md"
              >
                SIMPAN DAN KIRIM KE DATABASE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
