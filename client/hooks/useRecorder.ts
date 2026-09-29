import { useCallback, useRef, useState } from "react";

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(
      null,
      Array.from(bytes.subarray(i, i + CHUNK)),
    );
  }
  return btoa(bin);
}

export function useRecorder(onAudio: (b64: string) => void) {
  const [recording, setRecording] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const b64 = bufferToBase64(await blob.arrayBuffer());
        onAudio(b64);
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) {
      setErr((e as Error).message);
    }
  }, [onAudio]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setRecording(false);
  }, []);

  return { recording, err, start, stop };
}
