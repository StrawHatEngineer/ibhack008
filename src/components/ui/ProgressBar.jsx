const ProgressBar = ({ 
  percentage, 
  color = "bg-blue-500", 
  label, 
  showPercentage = true 
}) => (
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

export default ProgressBar;
