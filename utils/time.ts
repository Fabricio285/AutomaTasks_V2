import { AppSettings } from '../types';

export const calculateWorkingMinutes = (
  start: Date,
  end: Date,
  settings: AppSettings
): number => {
  let totalMinutes = 0;
  let current = new Date(start.getTime());

  while (current < end) {
    const dayOfWeek = current.getDay();
    const config = settings.workingDays[dayOfWeek];

    if (config && config.enabled) {
      const [startH, startM] = config.start.split(':').map(Number);
      const [endH, endM] = config.end.split(':').map(Number);

      const dayStartTime = new Date(current);
      dayStartTime.setHours(startH, startM, 0, 0);

      const dayEndTime = new Date(current);
      dayEndTime.setHours(endH, endM, 0, 0);

      if (current >= dayStartTime && current < dayEndTime) {
        totalMinutes++;
      }
    }
    current.setMinutes(current.getMinutes() + 1);
  }

  return totalMinutes;
};

export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
};