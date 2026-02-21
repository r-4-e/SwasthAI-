import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { LogOut, User as UserIcon, Settings, ChevronRight } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-8 shadow-sm rounded-b-3xl mb-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold">
            {userName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{userName}</h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-4">
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div 
            onClick={() => window.location.href = '/onboarding'}
            className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg"><UserIcon size={20} className="text-gray-600" /></div>
              <span className="font-medium text-gray-900">Personal Details</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          <div 
            onClick={() => alert('App Settings coming soon!')}
            className="p-4 border-b border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-2 rounded-lg"><Settings size={20} className="text-gray-600" /></div>
              <span className="font-medium text-gray-900">App Settings</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </section>

        <button 
          onClick={logout}
          className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-red-500 font-semibold hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} /> Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
}
