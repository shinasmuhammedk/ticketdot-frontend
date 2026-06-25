import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bus, ArrowLeft } from 'lucide-react';
import { getBuses } from '../../api/operator';

const MyBuses = () => {
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadBuses = async () => {
            try {
                const res = await getBuses();

                console.log('BUSES:', res.data);

                setBuses(res.data.data || []);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to load buses'
                );
            } finally {
                setLoading(false);
            }
        };

        loadBuses();
    }, []);

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-10">
            <div className="max-w-5xl mx-auto">
                <Link
                    to="/operator/dashboard"
                    className="flex items-center gap-2 text-[#101F33] mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Link>

                <div className="flex items-center gap-3 mb-8">
                    <Bus className="text-[#101F33]" />
                    <h1 className="text-3xl font-bold text-stone-900">
                        My Buses
                    </h1>
                </div>

                {loading && (
                    <p className="text-stone-500">Loading buses...</p>
                )}

                {error && (
                    <p className="text-red-600">{error}</p>
                )}

                {!loading && !error && buses.length === 0 && (
                    <p className="text-stone-500">
                        No buses found.
                    </p>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {buses.map((bus) => (
                        <div
                            key={bus.id}
                            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                                    <Bus className="text-emerald-600" />
                                </div>

                                <div>
                                    <h2 className="font-bold text-lg text-stone-900">
                                        {bus.registration_no}
                                    </h2>

                                    <p className="text-sm text-stone-500">
                                        {bus.bus_type}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="font-medium">
                                        Total Seats:
                                    </span>{' '}
                                    {bus.total_seats}
                                </p>

                                <p className="break-all text-stone-500">
                                    <span className="font-medium text-stone-700">
                                        Bus ID:
                                    </span>{' '}
                                    {bus.id}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MyBuses;