from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import edge_tts
import asyncio
import io

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境中应改为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TTSRequest(BaseModel):
    text: str
    voice: str = "zh-CN-XiaoxiaoNeural"
    rate: str = "+0%"
    volume: str = "+0%"
    pitch: str = "+0Hz"
    output_format: str = "audio-24khz-48kbitrate-mono-mp3"

@app.post("/api/tts")
async def text_to_speech(request: TTSRequest):
    try:
        # 创建一个内存中的字节流
        stream = io.BytesIO()
        
        # 使用edge-tts库生成语音
        communicate = edge_tts.Communicate(
            request.text, 
            request.voice,
            rate=request.rate,
            volume=request.volume,
            pitch=request.pitch,
            output_format=request.output_format
        )
        
        # 保存到内存中的字节流
        await communicate.save(stream)
        
        # 将流指针移回开始位置
        stream.seek(0)
        
        # 读取生成的音频数据
        audio_data = stream.read()
        
        # 返回音频文件
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment;filename=speech.mp3"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/voices")
async def get_voices():
    try:
        # 获取所有可用语音
        voices = await edge_tts.list_voices()
        return voices
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
