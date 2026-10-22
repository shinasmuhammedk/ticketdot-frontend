import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Smartphone, Building2, ShieldCheck, CheckCircle2,
  Lock, ArrowRight, X, AlertCircle, Sparkles, AlertTriangle, RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { createPaymentOrder, verifyPayment, getPaymentStatus, getTestSignature } from '../api/payments';
import { formatINR, paiseToRupees } from '../utils/formatINR';

const pollPaymentStatusUntilConfirmed = async (orderId, maxAttempts = 20, intervalMs = 3000) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const res = await getPaymentStatus(orderId);
      const data = res.data?.data;
      if (data && data.status === 'captured' && data.booking_ref) {
        return data;
      }
      if (data && (data.status === 'refund_required' || data.refund_pending)) {
        return { ...data, status: 'refund_required', refund_required: true };
      }
      if (data && (data.status === 'failed' || data.status === 'expired')) {
        throw new Error(`Payment ${data.status}`);
      }
    } catch (pollErr) {
      if (pollErr.message?.includes('Payment failed') || pollErr.message?.includes('Payment expired')) {
        throw pollErr;
      }
    }
  }
  throw new Error('Payment confirmation is taking longer than expected. Please check "My Bookings" in a moment.');
};

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PaymentModal = ({
  isOpen,
  onClose,
  scheduleId,
  trip,
  seats = [],
  totalAmount: _totalAmount = 0, // unused fallback; authoritative amount comes from order
  passengers = [],
  boardingPoint = '',
  droppingPoint = '',
  contactPhone = '',
  contactEmail = '',
  onPaymentSuccess,
}) => {
  const navigate = useNavigate();
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
  const [now, setNow] = useState(() => Date.now());

  // Processing & Simulation State
  const [simulationMode, setSimulationMode] = useState('success'); // 'success', 'failure'
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(''); // 'gateway', 'bank', 'verifying', 'done', 'refund_required'
  const [refundInfo, setRefundInfo] = useState(null);
  const [paymentError, setPaymentError] = useState('');

  // Expiry countdown timer tick based on order.expires_at
  useEffect(() => {
    if (!order?.expires_at) return;
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [order?.expires_at]);

  const timeLeftSec = order?.expires_at
    ? Math.max(0, Math.floor((new Date(order.expires_at).getTime() - now) / 1000))
    : null;

  const formatCountdown = (seconds) => {
    if (seconds == null) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isOrderExpired = timeLeftSec !== null && timeLeftSec <= 0;

  const executeOrderFetch = useCallback((isMountedRef = { current: true }) => {
    setOrderLoading(true);
    setOrderError('');
    setPaymentError('');
    return createPaymentOrder({
      schedule_id: scheduleId,
      seats,
      contact_phone: contactPhone,
      contact_email: contactEmail,
    })
      .then((res) => {
        if (isMountedRef.current) {
          setOrder(res.data?.data);
        }
      })
      .catch((err) => {
        if (isMountedRef.current) {
          const status = err.response?.status;
          let msg = err.response?.data?.error?.message || err.response?.data?.message || err.message;
          if (status === 409) {
            msg = 'Selected seats are no longer available. Please select other seats.';
          } else if (status === 502) {
            msg = 'Payment service temporarily unavailable, please try again.';
          } else if (!msg) {
            msg = 'Failed to initialize payment gateway order';
          }
          setOrderError(msg);
        }
      })
      .finally(() => {
        if (isMountedRef.current) {
          setOrderLoading(false);
        }
      });
  }, [scheduleId, seats, contactPhone, contactEmail]);

  // Fetch or create order on open
  useEffect(() => {
    if (!isOpen || !scheduleId || seats.length === 0) return;
    const isMountedRef = { current: true };
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Asynchronous order creation upon modal open
    executeOrderFetch(isMountedRef);

    return () => {
      isMountedRef.current = false;
    };
  }, [isOpen, scheduleId, seats, executeOrderFetch]);

  if (!isOpen) return null;

  // Strict server order amount (no client-computed fallback)
  const payableAmount = order ? (order.amount_paise ?? order.amount ?? 0) : 0;
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

    if (isOrderExpired) {
      setPaymentError('Order has expired. Please close this modal and reselect seats.');
      return;
    }

    setPaymentError('');
    setProcessing(true);
    setStage('gateway');

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

    const isFakeOrder = Boolean(order.order_id?.startsWith('order_fake_')) && (typeof window === 'undefined' || !window.Razorpay);

    // Real Razorpay orders pass through to Razorpay checkout SDK
    if (!isFakeOrder) {
      try {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded || typeof window === 'undefined' || !window.Razorpay) {
          throw new Error('Razorpay SDK failed to load. Please check your internet connection or disable adblockers.');
        }

        const rzp = new window.Razorpay({
          key: order.key_id,
          amount: payableAmount, // integer paise
          currency: order.currency || 'INR',
          name: 'TicketDot',
          description: `Bus Booking - Order ${order.order_id}`,
          order_id: order.order_id,
          handler: async (response) => {
            try {
              setStage('verifying');
              const verifyPayload = {
                order_id: order.order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
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

              let bookingData = verifyRes.data?.data;
              if (verifyRes.status === 202 || verifyRes.data?.status === 'processing') {
                setStage('polling');
                bookingData = await pollPaymentStatusUntilConfirmed(order.order_id);
              }

              if (bookingData?.status === 'refund_required' || bookingData?.refund_required || verifyRes.data?.status === 'refund_required') {
                setRefundInfo({
                  orderId: bookingData?.order_id || order.order_id,
                  gatewayPaymentId: bookingData?.gateway_payment_id || response.razorpay_payment_id,
                });
                setStage('refund_required');
                setProcessing(false);
                return;
              }

              setStage('done');
              setProcessing(false);
              if (onPaymentSuccess) {
                onPaymentSuccess(bookingData);
              }
            } catch (verifyErr) {
              setProcessing(false);
              setStage('');
              const msg = verifyErr.response?.data?.error?.message || verifyErr.response?.data?.message || verifyErr.message || 'Payment verification failed';
              setPaymentError(msg);
            }
          },
          prefill: {
            name: passengers[0]?.name || '',
            email: contactEmail,
            contact: contactPhone,
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
              setStage('');
            },
          },
        });
        rzp.open();
        return;
      } catch (sdkErr) {
        setProcessing(false);
        setStage('');
        setPaymentError(sdkErr.message || 'Failed to initialize Razorpay checkout');
        return;
      }
    }

    // Fake / demo flow for order_fake_ orders (development only)
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

      // Step 2: Generate Gateway Payment ID (Development demo flow)
      const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
      const paymentId = `pay_RB${randomSuffix}`;

      // Step 3: Compute valid HMAC-SHA256 signature via backend test mode helper
      const sigRes = await getTestSignature(order.order_id, paymentId);
      const signature = sigRes.data?.signature;

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
      let bookingData = verifyRes.data?.data;

      if (verifyRes.status === 202 || verifyRes.data?.status === 'processing') {
        setStage('polling');
        bookingData = await pollPaymentStatusUntilConfirmed(order.order_id);
      }

      if (bookingData?.status === 'refund_required' || bookingData?.refund_required || verifyRes.data?.status === 'refund_required') {
        setRefundInfo({
          orderId: bookingData?.order_id || order.order_id,
          gatewayPaymentId: bookingData?.gateway_payment_id || paymentId,
        });
        setStage('refund_required');
        setProcessing(false);
        return;
      }

      setStage('done');
      await new Promise((r) => setTimeout(r, 400));
      setProcessing(false);

      if (onPaymentSuccess) {
        onPaymentSuccess(bookingData);
      }
    } catch (err) {
      setProcessing(false);
      setStage('');
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Payment verification failed';
      setPaymentError(msg);
    }
  };

  const upiQrString = `upi://pay?pa=ticketdot@hdfc&pn=TicketDot%20Reservations&am=${paiseToRupees(payableAmount).toFixed(2)}&cu=INR&tn=Order%20${orderId}`;

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
          {stage === 'refund_required' ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
                <AlertTriangle size={30} />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-slate-900">Payment Received, But Booking Could Not Be Completed</h3>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                  Payment received, but your booking could not be completed. A full refund will be processed to your original payment method within 5-7 days.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 max-w-sm mx-auto">
                  Order reference: <strong className="text-slate-900">{refundInfo?.orderId || order?.order_id}</strong>
                </div>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/my-bookings');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  View My Bookings
                </button>
                <a
                  href="mailto:support@ticketdot.com"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors text-center"
                >
                  Contact Support
                </a>
              </div>
            </div>
          ) : (
            <>
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
                  {order?.order_id || (orderLoading ? 'Order Generating...' : 'No Order')}
                </span>
              </div>
              {timeLeftSec !== null && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                  <span className={`font-semibold ${isOrderExpired ? 'text-rose-600' : 'text-amber-700'}`}>
                    {isOrderExpired ? '⚠️ Order expired. Please reselect seats.' : `⏱ Expires in ${formatCountdown(timeLeftSec)}`}
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Total Due</span>
              <span className="text-2xl font-black text-indigo-950">
                {orderLoading ? 'Loading...' : formatINR(payableAmount)}
              </span>
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
                onClick={() => executeOrderFetch()}
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

          {/* Gateway Test Mode / Simulation Selector (Development Only) */}
          {import.meta.env.DEV && (
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
          )}

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
                {stage === 'polling' && "We're confirming your payment..."}
                {stage === 'done' && 'Payment Verified & Booking Confirmed!'}
              </p>
              <p className="text-[11px] text-indigo-600 font-medium">Please do not refresh or close this window.</p>
            </div>
          )}
          </>
          )}

        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>Guaranteed Seat Reservation</span>
          </div>

          {stage === 'refund_required' ? (
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          ) : (
            <button
              data-testid="pay-button"
              onClick={handlePay}
              disabled={processing || orderLoading || Boolean(orderError) || isOrderExpired}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>
                {isOrderExpired
                  ? 'Order Expired'
                  : processing
                  ? 'Processing...'
                  : orderLoading
                  ? 'Initializing...'
                  : `Pay ${formatINR(payableAmount)}`}
              </span>
              {!processing && !orderLoading && !isOrderExpired && <ArrowRight size={14} />}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default PaymentModal;
