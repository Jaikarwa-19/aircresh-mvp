import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebase/config'; // ✅ Use shared initialized db
import Navbar from '../components/Navbar';

export default function FamilyPage() {
  const auth = getAuth();
  const [children, setChildren] = useState([]);
  const [newChild, setNewChild] = useState({ name: '', age: '', blood: '', allergies: '', pickup: '' });

  useEffect(() => {
    const fetchChildren = async () => {
      if (!auth.currentUser) return;
      const snap = await getDocs(query(collection(db, 'children'), where('userId', '==', auth.currentUser.uid)));
      setChildren(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchChildren();
  }, [auth.currentUser]);

  const handleAddChild = async () => {
    if (!auth.currentUser) return;
    await addDoc(collection(db, 'children'), {
      ...newChild,
      userId: auth.currentUser.uid,
    });
    setNewChild({ name: '', age: '', blood: '', allergies: '', pickup: '' });
    alert('Child added!');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4">My Family</h1>

        <div className="mb-6 p-4 bg-white rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Add Child</h2>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Name"
            value={newChild.name}
            onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Age"
            value={newChild.age}
            onChange={(e) => setNewChild({ ...newChild, age: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Blood Group"
            value={newChild.blood}
            onChange={(e) => setNewChild({ ...newChild, blood: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="Allergies"
            value={newChild.allergies}
            onChange={(e) => setNewChild({ ...newChild, allergies: e.target.value })}
          />
          <input
            className="border p-2 w-full mb-2"
            placeholder="People allowed to pickup"
            value={newChild.pickup}
            onChange={(e) => setNewChild({ ...newChild, pickup: e.target.value })}
          />
          <button className="bg-[#74C0FC] text-white px-4 py-2 rounded" onClick={handleAddChild}>
            Add
          </button>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Child Profiles</h2>
          <div className="grid gap-4">
            {children.map((c) => (
              <div key={c.id} className="bg-white p-4 rounded shadow">
                <p><strong>Name:</strong> {c.name}</p>
                <p><strong>Age:</strong> {c.age}</p>
                <p><strong>Blood Group:</strong> {c.blood}</p>
                <p><strong>Allergies:</strong> {c.allergies}</p>
                <p><strong>Pickup Adults:</strong> {c.pickup}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
