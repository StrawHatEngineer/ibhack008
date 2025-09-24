import { useState, useRef } from 'react';
import { 
  getSavedWorkflows, 
  updateWorkflowLastRun, 
  saveWorkflow, 
  getCachedWorkflowResult, 
  saveWorkflowResult, 
  hasValidCache, 
  clearExpiredResults, 
  deleteWorkflow 
} from '../utils/workflowStorage';
import { DEFAULT_WORKFLOWS, API_CONFIG } from '../constants/workflowConfig';

export const useWorkflowManagement = () => {
  const [workflowStatus, setWorkflowStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const isPollingRef = useRef(false);

  const parseLlmResponse = (llmResponse) => {
    const cleanStr = llmResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanStr); 
    return parsed; 
  };

  const executeDefaultWorkflows = async () => {
    try {
      setWorkflowStatus('executing');
      setStatusMessage('Executing default workflows...');
      console.log('Executing default workflows...');
      
      // Execute all default workflows
      for (const workflow of DEFAULT_WORKFLOWS) {
        await fetch(`${API_CONFIG.BASE_URL}/workflows/${workflow.id}/execute`, {
          method: 'POST',
          headers: API_CONFIG.HEADERS,
          body: JSON.stringify({
            msg: ""
          })
        });
      }
      
      // After successful execution, update status and ensure polling is active
      setWorkflowStatus('running');
      setStatusMessage('Default workflows are running...');
      
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
      
      for (const workflow of DEFAULT_WORKFLOWS) {
        const response = await fetch(`${API_CONFIG.BASE_URL}/workflows/${workflow.id}/status`, {
          headers: {
            'Authorization': API_CONFIG.HEADERS.Authorization,
            'ib-context': API_CONFIG.HEADERS['ib-context']
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
      
      if (allComplete) {
        setWorkflowStatus('complete');
        setStatusMessage('All default workflows completed successfully!');
        return { isComplete: true, completedWorkflows };
      } else {
        setStatusMessage('Default workflows are still running...');
        return { isComplete: false, completedWorkflows };
      }
    } catch (error) {
      console.error('Error fetching default workflows status:', error);
      setWorkflowStatus('error');
      setStatusMessage(`Error fetching status: ${error.message}`);
      isPollingRef.current = false;
      return { isComplete: true, completedWorkflows: [] };
    }
  };

  const pollDefaultWorkflowsStatus = async () => {
    if (isPollingRef.current) {
      console.log('Polling already active, skipping...');
      return;
    }
    
    // Check if all default workflows have valid cached results
    const allCached = DEFAULT_WORKFLOWS.every(workflow => hasValidCache(workflow.id));
    
    if (allCached) {
      console.log('All default workflows have valid cached results, skipping polling...');
      return;
    }
    
    isPollingRef.current = true;
    console.log('Starting default workflows polling cycle...');
    
    const poll = async () => {
      const { isComplete } = await fetchDefaultWorkflowsStatus();
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

  const runIndividualWorkflow = async (workflowId) => {
    try {
      // Update last run timestamp in storage
      updateWorkflowLastRun(workflowId);
      
      // Wait for UI to show loading state
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Execute the workflow
      const executeResponse = await fetch(`${API_CONFIG.BASE_URL}/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
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

        const statusResponse = await fetch(`${API_CONFIG.BASE_URL}/workflows/${workflowId}/status`, {
          headers: {
            'Authorization': API_CONFIG.HEADERS.Authorization,
            'ib-context': API_CONFIG.HEADERS['ib-context']
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
          
          if (llmResponse) {
            try {
              llmResponse = JSON.parse(llmResponse).formatted_response;
              const parsedResponse = parseLlmResponse(llmResponse);
              
              // Save result to localStorage cache
              saveWorkflowResult(workflowId, parsedResponse);
              
              return { success: true, result: parsedResponse };
            } catch (parseError) {
              console.error('Error parsing response:', parseError);
              return { success: true, result: llmResponse || "Workflow completed" };
            }
          } else {
            return { success: true, result: "Workflow completed but no results found" };
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
      return { success: false, error: error.message };
    }
  };

  return {
    workflowStatus,
    statusMessage,
    executeDefaultWorkflows,
    fetchDefaultWorkflowsStatus,
    pollDefaultWorkflowsStatus,
    runIndividualWorkflow,
    parseLlmResponse
  };
};
