// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Clock, BarChart3, Settings } from 'lucide-react';

export function MobileBottomNav({
  activeTab,
  onTabChange
}) {
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16">
        <Button variant="ghost" className={`flex flex-col items-center space-y-1 h-full w-1/3 rounded-none ${activeTab === 'entry' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-600'}`} onClick={() => onTabChange('entry')}>
          <Clock className="w-5 h-5" />
          <span className="text-xs">考勤</span>
        </Button>
        
        <Button variant="ghost" className={`flex flex-col items-center space-y-1 h-full w-1/3 rounded-none ${activeTab === 'statistics' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-600'}`} onClick={() => onTabChange('statistics')}>
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs">统计</span>
        </Button>
        
        <Button variant="ghost" className={`flex flex-col items-center space-y-1 h-full w-1/3 rounded-none ${activeTab === 'settings' ? 'text-blue-600 border-t-2 border-blue-600' : 'text-gray-600'}`} onClick={() => onTabChange('settings')}>
          <Settings className="w-5 h-5" />
          <span className="text-xs">设置</span>
        </Button>
      </div>
    </div>;
}