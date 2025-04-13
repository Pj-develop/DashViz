'use client';
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  IconButton,
  Toolbar,
  Typography,
  Box,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme as useMuiTheme,
  useMediaQuery
} from '@mui/material';
import { useTheme } from 'next-themes';
import { 
  Search as SearchIcon, 
  FileDownload as FileDownloadIcon,
  SortByAlpha as SortIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

interface TableItem {
  stage: string;
  cameToStage: number | string;
  lostFromStage: number | string;
  movedToNextStage: number | string;
  winRate: number | string;
}

interface PipelineTableProps {
  data: TableItem[];
  valueType: 'count' | 'acv';
}

const PipelineTable: React.FC<PipelineTableProps> = ({ data, valueType }) => {
  const muiTheme = useMuiTheme();
  const { theme } = useTheme(); // Get theme from next-themes
  const isDarkMode = theme === 'dark';
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTotal = (stage: string) => stage === 'Total';
  const isWon = (stage: string) => stage === 'Won';
  
  // Add state for filtering and sorting
  const [filterText, setFilterText] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof TableItem | null;
    direction: 'ascending' | 'descending' | null;
  }>({
    key: null,
    direction: null
  });

  // Filter data based on search input
  const filteredData = data.filter(row => {
    if (!filterText) return true;
    return row.stage.toLowerCase().includes(filterText.toLowerCase());
  });

  // Sort data when a column header is clicked
  const sortedData = React.useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig.key !== null && sortConfig.direction !== null) {
      sortableData.sort((a, b) => {
        let aValue = a[sortConfig.key!];
        let bValue = b[sortConfig.key!];
        
        // Handle string comparisons 
        if (aValue === '-') return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === '-') return sortConfig.direction === 'ascending' ? 1 : -1;
        
        // Handle numeric comparisons (remove % and $ for comparison)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.replace(/[%$,]/g, '');
          bValue = bValue.replace(/[%$,]/g, '');
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  // Request sort on column header click
  const requestSort = (key: keyof TableItem) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    setSortConfig({ key, direction });
  };

  // Export to CSV function
  const exportToCSV = () => {
    const headers = ['Stage', 'Came to Stage', 'Lost / Disqualified', 'Moved to Next', 'Win Rate %'];
    const csvData = filteredData.map(row => [
      row.stage,
      row.cameToStage,
      row.lostFromStage,
      row.movedToNextStage,
      row.winRate === '-' ? '-' : `${row.winRate}%`
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pipeline-${valueType}-${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Header cell component with sorting indicator
  const HeaderCell = ({ label, field }: { label: string, field: keyof TableItem }) => {
    const isSorted = sortConfig.key === field;
    return (
      <TableCell 
        align={field === 'stage' ? "left" : "right"}
        onClick={() => requestSort(field)}
        sx={{ 
          fontWeight: 'bold', 
          backgroundColor: isDarkMode ? '#333333' : muiTheme.palette.grey[100],
          color: isDarkMode ? '#ffffff' : 'inherit',
          width: isMobile ? (field === 'stage' ? "30%" : "17.5%") : "20%",
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: isDarkMode ? '#444444' : muiTheme.palette.grey[200],
          },
          position: 'relative',
          paddingRight: isSorted ? 4 : 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: field === 'stage' ? 'flex-start' : 'flex-end'
        }}>
          {label}
          {isSorted && (
            <Box component="span" sx={{ ml: 0.5, fontSize: '0.75rem' }}>
              {sortConfig.direction === 'ascending' ? '▲' : '▼'}
            </Box>
          )}
        </Box>
      </TableCell>
    );
  };

  return (
    <Box>
      <Toolbar 
        sx={{ 
          p: 1, 
          display: 'flex', 
          justifyContent: 'space-between',
          backgroundColor: isDarkMode ? '#1e1e1e' : '#f5f5f5',
          borderRadius: 1,
          mb: 1
        }}
      >
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontWeight: 'medium',
            color: isDarkMode ? '#ffffff' : 'inherit'
          }}
        >
          {valueType === 'acv' ? 'Pipeline by Value' : 'Pipeline by Count'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            placeholder="Filter by stage"
            size="small"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: isDarkMode ? '#333333' : '#ffffff',
                color: isDarkMode ? '#ffffff' : 'inherit',
                '& .MuiInputBase-input': {
                  color: isDarkMode ? '#ffffff' : 'inherit'
                },
                '& .MuiSvgIcon-root': {
                  color: isDarkMode ? '#aaaaaa' : 'inherit'
                }
              }
            }}
            sx={{ 
              mr: 1, 
              width: isMobile ? 100 : 200,
            }}
          />
          <Tooltip title="Reset sorting">
            <IconButton 
              size="small" 
              onClick={() => {
                setSortConfig({ key: null, direction: null });
                setFilterText('');
              }}
              sx={{
                color: isDarkMode ? '#aaaaaa' : 'inherit',
                '&:hover': {
                  color: isDarkMode ? '#ffffff' : muiTheme.palette.primary.main
                }
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to CSV">
            <IconButton 
              size="small" 
              onClick={exportToCSV}
              sx={{
                color: isDarkMode ? '#aaaaaa' : 'inherit',
                '&:hover': {
                  color: isDarkMode ? '#ffffff' : muiTheme.palette.primary.main
                }
              }}
            >
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxHeight: 400,
          overflow: 'auto',
          backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: isDarkMode ? '#555555' : muiTheme.palette.grey[300],
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: isDarkMode ? '#2e2e2e' : muiTheme.palette.grey[100],
          },
          boxShadow: isDarkMode ? 'none' : undefined,
        }}
      >
        <Table 
          stickyHeader 
          size={isMobile ? "small" : "medium"}
          sx={{
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              px: isMobile ? 1 : 2,
              py: isMobile ? 0.5 : 1,
              whiteSpace: isMobile ? "nowrap" : "normal",
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              color: isDarkMode ? '#e0e0e0' : 'inherit',
              borderBottomColor: isDarkMode ? '#333333' : undefined
            }
          }}
        >
          <TableHead>
            <TableRow>
              <HeaderCell label="Stage" field="stage" />
              <HeaderCell label={isMobile ? "Came" : "Came to Stage"} field="cameToStage" />
              <HeaderCell label={isMobile ? "Lost" : "Lost / Disqualified"} field="lostFromStage" />
              <HeaderCell label={isMobile ? "Moved" : "Moved to next"} field="movedToNextStage" />
              <HeaderCell label="Win Rate %" field="winRate" />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.length > 0 ? (
              sortedData.map((row) => (
                <TableRow
                  key={row.stage}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    ...(isTotal(row.stage) && { 
                      backgroundColor: isDarkMode ? '#2d2d2d' : muiTheme.palette.grey[50],
                      fontWeight: 'bold'
                    }),
                    ...(isWon(row.stage) && { 
                      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)'
                    }),
                    '&:hover': {
                      backgroundColor: isTotal(row.stage) ? 
                        (isDarkMode ? '#353535' : muiTheme.palette.grey[100]) : 
                        isWon(row.stage) ? 
                          (isDarkMode ? 'rgba(76, 175, 80, 0.25)' : 'rgba(76, 175, 80, 0.15)') : 
                          (isDarkMode ? '#2a2a2a' : muiTheme.palette.action.hover),
                    }
                  }}
                >
                  <TableCell 
                    component="th" 
                    scope="row"
                    sx={{ 
                      fontWeight: isTotal(row.stage) || isWon(row.stage) ? 'bold' : 'normal',
                      color: isWon(row.stage) ? 
                        (isDarkMode ? '#81c784' : '#2e7d32') : 
                        (isDarkMode ? '#e0e0e0' : 'inherit')
                    }}
                  >
                    {row.stage}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      fontWeight: isWon(row.stage) ? 'bold' : 'normal',
                      color: isWon(row.stage) ? 
                        (isDarkMode ? '#81c784' : '#2e7d32') : 
                        (isDarkMode ? '#e0e0e0' : 'inherit')
                    }}
                  >
                    {row.cameToStage}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      backgroundColor: row.lostFromStage !== 0 && 
                                     row.lostFromStage !== '0' && 
                                     !isTotal(row.stage) ? 
                        (isDarkMode ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.1)') : 
                        undefined,
                      fontWeight: isWon(row.stage) ? 'bold' : 'normal',
                      color: isWon(row.stage) ? 
                        (isDarkMode ? '#81c784' : '#2e7d32') : 
                        (isDarkMode ? '#e0e0e0' : 'inherit')
                    }}
                  >
                    {row.lostFromStage}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      backgroundColor: row.movedToNextStage !== 0 && 
                                     row.movedToNextStage !== '0' && 
                                     !isTotal(row.stage) ? 
                        (isDarkMode ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.1)') : 
                        undefined,
                      fontWeight: isWon(row.stage) ? 'bold' : 'normal',
                      color: isWon(row.stage) ? 
                        (isDarkMode ? '#81c784' : '#2e7d32') : 
                        (isDarkMode ? '#e0e0e0' : 'inherit')
                    }}
                  >
                    {row.movedToNextStage}
                  </TableCell>
                  <TableCell 
                    align="right"
                    sx={{
                      fontWeight: isWon(row.stage) ? 'bold' : 'normal',
                      color: isWon(row.stage) ? 
                        (isDarkMode ? '#81c784' : '#2e7d32') : 
                        (isDarkMode ? '#e0e0e0' : 'inherit')
                    }}
                  >
                    {row.winRate === '-' ? '-' : `${row.winRate}%`}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No data found matching your filter
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PipelineTable;