from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "PERSONA_davidbuzali.pdf"
OUTPUT.parent.mkdir(parents=True, exist_ok=True)

FOREST = colors.HexColor("#153F32")
GREEN = colors.HexColor("#245B48")
SAGE = colors.HexColor("#E9F0E9")
CREAM = colors.HexColor("#F8F3E8")
GOLD = colors.HexColor("#D99A31")
TERRACOTTA = colors.HexColor("#A84634")
INK = colors.HexColor("#17251F")
MUTED = colors.HexColor("#627069")
LINE = colors.HexColor("#D8DBD3")


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverEyebrow",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9,
    leading=11,
    textColor=GOLD,
    alignment=TA_CENTER,
    spaceAfter=8,
    uppercase=True,
))
styles.add(ParagraphStyle(
    name="CoverTitle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=28,
    leading=32,
    textColor=FOREST,
    alignment=TA_CENTER,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="CoverSubtitle",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=12,
    leading=17,
    textColor=MUTED,
    alignment=TA_CENTER,
    spaceAfter=20,
))
styles.add(ParagraphStyle(
    name="H1Brand",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=20,
    leading=24,
    textColor=FOREST,
    spaceBefore=4,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="H2Brand",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=13,
    leading=16,
    textColor=GREEN,
    spaceBefore=9,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="BodyBrand",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.5,
    leading=14,
    textColor=INK,
    spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="SmallBrand",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8,
    leading=11,
    textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="QuoteBrand",
    parent=styles["BodyText"],
    fontName="Helvetica-Oblique",
    fontSize=10,
    leading=15,
    textColor=FOREST,
    leftIndent=12,
    rightIndent=12,
    borderColor=GOLD,
    borderWidth=0,
    borderPadding=8,
    backColor=CREAM,
    spaceBefore=4,
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="Metric",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=19,
    leading=21,
    textColor=FOREST,
    alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="MetricLabel",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=7.5,
    leading=10,
    textColor=MUTED,
    alignment=TA_CENTER,
))


def p(text, style="BodyBrand"):
    return Paragraph(text, styles[style])


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 9 * mm, "Week 4 - David Buzali - fictional academic prototype")
    canvas.drawRightString(width - 18 * mm, 9 * mm, f"Page {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=22 * mm,
    bottomMargin=19 * mm,
    title="Trayectoria - Persona test - Diego",
    author="David Buzali",
    subject="Week 4 synthetic persona validation",
)
page_width, page_height = A4
content_frame = Frame(
    18 * mm,
    19 * mm,
    page_width - 36 * mm,
    page_height - 41 * mm,
    id="persona-content",
)
doc.addPageTemplates([PageTemplate(id="persona-pages", frames=[content_frame], onPageEnd=header_footer)])

story = [
    Spacer(1, 22 * mm),
    p("WEEK 4 - SYNTHETIC PERSONA VALIDATION", "CoverEyebrow"),
    p("Trayectoria", "CoverTitle"),
    p("Persona test: Diego", "CoverTitle"),
    p("Can a student trace verified credits, compare consequences, and retain agency before a payment deadline?", "CoverSubtitle"),
]

metric_data = [
    [p("20", "Metric"), p("18 Sep", "Metric"), p("90", "Metric")],
    [p("years old", "MetricLabel"), p("payment deadline", "MetricLabel"), p("verified transfer credits", "MetricLabel")],
]
metrics = Table(metric_data, colWidths=[52 * mm, 52 * mm, 52 * mm], rowHeights=[13 * mm, 10 * mm])
metrics.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), SAGE),
    ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#C7D6CC")),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#C7D6CC")),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
]))
story += [metrics, Spacer(1, 13 * mm)]
story += [
    p("Purpose", "H2Brand"),
    p("This test checks whether Trayectoria helps Diego understand institutional evidence without turning temporary financial limits into a judgment about his ambition. The product must make uncertainty visible, keep both routes open, and never treat an AI proposal as an institutional decision."),
    p("Method note", "H2Brand"),
    p("The initial packet incorrectly named evaluator Laura as the persona. The user corrected the test to Diego. The Laura run was stopped and its uncommitted idea was discarded. At the user's explicit direction, this pass remained in the build conversation so the existing context could be challenged directly."),
    Spacer(1, 8 * mm),
    p("Production: week-4-trajectory-verification.vercel.app", "SmallBrand"),
    PageBreak(),
    p("1. Persona and task", "H1Brand"),
    p("Diego's context", "H2Brand"),
    p("Diego is a fictional 20-year-old first-generation Industrial Engineering student. His family is stretching its finances to pay tuition. He wants a recognized degree without destabilizing his household. Reversibility and future options matter more than speed."),
    p("Test prompt", "H2Brand"),
    p("You are Diego. Review Trayectoria before and after the institutional decision. Narrate what you understand, what you distrust, what you cannot trace, and what you would do before the September 18 payment deadline.", "QuoteBrand"),
    p("Observed sequence", "H2Brand"),
]

steps = [
    "Open Diego's view before institutional verification.",
    "Explain why proposed credits and route calculations are hidden.",
    "Open the result after two proposals are confirmed, one is returned, and the institutional decision is issued.",
    "Compare remaining credits, semesters, tuition, and the family reference across both routes.",
    "Inspect calculation assumptions and limits.",
    "Explain the 90 recognized transfer credits and identify what needs attention before the deadline.",
]
for idx, step in enumerate(steps, 1):
    story.append(p(f"<b>{idx}.</b> {step}"))

story += [
    Spacer(1, 4 * mm),
    p("Pass criteria", "H2Brand"),
    p("Diego can distinguish proposed from verified evidence, reproduce the credit total, understand cost limits, see both routes without a recommendation, and retain the right to reject both."),
    PageBreak(),
    p("2. Persona narration", "H1Brand"),
    p("Before verification", "H2Brand"),
    p("I understand that the comparison is waiting for the institution and that AI matches are not being treated as facts. I do not see a route yet, which feels safer than seeing a guess. I still need to remember my payment deadline and know what evidence is holding the process up.", "QuoteBrand"),
    p("After verification", "H2Brand"),
    p("I can compare staying and transferring without being told which one is best. Both take an estimated five semesters. Staying exceeds the family reference by MXN 6,000 per semester; transferring is within it. I can see that manufacturing was returned and why. I can also reject both routes.", "QuoteBrand"),
    p("Point of failure", "H2Brand"),
    p("I do not know where the 90 transfer credits came from. I can see one returned six-credit course and two confirmed courses, but the screen never explains the starting credit base. If I cannot reproduce the number, I do not know what to question or appeal before paying.", "QuoteBrand"),
    p("Why this mattered", "H2Brand"),
    p("Credit provenance is the load-bearing trust claim of the product. A correct number that cannot be traced still asks Diego to trust a system at the moment he must make a consequential financial choice."),
    PageBreak(),
    p("3. Confusion log and correction", "H1Brand"),
]

confusions = [
    [p("Observation", "SmallBrand"), p("Risk", "SmallBrand"), p("Disposition", "SmallBrand")],
    [p("Blocked state has no detailed evidence-request owner."), p("Medium"), p("Next pilot requirement")],
    [p("90 recognized credits hide the 78-credit confirmed base."), p("High"), p("Fixed in this slice")],
    [p("Payment deadline disappears from the result header."), p("Medium"), p("Fixed with persona correction")],
    [p("Cost assumptions are collapsed below the comparison."), p("Low"), p("Retained as accessible disclosure")],
    [p("Both routes show five semesters despite different credits."), p("Low"), p("Correct ceiling at 30 credits per term")],
]
table = Table(confusions, colWidths=[82 * mm, 22 * mm, 55 * mm], repeatRows=1)
table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), FOREST),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F8F5")]),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [table, Spacer(1, 7 * mm), p("Selected fix", "H2Brand")]
story += [p("The student result now contains a visible credit-traceability block and restores the payment deadline to the header.")]

breakdown = [
    [p("Base already confirmed"), p("78", "Metric")],
    [p("Two courses confirmed now"), p("+12", "Metric")],
    [p("One proposal returned"), p("+0", "Metric")],
    [p("Total recognized", "H2Brand"), p("90", "Metric")],
]
bt = Table(breakdown, colWidths=[112 * mm, 45 * mm])
bt.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), SAGE),
    ("GRID", (0, 0), (-1, -1), 0.6, colors.HexColor("#C7D6CC")),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ("LINEABOVE", (0, -1), (-1, -1), 1.6, GREEN),
]))
story += [bt, Spacer(1, 7 * mm), p("The interface also states: No AI proposal was added by itself.", "QuoteBrand")]
story += [
    PageBreak(),
    p("4. Acceptance evidence", "H1Brand"),
    p("Automated verification", "H2Brand"),
    p("The final source passed TypeScript validation, the Vite production build, and nine tests covering rationale rules, gate behavior, returned-credit exclusion, deterministic arithmetic, API allowlisting, response-shape compatibility, provenance, and visible safety boundaries."),
    p("Production verification", "H2Brand"),
    p("The final Vercel deployment was exercised through the complete evaluator flow and Diego's resulting view. The production accessibility tree exposed the September 18 deadline and the full 78 + 12 + 0 = 90 breakdown."),
    p("Diego's final reading", "H2Brand"),
    p("I can now reproduce the transfer-credit total: 78 were already confirmed, two courses add 12, and the returned course adds zero. I can compare the consequences without treating the less expensive route as a command. I still need an evidence-request owner in a future pilot, but I know what was counted and what was not.", "QuoteBrand"),
    p("Final boundary check", "H2Brand"),
    p("The product continues to avoid rankings, admission or outcome predictions, automatic AI approval, invented financial support, and removal of an unaffordable route. Diego may reject both routes."),
    Spacer(1, 8 * mm),
    KeepTogether([
        p("Result: PASS WITH ONE PERSONA-DRIVEN CORRECTION", "H2Brand"),
        p("Highest-risk confusion fixed, production verified, and remaining pilot requirement recorded."),
    ]),
]

doc.build(story)
print(OUTPUT)
