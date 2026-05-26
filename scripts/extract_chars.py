import os, re

chars = set()
for root, dirs, files in os.walk('src'):
    for f in files:
        if f.endswith(('.vue', '.js', '.json', '.css', '.html', '.md')):
            try:
                with open(os.path.join(root, f), 'r', encoding='utf-8') as fp:
                    text = fp.read()
                    chars.update(re.findall(r'[\u4e00-\u9fff]', text))
            except Exception:
                pass

# 添加常用标点、数字、英文字母
extra = (
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    '.,;:!?-–—()[]{}\\\'"@#$%&*+=_~|<>·《》（）【】，。、；：！？—…'
)
chars.update(extra)

result = ''.join(sorted(chars))
print(f'Total unique chars: {len(result)}')
with open('used_chars.txt', 'w', encoding='utf-8') as f:
    f.write(result)
