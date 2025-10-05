// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Button, useToast, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Calendar, Clock, Save, Users, Settings, Plus, UserPlus } from 'lucide-react';

import { EmployeeSelector } from './EmployeeSelector';
import { MultiEmployeeSelector } from './MultiEmployeeSelector';
import { TimeCard } from './TimeCard';
import { ShiftTemplateManager } from './ShiftTemplateManager';
import { EmployeeManager } from './EmployeeManager';
import { LocalStorageManager } from './LocalStorageManager';

// 计算班次时长，包含跨日奖励
function calculateDurationWithBonus(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // 判断是否为跨日
  const isCrossDay = endMinutes < startMinutes;
  if (isCrossDay) {
    const totalMinutes = 24 * 60 - startMinutes + endMinutes;
    const baseHours = totalMinutes / 60;
    const crossDayMinutes = endMinutes;
    const bonusIntervals = Math.floor(crossDayMinutes / 30);
    const bonusHours = bonusIntervals * 0.25;
    const totalHours = baseHours + bonusHours;
    return {
      duration: Math.round(totalHours * 100) / 100,
      baseHours: Math.round(baseHours * 100) / 100,
      bonusHours: Math.round(bonusHours * 100) / 100,
      isCrossDay: true,
      crossDayMinutes: crossDayMinutes
    };
  } else {
    const duration = (endMinutes - startMinutes) / 60;
    return {
      duration: Math.round(duration * 100) / 100,
      baseHours: Math.round(duration * 100) / 100,
      bonusHours: 0,
      isCrossDay: false,
      crossDayMinutes: 0
    };
  }
}

// 时间配置管理
const timePersistence = {
  saveLastTimeConfig: times => {
    try {
      const config = {
        morning: {
          start: times.morning.start,
          end: times.morning.end
        },
        afternoon: {
          start: times.afternoon.start,
          end: times.afternoon.end
        },
        evening: {
          start: times.evening.start,
          end: times.evening.end
        },
        other: {
          start: times.other.start,
          end: times.other.end
        }
      };
      localStorage.setItem('last_time_config', JSON.stringify(config));
    } catch (error) {
      console.error('保存时间配置失败:', error);
    }
  },
  getLastTimeConfig: () => {
    try {
      const config = localStorage.getItem('last_time_config');
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('读取时间配置失败:', error);
      return null;
    }
  },
  applyTimeConfig: config => {
    if (!config) return null;
    const newTimes = {
      morning: {
        start: config.morning?.start || '',
        end: config.morning?.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      afternoon: {
        start: config.afternoon?.start || '',
        end: config.afternoon?.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      evening: {
        start: config.evening?.start || '',
        end: config.evening?.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      other: {
        start: config.other?.start || '',
        end: config.other?.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      }
    };
    Object.keys(newTimes).forEach(period => {
      const start = newTimes[period].start;
      const end = newTimes[period].end;
      if (start && end) {
        const result = calculateDurationWithBonus(start, end);
        newTimes[period] = {
          ...newTimes[period],
          ...result
        };
      }
    });
    return newTimes;
  }
};
export function AttendanceEntry({
  employees,
  attendanceRecords,
  templates,
  settings,
  onEmployeesChange,
  onRecordsChange,
  onTemplatesChange
}) {
  const {
    toast
  } = useToast();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [times, setTimes] = useState({
    morning: {
      start: '',
      end: '',
      duration: 0,
      baseHours: 0,
      bonusHours: 0,
      isCrossDay: false
    },
    afternoon: {
      start: '',
      end: '',
      duration: 0,
      baseHours: 0,
      bonusHours: 0,
      isCrossDay: false
    },
    evening: {
      start: '',
      end: '',
      duration: 0,
      baseHours: 0,
      bonusHours: 0,
      isCrossDay: false
    },
    other: {
      start: '',
      end: '',
      duration: 0,
      baseHours: 0,
      bonusHours: 0,
      isCrossDay: false
    }
  });
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [isAutoFillEnabled, setIsAutoFillEnabled] = useState(true);

  // 更新时段时长
  const updateDuration = (period, field, value) => {
    setTimes(prev => {
      const newTimes = {
        ...prev
      };
      newTimes[period][field] = value;
      const start = newTimes[period].start;
      const end = newTimes[period].end;
      if (start && end) {
        const result = calculateDurationWithBonus(start, end);
        newTimes[period] = {
          ...newTimes[period],
          ...result
        };
      } else {
        newTimes[period].duration = 0;
        newTimes[period].baseHours = 0;
        newTimes[period].bonusHours = 0;
        newTimes[period].isCrossDay = false;
      }
      return newTimes;
    });
  };

  // 应用模板
  const applyTemplate = templateData => {
    const newTimes = {
      morning: {
        start: templateData.morning.start || '',
        end: templateData.morning.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      afternoon: {
        start: templateData.afternoon.start || '',
        end: templateData.afternoon.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      evening: {
        start: templateData.evening.start || '',
        end: templateData.evening.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      other: {
        start: templateData.other.start || '',
        end: templateData.other.end || '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      }
    };
    Object.keys(newTimes).forEach(period => {
      const start = newTimes[period].start;
      const end = newTimes[period].end;
      if (start && end) {
        const result = calculateDurationWithBonus(start, end);
        newTimes[period] = {
          ...newTimes[period],
          ...result
        };
      }
    });
    setTimes(newTimes);
  };

  // 重置表单
  const resetForm = () => {
    setTimes({
      morning: {
        start: '',
        end: '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      afternoon: {
        start: '',
        end: '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      evening: {
        start: '',
        end: '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      },
      other: {
        start: '',
        end: '',
        duration: 0,
        baseHours: 0,
        bonusHours: 0,
        isCrossDay: false
      }
    });
  };

  // 应用上次的时间配置
  const applyLastTimeConfig = () => {
    if (!isAutoFillEnabled) return;
    const lastConfig = timePersistence.getLastTimeConfig();
    if (lastConfig) {
      const newTimes = timePersistence.applyTimeConfig(lastConfig);
      if (newTimes) {
        setTimes(newTimes);
        toast({
          title: "时间已沿用",
          description: "已自动填入上次的时间配置",
          duration: 2000
        });
      }
    }
  };
  const getTotalDuration = () => {
    return Object.values(times).reduce((sum, period) => sum + period.duration, 0);
  };
  const getTotalBonus = () => {
    return Object.values(times).reduce((sum, period) => sum + period.bonusHours, 0);
  };

  // 保存考勤记录
  const handleSave = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "请选择员工",
        variant: "destructive"
      });
      return;
    }
    try {
      const targetEmployees = isMultiMode ? selectedEmployees : [selectedEmployees[0]];
      const recordsToSave = targetEmployees.map(employeeId => {
        const employee = employees.find(e => e.id === employeeId);
        if (!employee) throw new Error('员工不存在');
        return {
          employee_id: employeeId,
          employee_name: employee.name,
          date: date,
          periods: {
            morning: {
              start: times.morning.start || '',
              end: times.morning.end || '',
              duration: times.morning.duration || 0,
              base_hours: times.morning.baseHours || 0,
              bonus_hours: times.morning.bonusHours || 0,
              is_cross_day: times.morning.isCrossDay || false
            },
            afternoon: {
              start: times.afternoon.start || '',
              end: times.afternoon.end || '',
              duration: times.afternoon.duration || 0,
              base_hours: times.afternoon.baseHours || 0,
              bonus_hours: times.afternoon.bonusHours || 0,
              is_cross_day: times.afternoon.isCrossDay || false
            },
            evening: {
              start: times.evening.start || '',
              end: times.evening.end || '',
              duration: times.evening.duration || 0,
              base_hours: times.evening.baseHours || 0,
              bonus_hours: times.evening.bonusHours || 0,
              is_cross_day: times.evening.isCrossDay || false
            },
            other: {
              start: times.other.start || '',
              end: times.other.end || '',
              duration: times.other.duration || 0,
              base_hours: times.other.baseHours || 0,
              bonus_hours: times.other.bonusHours || 0,
              is_cross_day: times.other.isCrossDay || false
            }
          },
          summary: {
            total_hours: getTotalDuration(),
            total_base_hours: Object.values(times).reduce((sum, p) => sum + p.baseHours, 0),
            total_bonus_hours: getTotalBonus(),
            cross_day_periods: Object.values(times).filter(p => p.isCrossDay).length
          },
          status: '正常',
          notes: ''
        };
      });
      LocalStorageManager.records.bulkUpdate(recordsToSave);
      timePersistence.saveLastTimeConfig(times);
      const message = isMultiMode ? `成功为 ${targetEmployees.length} 名员工保存考勤记录` : `考勤记录已保存！总工作时长: ${getTotalDuration()}小时${getTotalBonus() > 0 ? ` (含跨日奖励: ${getTotalBonus()}小时)` : ''}`;
      toast({
        title: "考勤记录已保存",
        description: message,
        duration: 3000
      });

      // 重新加载数据
      onRecordsChange(LocalStorageManager.records.getAll());
      setSelectedEmployees([]);
      resetForm();
    } catch (error) {
      toast({
        title: "保存失败",
        description: error.message || "保存考勤记录时发生错误",
        variant: "destructive"
      });
    }
  };

  // 初始化
  useEffect(() => {
    applyLastTimeConfig();
  }, []);
  return <div className="space-y-4 px-4 pt-4">
      {/* 日期选择 */}
      <Card>
        <CardContent className="pt-4">
          <label className="text-sm font-medium mb-2 block">日期</label>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 px-3 py-2 border rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* 录入模式 */}
      <Card>
        <CardContent className="pt-4">
          <label className="text-sm font-medium mb-2 block">录入模式</label>
          <div className="flex space-x-2">
            <Button size="sm" variant={!isMultiMode ? "default" : "outline"} onClick={() => setIsMultiMode(false)} className="flex-1">
              单人录入
            </Button>
            <Button size="sm" variant={isMultiMode ? "default" : "outline"} onClick={() => setIsMultiMode(true)} className="flex-1">
              多人录入
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 员工管理 */}
      <EmployeeManager employees={employees} onEmployeesChange={onEmployeesChange} selectedEmployees={selectedEmployees} onSelectionChange={setSelectedEmployees} isMultiMode={isMultiMode} />

      {/* 员工选择 */}
      <Card>
        <CardContent className="pt-4">
          {isMultiMode ? <MultiEmployeeSelector employees={employees} selectedEmployees={selectedEmployees} onSelectionChange={setSelectedEmployees} /> : <EmployeeSelector value={selectedEmployees[0] || ''} onChange={id => setSelectedEmployees(id ? [id] : [])} employees={employees} />}
        </CardContent>
      </Card>

      {/* 模板管理 */}
      <Card>
        <CardContent className="pt-4">
          <ShiftTemplateManager onTemplateSelect={applyTemplate} onTemplatesChange={onTemplatesChange} templates={templates} />
        </CardContent>
      </Card>

      {/* 时间设置 */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" checked={isAutoFillEnabled} onChange={e => setIsAutoFillEnabled(e.target.checked)} className="rounded" />
              <span className="text-sm">启用时间沿用功能</span>
            </label>

            <TimeCard title="上午" startTime={times.morning.start} endTime={times.morning.end} duration={times.morning.duration} bonusHours={times.morning.bonusHours} isCrossDay={times.morning.isCrossDay} onStartChange={time => updateDuration('morning', 'start', time)} onEndChange={time => updateDuration('morning', 'end', time)} />

            <TimeCard title="下午" startTime={times.afternoon.start} endTime={times.afternoon.end} duration={times.afternoon.duration} bonusHours={times.afternoon.bonusHours} isCrossDay={times.afternoon.isCrossDay} onStartChange={time => updateDuration('afternoon', 'start', time)} onEndChange={time => updateDuration('afternoon', 'end', time)} />

            <TimeCard title="晚上" startTime={times.evening.start} endTime={times.evening.end} duration={times.evening.duration} bonusHours={times.evening.bonusHours} isCrossDay={times.evening.isCrossDay} onStartChange={time => updateDuration('evening', 'start', time)} onEndChange={time => updateDuration('evening', 'end', time)} />

            <TimeCard title="其它" startTime={times.other.start} endTime={times.other.end} duration={times.other.duration} bonusHours={times.other.bonusHours} isCrossDay={times.other.isCrossDay} onStartChange={time => updateDuration('other', 'start', time)} onEndChange={time => updateDuration('other', 'end', time)} />
          </div>
        </CardContent>
      </Card>

      {/* 统计信息 */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">总工作时长</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-blue-600">{getTotalDuration()}小时</span>
              {getTotalBonus() > 0 && <div className="text-sm text-green-600">含奖励: {getTotalBonus()}小时</div>}
            </div>
          </div>
          {Object.values(times).filter(p => p.isCrossDay).length > 0 && <div className="mt-2 text-sm text-orange-600">⚠️ 包含跨日班次，已计算额外奖励</div>}
        </CardContent>
      </Card>

      {/* 保存按钮 */}
      <Button onClick={handleSave} className="w-full" size="lg">
        <Save className="w-4 h-4 mr-2" />
        {isMultiMode ? `为 ${selectedEmployees.length} 名员工保存考勤记录` : '保存考勤记录'}
      </Button>
    </div>;
}