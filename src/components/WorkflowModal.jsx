import { useState, useRef, useEffect } from "react";
import { X, Send, MessageCircle, Loader } from "lucide-react";
import { saveWorkflow } from "../utils/workflowStorage";
import { getConnectedTools } from "../utils/connectionsStorage";

// Utility function to extract first 100 characters from prompt for title
const extractShortTitle = (prompt, maxLength = 100) => {
  if (!prompt || typeof prompt !== 'string') return 'New Workflow';
  const cleanPrompt = prompt.trim();
  if (cleanPrompt.length <= maxLength) return cleanPrompt;
  return cleanPrompt.substring(0, maxLength) + '...';
};

export default function WorkflowModal({ isOpen, onClose, onWorkflowComplete, dashboardId, dashboardType }) {
  const [step, setStep] = useState("initial");
  const [initialPrompt, setInitialPrompt] = useState("");
  const [userInput, setUserInput] = useState("");
  const [workflowId, setWorkflowId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const waitingForInputRef = useRef(false);
  const [connectedTools, setConnectedTools] = useState([]);

  const scrollToBottom = () => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const checkIfUserIsAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
      return isAtBottom;
    }
    return true;
  };

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const isAtBottom = checkIfUserIsAtBottom();
      setIsUserScrolling(!isAtBottom);
    }
  };

  useEffect(() => {
    // Only auto-scroll if user is at the bottom or it's the first message
    if (messages.length === 1 || !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling]);

  // Load connected tools when modal opens
  useEffect(() => {
    if (isOpen && dashboardType) {
      const tools = getConnectedTools(dashboardType);
      setConnectedTools(tools);
    }
  }, [isOpen, dashboardType]);

  const resetModal = () => {
    setStep("initial");
    setInitialPrompt("");
    setUserInput("");
    setWorkflowId("");
    setMessages([]);
    setLoading(false);
    setError("");
    waitingForInputRef.current = false;
    setConnectedTools([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const createWorkflow = async (prompt) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch("https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          "ib-context": "ibhack008",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: prompt,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const newWorkflowId = data.workflow_id;
      
      if (!newWorkflowId) {
        throw new Error("No workflow ID returned from API");
      }

      setWorkflowId(newWorkflowId);
      
      // Save the workflow to storage
      try {
        saveWorkflow({
          id: newWorkflowId,
          title: extractShortTitle(prompt),
          createdAt: new Date().toISOString(),
          dashboardId: dashboardId || null,
          dashboardType: dashboardType || null
        });
      } catch (error) {
        console.error('Error saving workflow to storage:', error);
        // Don't block the workflow creation if storage fails
      }
      
      setStep("streaming");
      startStreaming(newWorkflowId);
      
    } catch (error) {
      console.error("Error creating workflow:", error);
      setError(`Failed to create workflow: ${error.message}`);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const startStreaming = async (wfId) => {
    setMessages([]);
    
    try {
      // Prepare custom tools information for the API
      const customToolsInfo = connectedTools
        .filter(tool => tool.isCustom)
        .map(tool => ({
          name: tool.name,
          baseUrl: tool.baseUrl,
          token: tool.token,
          documentation: tool.documentation
        }));

      // Create the directive with custom tools context
      let directiveWithContext = initialPrompt;
      if (customToolsInfo.length > 0) {
        directiveWithContext += `\n\nDetails:\n${JSON.stringify(customToolsInfo, null, 2)}`;
      }

      const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${wfId}/directive/stream`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          "ib-context": "ibhack008",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directive: directiveWithContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonStr = line.replace("data:", "").trim();
              if (jsonStr && jsonStr !== "[DONE]") {
                const data = JSON.parse(jsonStr);
                setMessages((prev) => [...prev, data]);
                
                // Check if workflow is requesting user input
                if (data.type === "human_input") {
                  console.log("🔄 Human input requested:", data);
                  try {
                    // Parse the message JSON to extract clarification details
                    const inputRequests = JSON.parse(data.message);
                    if (Array.isArray(inputRequests) && inputRequests.length > 0) {
                      const request = inputRequests[0];
                      const prompt = request.prompt;
                      
                      console.log("📝 Clarification details:", { prompt });
                      
                      waitingForInputRef.current = true;
                      // Add a user-friendly prompt message to display
                      setMessages((prev) => [...prev, {
                        type: "clarification_request",
                        message: prompt
                      }]);
                      setStep("waiting_input");
                      console.log("⏸️ Step set to waiting_input");
                      return; // Stop streaming, wait for user input
                    }
                  } catch (err) {
                    console.error("Error parsing human input request:", err);
                  }
                }
                
                // Check if stream is ending (might be due to waiting for input)
                if (data.type === "stream_end") {
                  console.log("🔚 Stream ended, waitingForInput:", waitingForInputRef.current);
                  // If we just set waiting for input, don't mark as completed
                  if (waitingForInputRef.current) {
                    console.log("⏸️ Staying in waiting_input state");
                    return; // Stop streaming, stay in waiting_input state
                  }
                  // Otherwise, workflow might be complete
                  console.log("✅ Workflow completed");
                  setStep("completed");
                  return;
                }
                
                // Check if workflow is complete
                if (data.type === "workflow_complete" || data.status === "complete") {
                  setStep("completed");
                  return;
                }
              }
            } catch (err) {
              console.error("Invalid JSON:", line, err);
            }
          }
        }
      }
      
      // If we reach here without explicit completion, mark as completed
      setStep("completed");
      
    } catch (error) {
      console.error("Error during streaming:", error);
      setError(`Streaming error: ${error.message}`);
      setStep("error");
    }
  };

  const continueStreaming = async (wfId) => {
    try {
      const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${wfId}/directive/stream`, {
        method: "POST", 
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          "ib-context": "ibhack008",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          directive: "", // Empty directive to just monitor
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonStr = line.replace("data:", "").trim();
              if (jsonStr && jsonStr !== "[DONE]") {
                const data = JSON.parse(jsonStr);
                setMessages((prev) => [...prev, data]);
                
                // Check if workflow is requesting user input again
                if (data.type === "human_input") {
                  console.log("🔄 Another human input requested:", data);
                  try {
                    const inputRequests = JSON.parse(data.message);
                    if (Array.isArray(inputRequests) && inputRequests.length > 0) {
                      const request = inputRequests[0];
                      const prompt = request.prompt;
                      
                      waitingForInputRef.current = true;
                      setMessages((prev) => [...prev, {
                        type: "clarification_request",
                        message: prompt
                      }]);
                      setStep("waiting_input");
                      return; // Stop streaming, wait for user input
                    }
                  } catch (err) {
                    console.error("Error parsing human input request:", err);
                  }
                }
                
                // Check if stream is ending
                if (data.type === "stream_end") {
                  console.log("🔚 Stream ended after resume");
                  if (waitingForInputRef.current) {
                    return; // Waiting for more input
                  }
                  setStep("completed");
                  return;
                }
                
                // Check if workflow is complete
                if (data.type === "workflow_complete" || data.status === "complete") {
                  setStep("completed");
                  return;
                }
              }
            } catch (err) {
              console.error("Invalid JSON:", line, err);
            }
          }
        }
      }
      
      // If we reach here, mark as completed
      setStep("completed");
      
    } catch (error) {
      console.error("Error continuing stream:", error);
      setError(`Error continuing workflow: ${error.message}`);
      setStep("error");
    }
  };

  const resumeWorkflow = async () => {
    if (!userInput.trim()) {
      setError("Please provide input to continue");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare custom tools information for resume context
      const customToolsInfo = connectedTools
        .filter(tool => tool.isCustom)
        .map(tool => ({
          name: tool.name,
          baseUrl: tool.baseUrl,
          token: tool.token,
          documentation: tool.documentation
        }));

      // Create user input with custom tools context if needed
      let userInputWithContext = userInput;
      if (customToolsInfo.length > 0) {
        userInputWithContext += `\n\nAvailable Custom Tools:\n${JSON.stringify(customToolsInfo, null, 2)}`;
      }

      const response = await fetch(`https://https--ibhack008-instabase.instabase.site.sandboxes.run/api/v2/aihub/workflows/${workflowId}/resume`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_API_TOKEN}`,
          "ib-context": "ibhack008",
        },
        body: JSON.stringify({
          user_input: userInputWithContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // Add user input to messages
      setMessages(prev => [...prev, {
        type: "user_input",
        message: userInput,
        timestamp: new Date().toISOString()
      }]);

      setUserInput("");
      waitingForInputRef.current = false;
      setStep("streaming"); // Ensure the step is set to streaming after resuming

      // Process the streaming response
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const jsonStr = line.replace("data:", "").trim();
              if (jsonStr && jsonStr !== "[DONE]") {
                const data = JSON.parse(jsonStr);
                setMessages((prev) => [...prev, data]);

                // Check if workflow is requesting user input again
                if (data.type === "human_input") {
                  console.log("🔄 Another human input requested:", data);
                  try {
                    const inputRequests = JSON.parse(data.message);
                    if (Array.isArray(inputRequests) && inputRequests.length > 0) {
                      const request = inputRequests[0];
                      const prompt = request.prompt;

                      waitingForInputRef.current = true;
                      setMessages((prev) => [...prev, {
                        type: "clarification_request",
                        message: prompt
                      }]);
                      setStep("waiting_input");
                      return; // Stop streaming, wait for user input
                    }
                  } catch (err) {
                    console.error("Error parsing human input request:", err);
                  }
                }

                // Check if stream is ending
                if (data.type === "stream_end") {
                  console.log("🔚 Stream ended after resume");
                  if (waitingForInputRef.current) {
                    return; // Waiting for more input
                  }
                  setStep("completed");
                  return;
                }

                // Check if workflow is complete
                if (data.type === "workflow_complete" || data.status === "complete") {
                  setStep("completed");
                  return;
                }
              }
            } catch (err) {
              console.error("Invalid JSON:", line, err);
            }
          }
        }
      }

      // If we reach here, mark as completed
      setStep("completed");

    } catch (error) {
      console.error("Error resuming workflow:", error);
      setError(`Failed to resume workflow: ${error.message}`);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSubmit = () => {
    if (!initialPrompt.trim()) {
      setError("Please enter an initial prompt");
      return;
    }
    createWorkflow(initialPrompt);
  };

  const handleComplete = () => {
    if (onWorkflowComplete && messages.length > 0) {
      // Get the final result from messages
      const finalResult = messages[messages.length - 1];
      onWorkflowComplete(finalResult, workflowId);
    }
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {step === "initial" && "Create New Workflow"}
            {step === "streaming" && "Workflow Running..."}
            {step === "waiting_input" && "Input Required"}
            {step === "completed" && "Workflow Completed"}
            {step === "error" && "Error"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-auto flex flex-col">
          {step === "initial" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Prompt
                </label>
                <textarea
                  value={initialPrompt}
                  onChange={(e) => setInitialPrompt(e.target.value)}
                  placeholder="Enter your workflow prompt (e.g., 'fetch my last 5 emails from gmail and rank them')"
                  className="w-full h-32 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={loading}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitialSubmit}
                  disabled={loading || !initialPrompt.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={16} />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2" size={16} />
                      Start Workflow
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {(step === "streaming" || step === "waiting_input" || step === "completed") && (
            <div className="flex flex-col h-full">
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-3 mb-4 bg-gray-50 rounded-lg p-4"
              >
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      msg.type === "user_input"
                        ? "bg-blue-100 ml-8"
                        : msg.type === "clarification_request"
                        ? "bg-yellow-50 border border-yellow-200"
                        : msg.type === "workflow_result"
                        ? "bg-green-50 border border-green-200"
                        : "bg-white shadow-sm"
                    }`}
                  >
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {msg.message}
                    </div>
                  </div>
                ))}
                
                {step === "streaming" && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader className="animate-spin mr-2" size={16} />
                    Processing...
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* User Input Section */}
              {step === "waiting_input" && (
                <div className="border-t pt-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-yellow-700 font-medium">
                      ⏸️ Workflow paused - waiting for your input
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Please provide the requested information to continue the workflow.
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your answer here... (e.g., Gmail, Outlook, etc.)"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === "Enter" && !loading && resumeWorkflow()}
                      disabled={loading}
                    />
                    <button
                      onClick={resumeWorkflow}
                      disabled={loading || !userInput.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {loading ? (
                        <Loader className="animate-spin" size={16} />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Completed Actions */}
              {step === "completed" && (
                <div className="border-t pt-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-green-700">
                      Workflow completed successfully!
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleClose}
                      className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleComplete}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add to Dashboard
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4">
                  {error}
                </div>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={resetModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
