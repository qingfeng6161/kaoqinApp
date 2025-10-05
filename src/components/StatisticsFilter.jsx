// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Button } from '@/components/ui';
// @ts-ignore;
import { Calendar } from 'lucide-react';

export function StatisticsFilter({
  employees,
  selectedEmployee,
  onEmployeeChange,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) {
  return <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">选择员工</label>
        <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
          <SelectTrigger>
            <SelectValue placeholder="选择员工" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部员工</SelectItem>
            {employees.map(employee => <SelectItem key={employee.id} value={employee.id}>
                {employee.name}
              </SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          开始日期
        </label>
        <input type="date" value={startDate} onChange={e => onStartDateChange(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          结束日期
        </label>
        <input type="date" value={endDate} onChange={e => onEndDateChange(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
      </div>

      <div className="flex items-end">
        <Button variant="outline" className="w-full">
          查询
        </Button>
      </div>
    </div>;
}