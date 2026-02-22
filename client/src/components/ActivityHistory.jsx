import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

/**
 * ActivityHistory
 * Props:
 *  - tickets: array of ticket objects
 *  - limit: max activities shown (default 3). Pass Infinity for the full-list page.
 *  - viewAllRoute: path to navigate to when "View All" is clicked (omit to hide the button)
 */
export default function ActivityHistory({ tickets, limit = 15, viewAllRoute }) {
    const navigate = useNavigate();

    const activities = tickets.flatMap(ticket => {
        const events = [];
        events.push({
            id: `${ticket.id}_created`,
            ticketId: ticket.id,
            title: ticket.title,
            type: 'CREATED',
            date: new Date(ticket.created_at),
            priority: ticket.priority,
            status: ticket.status,
        });
        if (ticket.status === 'RESOLVED') {
            events.push({
                id: `${ticket.id}_resolved`,
                ticketId: ticket.id,
                title: ticket.title,
                type: 'RESOLVED',
                date: ticket.updated_at ? new Date(ticket.updated_at) : new Date(ticket.created_at),
                priority: ticket.priority,
                status: ticket.status,
            });
        }
        return events;
    }).sort((a, b) => b.date - a.date);

    const visible = activities.slice(0, limit);
    const hasMore = activities.length > limit;

    return (
        <div className="bg-white/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/40">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
                        Activity Timeline
                    </span>
                    {hasMore && (
                        <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 border border-orange-200">
                            +{activities.length - limit} more
                        </span>
                    )}
                </h2>
                {viewAllRoute && (
                    <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-orange-600 cursor-pointer" onClick={() => navigate(viewAllRoute)}>
                        View All <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                )}
            </div>

            {/* Timeline rows */}
            {visible.length === 0 ? (
                <div className="text-center py-8 text-slate-500 italic flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                        <Clock className="w-5 h-5 text-slate-300" />
                    </div>
                    No recent activity to display.
                </div>
            ) : (
                <div className="relative space-y-16 px-2 min-h-[80px]">
                    {/* Chunk into rows of 5 for the snake layout */}
                    {(() => {
                        const itemsPerRow = 5;
                        const chunks = [];
                        for (let i = 0; i < visible.length; i += itemsPerRow) {
                            chunks.push(visible.slice(i, i + itemsPerRow));
                        }
                        return chunks.map((chunk, rowIndex) => {
                            const isEvenRow = rowIndex % 2 === 0;
                            const isLastRow = rowIndex === chunks.length - 1;
                            return (
                                <div key={rowIndex} className="relative">
                                    <div className={`flex items-start justify-start ${isEvenRow ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 -z-10 rounded-full opacity-70" />
                                        {chunk.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="w-1/5 px-2 relative group cursor-pointer"
                                                onClick={() => navigate(`/tickets/${activity.ticketId}`)}
                                            >
                                                <div className="flex flex-col items-center z-10">
                                                    <div className={`w-8 h-8 rounded-full border-[3px] border-white shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${activity.type === 'CREATED' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                                                        {activity.type === 'CREATED' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                                    </div>
                                                    <div className="mt-3 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-slate-100 w-full hover:shadow-md transition-shadow duration-200">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${activity.type === 'CREATED' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                                {activity.type}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                                                                {activity.date.toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 text-xs line-clamp-1 mb-0.5" title={activity.title}>
                                                            {activity.title}
                                                        </h4>
                                                        <span className={`text-[9px] font-bold ${activity.priority === 'CRITICAL' ? 'text-red-500' : activity.priority === 'HIGH' ? 'text-orange-500' : activity.priority === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-500'}`}>
                                                            {activity.priority}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {!isLastRow && (
                                        <div
                                            className={`absolute top-4 h-16 w-16 border-slate-300/60 border-4 -z-20 ${isEvenRow ? 'right-[calc(10%-2rem)] rounded-r-[2rem] border-l-0' : 'left-[calc(10%-2rem)] rounded-l-[2rem] border-r-0'}`}
                                            style={{ height: 'calc(100% + 4rem)' }}
                                        />
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            )}
        </div>
    );
}
