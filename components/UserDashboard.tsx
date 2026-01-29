import React, { useState } from 'react';
import { User, Task, TaskStatus, AppSettings } from '../types';
import { calculateWorkingMinutes, formatDuration } from '../utils/time';
import { supabase } from '../lib/supabase';

interface Props { currentUser: User; tasks: Task[]; setTasks: any; settings: AppSettings; }

export const UserDashboard: React.FC<Props> = ({ currentUser, tasks, setTasks, settings }) => {
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({});
  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);

  const update = async (id: string, updates: any) => {
    // Map internal camelCase keys to Supabase snake_case if necessary
    const dbUpdates: any = { ...updates };
    if (updates.progressNotes !== undefined) {
      dbUpdates.progress_notes = updates.progressNotes;
      delete dbUpdates.progressNotes;
    }
    if (updates.acceptedAt !== undefined) {
      dbUpdates.accepted_at = updates.acceptedAt;
      delete dbUpdates.acceptedAt;
    }
    if (updates.completedAt !== undefined) {
      dbUpdates.completed_at = updates.completedAt;
      delete dbUpdates.completedAt;
    }
    if (updates.realDurationMinutes !== undefined) {
      dbUpdates.real_duration_minutes = updates.realDurationMinutes;
      delete dbUpdates.realDurationMinutes;
    }

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (!error) {
      setTasks((p: any) => p.map((t: any) => t.id === id ? { ...t, ...updates } : t));
    } else {
      alert("Error al actualizar: " + error.message);
    }
  };

  const saveProgressNote = async (taskId: string) => {
    const note = activeNotes[taskId];
    if (note === undefined) return;
    await update(taskId, { progressNotes: note });
    alert("Avance guardado.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-indigo-900">Mis Obras Cloud</h2><p className="text-sm opacity-70">Registra tus avances aquí</p></div>
        <div className="text-3xl font-bold">{myTasks.length}</div>
      </div>
      
      {myTasks.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed text-slate-400">
          No tienes obras asignadas por el momento.
        </div>
      )}

      {myTasks.map(t => (
        <div key={t.id} className="bg-white p-5 rounded-xl border shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-indigo-900">{t.title}</h3>
              <p className="text-sm text-slate-500">{t.description}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
              t.status === TaskStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
              t.status === TaskStatus.ACCEPTED ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {t.status}
            </span>
          </div>

          {t.status === TaskStatus.PENDING && (
            <button 
              onClick={() => update(t.id, { status: TaskStatus.ACCEPTED, acceptedAt: new Date().toISOString() })} 
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
            >
              Aceptar e Iniciar Tiempo
            </button>
          )}

          {t.status === TaskStatus.ACCEPTED && (
            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Detalle de Avances / Notas</label>
                <textarea 
                  className="w-full border-2 border-slate-100 focus:border-indigo-500 p-3 rounded-xl outline-none min-h-[100px] text-sm"
                  placeholder="Escribe aquí los avances de hoy, materiales usados o inconvenientes..."
                  value={activeNotes[t.id] ?? t.progressNotes ?? ''}
                  onChange={e => setActiveNotes({...activeNotes, [t.id]: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => saveProgressNote(t.id)}
                  className="flex-1 bg-indigo-100 text-indigo-700 py-2 rounded-lg font-bold text-sm hover:bg-indigo-200 transition-colors"
                >
                  Guardar Avance
                </button>
                <button 
                  onClick={() => {
                    const dur = calculateWorkingMinutes(new Date(t.acceptedAt!), new Date(), settings);
                    update(t.id, { 
                      status: TaskStatus.COMPLETED, 
                      completedAt: new Date().toISOString(), 
                      realDurationMinutes: dur,
                      progressNotes: activeNotes[t.id] ?? t.progressNotes
                    });
                  }} 
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors"
                >
                  Finalizar Obra
                </button>
              </div>
            </div>
          )}

          {t.status === TaskStatus.COMPLETED && (
            <div className="pt-2 border-t">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Último Reporte de Avances</p>
                <p className="text-sm text-slate-700 italic">{t.progressNotes || 'Sin notas registradas'}</p>
              </div>
              <div className="mt-2 text-center text-xs text-emerald-600 font-bold uppercase tracking-wider">
                ✓ Obra Entregada
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
