import React, { useState } from 'react';
import { html } from 'htm';
import { Role, TaskStatus } from '../types.js';
import { formatDuration } from '../utils/time.js';
import { supabase } from '../lib/supabase.js';

export const AdminDashboard = ({ users, setUsers, tasks, setTasks, settings }) => {
  const [tab, setTab] = useState('U');
  const [userModal, setUserModal] = useState({show: false, editId: null});
  const [taskModal, setTaskModal] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: Role.USER });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', estimatedHours: 1 });

  const saveUser = async (e) => {
    e.preventDefault();
    try {
      if (userModal.editId) {
        const { data, error } = await supabase.from('users').update(userForm).eq('id', userModal.editId).select();
        if (error) throw error;
        setUsers(prev => prev.map(u => u.id === userModal.editId ? data[0] : u));
      } else {
        const { data, error } = await supabase.from('users').insert([userForm]).select();
        if (error) throw error;
        setUsers(prev => [...prev, data[0]]);
      }
      setUserModal({ show: false, editId: null });
    } catch (err) { alert('Error al guardar usuario'); }
  };

  const deleteUser = async (id) => {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (!error) setUsers(prev => prev.filter(u => u.id !== id));
    else alert('No se pudo eliminar el usuario.');
  };

  const saveTask = async (e) => {
    e.preventDefault();
    const newTask = {
      title: taskForm.title,
      description: taskForm.description,
      assigned_to: taskForm.assignedTo,
      estimated_hours: taskForm.estimatedHours,
      status: TaskStatus.PENDING,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('tasks').insert([newTask]).select();
    if (!error && data) {
      setTasks(prev => [...prev, {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        assignedTo: data[0].assigned_to,
        status: data[0].status,
        estimatedHours: data[0].estimated_hours,
        createdAt: data[0].created_at
      }]);
      setTaskModal(false);
    }
  };

  return html`
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-slate-200">
        <button onClick=${() => setTab('U')} className=${`pb-4 px-2 text-sm font-bold transition-all ${tab === 'U' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Gestión de Personal</button>
        <button onClick=${() => setTab('T')} className=${`pb-4 px-2 text-sm font-bold transition-all ${tab === 'T' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>Control de Obras</button>
      </div>

      ${tab === 'U' && html`
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Listado de Usuarios</h3>
            <button onClick=${() => {setUserForm({username:'', password:'', role:Role.USER}); setUserModal({show:true, editId:null})}} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700">+ Nuevo Usuario</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 uppercase text-[10px] tracking-widest border-b">
                  <th className="pb-3">Usuario</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                ${users.map(u => html`
                  <tr key=${u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-medium text-slate-700">${u.username}</td>
                    <td className="py-4">
                      <span className=${`px-2 py-0.5 rounded-full text-[10px] font-bold ${u.role === Role.ADMIN ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                        ${u.role}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-3">
                      <button onClick=${() => {setUserForm({username:u.username, password:u.password, role:u.role}); setUserModal({show:true, editId:u.id})}} className="text-indigo-600 hover:text-indigo-800 font-bold">Editar</button>
                      <button onClick=${() => deleteUser(u.id)} className="text-red-400 hover:text-red-600">Eliminar</button>
                    </td>
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>
      `}

      ${tab === 'T' && html`
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Proyectos Activos</h3>
            <button onClick=${() => setTaskModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700">+ Abrir Obra</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${tasks.map(t => html`
              <div key=${t.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">${t.title}</h4>
                  <span className=${`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : t.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    ${t.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">${t.description}</p>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 pt-4 border-t border-slate-50">
                   <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>${users.find(u => u.id == t.assignedTo)?.username || 'Sin asignar'}</span>
                   </div>
                   <span>${t.estimatedHours}H ESTIMADAS</span>
                </div>
              </div>
            `)}
          </div>
        </div>
      `}

      ${userModal.show && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <form onSubmit=${saveUser} className="bg-white p-8 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">${userModal.editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nombre de Usuario</label>
              <input className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value=${userForm.username} onChange=${e => setUserForm({...userForm, username: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Contraseña</label>
              <input className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" type="password" value=${userForm.password} onChange=${e => setUserForm({...userForm, password: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Nivel de Acceso</label>
              <select className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white" value=${userForm.role} onChange=${e => setUserForm({...userForm, role: e.target.value})}>
                <option value=${Role.USER}>Trabajador (Operario)</option>
                <option value=${Role.ADMIN}>Administrador (Control)</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick=${() => setUserModal({show:false, editId:null})} className="flex-1 bg-slate-100 text-slate-600 p-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </div>
      `}

      ${taskModal && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <form onSubmit=${saveTask} className="bg-white p-8 rounded-3xl w-full max-w-md space-y-5 shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Nueva Obra / Tarea</h2>
            <input className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Nombre de la Obra" value=${taskForm.title} onChange=${e => setTaskForm({...taskForm, title: e.target.value})} required />
            <textarea className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 h-24" placeholder="Detalles o requerimientos técnicos..." value=${taskForm.description} onChange=${e => setTaskForm({...taskForm, description: e.target.value})} required />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Horas Est.</label>
                <input type="number" className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" value=${taskForm.estimatedHours} onChange=${e => setTaskForm({...taskForm, estimatedHours: Number(e.target.value)})} required />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Responsable</label>
                <select className="w-full border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white" value=${taskForm.assignedTo} onChange=${e => setTaskForm({...taskForm, assignedTo: e.target.value})} required>
                  <option value="">Seleccionar...</option>
                  ${users.filter(u => u.role === Role.USER).map(u => html`<option key=${u.id} value=${u.id}>${u.username}</option>`)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick=${() => setTaskModal(false)} className="flex-1 bg-slate-100 text-slate-600 p-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">Cerrar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-3 rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700">Asignar Obra</button>
            </div>
          </form>
        </div>
      `}
    </div>
  `;
};