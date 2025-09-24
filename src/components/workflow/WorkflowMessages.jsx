import { useRef, useEffect } from "react";
import { Loader } from "lucide-react";

const WorkflowMessages = ({ 
  messages, 
  step, 
  isUserScrolling, 
  onScroll 
}) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (!isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // Only auto-scroll if user is at the bottom or it's the first message
    if (messages.length === 1 || !isUserScrolling) {
      scrollToBottom();
    }
  }, [messages, isUserScrolling]);

  return (
    <div 
      ref={messagesContainerRef}
      onScroll={onScroll}
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
  );
};

export default WorkflowMessages;
