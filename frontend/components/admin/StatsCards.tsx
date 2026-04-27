"use client";

import React, { useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Users, ShieldAlert, Building2, Zap, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: any;
  accent: "amber" | "red" | "blue" | "green";
  delay: number;
  dataPoints: number[];
}

const CountUp = ({ to, prefix = "", suffix = "" }: { to: number; prefix?: string; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const val = Math.floor(latest);
    return prefix + val.toLocaleString() + suffix;
  });

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [to]);

  return <motion.span>{rounded}</motion.span>;
};

const Sparkline = ({ points, accent }: { points: number[]; accent: string }) => {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min;
  const height = 40;
  const width = 120;
  
  // Generate SVG path - no external libs
  const pathData = points.reduce((path, val, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = height - ((val - min) / (range || 1)) * height;
    return path + (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  }, "");

  // Area path (closes the shape)
  const areaPath = `${pathData} L ${width} ${height} L 0 ${height} Z`;

  const colors = {
    amber: "#f59e0b",
    red: "#ef4444",
    blue: "#3b82f6",
    green: "#22c55e",
  };

  const selectedColor = colors[accent as keyof typeof colors] || colors.amber;

  return (
    <div className="relative h-10 w-full mt-4">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${accent}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={selectedColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={selectedColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={areaPath}
          fill={`url(#grad-${accent})`}
          stroke="none"
        />
        <motion.path
          d={pathData}
          fill="none"
          stroke={selectedColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

const StatsCard = ({ title, value, prefix, suffix, trend, icon: Icon, accent, delay, dataPoints }: StatsCardProps) => {
  const accents = {
    amber: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/20",
    red: "text-red-500 bg-red-500/10 border-red-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    green: "text-green-500 bg-green-500/10 border-green-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-[#222] bg-[#1a1a1a] p-5 shadow-sm transition-all hover:border-[#333]"
    >
      <div className="flex items-center justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border shadow-inner", accents[accent])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-black uppercase tracking-wider",
            trend.isPositive ? "text-green-500" : "text-amber-500"
          )}>
            {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend.value}
          </div>
        )}
      </div>

      <div className="mt-4">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#525252]">
          {title}
        </h3>
        <div className="mt-1">
          <span className="text-3xl font-black tracking-tighter text-[#f5f5f5]">
            <CountUp to={value} prefix={prefix} suffix={suffix} />
          </span>
        </div>
      </div>

      <Sparkline points={dataPoints} accent={accent} />
    </motion.div>
  );
};

export const StatsCards = ({ stats }: { stats: any }) => {
  // Demo data for sparklines
  const sparkData = {
    queries: [34, 45, 23, 56, 78, 45, 90, 120, 85, 124],
    flagged: [1, 5, 2, 8, 4, 12, 6, 9, 7, 24],
    ministries: [2, 3, 3, 4, 5, 5, 6, 7, 7, 7],
    latency: [1200, 900, 1100, 850, 700, 950, 800, 600, 750, 840]
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Queries (24H)"
        value={stats?.total_queries || 1248}
        trend={{ value: "+12.5%", isPositive: true }}
        icon={Zap}
        accent="blue"
        delay={0.1}
        dataPoints={sparkData.queries}
      />
      <StatsCard 
        title="Flagged Threats"
        value={stats?.flagged_queries || 24}
        trend={{ value: "Priority Low", isPositive: false }}
        icon={ShieldAlert}
        accent="red"
        delay={0.2}
        dataPoints={sparkData.flagged}
      />
      <StatsCard 
        title="Institutional Nodes"
        value={stats?.active_ministries || 7}
        icon={Building2}
        accent="amber"
        delay={0.3}
        dataPoints={sparkData.ministries}
      />
      <StatsCard 
        title="Mean Response"
        value={stats?.avg_ms || 840}
        suffix="ms"
        trend={{ value: "Stable", isPositive: true }}
        icon={Users}
        accent="green"
        delay={0.4}
        dataPoints={sparkData.latency}
      />
    </div>
  );
};
