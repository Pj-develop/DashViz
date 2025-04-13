'use client';
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import FunnelCard from './FunnelCard';
import { useAppSelector } from '@/store/hooks';

const FunnelCardList: React.FC = () => {
  const { filteredFunnelData, loading } = useAppSelector(state => state.data);
  
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredFunnelData.map((item, index) => (
        <FunnelCard key={item.label} item={item} index={index} />
      ))}
    </div>
  );
};

export default FunnelCardList;