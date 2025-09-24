import { useState } from "react";
import { Plus, Settings, Sparkles, X } from "lucide-react";
import CustomWidget from "../widgets/CustomWidget";

const CustomDashboard = ({ 
  dashboardId, 
  dashboardTitle, 
  onShowModal, 
  onShowConnectionsModal, 
  widgets, 
  onUpdateWidget, 
  onDeleteWidget, 
  onRunWorkflow, 
  connectedTools, 
  onRemoveDashboard, 
  canRemove, 
  onTitleChange 
}) => {
  const [customTitle, setCustomTitle] = useState(dashboardTitle || 'Custom Dashboard');
  const [isEditing, setIsEditing] = useState(false);

  const customWidgets = widgets.filter(widget => widget.dashboardId === dashboardId);

  const handleTitleChange = (newTitle) => {
    setCustomTitle(newTitle);
    if (onTitleChange) {
      onTitleChange(dashboardId, newTitle);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-2 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            {isEditing ? (
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                onBlur={() => {
                  setIsEditing(false);
                  handleTitleChange(customTitle);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
                    handleTitleChange(customTitle);
                  }
                }}
                className="text-xl font-semibold text-gray-800 bg-transparent border-b-2 border-indigo-300 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            ) : (
              <h2 
                className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => setIsEditing(true)}
              >
                {customTitle}
              </h2>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Edit title"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onShowConnectionsModal}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            title="Manage connections"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Connections</span>
          </button>
          <button
            onClick={onShowModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Widget</span>
          </button>
          {canRemove && (
            <button
              onClick={onRemoveDashboard}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              title="Close Dashboard"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          )}
        </div>
      </div>

      {customWidgets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
            <Sparkles className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your Custom Dashboard</h3>
          <p className="text-gray-500 mb-4">Start building your personalized workflow by adding widgets</p>
          <button
            onClick={onShowModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg inline-flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Widget</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customWidgets.map((widget) => (
            <CustomWidget 
              key={`custom-${widget.id}`} 
              title={widget.title} 
              content={widget.content} 
              loading={widget.loading} 
              workflowId={widget.workflowId}
              widgetId={widget.id}
              onContentUpdate={(newContent) => onUpdateWidget(widget.id, newContent)}
              onDeleteWidget={onDeleteWidget}
              onRunWorkflow={onRunWorkflow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDashboard;
