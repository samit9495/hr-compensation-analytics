from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=200, examples=["Jane Doe"])
    job_title: str = Field(min_length=1, max_length=100, examples=["Engineer"])
    country: str = Field(min_length=2, max_length=2, examples=["IN"])
    salary: Decimal = Field(ge=0, max_digits=12, decimal_places=2, examples=["50000.00"])


class EmployeeCreate(EmployeeBase):
    """Payload used to create an employee."""


class EmployeeRead(EmployeeBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
