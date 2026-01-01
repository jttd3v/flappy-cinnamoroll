# Candy Shop - AI Coding Skills Guide

## 🎯 Required Skills

| Skill | Level | Priority |
|-------|-------|----------|
| Currency Formatting | Basic | HIGH |
| Decimal Math | Intermediate | HIGH |
| Drag and Drop | Intermediate | MEDIUM |
| State Management | Intermediate | HIGH |

---

## 📚 Key Implementations

### Currency System
```javascript
class CurrencySystem {
  static DENOMINATIONS = [
    { value: 0.01, name: 'Penny', icon: '🪙' },
    { value: 0.05, name: 'Nickel', icon: '🪙' },
    { value: 0.10, name: 'Dime', icon: '🪙' },
    { value: 0.25, name: 'Quarter', icon: '🪙' },
    { value: 1.00, name: 'Dollar', icon: '💵' },
    { value: 5.00, name: 'Five', icon: '💵' },
    { value: 10.00, name: 'Ten', icon: '💵' },
    { value: 20.00, name: 'Twenty', icon: '💵' }
  ];
  
  static formatCurrency(amount) {
    return '$' + amount.toFixed(2);
  }
  
  static calculateChange(paid, total) {
    // Use integers to avoid floating point errors
    const changeInCents = Math.round((paid - total) * 100);
    return changeInCents / 100;
  }
  
  static getOptimalChange(amount) {
    let remaining = Math.round(amount * 100);
    const change = [];
    
    const denomsInCents = [2000, 1000, 500, 100, 25, 10, 5, 1];
    
    for (const denom of denomsInCents) {
      while (remaining >= denom) {
        remaining -= denom;
        change.push(denom / 100);
      }
    }
    
    return change;
  }
}
```

### Order Processing
```javascript
class OrderProcessor {
  constructor(taxRate = 0) {
    this.taxRate = taxRate;
  }
  
  calculateSubtotal(items) {
    return items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
  }
  
  applyDiscount(subtotal, discount) {
    if (!discount) return subtotal;
    
    if (discount.type === 'percent') {
      return subtotal * (1 - discount.value / 100);
    }
    if (discount.type === 'fixed') {
      return Math.max(0, subtotal - discount.value);
    }
    return subtotal;
  }
  
  applyTax(amount) {
    return amount * (1 + this.taxRate);
  }
  
  calculateTotal(items, discount = null) {
    const subtotal = this.calculateSubtotal(items);
    const discounted = this.applyDiscount(subtotal, discount);
    const withTax = this.applyTax(discounted);
    return Math.round(withTax * 100) / 100;
  }
}
```

### Customer Generator
```javascript
class CustomerGenerator {
  static CUSTOMERS = [
    { name: 'Mocha', icon: '🐶', patience: 'high' },
    { name: 'Milk', icon: '🐱', patience: 'medium' },
    { name: 'Chiffon', icon: '🐰', patience: 'high' },
    { name: 'Espresso', icon: '🐕', patience: 'low' }
  ];
  
  generate(difficulty, availableItems) {
    const customer = MathUtils.randomPick(this.CUSTOMERS);
    const itemCount = Math.min(difficulty, 4);
    
    const items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = MathUtils.randomPick(availableItems);
      items.push({
        itemId: item.id,
        quantity: MathUtils.randomInt(1, 3)
      });
    }
    
    // Calculate what they'll pay (always rounds up to make change needed)
    const total = this.calculateOrderTotal(items, availableItems);
    const payment = this.generatePayment(total, difficulty);
    
    return {
      ...customer,
      items,
      payment,
      discount: difficulty >= 5 ? this.generateDiscount() : null
    };
  }
  
  generatePayment(total, difficulty) {
    // For easy: exact change sometimes
    if (difficulty <= 2 && Math.random() > 0.5) {
      return total;
    }
    // Otherwise, round up to next $5 or $10
    const roundTo = difficulty <= 4 ? 5 : 10;
    return Math.ceil(total / roundTo) * roundTo;
  }
  
  generateDiscount() {
    const discounts = [10, 15, 20, 25];
    return {
      type: 'percent',
      value: MathUtils.randomPick(discounts)
    };
  }
}
```

---

## 📦 File Structure

```
games/candy-shop/
├── index.html
├── CandyShopGame.js
├── candy-shop.config.js
├── components/
│   ├── CurrencySystem.js
│   ├── OrderProcessor.js
│   ├── CustomerGenerator.js
│   └── CashRegister.js
├── data/
│   └── candyItems.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## ⚠️ Common Pitfalls

1. **Floating point errors** - Always use cents internally
2. **Invalid change combos** - Validate coin selections
3. **Negative change** - Handle exact payment
4. **Rounding errors** - Round at the end only
