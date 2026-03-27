# -*- coding: utf-8 -*-
"""Browser POC API router for CoPaw Desktop."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/browser", tags=["browser"])


# ── Response Models ───────────────────────────────────────────────────────


class BrowserNavigateResult(BaseModel):
    """Result of a browser navigation action."""

    success: bool
    url: str | None = None
    title: str | None = None
    error: str | None = None


class BrowserActionResult(BaseModel):
    """Result of a browser action (back, forward, refresh)."""

    success: bool
    url: str | None = None
    title: str | None = None
    canGoBack: bool = False
    canGoForward: bool = False
    error: str | None = None


class BrowserStatus(BaseModel):
    """Current browser status."""

    url: str
    title: str
    canGoBack: bool
    canGoForward: bool
    isLoading: bool


class NavigateRequest(BaseModel):
    """Request body for navigate endpoint."""

    url: str


# ── State Management ──────────────────────────────────────────────────────
# For POC, we'll use simple in-memory state
# In production, this should use actual pywebview window control


class BrowserState:
    """Simple in-memory browser state for POC."""

    def __init__(self):
        self.current_url = "https://www.bing.com"
        self.page_title = "Bing"
        self.history: list[str] = [self.current_url]
        self.history_index = 0
        self.is_loading = False

    @property
    def can_go_back(self) -> bool:
        return self.history_index > 0

    @property
    def can_go_forward(self) -> bool:
        return self.history_index < len(self.history) - 1

    def navigate(self, url: str) -> BrowserNavigateResult:
        """Navigate to a URL."""
        try:
            # Remove forward history if navigating from middle of history
            if self.history_index < len(self.history) - 1:
                self.history = self.history[: self.history_index + 1]

            # Add new URL to history
            self.history.append(url)
            self.history_index = len(self.history) - 1
            self.current_url = url

            # Extract domain for title
            from urllib.parse import urlparse

            domain = urlparse(url).netloc or url
            self.page_title = domain

            return BrowserNavigateResult(
                success=True,
                url=url,
                title=self.page_title,
            )
        except Exception as e:
            return BrowserNavigateResult(
                success=False,
                error=str(e),
            )

    def go_back(self) -> BrowserActionResult:
        """Go back in history."""
        if not self.can_go_back:
            return BrowserActionResult(
                success=False,
                error="Cannot go back",
            )

        self.history_index -= 1
        self.current_url = self.history[self.history_index]

        from urllib.parse import urlparse

        domain = urlparse(self.current_url).netloc or self.current_url
        self.page_title = domain

        return BrowserActionResult(
            success=True,
            url=self.current_url,
            title=self.page_title,
            canGoBack=self.can_go_back,
            canGoForward=self.can_go_forward,
        )

    def go_forward(self) -> BrowserActionResult:
        """Go forward in history."""
        if not self.can_go_forward:
            return BrowserActionResult(
                success=False,
                error="Cannot go forward",
            )

        self.history_index += 1
        self.current_url = self.history[self.history_index]

        from urllib.parse import urlparse

        domain = urlparse(self.current_url).netloc or self.current_url
        self.page_title = domain

        return BrowserActionResult(
            success=True,
            url=self.current_url,
            title=self.page_title,
            canGoBack=self.can_go_back,
            canGoForward=self.can_go_forward,
        )

    def refresh(self) -> BrowserActionResult:
        """Refresh the current page."""
        return BrowserActionResult(
            success=True,
            url=self.current_url,
            title=self.page_title,
            canGoBack=self.can_go_back,
            canGoForward=self.can_go_forward,
        )

    def get_status(self) -> BrowserStatus:
        """Get current browser status."""
        return BrowserStatus(
            url=self.current_url,
            title=self.page_title,
            canGoBack=self.can_go_back,
            canGoForward=self.can_go_forward,
            isLoading=self.is_loading,
        )


# Global browser state instance
_browser_state = BrowserState()


# ── API Endpoints ─────────────────────────────────────────────────────────


@router.post(
    "/navigate",
    summary="Navigate to URL",
    description="Navigate the browser to a specified URL",
)
async def navigate(request: NavigateRequest) -> BrowserNavigateResult:
    """Navigate to a URL."""
    return _browser_state.navigate(request.url)


@router.post(
    "/back",
    summary="Go back",
    description="Navigate back in browser history",
)
async def go_back() -> BrowserActionResult:
    """Go back in history."""
    return _browser_state.go_back()


@router.post(
    "/forward",
    summary="Go forward",
    description="Navigate forward in browser history",
)
async def go_forward() -> BrowserActionResult:
    """Go forward in history."""
    return _browser_state.go_forward()


@router.post(
    "/refresh",
    summary="Refresh page",
    description="Refresh the current page",
)
async def refresh() -> BrowserActionResult:
    """Refresh the current page."""
    return _browser_state.refresh()


@router.get(
    "/status",
    summary="Get browser status",
    description="Get current browser status including URL, title, and navigation state",
)
async def get_status() -> BrowserStatus:
    """Get current browser status."""
    return _browser_state.get_status()


@router.get(
    "/title",
    summary="Get page title",
    description="Get the title of the current page",
)
async def get_title() -> dict[str, str]:
    """Get page title."""
    return {"title": _browser_state.page_title}
