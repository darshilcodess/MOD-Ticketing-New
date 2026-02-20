import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Plus, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityHistory from '../../components/ActivityHistory';

export default function UnitDashboard() {
    const navigate = useNavigate();
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

    const handleApprove = async (e, ticketId) => {
        e.stopPropagation();
        try {
            await api.patch(`/tickets/${ticketId}/close`);
            fetchTickets();
        } catch (error) {
            console.error("Failed to approve ticket", error);
        }
    };

    const handleReallocateToG1 = async (e, ticketId) => {
        e.stopPropagation();
        try {
            await api.patch(`/tickets/${ticketId}/reallocate-to-g1`);
            fetchTickets();
        } catch (error) {
            console.error("Failed to reallocate to G1", error);
        }
    };

    const handleReallocateToTeam = async (e, ticketId) => {
        e.stopPropagation();
        try {
            await api.patch(`/tickets/${ticketId}/reallocate-to-team`);
            fetchTickets();
        } catch (error) {
            console.error("Failed to reallocate to same team", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'ALLOCATED': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'RESOLVED': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'CLOSED': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority) {
            case 'CRITICAL': return { line: 'bg-red-500', badge: 'bg-red-50 text-red-700 border-red-200' };
            case 'HIGH': return { line: 'bg-orange-500', badge: 'bg-orange-50 text-orange-700 border-orange-200' };
            case 'MEDIUM': return { line: 'bg-yellow-500', badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' };
            case 'LOW': return { line: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700 border-blue-200' };
            default: return { line: 'bg-slate-500', badge: 'bg-slate-50 text-slate-700 border-slate-200' };
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

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Active Tickets Section */}
                <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg min-h-[350px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-500/30"></div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Active Tickets</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 text-[10px] font-extrabold border border-orange-200 shadow-sm">
                                {tickets.filter(t => t.status === 'OPEN').length} PENDING
                            </span>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-500 hover:text-orange-600">
                                View All <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-3 grid-cols-1">
                        <AnimatePresence>
                            {tickets.filter(t => t.status === 'OPEN').slice(0, 3).map(ticket => (
                                <Card
                                    key={ticket.id}
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="group border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 overflow-hidden shadow-sm cursor-pointer"
                                >
                                    <div className={`h-1 w-full ${getPriorityStyles(ticket.priority).line}`} />
                                    <CardHeader className="pb-2 pt-3 px-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-800 line-clamp-1 text-sm">{ticket.title}</h3>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${getPriorityStyles(ticket.priority).badge}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] pt-1">
                                                    <span className={`px-1.5 py-0.5 rounded font-medium border ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Clock size={10} /> {new Date(ticket.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-3">
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                            {ticket.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </AnimatePresence>
                        {tickets.filter(t => t.status === 'OPEN').length === 0 && (
                            <div className="col-span-full py-8 text-center text-slate-500 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 border-dashed">
                                <div className="inline-flex p-3 rounded-full bg-slate-100 mb-3 text-slate-400"><CheckCircle2 size={24} /></div>
                                <p className="font-medium text-sm">All caught up! No open tickets.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pending Review Section */}
                <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg min-h-[350px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/30"></div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Pending Review</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-[10px] font-extrabold border border-yellow-200 shadow-sm">
                                {tickets.filter(t => t.status === 'RESOLVED').length} ACTION REQUIRED
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-3 grid-cols-1">
                        <AnimatePresence>
                            {tickets.filter(t => t.status === 'RESOLVED').map(ticket => (
                                <Card
                                    key={ticket.id}
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="group border border-yellow-200 bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 overflow-hidden shadow-sm cursor-pointer"
                                >
                                    <div className={`h-1 w-full bg-yellow-500`} />
                                    <CardHeader className="pb-2 pt-3 px-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-800 line-clamp-1 text-sm">{ticket.title}</h3>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-yellow-200 text-yellow-700 bg-yellow-50`}>
                                                        PENDING REVIEW
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-4 pb-3">
                                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                                            {ticket.description}
                                        </p>
                                        <div className="p-2 bg-yellow-50 border border-yellow-100 rounded text-[10px] text-yellow-800 mb-3 italic">
                                            "{ticket.resolution_notes}"
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={(e) => handleApprove(e, ticket.id)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white h-7 text-[10px] font-bold"
                                        >
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Approve &amp; Close
                                        </Button>
                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                            <Button
                                                size="sm"
                                                onClick={(e) => handleReallocateToTeam(e, ticket.id)}
                                                className="bg-orange-100 hover:bg-orange-200 text-orange-800 h-7 text-[9px] font-bold border border-orange-200"
                                            >
                                                Reallocate to same Team
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={(e) => handleReallocateToG1(e, ticket.id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-700 h-7 text-[9px] font-bold border border-red-200"
                                            >
                                                Reallocate to G1
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </AnimatePresence>
                        {tickets.filter(t => t.status === 'RESOLVED').length === 0 && (
                            <div className="col-span-full py-8 text-center text-slate-500 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 border-dashed">
                                <p className="font-medium text-xs">No resolutions pending your review.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Closed History Section */}
                <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg min-h-[350px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/30"></div>
                            <h2 className="text-xl font-bold text-slate-800 tracking-tight">Resolved History</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 text-[10px] font-extrabold border border-green-200 shadow-sm">
                                {tickets.filter(t => t.status === 'CLOSED').length} COMPLETED
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 grid-cols-1">
                        <AnimatePresence>
                            {tickets.filter(t => t.status === 'CLOSED').map(ticket => (
                                <Card
                                    key={ticket.id}
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="group border border-white/40 bg-white/40 backdrop-blur-md opacity-80 hover:opacity-100 transition-all duration-300 overflow-hidden shadow-sm cursor-pointer"
                                >
                                    <div className={`h-1 w-full bg-green-500`} />
                                    <CardHeader className="pb-3 pt-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-1 w-full">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-slate-700 line-clamp-1 text-lg decoration-slate-400/50">{ticket.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-200 text-green-700 bg-green-50`}>
                                                        CLOSED
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
                        {tickets.filter(t => t.status === 'CLOSED').length === 0 && (
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
