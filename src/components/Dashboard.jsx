import { useState, useEffect, useRef } from "react";
import { PlusCircle, RefreshCw, Mail, MessageSquare, Github, Plus, Settings, Sparkles, X } from "lucide-react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, updateWorkflowLastRun, saveWorkflow, getCachedWorkflowResult, saveWorkflowResult, hasValidCache, clearExpiredResults, deleteWorkflow } from "../utils/workflowStorage";
import EmailDashboard from "./EmailDashboard";
import SlackDashboard from "./SlackDashboard";
import GitHubDashboard from "./GitHubDashboard";
import ConnectionsModal from "./ConnectionsModal";
import { useActivity } from "../contexts/ActivityContext";
import { getConnectedTools } from "../utils/connectionsStorage";

// Custom Dashboard Component
const CustomDashboard = ({ dashboardId, dashboardTitle, onShowModal, onShowConnectionsModal, widgets, onUpdateWidget, onRunWorkflow, connectedTools, onRemoveDashboard, canRemove }) => {
  const [customTitle, setCustomTitle] = useState(dashboardTitle || 'Custom Dashboard');
  const [isEditing, setIsEditing] = useState(false);

  const customWidgets = widgets.filter(widget => widget.dashboardId === dashboardId);

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
                onBlur={() => setIsEditing(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditing(false);
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
            <div key={widget.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-medium text-gray-800">{widget.title}</h3>
                <button
                  onClick={() => onRunWorkflow(widget.workflowId)}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  disabled={widget.loading}
                >
                  {widget.loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {widget.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse bg-gray-300 h-4 w-3/4 rounded"></div>
                  </div>
                ) : widget.content ? (
                  <div className="max-h-32 overflow-y-auto">
                    {typeof widget.content === 'string' ? widget.content : JSON.stringify(widget.content)}
                  </div>
                ) : (
                  <span className="text-gray-400">No content yet</span>
                )}
              </div>
            </div>
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
  const [activeDashboards, setActiveDashboards] = useState([
    { id: 'dashboard-1', type: 'email', title: 'Email Management' },
    { id: 'dashboard-2', type: 'github', title: 'GitHub Management' },
    { id: 'dashboard-3', type: 'slack', title: 'Slack Management' }
  ]);
  
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

  useEffect(() => {
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
    // So we just need to reload all saved workflows to update the dashboard
    console.log('Workflow completed, reloading saved workflows...');
    
    // Small delay to ensure localStorage write is complete
    setTimeout(() => {
      loadSavedWorkflows();
      
      // Also run the workflow immediately after adding to dashboard
      if (workflowId) {
        console.log('Running workflow after adding to dashboard:', workflowId);
        runIndividualWorkflow(workflowId).catch(error => {
          console.error('Error running workflow after adding to dashboard:', error);
        });
      }
    }, 100);
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
      title: dashboardConfig.name
    };

    setActiveDashboards(prev => [...prev, newDashboard]);
  };

  // Function to remove dashboard
  const removeDashboard = (dashboardId) => {
    setActiveDashboards(prev => prev.filter(dashboard => dashboard.id !== dashboardId));
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
                  canRemove={activeDashboards.length > 1}
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
