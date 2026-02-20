import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
            setUnreadCount(response.data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications (NotificationBell):', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const markRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state and re-fetch to keep counts accurate
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification read:', error);
        }
    };

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen(!isOpen)

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Notifications"
            >
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden z-20 border border-gray-200 dark:border-gray-700">
                    <div className="py-2">
                        <div className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                            Notifications
                        </div>
                        {notifications.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                No new notifications
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                                {notifications.map(notification => (
                                    <li key={notification.id} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!notification.is_read ? 'bg-blue-50 dark:bg-gray-900 border-l-4 border-blue-500' : ''}`}>
                                        <div className="flex justify-between items-start">
                                            <div className="text-sm text-gray-800 dark:text-gray-200">
                                                {notification.message}
                                            </div>
                                            {!notification.is_read && (
                                                <button
                                                    onClick={() => markRead(notification.id)}
                                                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Mark Read
                                                </button>
                                            )}
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
