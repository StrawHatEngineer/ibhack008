import React from 'react';

const AddNewDashboard = ({ dashboardTypes, onAddDashboard }) => {
  return (
    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Dashboard</h3>
        <p className="text-gray-500">Choose a dashboard type to get started</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(dashboardTypes).map((dashboardType) => {
          const IconComponent = dashboardType.icon;
          const isCustom = dashboardType.id === 'custom';
          
          return (
            <button
              key={dashboardType.id}
              onClick={() => onAddDashboard(dashboardType.id)}
              className={`group relative bg-white p-6 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left ${isCustom ? 'ring-2 ring-purple-200 hover:ring-purple-300' : ''}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 text-white p-2 rounded-lg group-hover:scale-110 transition-transform duration-200 ${dashboardType.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium group-hover:transition-colors ${isCustom ? 'text-purple-700 group-hover:text-purple-800' : 'text-gray-900 group-hover:text-indigo-600'}`}>
                    {dashboardType.name}
                    {isCustom && <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">NEW</span>}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {dashboardType.description}
                  </p>
                </div>
              </div>
              <div className={`absolute inset-0 rounded-lg border-2 border-transparent transition-colors duration-200 ${isCustom ? 'group-hover:border-purple-200' : 'group-hover:border-indigo-200'}`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AddNewDashboard;
