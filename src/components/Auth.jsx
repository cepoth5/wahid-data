import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email === 'admin@wahid.local' && password === 'wahid123') {
      onLogin('admin'); 
      return;
    }
    if (email === 'surveyor@wahid.local' && password === 'wahid123') {
      onLogin('surveyor');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      onLogin(profile?.role || 'surveyor');
    } catch (err) {
      setError(err.message || 'Login failed. Try demo credentials: admin@wahid.local / wahid123 or surveyor@wahid.local / wahid123');
    }
  };

  return (
    <div className="h-full flex bg-[#f0ece4] md:grid md:grid-cols-[1.1fr_0.9fr]">
      <div className="hidden md:flex relative overflow-hidden p-[7vw] items-end text-white bg-gradient-to-br from-[#28352f] via-[#58634f] to-[#a88859]">
        <div className="absolute w-[600px] h-[600px] rounded-full -right-[230px] -top-[180px] bg-white/10" />
        <div className="relative z-10 max-w-[650px]">
          <div className="w-[52px] h-[52px] rounded-[15px] bg-[#e5c271] text-[#26322c] grid place-items-center font-black text-[22px]">
            W
          </div>
          <h1 className="text-[clamp(38px,5vw,70px)] leading-[0.98] -tracking-[3px] mt-7 mb-4">
            Kelola aset dengan lebih manusiawi.
          </h1>
          <p className="max-w-[520px] text-[#e8e8df] leading-relaxed">
            Satu ruang untuk melihat lokasi, batas lahan, luasan, legalitas, dan kondisi aset Wahid Group.
          </p>
        </div>
      </div>
      
      <form onSubmit={handleLogin} className="w-[min(430px,calc(100%-40px))] m-auto bg-white p-10 rounded-[24px] border border-[#e4ded2] shadow-[0_25px_80px_#493c2820]">
        <div className="text-[9px] font-black tracking-[1.5px] text-[#a08f72]">WAHID GROUP</div>
        <h2 className="text-[30px] mt-2 mb-2 -tracking-[1px] font-bold">Selamat datang kembali.</h2>
        <p className="text-[13px] text-[#88837a] mb-6">Masuk untuk membuka asset monitoring.</p>
        
        <label className="block text-[10px] font-black text-[#68645c] my-3">
          Email
          <input 
            type="email" 
            required 
            placeholder="nama@wahid.co.id" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none"
          />
        </label>
        
        <label className="block text-[10px] font-black text-[#68645c] my-3">
          Password
          <input 
            type="password" 
            required 
            placeholder="••••••••" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full h-11 border border-[#ddd8ce] bg-[#fbfaf7] rounded-[9px] px-3 mt-2 text-[#292822] focus:border-[#b99860] focus:ring-3 focus:ring-[#b9986015] outline-none"
          />
        </label>
        
        {error && <div className="mt-2 bg-[#fff0ee] text-[#a94e48] p-2 rounded-lg text-[10px]">{error}</div>}
        
        <button type="submit" className="w-full h-11 mt-4 border-0 rounded-[9px] bg-[#26332d] text-white font-black px-4 hover:bg-[#1a231f]">
          Masuk ke dashboard
        </button>
        
        <div className="text-[9px] text-[#aaa39a] text-center mt-3">
          Demo Admin: admin@wahid.local / wahid123 <br />
          Demo Surveyor: surveyor@wahid.local / wahid123
        </div>
      </form>
    </div>
  );
}
