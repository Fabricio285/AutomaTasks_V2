import React, { useState } from 'react';
import { TaskStatus } from '../types.js';
import { calculateWorkingMinutes } from '../utils/time.js';
import { supabase } from '../lib/supabase.js';

export const UserDashboard = ({ currentUser, tasks, setTasks, settings }) => {
  const [activeNotes, setActiveNotes] = useState({});
  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);

  const update = async (id, updates) => {
    const dbUpdates = { ...updates };
    if (updates.progressNotes !== undefined) { dbUpdates.progress_notes = updates.progressNotes; delete dbUpdates.progressNotes; }
    if (updates.acceptedAt !== undefined) { dbUpdates.accepted_at = updates.acceptedAt; delete dbUpdates.acceptedAt; }
    if (updates.completedAt !== undefined) { dbUpdates.completed_at = updates.completedAt; delete dbUpdates.completedAt; }
    if (updates.realDurationMinutes !== undefined) { dbUpdates.real_duration_minutes = updates.realDurationMinutes; delete dbUpdates.realDurationMinutes; }

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);
    if (!error) setTasks(p => p.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Mis Obras</h2>
      {myTasks.map(t => (
        <div key={t.id} className="bg-white p-4 rounded shadow border">
          <h3 className="font-bold">{t.title}</h3>
          <p className="text-sm mb-4">{t.description}</p>
          
          {t.status === TaskStatus.PENDING && (
            <button onClick={() => update(t.id, { status: TaskStatus.ACCEPTED, acceptedAt: new Date().toISOString() })} className="w-full bg-indigo-600 text-white py-2 rounded">Aceptar</button>
          )}

          {t.status === TaskStatus.ACCEPTED && (
            <div className="space-y-2">
              <textarea 
                className="w-full border p-2 rounded text-sm" placeholder="Notas de hoy..."
                value={activeNotes[t.id] ?? t.progressNotes ?? ''}
                onChange={e => setActiveNotes({...activeNotes, [t.id]: e.target.value})}
              />
              <button onClick={() => {
                const dur = calculateWorkingMinutes(new Date(t.acceptedAt), new Date(), settings);
                update(t.id, { 
                  status: TaskStatus.COMPLETED, 
                  completedAt: new Date().toISOString(), 
                  realDurationMinutes: dur,
                  progressNotes: activeNotes[t.id] ?? t.progressNotes
                });
              }} className="w-full bg-emerald-600 text-white py-2 rounded">Finalizar</button>
            </div>
          )}

          {t.status === TaskStatus.COMPLETED && <div className="text-center text-emerald-600 font-bold">✓ Completado</div>}
        </div>
      ))}
    </div>
  );
};