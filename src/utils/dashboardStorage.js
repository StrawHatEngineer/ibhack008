// Utility functions for managing custom dashboard storage in localStorage

const DASHBOARDS_KEY = 'custom_dashboards';

// Default dashboards that should always be present
const DEFAULT_DASHBOARDS = [
  { id: 'dashboard-1', type: 'email', title: 'Email Management', isDefault: true },
  { id: 'dashboard-2', type: 'github', title: 'GitHub Management', isDefault: true },
  { id: 'dashboard-3', type: 'slack', title: 'Slack Management', isDefault: true }
];

/**
 * Get all dashboards from localStorage
 * @returns {Array} Array of dashboard objects
 */
export const getSavedDashboards = () => {
  try {
    const stored = localStorage.getItem(DASHBOARDS_KEY);
    const savedDashboards = stored ? JSON.parse(stored) : [];
    
    // Always ensure default dashboards are present
    const defaultIds = DEFAULT_DASHBOARDS.map(d => d.id);
    const hasAllDefaults = DEFAULT_DASHBOARDS.every(defaultDash => 
      savedDashboards.some(saved => saved.id === defaultDash.id)
    );
    
    if (!hasAllDefaults) {
      // Add missing default dashboards
      const mergedDashboards = [...DEFAULT_DASHBOARDS];
      savedDashboards.forEach(saved => {
        if (!defaultIds.includes(saved.id)) {
          mergedDashboards.push(saved);
        } else {
          // Update existing default with any custom title changes
          const defaultIndex = mergedDashboards.findIndex(d => d.id === saved.id);
          if (defaultIndex >= 0) {
            mergedDashboards[defaultIndex] = { ...mergedDashboards[defaultIndex], ...saved };
          }
        }
      });
      return mergedDashboards;
    }
    
    return savedDashboards;
  } catch (error) {
    console.error('Error reading dashboards from storage:', error);
    return DEFAULT_DASHBOARDS;
  }
};

/**
 * Save all dashboards to localStorage
 * @param {Array} dashboards - Array of dashboard objects
 */
export const saveAllDashboards = (dashboards) => {
  try {
    localStorage.setItem(DASHBOARDS_KEY, JSON.stringify(dashboards));
    console.log('Dashboards saved to storage');
  } catch (error) {
    console.error('Error saving dashboards to storage:', error);
    throw new Error('Failed to save dashboards');
  }
};

/**
 * Add a new custom dashboard
 * @param {Object} dashboard - Dashboard object containing id, type, title, etc.
 */
export const addCustomDashboard = (dashboard) => {
  try {
    const existingDashboards = getSavedDashboards();
    const newDashboard = {
      id: dashboard.id || `dashboard-${Date.now()}`,
      type: dashboard.type,
      title: dashboard.title,
      createdAt: new Date().toISOString(),
      isDefault: false,
      ...dashboard
    };
    
    // Check if dashboard already exists
    const existingIndex = existingDashboards.findIndex(d => d.id === newDashboard.id);
    
    if (existingIndex >= 0) {
      // Update existing dashboard
      existingDashboards[existingIndex] = { ...existingDashboards[existingIndex], ...newDashboard };
    } else {
      // Add new dashboard
      existingDashboards.push(newDashboard);
    }
    
    saveAllDashboards(existingDashboards);
    console.log('Custom dashboard added to storage:', newDashboard);
    
    return newDashboard;
  } catch (error) {
    console.error('Error adding custom dashboard to storage:', error);
    throw new Error('Failed to add custom dashboard');
  }
};

/**
 * Update an existing dashboard
 * @param {String} dashboardId - ID of the dashboard to update
 * @param {Object} updates - Object containing fields to update
 */
export const updateDashboard = (dashboardId, updates) => {
  try {
    const dashboards = getSavedDashboards();
    const dashboardIndex = dashboards.findIndex(d => d.id === dashboardId);
    
    if (dashboardIndex >= 0) {
      dashboards[dashboardIndex] = { 
        ...dashboards[dashboardIndex], 
        ...updates,
        updatedAt: new Date().toISOString()
      };
      saveAllDashboards(dashboards);
      console.log('Dashboard updated in storage:', dashboardId);
      return dashboards[dashboardIndex];
    } else {
      throw new Error('Dashboard not found');
    }
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw new Error('Failed to update dashboard');
  }
};

/**
 * Update dashboard title
 * @param {String} dashboardId - ID of the dashboard to update
 * @param {String} newTitle - New title for the dashboard
 */
export const updateDashboardTitle = (dashboardId, newTitle) => {
  return updateDashboard(dashboardId, { title: newTitle });
};

/**
 * Remove a dashboard from storage
 * @param {String} dashboardId - ID of the dashboard to remove
 */
export const removeDashboard = (dashboardId) => {
  try {
    const dashboards = getSavedDashboards();
    const dashboard = dashboards.find(d => d.id === dashboardId);
    
    // Prevent removal of default dashboards
    if (dashboard && dashboard.isDefault) {
      throw new Error('Cannot remove default dashboard');
    }
    
    const filteredDashboards = dashboards.filter(d => d.id !== dashboardId);
    saveAllDashboards(filteredDashboards);
    console.log('Dashboard removed from storage:', dashboardId);
  } catch (error) {
    console.error('Error removing dashboard:', error);
    throw new Error('Failed to remove dashboard');
  }
};

/**
 * Get a specific dashboard by ID
 * @param {String} dashboardId - ID of the dashboard to retrieve
 * @returns {Object|null} Dashboard object or null if not found
 */
export const getDashboardById = (dashboardId) => {
  try {
    const dashboards = getSavedDashboards();
    return dashboards.find(d => d.id === dashboardId) || null;
  } catch (error) {
    console.error('Error getting dashboard by ID:', error);
    return null;
  }
};

/**
 * Get dashboards by type
 * @param {String} dashboardType - Type of dashboard to filter by
 * @returns {Array} Array of dashboards of the specified type
 */
export const getDashboardsByType = (dashboardType) => {
  try {
    const dashboards = getSavedDashboards();
    return dashboards.filter(d => d.type === dashboardType);
  } catch (error) {
    console.error('Error getting dashboards by type:', error);
    return [];
  }
};

/**
 * Check if a dashboard can be removed (not a default dashboard)
 * @param {String} dashboardId - ID of the dashboard to check
 * @returns {Boolean} True if dashboard can be removed, false otherwise
 */
export const canRemoveDashboard = (dashboardId) => {
  try {
    const dashboard = getDashboardById(dashboardId);
    return dashboard && !dashboard.isDefault;
  } catch (error) {
    console.error('Error checking if dashboard can be removed:', error);
    return false;
  }
};

/**
 * Clear all custom dashboards (keeps default dashboards)
 */
export const clearCustomDashboards = () => {
  try {
    saveAllDashboards(DEFAULT_DASHBOARDS);
    console.log('Cleared all custom dashboards from storage');
  } catch (error) {
    console.error('Error clearing custom dashboards:', error);
  }
};

/**
 * Reset all dashboards to defaults
 */
export const resetAllDashboards = () => {
  try {
    localStorage.removeItem(DASHBOARDS_KEY);
    console.log('Reset all dashboards to defaults');
  } catch (error) {
    console.error('Error resetting dashboards:', error);
  }
};

/**
 * Export dashboard configuration
 * @returns {String} JSON string of all dashboards
 */
export const exportDashboards = () => {
  try {
    const dashboards = getSavedDashboards();
    return JSON.stringify(dashboards, null, 2);
  } catch (error) {
    console.error('Error exporting dashboards:', error);
    throw new Error('Failed to export dashboards');
  }
};

/**
 * Import dashboard configuration
 * @param {String} dashboardsJson - JSON string of dashboards to import
 */
export const importDashboards = (dashboardsJson) => {
  try {
    const dashboards = JSON.parse(dashboardsJson);
    
    if (!Array.isArray(dashboards)) {
      throw new Error('Invalid dashboard format');
    }
    
    // Validate required fields
    dashboards.forEach(dashboard => {
      if (!dashboard.id || !dashboard.type || !dashboard.title) {
        throw new Error('Invalid dashboard structure');
      }
    });
    
    saveAllDashboards(dashboards);
    console.log('Dashboards imported successfully');
  } catch (error) {
    console.error('Error importing dashboards:', error);
    throw new Error('Failed to import dashboards');
  }
};
