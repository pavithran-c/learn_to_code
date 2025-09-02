# 🧠 Smart Adaptive Learning Platform

An intelligent coding education platform that uses advanced algorithms like **Item Response Theory (IRT)**, **Bayesian Knowledge Tracing (BKT)**, and **Deep Code Evaluation** to provide personalized learning experiences.

## 🚀 Key Features

### 🔬 Adaptive Learning Engine
- **Item Response Theory (IRT)** for precise skill assessment
- **Bayesian Knowledge Tracing** for concept mastery tracking  
- **Elo Rating System** for dynamic difficulty adjustment
- **Contextual Bandits** for optimal question selection

### 🔍 Deep Code Evaluation
- **Hidden Test Cases** beyond public tests
- **Performance Analysis** (time/space complexity estimation)
- **Code Quality Metrics** (cyclomatic complexity, style analysis)
- **Security Scanning** for unsafe coding practices
- **Real-time Feedback** with actionable hints

### 📊 Intelligent Analytics
- **Skill Progression Tracking** with θ (theta) parameter
- **Concept Mastery Heatmaps** 
- **Learning Velocity Analysis**
- **Personalized Learning Paths**
- **Performance Prediction**

## 🏗️ System Architecture

```
Frontend (React + Vite)          Backend (Flask + Python)          Algorithms
├── Enhanced Compiler            ├── Adaptive Engine               ├── IRT Models
├── Adaptive Dashboard          ├── Deep Evaluator                ├── BKT Tracking  
├── Learning Analytics          ├── Code Execution Engine         ├── Elo Rating
└── Performance Insights        └── RESTful APIs                  └── ML Algorithms
```

## 🔥 Advanced Algorithms Implemented

### 1. **Item Response Theory (IRT)**
```python
# 2PL Model: P(correct|θ) = 1 / (1 + e^(-a(θ-b)))
def irt_probability(self, theta, difficulty, discrimination=1.0):
    return 1.0 / (1.0 + math.exp(-discrimination * (theta - difficulty)))
```

### 2. **Bayesian Knowledge Tracing (BKT)**
```python
# Update mastery probability based on student response
def bkt_update(self, p_L, correct, slip=0.1, guess=0.2, learn=0.15):
    # Bayesian update with learning transition
    return updated_mastery_probability
```

### 3. **Deep Code Analysis**
- **Static Analysis**: AST parsing, complexity metrics
- **Dynamic Profiling**: Runtime performance monitoring  
- **Security Scanning**: Pattern-based vulnerability detection
- **Property-Based Testing**: Automated edge case generation

## 🛠️ Installation & Setup

### Backend Setup
```bash
cd Backend
pip install -r requirements.txt
python app.py
```

### Frontend Setup  
```bash
cd compiler
npm install
npm run dev
```

## 🌟 Core Components

### 1. Enhanced Compiler (`/compiler`)
- **Smart Code Editor** with syntax highlighting
- **AI-Powered Problem Recommendations**  
- **Real-time Performance Analysis**
- **Interactive Test Results**
- **Learning Progress Tracking**

### 2. Adaptive Learning Dashboard (`/adaptive-dashboard`)
- **Skill Level Visualization** (θ parameter)
- **Concept Mastery Breakdown**
- **Performance Trends Analysis**
- **Personalized Learning Paths**

### 3. Deep Evaluation System
- **Multi-layer Test Cases**: Public, Hidden, Edge, Stress
- **Performance Metrics**: Time/Memory usage, Complexity analysis
- **Quality Assessment**: Code style, security, maintainability  
- **Intelligent Feedback**: Contextual hints and improvements

## 📈 API Endpoints

### Adaptive Learning APIs
```
POST /api/adaptive/next_problem     # Get AI-recommended problem
GET  /api/adaptive/user_analytics   # Comprehensive user analytics  
GET  /api/adaptive/concept_mastery  # Detailed concept breakdown
POST /api/adaptive/learning_path    # Generate personalized study plan
```

### Enhanced Code Submission
```
POST /api/submit_code              # Submit with deep evaluation
{
  "problem_id": 1,
  "code": "def solution()...",
  "language": "python", 
  "user_id": "student_123"
}
```

### Response with Rich Analytics
```json
{
  "scores": {
    "correctness": 85,
    "efficiency": 70, 
    "quality": 90,
    "overall": 82
  },
  "hidden_tests": {
    "passed": 6,
    "total": 8,
    "percentage": 75
  },
  "performance": {
    "execution_time_ms": 45,
    "memory_peak_mb": 2.1,
    "time_complexity": "O(n log n)"
  },
  "adaptive_data": {
    "user_theta": 0.24,
    "user_elo": 1650,
    "concept_mastery": {
      "arrays": 0.85,
      "sorting": 0.62
    }
  },
  "feedback": [
    "✅ Good job! Most test cases passed.",
    "⏰ Consider optimizing for better time complexity."
  ],
  "hints": [
    "💡 Try using a more efficient sorting algorithm.",
    "💡 Consider edge cases like empty arrays."
  ]
}
```

## 🎯 Adaptive Learning Flow

```
1. Student starts session
   ↓
2. AI analyzes current skill level (θ, ELO, concept mastery)
   ↓  
3. Intelligent problem selection using IRT + content constraints
   ↓
4. Student solves problem → Deep evaluation
   ↓
5. Update all models (IRT θ, BKT mastery, ELO rating)
   ↓
6. Generate personalized feedback & next recommendation
   ↓
7. Repeat with continuously refined difficulty
```

## 🔮 Advanced Features

### 1. **Smart Problem Recommendation**
- **Content Balancing**: Ensures topic coverage
- **Exposure Control**: Prevents problem overuse
- **Difficulty Progression**: Maintains optimal challenge level

### 2. **Intelligent Performance Analysis**
- **Time Complexity Detection**: Static + dynamic analysis
- **Memory Usage Profiling**: Peak memory tracking
- **Code Quality Scoring**: Style, security, maintainability

### 3. **Personalized Learning Paths**
- **Goal-based Planning**: Interview prep, contest training
- **Weakness-focused**: Target struggling concepts  
- **Milestone Tracking**: Weekly progress goals

## 📚 Algorithm Details

### Item Response Theory (IRT)
- **Purpose**: Measure student ability (θ) and item difficulty (b)
- **Model**: 2-Parameter Logistic (2PL) with discrimination (a)
- **Update**: Maximum Likelihood Estimation (MLE) or Expected A Posteriori (EAP)

### Bayesian Knowledge Tracing (BKT)  
- **Purpose**: Track concept mastery probability
- **Parameters**: Learn, Slip, Guess, Forget rates
- **Update**: Bayesian inference with observation

### Elo Rating System
- **Purpose**: Dynamic skill rating (like chess)
- **Update**: Win/loss against problem difficulty
- **Advantage**: Fast online updates, intuitive interpretation

## 🚀 Getting Started

1. **Clone the repository**
2. **Install backend dependencies**: `pip install -r Backend/requirements.txt`
3. **Install frontend dependencies**: `npm install` in compiler folder
4. **Start backend**: `python Backend/app.py`
5. **Start frontend**: `npm run dev` in compiler folder
6. **Visit**: `http://localhost:5173/compiler` for enhanced compiler
7. **Visit**: `http://localhost:5173/adaptive-dashboard` for learning analytics

## 🎓 Educational Impact

This platform transforms traditional coding education by:

- **Personalizing** learning paths based on individual skill levels
- **Optimizing** practice time through intelligent problem selection  
- **Providing** deeper insights than simple pass/fail grading
- **Motivating** students with clear progress visualization
- **Preparing** students for real-world coding challenges

## 🏆 Competitive Advantages

1. **Research-backed Algorithms**: IRT and BKT used in high-stakes testing
2. **Comprehensive Code Analysis**: Beyond basic test cases
3. **Real-time Adaptation**: Continuous learning model updates
4. **Scalable Architecture**: Cloud-ready microservices design
5. **Rich Analytics**: Detailed performance insights

---

Built with ❤️ using React, Flask, and cutting-edge educational technology algorithms.
