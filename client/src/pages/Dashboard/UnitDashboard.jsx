import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityHistory from '../../components/ActivityHistory';

export default function UnitDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTicket, setNewTicket] = useState({ title: '', description: '', priority: 'MEDIUM' });

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/tickets/');
            setTickets(data);
        } catch (error) {
            console.error("Failed to fetch tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tickets/', newTicket);
            setShowCreateModal(false);
            setNewTicket({ title: '', description: '', priority: 'MEDIUM' });
            fetchTickets();
        } catch (error) {
            console.error("Failed to create ticket", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'RESOLVED': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-500 text-red-600 bg-red-50 border-red-200';
            case 'HIGH': return 'bg-orange-500 text-orange-600 bg-orange-50 border-orange-200';
            case 'MEDIUM': return 'bg-yellow-500 text-yellow-700 bg-yellow-50 border-yellow-200';
            case 'LOW': return 'bg-blue-500 text-blue-600 bg-blue-50 border-blue-200';
            default: return 'bg-slate-500 text-slate-600 bg-slate-50 border-slate-200';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white/30 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">
                        Unit Dashboard
                    </h1>
                    <p className="text-slate-600">Manage and track your service requests</p>
                </div>
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Ticket
                </Button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Active Tickets Section */}
                <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-500/30"></div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Active Tickets</h2>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-extrabold border border-orange-200 shadow-sm">
                            {tickets.filter(t => t.status === 'OPEN').length} PENDING
                        </span>
                    </div>

                    <div className="grid gap-4 grid-cols-1">
                        <AnimatePresence>
                            {tickets.filter(t => t.status === 'OPEN').map(ticket => (
                                <Card
                                    key={ticket.id}
                                    className="group border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden shadow-sm"
                                >
                                    <div className={`h-1 w-full ${getPriorityColor(ticket.priority).split(' ')[0]}`} />
                                    <CardHeader className="pb-3 pt-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-800 line-clamp-1 text-lg">{ticket.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs pt-1">
                                                    <span className={`px-2 py-0.5 rounded font-medium border ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                            {ticket.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </AnimatePresence>
                        {tickets.filter(t => t.status === 'OPEN').length === 0 && (
                            <div className="col-span-full py-12 text-center text-slate-500 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 border-dashed">
                                <div className="inline-flex p-3 rounded-full bg-slate-100 mb-3 text-slate-400"><CheckCircle2 size={24} /></div>
                                <p className="font-medium">All caught up! No open tickets.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Resolved Tickets Section */}
                <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/30"></div>
                            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Resolved History</h2>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-extrabold border border-green-200 shadow-sm">
                            {tickets.filter(t => t.status === 'RESOLVED').length} COMPLETED
                        </span>
                    </div>

                    <div className="grid gap-4 grid-cols-1">
                        <AnimatePresence>
                            {tickets.filter(t => t.status === 'RESOLVED').map(ticket => (
                                <Card
                                    key={ticket.id}
                                    className="group border border-white/40 bg-white/40 backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-300 overflow-hidden shadow-sm"
                                >
                                    <div className={`h-1 w-full bg-green-500`} />
                                    <CardHeader className="pb-3 pt-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-700 line-clamp-1 text-lg decoration-slate-400/50">{ticket.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-200 text-green-700 bg-green-50`}>
                                                        RESOLVED
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs pt-1">
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                                            {ticket.description}
                                        </p>

                                        {ticket.resolution_notes && (
                                            <div className="mt-3 p-3 bg-green-50/80 border border-green-200/60 rounded-md text-sm text-green-800">
                                                <div className="flex items-center gap-2 font-bold mb-1 text-green-700">
                                                    <CheckCircle2 size={14} /> Resolution
                                                </div>
                                                {ticket.resolution_notes}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </AnimatePresence>
                        {tickets.filter(t => t.status === 'RESOLVED').length === 0 && (
                            <div className="col-span-full py-8 text-center text-slate-400 italic">
                                No history available.
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <div className="mt-8">
                <ActivityHistory tickets={tickets} />
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-lg"
                        >
                            <Card className="border-0 shadow-2xl bg-white rounded-xl overflow-hidden">
                                <div className="bg-slate-900 p-6 border-b border-slate-800">
                                    <CardTitle className="text-white text-xl">Create New Ticket</CardTitle>
                                    <CardDescription className="text-slate-400">Submit a new issue for the team to resolve.</CardDescription>
                                </div>
                                <CardContent className="p-6">
                                    <form onSubmit={handleCreateTicket} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Title</label>
                                            <Input
                                                placeholder="Brief summary of the issue"
                                                value={newTicket.title}
                                                onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                                required
                                                className="border-slate-200 focus:border-orange-500 focus:ring-orange-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Description</label>
                                            <textarea
                                                className="w-full min-h-[120px] rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/20 focus-visible:border-orange-500 resize-none"
                                                placeholder="Please provide detailed information about the issue..."
                                                value={newTicket.description}
                                                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Priority Level</label>
                                            <div className="grid grid-cols-4 gap-2">
                                                {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((p) => (
                                                    <button
                                                        key={p}
                                                        type="button"
                                                        onClick={() => setNewTicket({ ...newTicket, priority: p })}
                                                        className={`px-2 py-2 text-xs font-bold rounded-md border transition-all ${newTicket.priority === p
                                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {p}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)} className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-6">
                                                Submit Ticket
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
