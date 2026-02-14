# 🌟 SMART EXPENSE TRACKER

A minimal, modern, and beautifully designed expense tracking web app.

<p align="center">
  <img src="screenshots/banner.png" width="100%"/>
</p>

---

## 🧾 Overview

Smart Expense Tracker helps you record and visualize your daily spending with:

✔️ Light/Dark theme  
✔️ Add/Delete expenses  
✔️ Category-based filtering  
✔️ Responsive modern UI  
✔️ Beautiful analytics (Bar, Line, Pie charts)  
✔️ Smooth transitions and minimal aesthetics  

---

## 📂 Project Structure
smart-expense-tracker
│
├── app.py # Flask backend
│
├── instance/
│ └── expenses.db # SQLite database
│
├── static/
│ ├── style.css # Theme + layout
│ └── script.js # Frontend logic + charts
│
├── templates/
│ └── index.html # UI layout
│
└── screenshots/ # Images used in README


---

## 🖼️ Screenshots

### 🌑 Dashboard — Dark Mode
![Dark Mode](screenshots/dark.png)

### 🌕 Dashboard — Light Mode
![Light Mode](screenshots/light.png)

### 📊 Charts Overview
![Charts](screenshots/charts.png)

### ➕ Adding Expense
![Add](screenshots/add.png)

### 🗑️ Deleting Expense
![Delete](screenshots/delete.png)

### 📱 Mobile View
![Mobile](screenshots/mobile.png)

---


## 🚀 Deployment note (Railway / cloud hosts)

If your host uses a read-only app directory, configure the database path to a writable location:

```bash
DB_PATH=/tmp/expenses.db
```

Set this as an environment variable in Railway (`Variables` tab), then redeploy.

## 🎨 Features

### 🌗 Dual Theme
- Light: Off-white, pastel blue, rose pink  
- Dark: Navy blue, warm pink, lavender  
- Smooth crossfade transitions  

### 💸 Expense Management
- Add category + amount  
- Auto date  
- Delete instantly  
- Real-time UI updates  

### 📊 Analytics
- **Bar chart** → Category totals  
- **Line chart** → Daily expenses  
- **Pie chart** → Category distribution  

### 🔍 Filters
- By date  
- By category  
- By amount  

### 📱 Fully Responsive
Works beautifully on mobile, tablet & desktop.

---

## ⚙️ How to Run Locally

### 1️⃣ Install Python
```bash
python --version
```

### 2️⃣ Create Virtual Environment (Optional but recommended)
```bash
python -m venv venv
venv\Scripts\activate
```

### 3️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 4️⃣ Run the App
```bash
python app.py
```

Open in browser:

👉 http://127.0.0.1:5000/

🛠️ Tech Stack
Frontend

HTML

CSS

JavaScript

Chart.js

Backend

Python

Flask

SQLite

🤝 Contributions

PRs are welcome — improve UI, charts, or add new features.

