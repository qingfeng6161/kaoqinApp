// @ts-ignore;
import React, { useState, useMemo } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { ChevronDown, ChevronUp, Calendar, Clock, User } from 'lucide-react';

// 格式化时间段显示
const formatPeriodDisplay = period => {
  if (!period || !period.start && !period.end) return null;
  const start = period.start || '--:--';
  const end = period.end || '--:--';
  const duration = period.duration || 0;
  return {
    timeRange: `${start} - ${end}`,
    duration: `${duration}h`
  };
};

// 获取员工姓名（包括已删除的员工）
const getEmployeeName = (employeeId, employees, record) => {
  const employee = employees.find(e => e.id === employeeId);
  return employee ? employee.name : record.employee_name || '未知员工';
};

// 生成详细记录数据
const generateDetailedRecords = (records, employees) => {
  return records.map(record => {
    const periods = record.periods || {};
    const employeeName = getEmployeeName(record.employee_id, employees, record);

    // 收集所有有效的时间段
    const validPeriods = [];
    if (periods.morning && (periods.morning.start || periods.morning.end)) {
      validPeriods.push({
        periodName: '上午',
        ...formatPeriodDisplay(periods.morning)
      });
    }
    if (periods.afternoon && (periods.afternoon.start || periods.afternoon.end)) {
      validPeriods.push({
        periodName: '下午',
        ...formatPeriodDisplay(periods.afternoon)
      });
    }
    if (periods.evening && (periods.evening.start || periods.evening.end)) {
      validPeriods.push({
        periodName: '晚上',
        ...formatPeriodDisplay(periods.evening)
      });
    }
    if (periods.other && (periods.other.start || periods.other.end)) {
      validPeriods.push({
        periodName: '其它',
        ...formatPeriodDisplay(periods.other)
      });
    }

    // 如果没有有效时间段，创建一个汇总记录
    if (validPeriods.length === 0) {
      return [{
        date: record.date,
        employeeName,
        periodName: '全天',
        timeRange: '--:-- - --:--',
        duration: `${record.summary?.total_hours || 0}h`,
        totalHours: record.summary?.total_hours || 0
      }];
    }

    // 为每个时间段创建单独的记录
    return validPeriods.map(period => ({
      date: record.date,
      employeeName,
      periodName: period.periodName,
      timeRange: period.timeRange,
      duration: period.duration,
      totalHours: record.summary?.total_hours || 0
    }));
  }).flat();
};
export function DetailedRecordsDisplay({
  attendanceRecords,
  employees,
  startDate,
  endDate,
  selectedEmployee
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 过滤记录
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords || attendanceRecords.length === 0) return [];
    return attendanceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const start = new Date(startDate);
      const end = new Date(endDate);

      // 确保日期在范围内
      const isInDateRange = recordDate >= start && recordDate <= end;

      // 员工筛选（包括已删除的员工）
      const isEmployeeMatch = selectedEmployee === 'all' || record.employee_id === selectedEmployee;
      return isInDateRange && isEmployeeMatch;
    });
  }, [attendanceRecords, startDate, endDate, selectedEmployee]);

  // 生成详细记录
  const detailedRecords = useMemo(() => {
    return generateDetailedRecords(filteredRecords, employees);
  }, [filteredRecords, employees]);

  // 按日期降序排序
  const sortedRecords = useMemo(() => {
    return [...detailedRecords].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [detailedRecords]);
  if (attendanceRecords.length === 0) {
    return null;
  }
  return <Card className="mt-6">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">详细记录显示</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="flex items-center space-x-1">
          {isExpanded ? <>
              <ChevronUp className="w-4 h-4" />
              <span>收起</span>
            </> : <>
              <ChevronDown className="w-4 h-4" />
              <span>展开</span>
            </>}
        </Button>
      </div>
      <p className="text-sm text-gray-600">
        {startDate} 至 {endDate}
        {selectedEmployee !== 'all' && ` - ${employees.find(e => e.id === selectedEmployee)?.name || '未知员工'}`}
        {isExpanded && ` - 共 ${sortedRecords.length} 条记录`}
      </p>
    </CardHeader>
    
    {isExpanded && <CardContent>
        {sortedRecords.length === 0 ? <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>所选时间段内无考勤记录</p>
          </div> : <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3">日期</th>
                  <th className="text-left py-2 px-3">员工姓名</th>
                  <th className="text-left py-2 px-3">时段</th>
                  <th className="text-left py-2 px-3">上班时间</th>
                  <th className="text-left py-2 px-3">下班时间</th>
                  <th className="text-left py-2 px-3">工时</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((record, index) => <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 font-medium">{record.date}</td>
                    <td className="py-2 px-3">{record.employeeName}</td>
                    <td className="py-2 px-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {record.periodName}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono text-sm">
                      {record.timeRange.split(' - ')[0]}
                    </td>
                    <td className="py-2 px-3 font-mono text-sm">
                      {record.timeRange.split(' - ')[1]}
                    </td>
                    <td className="py-2 px-3 font-semibold text-blue-600">
                      {record.duration}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>}
      </CardContent>}
  </Card>;
}