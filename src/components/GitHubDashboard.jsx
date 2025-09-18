import { useState, useEffect, useRef, memo } from "react";
import { PlusCircle, RefreshCw, Github, GitPullRequest, GitCommit, Star, Bug, Settings, X } from "lucide-react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, updateWorkflowLastRun, saveWorkflow } from "../utils/workflowStorage";
import { useActivity } from "../contexts/ActivityContext";

const GitHubWidget = memo(function GitHubWidget({ title, content, loading, onContentUpdate, workflowId, onRunWorkflow }) {
  const { markItemCompleted, isItemCompleted } = useActivity();
  const [isRunning, setIsRunning] = useState(false);

  const handleGitHubClick = (link) => {
    window.open(`${link}`, '_blank');
  };

  const markAsRead = (index) => {
    console.log(`GitHub item ${index} marked as read`);
    // Mark item as completed in activity tracker
    markItemCompleted('github', workflowId, index);
  };

  const isRead = (index) => {
    return isItemCompleted('github', workflowId, index);
  };

  const getItemIcon = (item) => {
    if (typeof item === 'object' && item !== null) {
      const type = item.type || item.Type || '';
      const title = item.title || item.Title || '';
      
      if (type.toLowerCase().includes('pull') || title.toLowerCase().includes('pull')) {
        return <GitPullRequest className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />;
      } else if (type.toLowerCase().includes('commit') || title.toLowerCase().includes('commit')) {
        return <GitCommit className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />;
      } else if (type.toLowerCase().includes('issue') || title.toLowerCase().includes('issue')) {
        return <Bug className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />;
      } else if (type.toLowerCase().includes('star') || title.toLowerCase().includes('star')) {
        return <Star className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />;
      }
    }
    return <Github className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />;
  };

  const renderGitHubContent = () => {
    if (loading) return "Loading GitHub activities...";
    
    if (Array.isArray(content) && content.length > 0) {
      return (
        <ul className="space-y-3 mr-4">
          {content.map((item, index) => {   
            const itemIsRead = isRead(index);
            if (typeof item === 'object' && item !== null) {
              const subject = item['subject'] || item.Title || item.subject || 'No Title';
              const repository = item['repository'] || item.repo || item.Repository || 'Unknown Repo';
              const author = item['author'] || item.user || item.Author || 'Unknown Author';
              const type = item['type'] || item.Type || 'Activity';
              const link = item['link'] || item.url || item.Link || '';

              return (
                <li key={index} className="flex justify-between items-center">
                  <button
                    onClick={() => handleGitHubClick(link)}
                    className={`text-left w-full p-3 text-sm border overflow-hidden rounded-lg transition-all duration-200 ${
                      itemIsRead 
                        ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start">
                      {getItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{subject}</div>
                        {/* <div className="text-xs text-gray-500 mt-1 flex items-center">
                          <Github className="w-3 h-3 mr-1" />
                          {repository}
                          <span className="mx-2">•</span>
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{type}</span>
                          <span className="mx-2">•</span>
                          {author}
                        </div> */}
                      </div>
                    </div>
                  </button>
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
                  <button
                    onClick={() => handleGitHubClick('')}
                    className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                      itemIsRead 
                        ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center">
                      <Github className="mr-2 w-4 h-4" />
                      {String(item)}
                    </div>
                  </button>
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
      const title = content['title'] || content.Title || content.subject || 'No Title';
      const link = content['link'] || content.url || content.Link || '';
      return (
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleGitHubClick(link)}
            className="text-left w-full p-3 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200"
          >
            <div className="flex items-center">
              {getItemIcon(content)}
              {title}
            </div>
          </button>
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
                <button
                  onClick={() => handleGitHubClick('')}
                  className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                    isRead 
                      ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  <div className="flex items-center">
                    <Github className="mr-2 w-4 h-4" />
                    {item}
                  </div>
                </button>
                <button
                  onClick={() => markAsRead(index)}
                  className="ml-2 text-sm text-green-600 hover:text-green-800"
                >
                  <i className={`fa ${isRead ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${isRead ? '' : 'w-6 h-6'}`}></i>
                </button>
              </li>
            );
          })}
        </ul>
      );
    } else {
      return (
        <div className="text-center text-gray-500 py-8">
          <Github className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <p>No GitHub activities to display</p>
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
    <div className="rounded-2xl bg-gray-50 shadow-lg p-6 w-full h-96 flex flex-col border-2 border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Github className="mr-2 w-5 h-5" />
          {title}
        </h2>
        {workflowId && (
          <button
            onClick={handleRunWorkflow}
            disabled={isRunning || loading}
            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
              isRunning || loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-900'
            }`}
          >
            <RefreshCw className={`mr-1 w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto text-sm text-gray-700">
        {loading || isRunning ? "Loading GitHub activities..." : renderGitHubContent()}
      </div>
    </div>
  );
});

const GitHubDashboard = memo(function GitHubDashboard({ 
  widgets, 
  onUpdateWidget, 
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
  const githubWidgets = widgets.filter(widget => {
    // If widget has a dashboardId, check if it matches this dashboard
    if (widget.dashboardId) {
      return widget.dashboardId === dashboardId;
    }
    // Fallback to title-based filtering for widgets without dashboardId
    return widget.title.toLowerCase().includes('github') || 
           widget.title.toLowerCase().includes('git') ||
           widget.title.toLowerCase().includes('pull') ||
           widget.title.toLowerCase().includes('commit') ||
           widget.title.toLowerCase().includes('issue') ||
           widget.title.toLowerCase().includes('repo');
  });

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Github className="mr-3 w-7 h-7" />
            GitHub Management
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
            className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-900 transition-colors"
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

      {githubWidgets.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
          <Github className="mx-auto w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No GitHub Widgets Yet</h3>
          <p className="text-gray-600 mb-4">Create your first GitHub workflow to start tracking your repositories and development activities.</p>
          <button
            onClick={onShowModal}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Create Widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {githubWidgets.map((widget, index) => (
            <GitHubWidget 
              key={`github-${widget.id}-${index}`} 
              title={widget.title} 
              content={widget.content} 
              loading={widget.loading} 
              workflowId={widget.workflowId}
              onContentUpdate={(newContent) => onUpdateWidget(widget.id, newContent)}
              onRunWorkflow={onRunWorkflow}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default GitHubDashboard;
