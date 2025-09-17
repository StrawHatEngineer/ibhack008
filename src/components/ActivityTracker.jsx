import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, CheckCircle2, Clock, Mail, MessageSquare, Github, Sparkles, Calendar, Target } from "lucide-react";
import { useActivity } from "../contexts/ActivityContext";
import { clearExpiredResults } from "../utils/workflowStorage";

const ActivityTracker = () => {
  const { activityStats, resetCompletedItems } = useActivity();
  const [timeRange, setTimeRange] = useState('today'); // today, week, month

  // Clean up expired cache when component loads
  useEffect(() => {
    clearExpiredResults();
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "bg-blue-500", trend = null }) => (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center mt-2 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'transform rotate-180' : ''}`} />
              <span>{Math.abs(trend)}% from last week</span>
            </div>
          )}
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ percentage, color = "bg-blue-500", label, showPercentage = true }) => (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{label}</span>
          {showPercentage && <span className="text-gray-900 font-medium">{percentage}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`${color} h-3 rounded-full transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );

  const TaskTypeCard = ({ icon: Icon, title, count, color, percentage }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center space-x-3 mb-3">
        <div className={`${color} text-white p-2 rounded-lg`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{count} tasks</p>
        </div>
      </div>
      <ProgressBar percentage={percentage} color={color} showPercentage={false} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Tracker</h1>
              <p className="text-gray-600">Monitor your productivity and progress across all dashboards</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-4 py-2 rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">{activityStats.completionRate}% Complete</span>
              </div>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Target}
            title="Total Tasks"
            value={activityStats.totalTasks}
            subtitle="Across all dashboards"
            color="bg-blue-500"
            trend={12}
          />
          <StatCard
            icon={CheckCircle2}
            title="Completed"
            value={activityStats.completedTasks}
            subtitle={`${activityStats.todayCompleted} completed today`}
            color="bg-green-500"
            trend={8}
          />
          <StatCard
            icon={Calendar}
            title="This Week"
            value={activityStats.thisWeekCompleted}
            subtitle="Tasks completed"
            color="bg-purple-500"
            trend={15}
          />
          <StatCard
            icon={BarChart3}
            title="Dashboards"
            value={activityStats.totalDashboards}
            subtitle="Active dashboards"
            color="bg-indigo-500"
            trend={0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Progress Overview</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-4">Overall Completion</h3>
                <ProgressBar 
                  percentage={activityStats.completionRate} 
                  color="bg-gradient-to-r from-green-500 to-blue-500"
                  label="All Tasks"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ProgressBar 
                  percentage={activityStats.emailTasks > 0 ? Math.round((activityStats.emailTasks / activityStats.totalTasks) * 100) : 0}
                  color="bg-blue-500"
                  label="Email Tasks"
                />
                <ProgressBar 
                  percentage={activityStats.slackTasks > 0 ? Math.round((activityStats.slackTasks / activityStats.totalTasks) * 100) : 0}
                  color="bg-green-500"
                  label="Slack Messages"
                />
                <ProgressBar 
                  percentage={activityStats.githubTasks > 0 ? Math.round((activityStats.githubTasks / activityStats.totalTasks) * 100) : 0}
                  color="bg-purple-500"
                  label="GitHub Issues"
                />
                <ProgressBar 
                  percentage={activityStats.customTasks > 0 ? Math.round((activityStats.customTasks / activityStats.totalTasks) * 100) : 0}
                  color="bg-indigo-500"
                  label="Custom Tasks"
                />
              </div>
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Task Breakdown</h2>
            
            <div className="space-y-4">
              <TaskTypeCard
                icon={Mail}
                title="Email Tasks"
                count={activityStats.emailTasks}
                color="bg-blue-500"
                percentage={activityStats.emailTasks > 0 ? Math.round((activityStats.emailTasks / activityStats.totalTasks) * 100) : 0}
              />
              <TaskTypeCard
                icon={MessageSquare}
                title="Slack Messages"
                count={activityStats.slackTasks}
                color="bg-green-500"
                percentage={activityStats.slackTasks > 0 ? Math.round((activityStats.slackTasks / activityStats.totalTasks) * 100) : 0}
              />
              <TaskTypeCard
                icon={Github}
                title="GitHub Issues"
                count={activityStats.githubTasks}
                color="bg-purple-500"
                percentage={activityStats.githubTasks > 0 ? Math.round((activityStats.githubTasks / activityStats.totalTasks) * 100) : 0}
              />
              <TaskTypeCard
                icon={Sparkles}
                title="Custom Tasks"
                count={activityStats.customTasks}
                color="bg-indigo-500"
                percentage={activityStats.customTasks > 0 ? Math.round((activityStats.customTasks / activityStats.totalTasks) * 100) : 0}
              />
            </div>

            {/* Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{activityStats.completionRate}%</div>
                <div className="text-sm text-gray-500">Overall Progress</div>
                <div className="text-xs text-gray-400 mt-1">
                  {activityStats.completedTasks} of {activityStats.totalTasks} tasks completed
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Refresh Data
            </button>
            <button 
              onClick={resetCompletedItems}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Reset Progress
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export Report
            </button>
            <button className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
