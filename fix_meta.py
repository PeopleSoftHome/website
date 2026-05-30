import re

files = [
    'src/pages/ProductDetailView.vue',
    'src/pages/SolutionDetailView.vue',
    'src/pages/CaseDetailView.vue',
    'src/pages/NewsDetailView.vue',
    'src/pages/JobDetailView.vue',
    'src/pages/ResourceDetailView.vue',
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r"(document\.title = .+?;)"
    
    def replacer(m):
        title_line = m.group(1)
        desc = title_line.replace('document.title = ', '').replace(';', '')
        return title_line + "\n    const meta = document.querySelector('meta[name=\"description\"]');\n    if (meta) meta.setAttribute('content', " + desc + ");"
    
    new_content = re.sub(pattern, replacer, content, count=1)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f'Updated {filepath}')
