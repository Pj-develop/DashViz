'use client';
import React, { useState, useRef, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search, Clock, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchQuery, clearSearchHistory, filterData } from '@/store/slices/searchSlice';

interface SearchBarProps {
  isDarkMode: boolean;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ isDarkMode, placeholder = "Search pipeline stages or territories..." }) => {
  const dispatch = useDispatch();
  const { query, history } = useSelector((state: any) => state.search);
  
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // This controls visibility of the history dropdown
  // Only show history when: focused AND has history AND either empty query OR actively typing
  const [showHistory, setShowHistory] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Handle when to show history dropdown
  useEffect(() => {
    setShowHistory(isFocused && history.length > 0 && (query === '' || isTyping));
    
    // Hide dropdown after 2 seconds of inactivity if there's text
    if (query && isTyping) {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      
      typingTimer.current = setTimeout(() => {
        setIsTyping(false);
        setShowHistory(false);
      }, 2000);
    }
    
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [isFocused, history, query, isTyping]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowHistory(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input
  const handleSearch = (value: string) => {
    dispatch(setSearchQuery(value));
    dispatch(filterData(value)); // This will filter data in the Redux store
    setIsTyping(true);
  };

  // Handle selecting history item
  const handleSelectHistoryItem = (term: string) => {
    dispatch(setSearchQuery(term));
    dispatch(filterData(term));
    setShowHistory(false);
  };

  // Clear search history
  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(clearSearchHistory());
    setShowHistory(false);
  };
  
  // Close history dropdown
  const handleCloseHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowHistory(false);
  };

  return (
    <div className="relative flex-grow" ref={searchRef}>
      <TextField
        fullWidth
        placeholder={placeholder}
        variant="outlined"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        className="bg-white dark:bg-gray-800 rounded-lg"
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
          },
          '& .MuiInputBase-input': {
            color: isDarkMode ? '#e0e0e0' : 'inherit',
          },
          '& .MuiInputLabel-root': {
            color: isDarkMode ? '#e0e0e0' : 'inherit',
          },
          '& .MuiInputAdornment-root': {
            color: isDarkMode ? '#aaaaaa' : 'inherit',
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
            </InputAdornment>
          ),
          endAdornment: query && (
            <InputAdornment position="end">
              <IconButton 
                size="small" 
                onClick={() => handleSearch('')}
                sx={{ color: isDarkMode ? '#aaaaaa' : 'inherit' }}
              >
                <X size={16} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {/* Search history dropdown - with close button and auto-hiding behavior */}
      {showHistory && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 animate-fadeIn">
          <div className="p-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <Clock size={14} className="mr-2" />
              Recent searches
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleClearHistory}
                className="text-xs hover:text-blue-500 dark:hover:text-blue-400"
              >
                Clear all
              </button>
              <button
                onClick={handleCloseHistory}
                className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X size={14} />
              </button>
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {history.map((term: string, index: number) => (
              <button
                key={index}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex justify-between items-center"
                onClick={() => handleSelectHistoryItem(term)}
              >
                <span>{term}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;