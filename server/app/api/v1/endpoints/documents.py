from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.services.documents.html_generator import generate_html
from app.services.documents.pdf_generator import html_to_pdf
from app.schemas.document import VoucherRequest, VoucherResponse
import uuid
import os

import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Use absolute path for temp directory to ensure consistency across environments
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
TEMP_DIR = os.path.join(BASE_DIR, "temp")


@router.post("/voucher", response_model=VoucherResponse)
def generate_voucher(data: VoucherRequest):
    """
    Generate a Receipt, Issue and Expense Voucher PDF.
    Accepts structured voucher data, renders it via Jinja2 HTML template,
    and converts to PDF using Playwright.
    """
    try:
        file_id = str(uuid.uuid4())

        os.makedirs(TEMP_DIR, exist_ok=True)
        html_path = os.path.join(TEMP_DIR, f"{file_id}.html")
        pdf_path = os.path.join(TEMP_DIR, f"{file_id}.pdf")

        # Convert Pydantic model to dict for Jinja2 rendering
        voucher_data = data.model_dump()

        generate_html("voucher.html", voucher_data, html_path)
        html_to_pdf(html_path, pdf_path)

        return VoucherResponse(file_id=file_id, file=pdf_path)

    except Exception as e:
        logger.exception("Voucher generation failed")
        raise HTTPException(status_code=500, detail=f"Failed to generate voucher: {str(e)}")


@router.get("/voucher/{file_id}")
def download_voucher(file_id: str):
    """
    Download / stream a previously generated voucher PDF by file_id.
    Frontend opens this URL in a new tab.
    """
    pdf_path = os.path.join(TEMP_DIR, f"{file_id}.pdf")
    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Voucher not found")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"voucher_{file_id}.pdf"
    )
