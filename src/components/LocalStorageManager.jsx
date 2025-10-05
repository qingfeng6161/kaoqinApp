// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// 本地存储管理器 - 专为安卓APK设计
export const LocalStorageManager = {
  // 数据键名
  KEYS: {
    EMPLOYEES: 'attendance_employees',
    RECORDS: 'attendance_records',
    TEMPLATES: 'attendance_templates',
    SETTINGS: 'attendance_settings'
  },
  // 初始化数据
  initData: () => {
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
    const defaultTemplates = [{
      id: '1',
      name: '标准班',
      morning: {
        start: '09:00',
        end: '12:00'
      },
      afternoon: {
        start: '13:30',
        end: '17:30'
      },
      evening: {
        start: '',
        end: ''
      },
      other: {
        start: '',
        end: ''
      }
    }, {
      id: '2',
      name: '晚班',
      morning: {
        start: '',
        end: ''
      },
      afternoon: {
        start: '14:00',
        end: '18:00'
      },
      evening: {
        start: '19:00',
        end: '22:00'
      },
      other: {
        start: '',
        end: ''
      }
    }];

    // 初始化员工数据
    if (!localStorage.getItem(LocalStorageManager.KEYS.EMPLOYEES)) {
      localStorage.setItem(LocalStorageManager.KEYS.EMPLOYEES, JSON.stringify(defaultEmployees));
    }

    // 初始化模板数据
    if (!localStorage.getItem(LocalStorageManager.KEYS.TEMPLATES)) {
      localStorage.setItem(LocalStorageManager.KEYS.TEMPLATES, JSON.stringify(defaultTemplates));
    }

    // 初始化设置
    if (!localStorage.getItem(LocalStorageManager.KEYS.SETTINGS)) {
      localStorage.setItem(LocalStorageManager.KEYS.SETTINGS, JSON.stringify({
        autoFill: true,
        theme: 'light',
        notifications: true
      }));
    }

    // 初始化记录（空数组）
    if (!localStorage.getItem(LocalStorageManager.KEYS.RECORDS)) {
      localStorage.setItem(LocalStorageManager.KEYS.RECORDS, JSON.stringify([]));
    }
  },
  // 员工管理
  employees: {
    getAll: () => {
      try {
        const data = localStorage.getItem(LocalStorageManager.KEYS.EMPLOYEES);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('读取员工数据失败:', error);
        return [];
      }
    },
    add: name => {
      try {
        const employees = LocalStorageManager.employees.getAll();
        const existing = employees.find(e => e.name === name.trim());
        if (existing) {
          throw new Error('员工已存在');
        }
        const newEmployee = {
          id: Date.now().toString(),
          name: name.trim(),
          createdAt: new Date().toISOString()
        };
        employees.push(newEmployee);
        localStorage.setItem(LocalStorageManager.KEYS.EMPLOYEES, JSON.stringify(employees));
        return newEmployee;
      } catch (error) {
        console.error('添加员工失败:', error);
        throw error;
      }
    },
    remove: employeeId => {
      try {
        const employees = LocalStorageManager.employees.getAll();
        const filtered = employees.filter(e => e.id !== employeeId);
        localStorage.setItem(LocalStorageManager.KEYS.EMPLOYEES, JSON.stringify(filtered));
        return filtered;
      } catch (error) {
        console.error('删除员工失败:', error);
        throw error;
      }
    }
  },
  // 考勤记录管理
  records: {
    getAll: () => {
      try {
        const data = localStorage.getItem(LocalStorageManager.KEYS.RECORDS);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('读取考勤记录失败:', error);
        return [];
      }
    },
    add: record => {
      try {
        const records = LocalStorageManager.records.getAll();
        const newRecord = {
          ...record,
          _id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        records.unshift(newRecord);
        localStorage.setItem(LocalStorageManager.KEYS.RECORDS, JSON.stringify(records));
        return newRecord;
      } catch (error) {
        console.error('添加考勤记录失败:', error);
        throw error;
      }
    },
    update: record => {
      try {
        const records = LocalStorageManager.records.getAll();
        const index = records.findIndex(r => r._id === record._id);
        if (index !== -1) {
          records[index] = {
            ...record,
            updatedAt: new Date().toISOString()
          };
          localStorage.setItem(LocalStorageManager.KEYS.RECORDS, JSON.stringify(records));
          return records[index];
        }
        return null;
      } catch (error) {
        console.error('更新考勤记录失败:', error);
        throw error;
      }
    },
    bulkUpdate: records => {
      try {
        const allRecords = LocalStorageManager.records.getAll();
        records.forEach(record => {
          const index = allRecords.findIndex(r => r.employee_id === record.employee_id && r.date === record.date);
          if (index !== -1) {
            allRecords[index] = {
              ...record,
              updatedAt: new Date().toISOString()
            };
          } else {
            allRecords.unshift({
              ...record,
              _id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });
          }
        });
        localStorage.setItem(LocalStorageManager.KEYS.RECORDS, JSON.stringify(allRecords));
        return allRecords;
      } catch (error) {
        console.error('批量更新考勤记录失败:', error);
        throw error;
      }
    }
  },
  // 模板管理
  templates: {
    getAll: () => {
      try {
        const data = localStorage.getItem(LocalStorageManager.KEYS.TEMPLATES);
        return data ? JSON.parse(data) : [];
      } catch (error) {
        console.error('读取模板数据失败:', error);
        return [];
      }
    },
    add: template => {
      try {
        const templates = LocalStorageManager.templates.getAll();
        const newTemplate = {
          ...template,
          id: Date.now().toString()
        };
        templates.push(newTemplate);
        localStorage.setItem(LocalStorageManager.KEYS.TEMPLATES, JSON.stringify(templates));
        return newTemplate;
      } catch (error) {
        console.error('添加模板失败:', error);
        throw error;
      }
    },
    update: template => {
      try {
        const templates = LocalStorageManager.templates.getAll();
        const index = templates.findIndex(t => t.id === template.id);
        if (index !== -1) {
          templates[index] = template;
          localStorage.setItem(LocalStorageManager.KEYS.TEMPLATES, JSON.stringify(templates));
          return templates[index];
        }
        return null;
      } catch (error) {
        console.error('更新模板失败:', error);
        throw error;
      }
    },
    remove: templateId => {
      try {
        const templates = LocalStorageManager.templates.getAll();
        const filtered = templates.filter(t => t.id !== templateId);
        localStorage.setItem(LocalStorageManager.KEYS.TEMPLATES, JSON.stringify(filtered));
        return filtered;
      } catch (error) {
        console.error('删除模板失败:', error);
        throw error;
      }
    }
  },
  // 设置管理
  settings: {
    get: () => {
      try {
        const data = localStorage.getItem(LocalStorageManager.KEYS.SETTINGS);
        return data ? JSON.parse(data) : {
          autoFill: true,
          theme: 'light',
          notifications: true
        };
      } catch (error) {
        console.error('读取设置失败:', error);
        return {
          autoFill: true,
          theme: 'light',
          notifications: true
        };
      }
    },
    update: settings => {
      try {
        localStorage.setItem(LocalStorageManager.KEYS.SETTINGS, JSON.stringify(settings));
        return settings;
      } catch (error) {
        console.error('更新设置失败:', error);
        throw error;
      }
    }
  },
  // 数据备份和恢复
  backup: {
    export: () => {
      try {
        const data = {
          employees: LocalStorageManager.employees.getAll(),
          records: LocalStorageManager.records.getAll(),
          templates: LocalStorageManager.templates.getAll(),
          settings: LocalStorageManager.settings.get(),
          exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
      } catch (error) {
        console.error('导出数据失败:', error);
        throw error;
      }
    },
    import: jsonData => {
      try {
        const data = JSON.parse(jsonData);
        if (data.employees) localStorage.setItem(LocalStorageManager.KEYS.EMPLOYEES, JSON.stringify(data.employees));
        if (data.records) localStorage.setItem(LocalStorageManager.KEYS.RECORDS, JSON.stringify(data.records));
        if (data.templates) localStorage.setItem(LocalStorageManager.KEYS.TEMPLATES, JSON.stringify(data.templates));
        if (data.settings) localStorage.setItem(LocalStorageManager.KEYS.SETTINGS, JSON.stringify(data.settings));
        return true;
      } catch (error) {
        console.error('导入数据失败:', error);
        throw error;
      }
    }
  }
};

// 初始化数据
LocalStorageManager.initData();