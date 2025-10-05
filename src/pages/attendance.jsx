// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, useToast, Tabs, TabsContent, TabsList, TabsTrigger, Input } from '@/components/ui';
// @ts-ignore;
import { Calendar, Save, BarChart3, Users, Clock, TrendingUp, AlertCircle, Plus, UserPlus } from 'lucide-react';

import { EmployeeSelector } from '@/components/EmployeeSelector';
import { MultiEmployeeSelector } from '@/components/MultiEmployeeSelector';
import { TimeCard } from '@/components/TimeCard';
import { StatisticsView } from '@/components/StatisticsView';
import { ShiftTemplateManager } from '@/components/ShiftTemplateManager';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmployeeManager } from '@/components/EmployeeManager';

/**
 * 计算班次时长，包含跨日奖励
 * 规则：当班次跨日（下班时间 < 上班时间）时，
 * 从0:00开始，每半小时额外增加0.25小时
 */
function calculateDurationWithBonus(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // 判断是否为跨日
  const isCrossDay = endMinutes < startMinutes;
  if (isCrossDay) {
    // 跨日情况：基础时长 + 奖励时长
    const totalMinutes = 24 * 60 - startMinutes + endMinutes;
    const baseHours = totalMinutes / 60;

    // 计算从0:00开始的跨日时长（分钟）
    const crossDayMinutes = endMinutes;

    // 每30分钟奖励0.25小时
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
    // 同一天内
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

// 增强的本地存储工具函数
const localStorageUtils = {
  // 员工管理
  addEmployee: name => {
    try {
      const employees = localStorageUtils.getEmployees();
      const newEmployee = {
        id: Date.now().toString(),
        name: name.trim(),
        createdAt: new Date().toISOString()
      };

      // 检查是否已存在同名员工
      const existingEmployee = employees.find(e => e.name === newEmployee.name);
      if (existingEmployee) {
        throw new Error(`员工"${name}"已存在`);
      }
      employees.push(newEmployee);
      localStorage.setItem('employees', JSON.stringify(employees));
      return newEmployee;
    } catch (error) {
      console.error('添加员工失败:', error);
      throw error;
    }
  },
  // 获取员工列表
  getEmployees: () => {
    try {
      const employees = localStorage.getItem('employees');
      if (!employees) {
        const defaultEmployees = [{
          id: '1',
          name: '张三',
          createdAt: new Date().toISOString()
        }, {
          id: '2',
          name: '李四',
          createdAt: new Date().toISOString()
        }, {
          id: '3',
          name: '王五',
          createdAt: new Date().toISOString()
        }];
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
        return defaultEmployees;
      }
      return JSON.parse(employees);
    } catch (error) {
      console.error('读取员工列表失败:', error);
      return [];
    }
  },
  // 删除员工
  removeEmployee: employeeId => {
    try {
      const employees = localStorageUtils.getEmployees();
      const filteredEmployees = employees.filter(e => e.id !== employeeId);
      localStorage.setItem('employees', JSON.stringify(filteredEmployees));
      return filteredEmployees;
    } catch (error) {
      console.error('删除员工失败:', error);
      throw error;
    }
  },
  // 验证员工是否存在
  validateEmployee: employeeId => {
    try {
      const employees = localStorageUtils.getEmployees();
      const employee = employees.find(e => e.id === employeeId);
      if (!employee) {
        throw new Error('员工信息不存在，请重新选择');
      }
      return employee;
    } catch (error) {
      console.error('验证员工失败:', error);
      throw error;
    }
  },
  // 获取某员工某天的记录
  getEmployeeDayRecord: (employeeId, date) => {
    try {
      const records = localStorageUtils.getAttendanceRecords();
      return records.find(r => r.employee_id === employeeId && r.date === record.date);
    } catch (error) {
      console.error('查询员工日记录失败:', error);
      return null;
    }
  },
  // 更新考勤记录（替换模式）
  updateAttendanceRecord: record => {
    try {
      const records = localStorageUtils.getAttendanceRecords();
      const index = records.findIndex(r => r.employee_id === record.employee_id && r.date === record.date);
      if (index !== -1) {
        record._id = records[index]._id;
        record.createdAt = records[index].createdAt;
        record.updatedAt = new Date().toISOString();
        records[index] = record;
      } else {
        record._id = Date.now().toString();
        record.createdAt = new Date().toISOString();
        record.updatedAt = new Date().toISOString();
        records.unshift(record);
      }
      localStorage.setItem('attendance_records', JSON.stringify(records));
      return record;
    } catch (error) {
      console.error('更新考勤记录失败:', error);
      throw error;
    }
  },
  // 批量更新考勤记录（替换模式）
  updateMultipleAttendanceRecords: records => {
    try {
      const allRecords = localStorageUtils.getAttendanceRecords();
      records.forEach(record => {
        const index = allRecords.findIndex(r => r.employee_id === record.employee_id && r.date === record.date);
        if (index !== -1) {
          record._id = allRecords[index]._id;
          record.createdAt = allRecords[index].createdAt;
          record.updatedAt = new Date().toISOString();
          allRecords[index] = record;
        } else {
          record._id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
          record.createdAt = new Date().toISOString();
          record.updatedAt = new Date().toISOString();
          allRecords.unshift(record);
        }
      });
      localStorage.setItem('attendance_records', JSON.stringify(allRecords));
      return records;
    } catch (error) {
      console.error('批量更新考勤记录失败:', error);
      throw error;
    }
  },
  getAttendanceRecords: () => {
    try {
      const records = localStorage.getItem('attendance_records');
      return records ? JSON.parse(records) : [];
    } catch (error) {
      console.error('读取考勤记录失败:', error);
      return [];
    }
  }
};

// 时间沿用功能工具
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
export default function AttendancePage(props) {
  const {
    $w
  } = props;
  const {
    toast
  } = useToast();
  const [activeTab, setActiveTab] = useState('entry');
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
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isAutoFillEnabled, setIsAutoFillEnabled] = useState(true);
  const [isMultiMode, setIsMultiMode] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSaveData, setPendingSaveData] = useState(null);
  const [employeesWithExistingRecords, setEmployeesWithExistingRecords] = useState([]);

  // 加载员工列表
  const loadEmployees = () => {
    try {
      const employeeList = localStorageUtils.getEmployees();
      setEmployees(employeeList);
      return employeeList;
    } catch (error) {
      console.error('加载员工列表失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载员工列表",
        variant: "destructive"
      });
      return [];
    }
  };

  // 加载考勤记录
  const loadAttendanceRecords = () => {
    try {
      const records = localStorageUtils.getAttendanceRecords();
      setAttendanceRecords(records);
    } catch (error) {
      console.error('加载考勤记录失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载考勤记录",
        variant: "destructive"
      });
    }
  };

  // 处理员工列表更新
  const handleEmployeesChange = updatedEmployees => {
    setEmployees(updatedEmployees);
  };

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

  // 检查是否有重复记录
  const checkExistingRecords = () => {
    const existingEmployees = [];
    const targetEmployees = isMultiMode ? selectedEmployees : [selectedEmployees[0]];
    targetEmployees.forEach(employeeId => {
      if (employeeId) {
        const existing = localStorageUtils.getEmployeeDayRecord(employeeId, date);
        if (existing) {
          const employee = employees.find(e => e.id === employeeId);
          existingEmployees.push({
            employeeId,
            employeeName: employee?.name || '未知员工',
            existingRecord: existing
          });
        }
      }
    });
    return existingEmployees;
  };

  // 处理保存前的检查
  const handleSaveWithCheck = () => {
    if (selectedEmployees.length === 0) {
      toast({
        title: "请选择员工",
        variant: "destructive"
      });
      return;
    }
    const existingRecords = checkExistingRecords();
    if (existingRecords.length > 0) {
      setEmployeesWithExistingRecords(existingRecords);
      setPendingSaveData({
        records: existingRecords,
        isMultiMode: isMultiMode,
        targetEmployees: isMultiMode ? selectedEmployees : [selectedEmployees[0]]
      });
      setShowConfirmDialog(true);
    } else {
      // 没有重复记录，直接保存
      performSave();
    }
  };

  // 执行保存操作
  const performSave = () => {
    try {
      const targetEmployees = isMultiMode ? selectedEmployees : [selectedEmployees[0]];
      const recordsToSave = targetEmployees.map(employeeId => {
        const employee = localStorageUtils.validateEmployee(employeeId);
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
      if (isMultiMode) {
        localStorageUtils.updateMultipleAttendanceRecords(recordsToSave);
      } else {
        localStorageUtils.updateAttendanceRecord(recordsToSave[0]);
      }
      timePersistence.saveLastTimeConfig(times);
      const message = isMultiMode ? `成功为 ${targetEmployees.length} 名员工保存考勤记录` : `考勤记录已保存！总工作时长: ${getTotalDuration()}小时${getTotalBonus() > 0 ? ` (含跨日奖励: ${getTotalBonus()}小时)` : ''}`;
      toast({
        title: "考勤记录已保存",
        description: message,
        duration: 3000
      });
      loadAttendanceRecords();
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

  // 初始化数据
  useEffect(() => {
    loadEmployees();
    loadAttendanceRecords();
  }, []);
  return <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entry">
              <Clock className="w-4 h-4 mr-2" />
              考勤录入
            </TabsTrigger>
            <TabsTrigger value="statistics">
              <BarChart3 className="w-4 h-4 mr-2" />
              考勤统计
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entry">
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h1 className="text-xl font-bold text-center mb-4">考勤录入</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 左侧：员工管理 */}
                  <div className="lg:col-span-1">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">日期</label>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="flex-1 px-3 py-2 border rounded-md" />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">录入模式</label>
                        <div className="flex space-x-2">
                          <Button size="sm" variant={!isMultiMode ? "default" : "outline"} onClick={() => setIsMultiMode(false)} className="flex-1">
                            单人录入
                          </Button>
                          <Button size="sm" variant={isMultiMode ? "default" : "outline"} onClick={() => setIsMultiMode(true)} className="flex-1">
                            多人录入
                          </Button>
                        </div>
                      </div>

                      <EmployeeManager employees={employees} onEmployeesChange={handleEmployeesChange} selectedEmployees={selectedEmployees} onSelectionChange={setSelectedEmployees} isMultiMode={isMultiMode} />

                      {isMultiMode ? <MultiEmployeeSelector employees={employees} selectedEmployees={selectedEmployees} onSelectionChange={setSelectedEmployees} /> : <EmployeeSelector value={selectedEmployees[0] || ''} onChange={id => setSelectedEmployees(id ? [id] : [])} employees={employees} />}
                    </div>
                  </div>

                  {/* 右侧：时间设置 */}
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg shadow-sm p-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input type="checkbox" checked={isAutoFillEnabled} onChange={e => setIsAutoFillEnabled(e.target.checked)} className="rounded" />
                          <span className="text-sm">启用时间沿用功能</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          切换员工时自动填入上次的时间配置
                        </p>
                      </div>

                      <ShiftTemplateManager onTemplateSelect={applyTemplate} onTemplatesUpdate={() => {}} />

                      <TimeCard title="上午" startTime={times.morning.start} endTime={times.morning.end} duration={times.morning.duration} bonusHours={times.morning.bonusHours} isCrossDay={times.morning.isCrossDay} onStartChange={time => updateDuration('morning', 'start', time)} onEndChange={time => updateDuration('morning', 'end', time)} />

                      <TimeCard title="下午" startTime={times.afternoon.start} endTime={times.afternoon.end} duration={times.afternoon.duration} bonusHours={times.afternoon.bonusHours} isCrossDay={times.afternoon.isCrossDay} onStartChange={time => updateDuration('afternoon', 'start', time)} onEndChange={time => updateDuration('afternoon', 'end', time)} />

                      <TimeCard title="晚上" startTime={times.evening.start} endTime={times.evening.end} duration={times.evening.duration} bonusHours={times.evening.bonusHours} isCrossDay={times.evening.isCrossDay} onStartChange={time => updateDuration('evening', 'start', time)} onEndChange={time => updateDuration('evening', 'end', time)} />

                      <TimeCard title="其它" startTime={times.other.start} endTime={times.other.end} duration={times.other.duration} bonusHours={times.other.bonusHours} isCrossDay={times.other.isCrossDay} onStartChange={time => updateDuration('other', 'start', time)} onEndChange={time => updateDuration('other', 'end', time)} />

                      <div className="bg-white rounded-lg shadow-sm p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold">总工作时长</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">{getTotalDuration()}小时</span>
                            {getTotalBonus() > 0 && <div className="text-sm text-green-600">
                                含奖励: {getTotalBonus()}小时
                              </div>}
                          </div>
                        </div>
                        {Object.entries(times).filter(([_, period]) => period.isCrossDay).length > 0 && <div className="mt-2 text-sm text-orange-600">
                            ⚠️ 包含跨日班次，已计算额外奖励
                          </div>}
                      </div>

                      <Button onClick={handleSaveWithCheck} className="w-full" size="lg">
                        <Save className="w-4 h-4 mr-2" />
                        {isMultiMode ? `为 ${selectedEmployees.length} 名员工保存考勤记录` : '保存考勤记录'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <StatisticsView attendanceRecords={attendanceRecords} employees={employees} />
          </TabsContent>
        </Tabs>

        {/* 确认对话框 */}
        <ConfirmDialog isOpen={showConfirmDialog} onClose={() => {
        setShowConfirmDialog(false);
        setPendingSaveData(null);
        setEmployeesWithExistingRecords([]);
      }} onConfirm={performSave} title="确认替换考勤记录" message={employeesWithExistingRecords.length === 1 ? `员工 ${employeesWithExistingRecords[0].employeeName} 在 ${date} 已有考勤记录，是否用新时间替换原记录？` : `${employeesWithExistingRecords.length} 名员工在 ${date} 已有考勤记录，是否用新时间替换原记录？`} confirmText="替换" cancelText="取消" confirmVariant="destructive" />
      </div>
    </div>;
}