// components/AnalyticsDashboard.js
'use client';

import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export default function AnalyticsDashboard() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Tool Usage',
        data: [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',  // Blue-500
          'rgba(16, 185, 129, 0.7)', // Emerald-500
          'rgba(245, 158, 11, 0.7)', // Amber-500
          'rgba(239, 68, 68, 0.7)',  // Red-500
          'rgba(139, 92, 246, 0.7)', // Violet-500
          'rgba(236, 72, 153, 0.7)', // Pink-500
          'rgba(22, 163, 74, 0.7)',  // Green-600
          'rgba(217, 119, 6, 0.7)',  // Amber-600
        ],
        borderColor: [ // Corresponding darker borders
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(236, 72, 153, 1)',
          'rgba(22, 163, 74, 1)',
          'rgba(217, 119, 6, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchToolUsageData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const toolUsageStats = [ // Sample data
          { name: 'Google Ads Optimizer', usage: Math.floor(Math.random() * 100) + 20 },
          { name: 'Code Generator', usage: Math.floor(Math.random() * 80) + 15 },
          { name: 'Python Calculator', usage: Math.floor(Math.random() * 50) + 10 },
          { name: 'Proposal Generator', usage: Math.floor(Math.random() * 70) + 25 },
          { name: 'Snippet Search', usage: Math.floor(Math.random() * 120) + 30 },
          { name: 'SEO Audit Tool', usage: Math.floor(Math.random() * 40) + 5 },
        ];

        if (toolUsageStats && toolUsageStats.length > 0) {
          setChartData({
            labels: toolUsageStats.map(t => t.name),
            datasets: [{ ...chartData.datasets[0], data: toolUsageStats.map(t => t.usage) }],
          });
        } else {
          setChartData({ labels: [], datasets: [{ ...chartData.datasets[0], data: [] }] });
        }
      } catch (err) {
        console.error("Failed to fetch tool usage data:", err);
        setError("Could not load tool usage data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchToolUsageData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 }}},
      title: { display: true, text: 'Tool Usage Distribution', font: { size: 18 }, padding: { top: 10, bottom: 30 }},
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) label += ': ';
            if (context.parsed !== null) label += context.parsed + ' interactions';
            return label;
          }
        }
      }
    }
  };

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading analytics...</div>;
  if (error) return <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">{error}</div>;
  if (chartData.labels.length === 0) return <div className="p-6 text-center text-gray-500">No analytics data available.</div>;

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white shadow-xl">
      <div className="relative h-[450px] w-full"> {/* Increased height */}
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
