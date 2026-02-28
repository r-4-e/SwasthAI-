import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { LogOut, User as UserIcon, Settings, ChevronRight, Save, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, logout, checkProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '',
    current_weight: '',
    goal_type: 'lose',
    goal_weight: '',
    activity_level: 'sedentary',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const res = await fetch('/api/profile', {
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.age) {
            setFormData({
              age: data.age || '',
              gender: data.gender || 'male',
              height: data.height || '',
              current_weight: data.current_weight || '',
              goal_type: data.goal_type || 'lose',
              goal_weight: data.goal_weight || '',
              activity_level: data.activity_level || 'sedentary',
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePlan = () => {
    const weight = parseFloat(formData.current_weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    
    if (!weight || !height || !age) return null;

    // BMR Calculation (Mifflin-St Jeor)
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr += gender === 'male' ? 5 : -161;

    // Activity Multiplier
    const activityMultipliers: any = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const tdee = bmr * (activityMultipliers[formData.activity_level] || 1.2);

    // Goal Adjustment
    let dailyCalories = tdee;
    let proteinPerKg = 1.6;

    if (formData.goal_type === 'lose') {
      dailyCalories -= 500;
      proteinPerKg = 2.0;
    } else if (formData.goal_type === 'gain') {
      dailyCalories += 400;
      proteinPerKg = 2.0;
    }

    // Macros
    const protein = Math.round(weight * proteinPerKg);
    const fat = Math.round((dailyCalories * 0.25) / 9); // 25% fat
    const carbs = Math.round((dailyCalories - (protein * 4) - (fat * 9)) / 4); // Remainder carbs
    const water = Math.round(weight * 35);

    return {
      daily_calories: Math.round(dailyCalories),
      protein_target: protein,
      carbs_target: carbs,
      fat_target: fat,
      water_target: water
    };
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const results = calculatePlan();
      if (!results) {
        throw new Error('Please fill in all required fields correctly.');
      }

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          ...formData,
          ...results,
          preferred_language: 'en'
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save profile');
      }
      
      await checkProfile();
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      console.error(error);
      setMessage(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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
        <section className="bg-white rounded-2xl shadow-sm overflow-hidden p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <UserIcon size={20} className="text-primary" /> Personal Details
            </h2>
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-primary font-semibold hover:underline"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg mb-4 text-sm ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                <input 
                  type="number" 
                  name="age" 
                  value={formData.age} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                <select 
                  name="gender" 
                  value={formData.gender} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Height (cm)</label>
                <input 
                  type="number" 
                  name="height" 
                  value={formData.height} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Weight (kg)</label>
                <input 
                  type="number" 
                  name="current_weight" 
                  value={formData.current_weight} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Activity Level</label>
              <select 
                name="activity_level" 
                value={formData.activity_level} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="sedentary">Sedentary (Office job)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (Physical job)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Goal</label>
              <select 
                name="goal_type" 
                value={formData.goal_type} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500"
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Gain Muscle</option>
              </select>
            </div>

            {formData.goal_type !== 'maintain' && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target Weight (kg)</label>
                <input 
                  type="number" 
                  name="goal_weight" 
                  value={formData.goal_weight} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full p-2 border rounded-lg bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500" 
                />
              </div>
            )}

            {isEditing && (
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-primary text-white p-3 rounded-xl shadow-sm flex items-center justify-center gap-2 font-semibold hover:bg-primary-dark transition-colors disabled:opacity-70"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                Save Changes
              </button>
            )}
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
