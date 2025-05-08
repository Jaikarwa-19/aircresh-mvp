import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config'; // Only import db, not firebaseApp

export default function Navbar({ showNotifications = true }) {
  const auth = getAuth(); // ✅ Use default initialized app
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!auth.currentUser || !showNotifications) return;
      const snap = await getDocs(
        query(
          collection(db, 'notifications'),
          where('userId', '==', auth.currentUser.uid),
          where('read', '==', false)
        )
      );
      setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchNotifications();
  }, [auth.currentUser, showNotifications]);

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center">
      <Link href="/">
        <span className="text-xl font-bold text-[#74C0FC]">AirCresh</span>
      </Link>
      <div className="flex gap-4 items-center">
        <Link href="/bookings">Bookings</Link>
        <Link href="/family">My Family</Link>
        <Link href="/profile">Profile</Link>
        {showNotifications && (
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative">
              🔔
              {notifications.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {notifications.length}
                </span>
              )}
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border rounded shadow-md p-2 w-64 z-50">
                {notifications.length === 0 ? (
                  <p className="text-sm text-gray-500">No new notifications</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="text-sm text-gray-700 mb-1 border-b pb-1">
                      {n.message}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
