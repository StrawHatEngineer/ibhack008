import React, { useState } from 'react';
import { Wifi, X, Info, Mail, FileSpreadsheet, HardDrive, FileText } from 'lucide-react';

const ConnectionStatusModal = ({ isOpen, onClose }) => {
  const connectedTools = [
    {
      id: 'gmail',
      name: 'gmail',
      icon: Mail,
      connected: true,
      iconColor: 'text-red-500'
    },
    {
      id: 'googlesheets',   
      name: 'googlesheets',
      icon: FileSpreadsheet,
      connected: true,
      iconColor: 'text-green-500'
    },
    {
      id: 'googledrive',
      name: 'googledrive',
      icon: HardDrive,
      connected: true,
      iconColor: 'text-blue-500'
    },
    {
      id: 'googledocs',
      name: 'googledocs',
      icon: FileText,   
      connected: true,
      iconColor: 'text-blue-600'
    }
  ];

  const connectedCount = connectedTools.filter(tool => tool.connected).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-[500px] max-w-[90vw] shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Status</h2>
            <p className="text-gray-600 text-lg">
              {connectedCount} of {connectedTools.length} tools connected
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Connected Tools List */}
        <div className="space-y-4">
          {connectedTools.map((tool) => (
            <div 
              key={tool.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <tool.icon className={`w-5 h-5 ${tool.iconColor}`} />
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-800 font-medium text-lg">{tool.name}</span>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Info size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {tool.connected && (
                  <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full border border-green-200">
                    CONNECTED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>All connections secured with OAuth 2.0</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live sync active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ConnectionStatus = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Connection Status Icon */}
      <div className="fixed top-6 right-6 z-40">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
          title="Connection Status"
        >
          <div className="relative">
            <Wifi size={20} />
            {/* Connection indicator dot */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        </button>
      </div>

      {/* Connection Status Modal */}
      <ConnectionStatusModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default ConnectionStatus;
