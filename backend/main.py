import logging
import os
from typing import Any, Dict

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

API_BASE = os.getenv("DIP_API_BASE", "https://dip.aishu.cn/api")
API_AUTH = os.getenv(
    "DIP_API_AUTH",
    "Bearer ory_at_WaCDXOIxHGVfgbgWY65v8mRGOQpqQEaJ8TcmuLlXQIE.vYPuMbf4tTV4g_-KBCkUejHRiJs16roATBYr40RmHlE",
)
KN_ID = os.getenv("DIP_KN_ID", "d4rok5r5s3q8va76m88g")
OT_ID = os.getenv("DIP_OT_ID", "d4rsbjb5s3q8va76m8cg")

app = FastAPI(title="Object Type Detail API")
logger = logging.getLogger("object_type_detail")
logging.basicConfig(level=logging.INFO)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/object-type-detail")
async def get_object_type_detail() -> Dict[str, Any]:
    url = f"{API_BASE}/ontology-query/v1/knowledge-networks/{KN_ID}/object-types/{OT_ID}"
    headers = {
        "Authorization": API_AUTH,
        "Content-Type": "application/json",
        "X-HTTP-Method-Override": "GET",
    }
    params = {
        "include_type_info": "true",
        "include_logic_params": "true",
    }
    payload = {
        "limit": 1,
        "need_total": False,
    }
    logger.info(
        "Requesting object type detail",
        extra={
            "url": url,
            "params": params,
            "headers": {"Authorization": "Bearer ***", "Content-Type": "application/json", "X-HTTP-Method-Override": "GET"},
            "payload": payload,
        },
    )

    async with httpx.AsyncClient(timeout=20) as client:
        try:
            response = await client.post(url, headers=headers, params=params, json=payload)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Upstream request failed: {exc}") from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail={"message": "Upstream error", "body": response.text},
        )

    data = response.json()
    return {
        "object_type": data.get("object_type"),
        "datas": data.get("datas", []),
        "total_count": data.get("total_count"),
    }
