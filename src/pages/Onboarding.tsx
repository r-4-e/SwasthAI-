import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import clsx from 'clsx';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    height: '',
    current_weight: '',
    goal_type: 'lose',
    goal_weight: '',
    activity_level: 'sedentary',
    target_date: '',
  });

  const [results, setResults] = useState<any>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePlan = () => {
    const weight = parseFloat(formData.current_weight);
    const height = parseFloat(formData.height);
    const age = parseInt(formData.age);
    const gender = formData.gender;
    
    if (!weight || !height || !age) return;

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

    // Water
    const water = Math.round(weight * 35);

    setResults({
      daily_calories: Math.round(dailyCalories),
      protein_target: protein,
      carbs_target: carbs,
      fat_target: fat,
      water_target: water
    });
  };

  useEffect(() => {
    if (step === 3) {
      calculatePlan();
    }
  }, [step, formData]);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...results,
          preferred_language: 'en' // Default for now
        }),
      });

      if (!res.ok) throw new Error('Failed to save profile');
      
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 1 && "Basic Details"}
            {step === 2 && "Your Goals"}
            {step === 3 && "Your Plan"}
          </h2>
          <div className="text-sm font-medium text-gray-400">Step {step} of 3</div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="25" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="175" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (kg)</label>
              <input type="number" name="current_weight" value={formData.current_weight} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="70" />
            </div>
            <button onClick={nextStep} className="w-full bg-primary text-white py-3 rounded-xl mt-4 font-semibold flex items-center justify-center gap-2">
              Next <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {['lose', 'maintain', 'gain'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFormData(prev => ({ ...prev, goal_type: type }))}
                    className={clsx(
                      "p-3 rounded-xl border capitalize transition-all",
                      formData.goal_type === type ? "bg-primary/10 border-primary text-primary font-semibold" : "border-gray-200 text-gray-600"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            
            {formData.goal_type !== 'maintain' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Weight (kg)</label>
                <input type="number" name="goal_weight" value={formData.goal_weight} onChange={handleChange} className="w-full p-3 border rounded-xl" placeholder="65" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
              <select name="activity_level" value={formData.activity_level} onChange={handleChange} className="w-full p-3 border rounded-xl bg-white">
                <option value="sedentary">Sedentary (Office job)</option>
                <option value="light">Lightly Active (1-3 days/week)</option>
                <option value="moderate">Moderately Active (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (Physical job)</option>
              </select>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={nextStep} className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                Next <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && results && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 text-center">
              <div className="text-gray-500 text-sm uppercase tracking-wide font-medium mb-1">Daily Target</div>
              <div className="text-4xl font-bold text-primary">{results.daily_calories} <span className="text-lg font-normal text-gray-500">kcal</span></div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-emerald-600 font-bold text-xl">{results.protein_target}g</div>
                <div className="text-xs text-gray-500 mt-1">Protein</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-blue-600 font-bold text-xl">{results.carbs_target}g</div>
                <div className="text-xs text-gray-500 mt-1">Carbs</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-amber-600 font-bold text-xl">{results.fat_target}g</div>
                <div className="text-xs text-gray-500 mt-1">Fat</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-blue-700">
              <div className="font-semibold">💧 Water Goal:</div>
              <div>{(results.water_target / 1000).toFixed(1)} Liters / day</div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={prevStep} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                <ChevronLeft size={20} /> Back
              </button>
              <button onClick={handleSubmit} className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                Start Journey <Check size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
