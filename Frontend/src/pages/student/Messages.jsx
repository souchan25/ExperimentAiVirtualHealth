import React, { useState, useEffect } from 'react';
import { messageService, authService } from '../../api/service';
import { 
  EnvelopeIcon, 
  PaperAirplaneIcon, 
  UserIcon, 
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const StudentMessages = () => {
  const [messages, setMessages] = useState([]);
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  
  const scrollRef = React.useRef(null);
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchInitialData();

    const intervalId = setInterval(fetchMessages, 5000);
    const onFocus = () => fetchMessages();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedStaff]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const staffData = await authService.getUsers();
      setStaff(staffData);
      
      // Select the first staff member by default if available
      if (staffData.length > 0 && !selectedStaff) {
        setSelectedStaff(staffData[0]);
        // Also fetch messages for this staff member
        const msgData = await messageService.getConversationMessages(staffData[0].id);
        setMessages(msgData);
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedStaff) return;
    try {
      const data = await messageService.getConversationMessages(selectedStaff.id);
      setMessages(data);
    } catch (err) {
      console.error('Polling error:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStaff) return;
    
    try {
      await messageService.sendMessage({
        recipient_id: selectedStaff.id,
        content: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const filteredConversation = messages;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden">
      {/* Staff Sidebar */}
      <div className={`${selectedStaff ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex-col overflow-hidden transition-all duration-300`}>
        <div className="p-4 md:p-6 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 font-sans flex items-center gap-2">
            <ChatBubbleLeftRightIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            Clinic Staff
          </h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Select a consultant</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
          {loading && staff.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 font-medium">Loading staff list...</div>
          ) : staff.length === 0 ? (
            <div className="text-center py-8 text-xs text-gray-400 font-medium">No staff members available.</div>
          ) : (
            staff.map(member => (
              <button
                key={member.id}
                onClick={() => {
                  setSelectedStaff(member);
                  // Immediately fetch messages for the new selection
                  messageService.getConversationMessages(member.id)
                    .then(setMessages)
                    .catch(console.error);
                }}
                className={`w-full flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl transition-all duration-200 ${
                  selectedStaff?.id === member.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 font-bold flex-shrink-0 ${
                  selectedStaff?.id === member.id ? 'bg-white/20' : 'bg-green-100 text-green-700'
                }`}>
                  {member.name[0]?.toUpperCase()}
                </div>
                <div className="text-left overflow-hidden">
                  <p className={`text-sm font-bold truncate ${selectedStaff?.id === member.id ? 'text-white' : 'text-gray-900'}`}>
                    {member.name}
                  </p>
                  <p className={`text-[10px] font-medium uppercase tracking-wider opacity-60`}>
                    Clinic Consultant
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${!selectedStaff ? 'hidden md:flex' : 'flex'} flex-1 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex-col h-full`}>
        {selectedStaff ? (
          <>
            {/* Chat Header */}
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-50 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                <button 
                  onClick={() => setSelectedStaff(null)}
                  className="p-2 -ml-2 text-gray-400 hover:text-green-600 md:hidden"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 text-green-700 rounded-lg md:rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                  {selectedStaff.name[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">{selectedStaff.name}</h3>
                  <p className="text-[9px] md:text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Secure Session
                  </p>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/30">
              {filteredConversation.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-4">
                    <EnvelopeIcon className="w-6 h-6 md:w-8 md:h-8 text-gray-200" />
                  </div>
                  <p className="text-gray-400 text-xs md:text-sm font-medium">No messages yet with {selectedStaff.name}.</p>
                </div>
              ) : (
                filteredConversation.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%]`}>
                        <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${
                          isMe 
                            ? 'bg-green-600 text-white rounded-tr-none shadow-md' 
                            : 'bg-white text-gray-800 rounded-tl-none border border-gray-100 shadow-sm'
                        }`}>
                          <p className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          <div className={`flex items-center gap-1 mt-1 opacity-60 ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <ClockIcon className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-tighter">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 md:p-6 border-t border-gray-100 bg-white">
              <form onSubmit={handleSend} className="flex gap-2 md:gap-4">
                <input 
                  type="text" 
                  className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-gray-200 focus:ring-4 focus:ring-green-500/5 focus:border-green-500 outline-none bg-gray-50/50 text-sm md:text-base font-medium transition-all"
                  placeholder={`Message ${selectedStaff.name.split(' ')[0]}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 md:p-4 bg-green-600 text-white rounded-xl md:rounded-2xl hover:bg-green-700 shadow-lg shadow-green-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6 -rotate-45" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
             <UserCircleIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-100 mb-4" />
             <h3 className="text-base md:text-lg font-bold text-gray-900">Select a Consultant</h3>
             <p className="text-gray-400 text-xs md:text-sm max-w-xs mt-2">Pick a staff member from the left to begin your secure consultation.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentMessages;
