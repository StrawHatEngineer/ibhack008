import { memo } from "react";
import { PlusCircle, Mail, Settings, X } from "lucide-react";
import EmailWidget from "./widgets/EmailWidget";


const EmailDashboard = memo(function EmailDashboard({ 
  widgets, 
  onUpdateWidget, 
  onDeleteWidget,
  onRunWorkflow, 
  onShowModal,
  onShowConnectionsModal,
  workflowStatus,
  statusMessage,
  dashboardId,
  connectedTools,
  onRemoveDashboard,
  canRemove 
}) {
  // Filter widgets that belong to this dashboard
  // First check for dashboardId match, fallback to title-based filtering for backwards compatibility
  const emailWidgets = widgets.filter(widget => {
    // If widget has a dashboardId, check if it matches this dashboard
    if (widget.dashboardId) {
      return widget.dashboardId === dashboardId;
    }
    // Fallback to title-based filtering for widgets without dashboardId
    return widget.title.toLowerCase().includes('email') || 
           widget.title.toLowerCase().includes('mail');
  });


  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-blue-800 flex items-center">
            <Mail className="mr-3 w-7 h-7" />
            Email Management
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onShowConnectionsModal}
            className="flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg shadow hover:bg-gray-200 transition-colors"
            title="Manage connections"
          >
            <Settings className="mr-2" size={18} />
            <span className="hidden sm:inline">Connections</span>
          </button>
          <button
            onClick={onShowModal}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="mr-2" size={20} />
            Add Widget
          </button>
          {canRemove && (
            <button
              onClick={onRemoveDashboard}
              className="flex items-center bg-red-500 text-white px-3 py-2 rounded-lg shadow hover:bg-red-600 transition-colors"
              title="Close Dashboard"
            >
              <X className="mr-1" size={16} />
              <span className="hidden sm:inline">Remove</span>
            </button>
          )}
        </div>
      </div>

      {emailWidgets.length === 0 ? (
        <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl p-12 text-center">
          <Mail className="mx-auto w-16 h-16 text-blue-300 mb-4" />
          <h3 className="text-xl font-semibold text-blue-800 mb-2">No Email Widgets Yet</h3>
          <p className="text-blue-600 mb-4">Create your first email workflow to start managing your inbox efficiently.</p>
          <button
            onClick={onShowModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Widget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {emailWidgets.map((widget, index) => (
            <EmailWidget 
              key={`email-${widget.id}-${index}`} 
              title={widget.title} 
              content={widget.content} 
              loading={widget.loading} 
              workflowId={widget.workflowId}
              widgetId={widget.id}
              onContentUpdate={(newContent) => onUpdateWidget(widget.id, newContent)}
              onDeleteWidget={onDeleteWidget}
              onRunWorkflow={onRunWorkflow}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default EmailDashboard;
