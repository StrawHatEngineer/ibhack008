import { useState, memo } from "react";
import { RefreshCw, Sparkles, X } from "lucide-react";
import { useActivity } from "../../contexts/ActivityContext";
import Tooltip from "../Tooltip";

const CustomWidget = memo(function CustomWidget({ 
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

  const handleItemClick = (link) => {
    if (link && link.startsWith('http')) {
      window.open(link, '_blank');
    }
  };

  const markAsCompleted = (index) => {
    console.log(`Item ${index} marked as completed`);
    markItemCompleted('custom', workflowId, index);
  };

  const isCompleted = (index) => {
    return isItemCompleted('custom', workflowId, index);
  };

  const renderCustomContent = () => {
    if (loading) return "Loading...";
    
    if (Array.isArray(content) && content.length > 0) {
      return (
        <ul className="space-y-2 mr-4 ms-4">
          {content.map((item, index) => {   
            const itemIsCompleted = isCompleted(index);
            if (typeof item === 'object' && item !== null) {
              const title = item['title'] || item.name || item.subject || item.task || 'No Title';
              const summary = item['summary'] || item.summary || item.content || '';
              const link = item['link'] || item.url || item.href || '';

              return (
                <li key={index} className="flex justify-between items-center">
                  <Tooltip 
                    content={title}
                    summary={summary}
                    className="flex-1 overflow-hidden"
                  >
                    <button
                      onClick={() => handleItemClick(link)}
                      className={`text-left w-full p-3 text-sm border overflow-hidden rounded-lg transition-all duration-200 ${
                        itemIsCompleted 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                          : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start">
                        <Sparkles className="mr-2 mt-0.5 w-4 h-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{title}</div>
                          {summary && (
                            <div className="text-xs text-gray-500 truncate mt-1">{summary}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  </Tooltip>
                  <button
                    onClick={() => markAsCompleted(index)}
                    className="ml-2 text-sm text-green-600 hover:text-green-800 flex-shrink-0"
                  >
                    <i className={`fa ${itemIsCompleted ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${itemIsCompleted ? '' : 'w-6 h-6'}`}></i>
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
                      onClick={() => handleItemClick('')}
                      className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                        itemIsCompleted 
                          ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                          : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <Sparkles className="mr-2 w-4 h-4" />
                        {String(item)}
                      </div>
                    </button>
                  </Tooltip>
                  <button
                    onClick={() => markAsCompleted(index)}
                    className="ml-2 text-sm text-green-600 hover:text-green-800"
                  >
                    <i className={`fa ${itemIsCompleted ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${itemIsCompleted ? '' : 'w-6 h-6'}`}></i>
                  </button>
                </li>
              );
            }
          })}
        </ul>
      );
    } else if (typeof content === 'object' && content !== null && Object.keys(content).length > 0) {
      const title = content['title'] || content.name || content.subject || 'No Title';
      const summary = content['summary'] || content.summary || content.content || '';
      const link = content['link'] || content.url || content.href || '';
      return (
        <div className="flex justify-between items-center">
          <Tooltip 
            content={title}
            summary={summary}
            className="flex-1 overflow-hidden"
          >
            <button
              onClick={() => handleItemClick(link)}
              className="text-left w-full p-3 text-sm bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center">
                <Sparkles className="mr-2 w-4 h-4" />
                {title}
              </div>
              {summary && (
                <div className="text-xs text-gray-500 mt-1">{summary}</div>
              )}
            </button>
          </Tooltip>
          <button
            onClick={() => markAsCompleted(0)}
            className="ml-2 text-sm text-green-600 hover:text-green-800"
          >
            <i className={`fa ${isCompleted(0) ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${isCompleted(0) ? '' : 'w-6 h-6'}`}></i>
          </button>
        </div>
      );
    } else if (typeof content === 'string' && content.trim() !== '') {
      return (
        <ul className="space-y-2">
          {content.split('\n').filter(line => line.trim()).map((item, index) => {
            const itemIsCompleted = isCompleted(index);
            return (
              <li key={index} className="flex justify-between items-center">
                <Tooltip 
                  content={item}
                  className="flex-1 overflow-hidden"
                >
                  <button
                    onClick={() => handleItemClick('')}
                    className={`text-left w-full p-3 text-sm border rounded-lg transition-all duration-200 ${
                      itemIsCompleted 
                        ? 'bg-gray-50 border-gray-200 text-gray-500 line-through' 
                        : 'bg-white border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <Sparkles className="mr-2 w-4 h-4" />
                      {item}
                    </div>
                  </button>
                </Tooltip>
                <button
                  onClick={() => markAsCompleted(index)}
                  className="ml-2 text-sm text-green-600 hover:text-green-800"
                >
                  <i className={`fa ${itemIsCompleted ? 'fa-check' : ''} font-bold border-2 border-green-600 p-1 rounded ${itemIsCompleted ? '' : 'w-6 h-6'}`}></i>
                </button>
              </li>
            );
          })}
        </ul>
      );
    } else {
      return (
        <div className="text-center text-gray-500 py-8">
          <Sparkles className="mx-auto w-12 h-12 text-gray-300 mb-3" />
          <p>No content to display</p>
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
    <div className="rounded-2xl bg-purple-50 shadow-lg p-6 w-98 h-96 flex flex-col border-2 border-purple-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-purple-800 flex items-center">
          <Sparkles className="mr-2 w-5 h-5" />
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
        {loading || isRunning ? "Loading..." : renderCustomContent()}
      </div>
    </div>
  );
});

export default CustomWidget;
