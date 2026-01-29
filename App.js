import React, { useState, useEffect } from 'react';
import htm from 'htm';
import { Role } from './types.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { UserDashboard } from './components/UserDashboard.js';
import { Login } from './components/Login.js';
import { SettingsPanel } from './components/SettingsPanel.js';
import { supabase } from './lib/supabase.js';

const html = htm.bind(React.createElement);

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [settings, setSettings] = useState(null);
  const [view, setView] = useState('DASHBOARD');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData } = await supabase.from('users').select('*');
      setUsers(usersData || []);

      const { data: tasksData } = await supabase.from('tasks').select('*');
      setTasks(tasksData || []);

      const { data: settingsData } = await supabase.from('settings').select('*').single();
      if (settingsData) {
        setSettings({
          storagePath: settingsData.storage_path,
          workingDays: settingsData.working_days
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return html`
    <div className="h-screen flex items-center justify-center bg-indigo-900 text-white font-bold">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
        <p className="animate-pulse">Sincronizando Cloud...</p>
      </div>
    </div>
  `;

  if (!currentUser) return html`<${Login} users=${users} onLogin=${setCurrentUser} />`;

  return html`
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-black text-indigo-700 italic tracking-tighter cursor-pointer" onClick=${() => setView('DASHBOARD')}>
            TaskFlow <span className="text-slate-400 font-normal">MANAGER</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">${currentUser.username}</p>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">${currentUser.role}</p>
            </div>
            ${currentUser.role === Role.ADMIN && html`
              <button 
                onClick=${() => setView(view === 'SETTINGS' ? 'DASHBOARD' : 'SETTINGS')}
                className=${`p-2 rounded-lg transition-colors ${view === 'SETTINGS' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.533 1.533 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            `}
            <button onClick=${() => setCurrentUser(null)} className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 p-2 rounded-lg transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        ${view === 'SETTINGS' ? html`
          <${SettingsPanel} settings=${settings} onSave=${async (s) => {
            await supabase.from('settings').update({ storage_path: s.storagePath, working_days: s.working_days }).eq('id', 1);
            setSettings(s);
            alert('Ajustes guardados');
          }} />
        ` : currentUser.role === Role.ADMIN ? html`
          <${AdminDashboard} users=${users} setUsers=${setUsers} tasks=${tasks} setTasks=${setTasks} />
        ` : html`
          <${UserDashboard} currentUser=${currentUser} tasks=${tasks} setTasks=${setTasks} />
        `}
      </main>
      <footer className="p-8 text-center text-slate-400 text-[10px] uppercase tracking-[0.2em]">
        © 2024 TaskFlow Cloud - JS NATIVO
      </footer>
    </div>
  `;
};

export default App;