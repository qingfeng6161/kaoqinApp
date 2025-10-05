// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Clock } from 'lucide-react';

export function TimePicker({
  value,
  onChange,
  label
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [tempHour, setTempHour] = useState('08');
  const [tempMinute, setTempMinute] = useState('00');
  const hours = Array.from({
    length: 24
  }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '30'];
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':');
      setTempHour(hour || '08');
      setTempMinute(minute || '00');
    }
  }, [value]);
  const handleConfirm = () => {
    const newTime = `${tempHour}:${tempMinute}`;
    onChange(newTime);
    setShowPicker(false);
  };
  const handleCancel = () => {
    setShowPicker(false);
  };
  const handleHourScroll = e => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    if (index >= 0 && index < hours.length) {
      setTempHour(hours[index]);
    }
  };
  const handleMinuteScroll = e => {
    const scrollTop = e.target.scrollTop;
    const itemHeight = 40;
    const index = Math.round(scrollTop / itemHeight);
    if (index >= 0 && index < minutes.length) {
      setTempMinute(minutes[index]);
    }
  };
  return <div className="relative">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-gray-500" />
        <div onClick={() => setShowPicker(true)} className="w-24 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer text-center hover:border-blue-500 transition-colors">
          {value || '选择时间'}
        </div>
      </div>

      {showPicker && <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel} />
          <div className="bg-white rounded-t-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <button onClick={handleCancel} className="text-gray-500 px-4 py-2">取消</button>
              <span className="font-medium">{label}</span>
              <button onClick={handleConfirm} className="text-blue-600 px-4 py-2 font-medium">确定</button>
            </div>
            
            <div className="flex justify-center py-8 relative">
              <div className="flex space-x-8">
                {/* 小时选择器 */}
                <div className="relative h-120 w-20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-1/2 left-0 right-0 h-10 bg-blue-50 rounded-lg -translate-y-1/2" />
                  </div>
                  <div className="relative h-full overflow-y-auto snap-y snap-mandatory" onScroll={handleHourScroll}>
                    {hours.map(hour => <div key={hour} className={`h-10 flex items-center justify-center text-lg ${tempHour === hour ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                        {hour}
                      </div>)}
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-gray-400 flex items-center">:</div>
                
                {/* 分钟选择器 */}
                <div className="relative h-120 w-20">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute top-1/2 left-0 right-0 h-10 bg-blue-50 rounded-lg -translate-y-1/2" />
                  </div>
                  <div className="relative h-full overflow-y-auto snap-y snap-mandatory" onScroll={handleMinuteScroll}>
                    {minutes.map(minute => <div key={minute} className={`h-10 flex items-center justify-center text-lg ${tempMinute === minute ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                        {minute}
                      </div>)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center pb-4">
              <div className="text-2xl font-bold text-blue-600">
                {tempHour}:{tempMinute}
              </div>
            </div>
          </div>
        </div>}
    </div>;
}