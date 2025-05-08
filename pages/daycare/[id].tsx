import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // ✅ use shared initialized db
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';

export default function DaycareDetail() {
  const router = useRouter();
  const { id } = router.query;
  const auth = getAuth();

  const [daycare, setDaycare] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedDates, setSelectedDates] = useState<any>([]);
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const ref = doc(db, 'daycares', id as string);
      const snap = await getDoc(ref);
      setDaycare(snap.data());

      const revSnap = await getDocs(query(collection(db, 'reviews'), where('daycareId', '==', id)));
      setReviews(revSnap.docs.map(d => d.data()));
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchChildren = async () => {
      if (!auth.currentUser) return;
      const childSnap = await getDocs(query(collection(db, 'children'), where('userId', '==', auth.currentUser.uid)));
      setChildren(childSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchChildren();
  }, [auth.currentUser]);

  const handleRedirectToPayment = () => {
    if (!auth.currentUser) return alert('You must be logged in to book.');
    if (!selectedDates || !Array.isArray(selectedDates)) return alert('Select a date range.');
    if (!selectedChild) return alert('Please select a child for this booking.');

    router.push({
      pathname: '/confirm-booking',
      query: {
        daycareId: id,
        childId: selectedChild,
        from: selectedDates[0].toISOString(),
        to: selectedDates[1].toISOString(),
        price: daycare.price,
        name: daycare.name
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        {daycare ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{daycare.name}</h1>
            <p className="text-gray-600 mb-4">{daycare.description || 'No description provided.'}</p>
            <p className="text-sm text-gray-700 mb-2">Primary caretaker: {daycare.caretakerName}</p>
            <p className="text-sm text-gray-700 mb-4">Cost per session: ₹{daycare.price}</p>

            <h2 className="text-xl font-semibold mt-6 mb-2">Available Dates</h2>
            <Calendar
              onChange={setSelectedDates}
              value={selectedDates}
              selectRange={true}
              className="rounded border p-2 bg-white"
            />

            <div className="mt-4">
              <label className="text-sm mr-2">Book for child:</label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white"
              >
                <option value="">Select Child</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleRedirectToPayment}
              className="mt-4 bg-[#74C0FC] hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded"
            >
              Book Now
            </button>

            <h2 className="text-xl font-semibold mt-8 mb-2">Parent Reviews</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <li key={i} className="border bg-white p-3 rounded">
                    ⭐ {r.rating} — {r.comment}
                  </li>
                ))
              ) : (
                <li>No reviews yet.</li>
              )}
            </ul>

            <Link href="/" className="mt-8 inline-block text-[#74C0FC] hover:underline">← Back to search</Link>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
