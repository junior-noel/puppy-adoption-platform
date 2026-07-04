import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="text-center py-20">
    <h1 className="font-display text-3xl mb-4">Page not found</h1>
    <Link to="/" className="text-amber-700">Back home</Link>
  </div>
);

export default NotFound;
