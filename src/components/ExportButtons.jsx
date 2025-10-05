// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Download, FileText, BarChart3 } from 'lucide-react';

// 计算员工在时间段内的总工时和折算天数
const calculateEmployeeStats = (records, employeeId) => {
  const employeeRecords = records.filter(r => r.employee_id === employeeId);
  const totalHours = employeeRecords.reduce((sum, record) => sum + (record.summary?.total_hours || 0), 0);
  const convertedDays = +(totalHours / 9).toFixed(2);
  return {
    totalHours: totalHours.toFixed(2),
    convertedDays,
    recordCount: employeeRecords.length
  };
};

// 生成Excel文件
const generateExcel = (data, filename) => {
  const csvContent = data.map(row => Object.values(row).join(',')).join('\n');
  const blob = new Blob([csvContent], {
    type: 'text/csv;charset=utf-8;'
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// 生成详细考勤记录
const generateDetailedRecords = filteredRecords => {
  const headers = ['员工姓名', '日期', '上午开始', '上午结束', '上午时长', '下午开始', '下午结束', '下午时长', '晚上开始', '晚上结束', '晚上时长', '其它开始', '其它结束', '其它时长', '总工时', '基础工时', '奖励工时', '跨日班次数', '状态'];
  const rows = filteredRecords.map(record => {
    const periods = record.periods || {};
    return {
      employeeName: record.employee_name,
      date: record.date,
      morningStart: periods.morning?.start || '',
      morningEnd: periods.morning?.end || '',
      morningDuration: periods.morning?.duration || 0,
      afternoonStart: periods.afternoon?.start || '',
      afternoonEnd: periods.afternoon?.end || '',
      afternoonDuration: periods.afternoon?.duration || 0,
      eveningStart: periods.evening?.start || '',
      eveningEnd: periods.evening?.end || '',
      eveningDuration: periods.evening?.duration || 0,
      otherStart: periods.other?.start || '',
      otherEnd: periods.other?.end || '',
      otherDuration: periods.other?.duration || 0,
      totalHours: record.summary?.total_hours || 0,
      baseHours: record.summary?.total_base_hours || 0,
      bonusHours: record.summary?.total_bonus_hours || 0,
      crossDayPeriods: record.summary?.cross_day_periods || 0,
      status: record.status || '正常'
    };
  });
  return [headers, ...rows.map(row => Object.values(row))];
};

// 生成统计汇总
const generateStatisticsSummary = (filteredRecords, employees) => {
  const headers = ['员工姓名', '记录天数', '总时数(小时)', '折算天数', '平均工时/天', '基础工时', '奖励工时', '跨日班次数'];

  // 按员工分组统计
  const employeeStats = {};
  filteredRecords.forEach(record => {
    const employeeId = record.employee_id;
    if (!employeeStats[employeeId]) {
      employeeStats[employeeId] = {
        employeeName: record.employee_name,
        records: [],
        totalHours: 0,
        baseHours: 0,
        bonusHours: 0,
        crossDayPeriods: 0
      };
    }
    employeeStats[employeeId].records.push(record);
    employeeStats[employeeId].totalHours += record.summary?.total_hours || 0;
    employeeStats[employeeId].baseHours += record.summary?.total_base_hours || 0;
    employeeStats[employeeId].bonusHours += record.summary?.total_bonus_hours || 0;
    employeeStats[employeeId].crossDayPeriods += record.summary?.cross_day_periods || 0;
  });
  const rows = Object.values(employeeStats).map(stat => ({
    employeeName: stat.employeeName,
    recordCount: stat.records.length,
    totalHours: stat.totalHours.toFixed(2),
    convertedDays: +(stat.totalHours / 9).toFixed(2),
    averageHours: stat.records.length > 0 ? (stat.totalHours / stat.records.length).toFixed(2) : '0.00',
    baseHours: stat.baseHours.toFixed(2),
    bonusHours: stat.bonusHours.toFixed(2),
    crossDayPeriods: stat.crossDayPeriods
  }));
  return [headers, ...rows.map(row => Object.values(row))];
};
export function ExportButtons({
  filteredRecords,
  employees,
  startDate,
  endDate,
  selectedEmployee
}) {
  const {
    toast
  } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // 导出详细考勤记录
  const exportDetailedRecords = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "无数据可导出",
        description: "当前筛选条件下没有考勤记录",
        variant: "destructive"
      });
      return;
    }
    setIsExporting(true);
    try {
      const filename = `详细考勤记录_${startDate}_to_${endDate}${selectedEmployee !== 'all' ? `_${employees.find(e => e.id === selectedEmployee)?.name}` : ''}.csv`;
      const data = generateDetailedRecords(filteredRecords);

      // 转换为CSV格式
      const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast({
        title: "导出成功",
        description: "详细考勤记录已导出",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message || "导出详细记录时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 导出统计汇总
  const exportStatisticsSummary = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "无数据可导出",
        description: "当前筛选条件下没有考勤记录",
        variant: "destructive"
      });
      return;
    }
    setIsExporting(true);
    try {
      const filename = `统计汇总_${startDate}_to_${endDate}${selectedEmployee !== 'all' ? `_${employees.find(e => e.id === selectedEmployee)?.name}` : ''}.csv`;
      const data = generateStatisticsSummary(filteredRecords, employees);

      // 转换为CSV格式
      const csvContent = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8;'
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      toast({
        title: "导出成功",
        description: "统计汇总已导出",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message || "导出统计汇总时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // 同时导出两个表格
  const exportBoth = () => {
    if (filteredRecords.length === 0) {
      toast({
        title: "无数据可导出",
        description: "当前筛选条件下没有考勤记录",
        variant: "destructive"
      });
      return;
    }
    setIsExporting(true);
    try {
      // 导出详细记录
      const detailedFilename = `详细考勤记录_${startDate}_to_${endDate}${selectedEmployee !== 'all' ? `_${employees.find(e => e.id === selectedEmployee)?.name}` : ''}.csv`;
      const detailedData = generateDetailedRecords(filteredRecords);
      const detailedCsv = detailedData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const detailedBlob = new Blob(['\ufeff' + detailedCsv], {
        type: 'text/csv;charset=utf-8;'
      });
      const detailedLink = document.createElement('a');
      detailedLink.href = URL.createObjectURL(detailedBlob);
      detailedLink.download = detailedFilename;
      detailedLink.click();

      // 短暂延迟后导出统计汇总
      setTimeout(() => {
        const summaryFilename = `统计汇总_${startDate}_to_${endDate}${selectedEmployee !== 'all' ? `_${employees.find(e => e.id === selectedEmployee)?.name}` : ''}.csv`;
        const summaryData = generateStatisticsSummary(filteredRecords, employees);
        const summaryCsv = summaryData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
        const summaryBlob = new Blob(['\ufeff' + summaryCsv], {
          type: 'text/csv;charset=utf-8;'
        });
        const summaryLink = document.createElement('a');
        summaryLink.href = URL.createObjectURL(summaryBlob);
        summaryLink.download = summaryFilename;
        summaryLink.click();
      }, 500);
      toast({
        title: "导出成功",
        description: "详细记录和统计汇总已同时导出",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "导出失败",
        description: error.message || "导出时发生错误",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  return <div className="flex space-x-2">
      <Button onClick={exportDetailedRecords} disabled={isExporting} variant="outline" size="sm">
        <FileText className="w-4 h-4 mr-2" />
        导出详细记录
      </Button>
      
      <Button onClick={exportStatisticsSummary} disabled={isExporting} variant="outline" size="sm">
        <BarChart3 className="w-4 h-4 mr-2" />
        导出统计汇总
      </Button>
      
      <Button onClick={exportBoth} disabled={isExporting} size="sm">
        <Download className="w-4 h-4 mr-2" />
        同时导出
      </Button>
    </div>;
}