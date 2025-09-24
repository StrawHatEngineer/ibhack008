import { Send, Loader } from "lucide-react";

const WorkflowUserInput = ({
  userInput,
  setUserInput,
  loading,
  onResume
}) => (
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
        onKeyPress={(e) => e.key === "Enter" && !loading && onResume()}
        disabled={loading}
      />
      <button
        onClick={onResume}
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
);

export default WorkflowUserInput;
