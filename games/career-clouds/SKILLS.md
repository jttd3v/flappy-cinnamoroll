# Career Clouds - AI Coding Skills Guide

## 🎯 Required Skills

| Skill | Level | Priority |
|-------|-------|----------|
| Data Aggregation | Advanced | HIGH |
| Statistical Analysis | Intermediate | HIGH |
| Local Storage | Intermediate | HIGH |
| Report Generation | Intermediate | MEDIUM |

---

## 📚 Key Implementations

### Assessment Engine
```javascript
class AssessmentEngine {
  constructor() {
    this.skillWeights = {
      'treasure-chest': { memory: 1.0 },
      'star-counter': { math: 1.0 },
      'pattern-rainbow': { logic: 0.7, creativity: 0.3 },
      'quiz-quest': { knowledge: 0.5, memory: 0.5 },
      'candy-shop': { math: 0.8, attention: 0.2 },
      'story-cloud': { reading: 1.0 },
      'dream-journal': { writing: 0.7, creativity: 0.3 },
      'cloud-kingdom': { spatial: 0.6, logic: 0.4 },
      'puzzle-path': { spatial: 0.5, logic: 0.5 }
    };
  }
  
  aggregateGameData() {
    const allData = {};
    
    for (const gameId of Object.keys(this.skillWeights)) {
      const key = `${gameId}Leaderboard`;
      const data = localStorage.getItem(key);
      if (data) {
        allData[gameId] = JSON.parse(data);
      }
    }
    
    return allData;
  }
  
  calculateSkillScores(gameData) {
    const skills = {};
    const sampleCounts = {};
    
    for (const [gameId, data] of Object.entries(gameData)) {
      const weights = this.skillWeights[gameId];
      if (!weights || !data.scores) continue;
      
      // Calculate average score for this game
      const scores = data.scores.slice(-10);  // Last 10 attempts
      const avgScore = scores.reduce((a, b) => a + b.score, 0) / scores.length;
      const normalizedScore = this.normalizeScore(avgScore, gameId);
      
      // Distribute to skills
      for (const [skill, weight] of Object.entries(weights)) {
        if (!skills[skill]) {
          skills[skill] = 0;
          sampleCounts[skill] = 0;
        }
        skills[skill] += normalizedScore * weight;
        sampleCounts[skill] += weight;
      }
    }
    
    // Average the skills
    for (const skill of Object.keys(skills)) {
      if (sampleCounts[skill] > 0) {
        skills[skill] = Math.round(skills[skill] / sampleCounts[skill]);
      }
    }
    
    return skills;
  }
  
  normalizeScore(score, gameId) {
    // Normalize to 0-100 scale based on game
    const maxScores = {
      'treasure-chest': 100,
      'star-counter': 1000,
      'pattern-rainbow': 100,
      'quiz-quest': 100,
      'candy-shop': 500,
      'story-cloud': 100,
      'dream-journal': 100,
      'cloud-kingdom': 100,
      'puzzle-path': 100
    };
    
    const max = maxScores[gameId] || 100;
    return Math.min(100, Math.round((score / max) * 100));
  }
  
  identifyStrengths(skills) {
    const sorted = Object.entries(skills)
      .sort(([, a], [, b]) => b - a);
    
    return {
      topStrengths: sorted.slice(0, 3).map(([skill]) => skill),
      growthAreas: sorted.slice(-2).map(([skill]) => skill),
      profile: skills
    };
  }
  
  matchCareers(skills) {
    const careers = CareerDatabase.getCareers();
    const matches = [];
    
    for (const career of careers) {
      let matchScore = 0;
      let totalWeight = 0;
      
      for (const [skill, requirement] of Object.entries(career.requiredSkills)) {
        const playerSkill = skills[skill] || 50;
        matchScore += (playerSkill / 100) * requirement;
        totalWeight += requirement;
      }
      
      matches.push({
        career,
        score: totalWeight > 0 ? matchScore / totalWeight : 0
      });
    }
    
    return matches
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }
}
```

### Career Database
```javascript
class CareerDatabase {
  static CAREERS = [
    {
      id: 'artist',
      title: 'Artist / Designer',
      icon: '🎨',
      description: 'Create beautiful things that inspire others!',
      requiredSkills: { creativity: 0.9, spatial: 0.7 },
      ageDescriptions: {
        child: 'You could draw pictures and make cool art!',
        teen: 'Artists design games, movies, and products.',
        adult: 'Creative direction, UX design, illustration.'
      }
    },
    {
      id: 'scientist',
      title: 'Scientist',
      icon: '🔬',
      description: 'Discover how the world works!',
      requiredSkills: { logic: 0.9, math: 0.8, curiosity: 0.7 },
      ageDescriptions: {
        child: 'You could do experiments and discover new things!',
        teen: 'Scientists explore space, medicine, and nature.',
        adult: 'Research, analysis, and innovation.'
      }
    },
    {
      id: 'teacher',
      title: 'Teacher / Educator',
      icon: '📚',
      description: 'Help others learn and grow!',
      requiredSkills: { reading: 0.8, social: 0.8, patience: 0.7 },
      ageDescriptions: {
        child: 'You could teach your friends cool things!',
        teen: 'Teachers shape the future by helping students.',
        adult: 'Education, training, curriculum development.'
      }
    },
    {
      id: 'engineer',
      title: 'Engineer / Builder',
      icon: '🔧',
      description: 'Build amazing things that help people!',
      requiredSkills: { math: 0.9, logic: 0.9, spatial: 0.7 },
      ageDescriptions: {
        child: 'You could build robots and cool machines!',
        teen: 'Engineers create technology, buildings, and solutions.',
        adult: 'Software, mechanical, civil, or electrical engineering.'
      }
    },
    {
      id: 'helper',
      title: 'Doctor / Helper',
      icon: '🏥',
      description: 'Take care of people and make them feel better!',
      requiredSkills: { caring: 0.9, memory: 0.7, attention: 0.8 },
      ageDescriptions: {
        child: 'You could help people feel better when they\'re sick!',
        teen: 'Doctors, nurses, and therapists save lives.',
        adult: 'Healthcare, counseling, social work.'
      }
    },
    {
      id: 'writer',
      title: 'Writer / Storyteller',
      icon: '✍️',
      description: 'Tell amazing stories that people love!',
      requiredSkills: { writing: 0.9, creativity: 0.8, reading: 0.7 },
      ageDescriptions: {
        child: 'You could write your own books and stories!',
        teen: 'Writers create books, games, and movies.',
        adult: 'Journalism, content creation, fiction/non-fiction.'
      }
    }
  ];
  
  static getCareers() {
    return this.CAREERS;
  }
  
  static getCareerById(id) {
    return this.CAREERS.find(c => c.id === id);
  }
  
  static getDescriptionForAge(career, age) {
    if (age <= 10) return career.ageDescriptions.child;
    if (age <= 17) return career.ageDescriptions.teen;
    return career.ageDescriptions.adult;
  }
}
```

### Report Generator
```javascript
class ReportGenerator {
  constructor(assessment) {
    this.assessment = assessment;
  }
  
  generateSummary() {
    const { topStrengths, profile, careers } = this.assessment;
    
    return {
      title: 'Your Career Cloud Profile',
      strengths: topStrengths.map(s => ({
        name: this.formatSkillName(s),
        score: profile[s],
        icon: this.getSkillIcon(s)
      })),
      topCareers: careers.slice(0, 3).map(c => ({
        title: c.career.title,
        icon: c.career.icon,
        match: Math.round(c.score * 100) + '%'
      })),
      encouragement: this.getEncouragement(topStrengths[0])
    };
  }
  
  formatSkillName(skill) {
    const names = {
      math: 'Mathematics',
      reading: 'Reading',
      writing: 'Writing',
      creativity: 'Creativity',
      logic: 'Logic & Reasoning',
      memory: 'Memory',
      spatial: 'Spatial Skills',
      social: 'Social Skills'
    };
    return names[skill] || skill;
  }
  
  getSkillIcon(skill) {
    const icons = {
      math: '🔢',
      reading: '📖',
      writing: '✍️',
      creativity: '🎨',
      logic: '🧩',
      memory: '🧠',
      spatial: '🗺️',
      social: '👥'
    };
    return icons[skill] || '⭐';
  }
  
  getEncouragement(topSkill) {
    const messages = {
      math: 'You have an amazing mind for numbers!',
      creativity: 'Your imagination is incredible!',
      logic: 'You think things through so well!',
      reading: 'You understand stories beautifully!',
      writing: 'Your words have power!',
      memory: 'You remember everything!',
      spatial: 'You see the world in amazing ways!'
    };
    return messages[topSkill] || 'You have so many wonderful strengths!';
  }
  
  generateShareableHTML() {
    const summary = this.generateSummary();
    
    return `
      <div class="career-report">
        <h1>🌈 ${summary.title}</h1>
        <div class="strengths">
          <h2>Your Top Strengths</h2>
          ${summary.strengths.map(s => `
            <div class="strength">
              ${s.icon} ${s.name}: ${s.score}%
            </div>
          `).join('')}
        </div>
        <div class="careers">
          <h2>Career Matches</h2>
          ${summary.topCareers.map(c => `
            <div class="career">
              ${c.icon} ${c.title} (${c.match} match)
            </div>
          `).join('')}
        </div>
        <p class="encouragement">${summary.encouragement}</p>
      </div>
    `;
  }
}
```

---

## 📦 File Structure

```
games/career-clouds/
├── index.html
├── CareerCloudsGame.js
├── career-clouds.config.js
├── components/
│   ├── AssessmentEngine.js
│   ├── CareerDatabase.js
│   ├── ProfileManager.js
│   ├── ReportGenerator.js
│   └── CloudMap.js
├── data/
│   ├── careers.js
│   └── skill-mappings.js
├── PRD.md
├── SKILLS.md
└── README.md
```

---

## ⚠️ Common Pitfalls

1. **Insufficient data** - Need minimum samples before showing results
2. **Negative framing** - Never show "weaknesses", only "growth areas"
3. **Age-inappropriate** - Match language to player age
4. **Privacy** - Keep all data local, no external sharing without consent
5. **Over-promising** - Frame as "exploration" not "prediction"
