import { useAssets } from '../context/AssetContext';

export default function AssetDetail({ assetId, onEdit }) {
  const { assets, deleteAsset } = useAssets();
  const asset = assets.find(a => a.id === assetId);

  if (!asset) return null;

  const getStatusMeta = (status) => {
    return {
      green: ['Produktif', '#2b9d70', '#e9f5ef'],
      orange: ['Perlu atensi', '#d88932', '#fbf0e3'],
      blue: ['Belum dinilai', '#518fcf', '#edf4fb'],
      red: ['Risiko tinggi', '#d75d58', '#fbeceb']
    }[status] || ['Unknown', '#888', '#eee'];
  };

  const [label, color, bg] = getStatusMeta(asset.status);

  // Property stock calculation
  const totalStock = asset.type.includes('Property') 
    ? (Number(asset.property_sold || 0) + Number(asset.property_installment || 0) + Number(asset.property_available || 0)) 
    : 0;

  return (
    <div>
      <div className="flex justify-between gap-2 items-start">
        <div>
          <div className="text-[9px] font-black tracking-[1.5px] text-[#a08f72] uppercase">DETAIL ASET</div>
          <h2 className="text-[15px] md:text-[18px] m-0 mt-1 -tracking-[0.3px] font-bold">{asset.icon} {asset.name}</h2>
        </div>
        <span className="text-[8px] font-black px-2 py-1 rounded-[6px] h-max" style={{color, background: bg}}>
          {label}
        </span>
      </div>

      {asset.type.includes('Land') && (
        <div className="flex gap-2 mt-3">
          {asset.land_stage && <span className="bg-[#e4e0d7] text-[#555] px-2 py-1 text-[8px] rounded-md font-bold">{asset.land_stage}</span>}
          {asset.land_condition && (
            <span className={`px-2 py-1 text-[8px] rounded-md font-bold ${
              asset.land_condition === 'Clear & Clean' ? 'bg-[#e9f5ef] text-[#2b9d70]' :
              asset.land_condition === 'Diduduki' ? 'bg-[#fbf0e3] text-[#d88932]' : 'bg-[#fbeceb] text-[#d75d58]'
            }`}>
              {asset.land_condition}
            </span>
          )}
        </div>
      )}

      {asset.type.includes('Property') && totalStock > 0 && (
        <div className="mt-4 p-3 bg-white border border-[#e7e3da] rounded-[9px]">
          <div className="flex justify-between text-[8px] text-[#888] font-bold mb-1">
            <span>STOK UNIT ({totalStock})</span>
          </div>
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-[#eee]">
            <div style={{ width: `${(asset.property_sold / totalStock) * 100}%` }} className="bg-[#2b9d70]" title={`Laku: ${asset.property_sold}`} />
            <div style={{ width: `${(asset.property_installment / totalStock) * 100}%` }} className="bg-[#d88932]" title={`Dicicil: ${asset.property_installment}`} />
            <div style={{ width: `${(asset.property_available / totalStock) * 100}%` }} className="bg-[#518fcf]" title={`Sisa: ${asset.property_available}`} />
          </div>
          <div className="flex justify-between text-[7px] mt-2 font-bold">
            <span className="text-[#2b9d70]">LAKU: {asset.property_sold}</span>
            <span className="text-[#d88932]">CICIL: {asset.property_installment}</span>
            <span className="text-[#518fcf]">SISA: {asset.property_available}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-2 gap-[6px] mt-3">
        <div className="p-2 rounded-[8px] bg-[#f3efe8]">
          <small className="block text-[#9a9389] text-[8px] mb-1">Pemilik</small>
          <strong className="text-[9px] leading-[1.4]">{asset.owner || '—'}</strong>
        </div>
        <div className="p-2 rounded-[8px] bg-[#f3efe8]">
          <small className="block text-[#9a9389] text-[8px] mb-1">Legalitas</small>
          <strong className="text-[9px] leading-[1.4]">{asset.legal || '—'}</strong>
        </div>
        <div className="p-2 rounded-[8px] bg-[#f3efe8]">
          <small className="block text-[#9a9389] text-[8px] mb-1">Luas terukur</small>
          <strong className="text-[9px] leading-[1.4]">{asset.area || '—'}</strong>
        </div>
        <div className="p-2 rounded-[8px] bg-[#f3efe8]">
          <small className="block text-[#9a9389] text-[8px] mb-1">Nilai / m²</small>
          <strong className="text-[9px] leading-[1.4]">{asset.price || '—'}</strong>
        </div>
        <div className="col-span-2 p-2 rounded-[8px] bg-[#f3efe8]">
          <small className="block text-[#9a9389] text-[8px] mb-1">Estimasi nilai aset</small>
          <strong className="text-[9px] leading-[1.4] text-[#ae7e30]">{asset.value || '—'}</strong>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[6px] mt-3">
        <button className="h-[36px] border border-[#ddd6ca] rounded-[8px] bg-white text-[#655e55] text-[8px] font-black hover:bg-[#f5f1e9]" onClick={onEdit}>
          ✏ Edit data
        </button>
        <button 
          className="h-[36px] border border-[#e7c5c0] rounded-[8px] bg-[#fff6f4] text-[#b64e48] text-[8px] font-black hover:bg-[#fce7e4]"
          onClick={() => {
            if(confirm(`Hapus ${asset.name}?`)) deleteAsset(asset.id);
          }}
        >
          🗑 Hapus
        </button>
      </div>
      
      <div className="mt-[10px] pt-[9px] border-t border-[#e7e1d7] text-[#989187] text-[8px] leading-[1.6]">
        Dibuat: {new Date(asset.created_at).toLocaleDateString('id-ID')}
      </div>
    </div>
  );
}
