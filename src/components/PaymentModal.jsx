import React, { useState, useEffect } from 'react';
import {
  CreditCard, Smartphone, Building2, ShieldCheck, CheckCircle2,
  Lock, ArrowRight, X, AlertCircle, Sparkles, QrCode, AlertTriangle, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createPaymentOrder, verifyPayment, getTestSignature } from '../api/payments';

const BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', color: 'bg-blue-900' },
  { id: 'sbi', name: 'State Bank of India', color: 'bg-sky-700' },
  { id: 'icici', name: 'ICICI Bank', color: 'bg-amber-700' },
  { id: 'axis', name: 'Axis Bank', color: 'bg-rose-900' },
  { id: 'kotak', name: 'Kotak Mahindra', color: 'bg-red-700' },
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
  scheduleId,
  trip,
  seats = [],
  fare = 0,
  totalAmount = 0,
  passengers = [],
  boardingPoint = '',
  droppingPoint = '',
  contactPhone = '',
  contactEmail = '',
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState('upi'); // 'upi', 'card', 'netbanking'
  const [upiId, setUpiId] = useState('passenger@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');

  // Card state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardHolder, setCardHolder] = useState('PASSENGER NAME');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('842');

  // NetBanking state
  const [selectedBank, setSelectedBank] = useState('hdfc');

  // Gateway Order State
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Processing & Simulation State
  const [simulationMode, setSimulationMode] = useState('success'); // 'success', 'failure'
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(''); // 'gateway', 'bank', 'verifying', 'done'
  const [paymentError, setPaymentError] = useState('');

  // Fetch or create order on open
  useEffect(() => {
    if (!isOpen || !scheduleId || seats.length === 0) return;

    let isMounted = true;
    const initOrder = async () => {
      setOrderLoading(true);
      setOrderError('');
      setPaymentError('');
      try {
        const res = await createPaymentOrder({
          schedule_id: scheduleId,
          seats,
          contact_phone: contactPhone,
          contact_email: contactEmail,
        });
        if (isMounted) {
          setOrder(res.data?.data);
        }
      } catch (err) {
        if (isMounted) {
          const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to initialize payment gateway order';
          setOrderError(msg);
        }
      } finally {
        if (isMounted) {
          setOrderLoading(false);
        }
      }
    };

    initOrder();

    return () => {
      isMounted = false;
    };
  }, [isOpen, scheduleId, seats, contactPhone, contactEmail]);

  if (!isOpen) return null;

  const payableAmount = order?.amount != null ? order.amount : totalAmount;
  const orderId = order?.order_id || 'Generating...';

  const autofillTestCard = () => {
    setCardNumber('4111 2222 3333 4444');
    setCardHolder('TEST PASSENGER');
    setCardExpiry('12/28');
    setCardCvv('123');
  };

  const handlePay = async () => {
    if (!order?.order_id) {
      setPaymentError('Payment order has not been initialized. Please retry.');
      return;
    }

    setPaymentError('');
    setProcessing(true);
    setStage('gateway');

    // Simulate failure scenario for end-to-end testing if selected
    if (simulationMode === 'failure') {
      setTimeout(() => {
        setStage('bank');
        setTimeout(() => {
          setProcessing(false);
          setStage('');
          setPaymentError('Bank declined transaction: Insufficient funds or invalid card PIN (Code: 1042_AUTH_DECLINE). Your locked seats are still reserved. You can retry with another method.');
        }, 1200);
      }, 800);
      return;
    }

    try {
      // Step 1: Simulate Gateway & Bank Handshake
      await new Promise((r) => setTimeout(r, 700));
      setStage('bank');
      await new Promise((r) => setTimeout(r, 700));
      setStage('verifying');

      // Step 2: Generate Gateway Payment ID
      const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      const paymentId = `pay_RB${randomSuffix}`;

      // Step 3: Compute valid HMAC-SHA256 signature via backend test mode helper
      const sigRes = await getTestSignature(order.order_id, paymentId);
      const signature = sigRes.data?.signature;

      // Method label for receipt
      let methodLabel = 'Card';
      if (method === 'upi') {
        const appObj = UPI_APPS.find((a) => a.id === selectedUpiApp);
        methodLabel = `UPI (${appObj?.name || 'UPI'})`;
      } else if (method === 'netbanking') {
        const bankObj = BANKS.find((b) => b.id === selectedBank);
        methodLabel = `Net Banking (${bankObj?.name || 'Bank'})`;
      } else {
        const last4 = cardNumber.replace(/\s+/g, '').slice(-4) || '4444';
        methodLabel = `Visa Card (•••• ${last4})`;
      }

      // Step 4: Submit verification and atomic seat confirmation to backend
      const verifyPayload = {
        order_id: order.order_id,
        payment_id: paymentId,
        signature: signature,
        payment_method: methodLabel,
        schedule_id: scheduleId,
        seats: seats,
        passengers: passengers.map((p) => ({
          seat_number: p.seat_number,
          name: (p.name || '').trim(),
          age: parseInt(p.age) || 0,
          gender: p.gender || 'Male',
        })),
        boarding_point: boardingPoint,
        dropping_point: droppingPoint,
        contact_phone: contactPhone.trim(),
        contact_email: contactEmail.trim(),
      };

      const verifyRes = await verifyPayment(verifyPayload);
      const bookingData = verifyRes.data?.data;

      setStage('done');
      await new Promise((r) => setTimeout(r, 400));
      setProcessing(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(bookingData);
      }
    } catch (err) {
      setProcessing(false);
      setStage('');
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Payment verification failed';
      setPaymentError(msg);
    }
  };

  const upiQrString = `upi://pay?pa=ticketdot@hdfc&pn=TicketDot%20Reservations&am=${payableAmount}&cu=INR&tn=Order%20${orderId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">

        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Lock size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">Payment Gateway Checkout</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                  Razorpay Mode
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">HMAC-SHA256 Authenticated • 256-bit SSL</p>
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5">

          {/* Order Summary Strip */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-950">
                {trip?.origin || 'Origin'} → {trip?.destination || 'Destination'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-indigo-700">
                <span>Seats: <strong className="text-indigo-900">{seats.join(', ')}</strong></span>
                <span>•</span>
                <span className="font-mono text-[10px] bg-indigo-200/60 px-1.5 py-0.5 rounded">
                  {order?.order_id || 'Order Generating...'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Total Due</span>
              <span className="text-2xl font-black text-indigo-950">₹{payableAmount}</span>
            </div>
          </div>

          {/* Order Error Alert */}
          {orderError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{orderError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOrderLoading(true);
                  createPaymentOrder({ schedule_id: scheduleId, seats, contact_phone: contactPhone, contact_email: contactEmail })
                    .then((r) => setOrder(r.data?.data))
                    .catch((e) => setOrderError(e.message))
                    .finally(() => setOrderLoading(false));
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {/* Payment Error Alert */}
          {paymentError && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Transaction Unsuccessful</p>
                <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                disabled={processing}
                className={`py-2.5 px-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
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
                    <span className="text-base block mb-0.5">{app.icon}</span>
                    <span className="text-[11px] block">{app.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0">
                  <QRCodeSVG value={upiQrString} size={110} level="M" />
                </div>
                <div className="text-center sm:text-left flex-1">
                  <p className="text-xs font-bold text-slate-900">Scan QR Code</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay instantly with any UPI app</p>

                  <div className="mt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Or pay via Virtual Payment Address (VPA)
                    </span>
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
            <div className="space-y-3.5 animate-in fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md relative overflow-hidden">
                <div className="flex justify-between items-start mb-5">
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

              <div className="grid grid-cols-2 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full h-9 px-3 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-none"
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
              <div className="grid grid-cols-2 gap-2">
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

          {/* Gateway Test Mode / Simulation Selector */}
          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/70 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Gateway Test Simulation:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSimulationMode('success')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  simulationMode === 'success'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                Success
              </button>
              <button
                type="button"
                onClick={() => setSimulationMode('failure')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                  simulationMode === 'failure'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200'
                }`}
              >
                Simulate Decline
              </button>
            </div>
          </div>

          {/* Processing Simulation Animation Overlay */}
          {processing && (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-2 animate-in fade-in">
              {stage !== 'done' ? (
                <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
              )}
              <p className="text-xs font-bold text-indigo-950">
                {stage === 'gateway' && 'Connecting to Payment Gateway...'}
                {stage === 'bank' && 'Verifying & Authorizing with Bank...'}
                {stage === 'verifying' && 'Verifying Gateway Signature & Confirming Seats...'}
                {stage === 'done' && 'Payment Verified & Booking Confirmed!'}
              </p>
              <p className="text-[11px] text-indigo-600 font-medium">Please do not refresh or close this window.</p>
            </div>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Guaranteed Seat Reservation</span>
          </div>

          <button
            onClick={handlePay}
            disabled={processing || orderLoading || Boolean(orderError)}
            className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
          >
            <span>
              {processing
                ? 'Processing...'
                : orderLoading
                ? 'Initializing...'
                : `Pay ₹${payableAmount}`}
            </span>
            {!processing && !orderLoading && <ArrowRight size={14} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
