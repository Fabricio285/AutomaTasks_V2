import React, { useState } from 'react';
import { html } from 'htm';

export const SettingsPanel = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings);
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  const toggleDay = (i) => {
    const nd = {...local.workingDays};
    nd[i].enabled = !nd[i].enabled;
    setLocal({...local, workingDays: nd});
  };

  const setTime = (i, field, val) => {
    const nd = {...local.workingDays};
    nd[i][field] = val;
    setLocal({...local, workingDays: nd});
  };

  return html`
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Configuración del Sistema</h2>
        <p className="text-slate-400 text-sm">Define el horario laboral para el cálculo de productividad.</p>
      </div>

      <div className="space-y-3">
        ${names.map((n, i) => html`
          <div key=${i} className=${`flex items-center justify-between p-4 rounded-2xl border transition-all ${local.workingDays[i].enabled ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <input type="checkbox" checked=${local.workingDays[i].enabled} onChange=${() => toggleDay(i)} className="w-5 h-5 accent-indigo-600 cursor-pointer" />
              <span className=${`text-sm font-bold w-24 ${local.workingDays[i].enabled ? 'text-indigo-900' : 'text-slate-400'}`}>${n}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <input type="time" disabled=${!local.workingDays[i].enabled} className="border border-slate-200 p-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value=${local.workingDays[i].start} onChange=${e => setTime(i, 'start', e.target.value)} />
              <span className="text-slate-300 text-xs font-bold">A</span>
              <input type="time" disabled=${!local.workingDays[i].enabled} className="border border-slate-200 p-2 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" value=${local.workingDays[i].end} onChange=${e => setTime(i, 'end', e.target.value)} />
            </div>
          </div>
        `)}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 tracking-widest">Ruta de Persistencia (Backup)</label>
          <input className="w-full border border-slate-200 p-3 rounded-xl text-sm font-mono bg-slate-50 text-slate-500" value=${local.storagePath} readOnly />
        </div>
        <button onClick=${() => onSave(local)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">Guardar Cambios de Sistema</button>
      </div>
    </div>
  `;
};