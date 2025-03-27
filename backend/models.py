from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from uuid import uuid4

# User Table 
class User(SQLModel, table=True):
    __tablename__ = "user"
    user_id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    username: Optional[str] = Field(default=None) # user name 
   

#  Domain Table
class Domain(SQLModel, table=True):
    domain_name: str = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.user_id")  # Links to user
    last_scan: Optional[datetime] = Field(default=None)  # Timestamp of last scan
    total_scans: int = Field(default=0)  # Number of times scanned
    ip_address: Optional[str] = Field(default=None)  # Resolved IP
    server: Optional[str] = Field(default=None)  # Web server info
    mail_server: Optional[str] = Field(default=None)  # Mail server info


#  Permutation Table (DNS Twist Results)
class Permutation(SQLModel, table=True):
    permutation_name: str = Field(primary_key=True)  # Name of generated domain variation
    domain_name: str = Field(foreign_key="domain.domain_name")  # Links to real domain
    server: Optional[str] = Field(default=None)  # Web server for variation
    mail_server: Optional[str] = Field(default=None)  # Mail server for variation
    risk: Optional[bool] = Field(default=None)  # High risk? True/False
    ip_address: Optional[str] = Field(default=None)  # Associated IP address


# Settings Tables
class GeneralSettings(SQLModel, table=True):
    __tablename__ = "general_settings"
    user_id: str = Field(foreign_key="user.user_id", primary_key=True)
    email_notifications: bool = Field(default=True)  # Whether notifications are enabled
    timezone: Optional[str] = Field(default="UTC")  # Stored timezone (e.g., "UTC", "America/New_York")


class SecuritySettings(SQLModel, table=True):
    __tablename__ = "security_settings"
    user_id: str = Field(foreign_key="user.user_id", primary_key=True)
    two_factor_auth: bool = Field(default=False)
    session_timeout: Optional[str] = Field(default="1 hour")

class AppearanceSettings(SQLModel, table=True):
    __tablename__ = "appearance_settings"
    user_id: str = Field(foreign_key="user.user_id", primary_key=True)
    theme: Optional[str] = Field(default="Light")  # "Light" or "Dark"
    horizontal_sidebar: bool = Field(default=False)


class AccountSettings(SQLModel, table=True):
    __tablename__ = "account_settings"
    user_id: str = Field(foreign_key="user.user_id", primary_key=True)
    full_name: Optional[str] = Field(default=None)
    email_address: Optional[str] = Field(default=None)


class ExperimentalSettings(SQLModel, table=True):
    __tablename__ = "experimental_settings"
    user_id: str = Field(foreign_key="user.user_id", primary_key=True)
    beta_features: bool = Field(default=False)
    ai_domain_analysis: bool = Field(default=False)
    advanced_metrics: bool = Field(default=False)
