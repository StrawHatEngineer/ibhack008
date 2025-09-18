// Utility functions for managing dashboard connections in localStorage

const CONNECTIONS_KEY = 'dashboard_connections';

// Default connections for each dashboard type
const DEFAULT_CONNECTIONS = {
  email: [
    { id: 'gmail', name: 'Gmail', icon: '✉️', color: 'bg-red-500', connected: true },
  ],
  github: [
    { id: 'github', name: 'GitHub', icon: '🐙', color: 'bg-gray-800', connected: true },
  ],
  slack: [
    { id: 'slack', name: 'Slack', icon: '💬', color: 'bg-purple-500', connected: true },
  ],
  aihub: [
    { id: 'aihub', name: 'AI Hub', icon: '🤖', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', connected: true },
  ],
  custom: [
  ]
};

/**
 * Get all connections from localStorage
 * @returns {Object} Object with dashboardId as keys and connections as values
 */
export const getAllConnections = () => {
  try {
    const stored = localStorage.getItem(CONNECTIONS_KEY);
    const connections = stored ? JSON.parse(stored) : {};
    
    // Initialize with defaults if not present
    Object.keys(DEFAULT_CONNECTIONS).forEach(dashboardType => {
      if (!connections[dashboardType]) {
        connections[dashboardType] = [...DEFAULT_CONNECTIONS[dashboardType]];
      }
    });
    
    return connections;
  } catch (error) {
    console.error('Error reading connections from storage:', error);
    return { ...DEFAULT_CONNECTIONS };
  }
};

/**
 * Get connections for a specific dashboard
 * @param {String} dashboardType - Type of dashboard (email, github, slack, custom)
 * @returns {Array} Array of connection objects
 */
export const getDashboardConnections = (dashboardType) => {
  try {
    const allConnections = getAllConnections();
    return allConnections[dashboardType] || [];
  } catch (error) {
    console.error('Error getting dashboard connections:', error);
    return DEFAULT_CONNECTIONS[dashboardType] || [];
  }
};

/**
 * Save connections for all dashboards
 * @param {Object} connections - Object with all dashboard connections
 */
export const saveAllConnections = (connections) => {
  try {
    localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
    console.log('Connections saved to storage');
  } catch (error) {
    console.error('Error saving connections to storage:', error);
    throw new Error('Failed to save connections');
  }
};

/**
 * Update connections for a specific dashboard
 * @param {String} dashboardType - Type of dashboard
 * @param {Array} connections - Array of connection objects
 */
export const updateDashboardConnections = (dashboardType, connections) => {
  try {
    const allConnections = getAllConnections();
    allConnections[dashboardType] = connections;
    saveAllConnections(allConnections);
    console.log(`Updated connections for ${dashboardType} dashboard`);
  } catch (error) {
    console.error('Error updating dashboard connections:', error);
    throw new Error('Failed to update connections');
  }
};

/**
 * Toggle connection status for a specific tool
 * @param {String} dashboardType - Type of dashboard
 * @param {String} connectionId - ID of the connection to toggle
 */
export const toggleConnection = (dashboardType, connectionId) => {
  try {
    const connections = getDashboardConnections(dashboardType);
    const updatedConnections = connections.map(conn => 
      conn.id === connectionId 
        ? { ...conn, connected: !conn.connected }
        : conn
    );
    updateDashboardConnections(dashboardType, updatedConnections);
    console.log(`Toggled connection ${connectionId} for ${dashboardType} dashboard`);
  } catch (error) {
    console.error('Error toggling connection:', error);
    throw new Error('Failed to toggle connection');
  }
};

/**
 * Add a new custom connection
 * @param {String} dashboardType - Type of dashboard
 * @param {Object} newConnection - New connection object
 */
export const addCustomConnection = (dashboardType, newConnection) => {
  try {
    const connections = getDashboardConnections(dashboardType);
    
    // Generate unique ID if not provided
    const id = newConnection.id || `custom_${Date.now()}`;
    
    const connectionToAdd = {
      id,
      name: newConnection.name || 'Custom Tool',
      icon: newConnection.icon || '🔧',
      color: newConnection.color || 'bg-gray-500',
      connected: newConnection.connected || false,
      isCustom: true,
      // New fields for custom tools
      baseUrl: newConnection.baseUrl || '',
      token: newConnection.token || '',
      documentation: newConnection.documentation || ''
    };
    
    const updatedConnections = [...connections, connectionToAdd];
    updateDashboardConnections(dashboardType, updatedConnections);
    console.log(`Added custom connection ${connectionToAdd.name} to ${dashboardType} dashboard`);
    return connectionToAdd;
  } catch (error) {
    console.error('Error adding custom connection:', error);
    throw new Error('Failed to add custom connection');
  }
};

/**
 * Remove a connection
 * @param {String} dashboardType - Type of dashboard
 * @param {String} connectionId - ID of the connection to remove
 */
export const removeConnection = (dashboardType, connectionId) => {
  try {
    const connections = getDashboardConnections(dashboardType);
    const updatedConnections = connections.filter(conn => conn.id !== connectionId);
    updateDashboardConnections(dashboardType, updatedConnections);
    console.log(`Removed connection ${connectionId} from ${dashboardType} dashboard`);
  } catch (error) {
    console.error('Error removing connection:', error);
    throw new Error('Failed to remove connection');
  }
};

/**
 * Get connected tools for a dashboard (only those marked as connected)
 * @param {String} dashboardType - Type of dashboard
 * @returns {Array} Array of connected tools
 */
export const getConnectedTools = (dashboardType) => {
  try {
    const connections = getDashboardConnections(dashboardType);
    return connections.filter(conn => conn.connected);
  } catch (error) {
    console.error('Error getting connected tools:', error);
    return [];
  }
};

/**
 * Reset connections for a dashboard to defaults
 * @param {String} dashboardType - Type of dashboard
 */
export const resetDashboardConnections = (dashboardType) => {
  try {
    const defaultConnections = DEFAULT_CONNECTIONS[dashboardType] || [];
    updateDashboardConnections(dashboardType, [...defaultConnections]);
    console.log(`Reset connections for ${dashboardType} dashboard to defaults`);
  } catch (error) {
    console.error('Error resetting dashboard connections:', error);
    throw new Error('Failed to reset connections');
  }
};

/**
 * Clear all connections
 */
export const clearAllConnections = () => {
  try {
    localStorage.removeItem(CONNECTIONS_KEY);
    console.log('Cleared all connections from storage');
  } catch (error) {
    console.error('Error clearing connections:', error);
  }
};

// Available colors for custom connections
export const AVAILABLE_COLORS = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-gray-500', 'bg-orange-500', 'bg-teal-500',
  'bg-cyan-500', 'bg-emerald-500', 'bg-lime-500', 'bg-amber-500', 'bg-violet-500'
];

// Available icons for custom connections
export const AVAILABLE_ICONS = [
  '🔧', '⚙️', '🛠️', '📱', '💻', '🌐', '📊', '📈', '📉', '💼',
  '📋', '📝', '📄', '📁', '📦', '🎯', '⚡', '🔗', '🔐', '🚀',
  '💡', '🎨', '🎵', '📸', '🎬', '📺', '📡', '🎮', '🎯', '🔮'
];
