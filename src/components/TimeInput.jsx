// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Input } from '@/components/ui';
// @ts-ignore;
import { Clock } from 'lucide-react';

export function TimeInput({
  value,
  onChange,
  label
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const inputRef = useRef(null);
  const generateSuggestions = input => {
    if (!input) return [];
    const suggestions = [];
    const hour = parseInt(input);
    if (!isNaN(hour) && hour >= 0 && hour <= 23) {
      suggestions.push(`${hour.toString().padStart(2, '0')}:00`, `${hour.toString().padStart(2, '0')}:30`);
    }
    return suggestions;
  };
  const suggestions = generateSuggestions(inputValue);
  const handleInputChange = e => {
    const val = e.target.value;
    setInputValue(val);
    setShowSuggestions(true);
  };
  const handleSuggestionClick = time => {
    setInputValue(time);
    setShowSuggestions(false);
    onChange(time);
  };
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 200);
  };
  const handleInputBlur = () => {
    // 验证输入格式
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      onChange(inputValue);
    } else if (inputValue && !timeRegex.test(inputValue)) {
      // 尝试自动格式化
      const parts = inputValue.split(':');
      if (parts.length === 2) {
        const hour = parseInt(parts[0]);
        const minute = parseInt(parts[1]);
        if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
          const formatted = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          setInputValue(formatted);
          onChange(formatted);
        }
      }
    }
  };
  return <div className="relative">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-gray-500" />
        <Input ref={inputRef} type="text" placeholder="HH:MM" value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} className="w-24 text-center" maxLength={5} />
      </div>
      
      {showSuggestions && suggestions.length > 0 && <div className="absolute z-10 mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg">
          {suggestions.map(time => <div key={time} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => handleSuggestionClick(time)}>
              {time}
            </div>)}
        </div>}
    </div>;
}