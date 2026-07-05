#!/usr/bin/env python3
"""
extract_pft.py — Parse PFT PDF reports and produce a single CSV.

Usage:
    python extract_pft.py

Reads the three PFT PDFs from public/ and writes public/pft_results.csv.
"""

import pdfplumber
import csv
import re
import os

PDF_FILES = [
    {"path": "public/3cl pft.pdf",            "class": "3CL"},
    {"path": "public/2CL PFT1 RESULT.pdf",    "class": "2CL"},
    {"path": "public/1CL PFT1.pdf",           "class": "1CL"},
]

OUTPUT_CSV = "public/pft_results.csv"

# Regex for a cadet data line
# Pattern: NAME, MI  CN  pushups - score  situps - score  time- score  pullups - score  total
CADET_LINE = re.compile(
    r'^([A-ZÑ\s,._\-\']+?)\s+'            # name (uppercase letters, spaces, commas, etc.)
    r'(\d{5})\s+'                           # CN (5-digit cadet number)
    r'(.+)$'                                # rest of the line (scores)
)

SCORE_PATTERN = re.compile(
    r'(\d+)\s*-\s*([\d.]+)'                # raw - score pairs
)

TIME_PATTERN = re.compile(
    r'(\d{1,2}:\d{2})\s*-\s*([\d.]+)'     # time - score for 3.2km run
)


def parse_scores(rest):
    """Parse the scores portion of a cadet line."""
    # Check for completely absent cadet (all dashes)
    if rest.strip().replace('-', '').replace(' ', '') == '':
        return None

    # Try to extract time-based score (3.2km run) first
    time_match = TIME_PATTERN.search(rest)
    run_time = time_match.group(1) if time_match else ''
    run_score = float(time_match.group(2)) if time_match else 0.0

    # Remove the time portion so we can parse remaining score pairs
    rest_no_time = TIME_PATTERN.sub('', rest, count=1) if time_match else rest

    # Find all raw-score pairs
    pairs = SCORE_PATTERN.findall(rest_no_time)

    # We expect 3 non-time pairs: pushups, situps, pullups
    pushups_raw = int(pairs[0][0]) if len(pairs) > 0 else 0
    pushups_score = float(pairs[0][1]) if len(pairs) > 0 else 0.0
    situps_raw = int(pairs[1][0]) if len(pairs) > 1 else 0
    situps_score = float(pairs[1][1]) if len(pairs) > 1 else 0.0
    pullups_raw = int(pairs[2][0]) if len(pairs) > 2 else 0
    pullups_score = float(pairs[2][1]) if len(pairs) > 2 else 0.0

    # PFT total is the last number on the line
    total_match = re.search(r'([\d.]+)\s*$', rest.strip())
    pft_total = float(total_match.group(1)) if total_match else 0.0

    return {
        'pushups_raw': pushups_raw,
        'pushups_score': pushups_score,
        'situps_raw': situps_raw,
        'situps_score': situps_score,
        'run_time': run_time,
        'run_score': run_score,
        'pullups_raw': pullups_raw,
        'pullups_score': pullups_score,
        'pft_total': pft_total,
    }


def extract_pdf(pdf_info):
    """Extract all cadet PFT records from a single PDF."""
    records = []
    class_level = pdf_info['class']
    full_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), pdf_info['path'])

    current_company = ''

    with pdfplumber.open(full_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            for line in text.split('\n'):
                line = line.strip()

                # Check for company header
                company_match = re.match(r'^COMPANY\s+([A-Z])', line)
                if company_match:
                    current_company = company_match.group(1)
                    continue

                # Skip header lines
                if any(keyword in line for keyword in [
                    'Philippine Military Academy', 'Fort Del Pilar',
                    'Benguet', 'PFT1 Report', 'PD211', 'PD311', 'PD411',
                    'PUSH UPS', 'SIT UPS', 'ARM HANG', 'PFT1',
                    'Physical Development'
                ]):
                    continue

                if not line or len(line) < 10:
                    continue

                # Try to match a cadet line
                match = CADET_LINE.match(line)
                if match:
                    name = match.group(1).strip().rstrip(',')
                    cn = match.group(2)
                    rest = match.group(3)

                    scores = parse_scores(rest)

                    record = {
                        'class': class_level,
                        'cadet': name,
                        'cn': cn,
                        'company': current_company,
                    }

                    if scores:
                        record.update(scores)
                    else:
                        # Absent cadet
                        record.update({
                            'pushups_raw': '', 'pushups_score': '',
                            'situps_raw': '', 'situps_score': '',
                            'run_time': '', 'run_score': '',
                            'pullups_raw': '', 'pullups_score': '',
                            'pft_total': '',
                        })

                    records.append(record)

    return records


def main():
    all_records = []

    for pdf_info in PDF_FILES:
        print(f"Extracting {pdf_info['path']} ({pdf_info['class']})...")
        records = extract_pdf(pdf_info)
        print(f"  → {len(records)} cadets found")
        all_records.extend(records)

    print(f"\nTotal records: {len(all_records)}")

    # Write CSV
    fieldnames = [
        'class', 'cadet', 'cn', 'company',
        'pushups_raw', 'pushups_score',
        'situps_raw', 'situps_score',
        'run_time', 'run_score',
        'pullups_raw', 'pullups_score',
        'pft_total'
    ]

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), OUTPUT_CSV)
    with open(output_path, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_records)

    print(f"Written to {OUTPUT_CSV}")


if __name__ == '__main__':
    main()
