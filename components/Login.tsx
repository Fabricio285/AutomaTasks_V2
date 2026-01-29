import React, { useState } from 'react';
import { User } from '../types.ts';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin }) => {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(x => x.username === u && x.password === p);
    if (user) onLogin(user);
    else setErr('Credenciales incorrectas');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">🏗️ TaskFlow</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full p-3 border rounded-xl" placeholder="Usuario" value={u} onChange={e => setU(e.target.value)} required />
          <input className="w-full p-3 border rounded-xl" type="password" placeholder="Clave" value={p} onChange={e => setP(e.target.value)} required />
          {err && <p className="text-red-500 text-sm font-bold">{err}</p>}
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">Entrar</button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Admin: admin / 14569</p>
      </div>
    </div>
  );
};
