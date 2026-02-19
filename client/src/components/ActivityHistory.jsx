import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ActivityHistory({ tickets }) {
    // Derive activities from tickets
    const activities = tickets.flatMap(ticket => {
        const events = [];

        // Ticket Creation Event
        events.push({
            id: `${ticket.id}_created`,
            ticketId: ticket.id,
            title: ticket.title,
            type: 'CREATED',
            date: new Date(ticket.created_at),
            priority: ticket.priority,
            status: ticket.status
        });

        // Ticket Resolution Event (if resolved)
        // Note: API doesn't seem to provide separate resolved_at, so we might useupdated_at if available, 
        // or just show it if status is RESOLVED. 
        // For now, since we only have created_at in the view_file output, 
        // we'll assume we can use created_at for creation, and if resolved, we might not have the exact date 
        // unless we use 'updated_at' if it exists on the object (it often does in DBs).
        // Let's check safely. If updated_at is close to created_at, it might be just an edit. 
        // Without a specific log, "Activity History" on just current state is static.
        // However, the prompt asks for "history of activities".
        // I will add a Resolved event if status is RESOLVED. I'll use ticket.updated_at if available, else ticket.created_at.

        if (ticket.status === 'RESOLVED') {
            events.push({
                id: `${ticket.id}_resolved`,
                ticketId: ticket.id,
                title: ticket.title,
                type: 'RESOLVED',
                date: ticket.updated_at ? new Date(ticket.updated_at) : new Date(ticket.created_at), // Fallback if updated_at missing
                priority: ticket.priority,
                status: ticket.status
            });
        }

        return events;
    }).sort((a, b) => b.date - a.date); // Newest first

    return (
        <div className="bg-card/50 p-4 rounded-lg border border-white/5 backdrop-blur-sm h-fit">
            <h2 className="text-xl font-semibold text-foreground mb-4">Activity History</h2>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {activities.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No recent activity</p>
                ) : (
                    activities.map((activity, index) => (
                        <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative pl-4 border-l border-white/10 last:border-0 pb-4 last:pb-0"
                        >
                            <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-background border border-muted-foreground/50 z-10" />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    {activity.type === 'CREATED' ? (
                                        <span className="text-blue-400 text-xs font-medium px-1.5 py-0.5 bg-blue-400/10 rounded border border-blue-400/20">
                                            Ticket Created
                                        </span>
                                    ) : (
                                        <span className="text-green-400 text-xs font-medium px-1.5 py-0.5 bg-green-400/10 rounded border border-green-400/20">
                                            Ticket Resolved
                                        </span>
                                    )}
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Clock size={10} />
                                        {activity.date.toLocaleDateString()} {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-foreground line-clamp-1">
                                    {activity.title}
                                </p>
                                <div className="text-xs text-muted-foreground">
                                    Priority: <span className={
                                        activity.priority === 'CRITICAL' ? 'text-red-400' :
                                            activity.priority === 'HIGH' ? 'text-orange-400' :
                                                activity.priority === 'MEDIUM' ? 'text-yellow-400' :
                                                    'text-blue-400'
                                    }>{activity.priority}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
