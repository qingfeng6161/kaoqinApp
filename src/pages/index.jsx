// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// @ts-ignore
import { LocalStorageManager } from '@/components/LocalStorageManager';
import { MobileHeader } from '@/components/MobileHeader';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AttendanceEntry } from '@/components/AttendanceEntry';
import { StatisticsView } from '@/components/StatisticsView';
import { SettingsView } from '@/components/SettingsView';

// Main application component - Android APK version
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

  // Load all data
  const loadAllData = () => {
    try {
      setEmployees(LocalStorageManager.employees.getAll());
      setAttendanceRecords(LocalStorageManager.records.getAll());
      setTemplates(LocalStorageManager.templates.getAll());
      setSettings(LocalStorageManager.settings.get());
      setIsLoading(false);
    } catch (error) {
      console.error('Load data failed:', error);
      toast({
        title: "Data loading failed",
        description: "Cannot load local data, please try again",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Update employee list
  const handleEmployeesChange = newEmployees => {
    setEmployees(newEmployees);
  };

  // Update attendance records
  const handleRecordsChange = newRecords => {
    setAttendanceRecords(newRecords);
  };

  // Update templates
  const handleTemplatesChange = newTemplates => {
    setTemplates(newTemplates);
  };

  // Update settings
  const handleSettingsChange = newSettings => {
    setSettings(newSettings);
    LocalStorageManager.settings.update(newSettings);
  };

  // Initialize
  useEffect(() => {
    loadAllData();
  }, []);

  // Handle back button (Android feature)
  useEffect(() => {
    const handleBackButton = e => {
      if (activeTab !== 'entry') {
        e.preventDefault();
        setActiveTab('entry');
      }
    };

    // Add back button listener
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleBackButton);
      return () => window.removeEventListener('popstate', handleBackButton);
    }
  }, [activeTab]);
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <MobileHeader title={activeTab === 'entry' ? 'Attendance Entry' : activeTab === 'statistics' ? 'Statistics' : 'Settings'} />

      {/* Main content area */}
      <div className="pb-20">
        {activeTab === 'entry' && <AttendanceEntry employees={employees} attendanceRecords={attendanceRecords} templates={templates} settings={settings} onEmployeesChange={handleEmployeesChange} onRecordsChange={handleRecordsChange} onTemplatesChange={handleTemplatesChange} />}
        
        {activeTab === 'statistics' && <StatisticsView attendanceRecords={attendanceRecords} employees={employees} />}
        
        {activeTab === 'settings' && <SettingsView settings={settings} onSettingsChange={handleSettingsChange} employees={employees} attendanceRecords={attendanceRecords} onEmployeesChange={handleEmployeesChange} onRecordsChange={handleRecordsChange} />}
      </div>

      {/* Bottom navigation */}
      <MobileBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>;
}