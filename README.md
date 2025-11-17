🌟 SMART EXPENSE TRACKER

A minimal, modern, and beautifully designed expense tracking web app.

<p align="center"> <img src="https://via.placeholder.com/1000x250/1a1a2e/ffffff?text=SMART+EXPENSE+TRACKER" /> </p> <p align="center"> <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/> <img src="https://img.shields.io/badge/SQLite-044a64?style=for-the-badge&logo=sqlite&logoColor=white"/> <img src="https://img.shields.io/badge/Chart.js-F5788D?style=for-the-badge&logo=chartdotjs&logoColor=white"/> <img src="https://img.shields.io/badge/JavaScript-F7E01D?style=for-the-badge&logo=javascript&logoColor=black"/> </p>
🧾 Overview

Smart Expense Tracker helps you record and visualize your daily spending with:

✔️ Light/Dark theme
✔️ Add/Delete expenses
✔️ Category-based filtering
✔️ Responsive modern UI
✔️ Beautiful analytics (Bar, Line, Pie charts)
✔️ Smooth transitions and minimal aesthetics

📂 Project Structure
smart-expense-tracker
│
├── app.py                 # Flask backend
│
├── instance/
│   └── expenses.db        # SQLite database
│
├── static/
│   ├── style.css          # Theme + layout
│   └── script.js          # Frontend logic + charts
│
├── templates/
│   └── index.html         # UI layout
│
└── screenshots/           # Images used in README

🖼️ Screenshots
🌑 Dashboard — Dark Mode

🌕 Dashboard — Light Mode

📊 Charts Overview

➕ Adding Expense

🗑️ Deleting Expense

📱 Mobile View

🎨 Features
🌗 Dual Theme

Light theme: off-white + pastel blue + rose pink

Dark theme: navy + warm pink + lavender

Smooth crossfade transitions

💸 Expense Management

Add category + amount

Automatic date

Instant deletion

Real-time updates

📊 Analytics

Built with Chart.js:

Bar chart → Category totals

Line chart → Daily spending

Pie chart → Category distribution

🔍 Filters

Filter by category

Filter by date

Filter by amount

📱 Fully Responsive

Clean UI across mobile, tablet, and desktop.

⚙️ How to Run Locally
1️⃣ Install Python
python --version

2️⃣ (Optional) Create Virtual Environment
python -m venv venv
venv\Scripts\activate

3️⃣ Install Requirements
pip install -r requirements.txt

4️⃣ Run the App
python app.py


Open:

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

PRs are welcome — feel free to improve UI, charts, or add new features.

⭐ Like this project? Give it a star! ⭐
