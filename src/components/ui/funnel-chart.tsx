"use client"

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface FunnelItem {
  label: string;
  acv: number;
  count: number;
  diffRate: number;
  diffacvRate: number;
  percentageFormatted: string;
  diffRateFormatted: string;
  status: "positive" | "neutral" | "negative";
}

interface FunnelChartProps {
  data: FunnelItem[];
}

export const FunnelChart = ({ data }: FunnelChartProps) => {
  const { theme } = useTheme();
  const sortedData = [...data].sort((a, b) => {
    // Define the order of stages
    const stages = ["Suspect", "Qualify", "Demo", "Proposal", "Negotiate", "Won"];
    return stages.indexOf(a.label) - stages.indexOf(b.label);
  });

  const maxCount = Math.max(...data.map(item => item.count));
  
  return (
    <div className="w-full py-8">
      <div className="space-y-4">
        {sortedData.map((item, index) => {
          const width = `${Math.max((item.count / maxCount) * 100, 10)}%`;
          const color = item.status === 'positive' 
            ? theme === 'dark' ? 'rgb(34, 197, 94)' : 'rgb(22, 163, 74)'
            : item.status === 'negative'
              ? theme === 'dark' ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)'
              : theme === 'dark' ? 'rgb(250, 204, 21)' : 'rgb(234, 179, 8)';
          
          return (
            <div key={item.label} className="relative">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-sm">{item.count} ({item.percentageFormatted})</span>
              </div>
              <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-md"
                  style={{ backgroundColor: color }}
                >
                  <div className="h-full w-full flex items-center justify-start pl-4">
                    <span className="text-white font-medium">
                      ${item.acv.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              </div>
              
              {index < sortedData.length - 1 && (
                <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] mx-auto mt-2 mb-2"
                  style={{ borderTopColor: color }} 
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};