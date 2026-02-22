import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityHistory from '../../components/ActivityHistory';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Inbox } from 'lucide-react';

export default function G1Dashboard() {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [allocation, setAllocation] = useState({ team_id: '', priority: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ticketsRes, teamsRes] = await Promise.all([
                api.get('/tickets/'), // Fetch ALL tickets for history
                api.get('/teams/')
            ]);
            setTickets(ticketsRes.data);
            setTeams(teamsRes.data);
        } catch (error) {
            console.error("error fetching data", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter pending tickets for allocation view
    const pendingTickets = tickets.filter(ticket => ticket.status === 'OPEN');

    const handleAllocate = async (e) => {
        e.preventDefault();
        if (!selectedTicket || !allocation.team_id) return;
        try {
            await api.patch(`/tickets/${selectedTicket.id}/allocate`, {
                team_id: parseInt(allocation.team_id),
                priority: allocation.priority || selectedTicket.priority
            });
            setSelectedTicket(null);
            fetchData();
            setAllocation({ team_id: '', priority: '' });
        } catch (error) {
            console.error("Allocation failed", error);
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
                        Admin Dashboard (G1)
                    </h1>
                    <p className="text-slate-600">Allocate and manage unit requests</p>
                </div>
                <div className="p-3 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/20 shadow-sm">
                    <Inbox size={24} />
                </div>
            </div>

            {/* Incoming Requests Section */}
            <section className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg min-h-[500px]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-lg shadow-orange-500/30"></div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Incoming Requests</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-extrabold border border-orange-200 shadow-sm">
                            {pendingTickets.length} PENDING
                        </span>
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-orange-600 cursor-pointer" onClick={() => navigate('/g1/incoming')}>
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                        {pendingTickets.slice(0, 6).map(ticket => (
                            <Card
                                key={ticket.id}
                                className="group relative overflow-hidden border border-white/40 bg-white/60 backdrop-blur-xl hover:bg-white/70 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 shadow-sm"
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
                                        ID: #{ticket.id}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                                        {ticket.description}
                                    </p>
                                    <Button
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="w-full bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20 group-hover:scale-[1.02] transition-transform duration-200"
                                    >
                                        Allocate <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </AnimatePresence>

                    {pendingTickets.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-500 bg-white/40 backdrop-blur-sm rounded-xl border border-white/40 border-dashed">
                            <div className="inline-flex p-4 rounded-full bg-slate-100 mb-3 text-slate-400 shadow-inner">
                                <Inbox size={32} />
                            </div>
                            <p className="font-medium">No open tickets pending allocation.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Activity History Section */}
            <ActivityHistory tickets={tickets} />

            <AnimatePresence>
                {selectedTicket && (
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
                                <div className="h-2 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
                                <CardHeader>
                                    <CardTitle className="text-2xl font-bold text-slate-900">Allocate Ticket #{selectedTicket.id}</CardTitle>
                                    <CardDescription className="text-slate-500">Assign this task to a specialized team.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAllocate} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Assign to Team</label>
                                            <select
                                                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                                value={allocation.team_id}
                                                onChange={e => setAllocation({ ...allocation, team_id: e.target.value })}
                                                required
                                            >
                                                <option value="" className="text-slate-400">Select Team</option>
                                                {teams.map(t => <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Adjust Priority</label>
                                            <select
                                                className="flex h-11 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                                                value={allocation.priority}
                                                onChange={e => setAllocation({ ...allocation, priority: e.target.value })}
                                            >
                                                <option value="">Keep {selectedTicket.priority}</option>
                                                <option value="LOW">Low</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HIGH">High</option>
                                                <option value="CRITICAL">Critical</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 mt-4">
                                            <Button type="button" variant="ghost" onClick={() => setSelectedTicket(null)} className="hover:bg-slate-100 text-slate-600">
                                                Cancel
                                            </Button>
                                            <Button type="submit" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20">
                                                Confirm Allocation
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
