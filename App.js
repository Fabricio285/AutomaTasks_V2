import React, { useState, useEffect } from 'react';
import { html } from 'htm';
import { Role, TaskStatus } from './types.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { UserDashboard } from './components/UserDashboard.js';
import { Login } from './components/Login.js';
import { SettingsPanel } from './components/SettingsPanel.js';
import { supabase } from './lib/supabase.js';

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [view, setView] = useState('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: uErr } = await supabase.from('users').select('*');
      if (uErr) throw uErr;
      setUsers(usersData || []);

      const { data: tasksData, error: tErr } = await supabase.from('tasks').select('*');
      if (tErr) throw tErr;
      
      const mappedTasks = (tasksData || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assignedTo: t.assigned_to,
        status: t.status,
        estimatedHours: t.estimated_hours,
        createdAt: t.created_at,
        acceptedAt: t.accepted_at,
        completedAt: t.completed_at,
        realDurationMinutes: t.real_duration_minutes,
        progressNotes: t.progress_notes
      }));
      setTasks(mappedTasks);

      const { data: settingsData, error: sErr } = await supabase.from('settings').select('*').single();
      if (sErr && sErr.code !== 'PGRST116') throw sErr;

      if (settingsData) {
        setSettings({
          storagePath: settingsData.storage_path,
          workingDays: settingsData.working_days
        });
      } else {
        setSettings({
          storagePath: 'C:/AppData/TaskFlow/db.json',
          workingDays: {
            1: { start: '09:00', end: '18:00', enabled: true },
            2: { start: '09:00', end: '18:00', enabled: true },
            3: { start: '09:00', end: '18:00', enabled: true },
            4: { start: '09:00', end: '18:00', enabled: true },
            5: { start: '09:00', end: '18:00', enabled: true },
            6: { start: '00:00', end: '00:00', enabled: false },
            0: { start: '00:00', end: '00:00', enabled: false },
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return html`
    <div className="h-screen flex items-center justify-center bg-indigo-900 text-white font-bold">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        Sincronizando...
      </div>
    </div>
  `;

  if (error) return html`
    <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-red-600 p-8 text-center">
      <p className="font-bold text-xl mb-2">Error de Sistema</p>
      <p className="text-sm mb-4">${error}</p>
      <button onClick=${() => location.reload()} className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Reintentar</button>
    </div>
  `;

  if (!currentUser) return html`<${Login} users=${users} onLogin=${setCurrentUser} />`;

  return html`
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">
      <nav className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick=${() => setView('DASHBOARD')}>
            <span className="text-2xl font-black italic tracking-tighter">TaskFlow <span className="text-indigo-300 font-normal">CLOUD</span></span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-xs font-bold uppercase bg-indigo-600 px-2 py-1 rounded border border-indigo-500">${currentUser.username}</span>
            ${currentUser.role === Role.ADMIN && html`
              <button onClick=${() => setView(view === 'SETTINGS' ? 'DASHBOARD' : 'SETTINGS')} className="hover:text-indigo-200 text-sm font-medium">
                 ${view === 'SETTINGS' ? 'Volver' : 'Ajustes'}
              </button>
            `}
            <button onClick=${() => setCurrentUser(null)} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-xs font-bold transition-colors">Salir</button>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 flex-grow">
        ${view === 'SETTINGS' ? html`
          <${SettingsPanel} settings=${settings} onSave=${async (s) => {
             await supabase.from('settings').update({ storage_path: s.storagePath, working_days: s.workingDays }).eq('id', 1);
             setSettings(s);
             alert('Ajustes guardados correctamente.');
          }} />
        ` : currentUser.role === Role.ADMIN ? html`
          <${AdminDashboard} users=${users} setUsers=${setUsers} tasks=${tasks} setTasks=${setTasks} settings=${settings} />
        ` : html`
          <${UserDashboard} currentUser=${currentUser} tasks=${tasks} setTasks=${setTasks} settings=${settings} />
        `}
      </main>
      <footer className="p-4 text-center text-[10px] text-slate-400 uppercase tracking-widest">
        TaskFlow Manager Cloud © 2024 - JavaScript Nativo
      </footer>
    </div>
  `;
};

export default App;