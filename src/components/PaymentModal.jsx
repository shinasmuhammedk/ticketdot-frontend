import React, { useState } from 'react';
import {
  CreditCard, Smartphone, Building2, ShieldCheck, CheckCircle2,
  Lock, ArrowRight, X, AlertCircle, Sparkles, QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', color: 'bg-blue-900' },
  { id: 'sbi', name: 'State Bank of India', color: 'bg-sky-700' },
  { id: 'icici', name: 'ICICI Bank', color: 'bg-amber-700' },
  { id: 'axis', name: 'Axis Bank', color: 'bg-rose-900' },
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '⚡' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳' },
];

const PaymentModal = ({
  isOpen,
  onClose,
  trip,
  seats = [],
  fare = 0,
  totalAmount = 0,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('bob@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Card state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('BOB TRAVELER');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');

  // NetBanking state
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Processing simulation state
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(''); // 'gateway', 'bank', 'verified'

  if (!isOpen) return null;

  const handlePay = () => {
    setProcessing(true);
    setStage('gateway');

    setTimeout(() => {
      setStage('bank');
      setTimeout(() => {
        setStage('verified');
        setTimeout(() => {
          setProcessing(false);
          onPaymentSuccess();
        }, 500);
      }, 900);
    }, 800);
  };

  const autofillTestCard = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardHolder('TEST PASSENGER');
    setCardExpiry('12/28');
    setCardCvv('123');
  };

  const upiQrString = `upi://pay?pa=ticketdot@hdfc&pn=TicketDot%20Reservations&am=${totalAmount}&cu=INR&tn=Seats%20${seats.join(',')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Lock size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Secure Payment Checkout</h3>
              <p className="text-[11px] text-slate-400">256-bit Encrypted Transaction</p>
            </div>
          </div>

          {!processing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Order Summary Strip */}
          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-950">
                {trip?.origin || 'Origin'} → {trip?.destination || 'Destination'}
              </p>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                Seats: <span className="font-bold">{seats.join(', ')}</span> ({seats.length} passenger{seats.length !== 1 ? 's' : ''})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Total Due</span>
              <span className="text-2xl font-black text-indigo-950">₹{totalAmount}</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                disabled={processing}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'upi'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Smartphone size={18} className={method === 'upi' ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="text-xs font-bold">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                disabled={processing}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'card'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard size={18} className={method === 'card' ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="text-xs font-bold">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                disabled={processing}
                className={`py-3 px-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  method === 'netbanking'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Building2 size={18} className={method === 'netbanking' ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="text-xs font-bold">Net Banking</span>
              </button>
            </div>
          </div>

          {/* Tab 1: UPI Options */}
          {method === 'upi' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-4 gap-2">
                {UPI_APPS.map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpiApp(app.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedUpiApp === app.id
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-bold'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg block mb-0.5">{app.icon}</span>
                    <span className="text-[11px] block">{app.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
                  <QRCodeSVG value={upiQrString} size={110} level="M" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold text-slate-900">Scan QR with any UPI App</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, or BHIM</p>
                  
                  <div className="mt-2.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Or enter VPA</span>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="mobile@upi"
                      className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:border-indigo-600 outline-none w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Card Options */}
          {method === 'card' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                  <span className="text-xs font-mono tracking-widest text-indigo-300">DEBIT / CREDIT</span>
                  <span className="text-xs font-black tracking-wider text-amber-400">VISA</span>
                </div>
                <p className="font-mono text-base tracking-widest font-bold mb-4">{cardNumber}</p>
                <div className="flex justify-between items-end text-xs font-mono text-slate-300">
                  <div>
                    <span className="text-[9px] block text-slate-400 uppercase">Cardholder</span>
                    <span>{cardHolder}</span>
                  </div>
                  <div>
                    <span className="text-[9px] block text-slate-400 uppercase">Expires</span>
                    <span>{cardExpiry}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={autofillTestCard}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={13} />
                  Autofill Test Card
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Net Banking */}
          {method === 'netbanking' && (
            <div className="space-y-3 animate-in fade-in">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Select Your Bank
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {BANKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBank(b.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedBank === b.id
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs font-semibold">{b.name}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${b.color}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing Simulation Animation Overlay */}
          {processing && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-2 animate-in fade-in">
              {stage !== 'verified' ? (
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
              )}
              <p className="text-xs font-bold text-indigo-950">
                {stage === 'gateway' && 'Connecting to Payment Gateway...'}
                {stage === 'bank' && 'Verifying & Authorizing with Bank...'}
                {stage === 'verified' && 'Payment Authorized Successfully!'}
              </p>
              <p className="text-[11px] text-indigo-600">Please do not refresh or close this window.</p>
            </div>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Zero Booking Fee Promo</span>
          </div>

          <button
            onClick={handlePay}
            disabled={processing}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>{processing ? 'Processing...' : `Pay ₹${totalAmount}`}</span>
            {!processing && <ArrowRight size={14} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
