import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Check, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

export default function ScanMeal() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Could not access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
        stopCamera();
        analyzeImage(dataUrl);
      }
    }
  };

  const analyzeImage = async (imageBase64: string) => {
    setAnalyzing(true);
    setError('');
    
    try {
      const res = await fetch('/api/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      if (!res.ok) throw new Error('Failed to analyze image');
      
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setError('Failed to identify food. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!results || !results.items) return;

    try {
      // Save each item
      for (const item of results.items) {
        await fetch('/api/food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            name: item.name,
            calories: (item.calories_per_100g * item.estimated_grams) / 100,
            protein: (item.protein_per_100g * item.estimated_grams) / 100,
            carbs: (item.carbs_per_100g * item.estimated_grams) / 100,
            fat: (item.fat_per_100g * item.estimated_grams) / 100,
            grams: item.estimated_grams,
            meal_type: 'snack' // Default for now, could add selector
          }),
        });
      }
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Failed to save meal.');
    }
  };

  const reset = () => {
    setImage(null);
    setResults(null);
    setError('');
    startCamera();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      {/* Camera View */}
      {!image && (
        <div className="flex-1 relative overflow-hidden">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50 pointer-events-none" />
          
          <div className="absolute top-6 left-6 z-10">
            <button onClick={() => navigate('/dashboard')} className="text-white p-2 bg-black/20 rounded-full backdrop-blur-md">
              <X size={24} />
            </button>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center z-20">
            <button 
              onClick={captureImage}
              className="h-20 w-20 bg-white rounded-full border-4 border-gray-200 shadow-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <div className="h-16 w-16 bg-white rounded-full border-2 border-black" />
            </button>
          </div>
        </div>
      )}

      {/* Analysis View */}
      {image && (
        <div className="flex-1 bg-gray-900 flex flex-col">
          <div className="h-1/2 relative">
            <img src={image} alt="Captured" className="w-full h-full object-cover" />
            <div className="absolute top-6 left-6 z-10">
              <button onClick={reset} className="text-white p-2 bg-black/40 rounded-full backdrop-blur-md">
                <RefreshCw size={24} />
              </button>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-t-3xl -mt-6 relative z-10 p-6 flex flex-col">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

            {analyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-primary mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-900">Analyzing Meal...</h3>
                <p className="text-gray-500 mt-2">Identifying food and estimating macros</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-red-500 mb-4 text-lg font-medium">{error}</div>
                <button onClick={reset} className="bg-primary text-white px-6 py-3 rounded-xl font-semibold">
                  Try Again
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Results</h3>
                <div className="space-y-4">
                  {results?.items?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          {Math.round(item.confidence * 100)}% Match
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-center text-sm mb-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <div className="font-bold text-gray-900">{Math.round((item.calories_per_100g * item.estimated_grams) / 100)}</div>
                          <div className="text-[10px] text-gray-500">kcal</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <div className="font-bold text-emerald-600">{Math.round((item.protein_per_100g * item.estimated_grams) / 100)}g</div>
                          <div className="text-[10px] text-gray-500">Prot</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <div className="font-bold text-blue-600">{Math.round((item.carbs_per_100g * item.estimated_grams) / 100)}g</div>
                          <div className="text-[10px] text-gray-500">Carbs</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg shadow-sm">
                          <div className="font-bold text-amber-600">{Math.round((item.fat_per_100g * item.estimated_grams) / 100)}g</div>
                          <div className="text-[10px] text-gray-500">Fat</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">Weight (g):</label>
                        <input 
                          type="number" 
                          defaultValue={item.estimated_grams}
                          className="w-20 p-1 border rounded text-center font-medium"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!analyzing && !error && (
              <div className="mt-6">
                <button 
                  onClick={handleSave}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
                >
                  <Check size={20} /> Log Meal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
