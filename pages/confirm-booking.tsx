import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/config';

export default function ConfirmBookingPage() {
  const auth = getAuth();
  const router = useRouter();

  const { daycareId, childId, from, to, price, name } = router.query;
  const [loading, setLoading] = useState(false);

  const calculateDays = () => {
    if (!from || !to) return 0;
    return (
      Math.ceil(
        (new Date(to as string).getTime() - new Date(from as string).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      const userEmail = auth.currentUser?.email;
      const createdAt = new Date().toISOString();

      // Save booking in Firestore
      await addDoc(collection(db, 'bookings'), {
        userId,
        daycareId,
        childId,
        from,
        to,
        createdAt,
        status: 'upcoming'
      });

      // Create in-app notification
      await addDoc(collection(db, 'notifications'), {
        userId,
        message: `Booking confirmed at ${name} from ${from} to ${to}`,
        createdAt,
        read: false
      });

      // OPTIONAL: Trigger email via API route (EmailJS or similar)
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_email: userEmail,
          subject: 'Booking Confirmed',
          message: `Your booking at ${name} is confirmed from ${from} to ${to}.`
        })
      });

      router.push('/bookings');
    } catch (e) {
      console.error(e);
      alert('Error completing booking');
    }
    setLoading(false);
  };

  const total = price ? Number(price) * calculateDays() : 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar showNotifications={true} />
      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">Confirm Your Booking</h1>
        <div className="bg-white rounded shadow p-4 space-y-2">
          <p><strong>Daycare:</strong> {name}</p>
          <p><strong>From:</strong> {from}</p>
          <p><strong>To:</strong> {to}</p>
          <p><strong>Child ID:</strong> {childId}</p>
          <p><strong>Price/Session:</strong> ₹{price}</p>
          <p><strong>Total Days:</strong> {calculateDays()}</p>
          <p className="font-semibold text-lg">Total Amount: ₹{total}</p>
          <button
            disabled={loading}
            onClick={handlePayment}
            className="mt-4 bg-[#74C0FC] hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded"
          >
            {loading ? 'Processing...' : 'Pay & Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
