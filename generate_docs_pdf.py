"""
Script to compile TripGenius Comprehensive Project Documentation into a publication-quality PDF.
"""
import re
import sys
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

MAIN_FONT = "Helvetica"
MAIN_FONT_BOLD = "Helvetica-Bold"

# Register Segoe UI if available
segoe = Path("C:/Windows/Fonts/segoeui.ttf")
segoe_b = Path("C:/Windows/Fonts/segoeuib.ttf")
if segoe.exists() and segoe_b.exists():
    try:
        pdfmetrics.registerFont(TTFont("SegoeUI", str(segoe)))
        pdfmetrics.registerFont(TTFont("SegoeUI-Bold", str(segoe_b)))
        MAIN_FONT = "SegoeUI"
        MAIN_FONT_BOLD = "SegoeUI-Bold"
    except Exception:
        pass


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont(MAIN_FONT, 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Header (pages after cover/first)
        if self._pageNumber > 1:
            self.drawString(54, 755, "TripGenius (Trip Geni) — Comprehensive Technical Documentation & Study Notes")
            self.setStrokeColor(colors.HexColor("#e2e8f0"))
            self.setLineWidth(0.5)
            self.line(54, 748, 558, 748)

        # Footer
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)

        self.drawString(54, 32, "Confidential & Academic / Technical Reference © 2026 Trip Geni")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()


def clean_text_for_xml(text: str) -> str:
    """Escape special XML characters and format markdown formatting."""
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    # Convert bold **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Convert code `text`
    text = re.sub(r"`(.+?)`", r"<font color='#0284c7' face='Courier'><b>\1</b></font>", text)
    # Convert italics *text*
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    return text


def build_pdf():
    doc_path = Path("d:/tripgenius/TripGenius_Complete_Project_Documentation.pdf")
    doc = SimpleDocTemplate(
        str(doc_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName=MAIN_FONT_BOLD,
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#0f172a"),
        alignment=TA_LEFT,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName=MAIN_FONT,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0284c7"),
        alignment=TA_LEFT,
        spaceAfter=14
    )

    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName=MAIN_FONT,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'DocH1',
        parent=styles['Normal'],
        fontName=MAIN_FONT_BOLD,
        fontSize=15,
        leading=19,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Normal'],
        fontName=MAIN_FONT_BOLD,
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0369a1"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'DocH3',
        parent=styles['Normal'],
        fontName=MAIN_FONT_BOLD,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e293b"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName=MAIN_FONT,
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
        spaceAfter=5
    )

    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )

    callout_style = ParagraphStyle(
        'DocCallout',
        parent=body_style,
        fontName=MAIN_FONT,
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#1e293b"),
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName=MAIN_FONT,
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#1e293b")
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName=MAIN_FONT_BOLD,
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    code_style = ParagraphStyle(
        'DocCode',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10.5,
        textColor=colors.HexColor("#0369a1"),
        leftIndent=10,
        spaceAfter=6
    )

    story = []

    # Title Banner Box
    title_box_data = [
        [
            Paragraph("TRIPGENIUS (TRIP GENI)", title_style),
        ],
        [
            Paragraph("Comprehensive Technical Architecture, Functional Directory &amp; Study Notes", subtitle_style),
        ],
        [
            Paragraph(
                "<b>Author &amp; Lead Engineer:</b> Devanarayanan | <b>Email:</b> devanarayananstackuplearning@gmail.com | <b>Phone:</b> +91 8078421005<br/>"
                "<b>System Core:</b> Next.js 15 (Turbopack) &bull; FastAPI Asynchronous Engine &bull; Google Gemini 2.5/1.5 Flash &bull; RAG Knowledge Store &bull; SQLite ORM",
                meta_style
            )
        ]
    ]
    title_table = Table(title_box_data, colWidths=[504])
    title_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(title_table)
    story.append(Spacer(1, 14))

    # Read markdown source
    md_file = Path("d:/tripgenius/PROJECT_DOCUMENTATION.md")
    if not md_file.exists():
        print("Error: PROJECT_DOCUMENTATION.md not found!")
        return

    content = md_file.read_text(encoding="utf-8")
    lines = content.splitlines()

    i = 0
    in_code_block = False
    code_lines = []
    in_table = False
    table_raw = []

    while i < len(lines):
        line = lines[i]

        # Check code fence
        if line.strip().startswith("```"):
            if in_code_block:
                in_code_block = False
                code_text = "<br/>".join([clean_text_for_xml(cl) for cl in code_lines])
                code_p = Paragraph(code_text, code_style)
                code_table = Table([[code_p]], colWidths=[504])
                code_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f1f5f9")),
                    ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ('PADDING', (0, 0), (-1, -1), 6),
                ]))
                story.append(code_table)
                story.append(Spacer(1, 6))
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Markdown Table Detection
        if line.strip().startswith("|") and line.strip().endswith("|"):
            table_raw.append(line)
            i += 1
            while i < len(lines) and lines[i].strip().startswith("|") and lines[i].strip().endswith("|"):
                table_raw.append(lines[i])
                i += 1

            # Process Markdown Table
            rows = []
            for tr_idx, tr in enumerate(table_raw):
                # skip divider row |---|---|
                cells = [c.strip() for c in tr.split("|")[1:-1]]
                if cells and all(set(c).issubset({'-', ':', ' '}) for c in cells):
                    continue
                row_paras = []
                for cell in cells:
                    cell_clean = clean_text_for_xml(cell)
                    if tr_idx == 0:
                        row_paras.append(Paragraph(cell_clean, table_header))
                    else:
                        row_paras.append(Paragraph(cell_clean, table_cell))
                if row_paras:
                    rows.append(row_paras)

            if rows:
                col_count = len(rows[0])
                col_width = 504 / col_count
                # Specific column weighting
                if col_count == 4:
                    col_widths = [90, 80, 60, 274]
                elif col_count == 5:
                    col_widths = [45, 120, 75, 110, 154]
                else:
                    col_widths = [col_width] * col_count

                t = Table(rows, colWidths=col_widths)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#0284c7")),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
                    ('PADDING', (0, 0), (-1, -1), 4),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ]))
                story.append(t)
                story.append(Spacer(1, 8))

            table_raw = []
            continue

        # Headers
        if line.startswith("# ") and not line.startswith("## "):
            # Skip main title since we already made a custom banner
            i += 1
            continue

        if line.startswith("## "):
            heading_text = line.replace("## ", "").strip()
            # If section 1 or higher, add section separator
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#0284c7"), spaceBefore=10, spaceAfter=8))
            story.append(Paragraph(clean_text_for_xml(heading_text), h1_style))
            i += 1
            continue

        if line.startswith("### "):
            heading_text = line.replace("### ", "").strip()
            story.append(Paragraph(clean_text_for_xml(heading_text), h2_style))
            i += 1
            continue

        if line.startswith("#### "):
            heading_text = line.replace("#### ", "").strip()
            story.append(Paragraph(clean_text_for_xml(heading_text), h3_style))
            i += 1
            continue

        # Callouts / Quotes
        if line.startswith("> "):
            callout_text = line.replace("> ", "").strip()
            callout_p = Paragraph(clean_text_for_xml(callout_text), callout_style)
            c_table = Table([[callout_p]], colWidths=[504])
            c_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#f0f9ff")),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#bae6fd")),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(c_table)
            story.append(Spacer(1, 4))
            i += 1
            continue

        # Bullets
        if line.strip().startswith("* ") or line.strip().startswith("- "):
            bullet_text = line.strip()[2:].strip()
            # Handle bullet item
            story.append(Paragraph(f"&bull; {clean_text_for_xml(bullet_text)}", bullet_style))
            i += 1
            continue

        # Numbered list
        m_num = re.match(r"^(\d+)\.\s+(.*)$", line.strip())
        if m_num:
            num = m_num.group(1)
            num_text = m_num.group(2)
            story.append(Paragraph(f"<b>{num}.</b> {clean_text_for_xml(num_text)}", bullet_style))
            i += 1
            continue

        # Horizontal Rule
        if line.strip() in ["---", "***", "___"]:
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#e2e8f0"), spaceBefore=6, spaceAfter=6))
            i += 1
            continue

        # Regular Body Paragraph
        if line.strip():
            story.append(Paragraph(clean_text_for_xml(line.strip()), body_style))
        else:
            story.append(Spacer(1, 3))

        i += 1

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated: {doc_path} (File size: {doc_path.stat().st_size} bytes)")


if __name__ == "__main__":
    build_pdf()
