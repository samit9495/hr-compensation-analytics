class DomainError(Exception):
    """Base class for domain errors mapped to HTTP responses.

    Subclasses override ``code`` (machine-readable identifier) and may
    override ``status_code`` (HTTP status). Subclasses raised in services
    are translated to HTTP responses by handlers registered in app.main.
    """

    status_code: int = 500
    code: str = "domain_error"

    def __init__(self, message: str = "") -> None:
        super().__init__(message)
        self.message = message or self.code
