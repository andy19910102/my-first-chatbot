import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: "訊息內容不能為空" },
                { status: 400 }
            );
        }

        const completion = await client.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "你是一位友善、專業的客服人員，總是耐心且樂於協助客戶解決問題。你的回答應該親切、有禮貌，使用繁體中文回應。請以專業但溫暖的態度來協助客戶，提供清楚、準確的資訊，並在適當時候表達同理心。無論客戶詢問什麼問題，都要保持積極正面的態度。"
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            max_tokens: 500,
            temperature: 0.8,
        });

        const aiResponse = completion.choices[0].message.content;

        return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toLocaleString('zh-TW', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).replace(/\//g, '.')
        });

    } catch (error) {
        console.error("OpenAI API 錯誤:", error);
        return NextResponse.json(
            { error: "處理請求時發生錯誤" },
            { status: 500 }
        );
    }
}
