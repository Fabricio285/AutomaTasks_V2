import React, { useState } from 'react';
import { AppSettings } from '../types.ts';

export const SettingsPanel: React.FC<{ settings: AppSettings, onSave: any, onExport: any }> = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings);
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold mb-4">Configuración de Horas Hábiles</h2>
      <div className="space-y-3">
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-24 font-medium">{n}</div>
            <input type="checkbox" checked={local.workingDays[i].enabled} onChange={e => {
              const nd = {...local.workingDays}; nd[i].enabled = e.target.checked;
              setLocal({...local, workingDays: nd});
            }} />
            <input type="time" className="border p-1 rounded text-xs" value={local.workingDays[i].start} onChange={e => {
               const nd = {...local.workingDays}; nd[i].start = e.target.value;
               setLocal({...local, workingDays: nd});
            }} />
            <span>a</span>
            <input type="time" className="border p-1 rounded text-xs" value={local.workingDays[i].end} onChange={e => {
               const nd = {...local.workingDays}; nd[i].end = e.target.value;
               setLocal({...local, workingDays: nd});
            }} />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(local)} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mt-6">Guardar Configuración</button>
    </div>
  );
};
