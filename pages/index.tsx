import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config'; // ✅ Use pre-initialized db
import Navbar from '../components/Navbar';
import Link from 'next/link';

export default function Home() {
  const [daycares, setDaycares] = useState([]);
  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const fetchDaycares = async () => {
      const snap = await getDocs(collection(db, 'daycares'));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDaycares(data);
      setFiltered(data);
    };
    fetchDaycares();
  }, []);

  const handleSearch = () => {
    const results = daycares.filter(dc =>
      dc.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(results);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold mb-4 text-[#74C0FC]">
          Find the perfect daycare for your little one
        </h1>

        <div className="flex mb-4 gap-2">
          <input
            className="border p-2 rounded w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search daycare name..."
          />
          <button onClick={handleSearch} className="bg-[#74C0FC] text-white px-4 py-2 rounded">
            Search
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filtered.map(dc => (
            <Link key={dc.id} href={`/daycare/${dc.id}`}>
              <div className="bg-white p-4 shadow rounded cursor-pointer hover:bg-blue-50">
                <h2 className="font-semibold text-lg">{dc.name}</h2>
                <p className="text-sm text-gray-600">
                  ⭐ {dc.rating} ({dc.reviews?.length || 0} reviews)
                </p>
                <p className="text-sm">₹{dc.price} / session</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
