import { useEffect } from 'react';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchLinks,
  fetchAnalytics,
  selectLink
} from '../redux/linksSlice';
import {
  ChartBarIcon,
  TrashIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon,
  CalendarIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function LinkList() {
  const dispatch = useDispatch();
  const {
    links,
    selectedLink,
    analytics,
    status,
    error
  } = useSelector((state) => state.links);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    dispatch(fetchLinks());
  }, [dispatch]);

  useEffect(() => {
    if (selectedLink) {
      dispatch(fetchAnalytics({ linkId: selectedLink, range: timeRange }));
    }
  }, [selectedLink, timeRange, dispatch]);

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpirationStatus = (expiresAt) => {
    if (!expiresAt) return 'Never expires';
    const now = new Date();
    const expDate = new Date(expiresAt);
    return expDate > now ? 
      `Expires in ${Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))} days` : 
      'Expired';
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Links Table */}
      <div className="bg-white shadow overflow-hidden rounded-xl">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Links</h3>
          <div className="flex space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="1d">Last 24h</option>
              <option value="7d">Last 7d</option>
              <option value="30d">Last 30d</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Short URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Original URL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clicks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {links.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No links yet. Create your first shortened URL!
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr 
                    key={link._id} 
                    className={`hover:bg-gray-50 cursor-pointer ${selectedLink === link._id ? 'bg-blue-50' : ''}`}
                    onClick={() => dispatch(selectLink(link._id))}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <a
                          href={link.shortCode}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link.shortCode ? link.shortCode.replace('http://localhost:5000/', '') : 'N/A'}
                          <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(link.shortCode);
                          }}
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                        >
                          <ClipboardDocumentIcon className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 truncate max-w-xs block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {link.originalUrl}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 text-gray-500 mr-1" />
                        <span className="font-medium">{link.clicks || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(link.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        getExpirationStatus(link.expiresAt).includes('Expires') ? 
                        'bg-green-100 text-green-800' : 
                        getExpirationStatus(link.expiresAt) === 'Never expires' ?
                        'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {getExpirationStatus(link.expiresAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="p-1 text-blue-600 hover:text-blue-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            // QR code logic
                          }}
                        >
                          <QrCodeIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="p-1 text-red-600 hover:text-red-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete logic
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {analytics && (
        <AnalyticsDashboard analytics={analytics} />
      )}
    </div>
  );
}

function AnalyticsDashboard({ analytics }) {
  const chartData = {
    daily: analytics.dailyClicks || [],
    devices: (analytics.devices || []).map(item => ({
      name: item.device,
      value: item.count
    })),
    browsers: (analytics.browsers || []).map(item => ({
      name: item.browser,
      value: item.count
    })),
    locations: analytics.locations || []
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-xl">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          Analytics for: {analytics.linkDetails?.originalUrl || 'Unknown URL'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
        <SummaryCard 
          icon={<CalendarIcon className="h-6 w-6" />}
          title="Total Clicks"
          value={analytics.totalClicks || 0}
        />
        <SummaryCard 
          icon={<DevicePhoneMobileIcon className="h-6 w-6" />}
          title="Mobile Users"
          value={chartData.devices.find(d => d.name === 'mobile')?.value || 0}
        />
        <SummaryCard 
          icon={<ComputerDesktopIcon className="h-6 w-6" />}
          title="Desktop Users"
          value={chartData.devices.find(d => d.name === 'desktop')?.value || 0}
        />
        <SummaryCard 
          icon={<GlobeAltIcon className="h-6 w-6" />}
          title="Unique Locations"
          value={chartData.locations.length}
        />
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartData.daily.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-700 mb-4">Clicks Over Time</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.devices.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-700 mb-4">Devices</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.devices}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.devices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.browsers.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-700 mb-4">Browsers</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.browsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {chartData.browsers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.locations.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
            <h4 className="text-md font-medium text-gray-700 mb-4">Locations</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData.locations}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                    {chartData.locations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-blue-100 text-blue-600">
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}