// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';

export function EmployeeSelector({
  value,
  onChange,
  employees = []
}) {
  if (!employees || employees.length === 0) {
    return <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="暂无员工" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="no-employee" disabled>请先添加员工</SelectItem>
        </SelectContent>
      </Select>;
  }
  return <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="请选择员工" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="placeholder" disabled>请选择员工</SelectItem>
        {employees.map(employee => <SelectItem key={employee.id} value={employee.id}>
            {employee.name}
          </SelectItem>)}
      </SelectContent>
    </Select>;
}