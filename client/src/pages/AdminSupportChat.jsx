import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Send,
    Image as ImageIcon,
    X,
    User,
    Clock,
    Search,
    ShieldAlert,
    ShieldCheck,
    MessageSquare,
    Loader2,
    ChevronLeft,
    CheckCheck,
    MapPin,
    Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMessageWithLinks } from '../utils/chatUtils';

const AdminSupportChat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch conversation list
    const fetchConversations = async (isInitial = false) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/chat/conversations', config);

            setConversations(data || []);

            // Auto-select first conversation if none selected
            if (isInitial && data && data.length > 0 && !selectedUser) {
                setSelectedUser(data[0].user || { _id: data[0].userId });
            }
        } catch (error) {
            console.error('Error fetching admin conversations:', error);
        } finally {
            if (isInitial) setLoadingConversations(false);
        }
    };

    // Fetch messages for selected conversation
    const fetchMessages = async (userId, isInitialSelect = false) => {
        if (!userId) return;
        if (isInitialSelect) setLoadingMessages(true);

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`/api/chat/messages/${userId}`, config);

            setMessages(data.messages || []);
            setIsUserTyping(Boolean(data.isOtherTyping));

            // Mark conversation as read
            await axios.put(`/api/chat/read/${userId}`, {}, config);
        } catch (error) {
            console.error('Error fetching conversation messages:', error);
        } finally {
            if (isInitialSelect) setLoadingMessages(false);
        }
    };

    // Initial load + Real-time polling
    useEffect(() => {
        fetchConversations(true);
        const convInterval = setInterval(() => {
            fetchConversations(false);
        }, 3000);

        return () => clearInterval(convInterval);
    }, []);

    // Polling selected conversation messages
    useEffect(() => {
        if (!selectedUser?._id) return;

        fetchMessages(selectedUser._id, true);
        const msgInterval = setInterval(() => {
            fetchMessages(selectedUser._id, false);
        }, 2500);

        return () => clearInterval(msgInterval);
    }, [selectedUser?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isUserTyping]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please upload an image file (JPG, PNG, WebP)');
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleInputChange = (e) => {
        setInputText(e.target.value);
        if (!selectedUser?._id) return;

        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            axios.post('/api/chat/typing', {
                isTyping: true,
                targetUserId: selectedUser._id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                axios.post('/api/chat/typing', {
                    isTyping: false,
                    targetUserId: selectedUser._id
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => {});
            }, 3000);
        } catch (err) {
            // Silently ignore ping errors
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputText.trim() && !imageFile) || isSending || !selectedUser?._id) return;

        setIsSending(true);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const formData = new FormData();
            if (inputText.trim()) formData.append('message', inputText.trim());
            if (imageFile) formData.append('image', imageFile);
            formData.append('targetUserId', selectedUser._id);

            const { data } = await axios.post('/api/chat/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setMessages((prev) => [...prev, data]);
            setInputText('');
            clearImage();
            fetchConversations(false);
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send reply. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const filteredConversations = conversations.filter(c => {
        const name = (c.user?.name || '').toLowerCase();
        const username = (c.user?.username || '').toLowerCase();
        const query = searchTerm.toLowerCase();
        return name.includes(query) || username.includes(query);
    });

    const totalUnread = conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0);

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-nature-950 to-slate-900 py-6 px-3 sm:px-6">
            <div className="max-w-7xl mx-auto h-[84vh] flex bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/15 overflow-hidden">
                
                {/* Conversations Sidebar */}
                <div className={`w-full md:w-96 flex flex-col border-r border-white/10 bg-slate-900/80 backdrop-blur-md ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-amber-400" size={24} />
                            <div>
                                <h2 className="font-bold text-white text-base">Support Inbox</h2>
                                <p className="text-xs text-slate-400">Farmers & user assistance</p>
                            </div>
                        </div>
                        {totalUnread > 0 && (
                            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse shadow-lg shadow-red-500/30">
                                {totalUnread} New
                            </span>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="p-3 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                        {loadingConversations ? (
                            <div className="p-8 text-center text-slate-400">
                                <Loader2 className="animate-spin mx-auto mb-2 text-emerald-400" size={24} />
                                <p className="text-sm">Loading conversations...</p>
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <MessageSquare className="mx-auto mb-2 text-slate-500" size={32} />
                                <p className="text-sm">No support conversations found.</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => {
                                const isSelected = selectedUser?._id === conv.userId;
                                return (
                                    <div
                                        key={conv.userId}
                                        onClick={() => setSelectedUser(conv.user || { _id: conv.userId })}
                                        className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                                            isSelected
                                                ? 'bg-emerald-600/20 border-l-4 border-emerald-500'
                                                : 'hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold flex items-center justify-center shadow-md">
                                                {(conv.user?.name || conv.user?.username || 'U')[0].toUpperCase()}
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900 shadow-md">
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-semibold text-white text-sm truncate">
                                                    {conv.user?.name || conv.user?.username || 'User'}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 whitespace-nowrap ml-1">
                                                    {conv.lastMessage?.createdAt
                                                        ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                        : ''}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-400">
                                                <p className="truncate pr-2">
                                                    {conv.isUserTyping ? (
                                                        <span className="text-emerald-400 font-medium italic flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                                                            Typing...
                                                        </span>
                                                    ) : conv.lastMessage?.imageUrl ? (
                                                        <span className="flex items-center gap-1 text-slate-300">
                                                            <ImageIcon size={12} /> Photo shared
                                                        </span>
                                                    ) : (
                                                        conv.lastMessage?.message || 'No messages yet'
                                                    )}
                                                </p>
                                                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] uppercase font-semibold text-slate-300">
                                                    {conv.user?.role || 'farmer'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className={`flex-1 flex flex-col bg-slate-950/60 backdrop-blur-md ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
                    {selectedUser ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="md:hidden p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <div className="w-10 h-10 rounded-full bg-emerald-600/40 border border-emerald-400 flex items-center justify-center text-white font-bold">
                                        {(selectedUser?.name || selectedUser?.username || 'U')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                                            {selectedUser?.name || selectedUser?.username || 'Selected User'}
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                                                {selectedUser?.role || 'farmer'}
                                            </span>
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                            {selectedUser?.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={12} className="text-slate-400" /> {selectedUser.location}
                                                </span>
                                            )}
                                            {selectedUser?.farmSize && (
                                                <span className="flex items-center gap-1">
                                                    <Sprout size={12} className="text-slate-400" /> {selectedUser.farmSize}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right hidden sm:block">
                                    <span className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                                        <Clock size={12} /> Auto-cleans in 24h
                                    </span>
                                </div>
                            </div>

                            {/* Message History */}
                            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                {loadingMessages ? (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="animate-spin text-emerald-400" size={32} />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <MessageSquare size={44} className="text-slate-600 mb-2" />
                                        <p className="text-sm">No messages in this conversation yet.</p>
                                        <p className="text-xs text-slate-500 mt-1">Start by replying below.</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isAdmin = msg.senderRole === 'admin';
                                        return (
                                            <div
                                                key={msg._id}
                                                className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-md ${
                                                        isAdmin
                                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none'
                                                            : 'bg-white/10 border border-white/10 text-slate-100 rounded-bl-none'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-3 mb-1 text-[11px] opacity-80">
                                                        <span className="font-semibold">{msg.senderName}</span>
                                                        <span>
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Attached Image */}
                                                    {msg.imageUrl && (
                                                        <div className="mb-2 overflow-hidden rounded-xl bg-black/20 cursor-pointer">
                                                            <img
                                                                src={msg.imageUrl}
                                                                alt="Attached file"
                                                                className="max-h-60 w-full object-cover hover:scale-105 transition-transform duration-200"
                                                                onClick={() => setEnlargedImage(msg.imageUrl)}
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Text with clickable links */}
                                                    {msg.message && (
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                            {formatMessageWithLinks(msg.message)}
                                                        </p>
                                                    )}

                                                    {isAdmin && (
                                                        <div className="flex justify-end mt-1">
                                                            <CheckCheck size={14} className="text-emerald-200" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {/* Typing indicator */}
                                {isUserTyping && (
                                    <div className="flex items-center gap-2 text-slate-400 text-xs italic bg-white/5 py-1.5 px-3 rounded-full w-fit">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                                        {selectedUser.name || 'User'} is typing...
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Image Preview before sending */}
                            {imagePreview && (
                                <div className="px-4 py-2 bg-slate-900/90 border-t border-white/10 flex items-center gap-3">
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-16 h-16 object-cover rounded-lg border border-emerald-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={clearImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <span className="text-xs text-slate-300">Ready to send image</span>
                                </div>
                            )}

                            {/* Input Form */}
                            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-white/10 flex items-center gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                                    title="Attach image"
                                >
                                    <ImageIcon size={20} />
                                </button>

                                <input
                                    type="text"
                                    placeholder="Type your reply to the farmer... (URLs will be clickable)"
                                    value={inputText}
                                    onChange={handleInputChange}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                />

                                <button
                                    type="submit"
                                    disabled={(!inputText.trim() && !imageFile) || isSending}
                                    className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center justify-center"
                                >
                                    {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            <ShieldAlert size={48} className="text-amber-400/60 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-1">Select a Conversation</h3>
                            <p className="text-sm text-slate-400 max-w-sm">
                                Choose a user from the left inbox to view their crop inquiries, send real-time replies, and share diagnostic guidance.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lightbox / Enlarged Image Modal */}
            <AnimatePresence>
                {enlargedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEnlargedImage(null)}
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
                    >
                        <div className="relative max-w-4xl max-h-[90vh]">
                            <img
                                src={enlargedImage}
                                alt="Enlarged"
                                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain"
                            />
                            <button
                                onClick={() => setEnlargedImage(null)}
                                className="absolute -top-4 -right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 backdrop-blur-md"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminSupportChat;
