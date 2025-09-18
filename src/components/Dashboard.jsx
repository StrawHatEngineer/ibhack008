import { useState, useEffect, useRef, memo } from "react";
import { PlusCircle, RefreshCw, Mail, MessageSquare, Github, Plus, Settings, Sparkles, X } from "lucide-react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, updateWorkflowLastRun, saveWorkflow, getCachedWorkflowResult, saveWorkflowResult, hasValidCache, clearExpiredResults, deleteWorkflow } from "../utils/workflowStorage";
import EmailDashboard from "./EmailDashboard";
import SlackDashboard from "./SlackDashboard";
import GitHubDashboard from "./GitHubDashboard";
import ConnectionsModal from "./ConnectionsModal";
import { useActivity } from "../contexts/ActivityContext";
import { getConnectedTools } from "../utils/connectionsStorage";
import { getSavedDashboards, addCustomDashboard, updateDashboardTitle, removeDashboard as removeDashboardFromStorage, canRemoveDashboard } from "../utils/dashboardStorage";
import Tooltip from "./Tooltip";

// Custom Widget Component
const CustomWidget = memo(function CustomWidget({ title, content, loading, onContentUpdate, workflowId, onRunWorkflow, onDeleteWidget, widgetId }) {
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
                          {description && (
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
      const description = content['description'] || content.summary || content.content || '';
      const link = content['link'] || content.url || content.href || '';
      return (
        <div className="flex justify-between items-center">
          <Tooltip 
            content={title}
            summary={description}
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
              {description && (
                <div className="text-xs text-gray-500 mt-1">{description}</div>
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

// Custom Dashboard Component
const CustomDashboard = ({ dashboardId, dashboardTitle, onShowModal, onShowConnectionsModal, widgets, onUpdateWidget, onDeleteWidget, onRunWorkflow, connectedTools, onRemoveDashboard, canRemove, onTitleChange }) => {
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

// Available dashboard types configuration
const DASHBOARD_TYPES = {
  email: {
    id: 'email',
    name: 'Email Dashboard',
    description: 'Manage and prioritize your email communications',
    icon: Mail,
    component: EmailDashboard,
    color: 'bg-blue-500'
  },
  slack: {
    id: 'slack', 
    name: 'Slack Dashboard',
    description: 'Streamline team communications and messages',
    icon: MessageSquare,
    component: SlackDashboard,
    color: 'bg-green-500'
  },
  github: {
    id: 'github',
    name: 'GitHub Dashboard', 
    description: 'Development task automation and workflow management',
    icon: Github,
    component: GitHubDashboard,
    color: 'bg-purple-500'
  },
  custom: {
    id: 'custom',
    name: 'Custom Dashboard',
    description: 'Build your own personalized dashboard with custom widgets',
    icon: Sparkles,
    component: CustomDashboard,
    color: 'bg-gradient-to-r from-indigo-500 to-purple-600'
  }
};

function Dashboard() {
  const { updateWidgets } = useActivity();

  const [llmResponse, setLlmResponse] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState('idle'); 
  const [statusMessage, setStatusMessage] = useState('');
  const isPollingRef = useRef(false);
  
  // State for tracking which dashboard is requesting a new widget
  const [currentDashboardContext, setCurrentDashboardContext] = useState(null);
  
  // State for managing connections
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [currentConnectionsDashboard, setCurrentConnectionsDashboard] = useState(null);
  const [dashboardConnections, setDashboardConnections] = useState({});
  
  // State for managing dashboard instances
  const [activeDashboards, setActiveDashboards] = useState([]);
  
  // Default workflows that auto-load on page refresh
  const defaultWorkflows = [
    { id: '019956fa-eb1f-700b-8c47-a9ae53236c23', title: 'Important Emails', dashboardType: 'email' },
    { id: '01995738-d264-700b-8d31-e9342843f854', title: 'Follow Up Emails', dashboardType: 'email' },
    { id: '01995bcf-929f-78e3-bc98-38da52f3a11c', title: 'PRs you need to Review', dashboardType: 'github' },
    { id: '01995bd3-a553-78e3-a05e-6cf0ab94d14d', title: 'PRs you raised', dashboardType: 'github' },
    { id: '01995b71-bdbb-78e3-949d-51f2df429e8a', title: 'Follow-Up slack messages', dashboardType: 'slack' }
  ];
  
  function parseLlmResponse(llmResponse) {
    const cleanStr = llmResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanStr); 
    return parsed; 
  }

  const executeDefaultWorkflows = async () => {
    try {
      setWorkflowStatus('executing');
      setStatusMessage('Executing default workflows...');
      console.log('Executing default workflows...');
      
      // Execute all default workflows
      for (const workflow of defaultWorkflows) {
        await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflow.id}/execute`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            'ib-context': 'ibhack008',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            msg: ""
          })
        });
      }
      
      // After successful execution, update status and ensure polling is active
      setWorkflowStatus('running');
      setStatusMessage('Default workflows are running...');
      pollDefaultWorkflowsStatus();
      
    } catch (error) {
      console.error('Error executing default workflows:', error);
      setWorkflowStatus('error');
      setStatusMessage(`Error executing workflows: ${error.message}`);
    }
  };

  const fetchDefaultWorkflowsStatus = async () => {
    try {
      let allComplete = true;
      let completedWorkflows = [];
      
      for (const workflow of defaultWorkflows) {
        console.log('headers', {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'ib-context': 'ibhack008'
        });
        const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflow.id}/status`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            'ib-context': 'ibhack008'
          }
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        console.log(`Workflow ${workflow.title} status response:`, data);
        
        const status = data.status || 'unknown';
        
        if (status === 'complete') {
          const nodes = data.dag.nodes;
          const outputFormatterNode = nodes.find(node => node.tool_name === "output_formatter_tool");
          const targetNode = outputFormatterNode || nodes[nodes.length - 1];
          let llmResponse = targetNode ? targetNode.result : null;
          
          if (llmResponse) {
            llmResponse = JSON.parse(llmResponse).formatted_response;
            llmResponse = parseLlmResponse(llmResponse);
            console.log(`${workflow.title} llm response:`, llmResponse);
            
            // Save result to localStorage cache
            saveWorkflowResult(workflow.id, llmResponse);
            
            completedWorkflows.push({
              workflowId: workflow.id,
              title: workflow.title,
              content: llmResponse
            });
          }
        } else if (status === 'running') {
          allComplete = false;
        } else if (status === 'failed' || status === 'error') {
          console.error(`Workflow ${workflow.title} failed`);
        } else {
          allComplete = false;
        }
      }
      
      // Update widgets for all completed workflows
      if (completedWorkflows.length > 0) {
        setWidgets(prevWidgets => {
          let updatedWidgets = [...prevWidgets];
          
          completedWorkflows.forEach((completedWorkflow) => {
            const existingIndex = updatedWidgets.findIndex(w => w.workflowId === completedWorkflow.workflowId);
            
            if (existingIndex !== -1) {
              // Update existing widget (should always find one since we create loading widgets first)
              updatedWidgets[existingIndex] = {
                ...updatedWidgets[existingIndex],
                content: completedWorkflow.content,
                loading: false
              };
            } else {
              // Fallback: Add new widget if not found (shouldn't happen with new flow)
              console.warn(`Widget not found for workflow ${completedWorkflow.workflowId}, creating new one`);
              const newWidget = {
                id: updatedWidgets.length + 1,
                title: completedWorkflow.title,
                content: completedWorkflow.content,
                loading: false,
                workflowId: completedWorkflow.workflowId,
                dashboardId: null // Default widgets are not assigned to specific dashboards initially
              };
              updatedWidgets.push(newWidget);
            }
          });
          
          return updatedWidgets;
        });
      }
      
      if (allComplete) {
        setWorkflowStatus('complete');
        setStatusMessage('All default workflows completed successfully!');
        return true; // Stop polling
      } else {
        setStatusMessage('Default workflows are still running...');
        return false; // Continue polling
      }
    } catch (error) {
      console.error('Error fetching default workflows status:', error);
      setWorkflowStatus('error');
      setStatusMessage(`Error fetching status: ${error.message}`);
      isPollingRef.current = false; // Reset polling flag on error
      return true; // Stop polling on error
    }
  };

  const pollDefaultWorkflowsStatus = async () => {
    if (isPollingRef.current) {
      console.log('Polling already active, skipping...');
      return; // Prevent multiple polling cycles
    }
    
    // Check if all default workflows have valid cached results
    const allCached = defaultWorkflows.every(workflow => hasValidCache(workflow.id));
    
    if (allCached) {
      console.log('All default workflows have valid cached results, skipping polling...');
      return;
    }
    
    isPollingRef.current = true;
    console.log('Starting default workflows polling cycle...');
    
    const poll = async () => {
      const isComplete = await fetchDefaultWorkflowsStatus();
      if (!isComplete) {
        // Continue polling every 6 seconds
        setTimeout(poll, 6000);
      } else {
        // Polling completed, reset the flag
        isPollingRef.current = false;
        console.log('Default workflows polling cycle completed');
      }
    };
    // Wait 3 seconds before making the first status check
    setTimeout(poll, 3000);
  };

  const loadDashboardsFromStorage = () => {
    try {
      const savedDashboards = getSavedDashboards();
      console.log('Loaded dashboards from storage:', savedDashboards);
      setActiveDashboards(savedDashboards);
    } catch (error) {
      console.error('Error loading dashboards from storage:', error);
      // Fallback to default dashboards
      setActiveDashboards([
        { id: 'dashboard-1', type: 'email', title: 'Email Management', isDefault: true },
        { id: 'dashboard-2', type: 'github', title: 'GitHub Management', isDefault: true },
        { id: 'dashboard-3', type: 'slack', title: 'Slack Management', isDefault: true }
      ]);
    }
  };

  useEffect(() => {
    // Load dashboards from storage first
    loadDashboardsFromStorage();
    // Initialize default widgets first with loading states
    initializeDefaultWidgets();
    // Start polling to check for existing workflow results (don't execute)
    pollDefaultWorkflowsStatus();
    // Then load saved workflows which will be appended after
    loadSavedWorkflows();
    // Load connections for all dashboards
    loadAllConnections();
  }, []);

  // Load connections when active dashboards change
  useEffect(() => {
    loadAllConnections();
  }, [activeDashboards]);

  // Update activity tracker whenever widgets change
  useEffect(() => {
    updateWidgets(widgets);
  }, [widgets, updateWidgets]);

  const initializeDefaultWidgets = () => {
    const savedWorkflows = getSavedWorkflows();
    
    // Clear any expired results first
    clearExpiredResults();
    
    // Create widgets for default workflows - check cache first
    const defaultWidgets = defaultWorkflows.map((defaultWorkflow, index) => {
      const cachedResult = getCachedWorkflowResult(defaultWorkflow.id);
      
      // Assign to appropriate dashboard based on type
      let dashboardId = null;
      if (defaultWorkflow.dashboardType === 'email') {
        dashboardId = 'dashboard-1'; // Email dashboard
      } else if (defaultWorkflow.dashboardType === 'github') {
        dashboardId = 'dashboard-2'; // GitHub dashboard
      } else if (defaultWorkflow.dashboardType === 'slack') {
        dashboardId = 'dashboard-3'; // Slack dashboard
      }
      
      return {
        id: index + 1,
        title: defaultWorkflow.title,
        content: cachedResult || "",
        loading: !cachedResult, // Only loading if no cached result
        workflowId: defaultWorkflow.id,
        dashboardId: dashboardId
      };
    });
    
    // Set the default widgets
    setWidgets(defaultWidgets);
    
    // Add all default workflows to storage if they don't exist
    defaultWorkflows.forEach(defaultWorkflow => {
      const exists = savedWorkflows.some(w => w.id === defaultWorkflow.id);
      
      if (!exists) {
        const workflowToSave = {
          id: defaultWorkflow.id,
          title: defaultWorkflow.title,
          createdAt: new Date().toISOString(),
          lastRun: null,
          dashboardType: defaultWorkflow.dashboardType
        };
        
        try {
          saveWorkflow(workflowToSave);
          console.log(`Added ${defaultWorkflow.title} workflow to storage`);
        } catch (error) {
          console.error(`Error adding ${defaultWorkflow.title} workflow:`, error);
        }
      }
    });
  };

  const loadSavedWorkflows = () => {
    try {
      const savedWorkflows = getSavedWorkflows();
      console.log('Loaded saved workflows:', savedWorkflows);
      
      // Convert saved workflows to widgets if there are any
      if (savedWorkflows.length > 0) {
        setWidgets(prevWidgets => {
          // Filter out any duplicates based on workflowId and exclude default workflows (they're already loaded with loading states)
          const existingWorkflowIds = prevWidgets.map(w => w.workflowId).filter(Boolean);
          const defaultWorkflowIds = defaultWorkflows.map(w => w.id);
          const newWorkflows = savedWorkflows.filter(w => 
            !existingWorkflowIds.includes(w.id) && !defaultWorkflowIds.includes(w.id)
          );
          
          // Generate widgets for new non-default workflows
          const savedWidgets = newWorkflows.map((workflow, index) => ({
            id: prevWidgets.length + index + 1,
            title: workflow.title,
            content: "",
            loading: false,
            workflowId: workflow.id,
            dashboardId: workflow.dashboardId || null
          }));
          
          // Append saved workflows after existing widgets (default loading widgets will remain first)
          return [...prevWidgets, ...savedWidgets];
        });
      }
    } catch (error) {
      console.error('Error loading saved workflows:', error);
    }
  };


  const updateWidgetContent = (id, newContent) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, content: newContent } : widget
    ));
  };

  const deleteWidget = (widgetId) => {
    // Find the widget to get its workflowId
    const widgetToDelete = widgets.find(widget => widget.id === widgetId);
    
    if (widgetToDelete && widgetToDelete.workflowId) {
      // Delete from storage if it's not a default workflow
      const defaultWorkflowIds = defaultWorkflows.map(w => w.id);
      if (!defaultWorkflowIds.includes(widgetToDelete.workflowId)) {
        try {
          deleteWorkflow(widgetToDelete.workflowId);
          console.log('Deleted workflow from storage:', widgetToDelete.workflowId);
        } catch (error) {
          console.error('Error deleting workflow from storage:', error);
        }
      }
    }
    
    // Remove widget from state
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
    console.log('Widget deleted:', widgetId);
  };

  const runIndividualWorkflow = async (workflowId) => {
    try {
      // Update last run timestamp in storage
      updateWorkflowLastRun(workflowId);
      
      // Find the widget that needs to be updated
      const widgetIndex = widgets.findIndex(widget => widget.workflowId === workflowId);
      if (widgetIndex === -1) {
        throw new Error('Widget not found');
      }

      // Set the specific widget to loading state
      const updatedWidgets = [...widgets];
      updatedWidgets[widgetIndex] = { ...updatedWidgets[widgetIndex], loading: true };
      setWidgets(updatedWidgets);

      // Execute the workflow
      const executeResponse = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'ib-context': 'ibhack008',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          msg: ""
        })
      });

      if (!executeResponse.ok) {
        throw new Error(`HTTP error! status: ${executeResponse.status}`);
      }

      // Poll for completion
      let isComplete = false;
      let attempts = 0;
      const maxAttempts = 20; // 2 minutes max wait time

      while (!isComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 6000)); // Wait 6 seconds
        attempts++;

        const statusResponse = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflowId}/status`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          'ib-context': 'ibhack008'
          }
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to fetch workflow status');
        }

        const statusData = await statusResponse.json();
        const status = statusData.status || 'unknown';

        if (status === 'complete') {
          isComplete = true;
          console.log('Workflow completed, processing results...', statusData);
          
          // Extract the result
          const nodes = statusData.dag.nodes;
          const outputFormatterNode = nodes.find(node => node.tool_name === "output_formatter_tool");
          const targetNode = outputFormatterNode || nodes[nodes.length - 1];
          let llmResponse = targetNode ? targetNode.result : null;
          console.log('Raw LLM response:', llmResponse);
          
          if (llmResponse) {
            try {
              llmResponse = JSON.parse(llmResponse).formatted_response;
              console.log('Formatted response:', llmResponse);
              const parsedResponse = parseLlmResponse(llmResponse);
              console.log('Parsed response:', parsedResponse);
              
              // Save result to localStorage cache
              saveWorkflowResult(workflowId, parsedResponse);
              
              // Update the specific widget with new content using the callback form to get current state
              setWidgets(currentWidgets => {
                const updatedWidgets = [...currentWidgets];
                const currentWidgetIndex = updatedWidgets.findIndex(widget => widget.workflowId === workflowId);
                if (currentWidgetIndex !== -1) {
                  updatedWidgets[currentWidgetIndex] = { 
                    ...updatedWidgets[currentWidgetIndex], 
                    content: parsedResponse,
                    loading: false 
                  };
                  console.log('Widget updated with results');
                }
                return updatedWidgets;
              });
            } catch (parseError) {
              console.error('Error parsing response:', parseError);
              // Fallback to raw response
              setWidgets(currentWidgets => {
                const updatedWidgets = [...currentWidgets];
                const currentWidgetIndex = updatedWidgets.findIndex(widget => widget.workflowId === workflowId);
                if (currentWidgetIndex !== -1) {
                  updatedWidgets[currentWidgetIndex] = { 
                    ...updatedWidgets[currentWidgetIndex], 
                    content: llmResponse || "Workflow completed",
                    loading: false 
                  };
                }
                return updatedWidgets;
              });
            }
          } else {
            // If no response, just stop loading
            console.log('No LLM response found, stopping loading');
            setWidgets(currentWidgets => {
              const updatedWidgets = [...currentWidgets];
              const currentWidgetIndex = updatedWidgets.findIndex(widget => widget.workflowId === workflowId);
              if (currentWidgetIndex !== -1) {
                updatedWidgets[currentWidgetIndex] = { 
                  ...updatedWidgets[currentWidgetIndex], 
                  content: "Workflow completed but no results found",
                  loading: false 
                };
              }
              return updatedWidgets;
            });
          }
        } else if (status === 'failed' || status === 'error') {
          throw new Error('Workflow execution failed');
        }
      }

      if (!isComplete) {
        throw new Error('Workflow execution timed out');
      }

    } catch (error) {
      console.error('Error running individual workflow:', error);
      
      // Update the widget to show error state using callback form
      setWidgets(currentWidgets => {
        const updatedWidgets = [...currentWidgets];
        const currentWidgetIndex = updatedWidgets.findIndex(widget => widget.workflowId === workflowId);
        if (currentWidgetIndex !== -1) {
          updatedWidgets[currentWidgetIndex] = { 
            ...updatedWidgets[currentWidgetIndex], 
            content: `Error: ${error.message}`,
            loading: false 
          };
        }
        return updatedWidgets;
      });
      
      throw error; // Re-throw to be handled by widget
    }
  };

  const handleWorkflowComplete = (result, workflowId) => {
    // The workflow is already saved to localStorage by WorkflowModal
    console.log('Workflow completed, adding widget to dashboard and running...');
    
    if (workflowId) {
      // Get the saved workflow details
      try {
        const savedWorkflows = getSavedWorkflows();
        const newWorkflow = savedWorkflows.find(w => w.id === workflowId);
        
        if (newWorkflow) {
          // Create the widget immediately with loading state
          const newWidget = {
            id: Date.now(), // Use timestamp as unique ID
            title: newWorkflow.title,
            content: "",
            loading: true, // Start in loading state
            workflowId: workflowId,
            dashboardId: newWorkflow.dashboardId || currentDashboardContext?.dashboardId
          };
          
          // Add widget to state immediately
          setWidgets(prevWidgets => {
            // Check if widget already exists to avoid duplicates
            const existingWidget = prevWidgets.find(w => w.workflowId === workflowId);
            if (existingWidget) {
              // Update existing widget to loading state
              return prevWidgets.map(w => 
                w.workflowId === workflowId 
                  ? { ...w, loading: true }
                  : w
              );
            } else {
              // Add new widget
              return [...prevWidgets, newWidget];
            }
          });
          
          // Small delay to ensure state update, then run workflow
          setTimeout(() => {
            console.log('Running workflow after adding widget to dashboard:', workflowId);
            runIndividualWorkflow(workflowId).catch(error => {
              console.error('Error running workflow after adding to dashboard:', error);
              // Update widget to show error state
              setWidgets(prevWidgets => 
                prevWidgets.map(w => 
                  w.workflowId === workflowId 
                    ? { ...w, content: `Error: ${error.message}`, loading: false }
                    : w
                )
              );
            });
          }, 100);
        } else {
          console.error('Workflow not found in saved workflows:', workflowId);
        }
      } catch (error) {
        console.error('Error handling workflow completion:', error);
      }
    }
  };

  // Function to add new dashboard
  const addNewDashboard = (dashboardType) => {
    const newId = `dashboard-${Date.now()}`;
    const dashboardConfig = DASHBOARD_TYPES[dashboardType];
    
    if (!dashboardConfig) {
      console.error('Unknown dashboard type:', dashboardType);
      return;
    }

    const newDashboard = {
      id: newId,
      type: dashboardType,
      title: dashboardConfig.name,
      isDefault: false
    };

    try {
      // Save to storage
      addCustomDashboard(newDashboard);
      // Update state
      setActiveDashboards(prev => [...prev, newDashboard]);
      console.log('Added new dashboard:', newDashboard);
    } catch (error) {
      console.error('Error adding new dashboard:', error);
    }
  };

  // Function to remove dashboard
  const removeDashboard = (dashboardId) => {
    try {
      // Check if dashboard can be removed
      if (!canRemoveDashboard(dashboardId)) {
        console.warn('Cannot remove default dashboard:', dashboardId);
        return;
      }
      
      // Remove from storage
      removeDashboardFromStorage(dashboardId);
      // Update state
      setActiveDashboards(prev => prev.filter(dashboard => dashboard.id !== dashboardId));
      console.log('Removed dashboard:', dashboardId);
    } catch (error) {
      console.error('Error removing dashboard:', error);
    }
  };

  // Function to handle showing modal with dashboard context
  const handleShowModal = (dashboardId, dashboardType) => {
    setCurrentDashboardContext({ dashboardId, dashboardType });
    setShowModal(true);
  };

  // Function to handle closing modal and clearing context
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentDashboardContext(null);
  };

  // Function to handle showing connections modal
  const handleShowConnectionsModal = (dashboardId, dashboardType, dashboardTitle) => {
    setCurrentConnectionsDashboard({ dashboardId, dashboardType, dashboardTitle });
    setShowConnectionsModal(true);
  };

  // Function to handle closing connections modal
  const handleCloseConnectionsModal = () => {
    setShowConnectionsModal(false);
    setCurrentConnectionsDashboard(null);
  };

  // Function to load connections for all dashboards
  const loadAllConnections = () => {
    const connections = {};
    activeDashboards.forEach(dashboard => {
      connections[dashboard.type] = getConnectedTools(dashboard.type);
    });
    setDashboardConnections(connections);
  };

  // Function to handle connections update
  const handleConnectionsUpdate = () => {
    loadAllConnections();
  };

  // Function to handle dashboard title changes
  const handleDashboardTitleChange = (dashboardId, newTitle) => {
    try {
      // Update in storage
      updateDashboardTitle(dashboardId, newTitle);
      // Update in state
      setActiveDashboards(prev => 
        prev.map(dashboard => 
          dashboard.id === dashboardId 
            ? { ...dashboard, title: newTitle }
            : dashboard
        )
      );
      console.log('Dashboard title updated:', dashboardId, newTitle);
    } catch (error) {
      console.error('Error updating dashboard title:', error);
    }
  };

  // AddNewDashboard component
  const AddNewDashboard = () => {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-8">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Dashboard</h3>
          <p className="text-gray-500">Choose a dashboard type to get started</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(DASHBOARD_TYPES).map((dashboardType) => {
            const IconComponent = dashboardType.icon;
            const isCustom = dashboardType.id === 'custom';
            
            return (
              <button
                key={dashboardType.id}
                onClick={() => addNewDashboard(dashboardType.id)}
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="ms-10 mr-10 mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Task Management Dashboard</h1>
            <p className="text-gray-600 mt-2">Organize your emails, messages, and development workflows</p>
          {workflowStatus !== 'idle' && (
            <div className="flex items-center mt-3 text-sm">
              {workflowStatus === 'executing' && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  {statusMessage}
                </div>
              )}
              {workflowStatus === 'running' && (
                <div className="flex items-center text-orange-600">
                  <div className="animate-pulse w-4 h-4 bg-orange-600 rounded-full mr-2"></div>
                  {statusMessage}
                </div>
              )}
              {workflowStatus === 'complete' && (
                <div className="flex items-center text-green-600">
                  <div className="w-4 h-4 bg-green-600 rounded-full mr-2"></div>
                  {statusMessage}
                </div>
              )}
              {workflowStatus === 'error' && (
                <div className="flex items-center text-red-600">
                  <div className="w-4 h-4 bg-red-600 rounded-full mr-2"></div>
                  {statusMessage}
                </div>
              )}
            </div>
            )}
          </div>
        </header>

        <div className="space-y-12 mb-12">
          {/* Dynamic Dashboard Rendering */}
          {activeDashboards.map((dashboard) => {
            const dashboardConfig = DASHBOARD_TYPES[dashboard.type];
            if (!dashboardConfig) {
              console.error('Unknown dashboard type:', dashboard.type);
              return null;
            }

            const DashboardComponent = dashboardConfig.component;
            
            return (
              <div key={dashboard.id}>
                <DashboardComponent 
                  widgets={widgets}
                  onUpdateWidget={updateWidgetContent}
                  onDeleteWidget={deleteWidget}
                  onRunWorkflow={runIndividualWorkflow}
                  onShowModal={() => handleShowModal(dashboard.id, dashboard.type)}
                  onShowConnectionsModal={() => handleShowConnectionsModal(dashboard.id, dashboard.type, dashboard.title)}
                  workflowStatus={workflowStatus}
                  statusMessage={statusMessage}
                  dashboardId={dashboard.id}
                  dashboardTitle={dashboard.title}
                  connectedTools={dashboardConnections[dashboard.type] || []}
                  onRemoveDashboard={() => removeDashboard(dashboard.id)}
                  canRemove={canRemoveDashboard(dashboard.id)}
                  onTitleChange={dashboard.type === 'custom' ? handleDashboardTitleChange : undefined}
                />
              </div>
            );
          })}

          {/* Add New Dashboard Section */}
          <AddNewDashboard />
        </div>

        <WorkflowModal 
          isOpen={showModal}
          onClose={handleCloseModal}
          onWorkflowComplete={handleWorkflowComplete}
          dashboardId={currentDashboardContext?.dashboardId}
          dashboardType={currentDashboardContext?.dashboardType}
        />

        <ConnectionsModal 
          isOpen={showConnectionsModal}
          onClose={handleCloseConnectionsModal}
          dashboardType={currentConnectionsDashboard?.dashboardType}
          dashboardTitle={currentConnectionsDashboard?.dashboardTitle}
          onConnectionsUpdate={handleConnectionsUpdate}
        />
      </div>
    </div>
  );
}

export default Dashboard;
