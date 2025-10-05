// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Download, Upload, Trash2, Settings, Moon, Sun } from 'lucide-react';

// @ts-ignore;
import { LocalStorageManager } from './LocalStorageManager';
export function SettingsView({
  settings,
  onSettingsChange,
  employees,
  attendanceRecords,
  onEmployeesChange,
  onRecordsChange
}) {
  const [backupData, setBackupData] = useState('');

  // 导出数据
  const handleExport = () => {
    try {
      const data = LocalStorageManager.backup.export();
      const blob = new Blob([data], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `考勤数据备份_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('导出失败：' + error.message);
    }
  };

  // 导入数据
  const handleImport = event => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        LocalStorageManager.backup.import(e.target.result);
        alert('数据导入成功！请刷新页面。');
        window.location.reload();
      } catch (error) {
        alert('导入失败：' + error.message);
      }
    };
    reader.readAsText(file);
  };

  // 清空所有数据
  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
      localStorage.removeItem(LocalStorageManager.KEYS.EMPLOYEES);
      localStorage.removeItem(LocalStorageManager.KEYS.RECORDS);
      localStorage.removeItem(LocalStorageManager.KEYS.TEMPLATES);
      localStorage.removeItem(LocalStorageManager.KEYS.SETTINGS);
      alert('所有数据已清空！');
      window.location.reload();
    }
  };

  // 统计信息
  const stats = {
    totalEmployees: employees.length,
    totalRecords: attendanceRecords.length,
    dataSize: JSON.stringify({
      employees,
      records: attendanceRecords,
      templates: LocalStorageManager.templates.getAll(),
      settings
    }).length
  };
  return <div className="space-y-4 px-4 pt-4">
      {/* 应用信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">应用信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>应用名称：</span>
              <span className="font-medium">考勤助手</span>
            </div>
            <div className="flex justify-between">
              <span>版本：</span>
              <span className="font-medium">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>数据存储：</span>
              <span className="font-medium text-green-600">本地存储</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>员工数量：</span>
              <span className="font-medium">{stats.totalEmployees}人</span>
            </div>
            <div className="flex justify-between">
              <span>考勤记录：</span>
              <span className="font-medium">{stats.totalRecords}条</span>
            </div>
            <div className="flex justify-between">
              <span>数据大小：</span>
              <span className="font-medium">{(stats.dataSize / 1024).toFixed(1)}KB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据管理</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={handleExport} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出数据备份
          </Button>
          
          <label className="w-full">
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            <Button className="w-full" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              导入数据备份
            </Button>
          </label>
          
          <Button onClick={handleClearAll} className="w-full" variant="destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            清空所有数据
          </Button>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>• 所有数据保存在手机本地，不会上传到云端</p>
            <p>• 定期导出备份，防止数据丢失</p>
            <p>• 支持离线使用，无需网络连接</p>
            <p>• 跨日班次自动计算奖励工时</p>
          </div>
        </CardContent>
      </Card>
    </div>;
}