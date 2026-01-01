import { useState, useEffect } from 'react';

interface WebVitals {
  LCP: number | null;
  FID: number | null;
  CLS: number | null;
  FCP: number | null;
  TTFB: number | null;
}

interface MetricEntry {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const useWebVitals = () => {
  const [vitals, setVitals] = useState<WebVitals>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
  });
  const [metrics, setMetrics] = useState<MetricEntry[]>([]);

  useEffect(() => {
    // Import web-vitals library dynamically
    import('web-vitals').then(({ onLCP, onFID, onCLS, onFCP, onTTFB }) => {
      const updateMetric = (name: string, value: number, rating: 'good' | 'needs-improvement' | 'poor') => {
        setVitals(prev => ({ ...prev, [name]: value }));
        setMetrics(prev => {
          const filtered = prev.filter(m => m.name !== name);
          return [...filtered, { name, value, rating }];
        });
      };

      onLCP((metric) => updateMetric('LCP', metric.value, metric.rating));
      onFID((metric) => updateMetric('FID', metric.value, metric.rating));
      onCLS((metric) => updateMetric('CLS', metric.value, metric.rating));
      onFCP((metric) => updateMetric('FCP', metric.value, metric.rating));
      onTTFB((metric) => updateMetric('TTFB', metric.value, metric.rating));
    }).catch(() => {
      // Fallback if web-vitals library is not available
      console.warn('web-vitals library not available');
    });
  }, []);

  const getMetricColor = (rating: 'good' | 'needs-improvement' | 'poor') => {
    switch (rating) {
      case 'good': return 'text-green-500';
      case 'needs-improvement': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  const formatMetric = (name: string, value: number | null) => {
    if (value === null) return '--';
    
    switch (name) {
      case 'LCP': return `${(value / 1000).toFixed(2)}s`;
      case 'FID': return `${value.toFixed(0)}ms`;
      case 'CLS': return value.toFixed(3);
      case 'FCP': return `${(value / 1000).toFixed(2)}s`;
      case 'TTFB': return `${value.toFixed(0)}ms`;
      default: return value.toString();
    }
  };

  return { vitals, metrics, getMetricColor, formatMetric };
};
