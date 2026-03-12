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
    <div className="max-w-7xl mx-auto h-[calc(100vh-160px)] flex gap-6">
      {/* Student List Sidebar */}
      <div className="w-80 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gradient-to-br from-white to-gray-50/50">
          <h2 className="text-xl font-black text-gray-900 font-outfit mb-4">Chat Portal</h2>
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-100/50 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-cpsu-green/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
              className={`w-full flex items-center p-4 rounded-2xl transition-all ${
                selectedStudent?.id === student.id 
                  ? 'bg-cpsu-green text-white shadow-lg shadow-cpsu-green/20' 
                  : 'hover:bg-gray-50 text-gray-700'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 font-black ${
                selectedStudent?.id === student.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {student.name[0]?.toUpperCase()}
              </div>
              <div className="text-left overflow-hidden">
                <p className={`text-sm font-black truncate ${selectedStudent?.id === student.id ? 'text-white' : 'text-gray-900'}`}>
                  {student.name}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest opacity-60 ${selectedStudent?.id === student.id ? 'text-white' : 'text-cpsu-green'}`}>
                  {student.school_id}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative">
        {!selectedStudent ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-200">
              <ChatBubbleBottomCenterTextIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 font-outfit mb-2">Patient Communications</h3>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto">Select a student from the sidebar to begin clinical consultation via secure messaging.</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-50 bg-white flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-cpsu-green/10 text-cpsu-green rounded-2xl flex items-center justify-center mr-4 font-black">
                  {selectedStudent.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 font-outfit leading-none mb-1">{selectedStudent.name}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-cpsu-green uppercase tracking-[0.15em]">SECURE CHANNEL</span>
                  </div>
                </div>
              </div>
              <button 
                className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-cpsu-green hover:bg-cpsu-green/5 transition-all"
                title="Refresh Conversation"
                onClick={fetchInitialData}
              >
                <SparklesIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fcfcfd]/50">
              {selectedConversation.map((msg, idx) => {
                const isMe = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] group`}>
                      <div className={`p-5 rounded-[1.8rem] text-sm font-medium leading-relaxed ${
                        isMe 
                          ? 'bg-cpsu-green text-white rounded-tr-none shadow-xl shadow-cpsu-green/10' 
                          : 'bg-white border border-gray-100 text-gray-700 rounded-tl-none shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[9px] font-black uppercase tracking-widest mt-2 opacity-40 group-hover:opacity-100 transition-opacity ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
              {selectedConversation.length === 0 && (
                <div className="text-center py-20 text-gray-300 font-bold uppercase text-[10px] tracking-widest italic">
                  No message history with this patient.
                </div>
              )}
            </div>

            <div className="p-6 bg-white border-t border-gray-50">
              <form onSubmit={handleSend} className="flex gap-4">
                <input 
                  type="text" 
                  className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 border border-transparent focus:bg-white focus:border-cpsu-green/20 outline-none text-sm font-bold transition-all placeholder:text-gray-300"
                  placeholder={`Send secure response to ${selectedStudent.name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-4 bg-cpsu-green text-white rounded-2xl hover:bg-cpsu-green-dark shadow-xl shadow-cpsu-green/20 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  <PaperAirplaneIcon className="w-6 h-6 -rotate-45" />
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
