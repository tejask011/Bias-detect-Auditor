# 🔍 Bias Detect Auditor

An AI-powered web application to **detect, analyze, and mitigate bias** in datasets and machine learning models.

---

## 🚀 Overview

Bias Detect Auditor helps identify unfair patterns in data and model predictions. It provides:

* 📊 Bias detection across features
* ⚖️ Fairness metrics (DP, EO, DI)
* 🤖 Multi-model comparison
* 🛠 Bias mitigation insights
* 🔐 Privacy-aware analysis

---

## 🧠 Problem Statement

Machine learning models often inherit bias from datasets, leading to unfair decisions based on:

* Gender
* Age
* Location
* Other proxy attributes

This project helps **identify and reduce such bias**.

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* Node.js (Express)
* Python (Flask)

### AI / ML

* Pandas
* Scikit-learn
* Custom Bias Detection Logic

---

## 📂 Project Structure

```
Bias-detect-Auditor/
│
├── ai-service/              # Python ML + bias detection
│   ├── app.py
│   ├── bias.py
│   └── venv/
│
├── backend/                 # Node.js server
│   ├── app.js
│   ├── uploads/             # Uploaded CSV files
│   └── package.json
│
├── frontend/                # React UI
│   ├── src/
│   │   ├── component/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── NewDashboard.jsx
│   │   │   └── Upload.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

---

## ⚙️ How It Works

### 1️⃣ Upload Dataset

User uploads a CSV file through the UI.

### 2️⃣ Backend Processing

* File stored in `uploads/`
* Node.js sends file path to Python service

### 3️⃣ ML Model Execution

* Logistic Regression
* Random Forest
* Mitigated Model
* Retrained Model

### 4️⃣ Bias Detection

For each feature:

```
Bias Score = max(group positive rate) - min(group positive rate)
```

---

### 5️⃣ Fairness Metrics

* **Demographic Parity (DP)**
* **Equal Opportunity (EO)**
* **Disparate Impact (DI)**

---

### 6️⃣ Visualization

* Feature bias insights
* Dataset distribution
* Model comparison
* Mitigation results

---

## 📊 Features

### 🔍 Bias Detection

* Detects bias in categorical features
* Highlights most biased feature

### ⚖️ Fairness Metrics

* Demographic Parity Gap
* Equal Opportunity Gap
* Disparate Impact

### 🤖 Model Comparison

* Logistic Regression
* Random Forest
* Mitigated Model
* Retrained Model

### 🛠 Mitigation Insights

* Shows before vs after bias
* Identifies limited vs effective mitigation

### 🔐 Privacy Insights

* Detects proxy bias
* Flags sensitive attributes

---

## 📥 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/bias-detect-auditor.git
cd bias-detect-auditor
```

---

### 2️⃣ Setup Python AI Service

```bash
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install pandas scikit-learn flask
python app.py
```

---

### 3️⃣ Setup Backend

```bash
cd backend
npm install
node app.js
```

---

### 4️⃣ Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

---





---

## 📁 Dataset Format

Example CSV:

| age_group | city   | gender | restaurant_rating | visited | target |
| --------- | ------ | ------ | ----------------- | ------- | ------ |
| Adult     | Pune   | Male   | 4.5               | Yes     | 1      |
| Young     | Mumbai | Female | 3.5               | No      | 0      |

---

## 📈 Example Output

* Bias Score: 0.80 (High)
* Most Biased Feature: Gender
* Mitigation Impact: Limited

---

## ⚠️ Limitations

* Bias cannot be fully eliminated
* Proxy features can reintroduce bias
* Results depend on dataset quality

---

## 🔮 Future Improvements

* Causal bias detection
* SHAP explainability
* Automated bias mitigation
* Real-time API integration

