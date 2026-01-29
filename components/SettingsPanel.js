import React, { useState } from 'react';

export const SettingsPanel = ({ settings, onSave }) => {
  const [local, setLocal] = useState(settings);
  const names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Horas Hábiles</h2>
      <div className="space-y-2">
        {names.map((n, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-20">{n}</span>
            <input type="checkbox" checked={local.workingDays[i].enabled} onChange={e => {
              const nd = {...local.workingDays}; nd[i].enabled = e.target.checked;
              setLocal({...local, workingDays: nd});
            }} />
            <input type="time" className="border p-1" value={local.workingDays[i].start} onChange={e => {
               const nd = {...local.workingDays}; nd[i].start = e.target.value;
               setLocal({...local, workingDays: nd});
            }} />
            <input type="time" className="border p-1" value={local.workingDays[i].end} onChange={e => {
               const nd = {...local.workingDays}; nd[i].end = e.target.value;
               setLocal({...local, workingDays: nd});
            }} />
          </div>
        ))}
      </div>
      <button onClick={() => onSave(local)} className="w-full bg-indigo-600 text-white py-2 rounded mt-4">Guardar</button>
    </div>
  );
};