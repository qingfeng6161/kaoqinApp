// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Clock } from 'lucide-react';

// @ts-ignore;
import { TimeInput30Min } from './TimeInput30Min';
export function TimeCard({
  title,
  startTime,
  endTime,
  duration,
  bonusHours,
  isCrossDay,
  onStartChange,
  onEndChange
}) {
  return <Card>
    <CardHeader>
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-600">上班时间</label>
          <TimeInput30Min value={startTime} onChange={onStartChange} placeholder="选择上班时间" />
        </div>
        <div>
          <label className="text-sm text-gray-600">下班时间</label>
          <TimeInput30Min value={endTime} onChange={onEndChange} placeholder="选择下班时间" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-gray-600">工作时长：</span>
          <span className="font-semibold">{duration}小时</span>
          {bonusHours > 0 && <span className="text-green-600 ml-1">(+{bonusHours}h)</span>}
        </div>
        {isCrossDay && <div className="text-xs text-orange-600">
            <Clock className="w-3 h-3 inline mr-1" />
            跨日班次
          </div>}
      </div>
    </CardContent>
  </Card>;
}