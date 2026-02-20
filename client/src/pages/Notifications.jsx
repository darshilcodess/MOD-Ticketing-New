import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, AlertCircle, Info } from 'lucide-react';

const DUMMY_NOTIFICATIONS = [
    {
        id: 1,
        type: 'TICKET_CREATED',
        message: 'New Ticket Created: Electrical Failure in Block A',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
        is_read: false
    },
    {
        id: 2,
        type: 'TICKET_ALLOCATED',
        message: 'Ticket #12 Allocated to Electrical Team',
        created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        is_read: true
    },
    {
        id: 3,
        type: 'TICKET_RESOLVED',
        message: 'Ticket #10 Resolved by Team Leader',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        is_read: true
    },
    {
        id: 4,
        type: 'SYSTEM_ALERT',
        message: 'System Maintenance Scheduled for tonight',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        is_read: true
    }
];

const Notifications = () => {
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

    const markAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'TICKET_CREATED': return <Bell className="text-blue-500" />;
            case 'TICKET_RESOLVED': return <Check className="text-green-500" />;
            case 'TICKET_ALLOCATED': return <Info className="text-yellow-500" />;
            case 'SYSTEM_ALERT': return <AlertCircle className="text-red-500" />;
            default: return <Bell className="text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl shadow-sm border border-orange-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                    <p className="text-gray-600 mt-1">Stay updated with ticket activities.</p>
                </div>
                <div className="p-3 bg-white rounded-full shadow-md text-orange-500">
                    <Bell size={24} />
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No Notifications</h3>
                    <p className="text-gray-500 mt-1">You're all caught up!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl shadow-sm border transition-all ${notification.is_read
                                ? 'bg-white border-gray-100 opacity-75'
                                : 'bg-white border-orange-200 shadow-md ring-1 ring-orange-100'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-full ${notification.is_read ? 'bg-gray-100' : 'bg-orange-50'}`}>
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-semibold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                                        {notification.type.replace('_', ' ')}
                                    </h4>
                                    <p className="text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs text-orange-600 hover:text-orange-700 font-medium px-3 py-1 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors"
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
