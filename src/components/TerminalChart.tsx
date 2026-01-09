import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType, CrosshairMode } from 'lightweight-charts';

interface TerminalChartProps {
  symbol: string;
  data: Array<{
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  height?: number;
}

const TerminalChart: React.FC<TerminalChartProps> = ({ symbol, data, height = 400 }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
          color: '#00ff00',
          style: 1,
          visible: true,
        },
        horzLines: {
          color: '#00ff00',
          style: 1,
          visible: true,
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
      leftPriceScale: {
        borderColor: '#00ff00',
        textColor: '#00ff00',
      },
      timeScale: {
        borderColor: '#00ff00',
        textColor: '#00ff00',
        timeVisible: true,
        secondsVisible: false,
      },
      overlayPriceScales: false,
      localization: {
        priceFormatter: (price: number) => {
          return `$${price.toFixed(2)}`;
        },
        timeFormatter: (time: number) => {
          const date = new Date(time * 1000);
          return date.toLocaleString();
        },
      },
    });

    // Add candlestick series with terminal colors
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#00ff00',
      downColor: '#ff0000',
      borderDownColor: '#ff0000',
      borderUpColor: '#00ff00',
      wickDownColor: '#ff0000',
      wickUpColor: '#00ff00',
    });

    // Set data
    candlestickSeries.setData(data);

    // Add volume series at the bottom
    const volumeSeries = chart.addHistogramSeries({
      color: '#00ff00',
      priceFormat: '0.00',
      priceScaleId: '',
      scaleMargins: {
        top: 0.85,
        bottom: 0,
      },
    });

    // Volume data
    const volumeData = data.map(item => ({
      time: item.time,
      value: item.volume || 0,
      color: item.close > item.open ? '#00ff00' : '#ff0000',
    }));

    volumeSeries.setData(volumeData);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

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
  }, [data, height]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-secondary">$</span>
        <span className="text-foreground">./chart --symbol {symbol}</span>
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
