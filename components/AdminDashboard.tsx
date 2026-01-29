import React, { useState } from 'react';
import { User, Task, Role, TaskStatus, AppSettings } from '../types';
import { formatDuration } from '../utils/time';
import { supabase } from '../lib/supabase';

interface Props { 
  users: User[]; 
  setUsers: React.Dispatch<React.SetStateAction<User[]>>; 
  tasks: Task[]; 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>; 
  settings: AppSettings; 
}

export const AdminDashboard: React.FC<Props> = ({ users, setUsers, tasks, setTasks, settings }) => {
  const [tab, setTab] = useState<'U' | 'T' | 'E'>('U');
  
  // Modales y formularios
  const [userModal, setUserModal] = useState<{show: boolean, editId: string | null}>({show: false, editId: null});
  const [taskModal, setTaskModal] = useState(false);
  
  const [userForm, setUserForm] = useState({ username: '', password: '', role: Role.USER });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', estimatedHours: 1 });

  // --- Lógica de Usuarios ---
  const openEditUser = (u: User) => {
    setUserForm({ username: u.username, password: u.password || '', role: u.role });
    setUserModal({ show: true, editId: u.id });
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userModal.editId) {
      const { data, error } = await supabase.from('users').update(userForm).eq('id', userModal.editId).select();
      if (!error && data) {
        setUsers(prev => prev.map(u => u.id === userModal.editId ? data[0] : u));
      }
    } else {
      const { data, error } = await supabase.from('users').insert([userForm]).select();
      if (!error && data) {
        setUsers(prev => [...prev, data[0]]);
      }
    }
    setUserModal({ show: false, editId: null });
    setUserForm({ username: '', password: '', role: Role.USER });
  };

  // --- Lógica de Tareas ---
  const saveTask = async (e: React.FormEvent) => {
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
      const mapped: Task = {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description,
        assignedTo: data[0].assigned_to,
        status: data[0].status as TaskStatus,
        estimatedHours: data[0].estimated_hours,
        createdAt: data[0].created_at,
        progressNotes: data[0].progress_notes
      };
      setTasks(prev => [...prev, mapped]);
      setTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', estimatedHours: 1 });
    } else {
      alert("Error al crear tarea: " + error?.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navegación de pestañas */}
      <div className="flex gap-2 overflow-x-auto border-b pb-1">
        <button onClick={() => setTab('U')} className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${tab === 'U' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-200'}`}>Usuarios</button>
        <button onClick={() => setTab('T')} className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${tab === 'T' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-200'}`}>Gestión Obras</button>
        <button onClick={() => setTab('E')} className={`px-4 py-2 rounded-t-lg transition-colors whitespace-nowrap ${tab === 'E' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-slate-200'}`}>Estadísticas Eficiencia</button>
      </div>

      {/* VISTA USUARIOS */}
      {tab === 'U' && (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Personal Registrado</h3>
             <button onClick={() => { setUserForm({username:'', password:'', role: Role.USER}); setUserModal({show: true, editId: null}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">+ Nuevo Usuario</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 text-xs uppercase">
                <tr><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4 text-right">Acciones</th></tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-4 font-semibold text-indigo-900">{u.username}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs ${u.role === Role.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span></td>
                    <td className="p-4 text-right space-x-3">
                      <button onClick={() => openEditUser(u)} className="text-indigo-600 hover:underline text-sm font-medium">Editar</button>
                      <button onClick={async () => {
                        if(confirm('¿Seguro que desea eliminar este usuario?')) {
                          await supabase.from('users').delete().eq('id', u.id);
                          setUsers(prev => prev.filter(x => x.id !== u.id));
                        }
                      }} className="text-red-500 hover:underline text-sm font-medium">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA TAREAS */}
      {tab === 'T' && (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
             <h3 className="font-bold text-slate-700">Listado de Obras y Tareas</h3>
             <button onClick={() => setTaskModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold">+ Crear Nueva Obra</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map(t => {
              const assignedUser = users.find(u => u.id === t.assignedTo)?.username || 'Sin asignar';
              return (
                <div key={t.id} className="border rounded-xl p-4 bg-slate-50 flex flex-col space-y-2 relative group">
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      t.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                      t.status === TaskStatus.ACCEPTED ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>{t.status}</span>
                    <button onClick={async () => { if(confirm('¿Borrar tarea?')) { await supabase.from('tasks').delete().eq('id', t.id); setTasks(p => p.filter(x => x.id !== t.id)); } }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                  <h4 className="font-bold text-indigo-900 truncate">{t.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 h-8">{t.description}</p>
                  
                  {t.progressNotes && (
                    <div className="bg-white p-2 rounded border border-slate-200 mt-2">
                       <p className="text-[9px] font-bold text-slate-400 uppercase">Avances Reportados:</p>
                       <p className="text-[10px] text-slate-600 italic line-clamp-3">{t.progressNotes}</p>
                    </div>
                  )}

                  <div className="pt-2 mt-auto border-t flex justify-between items-center text-xs">
                    <span className="font-medium">Responsable: <span className="text-indigo-600">{assignedUser}</span></span>
                    <span className="bg-white px-2 py-1 border rounded">{t.estimatedHours}h est.</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA ESTADÍSTICAS */}
      {tab === 'E' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-xl shadow border text-center">
                <p className="text-sm text-slate-500 uppercase font-bold">Total Tareas</p>
                <p className="text-4xl font-black text-indigo-600">{tasks.length}</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow border text-center">
                <p className="text-sm text-slate-500 uppercase font-bold">Completadas</p>
                <p className="text-4xl font-black text-emerald-600">{tasks.filter(t => t.status === TaskStatus.COMPLETED).length}</p>
             </div>
             <div className="bg-white p-6 rounded-xl shadow border text-center">
                <p className="text-sm text-slate-500 uppercase font-bold">Pendientes</p>
                <p className="text-4xl font-black text-amber-500">{tasks.filter(t => t.status !== TaskStatus.COMPLETED).length}</p>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow border p-6">
            <h3 className="font-bold text-lg mb-4">Análisis de Eficiencia por Obra</h3>
            <div className="space-y-6">
              {tasks.filter(t => t.status === TaskStatus.COMPLETED).length === 0 && <p className="text-slate-400 text-center py-10">No hay tareas completadas para analizar todavía.</p>}
              {tasks.filter(t => t.status === TaskStatus.COMPLETED).map(t => {
                const estMinutes = t.estimatedHours * 60;
                const realMinutes = t.realDurationMinutes || 0;
                const diff = estMinutes - realMinutes;
                const efficiency = Math.round((estMinutes / (realMinutes || 1)) * 100);
                
                return (
                  <div key={t.id} className="space-y-3 border-b pb-6 last:border-0">
                    <div className="flex justify-between items-end">
                      <div>
                        <h4 className="font-bold text-slate-800">{t.title}</h4>
                        <p className="text-xs text-slate-500">Responsable: {users.find(u => u.id === t.assignedTo)?.username}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${efficiency >= 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {efficiency}% Eficiencia
                        </span>
                        <p className="text-[10px] text-slate-400">
                          {diff >= 0 ? `Ganaste ${formatDuration(diff)}` : `Perdiste ${formatDuration(Math.abs(diff))}`}
                        </p>
                      </div>
                    </div>
                    
                    {/* Barra de progreso visual */}
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-indigo-500 h-full flex items-center justify-center text-[8px] text-white font-bold" 
                        style={{ width: `${Math.min(100, (estMinutes / (estMinutes + (realMinutes || 1))) * 100)}%` }}
                      >EST.</div>
                      <div 
                        className={`${realMinutes > estMinutes ? 'bg-red-400' : 'bg-emerald-400'} h-full flex items-center justify-center text-[8px] text-white font-bold`} 
                        style={{ width: `${Math.min(100, (realMinutes / (estMinutes + (realMinutes || 1))) * 100)}%` }}
                      >REAL</div>
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 px-1">
                      <span>Estimado: {t.estimatedHours}h</span>
                      <span>Real: {formatDuration(realMinutes)}</span>
                    </div>

                    {t.progressNotes && (
                      <div className="p-3 bg-slate-50 border rounded-lg">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Notas del Reporte Final:</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic">"{t.progressNotes}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL USUARIO */}
      {userModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <form onSubmit={saveUser} className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-indigo-900">{userModal.editId ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nombre de Usuario</label>
                <input className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition-all" value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
                <input className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition-all" type="text" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Privilegios</label>
                <select className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none transition-all" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as Role})}>
                   <option value={Role.USER}>Trabajador (User)</option>
                   <option value={Role.ADMIN}>Administrador</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setUserModal({show: false, editId: null})} className="flex-1 border-2 border-slate-100 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cancelar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL TAREA */}
      {taskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <form onSubmit={saveTask} className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-indigo-900">Crear Nueva Obra</h2>
            <div className="space-y-4">
              <input className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none" placeholder="Título de la Obra" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required />
              <textarea className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none h-24" placeholder="Instrucciones o descripción" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} required />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Horas Estimadas</label>
                  <input type="number" min="1" className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none" value={taskForm.estimatedHours} onChange={e => setTaskForm({...taskForm, estimatedHours: Number(e.target.value)})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Responsable</label>
                  <select className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} required>
                     <option value="">Seleccionar...</option>
                     {users.filter(u => u.role === Role.USER).map(u => (
                       <option key={u.id} value={u.id}>{u.username}</option>
                     ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setTaskModal(false)} className="flex-1 border-2 border-slate-100 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50">Cerrar</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700">Asignar Obra</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
