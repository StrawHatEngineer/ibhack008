import { useState, useEffect, useRef } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";
import WorkflowModal from "./WorkflowModal";
import { getSavedWorkflows, updateWorkflowLastRun, saveWorkflow } from "../utils/workflowStorage";
import EmailDashboard from "./EmailDashboard";
import SlackDashboard from "./SlackDashboard";
import GitHubDashboard from "./GitHubDashboard";


function Dashboard() {

  const [llmResponse, setLlmResponse] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState('idle'); 
  const [statusMessage, setStatusMessage] = useState('');
  const isPollingRef = useRef(false);
  
  // Default workflows that auto-load on page refresh
  const defaultWorkflows = [
    { id: '01994cdb-9588-7c8a-ab7d-9f3f764ca29a', title: 'Important Emails' },
    { id: '01995274-54ce-79a3-97cc-43d301c90a6f', title: 'Follow Up Emails' }
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
            'Authorization': 'Bearer gvdNIYxMEEDW8jPp0Cbfq7DF9mGSHF',
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
        const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflow.id}/status`, {
          headers: {
            'Authorization': 'Bearer gvdNIYxMEEDW8jPp0Cbfq7DF9mGSHF',
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
          
          completedWorkflows.forEach((completedWorkflow, index) => {
            const existingIndex = updatedWidgets.findIndex(w => w.workflowId === completedWorkflow.workflowId);
            
            if (existingIndex === -1) {
              // Add new default workflow
              const newWidget = {
                id: index + 1,
                title: completedWorkflow.title,
                content: completedWorkflow.content,
                loading: false,
                workflowId: completedWorkflow.workflowId
              };
              updatedWidgets.unshift(newWidget);
            } else {
              // Update existing widget
              updatedWidgets[existingIndex] = {
                ...updatedWidgets[existingIndex],
                content: completedWorkflow.content,
                loading: false
              };
            }
          });
          
          // Re-index all widgets
          return updatedWidgets.map((widget, index) => ({ ...widget, id: index + 1 }));
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
    // Initialize default widgets first
    initializeDefaultWidgets();
    // Start default workflow polling first to ensure it appears at the front
    pollDefaultWorkflowsStatus();
    // Then load saved workflows which will be appended after
    loadSavedWorkflows();
  }, []);

  const initializeDefaultWidgets = () => {
    const savedWorkflows = getSavedWorkflows();
    
    // Add all default workflows if they don't exist
    defaultWorkflows.forEach(defaultWorkflow => {
      const exists = savedWorkflows.some(w => w.id === defaultWorkflow.id);
      
      if (!exists) {
        const workflowToSave = {
          id: defaultWorkflow.id,
          title: defaultWorkflow.title,
          createdAt: new Date().toISOString(),
          lastRun: null
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
          // Filter out any duplicates based on workflowId and exclude default workflows (they'll be auto-loaded)
          const existingWorkflowIds = prevWidgets.map(w => w.workflowId).filter(Boolean);
          const defaultWorkflowIds = defaultWorkflows.map(w => w.id);
          const newWorkflows = savedWorkflows.filter(w => 
            !existingWorkflowIds.includes(w.id) && !defaultWorkflowIds.includes(w.id)
          );
          
          // Generate widgets for new workflows, starting ID after existing widgets
          const savedWidgets = newWorkflows.map((workflow, index) => ({
            id: prevWidgets.length + index + 1,
            title: workflow.title,
            content: "",
            loading: false,
            workflowId: workflow.id
          }));
          
          // Append saved workflows after existing widgets (default workflows will be first)
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
          'Authorization': 'Bearer gvdNIYxMEEDW8jPp0Cbfq7DF9mGSHF',
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
            'Authorization': 'Bearer gvdNIYxMEEDW8jPp0Cbfq7DF9mGSHF',
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
    }, 100);
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
          {/* Email Management Section */}
          <EmailDashboard 
            widgets={widgets}
            onUpdateWidget={updateWidgetContent}
            onRunWorkflow={runIndividualWorkflow}
            onShowModal={() => setShowModal(true)}
            workflowStatus={workflowStatus}
            statusMessage={statusMessage}
          />

          {/* GitHub Management Section */}
          <GitHubDashboard 
            widgets={widgets}
            onUpdateWidget={updateWidgetContent}
            onRunWorkflow={runIndividualWorkflow}
            onShowModal={() => setShowModal(true)}
            workflowStatus={workflowStatus}
            statusMessage={statusMessage}
          />

          {/* Slack Management Section */}
          <SlackDashboard 
            widgets={widgets}
            onUpdateWidget={updateWidgetContent}
            onRunWorkflow={runIndividualWorkflow}
            onShowModal={() => setShowModal(true)}
            workflowStatus={workflowStatus}
            statusMessage={statusMessage}
          />

        </div>

        <WorkflowModal 
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onWorkflowComplete={handleWorkflowComplete}
        />
      </div>
    </div>
  );
}

export default Dashboard;
