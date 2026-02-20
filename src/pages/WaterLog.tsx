import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Droplets, Plus, Minus, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';

export default function WaterLog() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(250);
  const [loading, setLoading] = useState(false);

  const handleLog = async () => {
    setLoading(true);
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          amount
        }),
      });
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-500" />
        
        <button onClick={() => navigate('/dashboard')} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600">
          <ChevronLeft size={24} />
        </button>

        <div className="mb-8 mt-4">
          <div className="h-24 w-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-4">
            <Droplets size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Log Water</h2>
          <p className="text-gray-500">Stay hydrated!</p>
        </div>

        <div className="flex items-center justify-center gap-6 mb-10">
          <button 
            onClick={() => setAmount(prev => Math.max(50, prev - 50))}
            className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
          >
            <Minus size={20} />
          </button>
          
          <div className="text-4xl font-bold text-gray-900 w-32">
            {amount}<span className="text-lg text-gray-400 font-normal ml-1">ml</span>
          </div>

          <button 
            onClick={() => setAmount(prev => prev + 50)}
            className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
          >
            <Plus size={20} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[250, 500, 750].map(val => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={clsx(
                "py-2 rounded-xl text-sm font-medium transition-colors",
                amount === val ? "bg-blue-500 text-white" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              )}
            >
              {val}ml
            </button>
          ))}
        </div>

        <button
          onClick={handleLog}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-600 transition-all active:scale-[0.98]"
        >
          {loading ? 'Logging...' : 'Add Water'}
        </button>
      </div>
    </div>
  );
}
