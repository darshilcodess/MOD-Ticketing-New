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
            case 'CRITICAL': return 'text-red-400';
            case 'HIGH': return 'text-orange-400';
            case 'MEDIUM': return 'text-yellow-400';
            case 'LOW': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-card/50 p-4 rounded-lg border border-white/5 backdrop-blur-sm">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">My Tickets</h2>
                    <p className="text-sm text-muted-foreground">Manage and track your service requests</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                    <Plus size={18} /> New Ticket
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                    {tickets.map(ticket => (
                        <Card key={ticket.id} className="group hover:border-primary/50 transition-colors">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-foreground line-clamp-1">{ticket.title}</h3>
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className={`px-2 py-0.5 rounded border ${getStatusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                            <span className={`flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                                                <AlertCircle size={12} /> {ticket.priority}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                                    {ticket.description}
                                </p>

                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-3">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                {ticket.resolution_notes && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-200"
                                    >
                                        <div className="flex items-center gap-2 font-medium mb-1 text-green-400">
                                            <CheckCircle2 size={14} /> Resolution
                                        </div>
                                        {ticket.resolution_notes}
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </AnimatePresence>
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
                            <Card className="border-white/10 bg-[#0F172A]">
                                <CardHeader>
                                    <CardTitle>Create New Ticket</CardTitle>
                                    <CardDescription>Submit a new issue for the team to resolve.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleCreateTicket} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-200">Title</label>
                                            <Input
                                                placeholder="Brief summary of the issue"
                                                value={newTicket.title}
                                                onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-200">Description</label>
                                            <textarea
                                                className="w-full min-h-[100px] rounded-md border border-input bg-background/50 px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="Detailed description..."
                                                value={newTicket.description}
                                                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-200">Priority</label>
                                            <select
                                                className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                                value={newTicket.priority}
                                                onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                                            >
                                                <option value="LOW" className="bg-slate-800">Low</option>
                                                <option value="MEDIUM" className="bg-slate-800">Medium</option>
                                                <option value="HIGH" className="bg-slate-800">High</option>
                                                <option value="CRITICAL" className="bg-slate-800">Critical</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4">
                                            <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">
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
