import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/vendors" className="text-xl font-bold text-gray-800">
              Wedding Planner
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/vendors"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/vendors')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Vendors
              </Link>
              <Link
                to="/tasks"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Tasks
              </Link>
              <Link
                to="/budget"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/budget')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Budget
              </Link>
              <Link
                to="/reminders"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/reminders')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Reminders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

