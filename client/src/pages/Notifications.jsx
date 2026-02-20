import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, AlertCircle, Info, Wrench, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const getIcon = (message) => {
    const m = message?.toLowerCase() || '';
    if (m.includes('created')) return <Bell className="text-blue-500" size={20} />;
    if (m.includes('allocated')) return <Info className="text-yellow-500" size={20} />;
    if (m.includes('resolved')) return <CheckCircle className="text-green-500" size={20} />;
    if (m.includes('closed')) return <CheckCheck className="text-emerald-600" size={20} />;
    if (m.includes('comment')) return <Wrench className="text-purple-500" size={20} />;
    return <AlertCircle className="text-gray-400" size={20} />;
};

const getAccent = (message, is_read) => {
    if (is_read) return 'border-gray-100 bg-white opacity-70';
    const m = message?.toLowerCase() || '';
    if (m.includes('created')) return 'border-blue-200 bg-blue-50/30 ring-1 ring-blue-100';
    if (m.includes('allocated')) return 'border-yellow-200 bg-yellow-50/30 ring-1 ring-yellow-100';
    if (m.includes('resolved')) return 'border-green-200 bg-green-50/30 ring-1 ring-green-100';
    if (m.includes('closed')) return 'border-emerald-200 bg-emerald-50/30 ring-1 ring-emerald-100';
    return 'border-orange-200 bg-orange-50/20 ring-1 ring-orange-100';
};

const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [markingAll, setMarkingAll] = useState(false);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_URL}/notifications/`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllRead = async () => {
        setMarkingAll(true);
        const unread = notifications.filter(n => !n.is_read);
        await Promise.all(unread.map(n => markRead(n.id)));
        setMarkingAll(false);
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3 text-gray-400">
                    <RefreshCw size={32} className="animate-spin" />
                    <p>Loading notifications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto px-2 pb-10">
            {/* Header */}
            <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl shadow-sm border border-orange-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Bell size={24} className="text-orange-500" />
                        Notifications
                    </h2>
                    <p className="text-gray-500 mt-1 text-sm">
                        {unreadCount > 0 ? (
                            <span className="font-semibold text-orange-600">{unreadCount} unread</span>
                        ) : 'All caught up!'}
                        {' '}— {notifications.length} total
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllRead}
                        disabled={markingAll}
                        className="flex items-center gap-2 text-sm font-medium text-orange-700 bg-white border border-orange-200 px-4 py-2 rounded-xl shadow-sm hover:bg-orange-50 transition-colors disabled:opacity-50"
                    >
                        <CheckCheck size={16} />
                        {markingAll ? 'Marking...' : 'Mark all read'}
                    </button>
                )}
            </div>

            {/* Empty state */}
            {notifications.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-gray-300" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700">No Notifications</h3>
                    <p className="text-gray-400 mt-1 text-sm">You're all caught up. Check back later.</p>
                </div>
            )}

            {/* List */}
            <AnimatePresence>
                <div className="space-y-3">
                    {notifications.map((n, i) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className={`p-4 rounded-2xl border shadow-sm transition-all ${getAccent(n.message, n.is_read)}`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                                    {getIcon(n.message)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-snug ${n.is_read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>
                                        {n.message}
                                    </p>
                                    {n.ticket_id && (
                                        <button
                                            onClick={() => navigate(`/tickets/${n.ticket_id}`)}
                                            className="text-xs text-orange-600 hover:text-orange-700 mt-1 font-medium underline underline-offset-2"
                                        >
                                            View Ticket #{n.ticket_id}
                                        </button>
                                    )}
                                    <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                                        <Clock size={10} />
                                        {timeAgo(n.created_at)}
                                    </p>
                                </div>

                                {/* Action */}
                                {!n.is_read && (
                                    <button
                                        onClick={() => markRead(n.id)}
                                        className="flex-shrink-0 text-xs text-orange-600 hover:text-orange-700 font-semibold px-3 py-1.5 bg-white border border-orange-200 rounded-xl hover:bg-orange-50 transition-colors shadow-sm"
                                    >
                                        Mark read
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </AnimatePresence>
        </div>
    );
};

export default Notifications;
