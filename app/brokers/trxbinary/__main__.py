from app.brokers.trxbinary.integration_audit import IntegrationAuditService


if __name__ == "__main__":
    md, js = IntegrationAuditService().write_reports()
    print(f"audit reports written: {md} and {js}")
