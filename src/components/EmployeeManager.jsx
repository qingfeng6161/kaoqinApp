// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { UserPlus, UserMinus, AlertTriangle } from 'lucide-react';

// @ts-ignore;
import { ConfirmDialog } from './ConfirmDialog';
const localStorageUtils = {
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
  }
};
export function EmployeeManager({
  employees,
  onEmployeesChange,
  selectedEmployees,
  onSelectionChange,
  isMultiMode
}) {
  const {
    toast
  } = useToast();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showDeleteEmployee, setShowDeleteEmployee] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  // 添加新员工
  const handleAddEmployee = () => {
    if (!newEmployeeName.trim()) {
      toast({
        title: "请输入员工姓名",
        variant: "destructive"
      });
      return;
    }
    try {
      const currentEmployees = localStorageUtils.getEmployees();
      const existingEmployee = currentEmployees.find(e => e.name === newEmployeeName.trim());
      if (existingEmployee) {
        toast({
          title: "添加失败",
          description: `员工"${newEmployeeName}"已存在`,
          variant: "destructive"
        });
        return;
      }
      const newEmployee = {
        id: Date.now().toString(),
        name: newEmployeeName.trim(),
        createdAt: new Date().toISOString()
      };
      const updatedEmployees = [...currentEmployees, newEmployee];
      localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      onEmployeesChange(updatedEmployees);

      // 如果是多人模式，自动选中新员工
      if (isMultiMode) {
        onSelectionChange([...selectedEmployees, newEmployee.id]);
      } else {
        onSelectionChange([newEmployee.id]);
      }
      setShowAddEmployee(false);
      setNewEmployeeName('');
      toast({
        title: "员工添加成功",
        description: `已添加员工：${newEmployee.name}`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "添加失败",
        description: error.message || "添加员工时发生错误",
        variant: "destructive"
      });
    }
  };

  // 开始删除员工流程
  const startDeleteEmployee = () => {
    if (employees.length === 0) {
      toast({
        title: "无员工可删除",
        description: "当前没有员工可以删除",
        variant: "destructive"
      });
      return;
    }
    setShowDeleteEmployee(true);
  };

  // 选择要删除的员工
  const selectEmployeeToDelete = employeeId => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setEmployeeToDelete(employee);
      setShowDeleteConfirm(true);
    }
  };

  // 确认删除员工
  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    try {
      const updatedEmployees = localStorageUtils.removeEmployee(employeeToDelete.id);
      onEmployeesChange(updatedEmployees);

      // 从已选员工中移除
      const updatedSelected = selectedEmployees.filter(id => id !== employeeToDelete.id);
      onSelectionChange(updatedSelected);
      setShowDeleteConfirm(false);
      setShowDeleteEmployee(false);
      setEmployeeToDelete(null);
      toast({
        title: "员工删除成功",
        description: `已删除员工：${employeeToDelete.name}`,
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "删除失败",
        description: error.message || "删除员工时发生错误",
        variant: "destructive"
      });
    }
  };

  // 取消删除
  const cancelDelete = () => {
    setShowDeleteEmployee(false);
    setShowDeleteConfirm(false);
    setEmployeeToDelete(null);
  };
  return <div className="space-y-4">
      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => setShowAddEmployee(true)} className="flex-1">
          <UserPlus className="w-4 h-4 mr-2" />
          添加新员工
        </Button>
        
        <Button variant="outline" size="sm" onClick={startDeleteEmployee} className="flex-1">
          <UserMinus className="w-4 h-4 mr-2" />
          删除员工
        </Button>
      </div>

      {/* 添加员工表单 */}
      {showAddEmployee && <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">新员工姓名</label>
            <input type="text" placeholder="请输入员工姓名" value={newEmployeeName} onChange={e => setNewEmployeeName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddEmployee()} className="w-full px-3 py-2 border rounded-md" />
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleAddEmployee} className="flex-1">
                确认添加
              </Button>
              <Button size="sm" variant="outline" onClick={() => {
            setShowAddEmployee(false);
            setNewEmployeeName('');
          }} className="flex-1">
                取消
              </Button>
            </div>
          </div>
        </div>}

      {/* 删除员工选择列表 */}
      {showDeleteEmployee && !showDeleteConfirm && <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <label className="text-sm font-medium mb-2 block">选择要删除的员工</label>
          <div className="space-y-2">
            {employees.map(employee => <Button key={employee.id} variant="ghost" size="sm" onClick={() => selectEmployeeToDelete(employee.id)} className="w-full justify-start text-left">
                {employee.name}
              </Button>)}
          </div>
          <Button size="sm" variant="outline" onClick={cancelDelete} className="w-full mt-2">
            取消
          </Button>
        </div>}

      {/* 删除确认对话框 */}
      <ConfirmDialog isOpen={showDeleteConfirm} onClose={cancelDelete} onConfirm={confirmDeleteEmployee} title="确认删除员工" message={`确定要删除员工"${employeeToDelete?.name}"吗？删除后该员工将不再出现在选择列表中，但历史考勤记录将保留。`} confirmText="删除" cancelText="取消" confirmVariant="destructive" />
    </div>;
}