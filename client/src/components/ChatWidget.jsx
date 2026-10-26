import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { MessageCircle, X, Send, ShieldCheck, Minus, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const MotionDiv = motion.div;
const MotionButton = motion.button;

const ChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isAdminTyping, setIsAdminTyping] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Auto-scroll to the newest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isAdminTyping, isOpen]);

    // Initialize Socket.io connection for real-time messaging
    useEffect(() => {
        if (!user) return;

        const SOCKET_URL = window.location.origin;
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', { userId: user._id || user.id });
        });

        // Listen for incoming messages from Admin in real-time
        const handleNewMessage = (newMsg) => {
            if (!newMsg) return;
            setMessages((prev) => {
                const exists = prev.some((m) => (m._id && m._id === newMsg._id) || (m.tempId && m.tempId === newMsg.tempId));
                if (exists) return prev;
                return [...prev, newMsg];
            });

            if (!isOpen) {
                setUnreadCount((count) => count + 1);
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('message', handleNewMessage);
        socket.on('chat_message', handleNewMessage);

        // Typing indicator from Admin
        socket.on('admin_typing', (data) => {
            setIsAdminTyping(Boolean(data?.isTyping));
        });

        return () => {
            socket.disconnect();
        };
    }, [user, isOpen]);

    // Fetch conversation messages from the backend API
    const fetchMessages = useCallback(async (isInitial = false) => {
        if (!user) return;
        try {
            const token = user.token || JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            if (isInitial) setLoading(true);

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/chat/messages', config);

            if (data?.messages) {
                setMessages(data.messages);
            } else if (Array.isArray(data)) {
                setMessages(data);
            }

            if (data?.isOtherTyping !== undefined) {
                setIsAdminTyping(Boolean(data.isOtherTyping));
            }

            // Mark as read when widget is open
            if (isOpen) {
                await axios.put('/api/chat/read', {}, config).catch(() => {});
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [user, isOpen]);

    // Polling fallback to ensure messages always sync even across network shifts
    useEffect(() => {
        if (!user) return;

        fetchMessages(true);
        const pollInterval = setInterval(() => {
            fetchMessages(false);
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [user, fetchMessages]);

    // Handle typing indicator trigger
    const handleInputChange = (e) => {
        setInputMessage(e.target.value);

        if (!socketRef.current || !user) return;

        socketRef.current.emit('user_typing', {
            userId: user._id || user.id,
            isTyping: true,
        });

        try {
            const token = user.token || JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (token) {
                axios.post('/api/chat/typing', { isTyping: true }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => {});
            }
        } catch {
            // Ignore ping errors
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('user_typing', {
                userId: user._id || user.id,
                isTyping: false,
            });

            try {
                const token = user.token || JSON.parse(localStorage.getItem('userInfo'))?.token;
                if (token) {
                    axios.post('/api/chat/typing', { isTyping: false }, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(() => {});
                }
            } catch {
                // Ignore ping errors
            }
        }, 2500);
    };

    // Send message to Admin
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = inputMessage.trim();
        if (!text || !user) return;

        const tempId = `temp_${Date.now()}`;
        const optimisticMessage = {
            _id: tempId,
            tempId,
            senderId: user._id || user.id,
            senderName: user.name || user.username || 'You',
            senderRole: user.role || 'farmer',
            message: text,
            createdAt: new Date().toISOString(),
        };

        // Instantly update UI (Facebook Messenger style optimistic update)
        setMessages((prev) => [...prev, optimisticMessage]);
        setInputMessage('');

        // Emit through socket for real-time delivery
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('send_message', {
                userId: user._id || user.id,
                userName: user.name || user.username,
                senderRole: user.role || 'farmer',
                message: text,
            });
        }

        // Persist to MongoDB backend (TTL index auto-deletes in 24 hours)
        try {
            const token = user.token || JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/chat/send', { message: text }, config);

            // Replace optimistic message with saved DB message
            setMessages((prev) => prev.map((m) => (m.tempId === tempId ? data : m)));
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const toggleOpen = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 30 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="w-[92vw] sm:w-[380px] h-[540px] max-h-[85vh] bg-[#f0f2f5] rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden mb-3"
                    >
                        {/* Messenger Header */}
                        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-green-900 text-white px-4 py-3 flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/40 border-2 border-emerald-300 flex items-center justify-center text-white font-bold shadow-inner">
                                        <ShieldCheck size={22} className="text-emerald-200" />
                                    </div>
                                    {/* Active Now Status Dot */}
                                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-emerald-900 rounded-full"></span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold tracking-wide flex items-center gap-1.5">
                                        Admin Support
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-200">
                                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                        <span>Active now • Direct 1-to-1</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-emerald-100">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                    title="Minimize"
                                >
                                    <Minus size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                                    title="Close"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Top 24-Hour Notice Bar */}
                        <div className="bg-emerald-50 text-emerald-800 text-[11px] px-3 py-1.5 border-b border-emerald-100/80 text-center font-medium">
                            🔒 Messages auto-delete after 24 hours to protect privacy.
                        </div>

                        {/* Messenger Body / Messages Area */}
                        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5">
                            {!user ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                                    <ShieldCheck size={40} className="text-emerald-600 mb-2 opacity-80" />
                                    <h4 className="font-semibold text-slate-800 text-sm mb-1">Log in to Chat</h4>
                                    <p className="text-xs text-slate-500 mb-4">
                                        Sign in with your account to start a direct 1-to-1 conversation with the Admin.
                                    </p>
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors shadow-sm"
                                    >
                                        Go to Login
                                    </Link>
                                </div>
                            ) : loading ? (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <Loader2 className="animate-spin text-emerald-600" size={28} />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 px-6">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                                        <MessageCircle size={24} />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 mb-1">No messages yet</p>
                                    <p className="text-xs text-slate-500">
                                        Send a message to speak directly with an Admin regarding crop issues, diagnostics, or inquiries.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, index) => {
                                    const isAdmin = msg.senderRole === 'admin' || msg.sender === 'admin';
                                    const timeStr = msg.createdAt
                                        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : '';

                                    return (
                                        <div
                                            key={msg._id || msg.tempId || index}
                                            className={`flex items-end gap-2 ${isAdmin ? 'justify-start' : 'justify-end'}`}
                                        >
                                            {/* Admin Profile Icon for incoming Admin messages */}
                                            {isAdmin && (
                                                <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mb-0.5">
                                                    <ShieldCheck size={14} className="text-emerald-700" />
                                                </div>
                                            )}

                                            {/* Message Bubble */}
                                            <div
                                                className={`max-w-[76%] text-sm px-3.5 py-2 shadow-sm break-words ${
                                                    isAdmin
                                                        ? 'bg-white text-slate-800 rounded-2xl rounded-tl-sm border border-slate-200/70'
                                                        : 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
                                                }`}
                                            >
                                                {/* Optional attached image */}
                                                {msg.imageUrl && (
                                                    <div className="mb-1.5 overflow-hidden rounded-lg">
                                                        <img
                                                            src={msg.imageUrl}
                                                            alt="Attachment"
                                                            className="max-h-48 w-full object-cover rounded-lg"
                                                        />
                                                    </div>
                                                )}

                                                <p className="leading-snug">{msg.message}</p>

                                                {timeStr && (
                                                    <span
                                                        className={`block text-[10px] mt-1 text-right ${
                                                            isAdmin ? 'text-slate-400' : 'text-emerald-100/90'
                                                        }`}
                                                    >
                                                        {timeStr}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {/* Typing Indicator Bubble */}
                            {isAdminTyping && (
                                <div className="flex items-end gap-2 justify-start">
                                    <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mb-0.5">
                                        <ShieldCheck size={14} className="text-emerald-700" />
                                    </div>
                                    <div className="bg-white text-slate-500 rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm border border-slate-200/70 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Fixed Input Bar at Bottom */}
                        {user ? (
                            <form
                                onSubmit={handleSendMessage}
                                className="bg-white px-3 py-2.5 border-t border-slate-200 flex items-center gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Type a message..."
                                    value={inputMessage}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-slate-800 placeholder-slate-400 text-sm px-4 py-2 rounded-full border border-slate-200 focus:border-emerald-500 focus:outline-none transition-all"
                                />

                                <button
                                    type="submit"
                                    disabled={!inputMessage.trim()}
                                    className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                                    title="Send"
                                >
                                    <Send size={16} className="ml-0.5" />
                                </button>
                            </form>
                        ) : null}
                    </MotionDiv>
                )}
            </AnimatePresence>

            {/* Floating Messenger Icon Trigger Button */}
            <MotionButton
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={toggleOpen}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all relative border-2 border-white/40"
                aria-label="Open Support Chat"
            >
                {isOpen ? <X size={26} /> : <MessageCircle size={28} />}

                {/* Red notification badge if new messages arrive while collapsed */}
                {unreadCount > 0 && !isOpen && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </MotionButton>
        </div>
    );
};

export default ChatWidget;
