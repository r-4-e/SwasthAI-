import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, User, BarChart2, Droplets } from 'lucide-react';
import clsx from 'clsx';

export default function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: BarChart2, label: 'Stats', href: '/stats' }, // Placeholder
    { icon: PlusCircle, label: 'Log', href: '/log', isFab: true },
    { icon: Droplets, label: 'Water', href: '/water' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  if (['/login', '/register', '/onboarding'].includes(path)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-4 z-50">
      <div className="flex justify-between items-end max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = path === item.href;
          
          if (item.isFab) {
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center -mt-8"
              >
                <div className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors">
                  <item.icon size={28} />
                </div>
                <span className="text-xs font-medium mt-1 text-gray-600">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={clsx(
                "flex flex-col items-center justify-center p-2 transition-colors",
                isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <item.icon size={24} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
