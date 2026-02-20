import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, Building, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import TicketComments from '../components/TicketComments';

export default function TicketDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
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

    const handleApprove = async () => {
        try {
            await api.patch(`/tickets/${id}/close`);
            // Refresh ticket data
            const { data } = await api.get(`/tickets/${id}`);
            setTicket(data);
        } catch (error) {
            console.error("Failed to approve ticket", error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'ALLOCATED': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'RESOLVED': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'CLOSED': return 'text-green-600 bg-green-50 border-green-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'RESOLVED': return 'PENDING REVIEW';
            default: return status;
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
                                        {getStatusLabel(ticket.status)}
                                    </span>
                                </div>
                                <CardTitle className="text-3xl font-bold text-slate-800 leading-tight">
                                    {ticket.title}
                                </CardTitle>
                            </div>
                            <div className="flex flex-col gap-2">
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
                                {ticket.status === 'RESOLVED' && (
                                    <Button
                                        onClick={handleApprove}
                                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Resolution
                                    </Button>
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

            {/* History Timeline Section */}
            {ticket.history && ticket.history.length > 0 && (
                <div className="max-w-4xl mx-auto">
                    <Card className="border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Clock size={18} className="text-indigo-500" /> Issue History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ol className="relative border-l border-slate-200 ml-3 space-y-6 py-2">
                                {ticket.history.map((event, idx) => {
                                    const eventColors = {
                                        CREATED: { dot: 'bg-blue-500', text: 'text-blue-700', label: '🆕 Created' },
                                        ALLOCATED: { dot: 'bg-orange-500', text: 'text-orange-700', label: '📋 Allocated to Team' },
                                        MARKED_FOR_REVIEW: { dot: 'bg-yellow-500', text: 'text-yellow-700', label: '🔍 Marked for Review' },
                                        APPROVED_AND_CLOSED: { dot: 'bg-green-500', text: 'text-green-700', label: '✅ Approved & Closed' },
                                        REALLOCATED_TO_G1: { dot: 'bg-red-500', text: 'text-red-700', label: '⬆ Sent back to G1' },
                                        REALLOCATED_TO_SAME_TEAM: { dot: 'bg-amber-500', text: 'text-amber-700', label: '↩ Returned to Team' },
                                    };
                                    const style = eventColors[event.event] || { dot: 'bg-slate-400', text: 'text-slate-600', label: event.event };
                                    return (
                                        <li key={idx} className="ml-6">
                                            <span className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full ${style.dot} ring-4 ring-white shadow-sm`} />
                                            <div className="flex flex-wrap items-baseline gap-x-2 mb-1">
                                                <span className={`text-xs font-bold uppercase ${style.text}`}>{style.label}</span>
                                                <span className="text-[10px] text-slate-400">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-600">
                                                By <span className="font-semibold">{event.actor}</span>
                                                {event.role && <span className="text-slate-400"> ({event.role})</span>}
                                                {event.team_name && <span> → <span className="font-semibold text-orange-700">{event.team_name}</span></span>}
                                            </p>
                                            {event.notes && (
                                                <p className="mt-1 text-[11px] text-slate-500 italic bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                    "{event.notes}"
                                                </p>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Comments Section */}
            <div className="max-w-4xl mx-auto">
                <TicketComments ticketId={id} />
            </div>
        </div>
    );
}
