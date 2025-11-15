from flask import Flask, render_template, request, jsonify, g
import sqlite3
from datetime import datetime
import os

DB_PATH = os.path.join('instance', 'expenses.db')

app = Flask(__name__, static_folder='static', template_folder='templates')


# --- Database helpers ---
def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
        db = g._database = sqlite3.connect(DB_PATH)
        db.row_factory = sqlite3.Row
    return db

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            amount REAL NOT NULL,
            note TEXT,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


# --- Routes ---
@app.route('/')
def index():
    return render_template('index.html')


# Get expenses with optional filters: category, start, end, min_amount, max_amount, q
@app.route('/api/expenses', methods=['GET'])
def api_get_expenses():
    category = request.args.get('category', None)
    start = request.args.get('start', None)
    end = request.args.get('end', None)
    min_amount = request.args.get('min', None)
    max_amount = request.args.get('max', None)
    q = request.args.get('q', None)

    conn = get_db()
    cur = conn.cursor()
    query = "SELECT id, category, amount, note, date FROM expenses WHERE 1=1"
    params = []
    if category and category.lower() != 'all':
        query += " AND category = ?"
        params.append(category)
    if start:
        query += " AND date >= ?"
        params.append(start)
    if end:
        query += " AND date <= ?"
        params.append(end)
    if min_amount:
        try:
            _ = float(min_amount)
            query += " AND amount >= ?"
            params.append(min_amount)
        except:
            pass
    if max_amount:
        try:
            _ = float(max_amount)
            query += " AND amount <= ?"
            params.append(max_amount)
        except:
            pass
    if q:
        query += " AND (category LIKE ? OR note LIKE ?)"
        params.append(f'%{q}%')
        params.append(f'%{q}%')
    query += " ORDER BY date DESC, id DESC"
    cur.execute(query, params)
    rows = cur.fetchall()
    result = [dict(r) for r in rows]
    return jsonify(result)


# Add expense (JSON)
@app.route('/api/add', methods=['POST'])
def api_add_expense():
    data = request.get_json() or {}
    category = (data.get('category') or '').strip()
    amount = data.get('amount', None)
    note = (data.get('note') or '').strip()
    date = data.get('date') or datetime.now().strftime('%Y-%m-%d')
    if not category or amount is None:
        return jsonify({'error': 'category and amount required'}), 400
    try:
        amount = float(amount)
    except:
        return jsonify({'error': 'invalid amount'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute("INSERT INTO expenses (category, amount, note, date) VALUES (?,?,?,?)",
                (category, amount, note, date))
    conn.commit()
    new_id = cur.lastrowid
    cur.execute("SELECT id, category, amount, note, date FROM expenses WHERE id = ?", (new_id,))
    row = cur.fetchone()
    return jsonify(dict(row)), 201


# Edit expense (JSON)
@app.route('/api/edit/<int:exp_id>', methods=['PUT'])
def api_edit_expense(exp_id):
    data = request.get_json() or {}
    category = (data.get('category') or '').strip()
    amount = data.get('amount', None)
    note = (data.get('note') or '').strip()
    date = data.get('date', None)
    if not category or amount is None or not date:
        return jsonify({'error': 'category, amount, date required'}), 400
    try:
        amount = float(amount)
    except:
        return jsonify({'error': 'invalid amount'}), 400
    conn = get_db()
    cur = conn.cursor()
    cur.execute("UPDATE expenses SET category=?, amount=?, note=?, date=? WHERE id=?",
                (category, amount, note, date, exp_id))
    conn.commit()
    cur.execute("SELECT id, category, amount, note, date FROM expenses WHERE id = ?", (exp_id,))
    row = cur.fetchone()
    if not row:
        return jsonify({'error': 'not found'}), 404
    return jsonify(dict(row))


# Delete expense
@app.route('/api/delete/<int:exp_id>', methods=['DELETE'])
def api_delete_expense(exp_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM expenses WHERE id = ?", (exp_id,))
    conn.commit()
    return jsonify({'ok': True})


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
