// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, Clock, Users } from 'lucide-react';

export function StatisticsSummary({
  filteredRecords,
  employees,
  selectedEmployee,
  startDate,
  endDate
}) {
  // 计算统计数据
  const calculateStats = () => {
    const stats = {
      totalHours: 0,
      totalDays: 0,
      totalEmployees: 0,
      averageHours: 0,
      employeeStats: {}
    };

    // 按员工分组统计
    const employeeGroups = {};
    filteredRecords.forEach(record => {
      const employeeId = record.employee_id;
      if (!employeeGroups[employeeId]) {
        employeeGroups[employeeId] = {
          employeeId,
          employeeName: record.employee_name,
          totalHours: 0,
          totalDays: 0
        };
      }

      // 累加总工时
      const hours = record.summary?.total_hours || 0;
      employeeGroups[employeeId].totalHours += hours;
      employeeGroups[employeeId].totalDays = +(employeeGroups[employeeId].totalHours / 9).toFixed(2);
      stats.totalHours += hours;
    });
    stats.employeeStats = Object.values(employeeGroups);
    stats.totalEmployees = stats.employeeStats.length;
    stats.totalDays = +(stats.totalHours / 9).toFixed(2);
    stats.averageHours = stats.totalEmployees > 0 ? +(stats.totalHours / stats.totalEmployees).toFixed(2) : 0;
    return stats;
  };
  const stats = calculateStats();
  return <Card>
    <CardHeader>
      <CardTitle className="text-lg">统计概览</CardTitle>
      <p className="text-sm text-gray-600">
        {startDate} 至 {endDate}
        {selectedEmployee !== 'all' && ` - ${employees.find(e => e.id === selectedEmployee)?.name}`}
      </p>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">总工时</p>
              <p className="text-2xl font-bold text-blue-600">{stats.totalHours.toFixed(2)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">折算天数</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalDays}天</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">参与员工</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalEmployees}人</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">人均工时</p>
              <p className="text-2xl font-bold text-orange-600">{stats.averageHours}h</p>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>;
}