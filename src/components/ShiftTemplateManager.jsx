// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Input, Label } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

// 本地存储工具函数
const localStorageUtils = {
  saveShiftTemplate: template => {
    try {
      const templates = localStorageUtils.getShiftTemplates();
      if (template._id) {
        // 更新现有模板
        const index = templates.findIndex(t => t._id === template._id);
        if (index !== -1) {
          template.updatedAt = new Date().toISOString();
          templates[index] = template;
        }
      } else {
        // 新建模板
        template._id = Date.now().toString();
        template.createdAt = new Date().toISOString();
        template.updatedAt = new Date().toISOString();
        templates.unshift(template);
      }
      localStorage.setItem('shift_templates', JSON.stringify(templates));
      return template;
    } catch (error) {
      console.error('保存班次模板失败:', error);
      throw error;
    }
  },
  getShiftTemplates: () => {
    try {
      const templates = localStorage.getItem('shift_templates');
      if (!templates) {
        // 初始化默认模板
        const defaultTemplates = [{
          _id: '1',
          name: '标准工作日',
          morning_start: '09:00',
          morning_end: '12:00',
          afternoon_start: '13:30',
          afternoon_end: '17:30',
          evening_start: '',
          evening_end: '',
          other_start: '',
          other_end: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, {
          _id: '2',
          name: '全天班',
          morning_start: '08:00',
          morning_end: '12:00',
          afternoon_start: '13:00',
          afternoon_end: '17:00',
          evening_start: '18:00',
          evening_end: '21:00',
          other_start: '',
          other_end: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, {
          _id: '3',
          name: '夜班模式',
          morning_start: '',
          morning_end: '',
          afternoon_start: '',
          afternoon_end: '',
          evening_start: '22:00',
          evening_end: '06:00',
          other_start: '',
          other_end: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }];
        localStorage.setItem('shift_templates', JSON.stringify(defaultTemplates));
        return defaultTemplates;
      }
      return JSON.parse(templates);
    } catch (error) {
      console.error('读取班次模板失败:', error);
      return [];
    }
  },
  deleteShiftTemplate: templateId => {
    try {
      const templates = localStorageUtils.getShiftTemplates();
      const filtered = templates.filter(t => t._id !== templateId);
      localStorage.setItem('shift_templates', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('删除班次模板失败:', error);
      return false;
    }
  }
};
export function ShiftTemplateManager({
  onTemplateSelect,
  onTemplatesUpdate
}) {
  const [templates, setTemplates] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    morning_start: '',
    morning_end: '',
    afternoon_start: '',
    afternoon_end: '',
    evening_start: '',
    evening_end: '',
    other_start: '',
    other_end: ''
  });

  // 加载模板数据 - 改为本地存储
  const loadTemplates = () => {
    try {
      const templates = localStorageUtils.getShiftTemplates();
      setTemplates(templates);
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  };

  // 保存模板 - 改为本地存储
  const saveTemplate = () => {
    if (!formData.name.trim()) {
      alert('请输入模板名称');
      return;
    }
    try {
      const templateData = {
        name: formData.name,
        morning_start: formData.morning_start,
        morning_end: formData.morning_end,
        afternoon_start: formData.afternoon_start,
        afternoon_end: formData.afternoon_end,
        evening_start: formData.evening_start,
        evening_end: formData.evening_end,
        other_start: formData.other_start,
        other_end: formData.other_end
      };
      if (editingTemplate) {
        // 更新模板
        templateData._id = editingTemplate._id;
      }
      localStorageUtils.saveShiftTemplate(templateData);
      loadTemplates();
      setIsOpen(false);
      resetForm();
      onTemplatesUpdate && onTemplatesUpdate();
    } catch (error) {
      console.error('保存模板失败:', error);
      alert('保存模板失败');
    }
  };

  // 删除模板 - 改为本地存储
  const deleteTemplate = templateId => {
    if (!confirm('确定要删除这个模板吗？')) return;
    try {
      localStorageUtils.deleteShiftTemplate(templateId);
      loadTemplates();
      onTemplatesUpdate && onTemplatesUpdate();
    } catch (error) {
      console.error('删除模板失败:', error);
      alert('删除模板失败');
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      morning_start: '',
      morning_end: '',
      afternoon_start: '',
      afternoon_end: '',
      evening_start: '',
      evening_end: '',
      other_start: '',
      other_end: ''
    });
    setEditingTemplate(null);
  };

  // 编辑模板
  const editTemplate = template => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      morning_start: template.morning_start || '',
      morning_end: template.morning_end || '',
      afternoon_start: template.afternoon_start || '',
      afternoon_end: template.afternoon_end || '',
      evening_start: template.evening_start || '',
      evening_end: template.evening_end || '',
      other_start: template.other_start || '',
      other_end: template.other_end || ''
    });
    setIsOpen(true);
  };

  // 应用模板
  const applyTemplate = template => {
    const templateData = {
      morning: {
        start: template.morning_start || '',
        end: template.morning_end || ''
      },
      afternoon: {
        start: template.afternoon_start || '',
        end: template.afternoon_end || ''
      },
      evening: {
        start: template.evening_start || '',
        end: template.evening_end || ''
      },
      other: {
        start: template.other_start || '',
        end: template.other_end || ''
      }
    };
    onTemplateSelect(templateData);
  };
  useEffect(() => {
    loadTemplates();
  }, []);
  return <div>
      {/* 模板选择器 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">班次模板</label>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                <Plus className="w-4 h-4 mr-1" />
                管理模板
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingTemplate ? '编辑班次模板' : '新建班次模板'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>模板名称</Label>
                  <Input value={formData.name} onChange={e => setFormData({
                  ...formData,
                  name: e.target.value
                })} placeholder="例如：标准工作日" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>上午上班</Label>
                    <Input type="time" value={formData.morning_start} onChange={e => setFormData({
                    ...formData,
                    morning_start: e.target.value
                  })} />
                  </div>
                  <div>
                    <Label>上午下班</Label>
                    <Input type="time" value={formData.morning_end} onChange={e => setFormData({
                    ...formData,
                    morning_end: e.target.value
                  })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>下午上班</Label>
                    <Input type="time" value={formData.afternoon_start} onChange={e => setFormData({
                    ...formData,
                    afternoon_start: e.target.value
                  })} />
                  </div>
                  <div>
                    <Label>下午下班</Label>
                    <Input type="time" value={formData.afternoon_end} onChange={e => setFormData({
                    ...formData,
                    afternoon_end: e.target.value
                  })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>晚上上班</Label>
                    <Input type="time" value={formData.evening_start} onChange={e => setFormData({
                    ...formData,
                    evening_start: e.target.value
                  })} />
                  </div>
                  <div>
                    <Label>晚上下班</Label>
                    <Input type="time" value={formData.evening_end} onChange={e => setFormData({
                    ...formData,
                    evening_end: e.target.value
                  })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>其它上班</Label>
                    <Input type="time" value={formData.other_start} onChange={e => setFormData({
                    ...formData,
                    other_start: e.target.value
                  })} />
                  </div>
                  <div>
                    <Label>其它下班</Label>
                    <Input type="time" value={formData.other_end} onChange={e => setFormData({
                    ...formData,
                    other_end: e.target.value
                  })} />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}>
                    取消
                  </Button>
                  <Button onClick={saveTemplate}>
                    <Save className="w-4 h-4 mr-1" />
                    保存
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {templates.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {templates.map(template => <div key={template._id} className="border rounded-lg p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{template.name}</h4>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => applyTemplate(template)}>
                      应用
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => editTemplate(template)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteTemplate(template._id)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </Button>
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  {template.morning_start && template.morning_end && <div>上午: {template.morning_start}-{template.morning_end}</div>}
                  {template.afternoon_start && template.afternoon_end && <div>下午: {template.afternoon_start}-{template.afternoon_end}</div>}
                  {template.evening_start && template.evening_end && <div>晚上: {template.evening_start}-{template.evening_end}</div>}
                  {template.other_start && template.other_end && <div>其它: {template.other_start}-{template.other_end}</div>}
                </div>
              </div>)}
          </div>}
      </div>
    </div>;
}