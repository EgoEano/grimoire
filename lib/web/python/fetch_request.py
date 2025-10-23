import aiohttp
import asyncio
from typing import Any, Callable, Dict, Optional, Union


class FetchResponse:
    def __init__(
        self,
        success: bool,
        status: Optional[int] = None,
        response: Any = None,
        message: Optional[str] = None,
        errors: Optional[list] = None,
        raw: Optional[aiohttp.ClientResponse] = None,
    ):
        self.success = success
        self.status = status
        self.response = response
        self.message = message
        self.errors = errors
        self.raw = raw


async def fetch_request(
    url: str,
    method: str = "POST",
    type_: str = "json",  # "json" | "string" | "multipart"
    data: Any = None,
    timeout: int = 10_000,
    headers: Optional[Dict[str, str]] = None,
    cache: str = "no-store",
    redirect: str = "follow",
    credentials: str = "include",
    on_success: Optional[Callable[[FetchResponse], None]] = None,
    on_error: Optional[Callable[[Any], None]] = None,
    on_finally: Optional[Callable[[], None]] = None,
    on_timeout: Optional[Callable[[], None]] = None,
) -> FetchResponse:
    """
    Полный аналог fetchRequest из TypeScript, но на Python + aiohttp.
    """

    if not url.strip():
        error = FetchResponse(False, message="Need to set url in options", errors=["Empty URL"])
        if on_error:
            on_error(error)
        return error

    method = method.upper()
    session_headers = headers.copy() if headers else {}

    # Подготовка тела запроса
    body = None
    if type_ == "string":
        session_headers["Content-Type"] = "application/x-www-form-urlencoded"
        body = aiohttp.FormData(data) if data else None
    elif type_ == "multipart":
        body = data  # aiohttp сам обрабатывает FormData
    else:  # json
        session_headers.setdefault("Accept", "application/json")
        session_headers.setdefault("Content-Type", "application/json")
        body = aiohttp.JsonPayload(data) if data else None

    try:
        async with aiohttp.ClientSession() as session:
            try:
                async with session.request(
                    method,
                    url,
                    headers=session_headers,
                    data=None if method in ["GET", "HEAD"] else body,
                    timeout=timeout / 1000,  # ms → sec
                ) as resp:
                    # Определяем тип ответа
                    content_type = resp.headers.get("content-type", "")
                    if "application/json" in content_type:
                        resp_data = await resp.json()
                    elif any(t in content_type for t in ["text/html", "text/plain", "application/xml"]):
                        resp_data = await resp.text()
                    else:
                        resp_data = await resp.read()

                    if not resp.ok:
                        error = FetchResponse(
                            success=False,
                            status=resp.status,
                            message="Fetch request failed",
                            response=resp_data,
                            errors=[resp.reason],
                            raw=resp,
                        )
                        if on_error:
                            on_error(error)
                        return error

                    result = FetchResponse(True, status=resp.status, response=resp_data, raw=resp)
                    if on_success:
                        on_success(result)
                    return result

            except asyncio.TimeoutError:
                if on_timeout:
                    on_timeout()
                error = FetchResponse(False, status=0, message="Request timed out")
                if on_error:
                    on_error(error)
                return error

    except Exception as e:
        error = FetchResponse(False, message=str(e), errors=[repr(e)])
        if on_error:
            on_error(error)
        return error

    finally:
        if on_finally:
            on_finally()
