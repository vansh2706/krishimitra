'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserPestReports, getUserChatHistory, getUserActivity } from '@/lib/user-data-helpers';

interface PestReport {
  id: string;
  pestName?: string;
  cropAffected: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  symptoms: string[];
  imageUrls: string[];
  latitude: number;
  longitude: number;
  status: string;
  detectionMethod?: string;
  reportedAt: any;
}

interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: string;
  helpful?: boolean;
  createdAt: any;
}

interface Activity {
  id: string;
  action: string;
  details: any;
  createdAt: any;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pests' | 'chat' | 'activity'>('pests');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [pestReports, setPestReports] = useState<PestReport[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Filter states
  const [dateFilter, setDateFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [pestsData, chatData, activityData] = await Promise.all([
        getUserPestReports(),
        getUserChatHistory(),
        getUserActivity(50)
      ]);

      setPestReports(pestsData.reports || []);
      setChatHistory(chatData.chatHistory || []);
      setActivities(activityData.activities || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPestReports = () => {
    return pestReports.filter(report => {
      const matchesSeverity = severityFilter === 'all' || report.severity === severityFilter;
      const matchesDate = filterByDate(report.reportedAt);
      return matchesSeverity && matchesDate;
    });
  };

  const getFilteredChatHistory = () => {
    return chatHistory.filter(chat => {
      const matchesCategory = categoryFilter === 'all' || chat.category === categoryFilter;
      const matchesDate = filterByDate(chat.createdAt);
      return matchesCategory && matchesDate;
    });
  };

  const filterByDate = (timestamp: any) => {
    if (dateFilter === 'all') return true;
    
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    switch (dateFilter) {
      case 'today': return daysDiff === 0;
      case 'week': return daysDiff <= 7;
      case 'month': return daysDiff <= 30;
      default: return true;
    }
  };

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My History</h1>
          <p className="text-gray-600">View all your pest reports, questions, and activities</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('pests')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pests'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🐛 Pest Reports
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {pestReports.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💬 Questions
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {chatHistory.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Activity Log
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-2 rounded-full text-xs">
                  {activities.length}
                </span>
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>

              {activeTab === 'pests' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              )}

              {activeTab === 'chat' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="pest">Pest</option>
                    <option value="crop">Crop</option>
                    <option value="weather">Weather</option>
                    <option value="disease">Disease</option>
                    <option value="general">General</option>
                  </select>
                </div>
              )}

              <button
                onClick={loadHistory}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Pest Reports Tab */}
          {activeTab === 'pests' && (
            <>
              {getFilteredPestReports().length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 text-5xl mb-4">🐛</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pest Reports Yet</h3>
                  <p className="text-gray-500">Start by detecting pests with your camera!</p>
                </div>
              ) : (
                getFilteredPestReports().map((report) => (
                  <div key={report.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {report.pestName || 'Unknown Pest'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                            {report.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-1">
                          <span className="font-medium">Crop:</span> {report.cropAffected}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(report.reportedAt)} • {report.detectionMethod || 'manual'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        report.status === 'identified' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{report.description}</p>
                    
                    {report.symptoms.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Symptoms:</p>
                        <div className="flex flex-wrap gap-2">
                          {report.symptoms.map((symptom, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {report.imageUrls.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        {report.imageUrls.map((url, idx) => (
                          <img
                            key={idx}
                            src={url}
                            alt={`Pest ${idx + 1}`}
                            className="w-full h-24 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center text-sm text-gray-500">
                      <span>📍 {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)}</span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {/* Chat History Tab */}
          {activeTab === 'chat' && (
            <>
              {getFilteredChatHistory().length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 text-5xl mb-4">💬</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Yet</h3>
                  <p className="text-gray-500">Start asking questions to our AI assistant!</p>
                </div>
              ) : (
                getFilteredChatHistory().map((chat) => (
                  <div key={chat.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        Q
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-2">{chat.question}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {chat.category}
                          </span>
                          <span>{formatDate(chat.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 mt-4 pl-14">
                      <div className="flex-1 bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{chat.answer}</p>
                      </div>
                    </div>

                    {chat.helpful !== undefined && (
                      <div className="mt-3 pl-14 text-sm">
                        <span className={`${chat.helpful ? 'text-green-600' : 'text-red-600'}`}>
                          {chat.helpful ? '👍 Helpful' : '👎 Not helpful'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <>
              {activities.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <div className="text-gray-400 text-5xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
                  <p className="text-gray-500">Your activity will appear here as you use the app</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {activity.action === 'pest_detection' && '🐛'}
                            {activity.action === 'question_asked' && '💬'}
                            {activity.action === 'crop_viewed' && '🌾'}
                            {activity.action === 'farm_created' && '🏡'}
                            {activity.action === 'chat_interaction' && '💭'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {activity.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </p>
                            {activity.details && Object.keys(activity.details).length > 0 && (
                              <p className="text-sm text-gray-500">
                                {JSON.stringify(activity.details, null, 2).slice(0, 100)}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
