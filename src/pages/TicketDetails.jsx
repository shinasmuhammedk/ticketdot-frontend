import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBookingDetails } from '../api/bookings';
import {
    ArrowLeft,
    Bus,
    Armchair,
    Hash,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    User,
    CreditCard,
    Calendar,
    Download,
    Share2,
} from 'lucide-react';

const statusConfig = {
    confirmed: {
        icon: CheckCircle2,
        dot: 'bg-blue-500',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-100',
        label: 'Confirmed',
    },
    cancelled: {
        icon: XCircle,
        dot: 'bg-gray-300',
        bg: 'bg-gray-50',
        text: 'text-gray-500',
        border: 'border-gray-100',
        label: 'Cancelled',
    },
    completed: {
        icon: CheckCircle2,
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-100',
        label: 'Completed',
    },
};

const TicketDetails = () => {
    const { bookingRef } = useParams();

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTicket = async () => {
            try {
                const res = await getBookingDetails(bookingRef);
                setTicket(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load ticket');
            } finally {
                setLoading(false);
            }
        };
        loadTicket();
    }, [bookingRef]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">Loading ticket...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="text-center max-w-sm">
                    <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={20} className="text-red-500" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-red-600">{error}</p>
                    <Link
                        to="/my-bookings"
                        className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        Back to bookings
                    </Link>
                </div>
            </div>
        );
    }

    const status = (ticket.status || 'confirmed').toLowerCase();
    const cfg = statusConfig[status] || statusConfig.confirmed;
    const StatusIcon = cfg.icon;

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
                    <Link
                        to="/my-bookings"
                        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} strokeWidth={1.5} />
                        <span className="hidden sm:inline">Back</span>
                    </Link>
                    <div className="h-4 w-px bg-gray-200" />
                    <h1 className="text-sm font-medium text-gray-900">Ticket</h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                {/* Status Banner */}
                <div className={`rounded-2xl border ${cfg.border} ${cfg.bg} p-4 mb-6 flex items-center gap-3`}>
                    <StatusIcon size={18} className={cfg.text} strokeWidth={1.5} />
                    <div>
                        <p className={`text-sm font-semibold ${cfg.text}`}>{cfg.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Booking {ticket.booking_ref}</p>
                    </div>
                </div>

                {/* Main Ticket Card */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {/* Route Header */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                                    <Bus size={18} className="text-blue-600" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">
                                        {ticket.origin || 'Origin'} → {ticket.destination || 'Destination'}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {ticket.operator_name || 'Bus operator'} · {ticket.bus_type || 'Bus'}
                                    </p>
                                </div>
                            </div>
                            <span className="text-2xl font-semibold text-gray-900 shrink-0">
                                ₹{Number(ticket.amount || 0).toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-6 grid grid-cols-2 gap-6">
                        <DetailItem
                            icon={User}
                            label="Passenger"
                            value={ticket.passenger_name || '—'}
                        />
                        <DetailItem
                            icon={Armchair}
                            label="Seat"
                            value={ticket.seat_number || '—'}
                        />
                        <DetailItem
                            icon={Hash}
                            label="Booking Ref"
                            value={ticket.booking_ref || bookingRef}
                        />
                        <DetailItem
                            icon={CreditCard}
                            label="Bus"
                            value={ticket.bus_registration || '—'}
                        />
                        <DetailItem
                            icon={Clock}
                            label="Departure"
                            value={ticket.departure_time ? new Date(ticket.departure_time).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : '—'}
                        />
                        <DetailItem
                            icon={Calendar}
                            label="Arrival"
                            value={ticket.arrival_time ? new Date(ticket.arrival_time).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                            }) : '—'}
                        />
                    </div>

                    {/* Actions */}
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <Download size={15} strokeWidth={1.5} />
                            Download
                        </button>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: `Bus Ticket ${ticket.booking_ref}`,
                                        text: `Seat ${ticket.seat_number} on ${ticket.operator_name}`,
                                    });
                                }
                            }}
                            className="flex-1 h-10 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <Share2 size={15} strokeWidth={1.5} />
                            Share
                        </button>
                    </div>
                </div>

                {/* Back Link */}
                <div className="mt-6 text-center">
                    <Link
                        to="/my-bookings"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={16} strokeWidth={1.5} />
                        Back to all bookings
                    </Link>
                </div>
            </main>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
            <Icon size={14} className="text-gray-400" strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{value}</p>
        </div>
    </div>
);

export default TicketDetails;