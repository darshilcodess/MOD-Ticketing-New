from pydantic import BaseModel
from typing import List, Optional
import datetime as dt


class VoucherItem(BaseModel):
    part_no: str
    nomenclature: str
    total: str
    remarks: Optional[str] = ""


class VoucherRequest(BaseModel):
    ticket_id: Optional[int] = None
    # Issue Voucher (IV) fields
    iv_no: str
    unit_iv: str
    stn_iv: str
    date_iv: str

    # Receipt Voucher (RV) fields
    rv_no: str
    unit_rv: str
    stn_rv: str
    date_rv: str

    # Voucher body fields
    issued_to: str
    compliance: str
    auth: str

    items: List[VoucherItem]


class DocumentResponse(BaseModel):
    file_id: str
    file: str
    message: str = "Document generated successfully"


class OutboundDeliveryRequest(BaseModel):
    ticket_id: int
    data: dict # Generic dictionary for now


class VoucherVariableQtyRequest(BaseModel):
    ticket_id: int
    data: dict


class VoucherTitleRequest(BaseModel):
    ticket_id: int
    data: dict


class VoucherExplanationRequest(BaseModel):
    ticket_id: int
    data: dict


class TicketDocumentSchema(BaseModel):
    id: int
    ticket_id: int
    file_id: str
    document_type: str
    created_at: dt.datetime

    class Config:
        from_attributes = True
