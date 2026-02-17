import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Briefcase } from 'lucide-react';

export default function TeamDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [resolvingTicket, setResolvingTicket] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const { data } = await api.get('/tickets/?status=ALLOCATED');
            setTickets(data);
        } catch (error) {
            console.error("Error fetching tickets", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (e) => {
        e.preventDefault();
        if (!resolvingTicket) return;
        try {
            await api.patch(`/tickets/${resolvingTicket.id}/resolve`, { resolution_notes: resolutionNotes });
            setResolvingTicket(null);
            setResolutionNotes('');
            fetchTickets();
        } catch (error) {
            console.error("Failed to resolve", error);
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
                <div className="p-3 rounded-lg bg-orange-500/10 text-orange-500">
                    <Briefcase size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-semibold text-foreground">Assigned Tasks</h2>
                    <p className="text-sm text-muted-foreground">Resolve tickets assigned to your team</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {tickets.map(ticket => (
                        <Card key={ticket.id} className="border-orange-500/20 bg-orange-950/10 hover:bg-orange-950/20 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg bg-none text-orange-100">{ticket.title}</CardTitle>
                                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-300 text-xs font-medium border border-orange-500/20">
                                        {ticket.priority}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-400 mb-6">
                                    {ticket.description}
                                </p>
                                <Button
                                    onClick={() => setResolvingTicket(ticket)}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                >
                                    <CheckCircle size={16} className="mr-2" /> Mark Resolved
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </AnimatePresence>

                {tickets.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-muted-foreground bg-white/5 rounded-xl border border-dashed border-white/10">
                        <CheckCircle size={48} className="mb-4 opacity-50" />
                        <p>No pending tasks assigned.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {resolvingTicket && (
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
                            <Card className="border-white/10 bg-[#0F172A]">
                                <CardHeader>
                                    <CardTitle>Resolve Ticket</CardTitle>
                                    <CardDescription>Provide details on how the issue was resolved.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleResolve} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-200">Resolution Notes</label>
                                            <textarea
                                                className="w-full min-h-[150px] rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                placeholder="Describe the solution..."
                                                value={resolutionNotes}
                                                onChange={e => setResolutionNotes(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="ghost" onClick={() => setResolvingTicket(null)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" variant="default" className="bg-green-600 hover:bg-green-700">
                                                Submit Resolution
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
