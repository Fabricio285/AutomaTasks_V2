import React, { useState } from 'react';
import { User, Task, Role, TaskStatus, AppSettings } from '../types';
import { formatDuration } from '../utils/time';
import { supabase } from '../lib/supabase';

interface Props { users: User[]; setUsers: any; tasks: Task[]; setTasks: any; settings: AppSettings; }

export const AdminDashboard: React.FC<Props> = ({ users, setUsers, tasks, setTasks }) => {
  const [tab, setTab] = useState<'U' | 'T'>('U');
  const [modal, setModal] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', password: '', role: Role.USER });

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('users').insert([userForm]).select();
    if (!error && data) {
      setUsers((p: any) => [...p, data[0]]);
      setModal(false);
      setUserForm({ username: '', password: '', role: Role.USER });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b">
        <button onClick={() => setTab('U')} className={`p-3 ${tab === 'U' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}>Usuarios</button>
        <button onClick={() => setTab('T')} className={`p-3 ${tab === 'T' ? 'border-b-2 border-indigo-600 font-bold' : ''}`}>Tareas</button>
      </div>

      {tab === 'U' ? (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-4 bg-slate-50 flex justify-between">
             <h3 className="font-bold">Usuarios en Servidor</h3>
             <button onClick={() => setModal(true)} className="bg-indigo-600 text-white px-3 py-1 rounded">+ Nuevo</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs">
              <tr><th className="p-4">Nombre</th><th className="p-4">Rol</th><th className="p-4">Acción</th></tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="p-4 font-bold">{u.username}</td>
                  <td className="p-4">{u.role}</td>
                  <td className="p-4">
                    <button onClick={async () => {
                      if(confirm('¿Borrar?')) {
                        await supabase.from('users').delete().eq('id', u.id);
                        setUsers((p: any) => p.filter((x:any) => x.id !== u.id));
                      }
                    }} className="text-red-500">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow p-4 text-center">Gestión de Tareas activa. Selecciona usuarios para asignar nuevas obras.</div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <form onSubmit={saveUser} className="bg-white p-6 rounded-xl w-full max-w-sm space-y-4">
            <h2 className="font-bold">Nuevo Usuario</h2>
            <input className="w-full border p-2 rounded" placeholder="Nombre" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
            <input className="w-full border p-2 rounded" placeholder="Clave" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
            <select className="w-full border p-2 rounded" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as Role})}>
               <option value={Role.USER}>Usuario</option>
               <option value={Role.ADMIN}>Admin</option>
            </select>
            <div className="flex gap-2">
              <button type="button" onClick={() => setModal(false)} className="flex-1 border p-2 rounded">Cerrar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white p-2 rounded">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};