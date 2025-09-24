import { useState, useEffect } from "react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, saveWorkflow, getCachedWorkflowResult, clearExpiredResults, deleteWorkflow } from "../utils/workflowStorage";
import ConnectionsModal from "./ConnectionsModal";
import { useActivity } from "../contexts/ActivityContext";
import { DASHBOARD_TYPES } from "../constants/dashboardTypes";
import { DEFAULT_WORKFLOWS } from "../constants/workflowConfig";
import AddNewDashboard from "./AddNewDashboard";
import { useWorkflowManagement } from "../hooks/useWorkflowManagement";
import { useDashboardManagement } from "../hooks/useDashboardManagement";

function Dashboard() {
  const { updateWidgets } = useActivity();

  // Workflow management hook
  const {
    workflowStatus,
    statusMessage,
    runIndividualWorkflow,
    pollDefaultWorkflowsStatus
  } = useWorkflowManagement();

  // Dashboard management hook
  const {
    activeDashboards,
    dashboardConnections,
    showConnectionsModal,
    currentConnectionsDashboard,
    addNewDashboard,
    removeDashboard,
    handleDashboardTitleChange,
    handleShowConnectionsModal,
    handleCloseConnectionsModal,
    handleConnectionsUpdate
  } = useDashboardManagement();

  const [widgets, setWidgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  // State for tracking which dashboard is requesting a new widget
  const [currentDashboardContext, setCurrentDashboardContext] = useState(null);

  const initializeDefaultWidgets = () => {
    const savedWorkflows = getSavedWorkflows();
    
    // Clear any expired results first
    clearExpiredResults();
    
    // Create widgets for default workflows - check cache first
    const defaultWidgets = DEFAULT_WORKFLOWS.map((defaultWorkflow, index) => {
      const cachedResult = getCachedWorkflowResult(defaultWorkflow.id);
      
      // Assign to appropriate dashboard based on type
      let dashboardId = null;
      if (defaultWorkflow.dashboardType === 'email') {
        dashboardId = 'dashboard-1'; // Email dashboard
      } else if (defaultWorkflow.dashboardType === 'github') {
        dashboardId = 'dashboard-2'; // GitHub dashboard
      } else if (defaultWorkflow.dashboardType === 'slack') {
        dashboardId = 'dashboard-3'; // Slack dashboard
      } else if (defaultWorkflow.dashboardType === 'aihub') {
        dashboardId = 'dashboard-4'; // AI Hub dashboard
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
    DEFAULT_WORKFLOWS.forEach(defaultWorkflow => {
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
          // Filter out any duplicates based on workflowId and exclude default workflows
          const existingWorkflowIds = prevWidgets.map(w => w.workflowId).filter(Boolean);
          const defaultWorkflowIds = DEFAULT_WORKFLOWS.map(w => w.id);
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
          
          // Append saved workflows after existing widgets
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
      const defaultWorkflowIds = DEFAULT_WORKFLOWS.map(w => w.id);
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

  const handleWorkflowComplete = (result, workflowId) => {
    console.log('Workflow completed, adding widget to dashboard and running...');
    
    if (workflowId) {
      try {
        const savedWorkflows = getSavedWorkflows();
        const newWorkflow = savedWorkflows.find(w => w.id === workflowId);
        
        if (newWorkflow) {
          const newWidget = {
            id: Date.now(),
            title: newWorkflow.title,
            content: "",
            loading: true,
            workflowId: workflowId,
            dashboardId: newWorkflow.dashboardId || currentDashboardContext?.dashboardId
          };
          
          setWidgets(prevWidgets => {
            const existingWidget = prevWidgets.find(w => w.workflowId === workflowId);
            if (existingWidget) {
              return prevWidgets.map(w => 
                w.workflowId === workflowId 
                  ? { ...w, loading: true }
                  : w
              );
            } else {
              return [...prevWidgets, newWidget];
            }
          });
          
          // Run workflow after adding widget
          setTimeout(() => {
            runIndividualWorkflow(workflowId).then(result => {
              if (result.success) {
                setWidgets(prevWidgets => 
                  prevWidgets.map(w => 
                    w.workflowId === workflowId 
                      ? { ...w, content: result.result, loading: false }
                      : w
                  )
                );
              } else {
              setWidgets(prevWidgets => 
                prevWidgets.map(w => 
                  w.workflowId === workflowId 
                      ? { ...w, content: `Error: ${result.error}`, loading: false }
                    : w
                )
              );
              }
            });
          }, 100);
        }
      } catch (error) {
        console.error('Error handling workflow completion:', error);
      }
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

  useEffect(() => {
    // Initialize default widgets first with loading states
    initializeDefaultWidgets();
    // Start polling to check for existing workflow results
    pollDefaultWorkflowsStatus();
    // Then load saved workflows which will be appended after
    loadSavedWorkflows();
  }, []);

  // Update activity tracker whenever widgets change
  useEffect(() => {
    console.log('Dashboard: Updating activity tracker with widgets:', widgets.length, 'widgets');
    updateWidgets(widgets);
  }, [widgets, updateWidgets]);

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
                  canRemove={() => dashboard.type === 'custom'}
                  onTitleChange={dashboard.type === 'custom' ? handleDashboardTitleChange : undefined}
                />
              </div>
            );
          })}

          {/* Add New Dashboard Section */}
          <AddNewDashboard 
            dashboardTypes={DASHBOARD_TYPES}
            onAddDashboard={(dashboardType) => addNewDashboard(dashboardType, DASHBOARD_TYPES[dashboardType])}
          />
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