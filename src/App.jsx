import { useState } from 'react';
import { AssetProvider } from './context/AssetContext';
import Auth from './components/Auth';
import Sidebar from './components/Sidebar';
import AssetMap from './components/Map';
import AssetModal from './components/AssetModal';
import SurveyorView from './components/SurveyorView';

function Dashboard({ onLogout }) {
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [polygonData, setPolygonData] = useState(null);

  const handleAddAsset = (drawnPolygonData = null) => {
    // If drawnPolygonData is event object from button click, null it
    if (drawnPolygonData && drawnPolygonData.type) {
      drawnPolygonData = null;
    }
    setPolygonData(drawnPolygonData);
    setSelectedAssetId(null);
    setShowModal(true);
  };

  return (
    <div className="flex flex-col md:grid md:grid-cols-[390px_1fr] h-[100dvh] bg-[#f4f1ea] overflow-hidden">
      <Sidebar 
        onLogout={onLogout} 
        selectedId={selectedAssetId} 
        onSelectAsset={setSelectedAssetId} 
        onAddAsset={handleAddAsset}
      />
      <AssetMap 
        selectedId={selectedAssetId}
        onSelectAsset={setSelectedAssetId} 
        onAddAsset={handleAddAsset}
      />
      {showModal && (
        <AssetModal 
          assetId={selectedAssetId} 
          polygonData={polygonData} 
          onClose={() => {
            setShowModal(false);
            setPolygonData(null);
          }} 
        />
      )}
    </div>
  );
}

export default function App() {
  const [userRole, setUserRole] = useState(null);

  if (!userRole) {
    return <Auth onLogin={setUserRole} />;
  }

  const handleLogout = () => {
    setUserRole(null);
  };

  return (
    <AssetProvider>
      {userRole === 'admin' ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <SurveyorView onLogout={handleLogout} />
      )}
    </AssetProvider>
  );
}
