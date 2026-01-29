import React, { useState } from 'react';
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
    if (userModal.editId) {
      const { data, error } = await supabase.from('users').update(userForm).eq('id', userModal.editId).select();
      if (!error && data) setUsers(prev => prev.map(u => u.id === userModal.editId ? data[0] : u));
    } else {
      const { data, error } = await supabase.from('users').insert([userForm]).select();
      if (!error && data) setUsers(prev => [...prev, data[0]]);
    }
    setUserModal({ show: false, editId: null });
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

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b">
        <button onClick={() => setTab('U')} className={`p-2 ${tab === 'U' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}>Usuarios</button>
        <button onClick={() => setTab('T')} className={`p-2 ${tab === 'T' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}>Obras</button>
      </div>

      {tab === 'U' && (
        <div className="bg-white p-4 rounded shadow">
          <button onClick={() => {setUserForm({username:'', password:'', role:Role.USER}); setUserModal({show:true, editId:null})}} className="bg-indigo-600 text-white px-4 py-2 rounded mb-4">+ Nuevo</button>
          <table className="w-full text-left">
            <thead><tr className="border-b"><th>Usuario</th><th>Rol</th><th>Acciones</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b">
                  <td className="py-2">{u.username}</td>
                  <td className="py-2">{u.role}</td>
                  <td className="py-2 space-x-2">
                    <button onClick={() => {setUserForm({username:u.username, password:u.password, role:u.role}); setUserModal({show:true, editId:u.id})}} className="text-indigo-600">Editar</button>
                    <button onClick={async () => { if(confirm('Eliminar?')) { await supabase.from('users').delete().eq('id', u.id); setUsers(p => p.filter(x => x.id !== u.id)); } }} className="text-red-500">X</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'T' && (
        <div className="bg-white p-4 rounded shadow">
          <button onClick={() => setTaskModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded mb-4">+ Nueva Obra</button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(t => (
              <div key={t.id} className="border p-4 rounded relative">
                <h4 className="font-bold">{t.title}</h4>
                <p className="text-sm opacity-60">{t.description}</p>
                <div className="mt-2 text-xs flex justify-between">
                   <span>{t.status}</span>
                   <span>{t.estimatedHours}h est.</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {userModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={saveUser} className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h2 className="text-xl font-bold">Gestión de Usuario</h2>
            <input className="w-full border p-2 rounded" placeholder="Nombre" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
            <input className="w-full border p-2 rounded" placeholder="Clave" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
            <select className="w-full border p-2 rounded" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})}>
              <option value={Role.USER}>Trabajador</option>
              <option value={Role.ADMIN}>Admin</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setUserModal({show:false, editId:null})} className="flex-1 border p-2 rounded">Cerrar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-2 rounded">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {taskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={saveTask} className="bg-white p-6 rounded-xl w-full max-w-md space-y-4">
            <h2 className="text-xl font-bold">Nueva Obra</h2>
            <input className="w-full border p-2 rounded" placeholder="Título" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
            <textarea className="w-full border p-2 rounded" placeholder="Descripción" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} required />
            <input type="number" className="w-full border p-2 rounded" placeholder="Horas" value={taskForm.estimatedHours} onChange={e => setTaskForm({...taskForm, estimatedHours: Number(e.target.value)})} required />
            <select className="w-full border p-2 rounded" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} required>
              <option value="">Asignar a...</option>
              {users.filter(u => u.role === Role.USER).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTaskModal(false)} className="flex-1 border p-2 rounded">Cerrar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-2 rounded">Crear</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};