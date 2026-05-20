from decimal import Decimal

from pydantic import BaseModel


class EmployeeCompensationAnalysis(BaseModel):
    id: int
    peer_avg: Decimal
    peer_min: Decimal
    peer_max: Decimal
    compa_ratio: Decimal
    range_penetration: Decimal


class CompensationAnalysisResponse(BaseModel):
    analyses: list[EmployeeCompensationAnalysis]


class PayrollEntry(BaseModel):
    key: str
    total: Decimal
    percentage: Decimal


class PayrollBurdenResponse(BaseModel):
    total: Decimal
    entries: list[PayrollEntry]


class OutlierEntry(BaseModel):
    id: int
    full_name: str
    country: str
    job_title: str
    salary: Decimal
    bucket: int


class OutlierResponse(BaseModel):
    bucket: str
    entries: list[OutlierEntry]
