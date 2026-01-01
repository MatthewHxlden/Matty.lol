import { useState } from 'react';
import { motion } from 'framer-motion';
import { useWebVitals } from '@/hooks/useWebVitals';
import { Activity, Clock, Zap, Eye, Server } from 'lucide-react';

const WebVitalsDisplay = () => {
  const [expanded, setExpanded] = useState(false);
  const { metrics, getMetricColor, formatMetric } = useWebVitals();

  const metricIcons = {
    LCP: Activity,
    FID: Zap,
    CLS: Eye,
    FCP: Clock,
    TTFB: Server,
  };

  const metricDescriptions = {
    LCP: 'Largest Contentful Paint',
    FID: 'First Input Delay',
    CLS: 'Cumulative Layout Shift',
    FCP: 'First Contentful Paint',
    TTFB: 'Time to First Byte',
  };

  if (metrics.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="relative"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
        title="Core Web Vitals"
      >
        <span className="text-muted-foreground/50">[</span>
        <Activity className="w-3 h-3" />
        <span className="text-secondary">PERF:</span>
        <span className="text-accent">
          {metrics.filter(m => {
            const rating = (m as any).rating || 'good';
            return rating === 'good';
          }).length}/{metrics.length}
        </span>
        <span className="text-muted-foreground/50">]</span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full left-0 mb-2 p-3 border border-border/60 bg-card/30 backdrop-blur-md neon-border shine-hover rounded-lg min-w-[200px] z-50"
        >
          <div className="space-y-2 text-xs font-mono">
            <div className="text-secondary text-center mb-2 pb-2 border-b border-border/30">
              Core Web Vitals
            </div>
            {metrics.map((metric) => {
              const Icon = metricIcons[metric.name as keyof typeof metricIcons];
              const rating = (metric as any).rating || 'good';
              
              return (
                <div key={metric.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {Icon && <Icon className="w-3 h-3" />}
                    <span className="text-muted-foreground/70 text-[10px]">
                      {metric.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={getMetricColor(rating)}>
                      {formatMetric(metric.name, metric.value)}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                  </div>
                </div>
              );
            })}
            <div className="pt-2 mt-2 border-t border-border/30 text-[10px] text-muted-foreground/50 text-center">
              Click to refresh
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default WebVitalsDisplay;
