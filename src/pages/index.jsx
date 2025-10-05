// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// @ts-ignore;
import { LocalStorageManager } from '@/components/LocalStorageManager';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AttendanceEntry } from '@/components/AttendanceEntry';
import { StatisticsView } from '@/components/StatisticsView';
import { SettingsView } from '@/components/SettingsView';

// 主应用组件 - 安卓APK版本
export default function AttendanceApp(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('entry');
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 加载所有数据
  const loadAllData = () => {
    try {
      setEmployees(LocalStorageManager.employees.getAll());
      setAttendanceRecords(LocalStorageManager.records.getAll());
      setTemplates(LocalStorageManager.templates.getAll());
      setSettings(LocalStorageManager.settings.get());
      setIsLoading(false);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: "数据加载失败",
        description: "无法加载本地数据，请重试",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // 更新员工列表
  const handleEmployeesChange = newEmployees => {
    setEmployees(newEmployees);
  };

  // 更新考勤记录
  const handleRecordsChange = newRecords => {
    setAttendanceRecords(newRecords);
  };

  // 更新模板
  const handleTemplatesChange = newTemplates => {
    setTemplates(newTemplates);
  };

  // 更新设置
  const handleSettingsChange = newSettings => {
    setSettings(newSettings);
    LocalStorageManager.settings.update(newSettings);
  };

  // 初始化
  useEffect(() => {
    loadAllData();
  }, []);

  // 处理返回键（安卓特性）
  useEffect(() => {
    const handleBackButton = e => {
      if (activeTab !== 'entry') {
        e.preventDefault();
        setActiveTab('entry');
      }
    };

    // 添加返回键监听
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleBackButton);
      return () => window.removeEventListener('popstate', handleBackButton);
    }
  }, [activeTab]);
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载数据...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* 移动端头部 */}
      <MobileHeader title={activeTab === 'entry' ? '考勤录入' : activeTab === 'statistics' ? '考勤统计' : '设置'} />

      {/* 主内容区域 */}
      <div className="pb-20">
        {activeTab === 'entry' && <AttendanceEntry employees={employees} attendanceRecords={attendanceRecords} templates={templates} settings={settings} onEmployeesChange={handleEmployeesChange} onRecordsChange={handleRecordsChange} onTemplatesChange={handleTemplatesChange} />}
        
        {activeTab === 'statistics' && <StatisticsView attendanceRecords={attendanceRecords} employees={employees} />}
        
        {activeTab === 'settings' && <SettingsView settings={settings} onSettingsChange={handleSettingsChange} employees={employees} attendanceRecords={attendanceRecords} onEmployeesChange={handleEmployeesChange} onRecordsChange={handleRecordsChange} />}
      </div>

      {/* 底部导航 */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}