#!/usr/bin/env python3
"""
Extract deficiency data from PDF reports in public/week1(def)/ 
and output a CSV file for the Deficiencies page.
"""

import pdfplumber
import csv
import os
import re
import sys

week_str = "1"
if len(sys.argv) > 1:
    week_str = sys.argv[1]

INPUT_DIR = os.path.join(os.path.dirname(__file__), "public", f"week{week_str}(def)")
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "public", f"week{week_str}_deficiencies.csv")


def get_class_level(filename):
    """Derive class level from course code number.
    4xx = 1CL, 3xx = 2CL, 2xx = 3CL
    """
    match = re.search(r'(\d)', filename)
    if match:
        digit = match.group(1)
        if digit == '4':
            return '1CL'
        elif digit == '3':
            return '2CL'
        elif digit == '2':
            return '3CL'
    return 'Unknown'


def get_course_name(filename):
    """Extract course code from filename (e.g. COM431.pdf -> COM431)"""
    return filename.replace('.pdf', '')


def extract_course_full_name(text):
    """Extract full course name from text, e.g. 'COM431( Advanced Communication )'"""
    match = re.search(r'Course Name\s*:\s*\w+\(\s*(.+?)\s*\)', text)
    if match:
        return match.group(1).strip()
    return ''


def parse_cadet_line(line):
    """Parse a single cadet data line.
    Format: No Name CN SEC COY SUM CNT SUM CNT FINAL PTS_DEF AVG_GRADE
    Or shorter formats if exams are missing.
    """
    # Match pattern: number, then name (with commas), then cadet number, section, company, and the rest
    pattern = r'^(\d+)\s+(.+?)\s+(\d{5})\s+(\w+)\s+(\w+)\s+(.*)$'
    match = re.match(pattern, line.strip())
    if match:
        rest = match.group(6).split()
        if len(rest) >= 2:
            avg_grade = rest[-1]
            pts_def = rest[-2]
            
            lesson_sum = rest[0] if len(rest) > 2 else "0"
            lesson_cnt = rest[1] if len(rest) > 3 else "0"
            unit_sum = rest[2] if len(rest) > 4 else "0"
            unit_cnt = rest[3] if len(rest) > 5 else "0"
            final_exam = rest[4] if len(rest) > 6 else "0"

            return {
                'no': match.group(1),
                'name': match.group(2).strip(),
                'cn': match.group(3),
                'sec': match.group(4),
                'coy': match.group(5),
                'lesson_sum': lesson_sum,
                'lesson_cnt': lesson_cnt,
                'unit_sum': unit_sum,
                'unit_cnt': unit_cnt,
                'final_exam': final_exam,
                'pts_def': pts_def,
                'avg_grade': avg_grade,
            }
    return None


def extract_from_pdf(pdf_path):
    """Extract all cadet deficiency records from a PDF."""
    records = []
    filename = os.path.basename(pdf_path)
    course_code = get_course_name(filename)
    class_level = get_class_level(filename)
    
    with pdfplumber.open(pdf_path) as pdf:
        full_course_name = ''
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue
            
            # Get full course name from first page
            if not full_course_name:
                full_course_name = extract_course_full_name(text)
            
            lines = text.split('\n')
            for line in lines:
                parsed = parse_cadet_line(line)
                if parsed:
                    parsed['course'] = course_code
                    parsed['course_name'] = full_course_name
                    parsed['class'] = class_level
                    records.append(parsed)
    
    return records


def main():
    all_records = []
    
    pdf_paths = []
    for root, dirs, files in os.walk(INPUT_DIR):
        for f in files:
            if f.endswith('.pdf'):
                pdf_paths.append(os.path.join(root, f))
    pdf_paths = sorted(pdf_paths)
    
    print(f"Processing {len(pdf_paths)} PDF files from: {INPUT_DIR}")
    
    for pdf_path in pdf_paths:
        records = extract_from_pdf(pdf_path)
        pdf_file = os.path.basename(pdf_path)
        print(f"  {pdf_file}: {len(records)} deficient cadets extracted")
        all_records.extend(records)
    
    print(f"\nTotal records: {len(all_records)}")
    
    # Write CSV
    fieldnames = ['class', 'course', 'course_name', 'cadet', 'cn', 'sec', 'company', 
                  'lesson_sum', 'lesson_cnt', 'unit_sum', 'unit_cnt', 
                  'final_exam', 'pts', 'grade']
    
    with open(OUTPUT_FILE, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for rec in all_records:
            writer.writerow({
                'class': rec['class'],
                'course': rec['course'],
                'course_name': rec['course_name'],
                'cadet': rec['name'],
                'cn': rec['cn'],
                'sec': rec['sec'],
                'company': rec['coy'],
                'lesson_sum': rec['lesson_sum'],
                'lesson_cnt': rec['lesson_cnt'],
                'unit_sum': rec['unit_sum'],
                'unit_cnt': rec['unit_cnt'],
                'final_exam': rec['final_exam'],
                'pts': rec['pts_def'],
                'grade': rec['avg_grade'],
            })
    
    print(f"CSV written to: {OUTPUT_FILE}")


if __name__ == '__main__':
    main()
