"use client";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import type { LayerScore } from "@/lib/types/assessment";
import { LAYERS } from "@/lib/scoring/layers.config";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export function RadarChart({ layerScores }: { layerScores: LayerScore[] }) {
  const scoreByLayer = new Map(layerScores.map((s) => [s.layerId, s.score100]));

  const data = {
    labels: LAYERS.map((l) => l.shortName),
    datasets: [
      {
        label: "Score",
        data: LAYERS.map((l) => scoreByLayer.get(l.id) ?? 0),
        backgroundColor: "rgba(99, 102, 241, 0.25)",
        borderColor: "rgb(99, 102, 241)",
        pointBackgroundColor: "rgb(99, 102, 241)",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { display: false },
        grid: { color: "#E2E8F0" },
        angleLines: { color: "#E2E8F0" },
        pointLabels: { font: { size: 11, weight: 600 as const }, color: "#334155" },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return <Radar data={data} options={options} />;
}
