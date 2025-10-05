// @ts-ignore;
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { Calendar } from 'lucide-react';

import { StatisticsFilter } from './StatisticsFilter';
import { StatisticsSummary } from './StatisticsSummary';
import { StatisticsTable } from './StatisticsTable';
import { ExportButtons } from './ExportButtons';
import { DetailedRecordsDisplay } from './DetailedRecordsDisplay';
export function StatisticsView({
  attendanceRecords,
  employees
}) {
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // 默认显示最近30天
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

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
  }, [attendanceRecords, selectedEmployee, startDate, endDate]);
  return <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">考勤统计</CardTitle>
        </CardHeader>
        <CardContent>
          <StatisticsFilter employees={employees} selectedEmployee={selectedEmployee} onEmployeeChange={setSelectedEmployee} startDate={startDate} endDate={endDate} onStartDateChange={setStartDate} onEndDateChange={setEndDate} />
        </CardContent>
      </Card>

      <StatisticsSummary filteredRecords={filteredRecords} employees={employees} selectedEmployee={selectedEmployee} startDate={startDate} endDate={endDate} />

      <StatisticsTable filteredRecords={filteredRecords} employees={employees} selectedEmployee={selectedEmployee} startDate={startDate} endDate={endDate} />

      <DetailedRecordsDisplay attendanceRecords={attendanceRecords} employees={employees} selectedEmployee={selectedEmployee} startDate={startDate} endDate={endDate} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">数据导出</CardTitle>
        </CardHeader>
        <CardContent>
          <ExportButtons filteredRecords={filteredRecords} employees={employees} selectedEmployee={selectedEmployee} startDate={startDate} endDate={endDate} />
        </CardContent>
      </Card>
    </div>;
}