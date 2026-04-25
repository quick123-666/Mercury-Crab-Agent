"""Vibe Coding 批量导入 llmwikify 知识库"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import glob, os, subprocess, time, json
from datetime import datetime

# 设置 UTF-8 环境
_env = {**os.environ, 'PYTHONUTF8': '1', 'PYTHONIOENCODING': 'utf-8'}

# 要导入的目录
DIRS = [
    (r'C:\Users\Administrator\.qclaw\workspace\ai-guide-main', 'ai-guide'),
    (r'C:\Users\Administrator\.qclaw\workspace\claude-code-best-practice', 'claude-code'),
    (r'C:\Users\Administrator\.qclaw\workspace\context-engineering-intro-main', 'context-engineering'),
]

LOG_FILE = r'C:\Users\Administrator\.qclaw\workspace\memory\vibe-import-log.txt'
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

def log(msg):
    ts = datetime.now().strftime('%H:%M:%S')
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(line + '\n')

def ingest_file(path):
    """单文件 ingest，返回 (success, already_existed)"""
    try:
        result = subprocess.run(
            ['llmwikify', 'ingest', path],
            capture_output=True, encoding='utf-8', errors='replace',
            env=_env, timeout=60
        )
        if result.returncode == 0:
            stderr = result.stderr.lower()
            if 'already in raw' in stderr or 'already_exists' in stderr or 'already in' in stderr:
                return True, True
            return True, False
        # 检查是否已存在
        if 'already' in result.stderr.lower():
            return True, True
        return False, False
    except subprocess.TimeoutExpired:
        return False, False
    except Exception as e:
        return False, False

def run():
    total_files = []
    for base_dir, name in DIRS:
        files = [f for f in glob.glob(base_dir + '\\**\\*.md', recursive=True) if os.path.isfile(f)]
        total_files.extend(files)
        log(f"[{name}] 找到 {len(files)} 个 .md 文件")

    log(f"共 {len(total_files)} 个文件待导入")
    log(f"开始时间: {datetime.now().isoformat()}")

    success = 0
    already = 0
    failed = 0
    errors_detail = []

    for i, path in enumerate(total_files, 1):
        ok, existed = ingest_file(path)
        if ok:
            if existed:
                already += 1
            else:
                success += 1
        else:
            failed += 1
            errors_detail.append(path)

        if i % 20 == 0:
            log(f"进度: {i}/{len(total_files)} | 成功:{success} 已有:{already} 失败:{failed}")

        # 每批次后短暂休眠，避免过快
        if i % 50 == 0:
            time.sleep(2)

    log(f"=== 导入完成 ===")
    log(f"总文件: {len(total_files)}")
    log(f"新增成功: {success}")
    log(f"已存在: {already}")
    log(f"失败: {failed}")
    if errors_detail:
        log(f"失败文件: {errors_detail[:10]}")
    log(f"完成时间: {datetime.now().isoformat()}")

    # 写入摘要
    summary = {
        'date': datetime.now().isoformat(),
        'total': len(total_files),
        'success': success,
        'already': already,
        'failed': failed,
        'failed_files': errors_detail[:20]
    }
    with open(LOG_FILE.replace('.txt', '-summary.json'), 'w', encoding='utf-8') as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

if __name__ == '__main__':
    run()