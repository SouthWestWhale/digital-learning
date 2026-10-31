# -*- coding: utf-8 -*-
"""Extract the 52 exam question cards from the original exam PDF.

Each question card is an embedded image object in the PDF, so we get its bbox
for free via page.get_image_rects().  Details handled:

- Some cards have small annotation images drawn on top, fully inside the card
  rect -> contained rects are dropped (the container card is kept).
- The Moodle screenshots stagger some cards so that two card images overlap
  partially.  The image drawn LATER is on top; for the underlying card we
  render the full rect and fill the overlap rectangle with the cream page
  colour, so no fragment of the neighbouring card shows.
- Page 16 is a photo of a monitor; the one exam question shown on it is cut
  with a manual box (MANUAL_BOXES).
- The "จงเขียนวงจรนี้เป็นวงจรอะไร" 7476 shift-register question appears three
  times in the PDF (pages 2, 5 and 12 — repeated Moodle screenshots with
  shuffled options).  Only the first two appearances are real exam questions;
  the page-12 repeat is skipped (SKIP_RECTS).

Output: docs/exam/q01.png .. q52.png (top->bottom, left->right per page),
plus temporary contact sheets docs/exam/_contact_NN.png (NOT committed).

Usage:  py tools/extract_exam.py
"""
import os
import sys

import pymupdf

PDF_PATH = sys.argv[1] if len(sys.argv) > 1 else r"C:\Users\Karalann\Downloads\final digi\ข้อสอบดิจิ.pdf"
OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "docs", "exam")
DPI = 130
CONTACT_COLS = 4
PER_SHEET = 16

EXCLUDED_PAGES = set()

# Manual overrides: {page_number_1based: [(x0, y0, x1, y1), ...]}
# Coordinates are fractions 0-1 of the page.  When a page is listed here the
# automatic detection is skipped for that page and these boxes are used instead.
# Page 16 = photo of a monitor; box = the question card shown on the screen.
MANUAL_BOXES = {
    16: [(0.05, 0.19, 1.00, 0.78)],
}

# Detected rects to ignore: {(page_1based, (x0, y0, x1, y1))} in PDF points,
# matched with a tolerance of 3pt.  Page 12's first card is a repeated
# screenshot of the same 7476 question already cropped from pages 2 and 5.
SKIP_RECTS = {
    (12, (25, 29, 657, 357)),
}

CREAM = (245, 240, 225)  # page background colour used to erase intrusions


def detect_boxes(page):
    """Return list of (rect, fill_rect_or_None) for each question card.

    fill_rect (PDF coords) is the region of the card occluded by a later
    (on-top) neighbouring card image; it gets painted with the page colour.
    """
    raws = []
    for im in page.get_images(full=True):
        for r in page.get_image_rects(im[0]):
            r = pymupdf.Rect(r) & page.rect  # clamp to page
            if r.is_empty or r.width < 10 or r.height < 10:
                continue
            raws.append(r)
    # drop rects fully contained in another (annotation overlays)
    rects = []
    for i, r in enumerate(raws):
        if any(r in o for j, o in enumerate(raws) if j != i):
            continue
        rects.append(r)
    # pairwise partial overlaps: earlier card is occluded by later card
    cards = []
    for i, r in enumerate(rects):
        fill = None
        for o in rects[i + 1:]:
            inter = r & o
            if not inter.is_empty:
                fill = inter if fill is None else fill | inter
        cards.append((r, fill))
    return cards


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    doc = pymupdf.open(PDF_PATH)
    mat = pymupdf.Matrix(DPI / 72.0, DPI / 72.0)

    entries = []  # (page_no_1based, rect, fill)
    for pno, page in enumerate(doc, start=1):
        if pno in EXCLUDED_PAGES:
            continue
        if pno in MANUAL_BOXES:
            pr = page.rect
            entries.extend(
                (pno, pymupdf.Rect(x0 * pr.width, y0 * pr.height,
                                   x1 * pr.width, y1 * pr.height), None)
                for (x0, y0, x1, y1) in MANUAL_BOXES[pno])
        else:
            for (r, f) in detect_boxes(page):
                if any(pno == sp and abs(r.x0 - sx) < 3 and abs(r.y0 - sy) < 3
                       and abs(r.x1 - ex) < 3 and abs(r.y1 - ey) < 3
                       for (sp, (sx, sy, ex, ey)) in SKIP_RECTS):
                    print(f"skip repeated card on page {pno} ({r.x0:.0f},{r.y0:.0f})")
                    continue
                entries.append((pno, r, f))
    # reading order: rows of ~50pt, then left->right
    entries.sort(key=lambda e: (e[0], round(e[1].y0 / 50), e[1].x0))

    n = len(entries)
    if n != 52:
        print(f"WARNING: detected {n} cards, expected 52")

    for idx, (pno, r, fill) in enumerate(entries, start=1):
        pix = doc[pno - 1].get_pixmap(matrix=mat, clip=r)
        out = os.path.join(OUT_DIR, f"q{idx:02d}.png")
        if fill is None:
            pix.save(out)
        else:  # erase the occluded corner via PIL
            import math
            from PIL import Image, ImageDraw
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            z = DPI / 72.0
            box = (max(0, round((fill.x0 - r.x0) * z) - 1),
                   max(0, round((fill.y0 - r.y0) * z) - 1),
                   min(pix.width, math.ceil((fill.x1 - r.x0) * z) + 1),
                   min(pix.height, math.ceil((fill.y1 - r.y0) * z) + 1))
            ImageDraw.Draw(img).rectangle(box, fill=CREAM)
            img.save(out)
        print(f"q{idx:02d}.png  page {pno}  ({r.x0:.0f},{r.y0:.0f},{r.x1:.0f},{r.y1:.0f})"
              + (f"  fill=({fill.x0:.0f},{fill.y0:.0f},{fill.x1:.0f},{fill.y1:.0f})" if fill else ""))

    make_contact_sheets(entries, doc, mat)
    print(f"done: {n} cards, dpi={DPI}")
    return 0 if n == 52 else 1


def make_contact_sheets(entries, doc, mat):
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("Pillow not installed; skipping contact sheets")
        return
    sheets = [entries[i:i + PER_SHEET] for i in range(0, len(entries), PER_SHEET)]
    thumb_w = 320
    for s_idx, chunk in enumerate(sheets, start=1):
        thumbs = []
        for (pno, r, fill) in chunk:
            pix = doc[pno - 1].get_pixmap(matrix=mat, clip=r)
            img = Image.frombytes("RGB", (pix.width, pix.height), pix.samples)
            if fill is not None:
                import math
                z = DPI / 72.0
                box = (max(0, round((fill.x0 - r.x0) * z) - 1),
                       max(0, round((fill.y0 - r.y0) * z) - 1),
                       min(img.width, math.ceil((fill.x1 - r.x0) * z) + 1),
                       min(img.height, math.ceil((fill.y1 - r.y0) * z) + 1))
                ImageDraw.Draw(img).rectangle(box, fill=CREAM)
            h = max(1, int(img.height * thumb_w / img.width))
            thumbs.append(img.resize((thumb_w, h)))
        rows = (len(thumbs) + CONTACT_COLS - 1) // CONTACT_COLS
        row_h = [max(t.height for t in thumbs[r * CONTACT_COLS:(r + 1) * CONTACT_COLS])
                 for r in range(rows)]
        W = CONTACT_COLS * (thumb_w + 8) + 8
        H = sum(row_h) + rows * 24 + 8
        sheet = Image.new("RGB", (W, H), "white")
        d = ImageDraw.Draw(sheet)
        y = 4
        for r_i in range(rows):
            for c in range(CONTACT_COLS):
                k = r_i * CONTACT_COLS + c
                if k >= len(thumbs):
                    break
                x = 8 + c * (thumb_w + 8)
                d.text((x, y), f"q{(s_idx - 1) * PER_SHEET + k + 1:02d}", fill="red")
                sheet.paste(thumbs[k], (x, y + 18))
            y += row_h[r_i] + 24
        out = os.path.join(OUT_DIR, f"_contact_{s_idx:02d}.png")
        sheet.save(out)
        print("contact sheet:", out)


if __name__ == "__main__":
    sys.exit(main())
