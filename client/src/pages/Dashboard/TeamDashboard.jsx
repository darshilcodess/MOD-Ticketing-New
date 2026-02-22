import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Briefcase, ArrowRight } from 'lucide-react';
import ActivityHistory from '../../components/ActivityHistory';

export default function TeamDashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingTicket, setResolvingTicket] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            // Fetch all tickets to show history, will filter for assigned tasks
            const { data } = await api.get('/tickets/');
            setTickets(data);
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter for tickets that are currently allocated/assigned to the team for action
    const assignedTickets = tickets.filter(t => t.status === 'ALLOCATED');

    const [resolveError, setResolveError] = useState('');

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!resolvingTicket) return;
        setResolveError('');
        try {
            await api.patch(`/tickets/${resolvingTicket.id}/resolve`, { resolution_notes: resolutionNotes });
            setResolvingTicket(null);
            setResolutionNotes('');
            fetchTickets();
        } catch (error) {
            console.error("Failed to resolve", error);
            setResolveError(error?.response?.data?.detail || 'Failed to resolve ticket. Please try again.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center bg-white/30 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">
                        Team Dashboard
                    </h1>
                    <p className="text-slate-600">Manage assigned tickets and track resolution</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-white/50 rounded-full text-xs font-bold text-slate-700 border border-white/20 shadow-sm flex items-center gap-2">
                        <Briefcase size={14} className="text-orange-600" />
                        {assignedTickets.length} Pending Actions
                    </span>
                </div>
            </div>

            {/* Assigned Tasks Section */}
            <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-gradient-to-b from-green-400 to-green-600 rounded-full shadow-lg shadow-green-500/30"></div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Assignments</h2>
                    </div>

                    <Button variant="ghost" size="sm" className="text-slate-500 hover:text-green-600 cursor-pointer" onClick={() => navigate('/team/assignments')}>
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {assignedTickets.slice(0, 6).map(ticket => (
                            <Card
                                key={ticket.id}
                                onClick={() => navigate(`/tickets/${ticket.id}`)}
                                className="group relative overflow-hidden border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 shadow-sm cursor-pointer"
                            >
                                <div className={`h-1 w-full bg-gradient-to-r ${ticket.priority === 'CRITICAL' ? 'from-red-500 to-red-600' :
                                    ticket.priority === 'HIGH' ? 'from-orange-500 to-orange-600' :
                                        ticket.priority === 'MEDIUM' ? 'from-yellow-500 to-yellow-600' :
                                            'from-blue-500 to-blue-600'
                                    }`} />

                                <CardHeader className="pb-3 pt-4">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">{ticket.title}</CardTitle>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${ticket.priority === 'CRITICAL' ? 'bg-red-50 text-red-600 border-red-200' :
                                            ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                ticket.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                            }`}>
                                            {ticket.priority}
                                        </span>
                                    </div>
                                    <CardDescription className="text-xs text-slate-400 font-medium">
                                        ID: #{ticket.id} • Status: <span className="text-blue-600 font-bold">{ticket.status}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                                        {ticket.description}
                                    </p>
                                    <Button
                                        onClick={(e) => { e.stopPropagation(); setResolvingTicket(ticket); }}
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 group-hover:scale-[1.02] transition-transform duration-200 border-none"
                                    >
                                        <CheckCircle size={16} className="mr-2" /> Mark for Review
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </AnimatePresence>

                    {assignedTickets.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-500 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 border-dashed">
                            <div className="inline-flex p-4 rounded-full bg-slate-100 mb-3 text-slate-400 shadow-inner">
                                <Briefcase size={32} />
                            </div>
                            <p className="font-medium">No pending tasks assigned to your team.</p>
                        </div>
                    )}
                </div>
            </section >

            <div className="mt-8">
                <ActivityHistory tickets={tickets} limit={15} viewAllRoute="/activity" />
            </div>

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
                                <div className="h-2 bg-gradient-to-r from-green-500 via-white to-orange-600"></div>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-slate-900">Mark for Review</CardTitle>
                                    <CardDescription className="text-slate-500">Provide details on the resolution for unit approval.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleResolve} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Resolution Notes</label>
                                            <textarea
                                                className="w-full min-h-[150px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-all focus-visible:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none"
                                                placeholder="Describe the solution implementation..."
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
                                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                                            <Button type="button" variant="ghost" onClick={() => { setResolvingTicket(null); setResolveError(''); }} className="hover:bg-slate-100 text-slate-600">
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="default" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg shadow-green-600/20">
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
        </div >
    );
}
