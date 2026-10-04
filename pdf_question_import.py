from __future__ import annotations

import base64
import re
from io import BytesIO

from pypdf import PdfReader

try:
    import fitz  # PyMuPDF: preserves PDF image/vector positions
except Exception:
    fitz = None


MAX_PDF_BYTES = 12 * 1024 * 1024
MAX_IMPORTED_QUESTIONS = 300


_SUBSCRIPT = str.maketrans({
    "0":"₀","1":"₁","2":"₂","3":"₃","4":"₄",
    "5":"₅","6":"₆","7":"₇","8":"₈","9":"₉",
})
_SUPERSCRIPT = str.maketrans({
    "0":"⁰","1":"¹","2":"²","3":"³","4":"⁴",
    "5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹",
    "+":"⁺","-":"⁻",
})
_ELEMENT_SYMBOLS = sorted(
    {
        "H","He","Li","Be","B","C","N","O","F","Ne","Na","Mg","Al","Si","P","S","Cl","Ar",
        "K","Ca","Sc","Ti","V","Cr","Mn","Fe","Co","Ni","Cu","Zn","Ga","Ge","As","Se","Br","Kr",
        "Rb","Sr","Y","Zr","Nb","Mo","Tc","Ru","Rh","Pd","Ag","Cd","In","Sn","Sb","Te","I","Xe",
        "Cs","Ba","La","Ce","Pr","Nd","Pm","Sm","Eu","Gd","Tb","Dy","Ho","Er","Tm","Yb","Lu",
        "Hf","Ta","W","Re","Os","Ir","Pt","Au","Hg","Tl","Pb","Bi","Po","At","Rn","Fr","Ra",
        "Ac","Th","Pa","U","Np","Pu","Am","Cm","Bk","Cf","Es","Fm","Md","No","Lr","Rf","Db",
        "Sg","Bh","Hs","Mt","Ds","Rg","Cn","Nh","Fl","Mc","Lv","Ts","Og"
    },
    key=len,
    reverse=True,
)
_ELEMENT_RE = "(?:" + "|".join(map(re.escape, _ELEMENT_SYMBOLS)) + ")"
_FORMULA_TOKEN_RE = re.compile(
    r"(?<![A-Za-zÀ-ỹ])"
    r"((?:\d+)?(?:" + _ELEMENT_RE + r"|[()\[\]]|\d+)+(?:\^?\d*[+-])?)"
    r"(?![A-Za-zÀ-ỹ])"
)


def _format_formula_token(token: str) -> str:
    """Convert flattened chemical notation to Unicode sub/superscripts.

    PDF text extraction often turns H₂SO₄ into H2SO4 and Fe³⁺ into Fe3+.
    Unicode scripts survive JSON, HTML and Phaser canvas consistently, so the
    imported question keeps chemistry notation visually close to the source PDF.
    """
    if not token or not (re.search(r"\d", token) or re.search(r"[+-]$", token)):
        return token

    # Explicit charge notation such as SO4^2-.
    explicit_charge = re.search(r"\^(\d*)([+-])$", token)
    charge = ""
    if explicit_charge:
        digits, sign = explicit_charge.groups()
        token = token[: explicit_charge.start()]
        charge = digits.translate(_SUPERSCRIPT) + sign.translate(_SUPERSCRIPT)
    else:
        trailing = re.search(r"(\d*)([+-])$", token)
        if trailing:
            digits, sign = trailing.groups()
            core = token[: trailing.start()]
            token = core

            if digits:
                # Fe3+ / Al3+ -> monatomic ionic charge.
                if re.fullmatch(_ELEMENT_RE, core):
                    charge = digits.translate(_SUPERSCRIPT) + sign.translate(_SUPERSCRIPT)
                # [Fe(CN)6]4- -> charge after a closed complex.
                elif core.endswith("]") or core.endswith(")"):
                    charge = digits.translate(_SUPERSCRIPT) + sign.translate(_SUPERSCRIPT)
                # SO42- / PO43- are common flattened forms of SO₄²⁻ / PO₄³⁻.
                elif len(digits) >= 2:
                    token = core + digits[:-1]
                    charge = digits[-1].translate(_SUPERSCRIPT) + sign.translate(_SUPERSCRIPT)
                else:
                    # NH4+ / H3O+ -> digit remains stoichiometric subscript.
                    token = core + digits
                    charge = sign.translate(_SUPERSCRIPT)
            else:
                charge = sign.translate(_SUPERSCRIPT)

    # Keep a leading stoichiometric coefficient normal; convert digits that
    # follow an element/group to subscripts.
    out = []
    i = 0
    while i < len(token):
        ch = token[i]
        if ch.isdigit():
            j = i
            while j < len(token) and token[j].isdigit():
                j += 1
            digits = token[i:j]
            prev = token[i - 1] if i > 0 else ""
            if i > 0 and (prev.isalpha() or prev in ")]"):
                out.append(digits.translate(_SUBSCRIPT))
            else:
                out.append(digits)
            i = j
            continue
        out.append(ch)
        i += 1
    return "".join(out) + charge


def format_chemical_notation(value: str) -> str:
    """Restore common chemistry sub/superscripts after PDF extraction.

    Existing Unicode subscripts/superscripts are preserved. Only tokens that
    look like chemical formulae are transformed, so ordinary numbers such as
    years, temperatures and question numbers remain unchanged.
    """
    text = value or ""
    return _FORMULA_TOKEN_RE.sub(lambda m: _format_formula_token(m.group(1)), text)


class PdfImportError(ValueError):
    pass


def _clean_text(value: str) -> str:
    value = (value or "").replace("\r\n", "\n").replace("\r", "\n").replace("\u00a0", " ")
    value = value.replace("–", "-").replace("—", "-")
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r" *\n *", "\n", value)
    value = re.sub(r"\n{3,}", "\n\n", value)
    return value.strip()


def _read_pdf_bytes(file_storage) -> bytes:
    if not file_storage or not getattr(file_storage, "filename", ""):
        raise PdfImportError("Hãy chọn một file PDF.")
    filename = str(file_storage.filename or "")
    if not filename.lower().endswith(".pdf"):
        raise PdfImportError("File tải lên phải có định dạng .pdf.")
    raw = file_storage.read(MAX_PDF_BYTES + 1)
    if len(raw) > MAX_PDF_BYTES:
        raise PdfImportError("PDF tối đa 12 MB.")
    if not raw:
        raise PdfImportError("File PDF rỗng hoặc không đọc được.")
    return raw


def _extract_text_from_bytes(raw: bytes) -> str:
    try:
        reader = PdfReader(BytesIO(raw))
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception as exc:
                raise PdfImportError("PDF đang được khóa bằng mật khẩu.") from exc
        pages = []
        for page in reader.pages:
            try:
                pages.append(page.extract_text() or "")
            except Exception:
                pages.append("")
    except PdfImportError:
        raise
    except Exception as exc:
        raise PdfImportError("Không đọc được file PDF. Hãy thử xuất lại PDF từ Word/Google Docs.") from exc

    text = _clean_text("\n\n".join(pages))
    if len(re.sub(r"\s+", "", text)) < 30:
        raise PdfImportError(
            "PDF gần như không có lớp chữ để đọc. Nếu đây là PDF scan/ảnh chụp, hãy OCR hoặc xuất lại thành PDF có thể bôi đen chữ."
        )
    return text


def _question_line_number(text: str):
    for pattern in (
        r"^\s*(?:Câu|Question)\s*(\d{1,4})\s*[\.:)\-]?",
        r"^\s*(\d{1,4})\s*[\.)]\s+",
    ):
        m = re.match(pattern, text or "", re.I)
        if m:
            return int(m.group(1))
    return None


def _rect_union(rects):
    if not rects:
        return None
    x0 = min(r.x0 for r in rects)
    y0 = min(r.y0 for r in rects)
    x1 = max(r.x1 for r in rects)
    y1 = max(r.y1 for r in rects)
    return fitz.Rect(x0, y0, x1, y1)


def _render_question_figure(page, rect):
    """Render a PDF figure/diagram to a compact PNG data URI."""
    if fitz is None or rect is None or rect.is_empty:
        return None
    pad = 8
    clip = fitz.Rect(
        max(page.rect.x0, rect.x0 - pad),
        max(page.rect.y0, rect.y0 - pad),
        min(page.rect.x1, rect.x1 + pad),
        min(page.rect.y1, rect.y1 + pad),
    )
    if clip.width < 18 or clip.height < 18:
        return None

    # Keep each DB image comfortably under the existing 2.5 MB limit.
    chosen = None
    for scale in (2.0, 1.6, 1.3, 1.0, 0.8):
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), clip=clip, alpha=False)
        data = pix.tobytes("png")
        chosen = data
        if len(data) <= 2_300_000:
            break
    if not chosen:
        return None
    return "data:image/png;base64," + base64.b64encode(chosen).decode("ascii")


def _extract_question_images(raw: bytes):
    """Map embedded PDF figures to their nearest numbered question.

    We use page geometry rather than plain-text extraction, so raster pictures
    and most vector diagrams/tables located inside a question can be retained.
    The current database stores one illustration per question; if a question
    contains several image objects, their bounding boxes are rendered together.
    """
    if fitz is None:
        return {}, ["Máy chủ chưa có PyMuPDF nên chưa thể tách hình ảnh từ PDF."]

    images = {}
    warnings = []
    try:
        doc = fitz.open(stream=raw, filetype="pdf")
    except Exception as exc:
        return {}, [f"Không mở được lớp hình ảnh PDF: {exc}"]

    last_question = None
    try:
        for page_index in range(len(doc)):
            page = doc[page_index]
            page_dict = page.get_text("dict")
            starts = []

            # Locate question headings line-by-line with y coordinates.
            for block in page_dict.get("blocks", []):
                if block.get("type") != 0:
                    continue
                for line in block.get("lines", []):
                    line_text = "".join(span.get("text", "") for span in line.get("spans", []))
                    qnum = _question_line_number(line_text)
                    if qnum is not None:
                        bbox = line.get("bbox") or block.get("bbox")
                        if bbox:
                            starts.append((float(bbox[1]), qnum))
            starts.sort(key=lambda x: x[0])

            # Figure candidates: embedded raster images.
            raster_rects = []
            for block in page_dict.get("blocks", []):
                if block.get("type") != 1 or not block.get("bbox"):
                    continue
                rect = fitz.Rect(block["bbox"])
                # Ignore tiny icons / bullets / decorative marks.
                if rect.width >= 24 and rect.height >= 24 and rect.get_area() >= 900:
                    raster_rects.append(rect)

            # Vector diagrams/tables are not image blocks. Use their drawing
            # bounding boxes only when no raster image is present in that question.
            vector_rects = []
            try:
                for drawing in page.get_drawings():
                    rect = fitz.Rect(drawing.get("rect"))
                    area = rect.get_area()
                    page_area = max(1, page.rect.get_area())
                    if (
                        rect.width >= 28
                        and rect.height >= 22
                        and area >= 1100
                        and area <= page_area * 0.55
                    ):
                        vector_rects.append(rect)
            except Exception:
                vector_rects = []

            # Build vertical question intervals on this page. A question started
            # on the previous page may continue before the first heading.
            intervals = []
            if last_question is not None and (not starts or starts[0][0] > page.rect.y0 + 30):
                first_y = starts[0][0] if starts else page.rect.y1
                intervals.append((page.rect.y0, first_y, last_question))
            for i, (start_y, qnum) in enumerate(starts):
                end_y = starts[i + 1][0] if i + 1 < len(starts) else page.rect.y1
                intervals.append((start_y, end_y, qnum))
                last_question = qnum

            for y0, y1, qnum in intervals:
                in_raster = [
                    r for r in raster_rects
                    if (r.y0 + r.y1) / 2 >= y0 - 4 and (r.y0 + r.y1) / 2 < y1 + 4
                ]
                candidates = in_raster
                if not candidates:
                    candidates = [
                        r for r in vector_rects
                        if (r.y0 + r.y1) / 2 >= y0 - 4 and (r.y0 + r.y1) / 2 < y1 + 4
                    ]
                if not candidates:
                    continue

                # Ignore very wide separator lines / borders.
                candidates = [
                    r for r in candidates
                    if r.height >= 18 and not (r.width > page.rect.width * 0.92 and r.height < 45)
                ]
                if not candidates:
                    continue

                union = _rect_union(candidates)
                data_uri = _render_question_figure(page, union)
                if not data_uri:
                    continue

                # If the same question spans pages, keep the larger rendered figure.
                old = images.get(qnum)
                if old is None or len(data_uri) > len(old):
                    images[qnum] = data_uri
    except Exception as exc:
        warnings.append(f"Có lỗi khi tách một số hình trong PDF: {exc}")
    finally:
        doc.close()

    return images, warnings


def extract_pdf_text(file_storage) -> str:
    raw = _read_pdf_bytes(file_storage)
    return _extract_text_from_bytes(raw)

def _split_answer_section(text: str):
    heading = re.search(
        r"(?im)^\s*(?:PHẦN\s+)?(?:ĐÁP\s*ÁN(?:\s+VÀ\s+HƯỚNG\s+DẪN\s+GIẢI)?|ANSWER\s+KEY)\s*:?\s*$",
        text,
    )
    if not heading:
        return text, ""
    return text[: heading.start()].strip(), text[heading.end() :].strip()


def _split_questions(text: str):
    patterns = [
        re.compile(r"(?im)^\s*(?:Câu|Question)\s*(\d{1,4})\s*[\.:)\-]?\s*"),
        re.compile(r"(?m)^\s*(\d{1,4})\s*[\.)]\s+"),
    ]
    matches = []
    for pattern in patterns:
        matches = list(pattern.finditer(text))
        if matches:
            break
    if not matches:
        raise PdfImportError(
            "Không nhận ra các câu hỏi. PDF nên đánh số theo dạng “Câu 1.”, “Câu 2.” ... hoặc “1.”, “2.” ..."
        )

    blocks = []
    for i, match in enumerate(matches[:MAX_IMPORTED_QUESTIONS]):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        qnum = int(match.group(1))
        body = _clean_text(text[match.end() : end])
        if body:
            blocks.append((qnum, body))
    return blocks


def _extract_inline_answer(block: str):
    answer = None
    explanation = ""

    answer_match = re.search(
        r"(?im)^\s*(?:Đáp\s*án(?:\s*đúng)?|Answer)\s*:\s*(.+?)\s*$",
        block,
    )
    if answer_match:
        answer = answer_match.group(1).strip()
        block = block[: answer_match.start()] + "\n" + block[answer_match.end() :]

    explain_match = re.search(
        r"(?im)^\s*(?:Giải\s*thích|Lời\s*giải)\s*:\s*(.+?)\s*$",
        block,
    )
    if explain_match:
        explanation = explain_match.group(1).strip()
        block = block[: explain_match.start()] + "\n" + block[explain_match.end() :]

    return _clean_text(block), answer, explanation


def _short_answer_key(answer_text: str):
    out = {}
    for line in answer_text.splitlines():
        m = re.match(r"^\s*(?:Câu\s*)?(\d{1,4})\s*[\.:)\-]\s*(.+?)\s*$", line, re.I)
        if m:
            out[int(m.group(1))] = m.group(2).strip()
    return out


def _mcq_answer_key(answer_text: str):
    out = {}
    for m in re.finditer(
        r"(?i)(?:Câu\s*)?(\d{1,4})\s*[\.:)\-]?\s*([ABCD])(?=\s|[,;\.\-]|$)",
        answer_text,
    ):
        out[int(m.group(1))] = m.group(2).upper()
    return out


def _parse_tf_value(value: str):
    value = value or ""
    by_letter = {}
    for m in re.finditer(
        r"(?i)([abcd])\s*[\.:)\-]?\s*(đúng|sai|true|false|đ|d|s|t|f)(?=\s|[,;\.\-]|$)",
        value,
    ):
        token = m.group(2).lower()
        by_letter[m.group(1).lower()] = token in {"đúng", "true", "đ", "d", "t"}
    if all(letter in by_letter for letter in "abcd"):
        return [by_letter[letter] for letter in "abcd"]

    tokens = re.findall(r"(?i)(?<!\w)(đúng|sai|true|false|đ|d|s|t|f)(?!\w)", value)
    if len(tokens) >= 4:
        return [token.lower() in {"đúng", "true", "đ", "d", "t"} for token in tokens[:4]]
    return None


def _tf_answer_key(answer_text: str):
    out = {}
    lines = answer_text.splitlines()
    for line in lines:
        m = re.match(r"^\s*(?:Câu\s*)?(\d{1,4})\s*[\.:)\-]\s*(.+?)\s*$", line, re.I)
        if not m:
            continue
        parsed = _parse_tf_value(m.group(2))
        if parsed is not None:
            out[int(m.group(1))] = parsed
    return out


def _extract_labeled_parts(block: str, labels: str):
    pattern = re.compile(r"(?i)(?<![\wÀ-ỹ])([" + re.escape(labels) + r"])\s*[\.)]\s+")
    matches = list(pattern.finditer(block))
    wanted = list(labels.lower())

    start_idx = None
    chosen = None
    for i in range(0, len(matches) - len(wanted) + 1):
        seq = [matches[i + j].group(1).lower() for j in range(len(wanted))]
        if seq == wanted:
            start_idx = i
            chosen = matches[i : i + len(wanted)]
            break
    if chosen is None:
        return None, None

    stem = _clean_text(block[: chosen[0].start()])
    parts = []
    for i, match in enumerate(chosen):
        end = chosen[i + 1].start() if i + 1 < len(chosen) else len(block)
        parts.append(_clean_text(block[match.end() : end]))
    if not stem or any(not p for p in parts):
        return None, None
    return stem, parts


def parse_pdf_questions(file_storage, game_type: str):
    if game_type not in {"bee", "soccer", "basketball", "racing"}:
        raise PdfImportError("Mini game không hợp lệ.")

    raw = _read_pdf_bytes(file_storage)
    text = _extract_text_from_bytes(raw)
    question_images, image_warnings = _extract_question_images(raw)
    question_text, answer_text = _split_answer_section(text)
    blocks = _split_questions(question_text)

    if game_type == "bee":
        qtype = "short"
        key = _short_answer_key(answer_text)
        points = 10
    elif game_type in {"soccer", "basketball"}:
        qtype = "mcq"
        key = _mcq_answer_key(answer_text)
        points = 10
    else:
        qtype = "tf4"
        key = _tf_answer_key(answer_text)
        points = 50

    parsed = []
    skipped = []
    for qnum, raw_block in blocks:
        block, inline_answer, explanation = _extract_inline_answer(raw_block)
        block = format_chemical_notation(block)
        explanation = format_chemical_notation(explanation)
        if inline_answer is not None:
            inline_answer = format_chemical_notation(inline_answer)

        if qtype == "short":
            answer = inline_answer if inline_answer is not None else key.get(qnum)
            if not answer:
                skipped.append(f"Câu {qnum}: không tìm thấy đáp án.")
                continue
            answers = [format_chemical_notation(x.strip()) for x in str(answer).split("|") if x.strip()]
            if not answers:
                skipped.append(f"Câu {qnum}: đáp án rỗng.")
                continue
            parsed.append(
                {
                    "number": qnum,
                    "game": game_type,
                    "qtype": qtype,
                    "content": block,
                    "options": [],
                    "correct": answers,
                    "points": points,
                    "explanation": explanation,
                    "image_data": question_images.get(qnum),
                }
            )
            continue

        if qtype == "mcq":
            stem, options = _extract_labeled_parts(block, "ABCD")
            answer = inline_answer if inline_answer is not None else key.get(qnum)
            letter_match = re.search(r"(?i)(?<![A-Z])([ABCD])(?![A-Z])", str(answer or ""))
            if not stem or not options:
                skipped.append(f"Câu {qnum}: không nhận đủ 4 phương án A/B/C/D.")
                continue
            if not letter_match:
                skipped.append(f"Câu {qnum}: đáp án phải là A, B, C hoặc D.")
                continue
            correct = str("ABCD".index(letter_match.group(1).upper()))
            stem = format_chemical_notation(stem)
            options = [format_chemical_notation(x) for x in options]
            parsed.append(
                {
                    "number": qnum,
                    "game": game_type,
                    "qtype": qtype,
                    "content": stem,
                    "options": options,
                    "correct": correct,
                    "points": points,
                    "explanation": explanation,
                    "image_data": question_images.get(qnum),
                }
            )
            continue

        stem, statements = _extract_labeled_parts(block, "abcd")
        answer = _parse_tf_value(inline_answer or "") if inline_answer else key.get(qnum)
        if not stem or not statements:
            skipped.append(f"Câu {qnum}: không nhận đủ 4 ý a/b/c/d.")
            continue
        if answer is None:
            skipped.append(f"Câu {qnum}: không nhận ra 4 đáp án Đúng/Sai.")
            continue
        stem = format_chemical_notation(stem)
        statements = [format_chemical_notation(x) for x in statements]
        parsed.append(
            {
                "number": qnum,
                "game": game_type,
                "qtype": qtype,
                "content": stem,
                "options": statements,
                "correct": answer,
                "points": points,
                "explanation": explanation,
                "image_data": question_images.get(qnum),
            }
        )

    if not parsed:
        detail = " ".join(skipped[:3])
        raise PdfImportError("Không chuyển được câu hỏi nào từ PDF. " + detail)

    return {
        "questions": parsed,
        "skipped": skipped,
        "text_length": len(text),
        "image_count": sum(1 for q in parsed if q.get("image_data")),
        "image_warnings": image_warnings,
    }
