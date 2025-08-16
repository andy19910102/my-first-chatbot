import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json();

        if (!text) {
            return NextResponse.json(
                { error: "文字內容不能為空" },
                { status: 400 }
            );
        }

        // 使用OpenAI TTS API生成音頻
        const mp3 = await client.audio.speech.create({
            model: "tts-1",
            voice: "alloy",
            input: text,
        });

        // 將音頻轉換為base64格式
        const arrayBuffer = await mp3.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');

        if (!base64Audio) {
            throw new Error('音頻生成失敗');
        }

        return NextResponse.json({
            audio: base64Audio,
            format: "mp3"
        });

    } catch (error) {
        console.error("TTS API 錯誤:", error);
        return NextResponse.json(
            { error: "生成語音時發生錯誤" },
            { status: 500 }
        );
    }
}
