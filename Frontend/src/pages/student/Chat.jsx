import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { chatService } from "../../api/service";
import DiagnosisCard from "../../components/DiagnosisCard";

const LANGUAGE_LABELS = {
  english: "English",
  tagalog: "Tagalog",
  hiligaynon: "Hiligaynon",
};

const INITIAL_GREETING = {
  english:
    "Hello! I am your CPSU Virtual Health Assistant. How are you feeling today?",
  tagalog:
    "Kamusta! Ako ang iyong CPSU Virtual Health Assistant. Kumusta ang pakiramdam mo ngayon?",
  hiligaynon:
    "Hello! Ako ang imo CPSU Virtual Health Assistant. Kumusta ang pamatyag mo subong?",
};

const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 15); // Adjust speed here
      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [index, text, onComplete]);

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayedText}</p>;
};

const Chat = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [messages, setMessages] = useState([
    { role: "ai", text: INITIAL_GREETING.english, isStreaming: true },
  ]);
  // ... rest of state stays the same ...
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const sessionActiveRef = useRef(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Start session on mount and when language changes.
    let activeSessionId = null;

    const initChat = async () => {
      try {
        const session = await chatService.startSession(selectedLanguage);
        setSessionId(session.id);
        activeSessionId = session.id;
      } catch (err) {
        console.error("Failed to start chat session", err);
      }
    };

    setMessages([{ role: "ai", text: INITIAL_GREETING[selectedLanguage], isStreaming: true }]);
    initChat();

    return () => {
      if (activeSessionId && sessionActiveRef.current) {
        chatService.endSession(activeSessionId).catch(console.error);
      }
    };
  }, [selectedLanguage]);

  const handleComplete = async () => {
    if (!sessionId || messages.length < 2) return;

    setIsEnding(true);
    try {
      const history = messages.map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      await chatService.endSession(sessionId, history);
      sessionActiveRef.current = false;
      navigate("/student/records", {
        state: { message: "Consultation completed and saved to your records." },
      });
    } catch (err) {
      console.error("Failed to complete consultation", err);
      setIsEnding(false);
    }
  };

  const parseDiagnosisJSON = (text) => {
    try {
      // Find JSON block
      const match =
        text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*?}/);
      if (match) {
        const jsonStr = match[1] || match[0];
        const data = JSON.parse(jsonStr);
        if (data.type === "assessment") return data;
      }
    } catch (e) {
      // console.error("Failed to parse diagnosis JSON", e);
    }
    return null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    try {
      const conversationHistory = [
        ...messages,
        { role: "user", text: userMessage },
      ].map((m) => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.text,
      }));

      const response = await chatService.sendMessage(
        userMessage,
        sessionId,
        conversationHistory,
      );
      setMessages((prev) => [...prev, { role: "ai", text: response.reply, isStreaming: true }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Sorry, I encountered an error answering that.", isStreaming: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4 px-6 flex items-center justify-between shrink-0 sticky top-[-24px] z-20 -mx-6 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            to="/student"
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cpsu-green flex items-center justify-center pointer-events-none">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 font-outfit leading-tight">
                Virtual Assistant
              </h1>
              <span className="text-xs text-cpsu-green font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cpsu-green animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label
            htmlFor="chat-language"
            className="text-xs text-gray-500 font-medium"
          >
            Language
          </label>
          <select
            id="chat-language"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="border border-gray-200 bg-white rounded-md px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-cpsu-green cursor-pointer"
          >
            <option value="english">{LANGUAGE_LABELS.english}</option>
            <option value="tagalog">{LANGUAGE_LABELS.tagalog}</option>
            <option value="hiligaynon">{LANGUAGE_LABELS.hiligaynon}</option>
          </select>
        </div>

        {messages.length > 2 && (
          <button
            onClick={handleComplete}
            disabled={isEnding}
            className="flex items-center gap-2 bg-cpsu-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-cpsu-green-dark transition-colors shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEnding ? "Saving..." : "Complete Consultation"}</span>
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-6 space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg ${msg.role === "user" ? "bg-white text-gray-400 border border-gray-100" : "bg-gradient-to-br from-cpsu-green to-emerald-600 text-white shadow-cpsu-green/20"}`}
              >
                {msg.role === "user" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Bot className="w-5 h-5 shadow-inner" />
                )}
              </div>
              <div
                className={`max-w-[85%] rounded-2xl ${msg.role === "user" ? "bg-cpsu-green text-white rounded-tr-sm p-4 shadow-md" : ""}`}
              >
                {msg.role === "ai" ? (
                  (() => {
                    const diagnosisData = parseDiagnosisJSON(msg.text);
                    if (diagnosisData) {
                      return <DiagnosisCard data={diagnosisData} />;
                    }
                    return (
                      <div className="bg-white border border-gray-100 text-gray-700 rounded-tl-sm p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                        {msg.isStreaming ? (
                          <Typewriter 
                            text={msg.text} 
                            onComplete={() => {
                              // Optional: Update message state to no longer streaming
                            }} 
                          />
                        ) : (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.text}
                          </p>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.text}
                  </p>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-cpsu-green text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm rounded-tl-sm py-5 flex gap-1">
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your health concern..."
              disabled={isLoading}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-cpsu-green focus:border-transparent transition-all shadow-input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-cpsu-green text-white rounded-full hover:bg-cpsu-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5 -ml-0.5 mt-0.5" />
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-3">
            HealthAI can make mistakes. Consider verifying critical information
            with clinic staff.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
