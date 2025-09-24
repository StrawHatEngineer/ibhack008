import { useState, memo } from "react";
import { RefreshCw, Github, GitPullRequest, GitCommit, Star, Bug, X } from "lucide-react";
import { useActivity } from "../../contexts/ActivityContext";
import Tooltip from "../Tooltip";

const GitHubWidget = memo(function GitHubWidget({ 
  title, 
  content, 
  loading, 
  onContentUpdate, 
  workflowId, 
  onRunWorkflow, 
  onDeleteWidget, 
  widgetId 
}) {
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
              const summary = item['summary'] || item.summary || item.Summary || '';

              return (
                <li key={index} className="flex justify-between items-center">
                  <Tooltip 
                    content={subject}
                    summary={summary}
                    className="flex-1 overflow-hidden"
                  >
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
      const title = content['title'] || content.Title || content.subject || 'No Title';
      const repository = content['repository'] || content.repo || content.Repository || 'Unknown Repo';
      const author = content['author'] || content.user || content.Author || 'Unknown Author';
      const type = content['type'] || content.Type || 'Activity';
      const link = content['link'] || content.url || content.Link || '';
      return (
        <div className="flex justify-between items-center">
          <Tooltip 
            content={title}
            summary={`${repository} • ${type} • ${author}`}
            className="flex-1 overflow-hidden"
          >
            <button
              onClick={() => handleGitHubClick(link)}
              className="text-left w-full p-3 text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center">
                {getItemIcon(content)}
                {title}
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
                  className="flex-1"
                >
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
        <div className="flex items-center gap-2">
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
        {loading || isRunning ? "Loading GitHub activities..." : renderGitHubContent()}
      </div>
    </div>
  );
});

export default GitHubWidget;
