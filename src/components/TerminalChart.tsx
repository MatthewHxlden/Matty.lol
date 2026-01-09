import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, CandlestickSeries, LineSeries, UTCTimestamp } from 'lightweight-charts';

interface TerminalChartProps {
  symbol: string;
  data: Array<{
    time: UTCTimestamp;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  height?: number;
  chartType?: 'line' | 'candlestick';
}

const TerminalChart: React.FC<TerminalChartProps> = ({ symbol, data, height = 400, chartType = 'line' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    console.log('Creating chart with data:', data.length, 'points', 'type:', chartType);

    try {
      // Create chart with terminal theme
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: {
            type: ColorType.Solid,
            color: '#1a1a1a',
          },
          textColor: '#00ff00',
          fontSize: 12,
          fontFamily: 'monospace',
        },
        grid: {
          vertLines: {
            visible: false,
          },
          horzLines: {
            visible: false,
          },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: {
            color: '#00ff00',
            width: 1,
            style: 1,
          },
          horzLine: {
            color: '#00ff00',
            width: 1,
            style: 1,
          },
        },
        rightPriceScale: {
          borderColor: '#00ff00',
          textColor: '#00ff00',
        },
        timeScale: {
          borderColor: '#00ff00',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      console.log('Chart created, adding series...');

      let series: any;

      if (chartType === 'candlestick') {
        // Add candlestick series with terminal colors
        series = chart.addSeries(CandlestickSeries, {
          upColor: '#00ff00',
          downColor: '#ff0000',
          borderDownColor: '#ff0000',
          borderUpColor: '#00ff00',
          wickDownColor: '#ff0000',
          wickUpColor: '#00ff00',
        });
      } else {
        // Add line series with terminal colors
        series = chart.addSeries(LineSeries, {
          color: '#9cfa47',
          lineWidth: 2,
          lineType: 0,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 4,
          crosshairMarkerBorderColor: '#9cfa47',
          crosshairMarkerBackgroundColor: '#1a1a1a',
        });
      }

      console.log('Series added, setting data...');

      // Set data based on chart type
      if (chartType === 'candlestick') {
        series.setData(data);
      } else {
        // For line chart, use close prices
        const lineData = data.map(item => ({
          time: item.time,
          value: item.close
        }));
        series.setData(lineData);
      }

      // Enable smooth transitions
      chart.applyOptions({
        timeScale: {
          borderColor: '#00ff00',
          timeVisible: true,
          secondsVisible: false,
        },
        kineticScroll: {
          mouse: true,
          touch: true,
        },
      });

      console.log('Data set successfully');

      chartRef.current = chart;
      seriesRef.current = series;

      // Handle resize
      const handleResize = () => {
        if (chartRef.current && chartContainerRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
          chartRef.current.remove();
        }
      };
    } catch (error) {
      console.error('Error creating chart:', error);
    }
  }, [data, height, chartType]);

  // Update data smoothly when it changes
  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      if (chartType === 'candlestick') {
        seriesRef.current.setData(data);
      } else {
        const lineData = data.map(item => ({
          time: item.time,
          value: item.close
        }));
        seriesRef.current.setData(lineData);
      }
    }
  }, [data, chartType]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-secondary">$</span>
        <span className="text-foreground">./chart --symbol {symbol} --type {chartType}</span>
        <span className="cursor-blink text-primary">_</span>
      </div>
      <div 
        ref={chartContainerRef} 
        className="border border-terminal-green rounded bg-terminal-black"
        style={{ height: `${height}px` }}
      />
    </div>
  );
};

export default TerminalChart;
