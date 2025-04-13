// import { useState, useEffect } from 'react';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
//   LineChart, Line, PieChart, Pie, Cell
// } from 'recharts';
// import { CalendarIcon, DeviceMobileIcon, DesktopComputerIcon, GlobeIcon } from '@heroicons/react/outline';
// import toast from 'react-hot-toast';

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// export default function AnalyticsDashboard({ linkId }) {
//   const [analytics, setAnalytics] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [timeRange, setTimeRange] = useState('7d');

//   useEffect(() => {
//     const fetchAnalytics = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await fetch(
//           `http://localhost:5000/api/analytics/${linkId}?range=${timeRange}`,
//           {
//             headers: {
//               'Authorization': `Bearer ${token}`,
//               'Content-Type': 'application/json'
//             }
//           }
//         );

//         if (!response.ok) {
//           throw new Error('Failed to fetch analytics');
//         }

//         const data = await response.json();
//         setAnalytics(data);
//       } catch (error) {
//         toast.error(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, [linkId, timeRange]);

//   if (loading) {
//     return (
//       <div className="flex justify-center py-12">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (!analytics) {
//     return <div className="text-center py-8 text-gray-500">No analytics data available</div>;
//   }

//   return (
//     <div className="space-y-8">
//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <SummaryCard 
//           icon={<CalendarIcon className="h-6 w-6" />}
//           title="Total Clicks"
//           value={analytics.totalClicks}
//           change="+12%"
//         />
//         <SummaryCard 
//           icon={<DeviceMobileIcon className="h-6 w-6" />}
//           title="Mobile Users"
//           value={analytics.devices.find(d => d.device === 'mobile')?.count || 0}
//         />
//         <SummaryCard 
//           icon={<DesktopComputerIcon className="h-6 w-6" />}
//           title="Desktop Users"
//           value={analytics.devices.find(d => d.device === 'desktop')?.count || 0}
//         />
//         <SummaryCard 
//           icon={<GlobeIcon className="h-6 w-6" />}
//           title="Countries"
//           value={analytics.locations.length}
//         />
//       </div>

//       {/* Time Range Selector */}
//       <div className="flex justify-end">
//         <select
//           value={timeRange}
//           onChange={(e) => setTimeRange(e.target.value)}
//           className="bg-white border border-gray-300 rounded-md px-3 py-1 text-sm"
//         >
//           <option value="1d">Last 24 Hours</option>
//           <option value="7d">Last 7 Days</option>
//           <option value="30d">Last 30 Days</option>
//           <option value="all">All Time</option>
//         </select>
//       </div>

//       {/* Clicks Over Time */}
//       <div className="bg-white p-4 rounded-lg shadow">
//         <h3 className="text-lg font-medium mb-4">Clicks Over Time</h3>
//         <div className="h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <LineChart data={analytics.dailyClicks}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="date" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line 
//                 type="monotone" 
//                 dataKey="clicks" 
//                 stroke="#3b82f6" 
//                 strokeWidth={2}
//                 dot={{ r: 4 }}
//                 activeDot={{ r: 6 }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Devices & Browsers */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-lg font-medium mb-4">Devices</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={analytics.devices}
//                   cx="50%"
//                   cy="50%"
//                   labelLine={false}
//                   outerRadius={80}
//                   fill="#8884d8"
//                   dataKey="count"
//                   nameKey="device"
//                   label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//                 >
//                   {analytics.devices.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-lg font-medium mb-4">Browsers</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={analytics.browsers}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="browser" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]}>
//                   {analytics.browsers.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>

//       {/* Locations */}
//       {analytics.locations.length > 0 && (
//         <div className="bg-white p-4 rounded-lg shadow">
//           <h3 className="text-lg font-medium mb-4">Locations</h3>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart
//                 layout="vertical"
//                 data={analytics.locations}
//               >
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis type="number" />
//                 <YAxis dataKey="location" type="category" width={100} />
//                 <Tooltip />
//                 <Bar dataKey="count" fill="#8884d8" radius={[0, 4, 4, 0]}>
//                   {analytics.locations.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                   ))}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const SummaryCard = ({ icon, title, value, change }) => (
//   <div className="bg-white p-4 rounded-lg shadow">
//     <div className="flex items-center">
//       <div className="p-2 rounded-full bg-blue-100 text-blue-600">
//         {icon}
//       </div>
//       <div className="ml-4">
//         <p className="text-sm font-medium text-gray-500">{title}</p>
//         <div className="flex items-center">
//           <p className="text-2xl font-semibold">{value}</p>
//           {change && (
//             <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
//               {change}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// );