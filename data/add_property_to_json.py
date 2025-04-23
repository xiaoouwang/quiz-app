from asyncore import file_dispatcher
import json

file_path = "quiz_nice_15.json"
# Save the updated JSON to a new file
new_file_path = f"{file_path.split('/')[-1].replace('.json', '_updated.json')}"
# Load the JSON file
with open(file_path, 'r', encoding='utf-8') as file:
    quiz_data = json.load(file)

# Add the theme property to each item if it doesn't already have it
for item in quiz_data:
    if 'theme' not in item:
        item['theme'] = 'Nice'


with open(new_file_path, 'w', encoding='utf-8') as file:
    json.dump(quiz_data, file, ensure_ascii=False, indent=2)

print(f"Updated {sum(1 for item in quiz_data if item['theme'] == 'francais_familier')} items with theme 'francais_familier'")