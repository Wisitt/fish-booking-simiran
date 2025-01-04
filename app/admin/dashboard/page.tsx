// app/admin/dashboard/page.tsx
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
import { Line, Pie } from "react-chartjs-2";
import { FaFish, FaChartLine, FaCalendarAlt } from "react-icons/fa";
import YearMonthWeekSelector from "./components/YearMonthWeekSelector";

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
  weekStart?: string;
  weekEnd?: string;
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

interface WeeklyProfitDataRaw {
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  totalQuantity: number;
  totalProfitOrLoss: number;
}

interface WeeklyProfitData extends WeeklyProfitDataRaw {
  year: number;
  month: number;
}

interface AnalysisResult {
  totalBookings: number;
  growthRate: number;
  mostPopularFish: string;
  topCustomers: TopCustomer[];
  weeklyBreakdown?: WeeklyBreakdown[];
  fishRanking?: FishRank[];
  customerDistribution?: CustomerDist[];
  monthlyBreakdown?: MonthlyData[];
  weeklyDataWithProfit?: WeeklyProfitDataRaw[];
}

const AdminDashboard = () => {
  const [role, setRole] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const [ProfitanalysisData, setProfitAnalysisData] = useState<WeeklyProfitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [costsPerWeek, setCostsPerWeek] = useState<Record<number, number>>({});

  const router = useRouter();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole !== "admin") {
      router.push("/login");
    } else {
      setRole(storedRole);

      const savedCosts = localStorage.getItem("costsPerWeek");
      if (savedCosts) {
        setCostsPerWeek(JSON.parse(savedCosts));
      }

      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/bookings/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          role: "admin",
          costsPerWeek
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data: AnalysisResult = await response.json();
      console.log("API Response:", data);

      const rawData = data.weeklyDataWithProfit || [];

      // คำนวณ year, month จาก weekStart
      const processedData: WeeklyProfitData[] = rawData.map(item => {
        const d = new Date(item.weekStart);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        return { ...item, year, month };
      });

      setProfitAnalysisData(processedData);

      setAnalysisData({
        ...data,
        weeklyBreakdown: data.weeklyBreakdown || [],
        fishRanking: data.fishRanking || [],
        customerDistribution: data.customerDistribution || [],
        monthlyBreakdown: data.monthlyBreakdown || [],
      });

    } catch (error) {
      console.error("Error fetching data:", error);
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  if (!role) return null;
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="text-center font-semibold text-gray-700">Loading...</div></div>;
  if (!analysisData) return <div className="flex justify-center items-center h-screen text-red-600 font-bold">Failed to load data. Please try again later.</div>;

  const {
    totalBookings,
    growthRate,
    mostPopularFish,
    topCustomers = [],
    weeklyBreakdown = [],
    fishRanking = [],
    customerDistribution = [],
    monthlyBreakdown = [],
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
    labels: customerLabels.length ? customerLabels : ["No Data"],
    datasets: [
      {
        data: customerValues.length ? customerValues : [1],
        backgroundColor: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#9333EA", "#6366F1", "#14B8A6"],
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
    <div className="min-h-screen py-10">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 bg-white bg-opacity-90 rounded-lg shadow-xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-4 md:mb-0">Admin Dashboard</h1>
        </header>

        {/* YearMonthWeekSelector */}
        <div className="mb-8">
          <YearMonthWeekSelector
            ProfitanalysisData={ProfitanalysisData}
            costsPerWeek={costsPerWeek}
            setCostsPerWeek={setCostsPerWeek}
            fetchData={fetchData}
          />
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-50 transition">
            <FaChartLine className="text-blue-500 w-8 h-8" />
            <div>
              <h3 className="text-sm font-medium text-gray-700">Total Bookings</h3>
              <p className="text-2xl font-bold text-gray-800">{totalBookings}</p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-50 transition">
            <FaCalendarAlt className="text-green-500 w-8 h-8" />
            <div>
              <h3 className="text-sm font-medium text-gray-700">Growth Rate</h3>
              <p className="text-2xl font-bold text-gray-800">{growthRate.toFixed(2)}%</p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg flex items-center space-x-4 hover:bg-gray-50 transition">
            <FaFish className="text-purple-500 w-8 h-8" />
            <div>
              <h3 className="text-sm font-medium text-gray-700">Most Popular Fish</h3>
              <p className="text-lg font-medium text-gray-900">{mostPopularFish}</p>
            </div>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Top 3 Customers</h3>
            <ul className="space-y-1">
              {topCustomers.map((c, i) => (
                <li key={i} className="text-gray-800 flex justify-between">
                  <span className="font-medium">{c.customerName}:</span> <span>{c.totalQuantity}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:bg-gray-50 transition">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Weekly Bookings Trend</h3>
            <div className="w-full h-80">
              <Line
                data={weeklyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:bg-gray-50 transition">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Seasonality (Monthly Bookings)</h3>
            <div className="w-full h-80">
              <Line
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Customer Distribution */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:bg-gray-50 transition">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Customer Distribution</h3>
            <div className="w-full h-80">
              <Pie
                data={customerPieData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                    title: {
                      display: false,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Fish Ranking */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:bg-gray-50 transition">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Fish Ranking (Type & Size)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 border text-left">Fish (Type & Size)</th>
                    <th className="py-3 px-4 border text-left">Total Quantity</th>
                    <th className="py-3 px-4 border text-left">% Share</th>
                  </tr>
                </thead>
                <tbody>
                  {fishRanking.map((fish, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="py-3 px-4 border">{fish.fish}</td>
                      <td className="py-3 px-4 border text-right">{fish.total}</td>
                      <td className="py-3 px-4 border text-right">{fish.share.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
