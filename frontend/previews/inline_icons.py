import base64
import os

html_file = 'liquid-glass-v5.html'
image_file = 'app-icons-v2.png'

print(f"Working directory: {os.getcwd()}")

if not os.path.exists(image_file):
    print(f"Error: {image_file} not found")
    exit(1)

if not os.path.exists(html_file):
    print(f"Error: {html_file} not found")
    exit(1)

with open(image_file, "rb") as image_file_obj:
    encoded_string = base64.b64encode(image_file_obj.read()).decode('utf-8')

data_uri = f"data:image/png;base64,{encoded_string}"

with open(html_file, "r", encoding='utf-8') as html_file_obj:
    html_content = html_file_obj.read()

search_string = "new THREE.TextureLoader().load('./app-icons-v2.png',"
replace_string = f"new THREE.TextureLoader().load('{data_uri}',"

if search_string in html_content:
    new_html_content = html_content.replace(search_string, replace_string)
    with open(html_file, "w", encoding='utf-8') as html_file_obj:
        html_file_obj.write(new_html_content)
    print("Successfully replaced image path with base64 data URI.")
else:
    print("Could not find the target string in the HTML file.")
    # Check if it was already replaced
    if "data:image/png;base64" in html_content and "new THREE.TextureLoader().load('data:image/png;base64" in html_content:
         print("It seems the image is already inlined.")
    else:
         print(f"Search string was: {search_string}")
