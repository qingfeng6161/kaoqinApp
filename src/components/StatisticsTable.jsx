// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { AlertCircle } from 'lucide-react';

// 考勤完整性检查函数
const checkAttendanceCompleteness = record => {
  const issues = [];
  const periods = record.periods || {};
  Object.entries(periods).forEach(([periodName, period]) => {
    if (period.start && !period.end) {
      issues.push({
        period: periodName,
        type: 'missing_end',
        message: `${getPeriodLabel(periodName)}缺少下班时间`
      });
    }
    if (!period.start && period.end) {
      issues.push({
        period: periodName,
        type: 'missing_start',
        message: `${getPeriodLabel(periodName)}缺少上班时间`
      });
    }
  });
  return issues;
};
const getPeriodLabel = periodName => {
  const labels = {
    morning: '上午',
    afternoon: '下午',
    evening: '晚上',
    other: '其它'
  };
  return labels[periodName] || periodName;
};

// 计算员工在时间段内的总工时和折算天数
const calculateEmployeeStats = (records, employeeId) => {
  const employeeRecords = records.filter(r => r.employee_id === employeeId);
  const totalHours = employeeRecords.reduce((sum, record) => sum + (record.summary?.total_hours || 0), 0);
  const convertedDays = +(totalHours / 9).toFixed(2);
  return {
    totalHours: totalHours.toFixed(2),
    convertedDays
  };
};
export function StatisticsTable({
  filteredRecords,
  employees,
  selectedEmployee,
  startDate,
  endDate
}) {
  if (filteredRecords.length === 0) {
    return <Card>
      <CardContent className="pt-6">
        <div className="text-center text-gray-500 py-8">
          <p>暂无考勤记录</p>
          <p className="text-sm mt-2">请先在"考勤录入"页面添加记录</p>
        </div>
      </CardContent>
    </Card>;
  }

  // 按员工分组统计
  const employeeStats = {};
  filteredRecords.forEach(record => {
    const employeeId = record.employee_id;
    if (!employeeStats[employeeId]) {
      employeeStats[employeeId] = {
        employeeId,
        employeeName: record.employee_name,
        records: [],
        totalHours: 0,
        convertedDays: 0
      };
    }
    employeeStats[employeeId].records.push(record);
    employeeStats[employeeId].totalHours += record.summary?.total_hours || 0;
    employeeStats[employeeId].convertedDays = +(employeeStats[employeeId].totalHours / 9).toFixed(2);
  });
  const employeeList = Object.values(employeeStats).sort((a, b) => b.totalHours - a.totalHours);
  return <Card>
    <CardHeader>
      <CardTitle className="text-lg">
        员工考勤统计
        {selectedEmployee !== 'all' && ` - ${employees.find(e => e.id === selectedEmployee)?.name}`}
      </CardTitle>
      <p className="text-sm text-gray-600">
        {startDate} 至 {endDate}
      </p>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2">员工姓名</th>
              <th className="text-left py-2 px-2">记录天数</th>
              <th className="text-left py-2 px-2">总时数(小时)</th>
              <th className="text-left py-2 px-2">折算天数</th>
              <th className="text-left py-2 px-2">平均工时/天</th>
            </tr>
          </thead>
          <tbody>
            {employeeList.map((employee, index) => <tr key={employee.employeeId} className="border-b hover:bg-gray-50">
                <td className="py-2 px-2 font-medium">{employee.employeeName}</td>
                <td className="py-2 px-2">{employee.records.length}天</td>
                <td className="py-2 px-2 font-semibold text-blue-600">{employee.totalHours.toFixed(2)}</td>
                <td className="py-2 px-2 font-semibold text-green-600">{employee.convertedDays}</td>
                <td className="py-2 px-2">
                  {employee.records.length > 0 ? (employee.totalHours / employee.records.length).toFixed(2) : '0.00'}h
                </td>
              </tr>)}
          </tbody>
        </table>
      </div>
      
      {employeeList.length === 0 && <div className="text-center py-8 text-gray-500">
          <p>所选时间段内无考勤记录</p>
        </div>}
    </CardContent>
  </Card>;
}