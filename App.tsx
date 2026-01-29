import React, { useState, useEffect } from 'react';
import { User, Task, AppSettings, Role, TaskStatus } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { UserDashboard } from './components/UserDashboard';
import { Login } from './components/Login';
import { SettingsPanel } from './components/SettingsPanel';
import { supabase } from './lib/supabase';

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
        realDurationMinutes: t.real_duration_minutes
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-indigo-900 text-white font-bold">Cargando TaskFlow Cloud...</div>;

  if (error) return <div className="h-screen flex items-center justify-center bg-red-50 text-red-600 p-4 text-center">{error}</div>;

  if (!currentUser) return <Login users={users} onLogin={setCurrentUser} />;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-indigo-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('DASHBOARD')}>
            <span className="text-2xl font-bold">TaskFlow</span>
            <span className="bg-indigo-500 text-xs px-2 py-1 rounded uppercase">{currentUser.role}</span>
          </div>
          <div className="flex gap-4 items-center">
            <span className="hidden md:inline">Hola, {currentUser.username}</span>
            {currentUser.role === Role.ADMIN && (
              <button onClick={() => setView(view === 'SETTINGS' ? 'DASHBOARD' : 'SETTINGS')} className="hover:bg-indigo-600 px-3 py-1 rounded">
                {view === 'SETTINGS' ? 'Panel' : 'Ajustes'}
              </button>
            )}
            <button onClick={() => setCurrentUser(null)} className="bg-white/10 px-3 py-1 rounded">Salir</button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 flex-grow">
        {view === 'SETTINGS' ? (
          <SettingsPanel settings={settings!} onSave={async (s) => {
             await supabase.from('settings').update({ storage_path: s.storagePath, working_days: s.workingDays }).eq('id', 1);
             setSettings(s);
             alert('Guardado');
          }} onExport={() => {}} />
        ) : currentUser.role === Role.ADMIN ? (
          <AdminDashboard users={users} setUsers={setUsers} tasks={tasks} setTasks={setTasks} settings={settings!} />
        ) : (
          <UserDashboard currentUser={currentUser} tasks={tasks} setTasks={setTasks} settings={settings!} />
        )}
      </main>
    </div>
  );
};

export default App;