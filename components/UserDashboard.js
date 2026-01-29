import React, { useState } from 'react';
import htm from 'htm';
import { TaskStatus } from '../types.js';
import { calculateWorkingMinutes } from '../utils/time.js';
import { supabase } from '../lib/supabase.js';

const html = htm.bind(React.createElement);

export const UserDashboard = ({ currentUser, tasks, setTasks, settings }) => {
  const [activeNotes, setActiveNotes] = useState({});
  const myTasks = tasks.filter(t => t.assignedTo == currentUser.id);

  const updateTaskStatus = async (id, updates) => {
    const dbUpdates = { ...updates };
    // Ajuste de nombres para la DB (snake_case)
    if (updates.progressNotes !== undefined) { dbUpdates.progress_notes = updates.progressNotes; delete dbUpdates.progressNotes; }
    if (updates.acceptedAt !== undefined) { dbUpdates.accepted_at = updates.acceptedAt; delete dbUpdates.acceptedAt; }
    if (updates.completedAt !== undefined) { dbUpdates.completed_at = updates.completedAt; delete dbUpdates.completedAt; }
    if (updates.realDurationMinutes !== undefined) { dbUpdates.real_duration_minutes = updates.realDurationMinutes; delete dbUpdates.realDurationMinutes; }

    const { error } = await supabase.from('tasks').update(dbUpdates).eq(id, id);
    if (!error) setTasks(p => p.map(t => t.id === id ? { ...t, ...updates } : t));
    else alert('Error al actualizar la tarea.');
  };

  return html`
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100">
        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-1">Panel de Operario</h2>
        <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Obras Asignadas: ${myTasks.length}</p>
      </div>
      
      <div className="space-y-4">
        ${myTasks.length === 0 ? html`
          <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No tienes obras asignadas por el momento.</p>
          </div>
        ` : myTasks.map(t => html`
          <div key=${t.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
               <div>
                 <h3 className="font-bold text-lg text-slate-800">${t.title}</h3>
                 <p className="text-xs text-slate-400">Creado: ${new Date(t.createdAt).toLocaleDateString()}</p>
               </div>
               <span className=${`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                 ${t.status}
               </span>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl">${t.description}</p>
            
            ${t.status === TaskStatus.PENDING && html`
              <button onClick=${() => updateTaskStatus(t.id, { status: TaskStatus.ACCEPTED, acceptedAt: new Date().toISOString() })} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">Comenzar Obra</button>
            `}

            ${t.status === TaskStatus.ACCEPTED && html`
              <div className="space-y-4 pt-2">
                <div className="border-t border-slate-100 pt-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Notas de Avance / Reporte</label>
                  <textarea 
                    className="w-full border border-slate-200 p-4 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]" 
                    placeholder="Describe lo realizado hoy, materiales usados o inconvenientes..."
                    value=${activeNotes[t.id] ?? t.progressNotes ?? ''}
                    onChange=${e => setActiveNotes({...activeNotes, [t.id]: e.target.value})}
                  />
                </div>
                <button onClick=${() => {
                  const dur = calculateWorkingMinutes(new Date(t.acceptedAt), new Date(), settings);
                  updateTaskStatus(t.id, { 
                    status: TaskStatus.COMPLETED, 
                    completedAt: new Date().toISOString(), 
                    realDurationMinutes: dur,
                    progressNotes: activeNotes[t.id] ?? t.progressNotes
                  });
                }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95">Finalizar y Reportar</button>
              </div>
            `}

            ${t.status === TaskStatus.COMPLETED && html`
              <div className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-2xl">
                <div className="bg-emerald-500 text-white rounded-full p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-emerald-700 font-bold text-sm">Obra Finalizada Correctamente</span>
              </div>
            `}
          </div>
        `)}
      </div>
    </div>
  `;
};