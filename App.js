import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { createClient } from '@supabase/supabase-js';

const html = htm.bind(React.createElement);

// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://mlzavdukbvxwhxetgftj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semF2ZHVrYnZ4d2h4ZXRnZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Nzc4OTAsImV4cCI6MjA4NTI1Mzg5MH0.fQp_VY1-omgx8uqaGtauugkhxdxXoKBm3VuzbMdumqM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- COMPONENTES ---

const Login = ({ users, onLogin }) => {
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
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <h1 className="text-3xl font-black text-center text-indigo-700 mb-8 tracking-tighter">TaskFlow</h1>
        <form onSubmit=${handleSubmit} className="space-y-4">
          <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Usuario" value=${u} onChange=${e => setU(e.target.value)} required />
          <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" type="password" placeholder="Contraseña" value=${p} onChange=${e => setP(e.target.value)} required />
          ${err && html`<p className="text-red-500 text-xs font-bold text-center">${err}</p>`}
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">Ingresar</button>
        </form>
      </div>
    </div>
  `;
};

const AdminDashboard = ({ users, setUsers }) => {
  const [modal, setModal] = useState({ show: false, mode: 'create', user: null });
  const [form, setForm] = useState({ username: '', password: '', role: 'USER' });

  const handleSave = async (e) => {
    e.preventDefault();
    if (modal.mode === 'edit') {
      const { data, error } = await supabase.from('users').update(form).eq('id', modal.user.id).select();
      if (!error) setUsers(users.map(u => u.id === modal.user.id ? data[0] : u));
    } else {
      const { data, error } = await supabase.from('users').insert([form]).select();
      if (!error) setUsers([...users, ...data]);
    }
    setModal({ show: false });
  };

  const deleteUser = async (id) => {
    if (confirm('¿Eliminar usuario?')) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (!error) setUsers(users.filter(u => u.id !== id));
    }
  };

  return html`
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
        <button onClick=${() => { setForm({username:'', password:'', role:'USER'}); setModal({show:true, mode:'create'}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold">+ Nuevo</button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
            <tr><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4 text-right">Acciones</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            ${users.map(u => html`
              <tr key=${u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">${u.username}</td>
                <td className="p-4"><span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">${u.role}</span></td>
                <td className="p-4 text-right space-x-3">
                  <button onClick=${() => { setForm({username:u.username, password:u.password, role:u.role}); setModal({show:true, mode:'edit', user:u}); }} className="text-indigo-600 text-xs font-bold">Editar</button>
                  <button onClick=${() => deleteUser(u.id)} className="text-red-500 text-xs font-bold">Eliminar</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>
      </div>
      ${modal.show && html`
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-6">${modal.mode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}</h3>
            <form onSubmit=${handleSave} className="space-y-4">
              <input className="w-full p-3 border rounded-xl" placeholder="Nombre" value=${form.username} onChange=${e => setForm({...form, username: e.target.value})} required />
              <input className="w-full p-3 border rounded-xl" type="password" placeholder="Clave" value=${form.password} onChange=${e => setForm({...form, password: e.target.value})} required />
              <select className="w-full p-3 border rounded-xl" value=${form.role} onChange=${e => setForm({...form, role: e.target.value})}>
                <option value="USER">Operario</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex gap-2">
                <button type="button" onClick=${() => setModal({show:false})} className="flex-1 py-2 bg-slate-100 rounded-xl font-bold">Cerrar</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
};

// --- APLICACIÓN PRINCIPAL ---

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('users').select('*').then(({ data }) => {
      setUsers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return html`<div className="h-screen flex items-center justify-center font-bold text-indigo-600">Cargando Sistema...</div>`;
  if (!currentUser) return html`<${Login} users=${users} onLogin=${setCurrentUser} />`;

  return html`
    <div className="min-h-screen flex flex-col">
      <nav className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <h1 className="font-black text-indigo-700 tracking-tighter">TASKFLOW</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-slate-500">${currentUser.username} (${currentUser.role})</span>
          <button onClick=${() => setCurrentUser(null)} className="text-red-500 font-bold text-xs uppercase">Salir</button>
        </div>
      </nav>
      <main className="p-6 max-w-4xl mx-auto w-full">
        ${currentUser.role === 'ADMIN' 
          ? html`<${AdminDashboard} users=${users} setUsers=${setUsers} />`
          : html`<div className="text-center p-20 bg-white rounded-3xl border border-dashed border-slate-300 font-bold text-slate-400">Panel de Operario (En Construcción)</div>`
        }
      </main>
    </div>
  `;
};

export default App;