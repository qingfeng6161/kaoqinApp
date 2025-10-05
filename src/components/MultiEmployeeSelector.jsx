// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { CheckSquare, Square } from 'lucide-react';

export function MultiEmployeeSelector({
  employees,
  selectedEmployees,
  onSelectionChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredEmployees = employees.filter(employee => employee.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const toggleEmployee = employeeId => {
    const newSelection = selectedEmployees.includes(employeeId) ? selectedEmployees.filter(id => id !== employeeId) : [...selectedEmployees, employeeId];
    onSelectionChange(newSelection);
  };
  const selectAll = () => {
    onSelectionChange(employees.map(e => e.id));
  };
  const clearAll = () => {
    onSelectionChange([]);
  };
  return <Card>
      <CardHeader>
        <CardTitle className="text-base">选择员工</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input type="text" placeholder="搜索员工..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="flex-1 px-3 py-2 border rounded-md text-sm" />
            <Button size="sm" variant="outline" onClick={selectAll}>
              全选
            </Button>
            <Button size="sm" variant="outline" onClick={clearAll}>
              清空
            </Button>
          </div>

          <div className="max-h-48 overflow-y-auto border rounded-md">
            {filteredEmployees.map(employee => <div key={employee.id} className="flex items-center p-2 hover:bg-gray-50 cursor-pointer" onClick={() => toggleEmployee(employee.id)}>
                {selectedEmployees.includes(employee.id) ? <CheckSquare className="w-4 h-4 text-blue-600 mr-2" /> : <Square className="w-4 h-4 text-gray-400 mr-2" />}
                <span className="text-sm">{employee.name}</span>
              </div>)}
          </div>

          <div className="text-sm text-gray-600">
            已选择 {selectedEmployees.length} 人
          </div>
        </div>
      </CardContent>
    </Card>;
}