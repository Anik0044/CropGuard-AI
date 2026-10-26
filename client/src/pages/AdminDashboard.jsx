import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import AuthContext from '../context/AuthContext';
import {
    Users,
    AlertCircle,
    Check,
    MessageSquare,
    Send,
    ShieldCheck,
    Clock,
    Search,
    Loader2,
    CheckCheck,
    ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);

    // Existing Scan Review State
    const [pendingScans, setPendingScans] = useState([]);
    const [loadingScans, setLoadingScans] = useState(true);
    const [editingScan, setEditingScan] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [detectedDisease, setDetectedDisease] = useState('');

    // Dashboard Active Tab
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'scans'

    // Live Support Chat State
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);

    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, isUserTyping, activeTab]);

    // Fetch pending scan reviews
    const fetchScans = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/detect/admin/all', config);
            setPendingScans(data.filter((s) => s.status === 'pending_review'));
        } catch (error) {
            console.error('Error fetching scans:', error);
        } finally {
            setLoadingScans(false);
        }
    };

    // Fetch conversation list
    const fetchConversations = useCallback(async (isInitial = false) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/chat/conversations', config);

            setConversations(data || []);

            // Auto-select first user if none selected (desktop only to allow mobile to show user list first)
            if (isInitial && data && data.length > 0 && !selectedUser) {
                if (typeof window !== 'undefined' && window.innerWidth >= 768) {
                    setSelectedUser(data[0].user || { _id: data[0].userId });
                }
            }
        } catch (error) {
            console.error('Error fetching admin conversations:', error);
        } finally {
            if (isInitial) setLoadingConversations(false);
        }
    }, [selectedUser]);

    // Fetch messages for selected user
    const fetchMessages = useCallback(async (userId, isInitialSelect = false) => {
        if (!userId) return;
        if (isInitialSelect) setLoadingMessages(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/api/chat/messages/${userId}`, config);

            setMessages(data.messages || []);
            setIsUserTyping(Boolean(data.isOtherTyping));

            // Mark as read
            await axios.put(`/api/chat/read/${userId}`, {}, config).catch(() => {});
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
        } finally {
            if (isInitialSelect) setLoadingMessages(false);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchScans();
            fetchConversations(true);
        }
    }, [user, fetchConversations]);

    // Initialize Socket.io connection for Admin
    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const SOCKET_URL = window.location.origin;
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join_admin');
        });

        // Real-time incoming message handler
        const handleIncoming = (newMsg) => {
            if (!newMsg) return;

            // If the message is for or from the currently selected user, add it to chat history
            const activeUid = selectedUser?._id?.toString();
            const msgUserId = (newMsg.userId?._id || newMsg.userId)?.toString();

            if (activeUid && msgUserId && activeUid === msgUserId) {
                setMessages((prev) => {
                    const exists = prev.some((m) => (m._id && m._id === newMsg._id) || (m.tempId && m.tempId === newMsg.tempId));
                    if (exists) return prev;
                    return [...prev, newMsg];
                });
            }

            // Refresh conversation list to update badges and snippets
            fetchConversations(false);
        };

        socket.on('receive_message', handleIncoming);
        socket.on('message', handleIncoming);

        socket.on('user_typing', (data) => {
            const activeUid = selectedUser?._id?.toString();
            if (activeUid && data?.userId?.toString() === activeUid) {
                setIsUserTyping(Boolean(data.isTyping));
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [user, selectedUser?._id, fetchConversations]);

    // Poll messages for active user
    useEffect(() => {
        if (!selectedUser?._id) return;

        fetchMessages(selectedUser._id, true);
        const interval = setInterval(() => {
            fetchMessages(selectedUser._id, false);
            fetchConversations(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedUser?._id, fetchMessages, fetchConversations]);

    // Send reply to selected user
    const handleSendReply = async (e) => {
        e.preventDefault();
        const text = replyText.trim();
        if (!text || !selectedUser?._id || isSending) return;

        setIsSending(true);
        const tempId = `temp_${Date.now()}`;
        const targetId = selectedUser._id.toString();

        const optimisticMessage = {
            _id: tempId,
            tempId,
            userId: targetId,
            senderId: user._id || user.id,
            senderName: user.name || 'Admin',
            senderRole: 'admin',
            sender: 'admin',
            message: text,
            createdAt: new Date().toISOString(),
        };

        // Instantly display on admin UI
        setMessages((prev) => [...prev, optimisticMessage]);
        setReplyText('');

        // Emit through Socket.io to the user's room
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('send_message', {
                userId: targetId,
                userName: selectedUser.name || selectedUser.username,
                senderRole: 'admin',
                sender: 'admin',
                message: text,
            });
        }

        // Persist to MongoDB backend with explicit targetUserId and userId
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.post('/api/chat/send', {
                message: text,
                targetUserId: targetId,
                userId: targetId,
            }, config);

            // Replace optimistic message
            setMessages((prev) => prev.map((m) => (m.tempId === tempId ? data : m)));
            fetchConversations(false);
        } catch (error) {
            console.error('Error sending admin reply:', error);
            alert('Failed to send reply. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    // Typing indicator emission for admin
    const handleInputChange = (e) => {
        setReplyText(e.target.value);
        if (!selectedUser?._id || !socketRef.current) return;

        const targetId = selectedUser._id.toString();
        socketRef.current.emit('admin_typing', { userId: targetId, isTyping: true });

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit('admin_typing', { userId: targetId, isTyping: false });
        }, 2500);
    };

    // Scan review resolve
    const handleResolve = async (id) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`/api/detect/admin/${id}`, {
                detectedDisease,
                adminComment,
            }, config);

            setPendingScans((prev) => prev.filter((s) => s._id !== id));
            setEditingScan(null);
            setAdminComment('');
            setDetectedDisease('');
            alert('Scan resolved successfully');
        } catch (error) {
            console.error('Error resolving scan:', error);
            alert('Failed to resolve scan');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-20 text-center font-bold text-red-600">Unauthorized Access</div>;
    }

    const filteredConversations = conversations.filter((c) => {
        const name = (c.user?.name || '').toLowerCase();
        const username = (c.user?.username || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return name.includes(query) || username.includes(query);
    });

    const totalUnreadChats = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-nature-900 tracking-tight">
                        Admin Command Center
                    </h1>
                    <p className="text-stone-500 mt-1 text-base">
                        Real-time farmer support, live diagnostics, and system management.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className="flex items-center gap-2 mt-4 md:mt-0 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'chat'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                        <MessageSquare size={16} />
                        Live Support Chat
                        {totalUnreadChats > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                                {totalUnreadChats}
                            </span>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('scans')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            activeTab === 'scans'
                                ? 'bg-nature-700 text-white shadow-sm'
                                : 'text-stone-600 hover:text-stone-900'
                        }`}
                    >
                        <AlertCircle size={16} />
                        Scan Reviews ({pendingScans.length})
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="card border-l-8 border-l-nature-600">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-nature-100 rounded-lg text-nature-600">
                            <Users size={22} />
                        </div>
                        <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Total Users / Farmers</h3>
                    </div>
                    <p className="text-3xl font-extrabold text-nature-800">{conversations.length || 1}</p>
                </div>

                <div
                    onClick={() => setActiveTab('chat')}
                    className="card border-l-8 border-l-emerald-500 cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                                <MessageSquare size={22} />
                            </div>
                            <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Unread Support Chats</h3>
                        </div>
                        {totalUnreadChats > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">
                                Action Needed
                            </span>
                        )}
                    </div>
                    <p className="text-3xl font-extrabold text-emerald-700">{totalUnreadChats}</p>
                </div>

                <div
                    onClick={() => setActiveTab('scans')}
                    className="card border-l-8 border-l-amber-500 cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                            <AlertCircle size={22} />
                        </div>
                        <h3 className="text-stone-500 font-medium uppercase tracking-wider text-xs">Pending Reviews</h3>
                    </div>
                    <p className="text-3xl font-extrabold text-amber-700">{pendingScans.length}</p>
                </div>
            </div>

            {/* TAB 1: LIVE SUPPORT CHAT */}
            {activeTab === 'chat' && (
                <div className="bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden flex flex-col md:flex-row h-[calc(100vh-220px)] min-h-[520px] max-h-[760px] mb-8">
                    {/* User Selection Sidebar - On mobile, hidden if a user is selected */}
                    <div className={`w-full md:w-80 border-r border-stone-200 flex flex-col bg-stone-50 h-full min-h-0 flex-shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        {/* Sidebar Header */}
                        <div className="flex-shrink-0 p-3.5 border-b border-stone-200 bg-stone-100 flex items-center justify-between">
                            <h3 className="font-bold text-stone-800 text-sm flex items-center gap-2">
                                <Users size={16} className="text-emerald-600" />
                                Select User ({filteredConversations.length})
                            </h3>
                            {totalUnreadChats > 0 && (
                                <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                    {totalUnreadChats} unread
                                </span>
                            )}
                        </div>

                        {/* Search User Input */}
                        <div className="flex-shrink-0 p-3 border-b border-stone-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-stone-400" size={15} />
                                <input
                                    type="text"
                                    placeholder="Search user name or username..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* User List with scroll */}
                        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-stone-100">
                            {loadingConversations ? (
                                <div className="p-8 text-center text-stone-400">
                                    <Loader2 className="animate-spin mx-auto mb-2 text-emerald-600" size={22} />
                                    <p className="text-xs">Loading users...</p>
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-8 text-center text-stone-400">
                                    <Users size={28} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No users found.</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => {
                                    const isSelected = selectedUser?._id?.toString() === conv.userId?.toString();
                                    const uName = conv.user?.name || conv.user?.username || 'User';

                                    return (
                                        <div
                                            key={conv.userId}
                                            onClick={() => setSelectedUser(conv.user || { _id: conv.userId })}
                                            className={`p-3 cursor-pointer transition-all flex items-start gap-3 ${
                                                isSelected
                                                    ? 'bg-emerald-50 border-l-4 border-emerald-600'
                                                    : 'hover:bg-stone-100/70'
                                            }`}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                                    {uName[0]?.toUpperCase() || 'U'}
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-0.5">
                                                    <h4 className="font-semibold text-stone-900 text-xs truncate">
                                                        {uName}
                                                    </h4>
                                                    <span className="text-[10px] text-stone-400">
                                                        {conv.lastMessage?.createdAt
                                                            ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : ''}
                                                    </span>
                                                </div>

                                                <p className="text-[11px] text-stone-500 truncate">
                                                    {conv.isUserTyping ? (
                                                        <span className="text-emerald-600 font-medium italic">Typing...</span>
                                                    ) : (
                                                        conv.lastMessage?.message || 'Click to view chat'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Chat Messages & Reply Area - On mobile, hidden if no user is selected */}
                    <div className={`flex-1 flex flex-col bg-[#f8fafc] h-full min-h-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                        {selectedUser ? (
                            <>
                                {/* Conversation Header with Mobile Back Button */}
                                <div className="flex-shrink-0 p-3.5 border-b border-stone-200 bg-white flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        {/* Mobile Back Button to Return to User List */}
                                        <button
                                            onClick={() => setSelectedUser(null)}
                                            className="md:hidden p-1.5 -ml-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg flex items-center gap-1 text-xs font-semibold"
                                            title="Back to User List"
                                        >
                                            <ChevronLeft size={18} />
                                            Users
                                        </button>

                                        <div className="relative flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center">
                                                {(selectedUser.name || selectedUser.username || 'U')[0].toUpperCase()}
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
                                                {selectedUser.name || selectedUser.username || 'Farmer'}
                                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                                                    {selectedUser.role || 'farmer'}
                                                </span>
                                            </h3>
                                            <p className="text-[11px] text-stone-400">
                                                Direct 1-to-1 Support Session
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-medium">
                                            <Clock size={12} /> Auto-deletes in 24h
                                        </span>
                                    </div>
                                </div>

                                {/* Message History - Only this scrolls */}
                                <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
                                    {loadingMessages ? (
                                        <div className="h-full flex items-center justify-center text-stone-400">
                                            <Loader2 className="animate-spin text-emerald-600" size={28} />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center text-stone-400">
                                            <MessageSquare size={36} className="text-stone-300 mb-2" />
                                            <p className="text-sm font-semibold text-stone-600">No messages yet with this user.</p>
                                            <p className="text-xs text-stone-400 mt-1">Send a message below to start the conversation.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, idx) => {
                                            const isAdmin = msg.senderRole === 'admin' || msg.sender === 'admin';
                                            const timeStr = msg.createdAt
                                                ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : '';

                                            return (
                                                <div
                                                    key={msg._id || msg.tempId || idx}
                                                    className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    {!isAdmin && (
                                                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mb-0.5">
                                                            {(selectedUser.name || 'U')[0].toUpperCase()}
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`max-w-[75%] text-sm px-4 py-2.5 shadow-sm rounded-2xl break-words ${
                                                            isAdmin
                                                                ? 'bg-emerald-600 text-white rounded-br-sm'
                                                                : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-sm'
                                                        }`}
                                                    >
                                                        {msg.imageUrl && (
                                                            <div className="mb-2 overflow-hidden rounded-lg">
                                                                <img
                                                                    src={msg.imageUrl}
                                                                    alt="Attachment"
                                                                    className="max-h-52 w-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        )}

                                                        <p className="leading-relaxed">{msg.message}</p>

                                                        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-80">
                                                            <span>{timeStr}</span>
                                                            {isAdmin && <CheckCheck size={12} className="text-emerald-100" />}
                                                        </div>
                                                    </div>

                                                    {isAdmin && (
                                                        <div className="w-7 h-7 rounded-full bg-emerald-800 text-white flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-sm mb-0.5">
                                                            <ShieldCheck size={14} className="text-emerald-200" />
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}

                                    {/* User is typing indicator */}
                                    {isUserTyping && (
                                        <div className="flex items-center gap-2 text-stone-500 text-xs italic bg-white py-1.5 px-3 rounded-full w-fit border border-stone-200 shadow-sm">
                                            <span className="w-2 h-2 bg-emerald-600 rounded-full animate-ping"></span>
                                            {selectedUser.name || 'User'} is typing...
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Fixed Reply Input Box at Bottom */}
                                <form onSubmit={handleSendReply} className="flex-shrink-0 p-3 bg-white border-t border-stone-200 flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Reply to ${selectedUser.name || selectedUser.username}...`}
                                        value={replyText}
                                        onChange={handleInputChange}
                                        className="flex-1 bg-stone-100 hover:bg-stone-200/70 focus:bg-white text-stone-900 placeholder-stone-400 text-sm px-4 py-2.5 rounded-xl border border-stone-200 focus:border-emerald-500 focus:outline-none transition-all"
                                    />

                                    <button
                                        type="submit"
                                        disabled={!replyText.trim() || isSending}
                                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
                                    >
                                        {isSending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={16} />
                                                Send Reply
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-stone-400 p-8 text-center">
                                <Users size={48} className="text-stone-300 mb-3" />
                                <h3 className="text-base font-bold text-stone-700 mb-1">Select a User from the Left</h3>
                                <p className="text-xs text-stone-400 max-w-xs">
                                    Choose any farmer or user from the list to view their questions and send real-time replies.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: PENDING SCAN REVIEWS */}
            {activeTab === 'scans' && (
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-nature-900 mb-6 flex items-center gap-2">
                        <AlertCircle className="text-amber-600" /> Pending Scan Reviews
                    </h2>

                    {loadingScans ? (
                        <p>Loading pending reviews...</p>
                    ) : pendingScans.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl border border-stone-200 text-center text-stone-500">
                            <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
                            <p className="text-lg">No scans pending review. All good!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingScans.map((scan) => (
                                <div key={scan._id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-6">
                                    <img
                                        src={`${scan.inputImageUrl}`}
                                        alt="Scan"
                                        className="w-32 h-32 object-cover rounded-lg border border-stone-100"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-stone-800 mb-1">{scan.cropType}</h3>
                                                <p className="text-stone-600 text-sm mb-2">
                                                    AI Prediction: <span className="font-semibold text-nature-700">{scan.detectedDisease}</span>
                                                    <span className="ml-2 text-xs bg-stone-100 px-2 py-0.5 rounded text-stone-500">Confidence: {scan.confidenceScore}%</span>
                                                </p>
                                                <p className="text-xs text-stone-400">User ID: {scan.userId?._id || scan.userId}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">Pending Review</span>
                                                <p className="text-xs text-stone-400 mt-1">{new Date(scan.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {editingScan === scan._id ? (
                                            <div className="mt-4 bg-stone-50 p-4 rounded-lg border border-stone-200 animate-fade-in">
                                                <h4 className="font-bold text-stone-700 mb-3 text-sm uppercase tracking-wide">Admin Correction</h4>
                                                <div className="grid md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-stone-500 mb-1">Correct Diagnosis</label>
                                                        <input
                                                            type="text"
                                                            className="input-field w-full"
                                                            value={detectedDisease}
                                                            onChange={(e) => setDetectedDisease(e.target.value)}
                                                            placeholder="e.g. Bacterial Blight"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-stone-500 mb-1">Admin Comment</label>
                                                        <input
                                                            type="text"
                                                            className="input-field w-full"
                                                            value={adminComment}
                                                            onChange={(e) => setAdminComment(e.target.value)}
                                                            placeholder="Explain the correction..."
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setEditingScan(null)}
                                                        className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg text-sm font-medium"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleResolve(scan._id)}
                                                        className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                                                    >
                                                        <Check size={16} /> Mark Resolved
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => {
                                                        setEditingScan(scan._id);
                                                        setDetectedDisease(scan.detectedDisease);
                                                        setAdminComment('');
                                                    }}
                                                    className="bg-nature-600 text-white hover:bg-nature-700 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                                                >
                                                    Review & Correct
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
