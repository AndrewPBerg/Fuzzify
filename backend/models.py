from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import uuid4
from sqlalchemy import DateTime

# User Table 
class User(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    __tablename__ = "user"
    user_id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    username: Optional[str] = Field(default=None) # user name
    horizontal_sidebar: bool = Field(default=False)
    theme: str = Field(default="system")
   

#  Domain Table
class Domain(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    domain_name: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.user_id")  # Links to user
    last_scan: Optional[datetime] = Field(default=None)  # Timestamp of last scan
    total_scans: int = Field(default=0)  # Number of times scanned
    ip_address: Optional[str] = Field(default=None)  # Resolved IP
    server: Optional[str] = Field(default=None)  # Web server info
    mail_server: Optional[str] = Field(default=None)  # Mail server info


# Permutation Table (DNS Twist Results)
class Permutation(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    permutation_name: str = Field(primary_key=True)  # Name of generated domain variation
    domain_name: str = Field(foreign_key="domain.domain_name")  # Links to real domain
    server: Optional[str] = Field(default=None)  # Web server for variation
    mail_server: Optional[str] = Field(default=None)  # Mail server for variation
    ip_address: Optional[str] = Field(default=None)  # Associated IP address
    mx_spy: Optional[bool] = None
    risk: Optional[float] = Field(default=-1.0)  # Add risk attribute


class PhishingDomain(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: Optional[int] = Field(default=None, primary_key=True) 
    domain_name: str = Field(foreign_key="domain.domain_name")  # Original domain
    permutation_name: str = Field(foreign_key="permutation.permutation_name")  # Variant
    url: Optional[str] = Field(default=None)  # Full URL if resolved
    similarity_score: float = Field(default=0.0)  # % match from LSH or pHash
    method: str = Field(default="lsh")  # 'lsh' 
    created_at: datetime = Field(default_factory=datetime.utcnow)
    server: Optional[str] = Field(default=None)
    mail_server: Optional[str] = Field(default=None)
    ip_address: Optional[str] = Field(default=None)

class ImagePhishingDomain(SQLModel, table=True):
    __table_args__ = {"extend_existing": True}
    id: Optional[int] = Field(default=None, primary_key=True)
    domain_name: str = Field(foreign_key="domain.domain_name")  # Original domain
    permutation_name: str = Field(foreign_key="permutation.permutation_name")  # Variant
    url: Optional[str] = Field(default=None)  # Full URL if resolved
    similarity_score: float = Field(default=0.0)  # % match from LSH or pHash
    method: str = Field(default="phash")  # 'phash'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    server: Optional[str] = Field(default=None)
    mail_server: Optional[str] = Field(default=None)
    ip_address: Optional[str] = Field(default=None)

class Schedule(SQLModel, table=True):
    schedule_id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="user.user_id")  # Links to User
    schedule_name: str = Field(default=None)  # Name of the schedule
    domain_name: str = Field(foreign_key="domain.domain_name")  # Links to Domain
    start_date: datetime = Field(default_factory=datetime.now)  # Start date of the schedule
    next_scan: datetime = Field(default=None)  # Next scheduled scan time