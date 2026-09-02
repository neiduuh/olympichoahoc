
from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify, abort
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3, os, json, random, time
from datetime import datetime

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-secret-key")
DB = os.path.join(os.path.dirname(__file__), "olympic.db")

def db():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    con = db()
    con.executescript("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'player',
        approved INTEGER NOT NULL DEFAULT 0,
        full_name TEXT,
        dob TEXT,
        gender TEXT,
        class_name TEXT,
        phone TEXT,
        grade_group TEXT,
        created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rounds(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        grade_group TEXT,
        opens_at TEXT,
        closes_at TEXT,
        active INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS questions(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        round_id INTEGER NOT NULL,
        game_type TEXT NOT NULL,
        qtype TEXT NOT NULL,
        content TEXT NOT NULL,
        options_json TEXT,
        correct_json TEXT NOT NULL,
        points INTEGER NOT NULL DEFAULT 10,
        explanation TEXT,
        FOREIGN KEY(round_id) REFERENCES rounds(id)
    );
    CREATE TABLE IF NOT EXISTS attempts(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        round_id INTEGER NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        elapsed_seconds INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        finished_at TEXT,
        violations INTEGER NOT NULL DEFAULT 0,
        detail_json TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(round_id) REFERENCES rounds(id)
    );
    """)
    # Migration: game thể thao được chọn cố định theo từng vòng thi.
    cols=[row[1] for row in con.execute("PRAGMA table_info(rounds)").fetchall()]
    if "selected_sport" not in cols:
        con.execute("ALTER TABLE rounds ADD COLUMN selected_sport TEXT")
    for rr in con.execute("SELECT id FROM rounds WHERE selected_sport IS NULL OR selected_sport='' ").fetchall():
        con.execute("UPDATE rounds SET selected_sport=? WHERE id=?", (random.choice(["soccer","basketball"]), rr[0]))

    # Điểm được cộng ở server để học sinh không thể tự sửa tổng điểm trên trình duyệt.
    attempt_cols=[row[1] for row in con.execute("PRAGMA table_info(attempts)").fetchall()]
    if "server_score" not in attempt_cols:
        con.execute("ALTER TABLE attempts ADD COLUMN server_score INTEGER NOT NULL DEFAULT 0")
    con.execute("""
    CREATE TABLE IF NOT EXISTS attempt_answers(
        attempt_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        is_correct INTEGER NOT NULL DEFAULT 0,
        answered_at TEXT NOT NULL,
        PRIMARY KEY(attempt_id, question_id),
        FOREIGN KEY(attempt_id) REFERENCES attempts(id),
        FOREIGN KEY(question_id) REFERENCES questions(id)
    )
    """)

    # default admin
    admin = con.execute("SELECT id FROM users WHERE username='admin'").fetchone()
    if not admin:
        con.execute("""INSERT INTO users(username,password_hash,role,approved,full_name,created_at)
                    VALUES(?,?,?,?,?,?)""",
                    ("admin", generate_password_hash("Admin@123"), "admin", 1, "Quản trị viên", datetime.now().isoformat(timespec="seconds")))
    con.commit()
    con.close()

init_db()

def current_user():
    if "uid" not in session: return None
    con=db(); u=con.execute("SELECT * FROM users WHERE id=?", (session["uid"],)).fetchone(); con.close()
    return u

def login_required():
    u=current_user()
    if not u: abort(401)
    return u

def admin_required():
    u=login_required()
    if u["role"]!="admin": abort(403)
    return u

@app.context_processor
def inject_user():
    return {"me": current_user()}

@app.route("/")
def index():
    con=db()
    rounds=con.execute("SELECT * FROM rounds WHERE active=1 ORDER BY id DESC").fetchall()
    con.close()
    return render_template("index.html", rounds=rounds)

@app.route("/register", methods=["GET","POST"])
def register():
    if request.method=="POST":
        username=request.form["username"].strip()
        password=request.form["password"]
        confirm=request.form["confirm"]
        if password != confirm:
            flash("Mật khẩu nhập lại không khớp.", "danger"); return redirect(url_for("register"))
        if len(password)<6:
            flash("Mật khẩu cần tối thiểu 6 ký tự.", "danger"); return redirect(url_for("register"))
        con=db()
        try:
            con.execute("INSERT INTO users(username,password_hash,created_at) VALUES(?,?,?)",
                        (username, generate_password_hash(password), datetime.now().isoformat(timespec="seconds")))
            con.commit()
        except sqlite3.IntegrityError:
            con.close(); flash("Tên tài khoản đã tồn tại.", "danger"); return redirect(url_for("register"))
        con.close()
        flash("Đăng ký thành công. Hãy đăng nhập để hoàn thiện hồ sơ.", "success")
        return redirect(url_for("login"))
    return render_template("register.html")

@app.route("/login", methods=["GET","POST"])
def login():
    if request.method=="POST":
        con=db(); u=con.execute("SELECT * FROM users WHERE username=?", (request.form["username"].strip(),)).fetchone(); con.close()
        if not u or not check_password_hash(u["password_hash"], request.form["password"]):
            flash("Sai tài khoản hoặc mật khẩu.", "danger"); return redirect(url_for("login"))
        session.clear(); session["uid"]=u["id"]
        if u["role"]=="admin": return redirect(url_for("admin_dashboard"))
        if not u["full_name"]: return redirect(url_for("profile"))
        return redirect(url_for("dashboard"))
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear(); return redirect(url_for("index"))

@app.route("/profile", methods=["GET","POST"])
def profile():
    u=login_required()
    if request.method=="POST":
        con=db()
        con.execute("""UPDATE users SET full_name=?,dob=?,gender=?,class_name=?,phone=? WHERE id=?""",
                    (request.form["full_name"],request.form["dob"],request.form["gender"],
                     request.form["class_name"],request.form["phone"],u["id"]))
        con.commit(); con.close()
        flash("Đã gửi hồ sơ. Admin cần duyệt và phân khối trước khi bạn dự thi.", "success")
        return redirect(url_for("dashboard"))
    return render_template("profile.html", u=u)

@app.route("/dashboard")
def dashboard():
    u=login_required()
    if u["role"]=="admin": return redirect(url_for("admin_dashboard"))
    con=db()
    rounds=[]
    if u["approved"] and u["grade_group"]:
        rounds=con.execute("""SELECT * FROM rounds WHERE active=1 AND (grade_group=? OR grade_group='ALL')
                              ORDER BY id DESC""",(u["grade_group"],)).fetchall()
    stats=con.execute("""SELECT a.*,r.title FROM attempts a JOIN rounds r ON r.id=a.round_id
                         WHERE a.user_id=? AND a.finished_at IS NOT NULL ORDER BY a.id DESC""",(u["id"],)).fetchall()
    con.close()
    return render_template("dashboard.html", u=u, rounds=rounds, stats=stats)

@app.route("/leaderboard")
def leaderboard():
    round_id=request.args.get("round_id", type=int)
    con=db()
    rounds=con.execute("SELECT * FROM rounds ORDER BY id DESC").fetchall()
    rows=[]
    if round_id:
        rows=con.execute("""
        SELECT u.full_name,u.class_name, COUNT(a.id) attempt_count,
               MAX(a.score) best_score,
               MIN(CASE WHEN a.score=(SELECT MAX(a2.score) FROM attempts a2 WHERE a2.user_id=a.user_id AND a2.round_id=a.round_id AND a2.finished_at IS NOT NULL)
                        THEN a.elapsed_seconds END) best_time,
               MAX(a.finished_at) last_finished
        FROM attempts a JOIN users u ON u.id=a.user_id
        WHERE a.round_id=? AND a.finished_at IS NOT NULL
        GROUP BY a.user_id
        ORDER BY best_score DESC, best_time ASC, last_finished ASC
        """,(round_id,)).fetchall()
    con.close()
    return render_template("leaderboard.html", rounds=rounds, rows=rows, selected=round_id)

@app.route("/play/<int:round_id>")
def play(round_id):
    u=login_required()
    if u["role"]!="player" or not u["approved"]: abort(403)
    con=db()
    r=con.execute("SELECT * FROM rounds WHERE id=? AND active=1",(round_id,)).fetchone()
    if not r: con.close(); abort(404)
    if r["grade_group"] not in ("ALL",u["grade_group"]): con.close(); abort(403)
    qrows=con.execute("SELECT * FROM questions WHERE round_id=?",(round_id,)).fetchall()
    grouped={"bee":[],"soccer":[],"basketball":[],"racing":[]}
    for q in qrows:
        d=dict(q); d["options"]=json.loads(d["options_json"] or "[]")
        d.pop("correct_json",None)  # never send answer to browser
        grouped.get(d["game_type"],[]).append(d)

    # Mỗi VÒNG THI bốc ngẫu nhiên đúng 1 game thể thao và lưu cố định.
    # Mọi thí sinh và mọi lần thi lại trong cùng vòng đều dùng cùng loại game thể thao.
    selected_sport=r["selected_sport"] if r["selected_sport"] in ("soccer","basketball") else None
    if not selected_sport:
        selected_sport=random.choice(["soccer","basketball"])
        con.execute("UPDATE rounds SET selected_sport=? WHERE id=?", (selected_sport, round_id))
        con.commit()

    # Chọn số câu đúng theo luật cuộc thi từ ngân hàng câu hỏi admin đã nhập.
    random.shuffle(grouped["bee"])
    grouped["bee"]=grouped["bee"][:min(10, len(grouped["bee"]))]
    if selected_sport:
        random.shuffle(grouped[selected_sport])
        grouped[selected_sport]=grouped[selected_sport][:min(10, len(grouped[selected_sport]))]
    random.shuffle(grouped["racing"])
    grouped["racing"]=grouped["racing"][:min(2, len(grouped["racing"]))]

    # Không gửi game thể thao không được chọn xuống trình duyệt.
    for g in ("soccer","basketball"):
        if g != selected_sport:
            grouped[g]=[]
    con.close()
    started=datetime.now().isoformat(timespec="seconds")
    con=db()
    cur=con.execute("INSERT INTO attempts(user_id,round_id,started_at) VALUES(?,?,?)",(u["id"],round_id,started))
    aid=cur.lastrowid; con.commit(); con.close()
    return render_template("play.html", r=r, grouped=grouped, attempt_id=aid)

@app.route("/api/answer", methods=["POST"])
def api_answer():
    u=login_required()
    data=request.get_json(force=True)
    qid=int(data["question_id"]); aid=int(data["attempt_id"])
    con=db()
    a=con.execute("SELECT * FROM attempts WHERE id=? AND user_id=?",(aid,u["id"])).fetchone()
    q=con.execute("SELECT * FROM questions WHERE id=?",(qid,)).fetchone()
    if not a or not q or a["finished_at"] or q["round_id"] != a["round_id"]:
        con.close(); abort(403)

    # Một câu chỉ được ghi điểm một lần. Nếu trình duyệt gửi lại request do mạng chập chờn,
    # trả về kết quả đã ghi thay vì cộng điểm lần nữa.
    old=con.execute("SELECT score,is_correct FROM attempt_answers WHERE attempt_id=? AND question_id=?",(aid,qid)).fetchone()
    if old:
        total=con.execute("SELECT server_score FROM attempts WHERE id=?",(aid,)).fetchone()["server_score"]
        con.close()
        return jsonify({"ok":bool(old["is_correct"]),"score":old["score"],"total_score":total,"duplicate":True,"explanation":q["explanation"] or ""})

    correct=json.loads(q["correct_json"])
    ans=data.get("answer")
    score=0; ok=False
    if q["qtype"]=="short":
        acceptable=[str(x).strip().lower() for x in (correct if isinstance(correct,list) else [correct])]
        ok=str(ans).strip().lower() in acceptable
        score=q["points"] if ok else 0
    elif q["qtype"]=="mcq":
        ok=str(ans)==str(correct)
        score=q["points"] if ok else 0
    elif q["qtype"]=="tf4":
        truth=[bool(x) for x in correct]
        got=[bool(x) for x in (ans or [])]
        n=sum(1 for i,x in enumerate(truth) if i<len(got) and got[i]==x)
        score={0:0,1:5,2:15,3:25,4:50}[n]
        ok=(n==4)

    now=datetime.now().isoformat(timespec="seconds")
    con.execute("INSERT INTO attempt_answers(attempt_id,question_id,score,is_correct,answered_at) VALUES(?,?,?,?,?)",(aid,qid,score,1 if ok else 0,now))
    con.execute("UPDATE attempts SET server_score=server_score+? WHERE id=?",(score,aid))
    total=con.execute("SELECT server_score FROM attempts WHERE id=?",(aid,)).fetchone()["server_score"]
    con.commit(); con.close()
    return jsonify({"ok":ok,"score":score,"total_score":total,"duplicate":False,"explanation":q["explanation"] or ""})

@app.route("/api/finish", methods=["POST"])
def api_finish():
    u=login_required()
    data=request.get_json(force=True)
    aid=int(data["attempt_id"])
    con=db()
    a=con.execute("SELECT * FROM attempts WHERE id=? AND user_id=?",(aid,u["id"])).fetchone()
    if not a:
        con.close(); abort(403)
    total=int(a["server_score"] or 0)
    # Thời gian và số lần rời tab lấy từ server, không tin số liệu tổng do trình duyệt gửi lên.
    try:
        elapsed=max(0,int((datetime.now()-datetime.fromisoformat(a["started_at"])).total_seconds()))
    except Exception:
        elapsed=max(0,int(data.get("elapsed",0)))
    violations=int(a["violations"] or 0)
    con.execute("""UPDATE attempts SET score=?,elapsed_seconds=?,violations=?,finished_at=?,detail_json=?
                   WHERE id=? AND user_id=?""",
                (total,elapsed,violations,datetime.now().isoformat(timespec="seconds"),
                 json.dumps(data.get("detail",{}),ensure_ascii=False),aid,u["id"]))
    con.commit(); con.close()
    return jsonify({"redirect":url_for("leaderboard",round_id=data["round_id"]),"score":total,"elapsed":elapsed,"violations":violations})

@app.route("/api/violation", methods=["POST"])
def api_violation():
    u=login_required()
    data=request.get_json(force=True); aid=int(data["attempt_id"])
    con=db(); con.execute("UPDATE attempts SET violations=violations+1 WHERE id=? AND user_id=? AND finished_at IS NULL",(aid,u["id"])); con.commit(); con.close()
    return jsonify({"ok":True})

# ---------------- Admin ----------------
@app.route("/admin")
def admin_dashboard():
    admin_required(); con=db()
    pending=con.execute("SELECT * FROM users WHERE role='player' ORDER BY approved ASC,id DESC").fetchall()
    rounds=con.execute("""SELECT r.*,(SELECT COUNT(*) FROM questions q WHERE q.round_id=r.id) qcount
                          FROM rounds r ORDER BY r.id DESC""").fetchall()
    con.close()
    return render_template("admin.html", pending=pending, rounds=rounds)

@app.route("/admin/user/<int:uid>", methods=["POST"])
def admin_user(uid):
    admin_required()
    approved=1 if request.form.get("approved")=="1" else 0
    grade=request.form.get("grade_group","")
    con=db(); con.execute("UPDATE users SET approved=?,grade_group=? WHERE id=?",(approved,grade,uid)); con.commit(); con.close()
    flash("Đã cập nhật tài khoản.", "success")
    return redirect(url_for("admin_dashboard"))

@app.route("/admin/round/new", methods=["POST"])
def admin_round_new():
    admin_required()
    con=db()
    selected_sport=random.choice(["soccer","basketball"])
    con.execute("""INSERT INTO rounds(title,description,grade_group,opens_at,closes_at,active,selected_sport)
                   VALUES(?,?,?,?,?,1,?)""",
                (request.form["title"],request.form.get("description",""),
                 request.form.get("grade_group","ALL"),
                 request.form.get("opens_at",""),request.form.get("closes_at",""), selected_sport))
    con.commit(); con.close()
    flash("Đã tạo vòng thi. Hệ thống đã bốc game thể thao: " + ("Sút bóng" if selected_sport=="soccer" else "Ném bóng vào rổ") + ".", "success")
    return redirect(url_for("admin_dashboard"))

@app.route("/admin/round/<int:rid>/toggle", methods=["POST"])
def admin_round_toggle(rid):
    admin_required(); con=db()
    con.execute("UPDATE rounds SET active=CASE active WHEN 1 THEN 0 ELSE 1 END WHERE id=?",(rid,))
    con.commit(); con.close()
    return redirect(url_for("admin_dashboard"))

@app.route("/admin/questions/<int:rid>", methods=["GET","POST"])
def admin_questions(rid):
    admin_required(); con=db()
    r=con.execute("SELECT * FROM rounds WHERE id=?",(rid,)).fetchone()
    if not r: con.close(); abort(404)
    if request.method=="POST":
        game=request.form["game_type"]
        allowed_games={"bee","racing",r["selected_sport"]}
        if game not in allowed_games:
            con.close(); abort(400)
        # Dạng câu hỏi được khóa theo luật từng mini game, không tin giá trị sửa tay từ trình duyệt.
        qtype={"bee":"short","soccer":"mcq","basketball":"mcq","racing":"tf4"}[game]
        content=request.form["content"].strip()
        if not content:
            con.close(); abort(400)
        options=[]
        correct=None
        points=int(request.form.get("points",10))
        if qtype=="mcq":
            options=[request.form.get(f"opt{i}","").strip() for i in range(4)]
            correct=request.form["correct_mcq"]
            if game in ("soccer","basketball"):
                points=10
        elif qtype=="short":
            # separate acceptable answers by |
            correct=[x.strip() for x in request.form["correct_short"].split("|") if x.strip()]
        elif qtype=="tf4":
            options=[request.form.get(f"tftext{i}","").strip() for i in range(4)]
            correct=[request.form.get(f"tf{i}")=="true" for i in range(4)]
            points=50
        con.execute("""INSERT INTO questions(round_id,game_type,qtype,content,options_json,correct_json,points,explanation)
                       VALUES(?,?,?,?,?,?,?,?)""",
                    (rid,game,qtype,content,json.dumps(options,ensure_ascii=False),
                     json.dumps(correct,ensure_ascii=False),points,request.form.get("explanation","")))
        con.commit()
        flash("Đã thêm câu hỏi.", "success")
    qs=con.execute("SELECT * FROM questions WHERE round_id=? ORDER BY game_type,id DESC",(rid,)).fetchall()
    con.close()
    return render_template("questions.html", r=r, qs=qs)

@app.route("/admin/question/<int:qid>/delete", methods=["POST"])
def admin_q_delete(qid):
    admin_required(); con=db()
    q=con.execute("SELECT round_id FROM questions WHERE id=?",(qid,)).fetchone()
    if q:
        con.execute("DELETE FROM questions WHERE id=?",(qid,)); con.commit()
        rid=q["round_id"]
    else: rid=0
    con.close()
    return redirect(url_for("admin_questions",rid=rid))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT",5000)))
