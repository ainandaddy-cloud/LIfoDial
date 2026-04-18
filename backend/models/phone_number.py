import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from backend.db import Base


class PhoneNumber(Base):
    __tablename__ = "phone_numbers"

    id = Column(String(36), primary_key=True,
                default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"),
                       nullable=False, index=True)
    agent_id = Column(String(36), ForeignKey("agent_configs.id"),
                      nullable=True)

    number = Column(String(25), unique=True, nullable=False)
    country_code = Column(String(5), default="IN")
    country = Column(String(50), default="India")
    provider = Column(String(30), default="vobiz")

    # SIP configuration
    sip_uri = Column(String(200), nullable=True)
    sip_username = Column(String(100), nullable=True)
    sip_password = Column(String(100), nullable=True)
    sip_domain = Column(String(200), nullable=True)

    # Status
    is_active = Column(Boolean, default=True)
    is_assigned = Column(Boolean, default=False)

    # Inbound settings
    inbound_agent_id = Column(String(36), nullable=True)

    created_at = Column(DateTime(timezone=True),
                        server_default=func.now())
