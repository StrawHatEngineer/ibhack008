import { useState, useEffect, useRef, memo } from "react";
import { PlusCircle, RefreshCw, MessageSquare, Hash, User, Settings, X } from "lucide-react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, updateWorkflowLastRun, saveWorkflow } from "../utils/workflowStorage";
import { useActivity } from "../contexts/ActivityContext";
import Tooltip from "./Tooltip";

const SlackWidget = memo(function SlackWidget({ title, content, loading, onContentUpdate, workflowId, onRunWorkflow, onDeleteWidget, widgetId }) {
  const { markItemCompleted, isItemCompleted } = useActivity();
  const [isRunning, setIsRunning] = useState(false);

  const handleSlackClick = (link) => {
    window.open(`${link}`, '_blank');
  };

  const markAsRead = (index) => {
    console.log(`Slack message ${index} marked as read`);
    // Mark item as completed in activity tracker
    markItemCompleted('slack', workflowId, index);
  };

  const isRead = (index) => {
    return isItemCompleted('slack', workflowId, index);
  };

  const renderSlackContent = () => {
    if (loading) return "Loading Slack messages...";
    
    if (Array.isArray(content) && content.length > 0) {
      return (
        <ul className="space-y-3 mr-4">
          {content.map((item, index) => {   
            const itemIsRead = isRead(index);
            if (typeof item === 'object' && item !== null) {
              const message = item['subject'] || item.text || item.Message || 'No Message';
              const channel = item['channel'] || item.Channel || 'general';
              const user = item['user'] || item.sender || item.User || 'Unknown User';
              const link = item['link'] || item.link || item.Link || '';
              const summary = item['summary'] || item.summary || item.Summary || '';

              return (
                <li key={index} className="flex justify-between items-center">
                  <Tooltip 
                    content={message}
                    summary={summary}
                    className="flex-1 overflow-hidden"
                  >
                    <button
                      onClick={() => handleSlackClick(link)}
                      className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 overflow-hidden ${
                        itemIsRead 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                          : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <MessageSquare className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{message}</div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center">
                            {/* <Hash className="w-3 h-3 mr-1" />
                            {channel}
                            <span className="mx-2">•</span>
                            <User className="w-3 h-3 mr-1" />
                            {user} */}
                          </div>
                        </div>
                      </div>
                    </button>
                  </Tooltip>
                  <button
                    onClick={() => markAsRead(index)}
                    className="ml-2 text-sm text-green-600 hover:text-green-800 flex-shrink-0"
                  >
                    <i className={`fa ${itemIsRead ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${itemIsRead ? '' : 'w-6 h-6'}`}></i>
                  </button>
                </li>
              );
            } else {
              return (
                <li key={index} className="flex justify-between items-center">
                  <Tooltip 
                    content={String(item)}
                    className="flex-1 overflow-hidden"
                  >
                    <button
                      onClick={() => handleSlackClick('')}
                      className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                        itemIsRead 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                          : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 w-4 h-4" />
                        {String(item)}
                      </div>
                    </button>
                  </Tooltip>
                  <button
                    onClick={() => markAsRead(index)}
                    className="ml-2 text-sm text-green-600 hover:text-green-800"
                  >
                    <i className={`fa ${itemIsRead ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${itemIsRead ? '' : 'w-6 h-6'}`}></i>
                  </button>
                </li>
              );
            }
          })}
        </ul>
      );
    } else if (typeof content === 'object' && content !== null && Object.keys(content).length > 0) {
      const message = content['message'] || content.text || content.Message || 'No Message';
      const link = content['link'] || content.link || content.Link || '';
      return (
        <div className="flex justify-between items-center">
          <Tooltip 
            content={message}
            className="flex-1 overflow-hidden"
          >
            <button
              onClick={() => handleSlackClick(link)}
              className="text-left w-full p-3 text-sm bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center">
                <MessageSquare className="mr-2 w-4 h-4" />
                {message}
              </div>
            </button>
          </Tooltip>
          <button
            onClick={() => markAsRead(0)}
            className="ml-2 text-sm text-green-600 hover:text-green-800"
          >
            <i className={`fa ${isRead(0) ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${isRead(0) ? '' : 'w-6 h-6'}`}></i>
          </button>
        </div>
      );
    } else if (typeof content === 'string' && content.trim() !== '') {
      return (
        <ul className="space-y-2">
          {content.split('\n').map((item, index) => {
            const itemIsRead = isRead(index);
            return (
              <li key={index} className="flex justify-between items-center">
                <Tooltip 
                  content={item}
                  className="flex-1 overflow-hidden"
                >
                  <button
                    onClick={() => handleSlackClick('')}
                    className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                      itemIsRead 
                        ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                        : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <MessageSquare className="mr-2 w-4 h-4" />
                      {item}
                    </div>
                  </button>
                </Tooltip>
                <button
                  onClick={() => markAsRead(index)}
                  className="ml-2 text-sm text-green-600 hover:text-green-800"
                >
                  <i className={`fa ${itemIsRead ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${itemIsRead ? '' : 'w-6 h-6'}`}></i>
                </button>
              </li>
            );
          })}
        </ul>
      );
    } else {
      return (
        <div className="text-center text-gray-500 py-8">
          <MessageSquare className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <p>No Slack messages to display</p>
        </div>
      );
    }
  };

  const handleRunWorkflow = async () => {
    if (!workflowId || !onRunWorkflow) return;
    
    setIsRunning(true);
    try {
      await onRunWorkflow(workflowId);
    } catch (error) {
      console.error('Error running workflow:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="rounded-2xl bg-purple-50 shadow-lg p-6 w-full h-96 flex flex-col border-2 border-purple-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-800 flex items-center">
          <MessageSquare className="mr-2 w-5 h-5" />
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {workflowId && (
            <button
              onClick={handleRunWorkflow}
              disabled={isRunning || loading}
              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                isRunning || loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            </button>
          )}
          {onDeleteWidget && (
            <button
              onClick={() => onDeleteWidget(widgetId)}
              className="flex items-center px-2 py-2 rounded-md text-sm bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Delete Widget"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto text-sm text-gray-700">
        {loading || isRunning ? "Loading Slack messages..." : renderSlackContent()}
      </div>
    </div>
  );
});

const SlackDashboard = memo(function SlackDashboard({ 
  widgets, 
  onUpdateWidget, 
  onDeleteWidget,
  onRunWorkflow, 
  onShowModal,
  onShowConnectionsModal,
  workflowStatus,
  statusMessage,
  dashboardId,
  connectedTools,
  onRemoveDashboard,
  canRemove 
}) {
  // Filter widgets that belong to this dashboard
  // First check for dashboardId match, fallback to title-based filtering for backwards compatibility
  const slackWidgets = widgets.filter(widget => {
    // If widget has a dashboardId, check if it matches this dashboard
    if (widget.dashboardId) {
      return widget.dashboardId === dashboardId;
    }
    // Fallback to title-based filtering for widgets without dashboardId
    return widget.title.toLowerCase().includes('slack') || 
           widget.title.toLowerCase().includes('message') ||
           widget.title.toLowerCase().includes('chat');
  });

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-purple-800 flex items-center">
            <MessageSquare className="mr-3 w-7 h-7" />
            Slack Management
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onShowConnectionsModal}
            className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg shadow hover:bg-gray-200 transition-colors"
            title="Manage connections"
          >
            <Settings className="mr-2" size={18} />
            <span className="hidden sm:inline">Connections</span>
          </button>
          <button
            onClick={onShowModal}
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700 transition-colors"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Widget
          </button>
          {canRemove && (
            <button
              onClick={onRemoveDashboard}
              className="flex items-center bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition-colors"
              title="Close Dashboard"
            >
              <X className="mr-1" size={16} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </div>
      </div>

      {slackWidgets.length === 0 ? (
        <div className="bg-purple-50 border-2 border-dashed border-purple-200 rounded-2xl p-12 text-center">
          <MessageSquare className="mx-auto w-16 h-16 text-purple-300 mb-4" />
          <h3 className="text-xl font-semibold text-purple-800 mb-2">No Slack Widgets Yet</h3>
          <p className="text-purple-600 mb-4">Create your first Slack workflow to start managing your team communications.</p>
          <button
            onClick={onShowModal}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Create Widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slackWidgets.map((widget, index) => (
            <SlackWidget 
              key={`slack-${widget.id}-${index}`} 
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
});


export default SlackDashboard;
