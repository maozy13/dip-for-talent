from __future__ import annotations

import logging
import os
from typing import Optional

import httpx
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="DIP for Talent API", version="0.1.0")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("dip-for-talent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_BASE_URL = os.getenv("DIP_API_BASE_URL", "https://dip.aishu.cn/api")
API_AUTHORIZATION = os.getenv(
    "DIP_API_AUTHORIZATION",
    "Bearer ory_at_fd1JrCxJA7iszQxE4OFGifJB7Q_twCgbFT4nU7-TKNw.4lMhof_OrKZcftwjMvD69vGXduSfthWD9-ZZznNIJHo",
)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.api_route(
    "/api/{full_path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
)
async def proxy_request(full_path: str, request: Request) -> Response:
    url = f"{API_BASE_URL.rstrip('/')}/{full_path.lstrip('/')}"
    headers = dict(request.headers)
    headers.pop("host", None)
    headers.pop("content-length", None)
    if "authorization" not in {key.lower() for key in headers}:
        headers["Authorization"] = API_AUTHORIZATION
    body = await request.body()

    logger.info("Proxy request %s %s", request.method, url)

    async with httpx.AsyncClient(timeout=60) as client:
        upstream = await client.request(
            request.method,
            url,
            params=request.query_params,
            content=body,
            headers=headers,
        )

    media_type: Optional[str] = upstream.headers.get("content-type")
    return Response(
        content=upstream.content,
        status_code=upstream.status_code,
        media_type=media_type,
    )
