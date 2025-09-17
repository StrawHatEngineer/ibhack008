import { useState, useEffect } from "react";
import { X, Plus, Trash2, Settings, Check, AlertCircle } from "lucide-react";
import { 
  getDashboardConnections, 
  toggleConnection, 
  addCustomConnection, 
  removeConnection,
  AVAILABLE_COLORS,
  AVAILABLE_ICONS
} from "../utils/connectionsStorage";

const ConnectionsModal = ({ isOpen, onClose, dashboardType, dashboardTitle, onConnectionsUpdate }) => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConnection, setNewConnection] = useState({
    name: "",
    icon: "🔧",
    color: "bg-gray-500"
  });

  useEffect(() => {
    if (isOpen && dashboardType) {
      loadConnections();
    }
  }, [isOpen, dashboardType]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const dashboardConnections = getDashboardConnections(dashboardType);
      setConnections(dashboardConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConnection = async (connectionId) => {
    try {
      setError("");
      await toggleConnection(dashboardType, connectionId);
      
      // Update local state
      setConnections(prev => prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, connected: !conn.connected }
          : conn
      ));
      
      // Notify parent component
      if (onConnectionsUpdate) {
        onConnectionsUpdate();
      }
    } catch (error) {
      console.error('Error toggling connection:', error);
      setError('Failed to update connection');
    }
  };

  const handleAddConnection = async () => {
    if (!newConnection.name.trim()) {
      setError("Please enter a connection name");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      const addedConnection = await addCustomConnection(dashboardType, {
        ...newConnection,
        connected: true
      });
      
      // Update local state
      setConnections(prev => [...prev, addedConnection]);
      
      // Reset form
      setNewConnection({
        name: "",
        icon: "🔧",
        color: "bg-gray-500"
      });
      setShowAddForm(false);
      
      // Notify parent component
      if (onConnectionsUpdate) {
        onConnectionsUpdate();
      }
    } catch (error) {
      console.error('Error adding connection:', error);
      setError('Failed to add connection');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      setError("");
      await removeConnection(dashboardType, connectionId);
      
      // Update local state
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      
      // Notify parent component
      if (onConnectionsUpdate) {
        onConnectionsUpdate();
      }
    } catch (error) {
      console.error('Error removing connection:', error);
      setError('Failed to remove connection');
    }
  };

  const handleClose = () => {
    setShowAddForm(false);
    setNewConnection({
      name: "",
      icon: "🔧",
      color: "bg-gray-500"
    });
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Manage Connections
              </h2>
              <p className="text-sm text-gray-500">
                {dashboardTitle} Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          {loading && !connections.length ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading connections...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Current Connections */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Connected Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className={`border rounded-lg p-4 transition-all duration-200 ${
                        connection.connected 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg ${connection.color} flex items-center justify-center text-white text-lg`}>
                            {connection.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {connection.name}
                            </h4>
                            <p className={`text-sm ${
                              connection.connected ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {connection.connected ? 'Connected' : 'Disconnected'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleConnection(connection.id)}
                            className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                              connection.connected
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {connection.connected && <Check className="w-4 h-4 mr-1" />}
                            {connection.connected ? 'Connected' : 'Connect'}
                          </button>
                          {connection.isCustom && (
                            <button
                              onClick={() => handleRemoveConnection(connection.id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                              title="Remove custom connection"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Connection */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Add Custom Tool</h3>
                  {!showAddForm && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Tool</span>
                    </button>
                  )}
                </div>

                {showAddForm && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tool Name
                        </label>
                        <input
                          type="text"
                          value={newConnection.name}
                          onChange={(e) => setNewConnection(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Notion, Airtable, Custom API"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Icon
                          </label>
                          <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {AVAILABLE_ICONS.map((icon) => (
                              <button
                                key={icon}
                                onClick={() => setNewConnection(prev => ({ ...prev, icon }))}
                                className={`w-8 h-8 rounded-md flex items-center justify-center text-lg transition-colors ${
                                  newConnection.icon === icon
                                    ? 'bg-indigo-100 border-2 border-indigo-500'
                                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                                }`}
                              >
                                {icon}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Color
                          </label>
                          <div className="grid grid-cols-5 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-lg p-2">
                            {AVAILABLE_COLORS.map((color) => (
                              <button
                                key={color}
                                onClick={() => setNewConnection(prev => ({ ...prev, color }))}
                                className={`w-8 h-8 rounded-md ${color} transition-all ${
                                  newConnection.color === color
                                    ? 'ring-2 ring-offset-2 ring-gray-400'
                                    : 'hover:ring-2 hover:ring-offset-1 hover:ring-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddConnection}
                          disabled={loading || !newConnection.name.trim()}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                          <span>Add Tool</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {connections.filter(c => c.connected).length} of {connections.length} tools connected
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsModal;
