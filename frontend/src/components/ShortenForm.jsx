import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createShortLink } from '../redux/linksSlice';
import { 
  PaperAirplaneIcon, 
  LinkIcon, 
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ShortenForm() {
  const [url, setUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [createdLink, setCreatedLink] = useState(null);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.links);

  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate URL format
    const isValid = validateUrl(url);
    setIsValidUrl(isValid);
    
    if (!isValid) {
      toast.error('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    try {
      const result = await dispatch(createShortLink({ 
        originalUrl: url,
        customAlias: customAlias || undefined
      })).unwrap();
      
      toast.success('URL shortened successfully!');
      setCreatedLink(result);
      setUrl('');
      setCustomAlias('');
    } catch (error) {
      console.error('Error creating short link:', error);
      toast.error(error.message || 'Failed to shorten URL. Please try again.');
    }
  };

  const copyToClipboard = () => {
    if (createdLink?.shortUrl) {
      navigator.clipboard.writeText(createdLink.shortUrl);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex items-center mb-4">
        <LinkIcon className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-800">Shorten a URL</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
            Destination URL *
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setIsValidUrl(true);
            }}
            placeholder="https://example.com/very-long-url"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              !isValidUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {!isValidUrl && (
            <p className="mt-1 text-sm text-red-600">Please enter a valid URL including http:// or https://</p>
          )}
        </div>

        <div>
          <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 mb-1">
            Custom Alias (optional)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              http://localhost:5000/
            </span>
            <input
              type="text"
              id="customAlias"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              placeholder="my-custom-link"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              pattern="[A-Za-z0-9_-]+"
              title="Only letters, numbers, hyphens and underscores allowed"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          <PaperAirplaneIcon className="h-5 w-5 mr-2" />
          {status === 'loading' ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {createdLink && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Your shortened URL</h3>
          <div className="flex items-center">
            <a
              href={createdLink.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center break-all"
            >
              {createdLink.shortUrl}
              <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4 flex-shrink-0" />
            </a>
            <button
              onClick={copyToClipboard}
              className="ml-2 p-1 rounded hover:bg-blue-100 flex-shrink-0"
              title="Copy to clipboard"
            >
              <ClipboardDocumentIcon className="h-5 w-5 text-blue-500" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Clicks: {createdLink.clicks || 0}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Created: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}