import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useGetInstructorSalesDataQuery } from "../../features/api/purchaseApi";
import { useLoadUserQuery } from "../../features/api/authApi";
import { BarChart, LayersIcon, Wallet } from "lucide-react";

const Dashboard = () => {
  const { data, isLoading, error } = useGetInstructorSalesDataQuery();
  const { data: userData } = useLoadUserQuery();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-red-500">
        <p>Error loading data: {error.message || "Something went wrong"}</p>
        <p className="text-sm mt-2">
          {userData?.user?.role !== "instructor" 
            ? "You need instructor privileges to access this dashboard." 
            : "Please try again later."}
        </p>
      </div>
    );
  }

  // Calculate total sales and revenue from instructor sales data
  const totalSales = data?.totalSales || 0;
  const totalRevenue = data?.totalRevenue || 0;
  const salesData = data?.sales || [];
  
  // Format data for course sales chart
  const chartData = salesData.map(course => ({
    name: course.courseTitle,
    sales: course.salesCount,
    revenue: course.revenue
  }));

  // Calculate data for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#83a6ed'];
  const pieData = salesData.map(course => ({
    name: course.courseTitle,
    value: course.salesCount
  }));

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Instructor Dashboard</h1>
      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-100">
              <BarChart className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1 text-gray-700">Total Sales</h2>
              <p className="text-3xl font-bold text-blue-600">{totalSales}</p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100">
              <Wallet className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1 text-gray-700">Revenue</h2>
              <p className="text-3xl font-bold text-green-600">₹{totalRevenue}</p>
            </div>
          </div>
        </div>
        
        {/* Courses */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <LayersIcon className="text-purple-600 w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-1 text-gray-700">Courses</h2>
              <p className="text-3xl font-bold text-purple-600">{salesData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Course Sales</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                angle={-30}
                textAnchor="end"
                height={80}
                interval={0}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? `₹${value}` : value, name === 'revenue' ? 'Revenue' : 'Sales']} />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#4a90e2"
                strokeWidth={3}
                dot={{ stroke: "#4a90e2", strokeWidth: 2 }}
                name="Sales"
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#82ca9d"
                strokeWidth={3}
                dot={{ stroke: "#82ca9d", strokeWidth: 2 }}
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            No sales data available
          </div>
        )}
      </div>

      {/* Course Distribution Pie Chart */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} sales`, 'Total']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Courses Sales Table */}
      {salesData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 overflow-x-auto">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Course Sales Details</h2>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.map((course) => (
                <tr key={course.courseId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{course.courseTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{course.salesCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">₹{course.revenue}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
