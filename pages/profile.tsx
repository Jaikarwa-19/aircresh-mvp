import { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import Navbar from '../components/Navbar';
import { db } from '../firebase/config'; // ✅ use shared db

export default function ProfilePage() {
  const auth = getAuth();
  const [message, setMessage] = useState('');
  const user = auth.currentUser;

  const handleSubmitComplaint = async () => {
    if (!user || !message.trim()) return;
    await addDoc(collection(db, 'complaints'), {
      userId: user.uid,
      message,
      createdAt: new Date().toISOString()
    });
    alert('Complaint submitted.');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10 space-y-6">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="bg-white shadow rounded p-4 space-y-2">
          <p><strong>Full Name:</strong> {user?.displayName || 'N/A'}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Phone:</strong> {user?.phoneNumber || 'Not linked'}</p>
        </div>

        <div className="bg-white shadow rounded p-4 space-y-2">
          <h2 className="text-lg font-semibold">Emergency & Help</h2>
          <a href="tel:100" className="text-[#74C0FC] underline">📞 Emergency Contact</a>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Report an issue or emergency"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <button
            onClick={handleSubmitComplaint}
            className="bg-[#74C0FC] text-white px-4 py-2 rounded"
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </div>
  );
}
