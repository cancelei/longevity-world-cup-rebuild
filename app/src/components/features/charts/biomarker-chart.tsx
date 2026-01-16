"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BiomarkerDataPoint {
  date: string;
  phenoAge: number;
  chronologicalAge: number;
  albumin?: number;
  creatinine?: number;
  glucose?: number;
  crp?: number;
  lymphocytePercent?: number;
  mcv?: number;
  rdw?: number;
  alp?: number;
  wbc?: number;
}

interface BiomarkerChartProps {
  data: BiomarkerDataPoint[];
  className?: string;
}

const biomarkerConfig = {
  phenoAge: { label: "Biological Age", color: "#00BCD4", unit: "years" },
  chronologicalAge: { label: "Chronological Age", color: "#9E9E9E", unit: "years" },
  albumin: { label: "Albumin", color: "#4CAF50", unit: "g/dL", optimal: { min: 3.5, max: 5.0 } },
  creatinine: { label: "Creatinine", color: "#2196F3", unit: "mg/dL", optimal: { min: 0.6, max: 1.2 } },
  glucose: { label: "Glucose", color: "#FF9800", unit: "mg/dL", optimal: { min: 70, max: 100 } },
  crp: { label: "CRP", color: "#F44336", unit: "mg/L", optimal: { min: 0, max: 3.0 } },
  lymphocytePercent: { label: "Lymphocyte %", color: "#9C27B0", unit: "%", optimal: { min: 20, max: 40 } },
  mcv: { label: "MCV", color: "#00BCD4", unit: "fL", optimal: { min: 80, max: 100 } },
  rdw: { label: "RDW", color: "#795548", unit: "%", optimal: { min: 11.5, max: 14.5 } },
  alp: { label: "ALP", color: "#607D8B", unit: "U/L", optimal: { min: 44, max: 147 } },
  wbc: { label: "WBC", color: "#E91E63", unit: "K/uL", optimal: { min: 4.5, max: 11.0 } },
};

type BiomarkerKey = keyof typeof biomarkerConfig;

interface TooltipPayloadEntry {
  color: string;
  name: string;
  value: number;
  dataKey: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-[var(--foreground)] mb-2">{label}</p>
      {payload.map((entry, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[var(--foreground-secondary)]">{entry.name}:</span>
          <span className="font-medium text-[var(--foreground)]">
            {entry.value?.toFixed(1)} {biomarkerConfig[entry.dataKey as BiomarkerKey]?.unit}
          </span>
        </div>
      ))}
    </div>
  );
};

export function PhenoAgeChart({ data, className }: BiomarkerChartProps) {
  if (!data.length) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-[var(--foreground-muted)]">No data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate age reduction trend
  const latestData = data[data.length - 1];
  const oldestData = data[0];
  const ageReductionChange = latestData && oldestData
    ? (latestData.chronologicalAge - latestData.phenoAge) -
      (oldestData.chronologicalAge - oldestData.phenoAge)
    : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Biological Age Over Time</CardTitle>
          {ageReductionChange !== 0 && (
            <div
              className={cn(
                "text-sm font-medium px-2 py-1 rounded",
                ageReductionChange > 0
                  ? "bg-[var(--color-success)]/10 text-[var(--color-success)]"
                  : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
              )}
            >
              {ageReductionChange > 0 ? "+" : ""}{ageReductionChange.toFixed(1)} yrs improvement
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--foreground-muted)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--foreground-muted)"
                fontSize={12}
                tickLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="chronologicalAge"
                name="Chronological Age"
                stroke="#9E9E9E"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="phenoAge"
                name="Biological Age"
                stroke="#00BCD4"
                strokeWidth={3}
                dot={{ fill: "#00BCD4", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function BiomarkerTrendChart({ data, className }: BiomarkerChartProps) {
  const [selectedBiomarkers, setSelectedBiomarkers] = useState<BiomarkerKey[]>([
    "albumin",
    "glucose",
    "crp",
  ]);

  const biomarkerKeys: BiomarkerKey[] = [
    "albumin",
    "creatinine",
    "glucose",
    "crp",
    "lymphocytePercent",
    "mcv",
    "rdw",
    "alp",
    "wbc",
  ];

  const toggleBiomarker = (key: BiomarkerKey) => {
    setSelectedBiomarkers((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  if (!data.length) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <p className="text-[var(--foreground-muted)]">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Biomarker Trends</CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          {biomarkerKeys.map((key) => (
            <button
              key={key}
              onClick={() => toggleBiomarker(key)}
              className={cn(
                "px-3 py-1 text-xs rounded-full border transition-colors",
                selectedBiomarkers.includes(key)
                  ? "border-transparent text-white"
                  : "border-[var(--border)] text-[var(--foreground-muted)] hover:border-[var(--foreground-muted)]"
              )}
              style={{
                backgroundColor: selectedBiomarkers.includes(key)
                  ? biomarkerConfig[key].color
                  : "transparent",
              }}
            >
              {biomarkerConfig[key].label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--foreground-muted)"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="var(--foreground-muted)"
                fontSize={12}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {selectedBiomarkers.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={biomarkerConfig[key].label}
                  stroke={biomarkerConfig[key].color}
                  strokeWidth={2}
                  dot={{ fill: biomarkerConfig[key].color, strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

interface ZScoreData {
  biomarker: string;
  value: number;
  zScore: number;
  optimal: { min: number; max: number };
}

interface ZScoreChartProps {
  data: ZScoreData[];
  className?: string;
}

export function ZScoreChart({ data, className }: ZScoreChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Biomarker Z-Scores</CardTitle>
        <p className="text-sm text-[var(--foreground-muted)]">
          Deviation from optimal range (0 = optimal)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item) => {
            const isOptimal = item.zScore >= -1 && item.zScore <= 1;
            const isWarning = Math.abs(item.zScore) > 1 && Math.abs(item.zScore) <= 2;
            const isCritical = Math.abs(item.zScore) > 2;

            return (
              <div key={item.biomarker} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--foreground)]">{item.biomarker}</span>
                  <span className="text-[var(--foreground-muted)]">
                    {item.value.toFixed(2)}
                  </span>
                </div>
                <div className="relative h-6 bg-[var(--background-elevated)] rounded-full overflow-hidden">
                  {/* Optimal zone indicator */}
                  <div className="absolute inset-y-0 left-1/3 right-1/3 bg-[var(--color-success)]/20" />

                  {/* Z-score marker */}
                  <div
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-all",
                      isOptimal && "bg-[var(--color-success)]",
                      isWarning && "bg-[var(--color-warning)]",
                      isCritical && "bg-[var(--color-error)]"
                    )}
                    style={{
                      left: `${Math.min(Math.max((item.zScore + 3) / 6 * 100, 0), 100)}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[var(--foreground-muted)]">
                  <span>Low</span>
                  <span>Optimal</span>
                  <span>High</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
