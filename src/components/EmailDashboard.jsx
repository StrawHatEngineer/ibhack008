import { useState, useEffect, useRef, memo } from "react";
import { PlusCircle, RefreshCw, Mail, Settings, X } from "lucide-react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, updateWorkflowLastRun, saveWorkflow } from "../utils/workflowStorage";
import { useActivity } from "../contexts/ActivityContext";
import Tooltip from "./Tooltip";

const EmailWidget = memo(function EmailWidget({ title, content, loading, onContentUpdate, workflowId, onRunWorkflow, onDeleteWidget, widgetId }) {
  const { markItemCompleted, isItemCompleted } = useActivity();
  const [isRunning, setIsRunning] = useState(false);

  const handleEmailClick = (link) => {
    window.open(`${link}`, '_blank');
  };

  const markAsRead = (index) => {
    console.log(`Email ${index} marked as read`);
    // Mark item as completed in activity tracker
    markItemCompleted('email', workflowId, index);
  };

  const isRead = (index) => {
    return isItemCompleted('email', workflowId, index);
  };

  const renderEmailContent = () => {
    if (loading) return "Loading emails...";
    
    if (Array.isArray(content) && content.length > 0) {
      return (
        <ul className="space-y-2 mr-4 ms-4">
          {content.map((item, index) => {   
            const itemIsRead = isRead(index);
            if (typeof item === 'object' && item !== null) {
              const emailSubject = item['subject'] || item.subject || item.Subject || 'No Subject';
              const sender = item['sender'] || item.from || item.From || 'Unknown Sender';
              const link = item['link'] || item.link || item.Link || '';
              const summary = item['summary'] || item.summary || item.Summary || '';

              return (
                <li key={index} className="flex justify-between items-center">
                  <Tooltip 
                    content={emailSubject}
                    summary={summary}
                    className="flex-1 overflow-hidden"
                  >
                    <button
                      onClick={() => handleEmailClick(link)}
                      className={`text-left w-full p-3 text-sm border overflow-hidden rounded-lg transition-all duration-200 ${
                        itemIsRead 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                          : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <Mail className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{emailSubject}</div>
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
                      onClick={() => handleEmailClick('')}
                      className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                        itemIsRead 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                          : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Mail className="mr-2 w-4 h-4" />
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
      const emailSubject = content['email_subject'] || content.subject || content.Subject || 'No Subject';
      const sender = content['sender'] || content.from || content.From || 'Unknown Sender';
      const link = content['link'] || content.link || content.Link || '';
      return (
        <div className="flex justify-between items-center">
          <Tooltip 
            content={emailSubject}
            summary={summary}
            className="flex-1 overflow-hidden"
          >
            <button
              onClick={() => handleEmailClick(link)}
              className="text-left w-full p-3 text-sm bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center">
                <Mail className="mr-2 w-4 h-4" />
                {emailSubject}
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
                    onClick={() => handleEmailClick('')}
                    className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                      itemIsRead 
                        ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                        : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Mail className="mr-2 w-4 h-4" />
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
          <Mail className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <p>No emails to display</p>
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
    <div className="rounded-2xl bg-blue-50 shadow-lg p-6 w-98 h-96 flex flex-col border-2 border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-blue-800 flex items-center">
          <Mail className="mr-2 w-5 h-5" />
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
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <RefreshCw className={`mr-1 w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
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
        {loading || isRunning ? "Loading emails..." : renderEmailContent()}
      </div>
    </div>
  );
});

const EmailDashboard = memo(function EmailDashboard({ 
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
  const emailWidgets = widgets.filter(widget => {
    // If widget has a dashboardId, check if it matches this dashboard
    if (widget.dashboardId) {
      return widget.dashboardId === dashboardId;
    }
    // Fallback to title-based filtering for widgets without dashboardId
    return widget.title.toLowerCase().includes('email') || 
           widget.title.toLowerCase().includes('mail');
  });


  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center">
            <Mail className="mr-3 w-7 h-7" />
            Email Management
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
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
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

      {emailWidgets.length === 0 ? (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center">
          <Mail className="mx-auto w-16 h-16 text-blue-300 mb-4" />
          <h3 className="text-xl font-semibold text-blue-800 mb-2">No Email Widgets Yet</h3>
          <p className="text-blue-600 mb-4">Create your first email workflow to start managing your inbox efficiently.</p>
          <button
            onClick={onShowModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailWidgets.map((widget, index) => (
            <EmailWidget 
              key={`email-${widget.id}-${index}`} 
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

export default EmailDashboard;
