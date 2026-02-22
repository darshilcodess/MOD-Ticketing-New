import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Briefcase, CheckCircle, Search, Filter, Clock, AlertTriangle } from 'lucide-react';

const PRIORITY_BADGE = {
    CRITICAL: 'bg-red-50 text-red-600 border-red-200',
    HIGH: 'bg-orange-50 text-orange-600 border-orange-200',
    MEDIUM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    LOW: 'bg-blue-50 text-blue-600 border-blue-200',
};

const PRIORITY_DOT = {
    CRITICAL: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-blue-500',
};

export default function AllAssignments() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingTicket, setResolvingTicket] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');
    const [resolveError, setResolveError] = useState('');
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('ALL');

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/tickets/');
            setTickets(data);
        } catch (err) {
            console.error('Error fetching tickets', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!resolvingTicket) return;
        setResolveError('');
        try {
            await api.patch(`/tickets/${resolvingTicket.id}/resolve`, { resolution_notes: resolutionNotes });
            setResolvingTicket(null);
            setResolutionNotes('');
            fetchTickets();
        } catch (err) {
            console.error('Failed to resolve', err);
            setResolveError(err?.response?.data?.detail || 'Failed to submit. Please try again.');
        }
    };

    const assignedTickets = tickets
        .filter(t => t.status === 'ALLOCATED')
        .filter(t => priorityFilter === 'ALL' || t.priority === priorityFilter)
        .filter(t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase())
        );

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-5">
            {/* ── Page Header ── */}
            <div className="flex items-center justify-between bg-white/30 backdrop-blur-xl p-5 rounded-2xl border border-white/40 shadow-xl">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/50 text-slate-600 hover:text-green-600 transition-all cursor-pointer shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">All Assignments</h1>
                        <p className="text-sm text-slate-500">
                            {assignedTickets.length} ticket{assignedTickets.length !== 1 ? 's' : ''} awaiting resolution
                        </p>
                    </div>
                </div>
                <div className="p-3 rounded-xl bg-green-500/10 text-green-600 border border-green-500/20 shadow-sm">
                    <Briefcase size={22} />
                </div>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by title or description…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/40 bg-white/60 backdrop-blur-sm text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/40 focus:border-green-300 shadow-sm transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-sm border border-white/40 rounded-xl px-3 py-1.5 shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPriorityFilter(p)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${priorityFilter === p
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                    : 'bg-transparent text-slate-500 border-slate-200 hover:border-green-300 hover:text-green-600'
                                }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="rounded-2xl border border-slate-200 bg-white/30 backdrop-blur-xl shadow-lg overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[3.5rem_2fr_3fr_7rem_8rem_8rem] items-center gap-4 px-5 py-3 bg-white/70 border-b border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Title</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Priority
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Submitted
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</span>
                </div>

                {/* Rows */}
                <AnimatePresence>
                    {assignedTickets.length > 0 ? assignedTickets.map((ticket, i) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ delay: i * 0.03 }}
                            className="grid grid-cols-[3.5rem_2fr_3fr_7rem_8rem_8rem] items-center gap-4 px-5 py-4 border-b border-slate-200 last:border-0 bg-white/20 hover:bg-green-50/40 transition-all duration-200 group"
                        >
                            {/* ID */}
                            <span className="text-xs font-bold text-slate-400">#{ticket.id}</span>

                            {/* Title */}
                            <div
                                className="flex items-center gap-2 min-w-0 cursor-pointer"
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                            >
                                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[ticket.priority] ?? 'bg-slate-400'}`} />
                                <span className="text-sm font-semibold text-slate-800 hover:text-green-700 line-clamp-1 transition-colors">{ticket.title}</span>
                            </div>

                            {/* Description */}
                            <span className="text-xs text-slate-500 line-clamp-1">{ticket.description}</span>

                            {/* Priority badge */}
                            <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${PRIORITY_BADGE[ticket.priority] ?? 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {ticket.priority}
                            </span>

                            {/* Date */}
                            <span className="text-xs text-slate-400">
                                {new Date(ticket.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>

                            {/* Mark for Review button */}
                            <div className="flex justify-end">
                                <button
                                    onClick={() => setResolvingTicket(ticket)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-green-700 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm group-hover:shadow-md"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Mark for Review
                                </button>
                            </div>
                        </motion.div>
                    )) : (
                        <div className="py-16 text-center text-slate-400">
                            <div className="inline-flex p-4 rounded-full bg-slate-100/60 mb-3">
                                <Briefcase size={28} className="text-slate-400" />
                            </div>
                            <p className="font-semibold text-slate-500">No assignments match your filters.</p>
                            <p className="text-sm mt-1">Try adjusting the search or priority filter.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Mark for Review Modal ── */}
            <AnimatePresence>
                {resolvingTicket && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border border-white/60 bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden">
                                <div className="h-2 bg-gradient-to-r from-green-500 via-white to-orange-600" />
                                <CardHeader>
                                    <CardTitle className="text-xl font-bold text-slate-900">Mark for Review</CardTitle>
                                    <CardDescription className="text-slate-500 line-clamp-1">{resolvingTicket.title}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleResolve} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Resolution Notes</label>
                                            <textarea
                                                className="w-full min-h-[140px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none transition-all"
                                                placeholder="Describe the solution implementation…"
                                                value={resolutionNotes}
                                                onChange={e => setResolutionNotes(e.target.value)}
                                                required
                                            />
                                        </div>
                                        {resolveError && (
                                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                                {resolveError}
                                            </div>
                                        )}
                                        <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                                            <Button type="button" variant="ghost" onClick={() => { setResolvingTicket(null); setResolveError(''); }} className="hover:bg-slate-100 text-slate-600 cursor-pointer">
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-600/20 cursor-pointer">
                                                Submit for Review
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
