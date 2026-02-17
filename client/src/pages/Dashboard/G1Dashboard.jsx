import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Inbox } from 'lucide-react';

export default function G1Dashboard() {
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
                api.get('/tickets/?status=OPEN'),
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
            <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Inbox size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Incoming Requests</h2>
                    <p className="text-sm text-muted-foreground">Allocate unit requests to appropriate teams</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {tickets.map(ticket => (
                        <Card key={ticket.id} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Inbox size={64} />
                            </div>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-white">{ticket.title}</CardTitle>
                                <CardDescription>Priority: <span className="text-yellow-400 font-medium">{ticket.priority}</span></CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                                    {ticket.description}
                                </p>
                                <Button
                                    onClick={() => setSelectedTicket(ticket)}
                                    className="w-full gap-2 group-hover:bg-primary/90"
                                >
                                    Allocate <ArrowRight size={16} />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </AnimatePresence>

                {tickets.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
                        <Inbox size={48} className="mb-4 opacity-50" />
                        <p>No open tickets pending allocation.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {selectedTicket && (
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
                            className="w-full max-w-md"
                        >
                            <Card className="border-white/10 bg-[#0F172A]">
                                <CardHeader>
                                    <CardTitle>Allocate Ticket #{selectedTicket.id}</CardTitle>
                                    <CardDescription>Assign this task to a specialized team.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleAllocate} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-200">Assign to Team</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={allocation.team_id}
                                                onChange={e => setAllocation({ ...allocation, team_id: e.target.value })}
                                                required
                                            >
                                                <option value="" className="bg-slate-800">Select Team</option>
                                                {teams.map(t => <option key={t.id} value={t.id} className="bg-slate-800">{t.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-200">Adjust Priority</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={allocation.priority}
                                                onChange={e => setAllocation({ ...allocation, priority: e.target.value })}
                                            >
                                                <option value="" className="bg-slate-800">Keep {selectedTicket.priority}</option>
                                                <option value="LOW" className="bg-slate-800">Low</option>
                                                <option value="MEDIUM" className="bg-slate-800">Medium</option>
                                                <option value="HIGH" className="bg-slate-800">High</option>
                                                <option value="CRITICAL" className="bg-slate-800">Critical</option>
                                            </select>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="ghost" onClick={() => setSelectedTicket(null)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
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
        </div>
    );
}
