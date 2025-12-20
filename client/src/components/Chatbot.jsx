import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, AlertCircle, Terminal, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [lang, setLang] = useState('en'); // 'en' or 'bn'
    const [messages, setMessages] = useState([
        {
            text: "Welcome to CropGuard AI. I am your professional agricultural assistant. How can I assist your farm today?",
            sender: 'bot',
            timestamp: new Date(),
            isSystem: true
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Poll for notifications when chat is open
    useEffect(() => {
        let interval;
        if (isOpen) {
            fetchNotifications();
            interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    const fetchNotifications = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/chatbot/notifications', config);

            if (data && data.length > 0) {
                // Add notifications as bot messages
                const newMessages = data.map(notif => ({
                    text: notif.message,
                    sender: 'bot',
                    timestamp: new Date(notif.createdAt),
                    isSystem: true // Using generic style for alerts
                }));

                setMessages(prev => [...prev, ...newMessages]);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const quickReplies = {
        en: ["Tomato diseases?", "Treat late blight", "Rice blast prevention", "Organic farming"],
        bn: ["টমেটোর রোগ?", "লেভ ব্লাইট প্রতিকার", "ধানের ব্লাস্ট প্রতিরোধ", "জৈব কৃষি"]
    };

    const toggleLanguage = () => {
        const newLang = lang === 'en' ? 'bn' : 'en';
        setLang(newLang);
        const greeting = newLang === 'en'
            ? "Switching to English. How can I help you?"
            : "বাংলায় পরিবর্তন করা হচ্ছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?";
        setMessages(prev => [...prev, { text: greeting, sender: 'bot', timestamp: new Date(), isSystem: true }]);
    };

    const sendMessage = async (messageText = inputMessage) => {
        if (!messageText.trim()) return;

        const userMessage = {
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const { data } = await axios.post('/api/chatbot/chat', {
                message: messageText
            });

            setTimeout(() => {
                const botResponse = {
                    text: data.response,
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, botResponse]);
                setIsTyping(false);
            }, 800);
        } catch (error) {
            console.error('Chatbot error:', error);
            setTimeout(() => {
                const fallbackResponse = {
                    text: lang === 'en'
                        ? "Agricultural Intelligence Server is currently re-calibrating. Please consult the Disease Library."
                        : "সার্ভার সংযোগে সমস্যা হচ্ছে। বিস্তারিত তথ্যের জন্য আমাদের ডিসিজ লাইব্রেরি দেখুন।",
                    sender: 'bot',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, fallbackResponse]);
                setIsTyping(false);
            }, 800);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 bg-gradient-to-br from-nature-700 via-nature-800 to-nature-900 text-white p-4 rounded-2xl shadow-2xl glass-panel z-50 group border border-nature-600/30"
                    >
                        <div className="relative">
                            <Bot size={32} className="group-hover:text-amber-400 transition-colors" />
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-3 -right-3 bg-amber-500 text-nature-900 text-[10px] font-bold rounded-full px-1.5 py-0.5 border-2 border-nature-900"
                            >
                                AI
                            </motion.span>
                        </div>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Interface */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 100, opacity: 0, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-[400px] h-[650px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col z-50 overflow-hidden border border-nature-100 flex-none"
                    >
                        {/* Interactive Header */}
                        <div className="bg-gradient-to-r from-nature-800 to-nature-950 p-5 text-white flex items-center justify-between border-b border-nature-700/50">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 5 }}
                                    className="bg-nature-700/50 p-2.5 rounded-2xl border border-nature-600/30"
                                >
                                    <Sparkles size={24} className="text-amber-400" />
                                </motion.div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold tracking-tight text-lg">CropGuard AI</h3>
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                                    </div>
                                    <p className="text-[10px] text-nature-200 uppercase tracking-widest font-semibold">Agricultural Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleLanguage}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-medium border border-white/10"
                                    title="Toggle Language"
                                >
                                    <Languages size={18} />
                                    {lang.toUpperCase()}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Professional Thread */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gradient-to-b from-stone-50 to-white">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.sender === 'bot' && (
                                        <div className="bg-nature-800 text-white p-2 rounded-xl border border-nature-600 shadow-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                                            <Bot size={20} />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] group`}>
                                        <div className={`rounded-2xl px-5 py-3 shadow-sm ${msg.sender === 'user'
                                            ? 'bg-nature-700 text-white rounded-br-none font-medium'
                                            : msg.isSystem
                                                ? 'bg-amber-50 text-amber-900 border border-amber-200/50 italic text-sm text-center'
                                                : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none prose prose-sm'
                                            }`}>
                                            <div className="whitespace-pre-wrap text-[13.5px] leading-relaxed">
                                                {msg.text}
                                            </div>
                                        </div>
                                        <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-60 transition-opacity ${msg.sender === 'user' ? 'text-right pr-1' : 'pl-1'
                                            }`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex gap-3 justify-start">
                                    <div className="bg-nature-800 text-white p-2 rounded-xl h-10 w-10 flex items-center justify-center shadow-md">
                                        <Bot size={20} />
                                    </div>
                                    <div className="bg-stone-100/50 rounded-2xl rounded-bl-none px-5 py-4 border border-stone-200/30">
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map((i) => (
                                                <motion.span
                                                    key={i}
                                                    animate={{ y: [0, -4, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                                    className="w-1.5 h-1.5 bg-nature-400 rounded-full"
                                                ></motion.span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Interactive Context Panel */}
                        <div className="px-5 py-3 bg-white border-t border-stone-100 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
                                    <Terminal size={12} /> Sugested Queries
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {quickReplies[lang].map((reply, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.02, backgroundColor: '#f1f5f9' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => sendMessage(reply)}
                                        className="text-[11px] bg-stone-50 text-stone-600 border border-stone-200 px-3.5 py-1.5 rounded-xl transition-all shadow-sm hover:border-nature-300 hover:text-nature-700"
                                    >
                                        {reply}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Input System */}
                        <div className="p-5 bg-white border-t border-stone-100">
                            <div className="flex gap-3 items-center bg-stone-50 p-1.5 rounded-2xl border border-stone-200 focus-within:border-nature-400 focus-within:ring-4 focus-within:ring-nature-400/10 transition-all">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={lang === 'en' ? "Consult CropGuard AI..." : "ক্রপগার্ড এআই এর সাথে পরামর্শ করুন..."}
                                    className="flex-1 bg-transparent px-4 py-2 text-sm focus:outline-none placeholder:text-stone-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => sendMessage()}
                                    disabled={!inputMessage.trim()}
                                    className="bg-nature-800 text-white p-2.5 rounded-xl hover:bg-nature-900 transition-all disabled:opacity-20 shadow-lg shadow-nature-800/20"
                                >
                                    <Send size={18} />
                                </motion.button>
                            </div>
                            <p className="text-[9px] text-center text-stone-400 mt-4 uppercase tracking-[0.2em] font-medium">
                                Secure Agricultural Intelligence Interface
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Chatbot;

