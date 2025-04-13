import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLinks, selectLink } from '../redux/linksSlice';
import ShortenForm from '../components/ShortenForm';
import LinkList from '../components/LinkList';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { links, status, error } = useSelector((state) => state.links);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchLinks());
    }
  }, [status, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">URL Shortener</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          <ShortenForm />
          <LinkList />
        </div>
      </main>
    </div>
  );
}