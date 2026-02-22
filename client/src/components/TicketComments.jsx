import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User as UserIcon } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const TicketComments = ({ ticketId }) => {
    const { user: currentUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const commentsEndRef = useRef(null);

    const fetchComments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/tickets/${ticketId}/comments`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComments(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
        // Poll for new comments every 10 seconds
        const interval = setInterval(fetchComments, 10000);
        return () => clearInterval(interval);
    }, [ticketId]);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/tickets/${ticketId}/comments`,
                { content: newComment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewComment('');
            fetchComments();
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">Comments</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {loading ? (
                    <div className="text-center text-gray-500 py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-gray-500 py-8 italic">No comments yet. Start the conversation!</div>
                ) : (
                    comments.map((comment) => {
                        const isMe = currentUser ? comment.user_id === currentUser.id : comment.is_me;
                        return (
                            <div
                                key={comment.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl p-3 shadow-sm ${isMe
                                        ? 'bg-blue-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}
                                >
                                    {!isMe && (
                                        <div className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                                            <UserIcon size={12} />
                                            {comment.user_name}
                                        </div>
                                    )}
                                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                    <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {formatDate(comment.created_at)}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={commentsEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-100">
                <div className="relative">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Type your comment..."
                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TicketComments;
