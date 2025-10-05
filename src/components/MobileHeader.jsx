// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card } from '@/components/ui';

export function MobileHeader({
  title
}) {
  return <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 md:hidden">
      <h1 className="text-lg font-bold text-center">{title}</h1>
    </div>;
}