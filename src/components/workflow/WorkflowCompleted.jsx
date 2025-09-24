const WorkflowCompleted = ({
  onClose,
  onComplete
}) => (
  <div className="border-t pt-4">
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
      <p className="text-sm text-green-700">
        Workflow completed successfully!
      </p>
    </div>
    <div className="flex justify-end gap-3">
      <button
        onClick={onClose}
        className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Close
      </button>
      <button
        onClick={onComplete}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add to Dashboard
      </button>
    </div>
  </div>
);

export default WorkflowCompleted;
