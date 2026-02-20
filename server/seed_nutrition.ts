import db from './db';

const indianFoods = [
  // Breads
  { name: 'Roti (Whole Wheat)', calories: 297, protein: 10.6, carbs: 60.3, fat: 2.3, category: 'Breads' },
  { name: 'Naan (Plain)', calories: 315, protein: 9.5, carbs: 53.6, fat: 6.2, category: 'Breads' },
  { name: 'Paratha (Plain)', calories: 330, protein: 8.5, carbs: 50.2, fat: 10.5, category: 'Breads' },
  { name: 'Aloo Paratha', calories: 240, protein: 6.5, carbs: 35.0, fat: 8.5, category: 'Breads' },
  { name: 'Puri', calories: 350, protein: 6.0, carbs: 45.0, fat: 16.0, category: 'Breads' },
  { name: 'Bhatura', calories: 300, protein: 8.0, carbs: 48.0, fat: 9.0, category: 'Breads' },

  // Rice & Grains
  { name: 'White Rice (Cooked)', calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3, category: 'Rice' },
  { name: 'Brown Rice (Cooked)', calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, category: 'Rice' },
  { name: 'Jeera Rice', calories: 150, protein: 3.0, carbs: 30.0, fat: 2.5, category: 'Rice' },
  { name: 'Biryani (Chicken)', calories: 160, protein: 8.0, carbs: 20.0, fat: 6.0, category: 'Rice' },
  { name: 'Biryani (Veg)', calories: 140, protein: 4.0, carbs: 22.0, fat: 5.0, category: 'Rice' },
  { name: 'Khichdi', calories: 120, protein: 4.5, carbs: 18.0, fat: 3.5, category: 'Rice' },
  { name: 'Pulao (Veg)', calories: 135, protein: 3.5, carbs: 24.0, fat: 3.0, category: 'Rice' },
  { name: 'Curd Rice', calories: 130, protein: 4.0, carbs: 18.0, fat: 5.0, category: 'Rice' },

  // Dals & Legumes
  { name: 'Dal Tadka (Yellow)', calories: 110, protein: 6.0, carbs: 14.0, fat: 4.0, category: 'Dal' },
  { name: 'Dal Makhani', calories: 160, protein: 6.5, carbs: 16.0, fat: 9.0, category: 'Dal' },
  { name: 'Chana Masala', calories: 130, protein: 7.0, carbs: 18.0, fat: 4.5, category: 'Dal' },
  { name: 'Rajma Masala', calories: 140, protein: 8.0, carbs: 20.0, fat: 4.0, category: 'Dal' },
  { name: 'Sambar', calories: 70, protein: 3.0, carbs: 10.0, fat: 2.0, category: 'Dal' },

  // Curries (Veg)
  { name: 'Palak Paneer', calories: 180, protein: 9.0, carbs: 6.0, fat: 14.0, category: 'Curry' },
  { name: 'Paneer Butter Masala', calories: 250, protein: 10.0, carbs: 12.0, fat: 18.0, category: 'Curry' },
  { name: 'Matar Paneer', calories: 160, protein: 9.0, carbs: 10.0, fat: 10.0, category: 'Curry' },
  { name: 'Aloo Gobi', calories: 90, protein: 2.5, carbs: 12.0, fat: 4.0, category: 'Curry' },
  { name: 'Bhindi Masala', calories: 100, protein: 3.0, carbs: 8.0, fat: 6.0, category: 'Curry' },
  { name: 'Baingan Bharta', calories: 80, protein: 2.0, carbs: 10.0, fat: 4.0, category: 'Curry' },
  { name: 'Mix Veg Curry', calories: 110, protein: 3.0, carbs: 12.0, fat: 6.0, category: 'Curry' },

  // Curries (Non-Veg)
  { name: 'Butter Chicken', calories: 240, protein: 14.0, carbs: 8.0, fat: 16.0, category: 'Curry' },
  { name: 'Chicken Tikka Masala', calories: 180, protein: 16.0, carbs: 6.0, fat: 10.0, category: 'Curry' },
  { name: 'Chicken Curry (Home Style)', calories: 150, protein: 18.0, carbs: 5.0, fat: 7.0, category: 'Curry' },
  { name: 'Fish Curry', calories: 140, protein: 15.0, carbs: 4.0, fat: 7.0, category: 'Curry' },
  { name: 'Mutton Curry', calories: 200, protein: 16.0, carbs: 5.0, fat: 13.0, category: 'Curry' },
  { name: 'Egg Curry', calories: 130, protein: 9.0, carbs: 4.0, fat: 9.0, category: 'Curry' },

  // Snacks & Breakfast
  { name: 'Idli', calories: 130, protein: 4.0, carbs: 26.0, fat: 0.5, category: 'Snack' },
  { name: 'Dosa (Plain)', calories: 170, protein: 4.0, carbs: 28.0, fat: 4.0, category: 'Snack' },
  { name: 'Masala Dosa', calories: 220, protein: 5.0, carbs: 32.0, fat: 8.0, category: 'Snack' },
  { name: 'Vada (Medu)', calories: 280, protein: 8.0, carbs: 25.0, fat: 18.0, category: 'Snack' },
  { name: 'Upma', calories: 160, protein: 4.0, carbs: 25.0, fat: 5.0, category: 'Snack' },
  { name: 'Poha', calories: 180, protein: 3.0, carbs: 35.0, fat: 4.0, category: 'Snack' },
  { name: 'Samosa', calories: 260, protein: 4.0, carbs: 24.0, fat: 17.0, category: 'Snack' },
  { name: 'Pakora (Onion)', calories: 280, protein: 5.0, carbs: 22.0, fat: 20.0, category: 'Snack' },
  { name: 'Dhokla', calories: 150, protein: 6.0, carbs: 20.0, fat: 5.0, category: 'Snack' },
  { name: 'Pav Bhaji', calories: 180, protein: 5.0, carbs: 25.0, fat: 8.0, category: 'Snack' },

  // Sweets
  { name: 'Gulab Jamun', calories: 350, protein: 4.0, carbs: 45.0, fat: 15.0, category: 'Sweet' },
  { name: 'Rasgulla', calories: 180, protein: 4.0, carbs: 38.0, fat: 1.0, category: 'Sweet' },
  { name: 'Jalebi', calories: 380, protein: 2.0, carbs: 65.0, fat: 12.0, category: 'Sweet' },
  { name: 'Kheer', calories: 160, protein: 5.0, carbs: 22.0, fat: 6.0, category: 'Sweet' },
  { name: 'Halwa (Gajar)', calories: 250, protein: 3.0, carbs: 35.0, fat: 12.0, category: 'Sweet' },
];

export function seedNutritionDatabase() {
  const count = db.prepare('SELECT COUNT(*) as count FROM nutrition_database').get() as { count: number };
  
  if (count.count === 0) {
    console.log('Seeding nutrition database with Indian foods...');
    const insert = db.prepare(`
      INSERT INTO nutrition_database (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category)
      VALUES (@name, @calories, @protein, @carbs, @fat, @category)
    `);

    const insertMany = db.transaction((foods) => {
      for (const food of foods) insert.run(food);
    });

    insertMany(indianFoods);
    console.log('Seeding complete.');
  }
}
