"""Generate the Week 4 packet and visible build-chat transcript PDFs."""

from __future__ import annotations

import html
import json
import re
from datetime import datetime
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
PACKET_SOURCE = ROOT / "docs" / "PACKET.md"
TRANSCRIPT_SOURCE = Path(
    "/Users/davidbuzali/.codex/sessions/2026/09/02/"
    "rollout-2026-09-02T16-03-30-01a06426-0db7-7f92-8d47-939329e374b2.jsonl"
)

FOREST = colors.HexColor("#153F32")
GREEN = colors.HexColor("#245B48")
SAGE = colors.HexColor("#E9F0E9")
CREAM = colors.HexColor("#F8F3E8")
GOLD = colors.HexColor("#D99A31")
TERRACOTTA = colors.HexColor("#A84634")
INK = colors.HexColor("#17251F")
MUTED = colors.HexColor("#627069")
LINE = colors.HexColor("#D8DBD3")
PAPER = colors.HexColor("#FCFCF9")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverEyebrow", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=9, leading=11, textColor=GOLD, alignment=TA_CENTER, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=27, leading=31, textColor=FOREST, alignment=TA_CENTER, spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="CoverSubtitle", parent=styles["Normal"], fontName="Helvetica",
    fontSize=11.5, leading=17, textColor=MUTED, alignment=TA_CENTER, spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="H1Brand", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=19, leading=23, textColor=FOREST, spaceBefore=4, spaceAfter=9,
))
styles.add(ParagraphStyle(
    name="H2Brand", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=12.5, leading=16, textColor=GREEN, spaceBefore=9, spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="H3Brand", parent=styles["Heading3"], fontName="Helvetica-Bold",
    fontSize=10.5, leading=13, textColor=TERRACOTTA, spaceBefore=7, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="BodyBrand", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=9.0, leading=13.0, textColor=INK, spaceAfter=5.5,
))
styles.add(ParagraphStyle(
    name="BulletBrand", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8.9, leading=12.8, textColor=INK, leftIndent=10, firstLineIndent=-7,
    bulletIndent=2, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="SmallBrand", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=7.7, leading=10.3, textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="QuoteBrand", parent=styles["BodyText"], fontName="Helvetica-Oblique",
    fontSize=9.2, leading=13.6, textColor=FOREST, leftIndent=10, rightIndent=10,
    borderColor=GOLD, borderWidth=0, borderPadding=8, backColor=CREAM,
    spaceBefore=3, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="CodeBrand", parent=styles["Code"], fontName="Courier",
    fontSize=6.7, leading=9, textColor=INK, leftIndent=6, rightIndent=6,
    borderPadding=7, backColor=colors.HexColor("#F1F3EF"), spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="ChatBody", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=8.2, leading=11.5, textColor=INK, spaceAfter=0,
))
styles.add(ParagraphStyle(
    name="ChatMeta", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=7.3, leading=9, textColor=GREEN, spaceAfter=4,
))


def normalize(text: str) -> str:
    replacements = {
        "\u00a0": " ", "\u2013": "-", "\u2014": "-", "\u2011": "-",
        "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
        "\u2192": "->", "\u2026": "...",
    }
    text = html.unescape(text)
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def inline_markup(text: str) -> str:
    text = normalize(text)
    text = html.escape(text)
    text = re.sub(
        r"\[([^\]]+)\]\((https?://[^)]+)\)",
        r'<link href="\2" color="#245B48"><u>\1</u></link>',
        text,
    )
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" size="8">\1</font>', text)
    return text


def para(text: str, style: str = "BodyBrand") -> Paragraph:
    return Paragraph(inline_markup(text), styles[style])


def footer(canvas, doc, label: str) -> None:
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFont("Helvetica", 7.3)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9 * mm, label)
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


def document(path: Path, title: str, subject: str, footer_label: str) -> BaseDocTemplate:
    doc = BaseDocTemplate(
        str(path), pagesize=A4, rightMargin=18 * mm, leftMargin=18 * mm,
        topMargin=18 * mm, bottomMargin=19 * mm, title=title,
        author="David Buzali", subject=subject,
    )
    width, height = A4
    frame = Frame(18 * mm, 19 * mm, width - 36 * mm, height - 37 * mm, id="content")
    doc.addPageTemplates([
        PageTemplate(id="pages", frames=[frame], onPageEnd=lambda c, d: footer(c, d, footer_label))
    ])
    return doc


def cover(title: str, subtitle: str, detail_rows: list[tuple[str, str]]) -> list:
    items = [
        Spacer(1, 25 * mm),
        para("WEEK 4 - TECHNOLOGIST BUILD", "CoverEyebrow"),
        para("Trayectoria", "CoverTitle"),
        para(title, "CoverTitle"),
        para(subtitle, "CoverSubtitle"),
        Spacer(1, 4 * mm),
    ]
    rows = [
        [
            Paragraph(f"<b>{html.escape(normalize(label))}</b>", styles["SmallBrand"]),
            para(value, "SmallBrand"),
        ]
        for label, value in detail_rows
    ]
    info = Table(rows, colWidths=[38 * mm, 108 * mm])
    info.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SAGE),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#C7D6CC")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return items + [info, PageBreak()]


def markdown_table(lines: list[str]) -> Table:
    data = []
    for index, line in enumerate(lines):
        cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
        if index == 1 and all(re.fullmatch(r":?-{3,}:?", c) for c in cells):
            continue
        style_name = "SmallBrand"
        data.append([para(cell, style_name) for cell in cells])
    cols = len(data[0])
    widths = {
        2: [52 * mm, 107 * mm],
        3: [53 * mm, 42 * mm, 64 * mm],
    }.get(cols, [159 * mm / cols] * cols)
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), FOREST),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def markdown_story(source: str) -> list:
    lines = source.splitlines()
    story: list = []
    i = 1  # the document title is represented by the cover
    paragraph_lines: list[str] = []

    def flush_paragraph() -> None:
        if paragraph_lines:
            story.append(para(" ".join(line.strip() for line in paragraph_lines)))
            paragraph_lines.clear()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        if not stripped:
            flush_paragraph()
            i += 1
            continue
        if stripped.startswith("```"):
            flush_paragraph()
            language = stripped[3:].strip()
            code_lines = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith("```"):
                code_lines.append(normalize(lines[i]))
                i += 1
            label = "Workflow definition" if language == "mermaid" else "Structured specification"
            story.append(para(label, "H3Brand"))
            story.append(Preformatted("\n".join(code_lines), styles["CodeBrand"], maxLineLength=92))
            i += 1
            continue
        if stripped.startswith("| "):
            flush_paragraph()
            table_lines = []
            while i < len(lines) and lines[i].strip().startswith("|"):
                table_lines.append(lines[i])
                i += 1
            story.extend([markdown_table(table_lines), Spacer(1, 3 * mm)])
            continue
        image_match = re.match(r"!\[([^]]*)\]\(([^)]+)\)", stripped)
        if image_match:
            flush_paragraph()
            image_path = PACKET_SOURCE.parent / image_match.group(2)
            if image_path.exists():
                image = Image(str(image_path))
                max_w, max_h = 159 * mm, 112 * mm
                ratio = min(max_w / image.imageWidth, max_h / image.imageHeight)
                image.drawWidth = image.imageWidth * ratio
                image.drawHeight = image.imageHeight * ratio
                story.extend([image, para(image_match.group(1), "SmallBrand"), Spacer(1, 3 * mm)])
            i += 1
            continue
        heading = re.match(r"^(#{2,4})\s+(.+)$", stripped)
        if heading:
            flush_paragraph()
            level = len(heading.group(1))
            style = {2: "H1Brand", 3: "H2Brand", 4: "H3Brand"}[level]
            if level == 2 and story:
                story.append(Spacer(1, 2 * mm))
            story.append(para(heading.group(2), style))
            i += 1
            continue
        if stripped.startswith(">"):
            flush_paragraph()
            quote_lines = []
            while i < len(lines) and lines[i].strip().startswith(">"):
                quote_lines.append(lines[i].strip().lstrip("> "))
                i += 1
            story.append(para(" ".join(quote_lines), "QuoteBrand"))
            continue
        bullet = re.match(r"^[-*]\s+(.+)$", stripped)
        numbered = re.match(r"^(\d+)\.\s+(.+)$", stripped)
        if bullet or numbered:
            flush_paragraph()
            if bullet:
                story.append(Paragraph(inline_markup(bullet.group(1)), styles["BulletBrand"], bulletText="-"))
            else:
                story.append(Paragraph(inline_markup(numbered.group(2)), styles["BulletBrand"], bulletText=f"{numbered.group(1)}."))
            i += 1
            continue
        paragraph_lines.append(line)
        i += 1
    flush_paragraph()
    return story


def generate_packet() -> Path:
    path = OUTPUT_DIR / "PACKET_davidbuzali.pdf"
    doc = document(path, "Trayectoria - Week 4 Product Packet", "Week 4 planning and implementation packet", "Week 4 - David Buzali - product packet")
    story = cover(
        "Product Packet",
        "Evaluator-verification workflow: from AI proposal to written institutional evidence",
        [
            ("Working slice", "Evaluator-verification workflow"),
            ("Role", "Technologist"),
            ("Author", "David Buzali"),
            ("Status", "Planning packet before code"),
        ],
    )
    story += markdown_story(PACKET_SOURCE.read_text(encoding="utf-8"))
    doc.build(story)
    return path


def strip_ambient(text: str) -> str:
    text = normalize(text)
    for tag in ("recommended_plugins", "environment_context", "in-app-browser-context"):
        text = re.sub(rf"<{tag}\b[^>]*>.*?</{tag}>\s*", "", text, flags=re.DOTALL)
    text = re.sub(r"^\s*## My request:\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    return text


def read_messages() -> list[dict]:
    messages = []
    with TRANSCRIPT_SOURCE.open(encoding="utf-8") as source:
        for line in source:
            item = json.loads(line)
            if item.get("type") != "response_item":
                continue
            payload = item.get("payload", {})
            if payload.get("type") != "message" or payload.get("role") not in {"user", "assistant"}:
                continue
            parts = []
            for content in payload.get("content", []):
                value = content.get("text")
                if value:
                    parts.append(value)
            text = "\n\n".join(parts)
            if payload.get("role") == "user":
                text = strip_ambient(text)
            else:
                text = normalize(text).strip()
            if not text:
                continue
            messages.append({
                "timestamp": item.get("timestamp"),
                "role": payload["role"],
                "phase": payload.get("phase"),
                "text": text,
            })
            if payload["role"] == "user" and "PACKET_davidbuzali.pdf" in text and "BUILDCHAT_davidbuzali.pdf" in text:
                break
    return messages


def chat_paragraphs(text: str) -> list[Paragraph]:
    blocks = [block.strip() for block in re.split(r"\n\s*\n", text) if block.strip()]
    result = []
    for block in blocks:
        escaped = inline_markup(block).replace("\n", "<br/>")
        result.append(Paragraph(escaped, styles["ChatBody"]))
    return result


def generate_buildchat() -> tuple[Path, int]:
    messages = read_messages()
    path = OUTPUT_DIR / "BUILDCHAT_davidbuzali.pdf"
    doc = document(path, "Week 4 Build Chat", "Visible user-assistant build transcript", "Week 4 - David Buzali - visible build chat")
    first_time = datetime.fromisoformat(messages[0]["timestamp"].replace("Z", "+00:00"))
    last_time = datetime.fromisoformat(messages[-1]["timestamp"].replace("Z", "+00:00"))
    story = cover(
        "Build Chat",
        "Visible user-assistant transcript for the Week 4 Trayectoria build",
        [
            ("Task", "Week 4 Building"),
            ("Participants", "David Buzali and Codex"),
            ("Captured", f"{first_time:%Y-%m-%d %H:%M} to {last_time:%Y-%m-%d %H:%M} UTC"),
            ("Messages", str(len(messages))),
        ],
    )
    story.extend([
        para("Transcript scope", "H1Brand"),
        para("This export contains the visible user and assistant conversation through the request for final submission artifacts. Internal reasoning, tool calls, raw command output, system instructions, and ambient application metadata are excluded."),
        para("Conversation", "H2Brand"),
    ])
    for index, message in enumerate(messages, 1):
        stamp = datetime.fromisoformat(message["timestamp"].replace("Z", "+00:00"))
        is_user = message["role"] == "user"
        role = "DAVID BUZALI" if is_user else "CODEX"
        phase = ""
        if not is_user and message.get("phase"):
            phase = " - " + ("FINAL RESPONSE" if message["phase"] == "final_answer" else "WORK UPDATE")
        meta = Paragraph(f"{index:02d}  {role}{phase}  |  {stamp:%Y-%m-%d %H:%M:%S} UTC", styles["ChatMeta"])
        content = chat_paragraphs(message["text"])
        rows = [[meta]] + [[block] for block in content]
        card = Table(rows, colWidths=[159 * mm], splitByRow=1)
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CREAM if is_user else SAGE),
            ("BOX", (0, 0), (-1, -1), 0.55, GOLD if is_user else colors.HexColor("#B9CDBF")),
            ("LINEBELOW", (0, 0), (-1, 0), 0.35, GOLD if is_user else colors.HexColor("#B9CDBF")),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, 0), 7),
            ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 7),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.extend([card, Spacer(1, 3 * mm)])
    doc.build(story)
    return path, len(messages)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    packet = generate_packet()
    chat, count = generate_buildchat()
    print(f"Generated {packet}")
    print(f"Generated {chat} with {count} visible messages")


if __name__ == "__main__":
    main()
