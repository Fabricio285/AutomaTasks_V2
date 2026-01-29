import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { createClient } from '@supabase/supabase-js';

const html = htm.bind(React.createElement);

// --- CONFIGURACIÓN SUPABASE ---
const SUPABASE_URL = 'https://mlzavdukbvxwhxetgftj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1semF2ZHVrYnZ4d2h4ZXRnZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Nzc4OTAsImV4cCI6MjA4NTI1Mzg5MH0.fQp_VY1-omgx8uqaGtauugkhxdxXoKBm3VuzbMdumqM';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- CONSTANTES Y VALORES POR DEFECTO ---
const Role = { ADMIN: 'ADMIN', USER: 'USER' };
const TaskStatus = { PENDING: 'PENDING', ACCEPTED: 'ACCEPTED', COMPLETED: 'COMPLETED' };
const VERSION = "V1.3.0";

const DEFAULT_WORKING_DAYS = {
  0: { enabled: false, start: '08:00', end: '17:00' },
  1: { enabled: true, start: '08:00', end: '17:00' },
  2: { enabled: true, start: '08:00', end: '17:00' },
  3: { enabled: true, start: '08:00', end: '17:00' },
  4: { enabled: true, start: '08:00', end: '17:00' },
  5: { enabled: true, start: '08:00', end: '17:00' },
  6: { enabled: false, start: '08:00', end: '17:00' }
};

// --- UTILS ---
const formatDuration = (ms) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const calculateEfficiency = (estimatedHours, acceptedAt, completedAt) => {
  if (!acceptedAt || !completedAt || !estimatedHours) return 100;
  const actualMs = new Date(completedAt) - new Date(acceptedAt);
  const estimatedMs = estimatedHours * 60 * 60 * 1000;
  
  if (actualMs <= estimatedMs) return 100;
  return Math.max(0, Math.round((estimatedMs / actualMs) * 100));
};

// --- COMPONENTES ---

const Timer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(new Date() - new Date(startTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return html`
    <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
      <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>
      <span className="text-xs font-black text-indigo-700 font-mono tracking-widest">${formatDuration(elapsed)}</span>
    </div>
  `;
};

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
        <h1 className="text-3xl font-black text-center text-indigo-700 mb-2 tracking-tighter italic uppercase">Automatizacion</h1>
        <p className="text-center text-slate-400 text-[10px] uppercase tracking-widest mb-8">Control de Operaciones Cloud</p>
        <form onSubmit=${handleSubmit} className="space-y-4">
          <input className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50" placeholder="Usuario" value=${u} onChange=${e => setU(e.target.value)} required />
          <input className="w-full p-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-slate-50" type="password" placeholder="Contraseña" value=${p} onChange=${e => setP(e.target.value)} required />
          ${err && html`<p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">${err}</p>`}
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">Ingresar</button>
        </form>
      </div>
    </div>
  `;
};

const SettingsPanel = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings?.working_days || DEFAULT_WORKING_DAYS);
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const toggleDay = (i) => {
    const nd = { ...local };
    nd[i] = { ...nd[i], enabled: !nd[i].enabled };
    setLocal(nd);
  };

  const setTime = (i, field, val) => {
    const nd = { ...local };
    nd[i] = { ...nd[i], [field]: val };
    setLocal(nd);
  };

  return html`
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-black mb-6 flex items-center gap-2">
        <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
        Configuración de Horarios
      </h2>
      <div className="space-y-3">
        ${days.map((name, i) => {
          const config = local[i] || { enabled: false, start: '00:00', end: '00:00' };
          return html`
            <div key=${i} className=${`flex items-center justify-between p-4 rounded-2xl border transition-all ${config.enabled ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked=${config.enabled} onChange=${() => toggleDay(i)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
                <span className="text-sm font-bold w-24">${name}</span>
              </div>
              <div className="flex items-center gap-3">
                <input type="time" disabled=${!config.enabled} value=${config.start} onChange=${e => setTime(i, 'start', e.target.value)} className="text-sm p-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 bg-white" />
                <span className="text-[10px] font-black text-slate-400">A</span>
                <input type="time" disabled=${!config.enabled} value=${config.end} onChange=${e => setTime(i, 'end', e.target.value)} className="text-sm p-2 border rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 bg-white" />
              </div>
            </div>
          `;
        })}
      </div>
      <button onClick=${() => onSave(local)} className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
        Guardar Ajustes en Nube
      </button>
    </div>
  `;
};

const UserDashboard = ({ currentUser, tasks, setTasks }) => {
  const [activeNote, setActiveNote] = useState({});
  const myTasks = tasks.filter(t => t.assigned_to === currentUser.id);

  const updateStatus = async (id, status, extra = {}) => {
    // Si estamos completando, calculamos eficiencia
    if (status === TaskStatus.COMPLETED) {
      const task = tasks.find(t => t.id === id);
      const efficiency = calculateEfficiency(task.estimated_time || 0, task.accepted_at, new Date().toISOString());
      extra.efficiency = efficiency;
    }

    const { data, error } = await supabase.from('tasks').update({ status, ...extra }).eq('id', id).select();
    if (!error) setTasks(tasks.map(t => t.id === id ? data[0] : t));
  };

  const saveNote = async (id) => {
    const noteText = activeNote[id];
    if (!noteText?.trim()) return;

    const task = tasks.find(t => t.id === id);
    let currentNotes = [];
    try {
      currentNotes = JSON.parse(task.progress_notes || '[]');
    } catch (e) {
      if (task.progress_notes) currentNotes = [{ text: task.progress_notes, date: new Date().toISOString() }];
    }

    const newNotes = [...currentNotes, { text: noteText, date: new Date().toISOString() }];
    
    const { data, error } = await supabase.from('tasks').update({ 
      progress_notes: JSON.stringify(newNotes) 
    }).eq('id', id).select();

    if (!error) {
      setTasks(tasks.map(t => t.id === id ? data[0] : t));
      setActiveNote({ ...activeNote, [id]: '' });
      alert('Nota guardada correctamente');
    }
  };

  return html`
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 italic uppercase leading-none">Mis Obras</h2>
          <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-1">PERSONAL: ${currentUser.username.toUpperCase()}</p>
        </div>
      </div>

      ${myTasks.length === 0 ? html`
        <div className="p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 text-slate-400">
          No tienes obras asignadas actualmente.
        </div>
      ` : myTasks.map(t => {
        let noteHistory = [];
        try {
          noteHistory = JSON.parse(t.progress_notes || '[]');
        } catch (e) {
          if (t.progress_notes) noteHistory = [{ text: t.progress_notes, date: '' }];
        }

        const efficiencyColor = (t.efficiency >= 90) ? 'text-emerald-500' : (t.efficiency >= 60) ? 'text-amber-500' : 'text-red-500';

        return html`
          <div key=${t.id} className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-slate-800 text-lg uppercase leading-none">${t.title}</h3>
                  <span className="bg-slate-100 text-[9px] font-black text-slate-400 px-2 py-0.5 rounded-md">EST: ${t.estimated_time}h</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-indigo-500 font-bold tracking-tighter">ID: ${t.id.split('-')[0]}</span>
                  ${t.status === TaskStatus.ACCEPTED && html`<${Timer} startTime=${t.accepted_at} />`}
                </div>
              </div>
              <span className=${`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : t.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                ${t.status}
              </span>
            </div>

            <div className="p-6 bg-slate-50/50">
               <p className="text-sm text-slate-600 mb-6 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100">${t.description}</p>
               
               ${t.status === TaskStatus.PENDING ? html`
                 <button onClick=${() => updateStatus(t.id, TaskStatus.ACCEPTED, { accepted_at: new Date().toISOString() })} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">ACEPTAR OBRA Y COMENZAR TIEMPO</button>
               ` : html`
                 <div className="space-y-6">
                   <!-- HISTORIAL DE NOTAS -->
                   <div className="space-y-3">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Historial de Bitácora</h4>
                     <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                       ${noteHistory.length === 0 ? html`<p className="text-xs text-slate-400 italic px-1">Sin anotaciones previas...</p>` : noteHistory.map((n, i) => html`
                         <div key=${i} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                           <p className="text-sm text-slate-700 font-medium">${n.text}</p>
                           <p className="text-[9px] text-slate-400 mt-1 font-bold">${n.date ? new Date(n.date).toLocaleString() : ''}</p>
                         </div>
                       `)}
                     </div>
                   </div>

                   <!-- CARGA DE NOTA -->
                   ${t.status !== TaskStatus.COMPLETED && html`
                     <div className="space-y-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-inner">
                       <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">Nueva Anotación</label>
                       <textarea 
                         placeholder="Detalla el avance aquí..." 
                         value=${activeNote[t.id] || ''} 
                         onChange=${e => setActiveNote({...activeNote, [t.id]: e.target.value})} 
                         className="w-full p-4 bg-slate-50 border-0 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 min-h-[100px] transition-all"
                       />
                       <button onClick=${() => saveNote(t.id)} className="w-full bg-slate-800 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-900 transition-all active:scale-95">
                         Guardar en Bitácora
                       </button>
                     </div>

                     <!-- BOTON DE CIERRE APARTE -->
                     <button 
                        onClick=${() => { if(confirm('¿Confirmas que la obra está finalizada al 100%?')) updateStatus(t.id, TaskStatus.COMPLETED, { completed_at: new Date().toISOString() }) }} 
                        className="w-full border-2 border-emerald-600 text-emerald-600 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                       Finalizar Obra Definitivamente
                     </button>
                   `}

                   ${t.status === TaskStatus.COMPLETED && html`
                     <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center gap-3">
                       <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
                         </div>
                         <div className="text-center">
                            <span className="block text-emerald-700 font-black text-xs uppercase tracking-widest">Entrega Finalizada</span>
                            <span className=${`block font-black text-2xl tracking-tighter ${efficiencyColor}`}>${t.efficiency}% EFICIENCIA</span>
                         </div>
                       </div>
                     </div>
                   `}
                 </div>
               `}
            </div>
          </div>
        `;
      })}
    </div>
  `;
};

const AdminDashboard = ({ users, setUsers, tasks, setTasks, settings, setSettings }) => {
  const [view, setView] = useState('TASKS');
  const [modalUser, setModalUser] = useState({ show: false, mode: 'create', data: null });
  const [modalTask, setModalTask] = useState({ show: false, mode: 'create', data: null });
  
  const [userForm, setUserForm] = useState({ username: '', password: '', role: Role.USER });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', estimated_time: 1 });

  const saveUser = async (e) => {
    e.preventDefault();
    if (modalUser.mode === 'edit') {
      const { data, error } = await supabase.from('users').update(userForm).eq('id', modalUser.data.id).select();
      if (!error) setUsers(users.map(u => u.id === modalUser.data.id ? data[0] : u));
    } else {
      const { data, error } = await supabase.from('users').insert([userForm]).select();
      if (!error) setUsers([...users, ...data]);
    }
    setModalUser({ show: false });
  };

  const saveTask = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('tasks').insert([{
      ...taskForm, 
      status: TaskStatus.PENDING, 
      progress_notes: '[]',
      efficiency: 100
    }]).select();
    if (!error) setTasks([...tasks, ...data]);
    setModalTask({ show: false });
  };

  return html`
    <div className="space-y-6">
      <div className="flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit mx-auto sm:mx-0 sticky top-20 z-40 shadow-sm backdrop-blur-md">
        <button onClick=${() => setView('TASKS')} className=${`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${view === 'TASKS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Obras</button>
        <button onClick=${() => setView('USERS')} className=${`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${view === 'USERS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Personal</button>
        <button onClick=${() => setView('SETTINGS')} className=${`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${view === 'SETTINGS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>Ajustes</button>
      </div>

      ${view === 'TASKS' && html`
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 flex justify-between items-center border-b bg-slate-50/50">
            <h2 className="font-black text-slate-800 uppercase italic">Control General</h2>
            <button onClick=${() => { setTaskForm({title:'', description:'', assigned_to:'', estimated_time: 1}); setModalTask({show:true, mode:'create'}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-100 active:scale-95 transition-all">+ Nueva Obra</button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            ${tasks.map(t => {
              const efficiencyColor = (t.efficiency >= 90) ? 'text-emerald-500' : (t.efficiency >= 60) ? 'text-amber-500' : 'text-red-500';
              const efficiencyBg = (t.efficiency >= 90) ? 'bg-emerald-50' : (t.efficiency >= 60) ? 'bg-amber-50' : 'bg-red-50';

              return html`
                <div key=${t.id} className="p-6 border rounded-[28px] hover:border-indigo-200 transition-all bg-slate-50/30 group relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-black text-slate-800 text-sm uppercase leading-tight">${t.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-indigo-500 font-bold tracking-tighter uppercase">Est: ${t.estimated_time}hs</span>
                          ${t.status === TaskStatus.ACCEPTED && html`<${Timer} startTime=${t.accepted_at} />`}
                        </div>
                      </div>
                      <button onClick=${async () => { if(confirm('¿Eliminar obra?')) { await supabase.from('tasks').delete().eq('id', t.id); setTasks(tasks.filter(x => x.id !== t.id)); }}} className="text-slate-300 hover:text-red-500 transition-colors ml-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-6 h-8 italic">${t.description}</p>
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Asignado a</span>
                      <span className="text-[11px] font-black text-indigo-600">${users.find(u => u.id === t.assigned_to)?.username || 'Sin asignar'}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className=${`text-[9px] font-black px-2 py-1 rounded-lg uppercase ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>${t.status}</span>
                      ${t.status === 'COMPLETED' && html`
                        <span className=${`text-[10px] font-black px-2 py-0.5 rounded-full ${efficiencyBg} ${efficiencyColor}`}>${t.efficiency}% EFI</span>
                      `}
                    </div>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      `}

      ${view === 'USERS' && html`
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 flex justify-between items-center border-b bg-slate-50/50">
            <h2 className="font-black text-slate-800 uppercase italic">Nómina</h2>
            <button onClick=${() => { setUserForm({username:'', password:'', role:Role.USER}); setModalUser({show:true, mode:'create'}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-indigo-100 transition-all active:scale-95">+ Operario</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr><th className="p-6">Nombre de Usuario</th><th className="p-6">Jerarquía</th><th className="p-6 text-right">Gestión</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              ${users.map(u => html`
                <tr key=${u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-6 font-black text-slate-700">${u.username.toUpperCase()}</td>
                  <td className="p-6">
                    <span className=${`text-[9px] font-black px-2 py-1 rounded-md uppercase ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>${u.role}</span>
                  </td>
                  <td className="p-6 text-right space-x-4">
                    <button onClick=${() => { setUserForm({username:u.username, password:u.password, role:u.role}); setModalUser({show:true, mode:'edit', data:u}); }} className="text-indigo-600 text-[10px] font-black uppercase hover:underline">Editar</button>
                    <button onClick=${async () => { if(confirm('¿Eliminar usuario?')) { await supabase.from('users').delete().eq('id', u.id); setUsers(users.filter(x => x.id !== u.id)); }}} className="text-red-400 text-[10px] font-black uppercase hover:underline">Baja</button>
                  </td>
                </tr>
              `)}
            </tbody>
          </table>
        </div>
      `}

      ${view === 'SETTINGS' && html`
        <${SettingsPanel} settings=${settings} onSave=${async (newWorkingDays) => {
          const { error } = await supabase.from('settings').update({ working_days: newWorkingDays }).eq('id', settings.id);
          if (!error) {
            setSettings({ ...settings, working_days: newWorkingDays });
            alert('Ajustes sincronizados con la nube');
          } else {
            alert('Error en sincronización: ' + error.message);
          }
        }} />
      `}

      ${modalUser.show && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-sm shadow-2xl p-10">
            <h2 className="text-2xl font-black mb-8 italic uppercase text-indigo-700 leading-tight">${modalUser.mode === 'create' ? 'Alta Operario' : 'Modificar Perfil'}</h2>
            <form onSubmit=${saveUser} className="space-y-4">
              <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" placeholder="Nombre" value=${userForm.username} onChange=${e => setUserForm({...userForm, username: e.target.value})} required />
              <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" type="password" placeholder="Contraseña" value=${userForm.password} onChange=${e => setUserForm({...userForm, password: e.target.value})} required />
              <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 font-bold text-xs" value=${userForm.role} onChange=${e => setUserForm({...userForm, role: e.target.value})}>
                <option value=${Role.USER}>OPERARIO DE TALLER</option>
                <option value=${Role.ADMIN}>ADMINISTRADOR SISTEMA</option>
              </select>
              <div className="flex gap-3 pt-6">
                <button type="button" onClick=${() => setModalUser({show:false})} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      `}

      ${modalTask.show && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl p-10">
            <h2 className="text-2xl font-black mb-8 italic uppercase text-indigo-700 leading-tight">Nueva Obra</h2>
            <form onSubmit=${saveTask} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Título del Proyecto</label>
                <input className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold" placeholder="Ej: Automatización Planta A" value=${taskForm.title} onChange=${e => setTaskForm({...taskForm, title: e.target.value})} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Responsable</label>
                  <select className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 font-bold text-xs" value=${taskForm.assigned_to} onChange=${e => setTaskForm({...taskForm, assigned_to: e.target.value})} required>
                    <option value="">-- SELECCIONAR --</option>
                    ${users.filter(u => u.role === Role.USER).map(u => html`<option key=${u.id} value=${u.id}>${u.username.toUpperCase()}</option>`)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Tiempo Est. (HS)</label>
                  <input type="number" step="0.5" min="0.5" className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500 font-bold" value=${taskForm.estimated_time} onChange=${e => setTaskForm({...taskForm, estimated_time: parseFloat(e.target.value)})} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Alcance de Obra</label>
                <textarea className="w-full bg-slate-50 p-4 rounded-2xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500 min-h-[100px] text-sm" placeholder="Detalles técnicos..." value=${taskForm.description} onChange=${e => setTaskForm({...taskForm, description: e.target.value})} required />
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick=${() => setModalTask({show:false})} className="flex-1 bg-slate-100 py-4 rounded-2xl font-black text-xs uppercase">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-indigo-100">Lanzar Obra</button>
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
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: u } = await supabase.from('users').select('*').order('username');
      const { data: t } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      let { data: s } = await supabase.from('settings').select('*').single();
      
      if (!s) s = { id: 1, working_days: DEFAULT_WORKING_DAYS };

      setUsers(u || []);
      setTasks(t || []);
      setSettings(s);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return html`
    <div className="h-screen flex flex-col items-center justify-center bg-indigo-900 text-white p-6">
      <div className="w-16 h-16 border-4 border-indigo-400 border-t-white rounded-full animate-spin mb-6 shadow-2xl shadow-indigo-500/50"></div>
      <h1 className="text-2xl font-black italic tracking-tighter uppercase">Automatizacion</h1>
      <p className="font-bold uppercase tracking-[0.3em] text-[10px] opacity-50 mt-2">Sincronizando Cloud Systems...</p>
    </div>
  `;
  
  if (!currentUser) return html`<${Login} users=${users} onLogin=${setCurrentUser} />`;

  return html`
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-indigo-100">
      <nav className="bg-white/90 border-b border-slate-200 px-6 py-5 sticky top-0 z-50 shadow-sm backdrop-blur-lg">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black italic text-xl shadow-lg shadow-indigo-100">A</div>
            <div>
              <h1 className="text-xl font-black text-indigo-700 italic tracking-tighter leading-none uppercase">Automatizacion</h1>
              <span className="text-[9px] font-black text-slate-300 tracking-[0.2em] uppercase">Control Industrial</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-800 leading-none uppercase tracking-tighter">${currentUser.username}</p>
              <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1 opacity-70">${currentUser.role}</p>
            </div>
            <button onClick=${() => { if(confirm('¿Cerrar sesión?')) setCurrentUser(null) }} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto w-full p-6 pb-24">
        ${currentUser.role === Role.ADMIN 
          ? html`<${AdminDashboard} users=${users} setUsers=${setUsers} tasks=${tasks} setTasks=${setTasks} settings=${settings} setSettings=${setSettings} />`
          : html`<${UserDashboard} currentUser=${currentUser} tasks=${tasks} setTasks=${setTasks} />`
        }
      </main>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex justify-between items-center px-8 z-[60]">
        <div className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">
          Automatizacion Cloud Systems
        </div>
        <div className="text-[10px] text-slate-500 font-black tracking-tighter bg-slate-100 px-3 py-1 rounded-full border border-slate-200 shadow-sm">
          Desarrollo CAF • 2024 • ${VERSION}
        </div>
      </footer>
    </div>
  `;
};

export default App;
