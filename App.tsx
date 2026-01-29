import React, { useState, useEffect } from 'react';
import { User, Task, AppSettings, Role, TaskStatus } from './types.ts';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { UserDashboard } from './components/UserDashboard.tsx';
import { Login } from './components/Login.tsx';
import { SettingsPanel } from './components/SettingsPanel.tsx';
import { supabase } from './lib/supabase.ts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [view, setView] = useState<'DASHBOARD' | 'SETTINGS'>('DASHBOARD');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: usersData, error: uErr } = await supabase.from('users').select('*');
      if (uErr) throw uErr;
      setUsers(usersData || []);

      const { data: tasksData, error: tErr } = await supabase.from('tasks').select('*');
      if (tErr) throw tErr;
      
      const mappedTasks: Task[] = (tasksData || []).map(t => ({
        id: t.id,
        title: t.title,
        description: t.description,
        assignedTo: t.assigned_to,
        status: t.status as TaskStatus,
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
    } catch (err: any) {
      console.error(err);
      setError('Error al sincronizar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center bg-indigo-900 text-white font-bold animate-pulse">Cargando TaskFlow Cloud...</div>;

  if (error) return (
    <div className="h-screen flex flex-col items-center justify-center bg-red-50 text-red-600 p-4 text-center">
      <p className="font-bold text-xl mb-2">Error de Conexión</p>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-bold">Reintentar</button>
    </div>
  );

  if (!currentUser) return <Login users={users} onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <nav className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <span className="text-2xl font-black tracking-tighter italic">TaskFlow <span className="text-indigo-300">CLOUD</span></span>
            <span className="hidden sm:inline bg-indigo-500 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-indigo-400">{currentUser.role}</span>
          </div>
          <div className="flex gap-2 items-center">
            <div className="hidden md:flex flex-col text-right mr-2">
              <span className="text-xs font-bold leading-none">{currentUser.username}</span>
              <span className="text-[10px] opacity-70">En línea</span>
            </div>
            {currentUser.role === Role.ADMIN && (
              <button 
                onClick={() => setView(view === 'SETTINGS' ? 'DASHBOARD' : 'SETTINGS')} 
                className={`p-2 rounded-xl transition-all ${view === 'SETTINGS' ? 'bg-white text-indigo-700 font-bold' : 'hover:bg-indigo-600'}`}
                title="Configuración"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.533 1.533 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.533 1.533 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button onClick={() => setCurrentUser(null)} className="bg-red-500 hover:bg-red-600 p-2 rounded-xl transition-all" title="Cerrar Sesión">
               <svg xmlns="http://www.w3.org/2000/01/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
               </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 flex-grow">
        {view === 'SETTINGS' ? (
          <SettingsPanel settings={settings!} onSave={async (s: AppSettings) => {
             await supabase.from('settings').update({ storage_path: s.storagePath, working_days: s.workingDays }).eq('id', 1);
             setSettings(s);
             alert('Ajustes guardados correctamente.');
          }} onExport={() => {}} />
        ) : currentUser.role === Role.ADMIN ? (
          <AdminDashboard users={users} setUsers={setUsers} tasks={tasks} setTasks={setTasks} settings={settings!} />
        ) : (
          <UserDashboard currentUser={currentUser} tasks={tasks} setTasks={setTasks} settings={settings!} />
        )}
      </main>

      <footer className="p-4 text-center text-[10px] text-slate-400 uppercase tracking-widest">
        TaskFlow Manager © 2024 - Sistema de Control de Producción Cloud
      </footer>
    </div>
  );
};

export default App;
