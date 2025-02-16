from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

#  User table
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True)
    email: str = Field(unique=True, index=True)

#  Domain table
class Domain(SQLModel, table=True):
    domain_name: str = Field(primary_key=True)
    last_scan: Optional[datetime] = Field(default=None)
    total_scans: int = Field(default=0)
    ip_address: Optional[str] = Field(default=None)
    server: Optional[str] = Field(default=None)
    mail_server: Optional[str] = Field(default=None)

#  ScanResult table
class ScanResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    domain_name: str = Field(foreign_key="domain.domain_name")
    scan_timestamp: datetime = Field(default_factory=datetime.utcnow)
    scan_status: str = Field(default="Pending")
