import React, { useState, useEffect } from 'react';
import { messageService, authService } from '../../api/service';
import { 
  PaperAirplaneIcon, 
  UserCircleIcon, 
  ChatBubbleBottomCenterTextIcon,
  MagnifyingGlassIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const StaffMessages = () => {
  const [messages, setMessages] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadError, setLoadError] = useState('');

  const scrollRef = React.useRef(null);

  useEffect(() => {
    fetchInitialData();

    // Refresh message state while this page is open.
    const intervalId = setInterval(async () => {
      if (!selectedStudent) return;
      try {
        const msgData = await messageService.getConversationMessages(selectedStudent.id);
        setMessages(msgData);
      } catch (err) {
        console.error(err);
      }
    }, 5000);

    const onFocus = () => fetchInitialData();
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
  }, [messages, selectedStudent]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const userData = await authService.getUsers();
      // Filter only students
      const studentList = userData.filter(u => u.role === 'student');
      setStudents(studentList);
      
      if (studentList.length > 0 && !selectedStudent) {
        setSelectedStudent(studentList[0]);
        const msgData = await messageService.getConversationMessages(studentList[0].id);
        setMessages(msgData);
      }
    } catch (err) {
      console.error(err);
      setLoadError('Unable to load student list. Please refresh or re-login.');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudent) return;
    try {
      await messageService.sendMessage({
        recipient_id: selectedStudent.id,
        content: newMessage
      });
      setNewMessage('');
      const updatedMessages = await messageService.getConversationMessages(selectedStudent.id);
      setMessages(updatedMessages);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.school_id.includes(searchTerm)
  );

  const selectedConversation = messages;

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] flex flex-col md:flex-row gap-4 md:gap-6 relative overflow-hidden">
      {/* Student List Sidebar */}
      <div className={`${selectedStudent ? 'hidden md:flex' : 'flex'} w-full md:w-80 bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 flex-col overflow-hidden transition-all duration-300`}>
        <div className="p-4 md:p-6 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50">
          <h2 className="text-lg md:text-xl font-black text-gray-900 font-outfit mb-3 md:mb-4">Chat Portal</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full pl-10 pr-4 py-2.5 md:py-3 bg-gray-100/50 border-none rounded-xl md:rounded-2xl text-[11px] md:text-xs font-bold outline-none focus:ring-2 focus:ring-cpsu-green/20 transition-all font-sans"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2">
          {loadError && (
            <div className="mx-2 mb-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
              {loadError}
            </div>
          )}
          {filteredStudents.map(student => (
            <button
              key={student.id}
              onClick={() => {
                setSelectedStudent(student);
                messageService.getConversationMessages(student.id)
                  .then(setMessages)
                  .catch(console.error);
              }}
              className={`w-full flex items-center p-3 md:p-4 rounded-xl md:rounded-2xl transition-all ${
                selectedStudent?.id === student.id 
                  ? 'bg-cpsu-green text-white shadow-lg shadow-cpsu-green/20' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center mr-3 font-black flex-shrink-0 ${
                selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {student.name[0]?.toUpperCase()}
              </div>
              <div className="text-left overflow-hidden">
                <p className={`text-sm font-black truncate ${selectedStudent?.id === student.id ? 'text-white' : 'text-gray-900'}`}>
                  {student.name}
                </p>
                <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 ${selectedStudent?.id === student.id ? 'text-white' : 'text-cpsu-green'}`}>
                  {student.school_id}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Area */}
      <div className={`${!selectedStudent ? 'hidden md:flex' : 'flex'} flex-1 bg-white rounded-2xl md:rounded-[2.5rem] shadow-sm border border-gray-100 flex-col overflow-hidden relative transition-all duration-300`}>
        {!selectedStudent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 text-center pointer-events-none">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-200">
              <ChatBubbleBottomCenterTextIcon className="w-8 h-8 md:w-10 md:h-10" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 font-outfit mb-2">Patient Communications</h3>
            <p className="text-gray-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest max-w-xs mx-auto">Select a student from the sidebar to begin clinical consultation via secure messaging.</p>
          </div>
        ) : (
          <>
            <div className="p-4 md:p-6 border-b border-gray-50 bg-white flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center overflow-hidden">
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 -ml-2 text-gray-400 hover:text-cpsu-green md:hidden mr-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div className="w-9 h-9 md:w-12 md:h-12 bg-cpsu-green/10 text-cpsu-green rounded-xl md:rounded-2xl flex items-center justify-center mr-3 md:mr-4 font-black flex-shrink-0">
                  {selectedStudent.name[0]?.toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-base md:text-lg font-black text-gray-900 font-outfit leading-none mb-1 truncate">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] font-black text-cpsu-green uppercase tracking-[0.15em]">SECURE CHANNEL</span>
                  </div>
                </div>
              </div>
              <button 
                className="p-2.5 md:p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-cpsu-green hover:bg-cpsu-green/5 transition-all flex-shrink-0"
                title="Refresh Conversation"
                onClick={fetchInitialData}
              >
                <SparklesIcon className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 bg-[#fcfcfd]/50">
              {selectedConversation.map((msg) => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] group`}>
                      <div className={`p-4 md:p-5 rounded-2xl md:rounded-[1.8rem] text-xs md:text-sm font-medium leading-relaxed shadow-sm ${
                        isMe 
                          ? 'bg-cpsu-green text-white rounded-tr-none' 
                          : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest mt-1.5 md:mt-2 opacity-40 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
              {selectedConversation.length === 0 && (
                <div className="text-center py-20 text-gray-300 font-bold uppercase text-[9px] md:text-[10px] tracking-widest italic font-sans px-4">
                  No message history with this patient.
                </div>
              )}
            </div>

            <div className="p-4 md:p-6 bg-white border-t border-gray-50">
              <form onSubmit={handleSend} className="flex gap-2 md:gap-4">
                <input 
                  type="text" 
                  className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cpsu-green/20 outline-none text-[13px] md:text-sm font-bold transition-all placeholder:text-gray-300 font-sans"
                  placeholder={`Send secure response to ${selectedStudent.name.split(' ')[0]}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 md:p-4 bg-cpsu-green text-white rounded-xl md:rounded-2xl hover:bg-cpsu-green-dark shadow-lg shadow-cpsu-green/10 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale flex-shrink-0"
                >
                  <PaperAirplaneIcon className="w-5 h-5 md:w-6 md:h-6 -rotate-45" />
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StaffMessages;
