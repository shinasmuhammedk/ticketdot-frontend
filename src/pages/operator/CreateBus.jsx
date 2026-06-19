import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bus } from 'lucide-react';
import { createBus } from '../../api/operator';

const CreateBus = () => {
    const [registrationNo, setRegistrationNo] = useState('');
    const [busType, setBusType] = useState('AC_SLEEPER');
    const [totalSeats, setTotalSeats] = useState(40);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await createBus({
                registration_no: registrationNo,
                bus_type: busType,
                total_seats: Number(totalSeats),
            });

            setMessage('Bus created successfully');
            setRegistrationNo('');
            setBusType('AC_SLEEPER');
            setTotalSeats(40);
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to create bus');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 px-4 py-10">
            <div className="max-w-xl mx-auto">
                <Link to="/operator/dashboard" className="flex items-center gap-2 text-[#101F33] mb-6">
                    <ArrowLeft size={18} />
                    Back to Operator Dashboard
                </Link>

                <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Bus className="text-[#101F33]" />
                        <h1 className="text-2xl font-bold text-stone-900">Create Bus</h1>
                    </div>

                    {message && <p className="mb-4 text-emerald-600">{message}</p>}
                    {error && <p className="mb-4 text-red-600">{error}</p>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            type="text"
                            placeholder="Registration No. eg: KL-10-AV-6577"
                            value={registrationNo}
                            onChange={(e) => setRegistrationNo(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-stone-200"
                            required
                        />

                        <select
                            value={busType}
                            onChange={(e) => setBusType(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-stone-200"
                        >
                            <option value="AC_SLEEPER">AC Sleeper</option>
                            <option value="NON_AC_SLEEPER">Non AC Sleeper</option>
                            <option value="AC_SEATER">AC Seater</option>
                            <option value="NON_AC_SEATER">Non AC Seater</option>
                        </select>

                        <input
                            type="number"
                            placeholder="Total Seats"
                            value={totalSeats}
                            onChange={(e) => setTotalSeats(e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-stone-200"
                            min="1"
                            required
                        />

                        <button
                            disabled={loading}
                            className="w-full h-12 rounded-xl bg-[#101F33] text-white font-medium disabled:opacity-60"
                        >
                            {loading ? 'Creating...' : 'Create Bus'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateBus;