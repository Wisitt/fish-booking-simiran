"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from "chart.js";
import { Line, Pie, } from "react-chartjs-2";
import { FaFish, FaChartLine, FaCalendarAlt } from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  BarElement
);

interface WeeklyBreakdown {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  totalQuantity: number;
}

interface TopCustomer {
  customerName: string;
  totalQuantity: number;
}

interface FishRank {
  fish: string;
  total: number;
  share: number;
}

interface CustomerDist {
  customerName: string;
  total: number;
  share: number;
}

interface MonthlyData {
  month: number;
  totalQuantity: number;
}

interface AnalysisResult {
  totalBookings: number;
  growthRate: number;
  mostPopularFish: string;
  topCustomers: TopCustomer[];
  weeklyBreakdown: WeeklyBreakdown[];
  fishRanking: FishRank[];
  customerDistribution: CustomerDist[];
  monthlyBreakdown: MonthlyData[];
}

const AdminDashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole !== "admin") {
      router.push("/login");
    } else {
      setRole(storedRole);
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    const response = await fetch("/api/bookings/analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: "admin" }),
    });

    if (!response.ok) {
      console.error("Failed to fetch data");
      return;
    }

    const data: AnalysisResult = await response.json();
    setAnalysisData(data);
  };

  if (role !== "admin") return null;
  if (!analysisData) return <div className="text-center">Loading...</div>;

  const {
    totalBookings,
    growthRate,
    mostPopularFish,
    topCustomers,
    weeklyBreakdown,
    fishRanking,
    customerDistribution,
    monthlyBreakdown,
  } = analysisData;

  // Weekly Trend Chart
  const weeklyLabels = weeklyBreakdown.map((w) => `Week ${w.weekNumber}`);
  const weeklyData = weeklyBreakdown.map((w) => w.totalQuantity);

  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: "Weekly Bookings",
        data: weeklyData,
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.2)",
        tension: 0.4,
      },
    ],
  };

  // Customer Distribution Chart
  const customerLabels = customerDistribution.map((c) => c.customerName);
  const customerValues = customerDistribution.map((c) => c.total);

  const customerPieData = {
    labels: customerLabels,
    datasets: [
      {
        data: customerValues,
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#9333EA"],
      },
    ],
  };

  // Monthly Seasonality Chart
  const monthLabels = monthlyBreakdown.map((m) => `Month ${m.month}`);
  const monthlyValues = monthlyBreakdown.map((m) => m.totalQuantity);

  const monthlyChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "Monthly Bookings",
        data: monthlyValues,
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="p-6 rounded-lg bg-white bg-opacity-30 backdrop-blur-lg shadow-lg flex items-center space-x-4">
          <FaChartLine className="text-blue-500 w-10 h-10" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Total Bookings</h3>
            <p className="text-4xl font-bold text-gray-900">{totalBookings}</p>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-white bg-opacity-30 backdrop-blur-lg shadow-lg flex items-center space-x-4">
          <FaCalendarAlt className="text-green-500 w-10 h-10" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Growth Rate</h3>
            <p className="text-4xl font-bold text-gray-900">{growthRate.toFixed(2)}%</p>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-white bg-opacity-30 backdrop-blur-lg shadow-lg flex items-center space-x-4">
          <FaFish className="text-purple-500 w-10 h-10" />
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Most Popular Fish</h3>
            <p className="text-xl font-medium text-gray-700">{mostPopularFish}</p>
          </div>
        </div>
        <div className="p-6 rounded-lg bg-white bg-opacity-30 backdrop-blur-lg shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Top 3 Customers</h3>
          <ul className="space-y-1 mt-2">
            {topCustomers.map((c, i) => (
              <li key={i} className="text-gray-900">
                <span className="font-medium">{c.customerName}:</span> {c.totalQuantity}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Weekly Bookings Trend</h3>
        <Line data={weeklyChartData} />
      </div>

      {/* Fish Ranking */}
      <div className="bg-white bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Fish Ranking</h3>
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Fish Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Total Quantity</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">% Share</th>
            </tr>
          </thead>
          <tbody>
            {fishRanking.map((fish, index) => (
              <tr key={index} className="border-b hover:bg-gray-50 transition">
                <td className="py-3 px-4 text-gray-900">{fish.fish}</td>
                <td className="py-3 px-4 text-gray-900">{fish.total}</td>
                <td className="py-3 px-4 text-gray-900">{fish.share.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Customer Distribution */}
      <div className="bg-white bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Customer Distribution</h3>
        <Pie data={customerPieData} />
      </div>

      {/* Monthly Chart */}
      <div className="bg-white bg-opacity-50 backdrop-blur-lg rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Seasonality (Monthly Bookings)</h3>
        <Line data={monthlyChartData} />
      </div>
    </div>
  );
};

export default AdminDashboard;
