import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // ✅ shared db import
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
  const [daycares, setDaycares] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchAllData = async () => {
      const daycareSnap = await getDocs(collection(db, 'daycares'));
      const bookingSnap = await getDocs(collection(db, 'bookings'));
      setDaycares(daycareSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBookings(bookingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchAllData();
  }, []);

  const totalRevenue = bookings.reduce((sum, b) => {
    const dc = daycares.find(d => d.id === b.daycareId);
    if (!dc || !dc.price || !b.from || !b.to) return sum;
    const days = (new Date(b.to).getTime() - new Date(b.from).getTime()) / (1000 * 60 * 60 * 24) + 1;
    return sum + days * parseFloat(dc.price);
  }, 0);

  const bookingStats = daycares.map(dc => {
    const count = bookings.filter(b => b.daycareId === dc.id).length;
    return { name: dc.name, count };
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="mb-8 p-4 bg-white rounded shadow">
          <p className="text-lg font-semibold">📊 Total Bookings: {bookings.length}</p>
          <p className="text-lg font-semibold">💰 Estimated Revenue: ₹{totalRevenue.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">📈 Bookings per Daycare</h2>
          <ul className="space-y-1 text-sm">
            {bookingStats.map(stat => (
              <li key={stat.name} className="flex justify-between border-b py-1">
                <span>{stat.name}</span>
                <span>{stat.count} bookings</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
