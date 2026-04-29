#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MOMAH KPIs 2026 - Arabic RTL PDF Report Generator
وزارة البلديات والإسكان - لوحة مؤشرات قطاع التخطيط والتطوير
"""

import os
import sys

# ─── Arabic text rendering ────────────────────────────────────────────────────
import arabic_reshaper
from bidi.algorithm import get_display

def ar(text):
    """Reshape + apply bidi on Arabic text for correct RTL rendering."""
    if not text:
        return ""
    reshaped = arabic_reshaper.reshape(str(text))
    return get_display(reshaped)

# ─── ReportLab imports ────────────────────────────────────────────────────────
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas as pdfcanvas

# ─── Font registration ────────────────────────────────────────────────────────
FONT_REGULAR = "ArabicFont"
FONT_BOLD    = "ArabicFontBold"

FONTS_DIR = r"C:\Windows\Fonts"
_font_candidates = [
    ("tahoma.ttf",  "tahomabd.ttf"),
    ("arial.ttf",   "arialbd.ttf"),
    ("calibri.ttf", "calibrib.ttf"),
]

_registered = False
for regular, bold in _font_candidates:
    rp = os.path.join(FONTS_DIR, regular)
    bp = os.path.join(FONTS_DIR, bold)
    if os.path.exists(rp) and os.path.exists(bp):
        pdfmetrics.registerFont(TTFont(FONT_REGULAR, rp))
        pdfmetrics.registerFont(TTFont(FONT_BOLD, bp))
        _registered = True
        print(f"[font] Using: {regular} / {bold}")
        break

if not _registered:
    raise RuntimeError("No suitable Arabic TTF font found in C:\\Windows\\Fonts\\")

# ─── Color palette ────────────────────────────────────────────────────────────
DARK_GREEN   = colors.HexColor("#00563F")
LIGHT_GREEN  = colors.HexColor("#E8F5E9")
WHITE        = colors.white
BLACK        = colors.black
GREY_LIGHT   = colors.HexColor("#F5F5F5")
GREY_BORDER  = colors.HexColor("#CCCCCC")
ACCENT_GOLD  = colors.HexColor("#D4AF37")

PAGE_W, PAGE_H = A4   # 595.27 x 841.89 pt

# ─── Data ─────────────────────────────────────────────────────────────────────
BI_DATA = [
    {"تصنيف":"تطوير منصات","مدير المشروع":"م. خالد الزهراني","التكلفة":"4,250,000","المتبقي":"1,200,000","الحالة":"قيد التنفيذ","الجهة":"شركة تقنية المعلومات","المدة":"12 شهر","البدء":"2026-01-15","الانتهاء":"2027-01-14","الإنجاز":72},
    {"تصنيف":"خدمات استشارية","مدير المشروع":"أ. سارة العتيبي","التكلفة":"1,800,000","المتبقي":"450,000","الحالة":"قيد التنفيذ","الجهة":"بيت الخبرة للاستشارات","المدة":"9 أشهر","البدء":"2026-02-01","الانتهاء":"2026-10-31","الإنجاز":85},
    {"تصنيف":"دعم قرار","مدير المشروع":"م. عبدالله الشهري","التكلفة":"3,600,000","المتبقي":"2,800,000","الحالة":"مرحلة الترسية","الجهة":"شركة الحلول الذكية","المدة":"18 شهر","البدء":"2026-03-01","الانتهاء":"2027-08-31","الإنجاز":15},
    {"تصنيف":"بنك بيانات","مدير المشروع":"م. ريم القحطاني","التكلفة":"5,100,000","المتبقي":"600,000","الحالة":"مكتمل","الجهة":"شركة البيانات الرقمية","المدة":"14 شهر","البدء":"2025-08-10","الانتهاء":"2026-10-09","الإنجاز":95},
    {"تصنيف":"جودة بيانات","مدير المشروع":"أ. نوال الحربي","التكلفة":"2,250,000","المتبقي":"1,000,000","الحالة":"قيد التنفيذ","الجهة":"شركة جودة البيانات","المدة":"10 أشهر","البدء":"2026-01-20","الانتهاء":"2026-11-19","الإنجاز":55},
    {"تصنيف":"استطلاعات رأي","مدير المشروع":"م. فهد المالكي","التكلفة":"1,400,000","المتبقي":"350,000","الحالة":"قيد التنفيذ","الجهة":"شركة الاستبيانات الرقمية","المدة":"8 أشهر","البدء":"2026-02-15","الانتهاء":"2026-10-14","الإنجاز":68},
    {"تصنيف":"دراسات سوق","مدير المشروع":"أ. منى الدوسري","التكلفة":"2,900,000","المتبقي":"2,400,000","الحالة":"بدء حديث","الجهة":"شركة الدراسات العقارية","المدة":"11 شهر","البدء":"2026-03-15","الانتهاء":"2027-02-14","الإنجاز":12},
    {"تصنيف":"بنك الخبراء","مدير المشروع":"م. ماجد الغامدي","التكلفة":"950,000","المتبقي":"200,000","الحالة":"قيد التنفيذ","الجهة":"الخبرة الاستشارية","المدة":"6 أشهر","البدء":"2026-01-10","الانتهاء":"2026-07-09","الإنجاز":78},
    {"تصنيف":"تطوير منصات","مدير المشروع":"م. هند السبيعي","التكلفة":"3,750,000","المتبقي":"1,500,000","الحالة":"قيد التنفيذ","الجهة":"تك سوليوشنز","المدة":"13 شهر","البدء":"2025-12-01","الانتهاء":"2026-12-31","الإنجاز":60},
    {"تصنيف":"خدمات مدارة","مدير المشروع":"أ. بدر العنزي","التكلفة":"2,100,000","المتبقي":"850,000","الحالة":"متأخر","الجهة":"شركة الإدارة الذكية","المدة":"10 أشهر","البدء":"2025-11-01","الانتهاء":"2026-08-31","الإنجاز":40},
]

OPS_DATA = [
    {"المشروع":"مراقبة جودة الخدمات البلدية","البند":"إعداد منهجية القياس","نوع المخرج":"وثيقة","الجهة المسندة":"شركة الأداء التشغيلي","الحالة":"مكتمل","حالة الوثائق":"معتمدة","الاستحقاق":"2026-02-28","التسليم":"2026-02-25","المسؤول":"م. سلطان الحارثي","الوزن":"15%"},
    {"المشروع":"لوحة مؤشرات المدن","البند":"تصميم النموذج الأولي","نوع المخرج":"تقرير + نموذج","الجهة المسندة":"تك سوليوشنز","الحالة":"على المسار","حالة الوثائق":"قيد المراجعة","الاستحقاق":"2026-04-15","التسليم":"-","المسؤول":"م. عمر القرني","الوزن":"20%"},
    {"المشروع":"تقييم أداء البلديات","البند":"جمع البيانات الميدانية","نوع المخرج":"قاعدة بيانات","الجهة المسندة":"شركة المسح والإحصاء","الحالة":"متأخر","حالة الوثائق":"مرفوضة","الاستحقاق":"2026-03-20","التسليم":"-","المسؤول":"أ. لمى الزيدي","الوزن":"25%"},
    {"المشروع":"مؤشر رضا المستفيدين","البند":"إطلاق الاستبيان","نوع المخرج":"منصة","الجهة المسندة":"شركة التجربة الرقمية","الحالة":"على المسار","حالة الوثائق":"معتمدة","الاستحقاق":"2026-05-01","التسليم":"-","المسؤول":"م. ناصر العمري","الوزن":"18%"},
    {"المشروع":"مراقبة جودة الخدمات البلدية","البند":"تطوير لوحة العرض","نوع المخرج":"تطبيق ويب","الجهة المسندة":"شركة الأداء التشغيلي","الحالة":"على المسار","حالة الوثائق":"قيد المراجعة","الاستحقاق":"2026-06-30","التسليم":"-","المسؤول":"م. سلطان الحارثي","الوزن":"22%"},
    {"المشروع":"تقييم أداء البلديات","البند":"إعداد التقرير الربعي","نوع المخرج":"تقرير","الجهة المسندة":"شركة المسح والإحصاء","الحالة":"مكتمل","حالة الوثائق":"معتمدة","الاستحقاق":"2026-03-31","التسليم":"2026-03-28","المسؤول":"أ. لمى الزيدي","الوزن":"10%"},
    {"المشروع":"لوحة مؤشرات المدن","البند":"اختبار النظام","نوع المخرج":"تقرير اختبار","الجهة المسندة":"تك سوليوشنز","الحالة":"على المسار","حالة الوثائق":"قيد المراجعة","الاستحقاق":"2026-05-20","التسليم":"-","المسؤول":"م. عمر القرني","الوزن":"15%"},
    {"المشروع":"مؤشر رضا المستفيدين","البند":"تحليل النتائج","نوع المخرج":"تقرير تحليلي","الجهة المسندة":"شركة التجربة الرقمية","الحالة":"متأخر","حالة الوثائق":"مرفوضة","الاستحقاق":"2026-04-10","التسليم":"-","المسؤول":"م. ناصر العمري","الوزن":"20%"},
    {"المشروع":"مراقبة الخدمات الحضرية","البند":"وضع المعايير","نوع المخرج":"وثيقة معايير","الجهة المسندة":"بيت الخبرة الحضرية","الحالة":"مكتمل","حالة الوثائق":"معتمدة","الاستحقاق":"2026-02-15","التسليم":"2026-02-12","المسؤول":"م. وليد الفهد","الوزن":"12%"},
    {"المشروع":"مراقبة الخدمات الحضرية","البند":"التدريب وبناء القدرات","نوع المخرج":"برنامج تدريبي","الجهة المسندة":"بيت الخبرة الحضرية","الحالة":"على المسار","حالة الوثائق":"قيد المراجعة","الاستحقاق":"2026-07-15","التسليم":"-","المسؤول":"م. وليد الفهد","الوزن":"14%"},
]

STRATEGY_DATA = [
    {"تصنيف":"تخطيط استراتيجي","مدير المشروع":"م. إبراهيم آل ثنيان","التكلفة":"6,200,000","المتبقي":"2,500,000","الحالة":"قيد التنفيذ","الجهة":"شركة الاستراتيجيات الكبرى","المدة":"15 شهر","البدء":"2025-10-01","الانتهاء":"2026-12-31","الإنجاز":62},
    {"تصنيف":"إدارة المخاطر","مدير المشروع":"أ. أحمد العسيري","التكلفة":"1,950,000","المتبقي":"400,000","الحالة":"قيد التنفيذ","الجهة":"شركة المخاطر المؤسسية","المدة":"9 أشهر","البدء":"2026-01-05","الانتهاء":"2026-10-04","الإنجاز":80},
    {"تصنيف":"استمرارية الأعمال","مدير المشروع":"م. عبدالعزيز اليامي","التكلفة":"2,750,000","المتبقي":"1,300,000","الحالة":"قيد التنفيذ","الجهة":"شركة استمرارية الأعمال","المدة":"12 شهر","البدء":"2026-01-01","الانتهاء":"2026-12-31","الإنجاز":50},
    {"تصنيف":"مكتب إدارة","مدير المشروع":"أ. غادة الشمري","التكلفة":"3,400,000","المتبقي":"500,000","الحالة":"مكتمل","الجهة":"شركة إدارة المشاريع","المدة":"14 شهر","البدء":"2025-07-01","الانتهاء":"2026-08-31","الإنجاز":92},
    {"تصنيف":"توثيق إجراءات","مدير المشروع":"م. تركي البقمي","التكلفة":"1,650,000","المتبقي":"950,000","الحالة":"قيد التنفيذ","الجهة":"شركة التوثيق المهني","المدة":"8 أشهر","البدء":"2026-02-10","الانتهاء":"2026-10-09","الإنجاز":42},
    {"تصنيف":"تخطيط استراتيجي","مدير المشروع":"أ. هيا المطيري","التكلفة":"4,800,000","المتبقي":"3,800,000","الحالة":"بدء حديث","الجهة":"شركة الرؤى الاستراتيجية","المدة":"16 شهر","البدء":"2026-03-01","الانتهاء":"2027-06-30","الإنجاز":18},
    {"تصنيف":"مراجعة استراتيجية","مدير المشروع":"م. سعد الجهني","التكلفة":"2,200,000","المتبقي":"850,000","الحالة":"قيد التنفيذ","الجهة":"شركة المراجعة الاستراتيجية","المدة":"10 أشهر","البدء":"2026-01-20","الانتهاء":"2026-11-19","الإنجاز":58},
    {"تصنيف":"حصر أراضي","مدير المشروع":"م. مشعل الرشيدي","التكلفة":"5,500,000","المتبقي":"2,000,000","الحالة":"قيد التنفيذ","الجهة":"شركة المساحة والتخطيط","المدة":"15 شهر","البدء":"2025-12-01","الانتهاء":"2027-02-28","الإنجاز":65},
    {"تصنيف":"استشارات فنية","مدير المشروع":"أ. أمل الصاعدي","التكلفة":"1,750,000","المتبقي":"600,000","الحالة":"قيد التنفيذ","الجهة":"بيت الاستشارات الفنية","المدة":"7 أشهر","البدء":"2026-02-01","الانتهاء":"2026-08-31","الإنجاز":70},
    {"تصنيف":"تحول قطاعي","مدير المشروع":"م. يزيد الخالدي","التكلفة":"7,800,000","المتبقي":"4,200,000","الحالة":"متأخر","الجهة":"شركة التحول الرقمي","المدة":"18 شهر","البدء":"2025-09-01","الانتهاء":"2027-02-28","الإنجاز":35},
]

PERFORMANCE_DATA = [
    {"الكود":"CK-04","الاسم":"تحقيق مستهدفات الشركاء","النوع":"تنفيذي","المستهدف":"98%","الفعلي":"120%","الحالة":"أخضر","القطاع":"الاستراتيجية والتحول"},
    {"الكود":"KPI-02","الاسم":"تقارير تقدم المبادرات","النوع":"خدمي بالقطاع","المستهدف":"4","الفعلي":"-","الحالة":"رمادي","القطاع":"البرامج والأداء"},
    {"الكود":"KPI-03","الاسم":"التقارير الشهرية لـ SMO","النوع":"خدمي بالقطاع","المستهدف":"12","الفعلي":"-","الحالة":"رمادي","القطاع":"العمليات"},
    {"الكود":"KPI-04","الاسم":"التزام القطاعات بتحديث المؤشرات","النوع":"خدمي بالقطاع","المستهدف":"90%","الفعلي":"-","الحالة":"رمادي","القطاع":"المنتجات"},
    {"الكود":"KPI-05","الاسم":"الالتزام بنماذج الحوكمة","النوع":"خدمي بالقطاع","المستهدف":"90%","الفعلي":"-","الحالة":"رمادي","القطاع":"التجاري"},
    {"الكود":"KPI-06","الاسم":"التقارير التحليلية للقيادات","النوع":"خدمي بالقطاع","المستهدف":"2","الفعلي":"-","الحالة":"رمادي","القطاع":"البرامج والأداء"},
    {"الكود":"KPI-07","الاسم":"مؤشر إعداد خطة التشغيل السنوية","النوع":"تنفيذي","المستهدف":"100%","الفعلي":"-","الحالة":"رمادي","القطاع":"الاستراتيجية والتحول"},
    {"الكود":"KPI-08","الاسم":"نسبة الالتزام بالموازنة","النوع":"مالي","المستهدف":"90%","الفعلي":"-","الحالة":"رمادي","القطاع":"التجاري"},
]

INTERVENTIONS_DATA = [
    {"العنوان":"تدخل في مؤشر الالتزام بالتقارير","الوصف":"نسبة الالتزام أقل من 60% للشهر الثالث","الأولوية":"عالية","الحالة":"مفتوح","القطاع":"التجاري","التاريخ":"2026-04-05"},
    {"العنوان":"تصعيد تأخر مشروع التحول الرقمي","الوصف":"تأخر 3 أشهر عن الجدول المخطط","الأولوية":"حرجة","الحالة":"قيد التنفيذ","القطاع":"الاستراتيجية والتحول","التاريخ":"2026-04-02"},
    {"العنوان":"معالجة انخفاض رضا المستفيدين","الوصف":"نسبة الرضا انخفضت إلى 72%","الأولوية":"متوسطة","الحالة":"محلول","القطاع":"العمليات","التاريخ":"2026-03-28"},
    {"العنوان":"تحسين جودة البيانات المدخلة","الوصف":"نسبة الأخطاء في الإدخال تجاوزت 15%","الأولوية":"منخفضة","الحالة":"مفتوح","القطاع":"المنتجات","التاريخ":"2026-04-01"},
]

# ─── Helper: paragraph with Arabic text ──────────────────────────────────────
def ar_para(text, style):
    return Paragraph(ar(text), style)

# ─── Styles ───────────────────────────────────────────────────────────────────
def make_styles():
    styles = {}

    styles["cover_title"] = ParagraphStyle(
        "cover_title",
        fontName=FONT_BOLD,
        fontSize=28,
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=38,
        spaceAfter=16,
    )
    styles["cover_sub1"] = ParagraphStyle(
        "cover_sub1",
        fontName=FONT_BOLD,
        fontSize=20,
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=28,
        spaceAfter=12,
    )
    styles["cover_sub2"] = ParagraphStyle(
        "cover_sub2",
        fontName=FONT_REGULAR,
        fontSize=16,
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=24,
        spaceAfter=10,
    )
    styles["cover_date"] = ParagraphStyle(
        "cover_date",
        fontName=FONT_REGULAR,
        fontSize=14,
        textColor=ACCENT_GOLD,
        alignment=TA_CENTER,
        leading=20,
    )
    styles["section_header"] = ParagraphStyle(
        "section_header",
        fontName=FONT_BOLD,
        fontSize=16,
        textColor=DARK_GREEN,
        alignment=TA_RIGHT,
        leading=22,
        spaceAfter=8,
        spaceBefore=6,
    )
    styles["body_ar"] = ParagraphStyle(
        "body_ar",
        fontName=FONT_REGULAR,
        fontSize=9,
        textColor=BLACK,
        alignment=TA_RIGHT,
        leading=13,
    )
    styles["cell_ar"] = ParagraphStyle(
        "cell_ar",
        fontName=FONT_REGULAR,
        fontSize=8,
        textColor=BLACK,
        alignment=TA_RIGHT,
        leading=11,
    )
    styles["cell_ar_bold"] = ParagraphStyle(
        "cell_ar_bold",
        fontName=FONT_BOLD,
        fontSize=8,
        textColor=BLACK,
        alignment=TA_RIGHT,
        leading=11,
    )
    styles["kpi_label"] = ParagraphStyle(
        "kpi_label",
        fontName=FONT_BOLD,
        fontSize=9,
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=13,
    )
    styles["kpi_value"] = ParagraphStyle(
        "kpi_value",
        fontName=FONT_BOLD,
        fontSize=18,
        textColor=WHITE,
        alignment=TA_CENTER,
        leading=24,
    )
    styles["footer_style"] = ParagraphStyle(
        "footer_style",
        fontName=FONT_REGULAR,
        fontSize=8,
        textColor=colors.HexColor("#666666"),
        alignment=TA_CENTER,
        leading=11,
    )
    return styles

STYLES = make_styles()

# ─── Page canvas callback (footer + watermark line) ──────────────────────────
class FooterCanvas(pdfcanvas.Canvas):
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
            self._draw_footer(self._pageNumber, num_pages)
            super().showPage()
        super().save()

    def _draw_footer(self, page_num, total_pages):
        if page_num == 1:
            return  # No footer on cover
        self.saveState()
        # Footer line
        self.setStrokeColor(DARK_GREEN)
        self.setLineWidth(0.5)
        self.line(2*cm, 1.5*cm, PAGE_W - 2*cm, 1.5*cm)
        # Footer text
        self.setFont(FONT_REGULAR, 8)
        self.setFillColor(colors.HexColor("#555555"))
        footer_text = ar(f"وزارة البلديات والإسكان | 2026")
        self.drawCentredString(PAGE_W / 2, 1.1*cm, footer_text)
        page_str = ar(f"صفحة {page_num} من {total_pages}")
        self.drawRightString(PAGE_W - 2*cm, 1.1*cm, page_str)
        self.restoreState()


# ─── Build table with Arabic headers ─────────────────────────────────────────
def make_table(col_headers, rows_data, col_widths, style_ext=None):
    """
    col_headers : list of Arabic strings (displayed RTL, right→left = first col)
    rows_data   : list of lists matching col_headers order
    """
    # Header row
    header = [ar_para(h, ParagraphStyle(
        "th", fontName=FONT_BOLD, fontSize=8, textColor=WHITE,
        alignment=TA_CENTER, leading=11
    )) for h in col_headers]

    table_data = [header]
    for i, row in enumerate(rows_data):
        bg = WHITE if i % 2 == 0 else LIGHT_GREEN
        table_data.append([
            ar_para(str(cell), STYLES["cell_ar"]) for cell in row
        ])

    tbl = Table(table_data, colWidths=col_widths, repeatRows=1)

    base_style = [
        ("BACKGROUND",  (0, 0), (-1, 0),  DARK_GREEN),
        ("TEXTCOLOR",   (0, 0), (-1, 0),  WHITE),
        ("GRID",        (0, 0), (-1, -1), 0.4, GREY_BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, LIGHT_GREEN]),
        ("VALIGN",      (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN",       (0, 0), (-1, -1), "CENTER"),
        ("TOPPADDING",  (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING",(0, 0), (-1, -1), 4),
    ]
    if style_ext:
        base_style.extend(style_ext)

    tbl.setStyle(TableStyle(base_style))
    return tbl


# ─── PAGE 1 – Cover ───────────────────────────────────────────────────────────
def build_cover():
    """Returns a list of flowables for the cover page."""
    # We'll use a full-page background by drawing on canvas.
    # We approximate with a colored table spanning the page.
    story = []

    # Big colored block – simulate with a table that fills the page
    cover_content = [
        Spacer(1, 6*cm),
        ar_para("لوحة مؤشرات قطاع التخطيط والتطوير", STYLES["cover_title"]),
        Spacer(1, 0.8*cm),
        HRFlowable(width="60%", thickness=1, color=ACCENT_GOLD, hAlign="CENTER"),
        Spacer(1, 0.8*cm),
        ar_para("وزارة البلديات والإسكان", STYLES["cover_sub1"]),
        Spacer(1, 0.5*cm),
        ar_para("الفترة الثانية 2026", STYLES["cover_sub2"]),
        Spacer(1, 0.5*cm),
        ar_para("27 أبريل 2026", STYLES["cover_date"]),
        Spacer(1, 4*cm),
    ]
    story.extend(cover_content)
    story.append(PageBreak())
    return story


# ─── PAGE 2 – Executive Summary ───────────────────────────────────────────────
def build_summary():
    story = []
    story.append(ar_para("ملخص تنفيذي", STYLES["section_header"]))
    story.append(HRFlowable(width="100%", thickness=1, color=DARK_GREEN))
    story.append(Spacer(1, 0.5*cm))

    # KPI boxes row
    kpi_items = [
        ("إجمالي المشاريع",  "30"),
        ("متوسط الإنجاز",    "58%"),
        ("إجمالي التكلفة",   "66,100,000"),
        ("المتأخرة",          "4"),
    ]

    kpi_cell_style = [
        ("BACKGROUND",   (0, 0), (-1, -1), DARK_GREEN),
        ("ALIGN",        (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
        ("GRID",         (0, 0), (-1, -1), 1, WHITE),
        ("TOPPADDING",   (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 12),
        ("ROUNDEDCORNERS", [5]),
    ]

    kpi_row = []
    for label, val in kpi_items:
        cell = [
            ar_para(val,   STYLES["kpi_value"]),
            ar_para(label, STYLES["kpi_label"]),
        ]
        kpi_row.append(cell)

    box_w = (PAGE_W - 4*cm) / 4
    kpi_tbl = Table([kpi_row], colWidths=[box_w]*4)
    kpi_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), DARK_GREEN),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
        ("VALIGN",        (0, 0), (-1, -1), "MIDDLE"),
        ("GRID",          (0, 0), (-1, -1), 2, WHITE),
        ("TOPPADDING",    (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(kpi_tbl)
    story.append(Spacer(1, 0.8*cm))

    # Entity summary table
    story.append(ar_para("توزيع المشاريع حسب الجهة", STYLES["section_header"]))
    story.append(Spacer(1, 0.3*cm))

    entity_headers = ["عدد المشاريع", "الجهة"]
    entity_rows = [
        ["10", "مركز ذكاء الأعمال ودعم القرار"],
        ["10", "مركز مراقبة الأداء التشغيلي"],
        ["10", "وكالة التخطيط الاستراتيجي"],
    ]
    col_w = (PAGE_W - 4*cm) / 2
    entity_tbl = make_table(entity_headers, entity_rows, [col_w, col_w])
    story.append(entity_tbl)
    story.append(Spacer(1, 0.8*cm))

    # Brief description
    desc_style = ParagraphStyle(
        "desc", fontName=FONT_REGULAR, fontSize=10, textColor=colors.HexColor("#333333"),
        alignment=TA_RIGHT, leading=16, spaceAfter=6
    )
    story.append(ar_para(
        "يعرض هذا التقرير لوحة شاملة لمؤشرات الأداء الرئيسية لقطاع التخطيط والتطوير في وزارة البلديات والإسكان للفترة الثانية من عام 2026. يشمل التقرير بيانات المشاريع المتعلقة بمراكز ذكاء الأعمال والعمليات التشغيلية والتخطيط الاستراتيجي، إضافة إلى مؤشرات الأداء والتدخلات الإدارية.",
        desc_style
    ))

    story.append(PageBreak())
    return story


# ─── Generic data-table page builder ─────────────────────────────────────────
def build_data_page(title, col_headers, rows, col_widths):
    story = []
    story.append(ar_para(title, STYLES["section_header"]))
    story.append(HRFlowable(width="100%", thickness=1, color=DARK_GREEN))
    story.append(Spacer(1, 0.4*cm))
    tbl = make_table(col_headers, rows, col_widths)
    story.append(tbl)
    story.append(PageBreak())
    return story


# ─── Build all page content ───────────────────────────────────────────────────
def build_story():
    story = []

    # PAGE 1 – Cover
    story.extend(build_cover())

    # PAGE 2 – Executive Summary
    story.extend(build_summary())

    # ── PAGE 3 – BI Data ──────────────────────────────────────────────────────
    usable_w = PAGE_W - 4*cm
    bi_headers = ["الإنجاز%", "الانتهاء", "البدء", "المدة", "الحالة", "التكلفة", "مدير المشروع", "التصنيف"]
    bi_rows = []
    for d in BI_DATA:
        bi_rows.append([
            f"{d['الإنجاز']}%",
            d["الانتهاء"],
            d["البدء"],
            d["المدة"],
            d["الحالة"],
            d["التكلفة"],
            d["مدير المشروع"],
            d["تصنيف"],
        ])
    # 8 cols – distribute proportionally
    bi_col_w = [0.07, 0.10, 0.10, 0.08, 0.10, 0.12, 0.16, 0.13]
    # normalize
    total = sum(bi_col_w)
    bi_col_w = [usable_w * w / total for w in bi_col_w]
    story.extend(build_data_page(
        "مركز ذكاء الأعمال ودعم القرار",
        bi_headers, bi_rows, bi_col_w
    ))

    # ── PAGE 4 – OPS Data ─────────────────────────────────────────────────────
    ops_headers = ["الوزن", "المسؤول", "التسليم", "الاستحقاق", "حالة الوثائق", "الحالة", "الجهة المسندة", "البند", "المشروع"]
    ops_rows = []
    for d in OPS_DATA:
        ops_rows.append([
            d["الوزن"],
            d["المسؤول"],
            d["التسليم"],
            d["الاستحقاق"],
            d["حالة الوثائق"],
            d["الحالة"],
            d["الجهة المسندة"],
            d["البند"],
            d["المشروع"],
        ])
    ops_col_w = [0.06, 0.12, 0.09, 0.09, 0.10, 0.08, 0.14, 0.12, 0.14]
    total = sum(ops_col_w)
    ops_col_w = [usable_w * w / total for w in ops_col_w]
    story.extend(build_data_page(
        "مركز مراقبة أداء العمليات التشغيلية",
        ops_headers, ops_rows, ops_col_w
    ))

    # ── PAGE 5 – Strategy Data ────────────────────────────────────────────────
    str_headers = ["الإنجاز%", "الانتهاء", "البدء", "المدة", "الحالة", "التكلفة", "مدير المشروع", "التصنيف"]
    str_rows = []
    for d in STRATEGY_DATA:
        str_rows.append([
            f"{d['الإنجاز']}%",
            d["الانتهاء"],
            d["البدء"],
            d["المدة"],
            d["الحالة"],
            d["التكلفة"],
            d["مدير المشروع"],
            d["تصنيف"],
        ])
    str_col_w = bi_col_w  # same structure
    story.extend(build_data_page(
        "وكالة التخطيط الاستراتيجي",
        str_headers, str_rows, str_col_w
    ))

    # ── PAGE 6 – Performance KPIs ─────────────────────────────────────────────
    perf_headers = ["القطاع", "الحالة", "الفعلي", "المستهدف", "النوع", "الاسم", "الكود"]
    perf_rows = []
    for d in PERFORMANCE_DATA:
        perf_rows.append([
            d["القطاع"], d["الحالة"], d["الفعلي"],
            d["المستهدف"], d["النوع"], d["الاسم"], d["الكود"],
        ])
    perf_col_w = [0.16, 0.09, 0.09, 0.10, 0.13, 0.30, 0.09]
    total = sum(perf_col_w)
    perf_col_w = [usable_w * w / total for w in perf_col_w]
    story.extend(build_data_page(
        "مؤشرات الأداء الرئيسية",
        perf_headers, perf_rows, perf_col_w
    ))

    # ── PAGE 7 – Interventions ────────────────────────────────────────────────
    int_headers = ["التاريخ", "القطاع", "الحالة", "الأولوية", "الوصف", "العنوان"]
    int_rows = []
    for d in INTERVENTIONS_DATA:
        int_rows.append([
            d["التاريخ"], d["القطاع"], d["الحالة"],
            d["الأولوية"], d["الوصف"], d["العنوان"],
        ])
    int_col_w = [0.11, 0.14, 0.10, 0.10, 0.28, 0.24]
    total = sum(int_col_w)
    int_col_w = [usable_w * w / total for w in int_col_w]

    # Last page – no PageBreak at the end
    story.append(ar_para("التدخلات والتصعيدات الإدارية", STYLES["section_header"]))
    story.append(HRFlowable(width="100%", thickness=1, color=DARK_GREEN))
    story.append(Spacer(1, 0.4*cm))
    story.append(make_table(int_headers, int_rows, int_col_w))

    return story


# ─── Cover background drawn via onFirstPage ──────────────────────────────────
def on_first_page(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFillColor(DARK_GREEN)
    canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    # Decorative top stripe
    canvas_obj.setFillColor(ACCENT_GOLD)
    canvas_obj.rect(0, PAGE_H - 8, PAGE_W, 8, fill=1, stroke=0)
    # Decorative bottom stripe
    canvas_obj.rect(0, 0, PAGE_W, 8, fill=1, stroke=0)
    canvas_obj.restoreState()

def on_later_pages(canvas_obj, doc):
    """Draw a subtle green top bar on subsequent pages."""
    canvas_obj.saveState()
    canvas_obj.setFillColor(DARK_GREEN)
    canvas_obj.rect(0, PAGE_H - 1.2*cm, PAGE_W, 1.2*cm, fill=1, stroke=0)
    # Page header text
    canvas_obj.setFont(FONT_BOLD, 9)
    canvas_obj.setFillColor(WHITE)
    header_txt = ar("لوحة مؤشرات قطاع التخطيط والتطوير - وزارة البلديات والإسكان 2026")
    canvas_obj.drawCentredString(PAGE_W / 2, PAGE_H - 0.85*cm, header_txt)
    # Footer
    canvas_obj.setStrokeColor(DARK_GREEN)
    canvas_obj.setLineWidth(0.5)
    canvas_obj.line(2*cm, 1.5*cm, PAGE_W - 2*cm, 1.5*cm)
    canvas_obj.setFont(FONT_REGULAR, 8)
    canvas_obj.setFillColor(colors.HexColor("#555555"))
    footer_txt = ar("وزارة البلديات والإسكان | 2026")
    canvas_obj.drawCentredString(PAGE_W / 2, 1.1*cm, footer_txt)
    page_str = ar(f"صفحة {doc.page}")
    canvas_obj.drawRightString(PAGE_W - 2*cm, 1.1*cm, page_str)
    canvas_obj.restoreState()


# ─── Main ─────────────────────────────────────────────────────────────────────
def main():
    out_dir = r"C:\Users\ZahraAAlhiyai\MOMAH-KPIs2026\exports"
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "MOMAH_KPIs_2026_Report.pdf")

    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=1.8*cm,
        bottomMargin=2*cm,
        title="لوحة مؤشرات قطاع التخطيط والتطوير 2026",
        author="وزارة البلديات والإسكان",
    )

    story = build_story()

    doc.build(
        story,
        onFirstPage=on_first_page,
        onLaterPages=on_later_pages,
    )

    print(f"\n[OK] PDF generated: {out_path}")
    size_kb = os.path.getsize(out_path) // 1024
    print(f"     File size: {size_kb} KB")


if __name__ == "__main__":
    main()
