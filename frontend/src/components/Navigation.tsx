import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-ivory border-b border-old-gold shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/vendors" className="text-xl font-bold text-graphite">
              Wedding Planner
            </Link>
            <div className="flex space-x-4">
              <Link
                to="/vendors"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/vendors')
                    ? 'bg-forest-moss text-ivory'
                    : 'text-forest-moss hover:bg-old-gold hover:bg-opacity-10'
                }`}
              >
                Vendors
              </Link>
              <Link
                to="/tasks"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/tasks')
                    ? 'bg-forest-moss text-ivory'
                    : 'text-forest-moss hover:bg-old-gold hover:bg-opacity-10'
                }`}
              >
                Tasks
              </Link>
              <Link
                to="/budget"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/budget')
                    ? 'bg-forest-moss text-ivory'
                    : 'text-forest-moss hover:bg-old-gold hover:bg-opacity-10'
                }`}
              >
                Budget
              </Link>
              <Link
                to="/reminders"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/reminders')
                    ? 'bg-forest-moss text-ivory'
                    : 'text-forest-moss hover:bg-old-gold hover:bg-opacity-10'
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

