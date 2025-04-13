'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

interface FunnelCardProps {
  item: {
    label: string;
    acv: number;
    count: number;
    diffRate: number;
    diffacvRate: number;
    diffRateFormatted: string;
    status: "positive" | "neutral" | "negative";
  };
  index: number;
}

const FunnelCard: React.FC<FunnelCardProps> = ({ item, index }) => {
  return (
    <motion.div
      key={item.label}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className={`border-l-4 ${
        item.status === 'positive' ? 'border-l-green-500' :
        item.status === 'negative' ? 'border-l-red-500' : 'border-l-yellow-400'
      }`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{item.label}</h3>
              <p className="text-gray-500 dark:text-gray-400">Count: {item.count}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{(item.diffacvRate * 100).toFixed(1)}%</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Conversion Rate: {item.diffRateFormatted}
              </p>
            </div>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full ${
                item.status === 'positive' ? 'bg-green-500' :
                item.status === 'negative' ? 'bg-red-500' : 'bg-yellow-400'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${item.diffacvRate * 100}%` }}
              transition={{ duration: 1, delay: index * 0.2 }}
            />
          </div>
          <p className="mt-2 text-sm">
            ACV: <span className="font-semibold">${item.acv.toLocaleString()}</span>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Using React.memo improves performance by preventing unnecessary re-renders
export default React.memo(FunnelCard);