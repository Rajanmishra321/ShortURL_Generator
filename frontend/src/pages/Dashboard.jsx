import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ShortenForm from '../components/ShortenForm';
import LinkList from '../components/LinkList';

export default function Dashboard() {
  const [links, setLinks] = useState([]);

  // Fetch user's links on mount
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/links', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setLinks(data);
      } catch (error) {
        console.error('Failed to fetch links:', error);
      }
    };
    fetchLinks();
  }, []);

  return (
    <>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
          <nav>
            <Link to="/auth" className="text-sm text-gray-500 hover:text-gray-700">
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <ShortenForm onNewLink={(newLink) => setLinks([...links, newLink])} />
          <LinkList links={links} />
        </div>
      </main>
    </>
  );
}