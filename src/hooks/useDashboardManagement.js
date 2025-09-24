import { useState, useEffect } from 'react';
import { 
  getSavedDashboards, 
  addCustomDashboard, 
  updateDashboardTitle, 
  removeDashboard as removeDashboardFromStorage, 
  canRemoveDashboard 
} from '../utils/dashboardStorage';
import { getConnectedTools } from '../utils/connectionsStorage';

export const useDashboardManagement = () => {
  const [activeDashboards, setActiveDashboards] = useState([]);
  const [dashboardConnections, setDashboardConnections] = useState({});
  const [showConnectionsModal, setShowConnectionsModal] = useState(false);
  const [currentConnectionsDashboard, setCurrentConnectionsDashboard] = useState(null);

  // Load dashboards from storage
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

  // Load connections for all dashboards
  const loadAllConnections = () => {
    const connections = {};
    activeDashboards.forEach(dashboard => {
      connections[dashboard.type] = getConnectedTools(dashboard.type);
    });
    setDashboardConnections(connections);
  };

  // Function to add new dashboard
  const addNewDashboard = (dashboardType, dashboardConfig) => {
    const newId = `dashboard-${Date.now()}`;
    
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

  // Function to handle connections update
  const handleConnectionsUpdate = () => {
    loadAllConnections();
  };

  // Load dashboards and connections on component mount
  useEffect(() => {
    loadDashboardsFromStorage();
  }, []);

  // Load connections when active dashboards change
  useEffect(() => {
    loadAllConnections();
  }, [activeDashboards]);

  return {
    activeDashboards,
    dashboardConnections,
    showConnectionsModal,
    currentConnectionsDashboard,
    loadDashboardsFromStorage,
    loadAllConnections,
    addNewDashboard,
    removeDashboard,
    handleDashboardTitleChange,
    handleShowConnectionsModal,
    handleCloseConnectionsModal,
    handleConnectionsUpdate
  };
};
