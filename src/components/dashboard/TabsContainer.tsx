'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table2, LineChart, BarChart3 } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveChart } from '@/store/slices/dataSlice';
import { FunnelChart } from "@/components/ui/funnel-chart";
import FunnelCardList from './FunnelCardList';
import { Skeleton } from '@/components/ui/skeleton';
import ClientOnly from "@/components/ui/client-only";
import dynamic from 'next/dynamic';

// Dynamically import TabularViewTab with proper path
const TabularViewTab = dynamic(
  () => import('../../app/tabular/page'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }
);

// Dynamically import 3D visualization with proper path
const ThreeDVisualization = dynamic(
  () => import('@/components/ui/bar-chart-3d').then(mod => ({ default: mod.BarChart3D })),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }
);

interface TabsContainerProps {
  is4K: boolean;
  isMobile: boolean;
}

const TabsContainer: React.FC<TabsContainerProps> = ({ is4K, isMobile }) => {
  const dispatch = useAppDispatch();
  const { activeChart, filteredFunnelData, filteredTerritoriesData, loading } = useAppSelector(state => state.data);
  
  return (
    <Tabs 
      defaultValue="tabular" 
      value={activeChart}
      onValueChange={(value) => dispatch(setActiveChart(value as 'tabular' | 'funnel' | '3d-viz'))}
      className="w-full" 
    >
      <TabsList className={`grid ${isMobile ? 'grid-cols-3' : 'grid-cols-3'} w-full max-w-md mx-auto`}>
        <TabsTrigger value="tabular" className="flex items-center space-x-2">
          <Table2 size={is4K ? 24 : 16} />
          <span className={is4K ? 'text-lg' : ''}>Tabular</span>
        </TabsTrigger>
        <TabsTrigger value="funnel" className="flex items-center space-x-2">
          <LineChart size={is4K ? 24 : 16} />
          <span className={is4K ? 'text-lg' : ''}>Funnel</span>
        </TabsTrigger>
        <TabsTrigger value="3d-viz" className="flex items-center space-x-2">
          <BarChart3 size={is4K ? 24 : 16} />
          <span className={is4K ? 'text-lg' : ''}>3D View</span>
        </TabsTrigger>
      </TabsList>
      
      {/* Tabular View Tab */}
      <TabsContent value="tabular" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className={is4K ? 'text-3xl' : ''}>Pipeline Performance - Tabular View</CardTitle>
            <CardDescription className={is4K ? 'text-xl' : ''}>
              Detailed tabular view showing pipeline metrics with double-sided bar charts
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {loading ? (
              <Skeleton className="h-[600px] w-full" />
            ) : (
              <TabularViewTab />
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Funnel View Tab */}
      <TabsContent value="funnel" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className={is4K ? 'text-3xl' : ''}>Sales Pipeline Funnel</CardTitle>
            <CardDescription className={is4K ? 'text-xl' : ''}>
              Visualize your sales funnel from Suspect to Won
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[400px]">
            {loading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : filteredFunnelData.length > 0 ? (
              <div>
                <FunnelChart data={filteredFunnelData} />
                <div className="mt-6">
                  <FunnelCardList />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500 dark:text-gray-400">No funnel data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* 3D Visualization */}
      <TabsContent value="3d-viz" className="mt-6">
        <ClientOnly requiresWebGL={true}>
          <Card>
            <CardHeader>
              <CardTitle className={is4K ? 'text-3xl' : ''}>Pipeline Performance - 3D Visualization</CardTitle>
              <CardDescription className={is4K ? 'text-xl' : ''}>
                Interactive 3D view of pipeline metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {loading ? (
                <Skeleton className="h-[400px] w-full" />
              ) : (
                filteredTerritoriesData.length > 0 ? (
                  <ThreeDVisualization data={filteredTerritoriesData} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500 dark:text-gray-400">No territory data available for 3D visualization</p>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </ClientOnly>
      </TabsContent>
    </Tabs>
  );
};

export default TabsContainer;