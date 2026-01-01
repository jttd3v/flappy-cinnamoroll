# Cinnamoroll's Candy Shop - Product Requirements Document

> **Build Order: #5** | **Priority: MEDIUM** | **Complexity: MEDIUM**

## 📋 Overview

| Field | Value |
|-------|-------|
| **Game Name** | Cinnamoroll's Candy Shop |
| **Type** | Shop Simulation + Math |
| **Target Age** | 6-35 (difficulty scaled) |
| **Primary Theme** | Math + Rewards |
| **Secondary Themes** | Critical Thinking, Fun |
| **Estimated Dev Time** | 6-8 hours |
| **Dependencies** | Core systems |

---

## 🎯 Objectives

### Learning Goals
- **Counting** (Ages 6-8)
- **Addition** (Ages 9-10)
- **Making change** (Ages 11-15)
- **Percentages/discounts** (Ages 16-25)
- **Profit calculation** (Ages 26-35)

### Game Goals
- Serve customers correctly
- Calculate prices and change
- Keep customers happy
- Earn tips and bonuses
- Unlock new candy items

---

## 🎮 Gameplay Description

### Core Mechanic
1. Customer appears with an order
2. Player selects requested items
3. Calculate total (if applicable)
4. Accept payment and give correct change
5. Customer rates satisfaction
6. Earn money and tips

### Customer Flow
```
Customer: "I'd like 3 lollipops!"
         [$1 each]

[🍭] [🍭] [🍭]    Total: $3.00
                  
Customer pays: $5.00
Your change: [___]

[Give $2.00]  ✓ Correct!
Customer: "Thank you!" ⭐⭐⭐
```

---

## 📊 Difficulty Scaling

| Age | Task | Complexity |
|-----|------|------------|
| 6-8 | Count items only | "Give 3 candies" |
| 9-10 | Simple addition | "$1 + $1 + $2 = ?" |
| 11-12 | Make change | "Pay $5, give change" |
| 13-15 | Multiple items + change | Complex orders |
| 16-18 | Discounts (10%, 25%) | "20% off!" |
| 19-25 | Tax calculation | "Add 8% tax" |
| 26-35 | Profit margins | "Cost $2, sell $3.50" |

---

## 🎨 Visual Design

### Shop Screen
```
┌────────────────────────────────┐
│  💰 $45.50    ⭐⭐⭐⭐⭐      │
│  Day 3        Customers: 12    │
├────────────────────────────────┤
│          🐰 Customer           │
│      "2 chocolates please!"    │
│                                │
│  ┌──────┐ ┌──────┐ ┌──────┐   │
│  │ 🍫  │ │ 🍬  │ │ 🍭  │   │
│  │ $2  │ │ $1  │ │ $1  │   │
│  └──────┘ └──────┘ └──────┘   │
│                                │
│  Order: [🍫] [🍫]              │
│  Total: $4.00                  │
│                                │
│  [Complete Order]              │
└────────────────────────────────┘
```

### Cash Register
```
┌────────────────────────────────┐
│      CASH REGISTER             │
│                                │
│  Total: $4.00                  │
│  Paid:  $5.00                  │
│  ─────────────────             │
│  Change: $___                  │
│                                │
│  [$0.25] [$0.50] [$1] [$5]    │
│                                │
│  Your change: [$1.00]          │
│                                │
│  [Give Change]                 │
└────────────────────────────────┘
```

---

## 🗂️ Data Structures

### Candy Item
```javascript
{
  id: 'chocolate',
  name: 'Chocolate Bar',
  icon: '🍫',
  price: 2.00,
  cost: 0.80,  // For profit calculation
  category: 'chocolate'
}
```

### Customer Order
```javascript
{
  customerId: 'cust_001',
  customerName: 'Mocha',
  items: [
    { itemId: 'chocolate', quantity: 2 }
  ],
  discount: null,  // or { type: 'percent', value: 20 }
  taxRate: 0,      // 0.08 for 8% tax
  payment: 5.00,
  timeLimit: 30    // seconds, null for no limit
}
```

### Shop State
```javascript
{
  money: 45.50,
  day: 3,
  customersServed: 12,
  perfectOrders: 10,
  reputation: 4.5,  // Star rating
  unlockedItems: ['lollipop', 'chocolate', 'gummy'],
  currentOrder: null
}
```

---

## 📦 New Modules Needed

### ShopSimulation.js
```javascript
class ShopSimulation {
  generateCustomer(difficulty)
  processOrder(selectedItems)
  calculateTotal(items, discount, tax)
  validateChange(given, required)
  rateCustomerSatisfaction()
}
```

### CurrencySystem.js
```javascript
class CurrencySystem {
  formatCurrency(amount)
  calculateChange(paid, total)
  getCoinDenominations()
  validateChangeGiven(coins, required)
}
```

---

## 🧪 Test Cases

- [ ] Counting items works correctly
- [ ] Price calculation accurate
- [ ] Change calculation correct
- [ ] Discounts apply properly
- [ ] Tax adds correctly
- [ ] Customer satisfaction reflects accuracy

---

## 📈 Assessment Metrics

| Skill | Weight | Measurement |
|-------|--------|-------------|
| Mathematical | 50% | Calculation accuracy |
| Speed | 25% | Time per customer |
| Attention | 25% | Order accuracy |

---

## ✅ Acceptance Criteria

- [ ] All math is 100% accurate
- [ ] Change-making works with real denominations
- [ ] Difficulty scales appropriately
- [ ] Visual feedback is clear
- [ ] Mobile-friendly coin selection
