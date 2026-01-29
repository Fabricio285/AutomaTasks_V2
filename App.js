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

const DEFAULT_WORKING_DAYS = {
  0: { enabled: false, start: '08:00', end: '17:00' },
  1: { enabled: true, start: '08:00', end: '17:00' },
  2: { enabled: true, start: '08:00', end: '17:00' },
  3: { enabled: true, start: '08:00', end: '17:00' },
  4: { enabled: true, start: '08:00', end: '17:00' },
  5: { enabled: true, start: '08:00', end: '17:00' },
  6: { enabled: false, start: '08:00', end: '17:00' }
};

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
        <h1 className="text-3xl font-black text-center text-indigo-700 mb-2 tracking-tighter italic">TaskFlow</h1>
        <p className="text-center text-slate-400 text-[10px] uppercase tracking-widest mb-8">Gestión de Producción Cloud</p>
        <form onSubmit=${handleSubmit} className="space-y-4">
          <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Usuario" value=${u} onChange=${e => setU(e.target.value)} required />
          <input className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all" type="password" placeholder="Contraseña" value=${p} onChange=${e => setP(e.target.value)} required />
          ${err && html`<p className="text-red-500 text-xs font-bold text-center bg-red-50 p-2 rounded-lg">${err}</p>`}
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95">Ingresar</button>
        </form>
      </div>
    </div>
  `;
};

const SettingsPanel = ({ settings, onSave }) => {
  // Aseguramos que siempre haya datos válidos para evitar crash
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
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Configuración de Horarios</h2>
      <div className="space-y-3">
        ${days.map((name, i) => {
          const config = local[i] || { enabled: false, start: '00:00', end: '00:00' };
          return html`
            <div key=${i} className=${`flex items-center justify-between p-3 rounded-xl border transition-all ${config.enabled ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked=${config.enabled} onChange=${() => toggleDay(i)} className="w-4 h-4 accent-indigo-600 cursor-pointer" />
                <span className="text-sm font-bold w-20">${name}</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="time" disabled=${!config.enabled} value=${config.start} onChange=${e => setTime(i, 'start', e.target.value)} className="text-xs p-1 border rounded outline-none focus:ring-1 focus:ring-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase">A</span>
                <input type="time" disabled=${!config.enabled} value=${config.end} onChange=${e => setTime(i, 'end', e.target.value)} className="text-xs p-1 border rounded outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>
            </div>
          `;
        })}
      </div>
      <button onClick=${() => onSave(local)} className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-100">
        Guardar Ajustes
      </button>
    </div>
  `;
};

const UserDashboard = ({ currentUser, tasks, setTasks }) => {
  const [notes, setNotes] = useState({});
  const myTasks = tasks.filter(t => t.assigned_to === currentUser.id);

  const updateStatus = async (id, status, extra = {}) => {
    const { data, error } = await supabase.from('tasks').update({ status, ...extra }).eq('id', id).select();
    if (!error) setTasks(tasks.map(t => t.id === id ? data[0] : t));
  };

  return html`
    <div className="max-w-xl mx-auto space-y-4">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Mis Tareas Asignadas</h2>
        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Operario: ${currentUser.username}</p>
      </div>
      ${myTasks.length === 0 ? html`
        <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 font-medium">
          No tienes tareas asignadas.
        </div>
      ` : myTasks.map(t => html`
        <div key=${t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-slate-800 text-lg">${t.title}</h3>
            <span className=${`text-[9px] font-black px-2 py-0.5 rounded uppercase ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>${t.status}</span>
          </div>
          <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">${t.description}</p>
          
          ${t.status === TaskStatus.PENDING && html`
            <button onClick=${() => updateStatus(t.id, TaskStatus.ACCEPTED, { accepted_at: new Date().toISOString() })} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-50 transition-all active:scale-95">Comenzar Ahora</button>
          `}

          ${t.status === TaskStatus.ACCEPTED && html`
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Notas de Avance</label>
              <textarea placeholder="Describe lo realizado..." value=${notes[t.id] || ''} onChange=${e => setNotes({...notes, [t.id]: e.target.value})} className="w-full p-3 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" />
              <button onClick=${() => updateStatus(t.id, TaskStatus.COMPLETED, { completed_at: new Date().toISOString(), progress_notes: notes[t.id] })} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-50 transition-all active:scale-95">Finalizar y Entregar</button>
            </div>
          `}

          ${t.status === TaskStatus.COMPLETED && html`
            <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-center text-xs font-bold border border-emerald-100 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/></svg>
              Tarea Finalizada
            </div>
          `}
        </div>
      `)}
    </div>
  `;
};

const AdminDashboard = ({ users, setUsers, tasks, setTasks, settings, setSettings }) => {
  const [view, setView] = useState('TASKS'); // Empezamos en tareas por defecto
  const [modalUser, setModalUser] = useState({ show: false, mode: 'create', data: null });
  const [modalTask, setModalTask] = useState({ show: false, mode: 'create', data: null });
  
  const [userForm, setUserForm] = useState({ username: '', password: '', role: Role.USER });
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '' });

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
    const { data, error } = await supabase.from('tasks').insert([{...taskForm, status: TaskStatus.PENDING}]).select();
    if (!error) setTasks([...tasks, ...data]);
    setModalTask({ show: false });
  };

  return html`
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-200/50 rounded-xl w-fit mx-auto sm:mx-0 sticky top-20 z-40 backdrop-blur-md">
        <button onClick=${() => setView('TASKS')} className=${`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'TASKS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Tareas</button>
        <button onClick=${() => setView('USERS')} className=${`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'USERS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Personal</button>
        <button onClick=${() => setView('SETTINGS')} className=${`px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'SETTINGS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>Ajustes</button>
      </div>

      ${view === 'TASKS' && html`
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 flex justify-between items-center border-b bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Control de Producción</h2>
            <button onClick=${() => { setTaskForm({title:'', description:'', assigned_to:''}); setModalTask({show:true, mode:'create'}); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">+ Nueva Obra</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            ${tasks.map(t => html`
              <div key=${t.id} className="p-4 border rounded-xl hover:border-indigo-200 transition-colors bg-slate-50/30 group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 text-sm">${t.title}</h3>
                  <button onClick=${async () => { if(confirm('¿Eliminar?')) { await supabase.from('tasks').delete().eq('id', t.id); setTasks(tasks.filter(x => x.id !== t.id)); }}} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mb-4">${t.description}</p>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-indigo-600">👤 ${users.find(u => u.id === t.assigned_to)?.username || 'Sin asignar'}</span>
                  <span className=${`text-[9px] font-black px-1.5 py-0.5 rounded ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>${t.status}</span>
                </div>
              </div>
            `)}
          </div>
        </div>
      `}

      ${view === 'USERS' && html`
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 flex justify-between items-center border-b bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Personal del Taller</h2>
            <button onClick=${() => { setUserForm({username:'', password:'', role:Role.USER}); setModalUser({show:true, mode:'create'}); }} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">+ Nuevo Operario</button>
          </div>
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
              <tr><th className="p-4">Usuario</th><th className="p-4">Rol</th><th className="p-4 text-right">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              ${users.map(u => html`
                <tr key=${u.id} className="hover:bg-slate-50/80">
                  <td className="p-4 font-bold text-slate-700">${u.username}</td>
                  <td className="p-4 text-xs font-medium text-slate-500">${u.role}</td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick=${() => { setUserForm({username:u.username, password:u.password, role:u.role}); setModalUser({show:true, mode:'edit', data:u}); }} className="text-indigo-600 text-xs font-bold">Editar</button>
                    <button onClick=${async () => { if(confirm('¿Eliminar?')) { await supabase.from('users').delete().eq('id', u.id); setUsers(users.filter(x => x.id !== u.id)); }}} className="text-red-400 text-xs font-bold">Borrar</button>
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
            alert('Configuración guardada en la nube');
          } else {
            alert('Error al guardar: ' + error.message);
          }
        }} />
      `}

      ${modalUser.show && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8">
            <h2 className="text-xl font-black mb-6">${modalUser.mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}</h2>
            <form onSubmit=${saveUser} className="space-y-4">
              <input className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" placeholder="Nombre" value=${userForm.username} onChange=${e => setUserForm({...userForm, username: e.target.value})} required />
              <input className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" type="password" placeholder="Clave" value=${userForm.password} onChange=${e => setUserForm({...userForm, password: e.target.value})} required />
              <select className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-slate-100" value=${userForm.role} onChange=${e => setUserForm({...userForm, role: e.target.value})}>
                <option value=${Role.USER}>Trabajador</option>
                <option value=${Role.ADMIN}>Administrador</option>
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick=${() => setModalUser({show:false})} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">Cerrar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      `}

      ${modalTask.show && html`
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8">
            <h2 className="text-xl font-black mb-6">Nueva Tarea / Obra</h2>
            <form onSubmit=${saveTask} className="space-y-4">
              <input className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500" placeholder="Título de la Obra" value=${taskForm.title} onChange=${e => setTaskForm({...taskForm, title: e.target.value})} required />
              <textarea className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-slate-100 focus:ring-2 focus:ring-indigo-500 min-h-[100px]" placeholder="Descripción detallada..." value=${taskForm.description} onChange=${e => setTaskForm({...taskForm, description: e.target.value})} required />
              <select className="w-full bg-slate-50 p-3 rounded-xl outline-none border border-slate-100" value=${taskForm.assigned_to} onChange=${e => setTaskForm({...taskForm, assigned_to: e.target.value})} required>
                <option value="">Asignar a...</option>
                ${users.filter(u => u.role === Role.USER).map(u => html`<option key=${u.id} value=${u.id}>${u.username}</option>`)}
              </select>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick=${() => setModalTask({show:false})} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold">Asignar Tarea</button>
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
      
      // Obtenemos settings, si no existe el registro con ID 1, creamos un fallback
      let { data: s } = await supabase.from('settings').select('*').single();
      
      if (!s) {
        // Fallback si la tabla está vacía
        s = { id: 1, working_days: DEFAULT_WORKING_DAYS };
      }

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
    <div className="h-screen flex flex-col items-center justify-center bg-indigo-900 text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-4"></div>
      <p className="font-bold uppercase tracking-widest text-[10px]">Iniciando TaskFlow...</p>
    </div>
  `;
  
  if (!currentUser) return html`<${Login} users=${users} onLogin=${setCurrentUser} />`;

  return html`
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">T</div>
            <h1 className="text-xl font-black text-indigo-700 italic tracking-tighter">TaskFlow</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">${currentUser.username}</p>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">${currentUser.role}</p>
            </div>
            <button onClick=${() => setCurrentUser(null)} className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-5xl mx-auto w-full p-6 pb-20">
        ${currentUser.role === Role.ADMIN 
          ? html`<${AdminDashboard} users=${users} setUsers=${setUsers} tasks=${tasks} setTasks=${setTasks} settings=${settings} setSettings=${setSettings} />`
          : html`<${UserDashboard} currentUser=${currentUser} tasks=${tasks} setTasks=${setTasks} />`
        }
      </main>

      <footer className="p-8 text-center text-slate-400 text-[9px] uppercase tracking-[0.3em] border-t border-slate-200 bg-white">
        TaskFlow Manager Cloud © 2024 • Potenciado por Supabase
      </footer>
    </div>
  `;
};

export default App;