// Utility functions for managing workflow storage in localStorage

const STORAGE_KEY = 'saved_workflows';

/**
 * Get all saved workflows from localStorage
 * @returns {Array} Array of workflow objects
 */
export const getSavedWorkflows = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading workflows from storage:', error);
    return [];
  }
};

/**
 * Save a new workflow to localStorage
 * @param {Object} workflow - Workflow object containing id, title, createdAt, etc.
 */
export const saveWorkflow = (workflow) => {
  try {
    const existingWorkflows = getSavedWorkflows();
    const newWorkflow = {
      id: workflow.id,
      title: workflow.title,
      createdAt: workflow.createdAt || new Date().toISOString(),
      lastRun: null,
      ...workflow
    };
    
    // Check if workflow already exists
    const existingIndex = existingWorkflows.findIndex(w => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      // Update existing workflow
      existingWorkflows[existingIndex] = { ...existingWorkflows[existingIndex], ...newWorkflow };
    } else {
      // Add new workflow
      existingWorkflows.push(newWorkflow);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingWorkflows));
    console.log('Workflow saved to storage:', newWorkflow);
    
    return newWorkflow;
  } catch (error) {
    console.error('Error saving workflow to storage:', error);
    throw new Error('Failed to save workflow');
  }
};

/**
 * Update workflow's last run timestamp
 * @param {String} workflowId - ID of the workflow to update
 */
export const updateWorkflowLastRun = (workflowId) => {
  try {
    const workflows = getSavedWorkflows();
    const workflowIndex = workflows.findIndex(w => w.id === workflowId);
    
    if (workflowIndex >= 0) {
      workflows[workflowIndex].lastRun = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
      console.log('Updated last run for workflow:', workflowId);
    }
  } catch (error) {
    console.error('Error updating workflow last run:', error);
  }
};

/**
 * Get a specific workflow by ID
 * @param {String} workflowId - ID of the workflow to retrieve
 * @returns {Object|null} Workflow object or null if not found
 */
export const getWorkflowById = (workflowId) => {
  try {
    const workflows = getSavedWorkflows();
    return workflows.find(w => w.id === workflowId) || null;
  } catch (error) {
    console.error('Error getting workflow by ID:', error);
    return null;
  }
};

/**
 * Delete a workflow from storage
 * @param {String} workflowId - ID of the workflow to delete
 */
export const deleteWorkflow = (workflowId) => {
  try {
    const workflows = getSavedWorkflows();
    const filteredWorkflows = workflows.filter(w => w.id !== workflowId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredWorkflows));
    console.log('Deleted workflow from storage:', workflowId);
  } catch (error) {
    console.error('Error deleting workflow:', error);
  }
};

/**
 * Clear all workflows from storage
 */
export const clearAllWorkflows = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Cleared all workflows from storage');
  } catch (error) {
    console.error('Error clearing workflows:', error);
  }
};
