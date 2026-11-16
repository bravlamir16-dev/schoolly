import json, os, urllib.request, urllib.error
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
TZ = ZoneInfo(os.environ.get('SCHOOLLY_TZ', 'Europe/Berlin'))
TOPIC = os.environ.get('NTFY_TOPIC', '').strip()
if not TOPIC:
    raise SystemExit('Missing NTfy topic. Add repository secret NTfy_TOPIC.')

def read_json(name, default):
    p = ROOT / name
    if not p.exists(): return default
    try: return json.loads(p.read_text(encoding='utf-8'))
    except Exception: return default

tasks = read_json('tasks.json', [])
sent = set(read_json('notified.json', []))
now = datetime.now(TZ)
# GitHub scheduled jobs can start late. Catch reminders up to 10 minutes late.
late_limit = now - timedelta(minutes=10)
reminders = [(24, 86400, '24 часа'), (12, 43200, '12 часов'), (1, 3600, '1 час'), ('1min', 60, '1 минуту')]
new_count = 0

for task in tasks if isinstance(tasks, list) else []:
    if task.get('done') or not task.get('dueDate') or not task.get('dueTime'):
        continue
    try:
        due = datetime.strptime(task['dueDate'] + ' ' + task['dueTime'], '%Y-%m-%d %H:%M').replace(tzinfo=TZ)
    except (ValueError, TypeError):
        continue
    for rid, seconds, label in reminders:
        if rid not in (task.get('reminders') or []):
            continue
        fire_at = due - timedelta(seconds=seconds)
        key = f"{task.get('id','')}_{rid}_{task['dueDate']}_{task['dueTime']}"
        if key in sent or not (late_limit <= fire_at <= now + timedelta(minutes=5)):
            continue
        title = 'Schoolly — скоро дедлайн'
        body = f"{task.get('name','Задание')} ({task.get('subject','Без предмета')}) — сдача {due.strftime('%d.%m.%Y в %H:%M')}. Напоминание за {label}."
        data = body.encode('utf-8')
        req = urllib.request.Request(
            'https://ntfy.sh/' + TOPIC,
            data=data,
            headers={'Title': title, 'Priority': 'high' if task.get('priority') in ('high','urgent') else 'default', 'Tags': 'books,alarm'},
            method='POST'
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                if response.status < 300:
                    sent.add(key); new_count += 1
        except urllib.error.URLError as e:
            print(f'ntfy send failed: {e}')

(ROOT / 'notified.json').write_text(json.dumps(sorted(sent)[-5000:], ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Checked {len(tasks) if isinstance(tasks,list) else 0} tasks; sent {new_count} notification(s).')
