import ProgressBar from './ProgressBar';

const TaskTypeCard = ({ 
  icon: Icon, 
  title, 
  count, 
  color, 
  percentage 
}) => (
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

export default TaskTypeCard;
