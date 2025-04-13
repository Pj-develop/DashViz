'use client';
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Box, useTheme as useMuiTheme, useMediaQuery } from '@mui/material';
import { useTheme } from 'next-themes'; // Import next-themes

interface FunnelItem {
  stage: string;
  count: number;
  percentage: number;
  winRate: number;
}

interface FunnelChartProps {
  data: FunnelItem[];
  valueType: 'count' | 'acv';
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data, valueType }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const muiTheme = useMuiTheme();
  const { theme } = useTheme(); // Get theme from next-themes
  const isDarkMode = theme === 'dark';
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 420 // Adjusted height for better proportions
        });
      }
    };
    
    handleResize(); // Initial size
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Draw chart
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current || dimensions.width === 0) return;
    
    // Define responsive margins - reduced to give chart more space
    const margin = {
      top: 30,
      right: isMobile ? 60 : 100, // Reduced margins
      bottom: 50, // Reduced bottom margin
      left: isMobile ? 60 : 100 // Reduced margins
    };
    
    const width = dimensions.width;
    const height = dimensions.height;
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    // Theme-based colors
    const textColor = isDarkMode ? '#ffffff' : '#333333';
    const bgColor = isDarkMode ? '#333333' : '#f5f5f5';
    const borderColor = isDarkMode ? '#555555' : '#e0e0e0';
    const centerLineColor = isDarkMode ? '#555555' : '#cccccc';
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create scales with optimized padding
    const yScale = d3.scaleBand()
      .domain(data.map(d => d.stage))
      .range([0, chartHeight])
      .padding(0.5); // Adjusted padding for better bar sizes
    
    const xScaleLeft = d3.scaleLinear()
      .domain([0, 100])
      .range([chartWidth/2, 0]);
    
    const xScaleRight = d3.scaleLinear()
      .domain([0, 100])
      .range([0, chartWidth/2]);
    
    // Create the svg with viewBox for better responsiveness
    const svg = d3.select(svgRef.current)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // Add vertical center line
    svg.append('line')
      .attr('x1', chartWidth / 2)
      .attr('y1', -20)
      .attr('x2', chartWidth / 2)
      .attr('y2', chartHeight + 30)
      .attr('stroke', centerLineColor)
      .attr('stroke-dasharray', '2,2');
    
    // Create background for header labels
    svg.append('rect')
      .attr('x', chartWidth / 4 - 60)
      .attr('y', -25)
      .attr('width', 120)
      .attr('height', 20)
      .attr('rx', 4)
      .attr('fill', isDarkMode ? '#1b5e20' : '#e8f5e9')
      .attr('fill-opacity', isDarkMode ? 0.3 : 0.5);
      
    svg.append('rect')
      .attr('x', chartWidth * 3/4 - 60)
      .attr('y', -25)
      .attr('width', 120)
      .attr('height', 20)
      .attr('rx', 4)
      .attr('fill', isDarkMode ? '#0d47a1' : '#e3f2fd')
      .attr('fill-opacity', isDarkMode ? 0.3 : 0.5);
    
    // Add labels with improved styling
    const headerFontSize = isMobile ? '11px' : '14px';
    
    svg.append('text')
      .attr('x', chartWidth / 4)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', headerFontSize)
      .attr('font-weight', 'bold')
      .attr('fill', isDarkMode ? '#81c784' : '#4CAF50')
      .text('Success Rate');
    
    svg.append('text')
      .attr('x', chartWidth * 3/4)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .attr('font-size', headerFontSize)
      .attr('font-weight', 'bold')
      .attr('fill', isDarkMode ? '#64b5f6' : '#2196F3')
      .text('Win Rate');
    
    // Create bars - left side (percentage)
    svg.selectAll('.bar-left')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-left')
      .attr('x', d => xScaleLeft(d.percentage))
      .attr('y', d => yScale(d.stage) || 0)
      .attr('width', d => chartWidth/2 - xScaleLeft(d.percentage))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.stage === 'Won' ? 
        (isDarkMode ? '#2e7d32' : '#388E3C') : 
        (isDarkMode ? '#66bb6a' : '#4CAF50'))
      .attr('rx', 3)
      .attr('ry', 3)
      // Add hover effect
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', d.stage === 'Won' ? 
          (isDarkMode ? '#1b5e20' : '#1B5E20') : 
          (isDarkMode ? '#43a047' : '#2E7D32'));
        
        // Add tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', xScaleLeft(d.percentage) - 5)
          .attr('y', (yScale(d.stage) || 0) - 5)
          .attr('text-anchor', 'end')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', isDarkMode ? '#81c784' : '#4CAF50')
          .text(`${d.percentage}%`);
      })
      .on('mouseout', function(d) {
        d3.select(this).attr('fill', d.stage === 'Won' ? 
          (isDarkMode ? '#2e7d32' : '#388E3C') : 
          (isDarkMode ? '#66bb6a' : '#4CAF50'));
        svg.selectAll('.tooltip').remove();
      });
    
    // Create bars - right side (win rate)
    svg.selectAll('.bar-right')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar-right')
      .attr('x', chartWidth / 2)
      .attr('y', d => yScale(d.stage) || 0)
      .attr('width', d => xScaleRight(d.winRate))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => d.stage === 'Won' ? 
        (isDarkMode ? '#1565c0' : '#1565C0') : 
        (isDarkMode ? '#42a5f5' : '#2196F3'))
      .attr('rx', 3)
      .attr('ry', 3)
      // Add hover effect
      .on('mouseover', function(event, d) {
        d3.select(this).attr('fill', d.stage === 'Won' ? 
          (isDarkMode ? '#0d47a1' : '#0D47A1') : 
          (isDarkMode ? '#1976d2' : '#1976D2'));
        
        // Add tooltip
        svg.append('text')
          .attr('class', 'tooltip')
          .attr('x', (chartWidth / 2) + xScaleRight(d.winRate) + 5)
          .attr('y', (yScale(d.stage) || 0) - 5)
          .attr('text-anchor', 'start')
          .attr('font-size', '12px')
          .attr('font-weight', 'bold')
          .attr('fill', isDarkMode ? '#64b5f6' : '#2196F3')
          .text(`${d.winRate}%`);
      })
      .on('mouseout', function(d) {
        d3.select(this).attr('fill', d.stage === 'Won' ? 
          (isDarkMode ? '#1565c0' : '#1565C0') : 
          (isDarkMode ? '#42a5f5' : '#2196F3'));
        svg.selectAll('.tooltip').remove();
      });
    
    // Responsive font sizes - decreased for smaller value labels
    const stageFontSize = isMobile ? '10px' : '12px';
    const valueFontSize = isMobile ? '9px' : '11px';
    const countFontSize = isMobile ? '9px' : '11px'; // Reduced size for value labels
    
    // Add stage labels with background for better visibility
    svg.selectAll('.stage-label-bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', chartWidth / 2 - 40)
      .attr('y', d => (yScale(d.stage) || 0) + yScale.bandwidth() / 2 - 10)
      .attr('width', 80)
      .attr('height', 20)
      .attr('rx', 3)
      .attr('fill', isDarkMode ? '#424242' : '#f5f5f5')
      .attr('stroke', isDarkMode ? '#555555' : '#e0e0e0')
      .attr('stroke-width', 1);
      
    svg.selectAll('.stage-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'stage-label')
      .attr('x', chartWidth / 2)
      .attr('y', d => (yScale(d.stage) || 0) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .attr('font-size', stageFontSize)
      .attr('font-weight', 'bold')
      .attr('fill', d => d.stage === 'Won' ? 
        (isDarkMode ? '#81c784' : '#1B5E20') : 
        (isDarkMode ? '#ffffff' : '#333333'))
      .text(d => d.stage);
    
    // Add percentage labels (left) - skip if too narrow
    if (!isMobile || width > 350) {
      svg.selectAll('.percentage-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'percentage-label')
        .attr('x', d => xScaleLeft(d.percentage) - 8)
        .attr('y', d => (yScale(d.stage) || 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', valueFontSize)
        .attr('font-weight', 'bold')
        .attr('fill', isDarkMode ? '#ffffff' : '#333333')
        .text(d => `${d.percentage}%`);
      
      // Add win rate labels (right)
      svg.selectAll('.win-rate-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'win-rate-label')
        .attr('x', d => (chartWidth / 2) + xScaleRight(d.winRate) + 8)
        .attr('y', d => (yScale(d.stage) || 0) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'start')
        .attr('font-size', valueFontSize)
        .attr('font-weight', 'bold')
        .attr('fill', isDarkMode ? '#ffffff' : '#333333')
        .text(d => `${d.winRate}%`);
    }
    
    // Add count/value labels below stage names - SMALLER and closer to bars
    const valueSpacing = 15; // Reduced spacing to 15px from 25px
    
    // Smaller background for value labels
    svg.selectAll('.value-label-bg')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', chartWidth / 2 - 35) // Reduced width by making x position closer to center
      .attr('y', d => (yScale(d.stage) || 0) + yScale.bandwidth() + valueSpacing - 8) // Positioned closer to bars
      .attr('width', 70) // Smaller width (was 100)
      .attr('height', 16) // Smaller height (was 20)
      .attr('rx', 3)
      .attr('fill', isDarkMode ? '#424242' : '#f8f8f8')
      .attr('stroke', isDarkMode ? '#555555' : '#e0e0e0')
      .attr('stroke-width', 1)
      .attr('fill-opacity', 0.7);
      
    svg.selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', chartWidth / 2)
      .attr('y', d => (yScale(d.stage) || 0) + yScale.bandwidth() + valueSpacing) // Increased gap
      .attr('text-anchor', 'middle')
      .attr('font-size', countFontSize)
      .attr('font-weight', 'bold')
      .attr('fill', d => {
        if (d.stage === 'Won') {
          return isDarkMode ? '#81c784' : '#388E3C';
        }
        return isDarkMode ? '#e0e0e0' : '#555555'; // Brighter in dark mode
      })
      .text(d => {
        if (valueType === 'acv') {
          return `$${d.count.toLocaleString()}`;
        }
        return `${d.count}`;
      });
      
  }, [data, valueType, dimensions, isMobile, theme]);
  
  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: 450, // Increased height to accommodate more spacing
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          maxWidth: '100%' 
        }}
      />
    </Box>
  );
};

export default FunnelChart;