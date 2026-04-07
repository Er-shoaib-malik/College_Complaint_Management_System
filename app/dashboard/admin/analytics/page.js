"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-center py-10">Loading analytics...</p>;

  return (
    <div>
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Insights & statistics</p>
      </div>

      {/* GRID */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* 1️⃣ STATUS PIE */}
        <div className="card">
          <h2 className="font-semibold mb-4">Complaint Status</h2>

          <PieChart width={350} height={250}>
            <Pie
              data={data.statusStats}
              dataKey="count"
              nameKey="_id"
              outerRadius={90}
            >
              {data.statusStats.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        {/* 2️⃣ PRIORITY BAR */}
        <div className="card">
          <h2 className="font-semibold mb-4">Priority Distribution</h2>

          <BarChart width={350} height={250} data={data.priorityStats}>
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </div>

        {/* 3️⃣ CATEGORY BAR */}
        <div className="card">
          <h2 className="font-semibold mb-4">Category Analysis</h2>

          <BarChart width={350} height={250} data={data.categoryStats}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#22c55e" />
          </BarChart>
        </div>

        {/* 4️⃣ MONTHLY LINE */}
        <div className="card">
          <h2 className="font-semibold mb-4">Monthly Complaints</h2>

          <LineChart width={350} height={250} data={data.monthlyStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#f59e0b" />
          </LineChart>
        </div>

      </div>
    </div>
  );
}