import express from 'express';
import db from './db';
import { GoogleGenAI } from "@google/genai";

const router = express.Router();

// Middleware to check auth
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// --- Profile Routes ---

router.post('/profile', requireAuth, (req: any, res: any) => {
  const {
    age, gender, height, current_weight, goal_type, goal_weight,
    target_date, activity_level, daily_calories, protein_target,
    carbs_target, fat_target, water_target, preferred_language
  } = req.body;

  try {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO user_profiles (
        user_id, age, gender, height, current_weight, goal_type, goal_weight,
        target_date, activity_level, daily_calories, protein_target,
        carbs_target, fat_target, water_target, preferred_language
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      req.user.id, age, gender, height, current_weight, goal_type, goal_weight,
      target_date, activity_level, daily_calories, protein_target,
      carbs_target, fat_target, water_target, preferred_language
    );

    // Initial weight log
    const weightStmt = db.prepare('INSERT INTO weight_logs (user_id, date, weight) VALUES (?, ?, ?)');
    weightStmt.run(req.user.id, new Date().toISOString().split('T')[0], current_weight);

    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

router.get('/profile', requireAuth, (req: any, res: any) => {
  try {
    const stmt = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?');
    const profile = stmt.get(req.user.id);
    res.json(profile || {});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// --- Dashboard Routes ---

router.get('/dashboard/:date', requireAuth, (req: any, res: any) => {
  const { date } = req.params;
  
  try {
    // Get daily log summary
    let log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?').get(req.user.id, date) as any;
    
    if (!log) {
      log = { calories: 0, protein: 0, carbs: 0, fat: 0, water_intake: 0 };
    }

    // Get food entries
    const entries = db.prepare('SELECT * FROM food_entries WHERE user_id = ? AND date = ? ORDER BY created_at DESC').all(req.user.id, date);

    // Get weight history (last 7 entries)
    const weightHistory = db.prepare('SELECT * FROM weight_logs WHERE user_id = ? ORDER BY date DESC LIMIT 7').all(req.user.id);

    res.json({ log, entries, weightHistory });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// --- Food Logging Routes ---

router.post('/food', requireAuth, (req: any, res: any) => {
  const { date, name, calories, protein, carbs, fat, grams, meal_type } = req.body;

  const insertFood = db.transaction(() => {
    // Insert food entry
    db.prepare(`
      INSERT INTO food_entries (user_id, date, name, calories, protein, carbs, fat, grams, meal_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, date, name, calories, protein, carbs, fat, grams, meal_type);

    // Update daily log
    const log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?').get(req.user.id, date) as any;
    
    if (log) {
      db.prepare(`
        UPDATE daily_logs 
        SET calories = calories + ?, protein = protein + ?, carbs = carbs + ?, fat = fat + ?
        WHERE id = ?
      `).run(calories, protein, carbs, fat, log.id);
    } else {
      db.prepare(`
        INSERT INTO daily_logs (user_id, date, calories, protein, carbs, fat)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(req.user.id, date, calories, protein, carbs, fat);
    }
  });

  try {
    insertFood();
    res.json({ message: 'Food logged' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to log food' });
  }
});

// --- Water Logging Routes ---

router.post('/water', requireAuth, (req: any, res: any) => {
  const { date, amount } = req.body;

  try {
    const log = db.prepare('SELECT * FROM daily_logs WHERE user_id = ? AND date = ?').get(req.user.id, date) as any;

    if (log) {
      db.prepare('UPDATE daily_logs SET water_intake = water_intake + ? WHERE id = ?').run(amount, log.id);
    } else {
      db.prepare('INSERT INTO daily_logs (user_id, date, water_intake) VALUES (?, ?, ?)').run(req.user.id, date, amount);
    }
    
    res.json({ message: 'Water logged' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log water' });
  }
});

// --- Gemini Vision API ---

router.post('/analyze-meal', requireAuth, async (req: any, res: any) => {
  const { imageBase64, mode } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: 'Image required' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const context = mode === 'plate' 
      ? "This image contains a full plate of food with potentially multiple items." 
      : "This image contains a single food item or snack.";

    const prompt = `
      Analyze this food image. ${context}
      Identify all distinct food items.
      Focus on identifying specific Indian dishes if present (e.g., "Dal Makhani" instead of "Lentil Soup", "Aloo Paratha" instead of "Stuffed Bread").
      
      For each item:
      1. Name: A concise, common name.
      2. Estimated Grams: Your best estimate of the weight in grams based on visual portion size.
      3. Nutritional Info per 100g: Calories, Protein (g), Carbs (g), Fat (g).
      4. Confidence: A score from 0.0 to 1.0 indicating how sure you are.

      Return ONLY a valid JSON object with this exact structure:
      {
        "items": [
          {
            "name": "string",
            "estimated_grams": number,
            "calories_per_100g": number,
            "protein_per_100g": number,
            "carbs_per_100g": number,
            "fat_per_100g": number,
            "confidence": number
          }
        ]
      }
      Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
    `;

    // Remove data:image/jpeg;base64, prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data
            }
          },
          { text: prompt }
        ]
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    // Clean up markdown code blocks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(text);

    // Enhance with local database
    const enhancedItems = data.items.map((item: any) => {
      // Simple fuzzy match: check if DB name is contained in AI name or vice versa
      // In a real app, use a proper fuzzy search library
      const stmt = db.prepare(`
        SELECT * FROM nutrition_database 
        WHERE name LIKE ? OR ? LIKE '%' || name || '%'
        ORDER BY length(name) DESC 
        LIMIT 1
      `);
      
      const dbItem = stmt.get(`%${item.name}%`, item.name) as any;

      if (dbItem) {
        // Use DB macros but keep AI's weight estimate
        return {
          ...item,
          name: dbItem.name, // Normalize name
          calories_per_100g: dbItem.calories_per_100g,
          protein_per_100g: dbItem.protein_per_100g,
          carbs_per_100g: dbItem.carbs_per_100g,
          fat_per_100g: dbItem.fat_per_100g,
          source: 'verified_db' // Flag to show user it's verified
        };
      }
      return { ...item, source: 'ai_estimate' };
    });

    res.json({ items: enhancedItems });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

export default router;
