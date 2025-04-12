import { NextResponse } from 'next/server';
import rawData from '@/data/data.json';

// Define proper typing for the raw data
interface RawDataItem {
  label: string;
  acv: number;
  count: number;
  diffRate: number;
  diffacvRate: number;
}

// Transform into a format compatible with our visualization components
export async function GET() {
  // Process the funnel data
  const processedData = rawData.map((item: RawDataItem) => {
    // Determine the status of this funnel step
    let status = "neutral";
    if (item.diffRate > 0.7) status = "positive";
    else if (item.diffRate < 0.4) status = "negative";
    
    return {
      label: item.label,
      acv: item.acv,
      count: item.count,
      diffRate: item.diffRate,
      diffacvRate: item.diffacvRate,
      percentageFormatted: `${(item.diffacvRate * 100).toFixed(1)}%`,
      diffRateFormatted: `${(item.diffRate * 100).toFixed(1)}%`,
      status: status
    };
  });
  
  // For backwards compatibility with existing components
  // Transform into territory-based format
  const territoriesData = [
    {
      Territory: "Sales Pipeline",
      Suspect: rawData.find(item => item.label === "Suspect")?.count || 0,
      Qualify: rawData.find(item => item.label === "Qualify")?.count || 0,
      Demo: rawData.find(item => item.label === "Demo")?.count || 0,
      Proposal: rawData.find(item => item.label === "Proposal")?.count || 0,
      Negotiate: rawData.find(item => item.label === "Negotiate")?.count || 0,
      Won: rawData.find(item => item.label === "Won")?.count || 0,
      Lost: 0, // This isn't in your data, so defaulting to 0
      qualifyPercentage: ((rawData.find(item => item.label === "Qualify")?.diffRate || 0) * 100).toFixed(1),
      wonPercentageRounded: Math.round((rawData.find(item => item.label === "Won")?.diffRate || 0) * 100)
    }
  ];

  // Return both data formats
  return NextResponse.json({
    funnelData: processedData,
    territoriesData: territoriesData
  });
}
