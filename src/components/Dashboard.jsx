import { useState } from "react";
import { PlusCircle } from "lucide-react";

function Widget({ title, content, loading }) {
  return (
    <div className="rounded-2xl bg-indigo-100 shadow p-4 w-full h-60 flex flex-col">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="flex-1 overflow-auto text-sm text-gray-700">
        {loading ? "Loading..." : content.split('\n').map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const [widgets, setWidgets] = useState([
    { 
      id: 1, 
      title: "Top Prioritized Tasks", 
      content: `
            1. Complete project report
            2. Review team feedback
            3. Update client on progress
            4. Plan next sprint
            5. Organize team meeting
        `, 
      loading: false 
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");

  const addWidget = () => {
    setWidgets([
      ...widgets,
      { id: widgets.length + 1, title: newPrompt, content: "Fetching data...", loading: true }
    ]);
    setShowModal(false);
    setNewPrompt("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Prioritize your tasks</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg shadow hover:bg-purple-700"
        >
          <PlusCircle className="mr-2" size={20} />
          Add Widget
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {widgets.map(w => (
          <Widget key={w.id} title={w.title} content={w.content} loading={w.loading} />
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
