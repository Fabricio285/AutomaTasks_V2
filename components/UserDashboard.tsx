import React from 'react';
import { User, Task, TaskStatus, AppSettings } from '../types';
import { calculateWorkingMinutes, formatDuration } from '../utils/time';
import { supabase } from '../lib/supabase';

interface Props { currentUser: User; tasks: Task[]; setTasks: any; settings: AppSettings; }

export const UserDashboard: React.FC<Props> = ({ currentUser, tasks, setTasks, settings }) => {
  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);

  const update = async (id: string, updates: any) => {
    const { error } = await supabase.from('tasks').update(updates).eq('id', id);
    if (!error) setTasks((p: any) => p.map((t: any) => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-indigo-900">Mis Obras Cloud</h2><p>Sincronización activa</p></div>
        <div className="text-3xl font-bold">{myTasks.length}</div>
      </div>
      {myTasks.map(t => (
        <div key={t.id} className="bg-white p-5 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold text-lg">{t.title}</h3>
            <span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold">{t.status}</span>
          </div>
          {t.status === TaskStatus.PENDING && (
            <button onClick={() => update(t.id, { status: TaskStatus.ACCEPTED, accepted_at: new Date().toISOString() })} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Aceptar e Iniciar Tiempo</button>
          )}
          {t.status === TaskStatus.ACCEPTED && (
            <button onClick={() => {
              const dur = calculateWorkingMinutes(new Date(t.acceptedAt!), new Date(), settings);
              update(t.id, { status: TaskStatus.COMPLETED, completed_at: new Date().toISOString(), real_duration_minutes: dur });
            }} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold">Finalizar Tarea</button>
          )}
          {t.status === TaskStatus.COMPLETED && <div className="text-center p-2 bg-slate-50 text-slate-500 rounded font-bold">✓ Completada</div>}
        </div>
      ))}
    </div>
  );
};