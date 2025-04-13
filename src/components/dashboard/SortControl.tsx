'use client';
import React from 'react';
import { Button } from "@/components/ui/button";
import { SortAsc, SortDesc } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSortConfig } from '@/store/slices/dataSlice';
import { toast } from '@/hooks/use-toast';

interface SortControlsProps {
  isMobile?: boolean;
}

const SortControls: React.FC<SortControlsProps> = ({ isMobile = false }) => {
  const dispatch = useAppDispatch();
  const { sortConfig } = useAppSelector(state => state.data);
  
  const handleSort = (field: string) => {
    const direction = sortConfig?.field === field && sortConfig?.direction === 'asc' ? 'desc' : 'asc';
    
    // If already sorting by this field and direction is desc, clear sorting
    if (sortConfig?.field === field && sortConfig?.direction === 'desc') {
      dispatch(setSortConfig(null));
      toast({
        title: `Sorting cleared`,
        description: `Showing default order`,
        duration: 2000,
      });
      return;
    }
    
    dispatch(setSortConfig({ field, direction }));
    
    toast({
      title: `Sorted by ${field}`,
      description: `${field} sorted in ${direction === 'asc' ? 'ascending' : 'descending'} order`,
      duration: 2000,
    });
  };
  
  return (
    <div className="flex gap-2">
      <Button 
        variant={sortConfig?.field === 'label' ? 'default' : 'outline'}
        size="sm" 
        onClick={() => handleSort('label')}
        className="flex items-center"
      >
        {sortConfig?.field === 'label' && (
          sortConfig.direction === 'asc' ? <SortAsc size={16} className="mr-2" /> : <SortDesc size={16} className="mr-2" />
        )}
        Stage
      </Button>
      <Button 
        variant={sortConfig?.field === 'count' ? 'default' : 'outline'}
        size="sm" 
        onClick={() => handleSort('count')}
        className="flex items-center"
      >
        {sortConfig?.field === 'count' && (
          sortConfig.direction === 'asc' ? <SortAsc size={16} className="mr-2" /> : <SortDesc size={16} className="mr-2" />
        )}
        Count
      </Button>
      {!isMobile && (
        <Button 
          variant={sortConfig?.field === 'acv' ? 'default' : 'outline'}
          size="sm" 
          onClick={() => handleSort('acv')}
          className="flex items-center"
        >
          {sortConfig?.field === 'acv' && (
            sortConfig.direction === 'asc' ? <SortAsc size={16} className="mr-2" /> : <SortDesc size={16} className="mr-2" />
          )}
          ACV
        </Button>
      )}
    </div>
  );
};

export default SortControls;