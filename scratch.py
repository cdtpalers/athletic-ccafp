import csv
with open('public/pft_results.csv', 'r') as f:
    reader = csv.DictReader(f)
    pairs = set()
    for row in reader:
        val = row['pullups_raw']
        score = row['pullups_score']
        if val and score:
            pairs.add((float(val), float(score)))
    for val, score in sorted(pairs):
        if val >= 25 and val <= 60:
            print(f"Raw: {val}, Score: {score}")
