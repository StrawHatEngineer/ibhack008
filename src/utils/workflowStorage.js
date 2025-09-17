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

// Workflow Results Caching
const WORKFLOW_RESULTS_KEY = 'workflow_results';

/**
 * Get all cached workflow results from localStorage
 * @returns {Object} Object with workflowId as keys and result data as values
 */
export const getWorkflowResults = () => {
  try {
    const stored = localStorage.getItem(WORKFLOW_RESULTS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading workflow results from storage:', error);
    return {};
  }
};

/**
 * Save workflow result to localStorage with expiration
 * @param {String} workflowId - ID of the workflow
 * @param {*} result - Result data to cache
 * @param {Number} hoursToExpire - Hours until cache expires (default: 1 hour)
 */
export const saveWorkflowResult = (workflowId, result, hoursToExpire = 1) => {
  try {
    const existing = getWorkflowResults();
    const expirationTime = new Date(Date.now() + hoursToExpire * 60 * 60 * 1000);
    
    const updated = {
      ...existing,
      [workflowId]: {
        content: result,
        timestamp: new Date().toISOString(),
        expiresAt: expirationTime.toISOString()
      }
    };
    
    localStorage.setItem(WORKFLOW_RESULTS_KEY, JSON.stringify(updated));
    console.log('Workflow result cached for:', workflowId);
  } catch (error) {
    console.error('Error saving workflow result:', error);
  }
};

/**
 * Get cached workflow result if it exists and hasn't expired
 * @param {String} workflowId - ID of the workflow
 * @returns {*|null} Cached result or null if not found/expired
 */
export const getCachedWorkflowResult = (workflowId) => {
  try {
    const results = getWorkflowResults();
    const result = results[workflowId];
    
    if (!result) {
      return null;
    }
    
    // Check if result has expired
    const now = new Date();
    const expiresAt = new Date(result.expiresAt);
    
    if (now > expiresAt) {
      // Result has expired, remove it
      const updated = { ...results };
      delete updated[workflowId];
      localStorage.setItem(WORKFLOW_RESULTS_KEY, JSON.stringify(updated));
      console.log('Expired cached result removed for:', workflowId);
      return null;
    }
    
    console.log('Using cached result for:', workflowId);
    return result.content;
  } catch (error) {
    console.error('Error getting cached workflow result:', error);
    return null;
  }
};

/**
 * Check if a workflow result is cached and valid
 * @param {String} workflowId - ID of the workflow
 * @returns {Boolean} True if cached and valid, false otherwise
 */
export const hasValidCache = (workflowId) => {
  return getCachedWorkflowResult(workflowId) !== null;
};

/**
 * Clear expired workflow results from cache
 */
export const clearExpiredResults = () => {
  try {
    const results = getWorkflowResults();
    const now = new Date();
    const updated = {};
    let removedCount = 0;
    
    Object.entries(results).forEach(([workflowId, result]) => {
      const expiresAt = new Date(result.expiresAt);
      if (now <= expiresAt) {
        updated[workflowId] = result;
      } else {
        removedCount++;
      }
    });
    
    if (removedCount > 0) {
      localStorage.setItem(WORKFLOW_RESULTS_KEY, JSON.stringify(updated));
      console.log(`Cleared ${removedCount} expired workflow results`);
    }
  } catch (error) {
    console.error('Error clearing expired results:', error);
  }
};

/**
 * Clear all cached workflow results
 */
export const clearAllResults = () => {
  try {
    localStorage.removeItem(WORKFLOW_RESULTS_KEY);
    console.log('Cleared all cached workflow results');
  } catch (error) {
    console.error('Error clearing workflow results:', error);
  }
};
