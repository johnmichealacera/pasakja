#!/usr/bin/env python3
"""Generate a print-ready PDF matching create-pasakja-passenger-survey.gs."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUTPUT = Path(__file__).with_name("pasakja-passenger-survey.pdf")

AGE_CHOICES = [
    "Under 18",
    "18–24",
    "25–34",
    "35–44",
    "45–54",
    "55 or older",
]

MANUAL_SECTION = {
    "title": "Manual riding today / Ang manwal nga pag-book karon",
    "help": (
        "Think about how people usually get rides WITHOUT a dedicated app "
        "(street hail, text, Facebook, etc.).\n"
        "Hunahunaa kung unsa may kasagaran nga paagi nga walay dedicated nga app "
        "(kuyog sa dalan, text, Facebook, ug uban pa)."
    ),
    "statements": [
        (
            "When I get rides only in manual ways (street hail, text, or social media — "
            "no dedicated ride app), it is often slow, unreliable, or inconvenient.",
            "Kung magpa-ride lang ko nga manwal (kuyog sa dalan, text, o social media — "
            "walay dedicated nga ride app), kasagaran hinay, dili kasaligan, o dili praktikal.",
        ),
        (
            "Without a digital ride system, fares and routes are unclear or hard to compare before I ride.",
            "Kung walay digital nga sistema sa ride, dili klaro ang plite ug ruta o lisod ikompara sa wala pa koy sakay.",
        ),
        (
            "Relying on manual ride booking makes it harder to verify drivers or share trip details for safety.",
            "Ang manwal nga pag-book sa ride makasamok sa pag-verify sa drayber o pagpaambit sa detalye sa biyahe alang sa kaluwasan.",
        ),
        (
            "My area needs a digital ride-booking system like Pasakja instead of depending only on manual methods.",
            "Ang among dapit nanginahanglan og digital nga sistema sa pag-book og ride sama sa Pasakja imbes nga manwal nga paagi lang.",
        ),
        (
            "Overall, the current situation — without a reliable digital ride system — is not good enough for passengers like me.",
            "Kinatibuk-an, ang kahimtang karon nga walay kasaligan nga digital nga sistema sa ride dili igo alang sa mga pasahero sama nako.",
        ),
    ],
}

PASAKJA_SECTION = {
    "title": "Pasakja app experience / Kasinatian sa Pasakja",
    "help": (
        "Rate your experience using the Pasakja app.\n"
        "I-rate ang imong kasinatian sa paggamit sa Pasakja."
    ),
    "statements": [
        (
            "Booking a ride in Pasakja was quick and easy.",
            "Sayon ug paspas ang pag-book og ride sa Pasakja.",
        ),
        (
            "The app screens were easy to understand.",
            "Sayon sabton ang mga screen sa app.",
        ),
        (
            "Pickup and drop-off locations on the map felt accurate (GPS).",
            "Tukma ang pickup ug drop-off nga lokasyon sa mapa (GPS).",
        ),
        (
            "Trip details (fare estimate, distance, or time) were clear before I confirmed.",
            "Klaro ang detalye sa biyahe (tantiya sa bayad, gilay-on, o oras) sa wala pa nako kumpirmahon.",
        ),
        (
            "Waiting for a driver to accept felt reasonable.",
            "Reasonable ang pagpaabot nga modawat ang drayber.",
        ),
        (
            "The ride experience matched what the app showed (driver, route, or status).",
            "Ang kasinatian sa biyahe parehas sa gipakita sa app (drayber, ruta, o status).",
        ),
        (
            "Live tracking / trip updates were helpful during the ride.",
            "Tabang ang live tracking / update sa biyahe sa panahon sa biyahe.",
        ),
        (
            "Notifications (requests, acceptance, arrival) were timely and useful.",
            "Tukma ug kapuslanon ang mga notification (hangyo, pagdawat, pag-abot).",
        ),
        (
            "I felt safe enough using Pasakja for transportation.",
            "Luwas gihapon ko sa paggamit sa Pasakja para sa transportasyon.",
        ),
        (
            "Pasakja felt more convenient than non-app ways (street hail / text / social media).",
            "Mas praktikal ang Pasakja kaysa sa paagi nga walay app (kuyog sa dalan / text / social media).",
        ),
        (
            "I would use Pasakja again if it were available when I need a ride.",
            "Gamiton nako pag-usab ang Pasakja kung anaa kini kung nanginahanglan ko og ride.",
        ),
        (
            "Overall, I am satisfied with Pasakja as a digital ride-booking system.",
            "Kinatibuk-an, kontento ko sa Pasakja isip digital nga sistema sa pag-book og ride.",
        ),
    ],
}


def build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "SurveyTitle",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            spaceAfter=10,
        ),
        "subtitle": ParagraphStyle(
            "SurveySubtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=13,
            spaceAfter=6,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            spaceBefore=10,
            spaceAfter=6,
            textColor=colors.HexColor("#1a1a1a"),
        ),
        "help": ParagraphStyle(
            "Help",
            parent=base["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=9,
            leading=12,
            spaceAfter=8,
            textColor=colors.HexColor("#333333"),
        ),
        "question": ParagraphStyle(
            "Question",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            spaceAfter=2,
        ),
        "bisaya": ParagraphStyle(
            "Bisaya",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=12,
            spaceAfter=4,
            textColor=colors.HexColor("#222222"),
        ),
        "choice": ParagraphStyle(
            "Choice",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            leftIndent=8,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=10,
            textColor=colors.HexColor("#555555"),
        ),
    }


def scale_table() -> Table:
    data = [
        ["1", "2", "3", "4", "5"],
        ["○", "○", "○", "○", "○"],
    ]
    table = Table(data, colWidths=[1.35 * cm] * 5, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("FONTSIZE", (0, 1), (-1, 1), 12),
                ("BOX", (0, 0), (-1, -1), 0.5, colors.black),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.black),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def age_choices_table(styles: dict[str, ParagraphStyle]) -> Table:
    rows = [[Paragraph(f"☐ {choice}", styles["choice"])] for choice in AGE_CHOICES]
    table = Table(rows, colWidths=[16.5 * cm], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 1),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ]
        )
    )
    return table


def likert_block(
    number: int,
    english: str,
    bisaya: str,
    styles: dict[str, ParagraphStyle],
) -> list:
    scale_labels = Table(
        [
            [
                Paragraph(
                    "<b>1</b> Strongly disagree — Dili gyud ko mouyon",
                    styles["footer"],
                ),
                Paragraph(
                    "<b>5</b> Strongly agree — Gayud nga mouyon ko",
                    styles["footer"],
                ),
            ]
        ],
        colWidths=[8.25 * cm, 8.25 * cm],
        hAlign="LEFT",
    )
    scale_labels.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return [
        Paragraph(f"{number}. {english}", styles["question"]),
        Paragraph(bisaya, styles["bisaya"]),
        scale_labels,
        scale_table(),
        Spacer(1, 0.22 * cm),
    ]


def section_block(
    section: dict,
    styles: dict[str, ParagraphStyle],
    start_number: int,
) -> tuple[list, int]:
    flow: list = [
        Paragraph(section["title"], styles["section"]),
        Paragraph(section["help"].replace("\n", "<br/>"), styles["help"]),
    ]
    number = start_number
    for english, bisaya in section["statements"]:
        flow.extend(likert_block(number, english, bisaya, styles))
        number += 1
    return flow, number


def add_footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawString(
        doc.leftMargin,
        1.0 * cm,
        "Pasakja passenger survey — print version (matches Google Form script)",
    )
    canvas.drawRightString(
        A4[0] - doc.rightMargin,
        1.0 * cm,
        f"Page {canvas.getPageNumber()}",
    )
    canvas.restoreState()


def main() -> None:
    styles = build_styles()
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.6 * cm,
        title="Pasakja Passenger Survey",
        author="Pasakja",
    )

    story: list = [
        Paragraph("Pasakja — Passenger survey (Chapter 5)", styles["title"]),
        Paragraph(
            "Research survey (~3 minutes). Rate how much you agree (1–5).<br/>"
            "Survey para sa panukiduki (~3 minutos). Rate kung unsa ka mouyon (1–5).",
            styles["subtitle"],
        ),
        Paragraph(
            "<b>SCALE / SUKDANAN</b><br/>"
            "1 = Strongly disagree — Dili gyud ko mouyon<br/>"
            "2 = Disagree — Dili ko mouyon<br/>"
            "3 = Neutral — Neutral<br/>"
            "4 = Agree — Mouyon ko<br/>"
            "5 = Strongly agree — Gayud nga mouyon ko",
            styles["subtitle"],
        ),
        Spacer(1, 0.2 * cm),
        KeepTogether(
            [
                Paragraph(
                    "1. How old are you?<br/>Pila na imong edad?",
                    styles["question"],
                ),
                age_choices_table(styles),
                Spacer(1, 0.25 * cm),
            ]
        ),
    ]

    next_number = 2
    manual_flow, next_number = section_block(MANUAL_SECTION, styles, next_number)
    story.extend(manual_flow)
    story.append(Spacer(1, 0.15 * cm))
    pasakja_flow, _ = section_block(PASAKJA_SECTION, styles, next_number)
    story.extend(pasakja_flow)
    story.append(Spacer(1, 0.35 * cm))
    story.append(
        Paragraph(
            "Thank you / Salamat. For digital submission, use the Google Form link from your instructor.",
            styles["footer"],
        )
    )

    doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    main()
