import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Building, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                // Fetch all tickets and find the one matching the ID
                // Ideally this should be a direct API call like api.get(`/tickets/${id}`)
                // But based on UnitDashboard, we might need to filter from all if endpoint doesn't exist
                // Let's try direct first, fallback to finding if needed.
                // Actually, standard REST usually supports get by ID.
                const { data } = await api.get(`/tickets/${id}`);
                setTicket(data);
            } catch (error) {
                console.error("Failed to fetch ticket details", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'CRITICAL': return 'bg-red-500 text-white';
            case 'HIGH': return 'bg-orange-500 text-white';
            case 'MEDIUM': return 'bg-yellow-500 text-white';
            case 'LOW': return 'bg-blue-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen bg-slate-50/50">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!ticket) return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Ticket Not Found</h2>
            <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
            </Button>
        </div>
    );

    return (
        <div className="min-h-screen p-6 space-y-8">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={() => navigate(-1)}
                    variant="ghost"
                    className="hover:bg-white/50"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Back to Dashboard
                </Button>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Main Ticket Card */}
                <Card className="border-0 shadow-xl bg-white/70 backdrop-blur-xl overflow-hidden">
                    <div className={`h-2 w-full ${getPriorityColor(ticket.priority).split(' ')[0]}`} />

                    <CardHeader className="pb-4 pt-6 px-8 border-b border-slate-100/50">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider border ${getPriorityColor(ticket.priority).replace('text-white', 'text-white bg-opacity-90')}`}>
                                        {ticket.priority} PRIORITY
                                    </span>
                                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider border ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </div>
                                <CardTitle className="text-3xl font-bold text-slate-800 leading-tight">
                                    {ticket.title}
                                </CardTitle>
                            </div>
                            <div className="text-right text-sm text-slate-500 space-y-1">
                                <div className="flex items-center justify-end gap-2">
                                    <Clock size={14} /> Created: {new Date(ticket.created_at).toLocaleString()}
                                </div>
                                {ticket.updated_at && (
                                    <div className="flex items-center justify-end gap-2 text-slate-400">
                                        Last Updated: {new Date(ticket.updated_at).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        {/* Description Section */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Description</h3>
                            <div className="bg-white/50 p-6 rounded-xl border border-white/60 shadow-sm text-slate-700 leading-relaxed text-lg">
                                {ticket.description}
                            </div>
                        </div>

                        {/* Additional Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Building size={20} />
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase">Unit / Location</div>
                                    <div className="font-semibold text-slate-800">Unit {ticket.unit_id || 'N/A'}</div>
                                </div>
                            </div>

                            {ticket.assigned_to && (
                                <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Assigned To</div>
                                        <div className="font-semibold text-slate-800">Team {ticket.assigned_to}</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resolution Section (if resolved) */}
                        {ticket.resolution_notes && (
                            <div className="mt-6">
                                <div className="bg-green-50/80 border border-green-200 rounded-xl p-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <CheckCircle2 size={100} className="text-green-600" />
                                    </div>
                                    <h3 className="flex items-center gap-2 text-green-800 font-bold mb-3">
                                        <CheckCircle2 size={20} /> Resolution Notes
                                    </h3>
                                    <p className="text-green-900 leading-relaxed relative z-10">
                                        {ticket.resolution_notes}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
