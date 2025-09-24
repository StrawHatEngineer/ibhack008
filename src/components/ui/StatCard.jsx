import { TrendingUp } from "lucide-react";

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color = "bg-blue-500", 
  trend = null 
}) => (
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

export default StatCard;
