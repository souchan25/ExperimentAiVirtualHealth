import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { chatService } from '../api/service';

const FloatingAssistant = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi there! I'm the Virtual Health System Guide. How can I help you navigate the app today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
    } else {
      setIsOpen(false);
    }
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Filter out the initial greeting if we just want strictly conversation history
      const history = messages.length > 1 ? messages.slice(1) : [];
      const response = await chatService.sendSystemMessage(userMsg.content, history);
      
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    } catch (error) {
      console.error('System chat error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the system guide.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div 
          className={`bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/80 flex flex-col overflow-hidden transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) transform origin-bottom-right mb-5 ${
            isMinimized ? 'h-16 w-80 scale-95 opacity-90' : 'h-[550px] w-[340px] sm:w-[400px] scale-100 opacity-100'
          }`}
        >
          {/* Header */}
          <div 
            className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-4 flex items-center justify-between cursor-pointer shadow-md relative z-10 border-b border-white/10"
            onClick={toggleMinimize}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-inner border border-white/20">
                <Bot size={22} className="text-white relative z-10" />
              </div>
              <div>
                <span className="block font-bold text-[15px] tracking-wide text-white/95">System Guide</span>
                <span className="block text-[10px] text-emerald-100/80 font-medium uppercase tracking-wider mt-0.5">Online • Ready to help</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button 
                onClick={toggleMinimize}
                className="p-1 hover:bg-emerald-700 rounded transition-colors"
                title={isMinimized ? "Maximize" : "Minimize"}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="p-1 hover:bg-emerald-700 text-white rounded transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                  >
                    <div 
                      className={`max-w-[85%] rounded-3xl px-5 py-3.5 text-[14px] leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${
                        msg.role === 'user' 
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-br-sm border border-emerald-400/20' 
                          : 'bg-white/90 backdrop-blur-md border border-slate-100/60 text-slate-700 rounded-bl-sm drop-shadow-sm prose prose-sm prose-emerald prose-p:my-1 prose-ul:my-1 prose-li:my-0'
                      }`}
                      dangerouslySetInnerHTML={{ 
                        __html: msg.content
                          .replace(/\n\n/g, '</p><p>')
                          .replace(/- ([^\n]+)/g, '<li>$1</li>')
                          .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc pl-4 space-y-1.5 my-2 marker:text-emerald-500">$1</ul>')
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }}
                    />
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border rounded-2xl px-4 py-3 shadow-sm rounded-bl-sm flex space-x-2 items-center">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 flex items-center gap-3 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 bg-slate-100/80 border border-transparent rounded-full px-5 py-3 text-sm focus:bg-white focus:border-emerald-300/50 focus:ring-4 focus:ring-emerald-500/10 flex-1 min-w-0 transition-all duration-300 outline-none text-slate-700 placeholder:text-slate-400"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-500 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_14px_rgba(16,185,129,0.3)] flex-shrink-0"
                >
                  <Send size={18} className={!input.trim() || isLoading ? "" : "translate-x-0.5 -translate-y-0.5"} />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group relative bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-full p-4 shadow-[0_8px_30px_rgb(16,185,129,0.3)] hover:shadow-[0_8px_40px_rgb(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 ring-4 ring-emerald-50/50 backdrop-blur-sm"
        >
          <img 
            src="/robot.png" 
            alt="AI Assistant" 
            className="w-11 h-11 object-contain drop-shadow-lg relative z-10 group-hover:scale-110 transition-transform duration-300 animate-pulse-slow"
            hidden={false}
          />
          {/* Tooltip */}
          <div className="absolute right-full mr-5 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-800/90 backdrop-blur-md text-white text-xs font-semibold rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
            Need help navigating?
          </div>
        </button>
      )}
    </div>
  );
};

export default FloatingAssistant;
