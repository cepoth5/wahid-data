import { useState, useEffect } from 'react';
import { useAssets } from '../context/AssetContext';

export default function AssetModal({ assetId, onClose, polygonData }) {
  const { assets, addAsset, updateAsset } = useAssets();
  const existingAsset = assetId ? assets.find(a => a.id === assetId) : null;

  const [formData, setFormData] = useState({
    name: '', type: 'Residential / Property', status: 'blue',
    owner: '', legal: '', price: '', value: '', address: '',
    property_sold: 0, property_installment: 0, property_available: 0,
    land_stage: 'Landbank', land_condition: 'Clear & Clean'
  });

  useEffect(() => {
    if (existingAsset) {
      setFormData(prev => ({ ...prev, ...existingAsset }));
    }
  }, [existingAsset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (existingAsset) {
      updateAsset(existingAsset.id, formData);
    } else {
      addAsset({
        ...formData,
        ...polygonData // includes coordinates, area, center
      });
    }
    onClose();
  };

  const isProperty = formData.type.includes('Property');
  const isLand = formData.type.includes('Land');

  return (
    <div className="fixed inset-0 z-[9999] bg-[#2c271f66] backdrop-blur-[6px] flex items-center md:items-center items-end justify-center md:p-[18px]">
      <form onSubmit={handleSubmit} className="w-full md:w-[min(540px,100%)] max-h-[92vh] overflow-auto bg-[#fffdfa] border border-[#e5dfd5] rounded-t-[18px] md:rounded-[19px] p-[24px] shadow-[0_30px_90px_#33271935]">
        <div className="flex justify-between gap-[15px] mb-[17px]">
          <div>
            <div className="text-[9px] font-black tracking-[1.5px] text-[#a08f72]">{existingAsset ? 'EDIT ASSET' : 'UKUR & DAFTARKAN'}</div>
            <h2 className="text-[20px] md:text-[23px] my-[5px] -tracking-[1px] font-bold">{existingAsset ? 'Perbarui informasi' : 'Tambah aset baru'}</h2>
          </div>
          <button type="button" onClick={onClose} className="w-[31px] h-[31px] border-0 rounded-[8px] bg-[#f0ece5] text-[#777] text-[18px]">×</button>
        </div>

        {polygonData && (
          <div className="p-[13px] rounded-[10px] bg-[#f2eee7] mb-[14px]">
            <small className="block text-[#8c857b] text-[8px] font-bold">LUAS TERUKUR</small>
            <strong className="block text-[23px] mt-[4px] text-[#a7792d]">{polygonData.area || '0 m²'}</strong>
          </div>
        )}

        <label className="block text-[9px] md:text-[10px] font-black text-[#68645c] my-3">
          Nama aset
          <input name="name" required value={formData.name} onChange={handleChange} placeholder="Contoh: Diponegoro Regency" className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none" />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="block text-[9px] md:text-[10px] font-black text-[#68645c] my-3">
            Kategori
            <select name="type" value={formData.type} onChange={handleChange} className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none">
              <option>Residential / Property</option>
              <option>Hotel / Hospitality</option>
              <option>Land</option>
              <option>Commercial</option>
              <option>Other</option>
            </select>
          </label>
          <label className="block text-[9px] md:text-[10px] font-black text-[#68645c] my-3">
            Status
            <select name="status" value={formData.status} onChange={handleChange} className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none">
              <option value="blue">Belum dinilai</option>
              <option value="green">Produktif / Aman</option>
              <option value="orange">Perlu atensi</option>
              <option value="red">Risiko tinggi</option>
            </select>
          </label>
        </div>

        {/* Dynamic Fields */}
        {isProperty && (
          <div className="p-3 bg-[#e9f0f5] border border-[#d2e0eb] rounded-[9px] my-2">
            <div className="text-[9px] font-black text-[#518fcf] mb-2">PROPERTI - STOK UNIT</div>
            <div className="grid grid-cols-3 gap-2">
              <label className="block text-[9px] font-black text-[#68645c]">Laku <input type="number" name="property_sold" value={formData.property_sold} onChange={handleChange} className="w-full h-9 border border-[#ddd8ce] bg-white rounded-[6px] px-2 mt-1 outline-none" /></label>
              <label className="block text-[9px] font-black text-[#68645c]">Dicicil <input type="number" name="property_installment" value={formData.property_installment} onChange={handleChange} className="w-full h-9 border border-[#ddd8ce] bg-white rounded-[6px] px-2 mt-1 outline-none" /></label>
              <label className="block text-[9px] font-black text-[#68645c]">Sisa <input type="number" name="property_available" value={formData.property_available} onChange={handleChange} className="w-full h-9 border border-[#ddd8ce] bg-white rounded-[6px] px-2 mt-1 outline-none" /></label>
            </div>
          </div>
        )}

        {isLand && (
          <div className="p-3 bg-[#f5efe9] border border-[#ebdcd2] rounded-[9px] my-2">
            <div className="text-[9px] font-black text-[#b48842] mb-2">LAHAN - KONDISI KHUSUS</div>
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-[9px] font-black text-[#68645c]">Tahap Kesiapan
                <select name="land_stage" value={formData.land_stage} onChange={handleChange} className="w-full h-9 border border-[#ddd8ce] bg-white rounded-[6px] px-2 mt-1 outline-none">
                  <option>Pembebasan</option><option>Landbank</option><option>Pematangan</option><option>Siap Bangun</option>
                </select>
              </label>
              <label className="block text-[9px] font-black text-[#68645c]">Kondisi Lahan
                <select name="land_condition" value={formData.land_condition} onChange={handleChange} className="w-full h-9 border border-[#ddd8ce] bg-white rounded-[6px] px-2 mt-1 outline-none">
                  <option>Clear & Clean</option><option>Diduduki</option><option>Sengketa</option>
                </select>
              </label>
            </div>
          </div>
        )}

        <label className="block text-[9px] md:text-[10px] font-black text-[#68645c] my-3">
          Pemilik
          <input name="owner" value={formData.owner} onChange={handleChange} className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none" />
        </label>
        
        <label className="block text-[9px] md:text-[10px] font-black text-[#68645c] my-3">
          Alamat
          <input name="address" value={formData.address} onChange={handleChange} className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none" />
        </label>

        <div className="flex justify-end gap-[7px] mt-[15px] md:sticky md:bottom-0 bg-[#fffdfa] pt-2 pb-2">
          <button type="button" onClick={onClose} className="h-[42px] border-0 rounded-[8px] px-[15px] bg-[#eeeae3] text-[#6f685f] text-[9px] font-black flex-1 md:flex-none">Batal</button>
          <button type="submit" className="h-[42px] border-0 rounded-[8px] px-[15px] bg-[#26332d] text-white text-[9px] font-black flex-1 md:flex-none">Simpan aset</button>
        </div>
      </form>
    </div>
  );
}
