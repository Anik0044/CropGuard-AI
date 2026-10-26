import { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { Send, Image, X, ShieldCheck, Clock, CheckCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatMessageWithLinks } from '../utils/chatUtils';

const SupportChat = () => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [isOtherTyping, setIsOtherTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enlargedImage, setEnlargedImage] = useState(null);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async (isInitial = false) => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('/api/chat/messages', config);

            setMessages(data.messages || []);
            setIsOtherTyping(Boolean(data.isOtherTyping));

            // Mark unread messages as read
            await axios.put('/api/chat/read', {}, config);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        } finally {
            if (isInitial) setLoading(false);
        }
    };

    // Initial load + Real-Time Polling every 2.5 seconds
    useEffect(() => {
        fetchMessages(true);
        const interval = setInterval(() => {
            fetchMessages(false);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOtherTyping]);

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

        // Send typing indicator pulse
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            if (!token) return;

            axios.post('/api/chat/typing', { isTyping: true }, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(() => {});

            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                axios.post('/api/chat/typing', { isTyping: false }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => {});
            }, 3000);
        } catch (err) {
            // Silently ignore typing ping errors
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!inputText.trim() && !imageFile) || isSending) return;

        setIsSending(true);
        try {
            const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
            const formData = new FormData();
            if (inputText.trim()) formData.append('message', inputText.trim());
            if (imageFile) formData.append('image', imageFile);

            const { data } = await axios.post('/api/chat/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setMessages((prev) => [...prev, data]);
            setInputText('');
            clearImage();
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-nature-50 via-emerald-50/30 to-earth-50 py-6 px-4">
            <div className="max-w-4xl mx-auto h-[82vh] flex flex-col bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-nature-800 to-nature-900 text-white p-4 sm:px-6 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-full bg-emerald-600/50 flex items-center justify-center border-2 border-emerald-400">
                                <ShieldCheck className="text-emerald-200" size={24} />
                            </div>
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-nature-900 rounded-full animate-pulse"></span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                CropGuard Live Support
                                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                                    Official
                                </span>
                            </h2>
                            <p className="text-xs text-nature-200 flex items-center gap-1.5">
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                                Agronomists & Support Team Online
                            </p>
                        </div>
                    </div>

                    <div className="text-right hidden sm:block">
                        <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-nature-100 font-mono">
                            Auto-clears in 24h (TTL)
                        </span>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gradient-to-b from-stone-50/50 to-white/60">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-stone-400">
                            <Loader2 className="animate-spin mb-2" size={32} />
                            <p className="text-sm">Connecting to Support Chat...</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 text-stone-400">
                            <div className="w-16 h-16 rounded-full bg-nature-100 flex items-center justify-center mb-4 text-nature-600">
                                <ShieldCheck size={36} />
                            </div>
                            <h3 className="text-lg font-bold text-stone-700 mb-1">Welcome to Support!</h3>
                            <p className="text-sm max-w-md text-stone-500 mb-2">
                                Ask any questions about your crops, send leaf photos for disease advice, or paste helpful links.
                            </p>
                            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
                                Fast replies from verified agriculture experts
                            </span>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.senderRole !== 'admin';
                            return (
                                <motion.div
                                    key={msg._id || index}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                                >
                                    <div className="flex items-center gap-1.5 mb-1 px-1">
                                        <span className="text-xs font-semibold text-stone-600">
                                            {isMe ? 'You' : `${msg.senderName} (Support)`}
                                        </span>
                                        {!isMe && (
                                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-amber-200">
                                                ADMIN
                                            </span>
                                        )}
                                    </div>

                                    <div
                                        className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl shadow-sm space-y-2 ${
                                            isMe
                                                ? 'bg-gradient-to-r from-nature-700 to-nature-800 text-white rounded-tr-none'
                                                : 'bg-white text-stone-800 rounded-tl-none border border-stone-200/80 shadow-stone-100'
                                        }`}
                                    >
                                        {/* Image attachment */}
                                        {msg.imageUrl && (
                                            <div
                                                className="overflow-hidden rounded-xl cursor-pointer group relative bg-black/5"
                                                onClick={() => setEnlargedImage(msg.imageUrl)}
                                            >
                                                <img
                                                    src={msg.imageUrl}
                                                    alt="Attached crop"
                                                    className="w-full max-h-64 object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                                                />
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-xs">
                                                    Click to view full photo
                                                </div>
                                            </div>
                                        )}

                                        {/* Text with clickable URLs */}
                                        {msg.message && (
                                            <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isMe ? 'text-white' : 'text-stone-800'}`}>
                                                {formatMessageWithLinks(msg.message)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Timestamp & read receipts */}
                                    <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-1 px-1">
                                        <Clock size={11} />
                                        <span>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && (
                                            <CheckCheck
                                                size={13}
                                                className={`ml-1 ${msg.readByAdmin ? 'text-nature-600' : 'text-stone-300'}`}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    )}

                    {/* Typing Indicator */}
                    <AnimatePresence>
                        {isOtherTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="flex items-center gap-2 text-stone-500 text-xs italic bg-white/80 border border-stone-200 px-3 py-1.5 rounded-full w-fit shadow-xs"
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Support Agent is typing
                                <span className="flex gap-0.5">
                                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>

                {/* Image Upload Preview */}
                {imagePreview && (
                    <div className="px-4 py-2 bg-stone-100/90 border-t border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={imagePreview}
                                alt="Selected preview"
                                className="w-14 h-14 object-cover rounded-lg border border-stone-300 shadow-sm"
                            />
                            <div>
                                <p className="text-xs font-semibold text-stone-700">Image attached</p>
                                <p className="text-[11px] text-stone-500">{imageFile?.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={clearImage}
                            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 hover:text-red-600 transition"
                            title="Remove image"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Message Input Footer */}
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-stone-200 flex items-center gap-2 sm:gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2.5 rounded-xl transition-colors border ${
                            imageFile
                                ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-200'
                        }`}
                        title="Upload crop photo / file"
                    >
                        <Image size={20} />
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Type your message or paste a link..."
                        className="flex-1 input-field py-2.5 px-4 text-sm bg-stone-50 focus:bg-white rounded-xl border border-stone-300 focus:border-nature-600 focus:ring-2 focus:ring-nature-500/20 outline-none transition"
                    />

                    <button
                        type="submit"
                        disabled={(!inputText.trim() && !imageFile) || isSending}
                        className="btn-primary py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-nature-600/30 transition-all font-medium text-sm"
                    >
                        {isSending ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Send size={16} />
                                <span className="hidden sm:inline">Send</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Lightbox / Fullscreen Image Modal */}
            {enlargedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setEnlargedImage(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <img
                            src={enlargedImage}
                            alt="Full preview"
                            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
                        />
                        <button
                            onClick={() => setEnlargedImage(null)}
                            className="absolute -top-3 -right-3 bg-white text-stone-800 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportChat;
