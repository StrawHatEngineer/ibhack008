import { Send, Loader } from "lucide-react";

const WorkflowInitialStep = ({
  widgetName,
  setWidgetName,
  initialPrompt,
  setInitialPrompt,
  error,
  loading,
  onClose,
  onSubmit
}) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Widget Name
      </label>
      <input
        type="text"
        value={widgetName}
        onChange={(e) => setWidgetName(e.target.value)}
        placeholder="Enter a name for your widget (e.g., 'Recent Important Emails')"
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
      />
    </div>
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
        onClick={onClose}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        onClick={onSubmit}
        disabled={loading || !widgetName.trim() || !initialPrompt.trim()}
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
            Start Widget
          </>
        )}
      </button>
    </div>
  </div>
);

export default WorkflowInitialStep;
