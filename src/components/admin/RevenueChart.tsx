'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueDataPoint {
  day: string;
  revenue: number;
}

export default function RevenueChart({ data }: { data: RevenueDataPoint[] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
          <XAxis
            dataKey="day"
            stroke="#6B7A73"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#E5EAE7' }}
          />
          <YAxis
            stroke="#6B7A73"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `Rp${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value: any) => [formatCurrency(Number(value)), 'Pendapatan']}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5EAE7',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="revenue"
            fill="#0F6B3F"
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
