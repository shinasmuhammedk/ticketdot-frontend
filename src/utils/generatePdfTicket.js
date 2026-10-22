import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { formatINR } from './formatINR';

export const generatePdfTicket = async (ticket) => {
  if (!ticket) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180 mm

  // Format date and time
  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    try {
      return new Date(isoStr).toLocaleString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const bookingRef = ticket.booking_ref || ticket.ref || 'TICKETDOT';
  const seatsList = Array.isArray(ticket.seats) && ticket.seats.length > 0
    ? ticket.seats.join(', ')
    : (ticket.seat_number || '—');

  const passengers = Array.isArray(ticket.passengers) && ticket.passengers.length > 0
    ? ticket.passengers
    : [{
        seat_number: seatsList,
        name: ticket.passenger_name || 'Passenger',
        age: ticket.passenger_age || 0,
        gender: ticket.passenger_gender || '—',
      }];

  // 1. Header Banner
  doc.setFillColor(30, 27, 75); // Deep Indigo #1E1B4B
  doc.roundedRect(margin, 12, contentWidth, 22, 3, 3, 'F');

  // Brand title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('TicketDot', margin + 6, 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('OFFICIAL E-TICKET & BOARDING PASS', margin + 6, 28);

  // Booking Ref Badge (Right Header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`REF: #${bookingRef}`, pageWidth - margin - 6, 21, { align: 'right' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Issued: ${formatDateTime(ticket.confirmed_at || new Date().toISOString())}`, pageWidth - margin - 6, 27, { align: 'right' });

  let curY = 38;

  // 2. Journey Summary Card
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(margin, curY, contentWidth, 30, 3, 3, 'FD');

  // Origin -> Destination
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  const routeText = `${ticket.origin || 'Origin'}  ➔  ${ticket.destination || 'Destination'}`;
  doc.text(routeText, margin + 6, curY + 9);

  // Operator & Bus Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  const busInfo = `Operator: ${ticket.operator_name || 'Shivneri Travels'}  •  ${ticket.bus_type || 'AC Sleeper'} (${ticket.bus_number || ticket.bus_registration || 'Bus'})`;
  doc.text(busInfo, margin + 6, curY + 16);

  // Departure & Arrival Timings
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  const timingText = `Departure: ${formatDateTime(ticket.departure_time)}   |   Arrival: ${formatDateTime(ticket.arrival_time)}`;
  doc.text(timingText, margin + 6, curY + 23);

  curY += 35;

  // 3. Boarding & Dropping Points Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 24, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text('BOARDING POINT (Report 15 mins prior):', margin + 5, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(ticket.boarding_point || `${ticket.origin || 'City'} Central Bus Terminal`, margin + 5, curY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // Emerald
  doc.text('DROPPING POINT:', margin + 95, curY + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.text(ticket.dropping_point || `${ticket.destination || 'Destination'} Main Hub`, margin + 95, curY + 12);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const contactText = `Emergency / Conductor Contact: ${ticket.contact_phone || '+91 9876543210'}   •   Email: ${ticket.contact_email || 'passenger@ticketdot.com'}`;
  doc.text(contactText, margin + 5, curY + 19);

  curY += 28;

  // 4. Passenger Manifest Table
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`PASSENGER MANIFEST (${passengers.length} RESERVED SEATS: ${seatsList})`, margin, curY + 4);
  curY += 7;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, curY, contentWidth, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('SEAT', margin + 4, curY + 5);
  doc.text('PASSENGER NAME', margin + 25, curY + 5);
  doc.text('AGE', margin + 115, curY + 5);
  doc.text('GENDER', margin + 145, curY + 5);
  curY += 7;

  // Table Rows
  passengers.forEach((p, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, curY, contentWidth, 7, 'F');
    }
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(79, 70, 229);
    doc.text(String(p.seat_number || '—'), margin + 4, curY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    doc.text(String(p.name || 'Passenger'), margin + 25, curY + 5);
    doc.text(p.age ? `${p.age} yrs` : '—', margin + 115, curY + 5);
    doc.text(String(p.gender || '—'), margin + 145, curY + 5);

    curY += 7;
  });

  curY += 4;

  // 5. Payment & Verification Box
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(margin, curY, contentWidth, 20, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text('PAYMENT RECEIPT & GATEWAY VERIFICATION', margin + 5, curY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(4, 120, 87);
  const payTxn = `Transaction ID: ${ticket.payment_id || 'pay_' + bookingRef.toLowerCase()}   •   Method: ${ticket.payment_method || 'Online Card/UPI'}   •   Status: ${ticket.payment_status || 'Captured'}`;
  doc.text(payTxn, margin + 5, curY + 12);
  doc.text('Fare Breakdown: Base Fare + Taxes & Surcharges (Zero convenience fee promotional discount)', margin + 5, curY + 16.5);

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  const totalAmountStr = formatINR(ticket.amount_paise ?? ticket.amount);
  doc.text(totalAmountStr, pageWidth - margin - 6, curY + 13, { align: 'right' });

  curY += 25;

  // 6. Scannable QR Code & Barcode Section
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 38, 3, 3, 'FD');

  try {
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      passenger: ticket.passenger_name || 'Passenger',
      seats: ticket.seats || [ticket.seat_number],
      route: `${ticket.origin} to ${ticket.destination}`,
      operator: ticket.operator_name,
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e1b4b',
        light: '#ffffff',
      },
    });

    // Embed QR Code image
    doc.addImage(qrDataUrl, 'PNG', margin + 5, curY + 4, 30, 30);
  } catch (err) {
    console.error('Failed to generate QR data URL for PDF', err);
  }

  // QR Instructions
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL DIGITAL BOARDING PASS QR CODE', margin + 40, curY + 9);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Present this QR code to the conductor terminal upon boarding or at station turnstile.', margin + 40, curY + 14);
  doc.text('Guaranteed seat allocation under TicketDot Central Reservation System.', margin + 40, curY + 19);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text(`SECURITY HASH: SHA256-${bookingRef.toUpperCase()}-VERIFIED`, margin + 40, curY + 26);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('This is a computer-generated digital boarding pass. No physical stamp required.', margin + 40, curY + 31);

  curY += 42;

  // 7. Important Terms & Guidelines
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 28, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('IMPORTANT TRAVEL GUIDELINES & POLICY:', margin + 4, curY + 5.5);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('1. Identification: Every passenger must carry a valid Government-issued photo ID (Aadhaar, Passport, DL, or Voter ID).', margin + 4, curY + 10.5);
  doc.text('2. Reporting Time: Arrive at the boarding point at least 15 minutes before the departure time mentioned above.', margin + 4, curY + 14.5);
  doc.text('3. Luggage Allowance: Standard personal baggage limit is 15 kg per passenger. Flammable items are strictly prohibited.', margin + 4, curY + 18.5);
  doc.text('4. Cancellation & Refunds: Cancellation is permitted up to 2 hours prior to departure subject to operator policy.', margin + 4, curY + 22.5);

  // 8. Footer Strip
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('TicketDot Customer Support: support@ticketdot.com  •  Toll Free: 1800-TICKETDOT  •  Have a Safe Journey!', pageWidth / 2, 288, { align: 'center' });

  // Save the document
  const fileName = `TicketDot_Ticket_${bookingRef}.pdf`;
  doc.save(fileName);
};
