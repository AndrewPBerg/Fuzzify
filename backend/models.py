from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime


#  User table
class User(SQLModel, table=True):
    user_id: str = Field(primary_key=True)  # Matches ERM
    domain_name: str = Field(foreign_key="domain.domain_name")  # Foreign key to Domain


#  Domain table
class Domain(SQLModel, table=True):
    domain_name: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.user_id")  # Each domain has an owner
    last_scan: Optional[datetime] = Field(default=None)  # Timestamp of last scan
    total_scans: int = Field(default=0)  # Number of times scanned
    ip_address: Optional[str] = Field(default=None)  # Resolved IP
    server: Optional[str] = Field(default=None)  # Web server info
    mail_server: Optional[str] = Field(default=None)  # Mail server info


#  Premutation table (for dnstwist results)
class Premutation(SQLModel, table=True):
    permutation_name: str = Field(primary_key=True)  # Name of generated domain variation
    domain_name: str = Field(foreign_key="domain.domain_name")  # Links to real domain
    server: Optional[str] = Field(default=None)  # Web server for variation
    mail_server: Optional[str] = Field(default=None)  # Mail server for variation
    risk: Optional[bool] = Field(default=None)  # High risk? True/False
    ip_address: Optional[str] = Field(default=None)  # Associated IP address
