import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react';

const TYPE_STYLES = {
    CREATED: { badge: 'bg-blue-50 text-blue-600 border-blue-200', icon: AlertCircle, dot: 'bg-blue-400' },
    RESOLVED: { badge: 'bg-green-50 text-green-600 border-green-200', icon: CheckCircle2, dot: 'bg-green-400' },
};

const PRIORITY_BADGE = {
    CRITICAL: 'bg-red-50 text-red-600 border-red-200',
    HIGH: 'bg-orange-50 text-orange-600 border-orange-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-blue-50 text-blue-600 border-blue-200',
};

export default function AllActivityTimeline() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try { const { data } = await api.get('/tickets/'); setTickets(data); }
        catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

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

    const filtered = activities
        .filter(a => typeFilter === 'ALL' || a.type === typeFilter)
        .filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/30 backdrop-blur-xl p-5 rounded-2xl border border-white/40 shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/50 text-slate-600 hover:text-orange-600 transition-all cursor-pointer shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Full Activity Timeline</h1>
                        <p className="text-sm text-slate-500">{filtered.length} event{filtered.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-sm">
                    <Clock size={22} />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="Search by ticket title…" value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-300 shadow-sm transition-all" />
                </div>
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl px-3 py-1.5 shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {['ALL', 'CREATED', 'RESOLVED'].map(t => (
                        <button key={t} onClick={() => setTypeFilter(t)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${typeFilter === t ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-transparent text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-slate-200 bg-white/30 backdrop-blur-xl shadow-lg overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-[3.5rem_2fr_6rem_7rem_7rem_8rem] items-center gap-4 px-5 py-3 bg-white/70 border-b border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ticket Title</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Event</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Priority</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Date
                    </span>
                </div>

                <AnimatePresence>
                    {filtered.length > 0 ? filtered.map((activity, i) => {
                        const styles = TYPE_STYLES[activity.type] ?? TYPE_STYLES.CREATED;
                        const Icon = styles.icon;
                        return (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 8 }}
                                transition={{ delay: i * 0.02 }}
                                onClick={() => navigate(`/tickets/${activity.ticketId}`)}
                                className="grid grid-cols-[3.5rem_2fr_6rem_7rem_7rem_8rem] items-center gap-4 px-5 py-3.5 border-b border-slate-200 last:border-0 bg-white/20 hover:bg-orange-50/40 transition-all duration-150 cursor-pointer group"
                            >
                                <span className="text-xs font-bold text-slate-400">#{activity.ticketId}</span>

                                <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${styles.dot}`} />
                                    <span className="text-sm font-semibold text-slate-800 group-hover:text-orange-700 line-clamp-1 transition-colors">{activity.title}</span>
                                </div>

                                <span className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles.badge}`}>
                                    <Icon className="w-3 h-3" /> {activity.type}
                                </span>

                                <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_BADGE[activity.priority] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                    {activity.priority}
                                </span>

                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{activity.status}</span>

                                <span className="text-xs text-slate-400">
                                    {activity.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                            </motion.div>
                        );
                    }) : (
                        <div className="py-16 text-center text-slate-400">
                            <div className="inline-flex p-4 rounded-full bg-orange-50/60 mb-3"><Clock size={28} className="text-orange-400" /></div>
                            <p className="font-semibold text-slate-500">No activity matches your filters.</p>
                            <p className="text-sm mt-1">Try adjusting the search or event type filter.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
