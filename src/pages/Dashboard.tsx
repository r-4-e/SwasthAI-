import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { Plus, Droplets, Flame, Utensils, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

const ProgressBar = ({ value, max, color, label }: { value: number, max: number, color: string, label: string }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs font-medium mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="text-gray-400">{value} / {max}g</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          className={clsx("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const date = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/dashboard/${date}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [date]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;

  const { log, entries, weightHistory } = data || { log: {}, entries: [], weightHistory: [] };
  
  // Mock targets if not set (fallback)
  const targets = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 60,
    water: 2500,
    ...user // In a real app, we'd merge profile data here properly
  };

  // Calculate remaining
  const remainingCalories = targets.calories - (log.calories || 0);
  const calorieProgress = ((log.calories || 0) / targets.calories) * 100;
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 shadow-sm rounded-b-3xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hello, {userName.split(' ')[0]}!</h1>
            <p className="text-gray-500 text-sm">Let's hit your goals today.</p>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
            {userName[0].toUpperCase()}
          </div>
        </div>

        {/* Calorie Card */}
        <div className="bg-primary text-white p-6 rounded-2xl shadow-lg shadow-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Flame size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <div>
                <div className="text-primary-light text-sm font-medium mb-1">Calories Remaining</div>
                <div className="text-4xl font-bold tracking-tight">{remainingCalories}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold opacity-90">{log.calories || 0}</div>
                <div className="text-xs opacity-70">Eaten</div>
              </div>
            </div>
            
            <div className="h-3 bg-black/20 rounded-full overflow-hidden mt-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${calorieProgress}%` }}
                className="h-full bg-white/90 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6">
        {/* Macros */}
        <section className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Macros</h3>
          <ProgressBar label="Protein" value={Math.round(log.protein || 0)} max={targets.protein} color="bg-emerald-500" />
          <ProgressBar label="Carbs" value={Math.round(log.carbs || 0)} max={targets.carbs} color="bg-blue-500" />
          <ProgressBar label="Fat" value={Math.round(log.fat || 0)} max={targets.fat} color="bg-amber-500" />
        </section>

        {/* Hydration */}
        <section className="bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Droplets className="text-blue-500" size={20} /> Hydration
            </h3>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {(log.water_intake || 0) / 1000} <span className="text-sm text-gray-400 font-normal">/ {(targets.water / 1000).toFixed(1)} L</span>
            </div>
          </div>
          <div className="h-16 w-16 rounded-full border-4 border-blue-100 flex items-center justify-center text-blue-500 font-bold text-sm">
            {Math.round(((log.water_intake || 0) / targets.water) * 100)}%
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-2 gap-4">
          <Link to="/scan-meal" className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <Utensils size={24} />
            </div>
            <span className="font-semibold text-gray-700">Scan Meal</span>
          </Link>
          <button className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Plus size={24} />
            </div>
            <span className="font-semibold text-gray-700">Add Water</span>
          </button>
        </section>

        {/* Weight Trend */}
        <section className="bg-white p-5 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weight Trend</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightHistory}>
                <XAxis dataKey="date" hide />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                <Tooltip />
                <Line type="monotone" dataKey="weight" stroke="#006d5b" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
