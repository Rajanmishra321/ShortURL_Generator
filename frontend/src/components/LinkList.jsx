import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  TrashIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

export default function LinkList() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLink, setSelectedLink] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch links
        const linksRes = await fetch('http://localhost:5000/api/links', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const linksData = await linksRes.json();
        setLinks(linksData);

        // Fetch analytics for first link by default
        if (linksData.length > 0) {
          fetchAnalytics(linksData[0]._id);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchAnalytics = async (linkId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/analytics/${linkId}?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSelectedLink(linkId);
      setAnalyticsData(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getExpirationStatus = (expiresAt) => {
    if (!expiresAt) return 'Never';
    const now = new Date();
    const expDate = new Date(expiresAt);
    return expDate > now ? 
      `Expires in ${Math.ceil((expDate - now) / (1000 * 60 * 60 * 24))} days` : 
      'Expired';
  };

  // Process data for charts
  const processChartData = (clicks) => {
    const dailyData = {};
    const deviceData = {};
    const browserData = {};

    clicks.forEach(click => {
      // Date-based data
      const date = new Date(click.clickedAt).toLocaleDateString();
      dailyData[date] = (dailyData[date] || 0) + 1;

      // Device data
      const device = click.deviceType || 'Unknown';
      deviceData[device] = (deviceData[device] || 0) + 1;

      // Browser data
      const browser = click.userAgent?.split(' ')[0] || 'Unknown';
      browserData[browser] = (browserData[browser] || 0) + 1;
    });

    return {
      daily: Object.entries(dailyData).map(([date, count]) => ({ date, clicks: count })),
      devices: Object.entries(deviceData).map(([name, value]) => ({ name, value })),
      browsers: Object.entries(browserData).map(([name, value]) => ({ name, value }))
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
                    onClick={() => fetchAnalytics(link._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <a
                          href={link.shortUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {link.shortUrl.replace('http://localhost:5000/', '')}
                          <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                        </a>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(link.shortUrl);
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
                        <span className="font-medium">{link.clicks}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(link.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        getExpirationStatus(link.expiresAt).includes('Expires') ? 
                        'bg-green-100 text-green-800' : 
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
      {analyticsData && (
        <div className="bg-white shadow overflow-hidden rounded-xl">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clicks Over Time */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-700 mb-4">Clicks Over Time</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={processChartData(analyticsData.clicks).daily}>
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
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Devices */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-700 mb-4">Devices</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processChartData(analyticsData.clicks).devices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Browsers */}
            <div className="bg-gray-50 p-4 rounded-lg col-span-1 md:col-span-2">
              <h4 className="text-md font-medium text-gray-700 mb-4">Browsers</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processChartData(analyticsData.clicks).browsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      fill="#10b981" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}