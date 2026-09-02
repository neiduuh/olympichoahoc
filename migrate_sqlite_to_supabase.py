"""Chuyển một file olympic.db cũ sang Supabase PostgreSQL.

Cách dùng:
  export DATABASE_URL='postgresql://...'
  python migrate_sqlite_to_supabase.py /duong/dan/olympic.db

Khuyến nghị dùng với database Supabase mới/trống.
"""
import os, sys, sqlite3
from werkzeug.security import generate_password_hash
from database import db, init_db, IS_POSTGRES

TABLES = [
    ("users", ["id","username","password_hash","role","approved","full_name","dob","gender","class_name","phone","grade_group","created_at"]),
    ("rounds", ["id","title","description","grade_group","opens_at","closes_at","active","selected_sport"]),
    ("questions", ["id","round_id","game_type","qtype","content","options_json","correct_json","points","explanation"]),
    ("attempts", ["id","user_id","round_id","score","elapsed_seconds","started_at","finished_at","violations","detail_json","server_score"]),
    ("attempt_answers", ["attempt_id","question_id","score","is_correct","answered_at"]),
]

def existing_columns(con, table):
    return {r[1] for r in con.execute(f"PRAGMA table_info({table})").fetchall()}

def main():
    if not IS_POSTGRES:
        raise SystemExit("Cần đặt DATABASE_URL của Supabase trước khi chạy script.")
    path = sys.argv[1] if len(sys.argv)>1 else "olympic.db"
    if not os.path.exists(path):
        raise SystemExit(f"Không tìm thấy: {path}")
    init_db(generate_password_hash("temporary-not-used"))
    src=sqlite3.connect(path); src.row_factory=sqlite3.Row
    dst=db()
    for table, wanted in TABLES:
        try:
            cols=existing_columns(src,table)
        except Exception:
            continue
        if not cols:
            continue
        use=[c for c in wanted if c in cols]
        rows=src.execute(f"SELECT {','.join(use)} FROM {table}").fetchall()
        if not rows:
            print(table,0); continue
        placeholders=','.join(['?']*len(use))
        if table=='attempt_answers':
            conflict='attempt_id,question_id'
        else:
            conflict='id'
        updates=','.join([f"{c}=EXCLUDED.{c}" for c in use if c not in conflict.split(',')])
        sql=f"INSERT INTO {table} ({','.join(use)}) VALUES ({placeholders}) ON CONFLICT ({conflict}) DO UPDATE SET {updates}"
        for r in rows:
            dst.execute(sql,tuple(r[c] for c in use))
        print(table,len(rows))
    for table in ['users','rounds','questions','attempts']:
        dst.execute(f"SELECT setval(pg_get_serial_sequence('{table}','id'), COALESCE((SELECT MAX(id) FROM {table}),1), true)")
    dst.commit(); dst.close(); src.close()
    print('Hoàn tất chuyển dữ liệu sang Supabase.')

if __name__=='__main__':
    main()
