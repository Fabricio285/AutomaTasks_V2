import React, { useState } from 'react';
import htm from 'htm';
import { Role } from '../types.js';
import { supabase } from '../lib/supabase.js';

const html = htm.bind(React.createElement);

export const AdminDashboard = ({ users, setUsers, tasks, setTasks }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [modal, setModal] = useState({ show: false, mode: 'create', user: null });
  const [form, setForm] = useState({ username: '', password: '', role: Role.USER });

  const handleOpenModal = (mode, user = null) => {
    setModal({ show: true, mode, user });
    if (user) {
      setForm({ username: user.username, password: user.password || '', role: user.role });
    } else {
      setForm({ username: '', password: '', role: Role.USER });
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      if (modal.mode === 'edit') {
        const { data, error } = await supabase
          .from('users')
          .update({ username: form.username, password: form.password, role: form.role })
          .eq('id', modal.user.id)
          .select();
        
        if (error) throw error;
        setUsers(users.map(u => u.id === modal.user.id ? data[0] : u));
      } else {
        const { data, error } = await supabase
          .from('users')
          .insert([form])
          .select();
        
        if (error) throw error;
        setUsers([...users, ...data]);
      }
      setModal({ show: false, mode: 'create', user: null });
    } catch (err) {
      alert('Error al procesar la solicitud');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  return html`
    <div className="space-y-6">
      <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit">
        <button onClick=${() => setActiveTab('users')} className=${`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Usuarios</button>
        <button onClick=${() => setActiveTab('tasks')} className=${`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Proyectos</button>
      </div>

      ${activeTab === 'users' ? html`
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Gestión de Personal</h2>
              <p className="text-xs text-slate-500">Administra operarios y accesos</p>
            </div>
            <button onClick=${() => handleOpenModal('create')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95">+ Nuevo Usuario</button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              ${users.map(u => html`
                <tr key=${u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700">${u.username}</td>
                  <td className="px-6 py-4">
                    <span className=${`px-2 py-1 rounded-md text-[10px] font-bold ${u.role === Role.ADMIN ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>${u.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick=${() => handleOpenModal('edit', u)} className="text-indigo-600 font-bold text-xs">Editar</button>
                    <button onClick=${() => handleDeleteUser(u.id)} className="text-red-400 font-bold text-xs">Borrar</button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      ` : html`
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${tasks.map(t => html`
            <div key=${t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-1">${t.title}</h3>
              <p className="text-xs text-slate-500">${t.description}</p>
            </div>
          `)}
        </div>
      `}

      ${modal.show && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8">
            <h2 className="text-2xl font-black text-slate-800 mb-6">${modal.mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</h2>
            <form onSubmit=${handleSaveUser} className="space-y-4">
              <input className="w-full bg-slate-50 p-3 rounded-xl outline-none" placeholder="Usuario" value=${form.username} onChange=${e => setForm({...form, username: e.target.value})} required />
              <input className="w-full bg-slate-50 p-3 rounded-xl outline-none" type="password" placeholder="Contraseña" value=${form.password} onChange=${e => setForm({...form, password: e.target.value})} required=${modal.mode === 'create'} />
              <select className="w-full bg-slate-50 p-3 rounded-xl outline-none" value=${form.role} onChange=${e => setForm({...form, role: e.target.value})}>
                <option value=${Role.USER}>Trabajador</option>
                <option value=${Role.ADMIN}>Administrador</option>
              </select>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick=${() => setModal({show: false})} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      `}
    </div>
  `;
};