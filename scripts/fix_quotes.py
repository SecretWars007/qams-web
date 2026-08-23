import re

path = r'c:\diplomado\qams-web\scripts\generate_academic_monograph.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace add_p("...") with add_p('''...''')
content = re.sub(r'add_p\("([^"]*".*?)"\)', r"add_p('''\1''')", content)
content = re.sub(r'add_bullet\("([^"]*".*?)"\)', r"add_bullet('''\1''')", content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Quotes fixed.")
