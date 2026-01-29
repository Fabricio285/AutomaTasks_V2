import React, { useState } from 'react';
import htm from 'htm';

const html = htm.bind(React.createElement);

export const Login = ({ users, onLogin }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = users.find(x => x.username === u && x.password === p);
    if (user) onLogin(user);
    else setErr('Credenciales incorrectas');
  };

  return html`
    <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-black text-center text-indigo-700 mb-2 tracking-tighter italic">TaskFlow</h1>
        <p className="text-center text-slate-400 text-xs mb-8 uppercase tracking-widest">Gestión de Producción</p>
        <form onSubmit=${handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Usuario</label>
            <input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="admin" value=${u} onChange=${e => setU(e.target.value)} required />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contraseña</label>
            <input className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" type="password" placeholder="••••••" value=${p} onChange=${e => setP(e.target.value)} required />
          </div>
          ${err && html`<p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">${err}</p>`}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">Entrar al Sistema</button>
        </form>
        <div className="mt-8 pt-6 border-t border-slate-100">
           <p className="text-center text-[9px] text-slate-300">DEMO ACCESS: admin / 14569</p>
        </div>
      </div>
    </div>
  `;
};