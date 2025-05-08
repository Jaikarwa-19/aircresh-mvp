import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config'; // ✅ use shared db instance
import Navbar from '../components/Navbar';

export default function BookingsPage() {
  const auth = getAuth(); // ✅ safe for use after Firebase initialized
  const [bookings, setBookings] = useState([]);
  const [children, setChildren] = useState([]);
  const [daycares, setDaycares] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [reviewState, setReviewState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;

      const bSnap = await getDocs(
        query(collection(db, 'bookings'), where('userId', '==', auth.currentUser.uid))
      );
      const cSnap = await getDocs(
        query(collection(db, 'children'), where('userId', '==', auth.currentUser.uid))
      );
      const dSnap = await getDocs(collection(db, 'daycares'));
      const rSnap = await getDocs(
        query(collection(db, 'reviews'), where('userId', '==', auth.currentUser.uid))
      );

      setBookings(bSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setChildren(cSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDaycares(dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setReviews(rSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, [auth.currentUser]);

  const getChildName = (id) => children.find(c => c.id === id)?.name || 'Unknown';
  const getDaycareName = (id) => daycares.find(d => d.id === id)?.name || 'Unknown';

  const handleReviewSubmit = async (daycareId, comment, rating) => {
    await addDoc(collection(db, 'reviews'), {
      userId: auth.currentUser?.uid,
      daycareId,
      rating,
      comment,
      createdAt: new Date().toISOString()
    });
    setReviewState({});
    alert('Review submitted!');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('upcoming')}
            className={`px-4 py-2 rounded ${view === 'upcoming' ? 'bg-[#74C0FC] text-white' : 'bg-gray-200'}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setView('past')}
            className={`px-4 py-2 rounded ${view === 'past' ? 'bg-[#74C0FC] text-white' : 'bg-gray-200'}`}
          >
            Past
          </button>
        </div>

        {bookings
          .filter(b => b.status === view)
          .map((b) => {
            const alreadyReviewed = reviews.some(r => r.daycareId === b.daycareId);
            const allowReview = view === 'past' && !alreadyReviewed;
            return (
              <div key={b.id} className="border bg-white p-4 rounded mb-4">
                <p className="font-semibold text-lg">{getDaycareName(b.daycareId)}</p>
                <p className="text-sm">Child: {getChildName(b.childId)}</p>
                <p className="text-sm">From: {new Date(b.from).toLocaleDateString()}</p>
                <p className="text-sm">To: {new Date(b.to).toLocaleDateString()}</p>

                {allowReview && (
                  <div className="mt-3">
                    <label className="text-sm block mb-1">Rating:</label>
                    <select
                      value={reviewState[b.id]?.rating || ''}
                      onChange={e => setReviewState({
                        ...reviewState,
                        [b.id]: {
                          ...reviewState[b.id],
                          rating: parseInt(e.target.value)
                        }
                      })}
                      className="border rounded p-1 mb-2"
                    >
                      <option value="">Select</option>
                      {[1, 2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <label className="text-sm block mb-1">Comment:</label>
                    <textarea
                      value={reviewState[b.id]?.comment || ''}
                      onChange={e => setReviewState({
                        ...reviewState,
                        [b.id]: {
                          ...reviewState[b.id],
                          comment: e.target.value
                        }
                      })}
                      className="w-full border rounded p-2 mb-2"
                    ></textarea>
                    <button
                      onClick={() => handleReviewSubmit(
                        b.daycareId,
                        reviewState[b.id]?.comment,
                        reviewState[b.id]?.rating
                      )}
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
