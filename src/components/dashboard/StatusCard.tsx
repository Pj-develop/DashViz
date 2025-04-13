'use client';
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/store/hooks';
import { fetchDashboardData } from '@/store/slices/dataSlice';

// Loading State Card
const LoadingCard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mb-4 mx-auto"></div>
        <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading dashboard data...</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Please wait while we prepare your visualizations</p>
      </div>
    </div>
  );
};

// Error State Card
interface ErrorCardProps {
  error: string;
}

const ErrorCard: React.FC<ErrorCardProps> = ({ error }) => {
  const dispatch = useAppDispatch();

  const handleRetry = () => {
    dispatch(fetchDashboardData());
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <div className="text-red-500 text-5xl mb-4 flex justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">Error Loading Dashboard</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
        <div className="flex justify-center">
          <Button onClick={handleRetry} className="flex items-center">
            <RefreshCw size={16} className="mr-2" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
};

// Empty State Card
const EmptyCard: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No data available</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">There is no data to display at this time.</p>
      <Button onClick={() => dispatch(fetchDashboardData())} className="flex items-center mx-auto">
        <RefreshCw size={16} className="mr-2" />
        Refresh data
      </Button>
    </div>
  );
};

const StatusCards = {
  Loading: LoadingCard,
  Error: ErrorCard,
  Empty: EmptyCard,
};

export default StatusCards;