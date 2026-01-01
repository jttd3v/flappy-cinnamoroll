/**
 * Candy Shop - Configuration
 */

export const CANDY_ITEMS = [
  { id: 'lollipop', name: 'Lollipop', icon: '🍭', price: 0.50, cost: 0.20 },
  { id: 'chocolate', name: 'Chocolate', icon: '🍫', price: 2.00, cost: 0.80 },
  { id: 'gummy', name: 'Gummy Bears', icon: '🐻', price: 1.50, cost: 0.60 },
  { id: 'candy', name: 'Hard Candy', icon: '🍬', price: 0.25, cost: 0.10 },
  { id: 'cookie', name: 'Cookie', icon: '🍪', price: 1.00, cost: 0.40 },
  { id: 'cake', name: 'Cupcake', icon: '🧁', price: 3.00, cost: 1.20 },
  { id: 'icecream', name: 'Ice Cream', icon: '🍦', price: 2.50, cost: 1.00 },
  { id: 'donut', name: 'Donut', icon: '🍩', price: 1.50, cost: 0.50 }
];

export const SHOP_CONFIG = Object.freeze({
  STARTING_MONEY: 20.00,
  CUSTOMERS_PER_DAY: 10,
  TIP_MULTIPLIER: 0.15,
  
  DIFFICULTY_SETTINGS: {
    1: { maxItems: 1, maxQuantity: 5, exactChange: true, discount: false, tax: false },
    2: { maxItems: 2, maxQuantity: 3, exactChange: false, discount: false, tax: false },
    3: { maxItems: 2, maxQuantity: 3, exactChange: false, discount: false, tax: false },
    4: { maxItems: 3, maxQuantity: 4, exactChange: false, discount: false, tax: false },
    5: { maxItems: 3, maxQuantity: 4, exactChange: false, discount: true, tax: false },
    6: { maxItems: 4, maxQuantity: 5, exactChange: false, discount: true, tax: true },
    7: { maxItems: 5, maxQuantity: 5, exactChange: false, discount: true, tax: true }
  },
  
  TAX_RATE: 0.08,
  
  LEADERBOARD_KEY: 'candyShopLeaderboard'
});

export function getDifficultyFromAge(age) {
  if (age <= 8) return 1;
  if (age <= 10) return 2;
  if (age <= 12) return 3;
  if (age <= 15) return 4;
  if (age <= 18) return 5;
  if (age <= 25) return 6;
  return 7;
}

export default SHOP_CONFIG;
