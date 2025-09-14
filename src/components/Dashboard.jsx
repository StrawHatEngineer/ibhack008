import { useState, useEffect } from "react";
import { PlusCircle, RefreshCw } from "lucide-react";

function Widget({ title, content, loading, onContentUpdate }) {
  const handleEmailClick = (messageId) => {
    window.open(`https://mail.google.com/mail/u/0/#inbox/${messageId}`, '_blank');
  };

  const markAsRead = (index) => {
    console.log(`Item ${index} marked as read/done`);
    const updatedContent = content.filter((_, i) => i !== index);
    onContentUpdate(updatedContent);
  };

  const renderContent = () => {
    if (loading) return "Loading...";
    
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-2">
          {content.map((item, index) => {
            if (typeof item === 'object' && item !== null) {
              const emailSubject = item['email subject'] || item.subject || item.Subject || 'No Subject';
              const messageId = item['message_id'] || item.messageId || item.id || '';

              return (
                <li key={index} className="flex justify-between items-center">
                  <button
                    onClick={() => handleEmailClick(messageId)}
                    className="text-left w-full p-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer border-none bg-transparent"
                  >
                    • {emailSubject}
                  </button>
                  <button
                    onClick={() => markAsRead(index)}
                    className="ml-2 text-sm text-green-600 hover:text-green-800"
                  >
                    ✔️
                  </button>
                </li>
              );
            } else {
              return (
                <li key={index} className="flex justify-between items-center">
                  <button
                    onClick={() => handleEmailClick('')}
                    className="text-left w-full p-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer border-none bg-transparent"
                  >
                    • {String(item)}
                  </button>
                  <button
                    onClick={() => markAsRead(index)}
                    className="ml-2 text-sm text-green-600 hover:text-green-800"
                  >
                    ✔️
                  </button>
                </li>
              );
            }
          })}
        </ul>
      );
    } else if (typeof content === 'object' && content !== null) {
      const emailSubject = content['email subject'] || content.subject || content.Subject || 'No Subject';
      const messageId = content['message_id'] || content.messageId || content.id || '';
      return (
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleEmailClick(messageId)}
            className="text-left w-full p-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer border-none bg-transparent"
          >
            • {emailSubject}
          </button>
          <button
            onClick={() => markAsRead(0)}
            className="ml-2 text-sm text-green-600 hover:text-green-800"
          >
            ✔️
          </button>
        </div>
      );
    } else if (typeof content === 'string') {
      return (
        <ul className="space-y-2">
          {content.split('\n').map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <button
                onClick={() => handleEmailClick('')}
                className="text-left w-full p-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer border-none bg-transparent"
              >
                • {item}
              </button>
              <button
                onClick={() => markAsRead(index)}
                className="ml-2 text-sm text-green-600 hover:text-green-800"
              >
                ✔️
              </button>
            </li>
          ))}
        </ul>
      );
    } else {
      return (
        <div className="flex justify-between items-center">
          <button
            onClick={() => handleEmailClick('')}
            className="text-left w-full p-2 text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors cursor-pointer border-none bg-transparent"
          >
            • {String(content)}
          </button>
          <button
            onClick={() => markAsRead(0)}
            className="ml-2 text-sm text-green-600 hover:text-green-800"
          >
            ✔️
          </button>
        </div>
      );
    }
  };

  return (
    <div className="rounded-2xl bg-indigo-100 shadow p-4 w-full h-60 flex flex-col">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="flex-1 overflow-auto text-sm text-gray-700">
        {renderContent()}
      </div>
    </div>
  );
}

function Dashboard() {

  const [llmResponse, setLlmResponse] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");
  const [workflowStatus, setWorkflowStatus] = useState('idle'); 
  const [workflow_id, setWorkflowId] = useState('01994835-953f-7386-8069-30b18afbb8e1');
  const [statusMessage, setStatusMessage] = useState('');
  
  function parseLlmResponse(llmResponse) {
    const cleanStr = llmResponse.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanStr);
    const data = JSON.parse(parsed.llm_response);
    return data; 
  }

  const executeWorkflow = async () => {
    try {
      setWorkflowStatus('executing');
      setStatusMessage('Executing workflow...');
      console.log('Executing workflow...');
      
      const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflow_id}/execute`, {
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Workflow execution response:', data);
      
      // After successful execution, start polling for status
      setWorkflowStatus('running');
      setStatusMessage('Workflow is running...');
      pollWorkflowStatus();
      
    } catch (error) {
      console.error('Error executing workflow:', error);
      setWorkflowStatus('error');
      setStatusMessage(`Error executing workflow: ${error.message}`);
    }
  };

  const fetchWorkflowStatus = async () => {
    try {
      const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflow_id}/status`, {
        headers: {
          'Authorization': 'Bearer gvdNIYxMEEDW8jPp0Cbfq7DF9mGSHF',
          'ib-context': 'ibhack008'
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Workflow status response:', data);
      
      const status = data.status || 'unknown';
      setWorkflowStatus(status);
      
      if (status === 'complete') {
        setStatusMessage('Workflow completed successfully!');
        const nodes = data.dag.nodes;
        const secondLastNode = nodes[nodes.length - 2];
        let llmResponse = secondLastNode ? secondLastNode.result : null;
        if (llmResponse) {
          llmResponse = parseLlmResponse(llmResponse);
          console.log("coming", llmResponse.messages);
          setLlmResponse(llmResponse.messages);
          setWidgets([
            { 
              id: 1, 
              title: "Important Emails", 
              content: llmResponse.messages, 
              loading: false 
            }
          ]);
        }
        return true; // Status is complete
      } else if (status === 'running') {
        setStatusMessage('Workflow is still running...');
        setTimeout(pollWorkflowStatus, 3000);
        return false; // Continue polling
      } else if (status === 'failed' || status === 'error') {
        setStatusMessage('Workflow failed');
        return true; // Stop polling
      } else {
        setStatusMessage(`Workflow status: ${status}`);
        setTimeout(pollWorkflowStatus, 3000);
        return false; // Continue polling
      }
    } catch (error) {
      console.error('Error fetching workflow status:', error);
      setWorkflowStatus('error');
      setStatusMessage(`Error fetching status: ${error.message}`);
      return true; // Stop polling on error
    }
  };

  const pollWorkflowStatus = async () => {
    const poll = async () => {
      const isComplete = await fetchWorkflowStatus();
      if (!isComplete) {
        // Continue polling every 3 seconds
        setTimeout(poll, 3000);
      }
    };
    poll();
  };

  useEffect(() => {
    pollWorkflowStatus();
  }, []);

  const addWidget = () => {
    setWidgets([
      ...widgets,
      { id: widgets.length + 1, title: newPrompt, content: "Fetching data...", loading: true }
    ]);
    setShowModal(false);
    setNewPrompt("");
  };

  const updateWidgetContent = (id, newContent) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, content: newContent } : widget
    ));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prioritize your tasks</h1>
          {workflowStatus !== 'idle' && (
            <div className="flex items-center mt-2 text-sm">
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
        <div className="flex items-center gap-3">
          <button
            onClick={executeWorkflow}
            disabled={workflowStatus === 'executing' || workflowStatus === 'running'}
            className={`flex items-center px-4 py-2 rounded-lg shadow transition-colors ${
              workflowStatus === 'executing' || workflowStatus === 'running'
                ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <RefreshCw className={`mr-2 ${workflowStatus === 'executing' || workflowStatus === 'running' ? 'animate-spin' : ''}`} size={20} />
            Re-run Workflow
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Widget
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(w => (
          <Widget 
            key={w.id} 
            title={w.title} 
            content={w.content} 
            loading={w.loading} 
            onContentUpdate={(newContent) => updateWidgetContent(w.id, newContent)}
          />
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h2 className="text-lg font-bold mb-4">Add New Widget</h2>
            <input
              type="text"
              placeholder="Enter prompt"
              value={newPrompt}
              onChange={e => setNewPrompt(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addWidget}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
