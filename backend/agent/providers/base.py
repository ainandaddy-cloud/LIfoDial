from abc import ABC, abstractmethod

class STTProvider(ABC):
    @abstractmethod
    async def transcribe(
        self, audio: bytes, lang: str
    ) -> str:
        pass

class TTSProvider(ABC):
    @abstractmethod
    async def synthesize(
        self, text: str, lang: str, 
        voice: str = None
    ) -> bytes:
        pass
