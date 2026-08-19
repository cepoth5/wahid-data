import { useState } from 'react';
import { useAssets } from '../context/AssetContext';
import { Search, Plus } from 'lucide-react';
import AssetDetail from './AssetDetail';

export default function Sidebar({ onLogout, onSelectAsset, selectedId, onAddAsset }) {
  const { assets } = useAssets();
  const [search, setSearch] = useState('');
  
  const productive = assets.filter(a => a.status === 'green').length;
  const attention = assets.filter(a => a.status === 'orange').length; // Or checking property_available etc.

  const filtered = assets.filter(a => 
    !search || [a.name, a.type, a.address || ''].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusMeta = (status) => {
    return {
      green: ['Produktif', '#2b9d70', '#e9f5ef'],
      orange: ['Perlu atensi', '#d88932', '#fbf0e3'],
      blue: ['Belum dinilai', '#518fcf', '#edf4fb'],
      red: ['Risiko tinggi', '#d75d58', '#fbeceb']
    }[status] || ['Unknown', '#888', '#eee'];
  };

  return (
    <aside className="h-[48dvh] md:h-full min-h-[320px] md:min-h-0 overflow-auto bg-[#fbfaf8] border-r border-[#e7e3da] flex flex-col z-[1200] relative">
      <header className="h-[58px] md:h-[70px] px-[14px] md:px-[18px] border-b border-[#e7e3da] flex items-center gap-[10px] shrink-0">
        <div className="w-[34px] h-[34px] md:w-[38px] md:h-[38px] rounded-[11px] bg-[#e5c271] text-[#26322c] grid place-items-center font-black text-[15px]">W</div>
        <div>
          <strong className="text-[13px] block">Wahid Group</strong>
          <span className="text-[9px] text-[#99938a]">Asset monitoring</span>
        </div>
        <button onClick={onLogout} className="ml-auto border-0 bg-transparent text-[#8e887f] text-[9px]">Keluar</button>
      </header>

      <div className="p-[14px_16px_10px] md:p-[24px_20px_16px]">
        <div className="text-[9px] font-black tracking-[1.5px] text-[#a08f72]">GOOD MORNING</div>
        <h2 className="text-[20px] md:text-[25px] -tracking-[1px] my-[4px] md:my-[6px] font-bold">Ruang aset Anda.</h2>
        <p className="text-[10px] md:text-[11px] text-[#8d887f] m-0 leading-relaxed">
          Kelola portofolio properti dan bank tanah dengan lebih cerdas.
        </p>
      </div>

      <div className="px-[14px] md:px-[18px] pb-[10px] md:pb-[14px] relative">
        <Search className="absolute left-[24px] md:left-[30px] top-[14px] md:top-[12px] w-4 h-4 text-[#999]" />
        <input 
          type="text" 
          placeholder="Cari aset..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-11 border border-[#ddd8ce] bg-white rounded-[9px] pl-[34px] pr-3 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none text-[12px]"
        />
      </div>

      <div className="mx-[14px] md:mx-[18px] mb-[10px] md:mb-[17px] grid grid-cols-3 border-y border-[#e7e3da]">
        <div className="text-center p-[12px_4px]">
          <small className="block text-[#9a948b] text-[8px] md:text-[7px]">Terdaftar</small>
          <strong className="text-[16px] md:text-[18px]">{assets.length}</strong>
        </div>
        <div className="text-center p-[12px_4px] border-l border-[#e7e3da]">
          <small className="block text-[#9a948b] text-[8px] md:text-[7px]">Produktif</small>
          <strong className="text-[16px] md:text-[18px] text-[#2b9d70]">{productive}</strong>
        </div>
        <div className="text-center p-[12px_4px] border-l border-[#e7e3da]">
          <small className="block text-[#9a948b] text-[8px] md:text-[7px]">Atensi</small>
          <strong className="text-[16px] md:text-[18px] text-[#d88932]">{attention}</strong>
        </div>
      </div>

      <section className="px-[14px] md:px-[18px]">
        <div className="flex justify-between text-[#8c857a] uppercase tracking-[1px] text-[9px] mb-2 font-bold">
          <b>Daftar aset</b><span>{filtered.length}</span>
        </div>
        <div className="flex flex-col gap-1">
          {filtered.map(a => {
            const [label, color, bg] = getStatusMeta(a.status);
            const isActive = selectedId === a.id;
            return (
              <button 
                key={a.id} 
                onClick={() => onSelectAsset(a.id)}
                className={`w-full flex items-center gap-[10px] p-2 border rounded-[11px] text-left transition-colors ${isActive ? 'bg-[#f0ece4] border-[#e0d7c7]' : 'border-transparent hover:bg-[#f0ece4] hover:border-[#e0d7c7]'}`}
              >
                <div className="w-[34px] h-[34px] md:w-[36px] md:h-[36px] grid place-items-center rounded-[9px] shrink-0" style={{background: bg}}>
                  {a.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-[10px] block whitespace-nowrap overflow-hidden text-ellipsis">{a.name}</strong>
                  <span className="block text-[#9b958c] text-[8px] mt-1">
                    <i className="inline-block w-[6px] h-[6px] rounded-full mr-[5px]" style={{background: color}}></i>
                    {label} · {a.area || 'Belum diukur'}
                  </span>
                </div>
                <b className="text-[17px] text-[#aaa39a] font-normal">›</b>
              </button>
            )
          })}
        </div>
      </section>

      <button onClick={onAddAsset} className="mx-[14px] md:mx-[18px] my-[10px] md:my-[17px] w-[calc(100%-28px)] md:w-[calc(100%-36px)] h-10 border border-dashed border-[#cfc4b3] bg-[#f8f4ec] rounded-[9px] text-[#786b59] text-[10px] font-black shrink-0 hover:bg-[#f0ece4]">
        ＋ Tambah aset & ukur lahan
      </button>

      <div className="border-t border-[#e7e3da] p-[14px] md:p-[18px] mt-auto">
        {!selectedId ? (
          <div className="text-center text-[#9b958c] p-[25px_10px]">
            <b className="block text-[#686259] text-[11px] my-2 font-bold">Pilih aset</b>
            <p className="text-[9px] m-0 leading-relaxed">Pilih dari daftar atau ketuk di peta.</p>
          </div>
        ) : (
          <AssetDetail assetId={selectedId} onEdit={() => {}} />
        )}
      </div>
    </aside>
  );
}
