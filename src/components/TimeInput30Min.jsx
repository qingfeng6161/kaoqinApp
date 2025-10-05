// @ts-ignore;
import React from 'react';

export function TimeInput30Min({
  value,
  onChange,
  placeholder
}) {
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      options.push(`${hourStr}:00`);
      options.push(`${hourStr}:30`);
    }
    return options;
  };
  const timeOptions = generateTimeOptions();
  return <select value={value} onChange={e => onChange(e.target.value)} className="w-full px-2 py-1 border rounded">
      <option value="">{placeholder || '选择时间'}</option>
      {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
    </select>;
}