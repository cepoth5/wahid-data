import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { defaultAssets } from '../lib/defaultData'; // We'll create this

const AssetContext = createContext();

export function AssetProvider({ children }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  async function fetchAssets() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('assets').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        setAssets(data);
      } else {
        // Fallback to local storage if DB is empty or mock
        loadLocalAssets();
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local storage:", err.message);
      loadLocalAssets();
    } finally {
      setLoading(false);
    }
  }

  function loadLocalAssets() {
    const saved = localStorage.getItem('wahid_assets_v5');
    if (saved) {
      setAssets(JSON.parse(saved));
    } else {
      setAssets(defaultAssets);
      localStorage.setItem('wahid_assets_v5', JSON.stringify(defaultAssets));
    }
  }

  async function addAsset(asset) {
    const newAsset = { ...asset, id: `asset-${Date.now()}`, created_at: new Date().toISOString() };
    try {
      const { error } = await supabase.from('assets').insert([newAsset]);
      if (error) throw error;
      setAssets(prev => [...prev, newAsset]);
    } catch (err) {
      // Local fallback
      const updated = [...assets, newAsset];
      setAssets(updated);
      localStorage.setItem('wahid_assets_v5', JSON.stringify(updated));
    }
  }

  async function updateAsset(id, updates) {
    try {
      const { error } = await supabase.from('assets').update(updates).eq('id', id);
      if (error) throw error;
      setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    } catch (err) {
      // Local fallback
      const updated = assets.map(a => a.id === id ? { ...a, ...updates } : a);
      setAssets(updated);
      localStorage.setItem('wahid_assets_v5', JSON.stringify(updated));
    }
  }

  async function deleteAsset(id) {
    try {
      const { error } = await supabase.from('assets').delete().eq('id', id);
      if (error) throw error;
      setAssets(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      // Local fallback
      const updated = assets.filter(a => a.id !== id);
      setAssets(updated);
      localStorage.setItem('wahid_assets_v5', JSON.stringify(updated));
    }
  }

  return (
    <AssetContext.Provider value={{ assets, loading, addAsset, updateAsset, deleteAsset, fetchAssets }}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssets() {
  return useContext(AssetContext);
}
