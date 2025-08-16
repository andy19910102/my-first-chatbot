import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
    try {
        const { text, targetLanguage } = await request.json();

        if (!text || !targetLanguage) {
            return NextResponse.json(
                { error: '缺少必要參數：text 或 targetLanguage' },
                { status: 400 }
            );
        }

        // 語言代碼對應表
        const languageMap: { [key: string]: string } = {
            'en': 'English',
            'ja': 'Japanese',
            'fr': 'French',
            'de': 'German',
            'es': 'Spanish',
            'it': 'Italian',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ru': 'Russian',
            'pt': 'Portuguese',
            'ar': 'Arabic',
            'hi': 'Hindi',
            'th': 'Thai',
            'vi': 'Vietnamese',
            'nl': 'Dutch'
        };

        const targetLanguageName = languageMap[targetLanguage];
        if (!targetLanguageName) {
            return NextResponse.json(
                { error: '不支援的語言代碼' },
                { status: 400 }
            );
        }

        const prompt = `請將以下文字翻譯成${targetLanguageName}，只回傳翻譯結果，不要包含任何解釋或額外文字：

原文：${text}

翻譯：`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "你是一個專業的翻譯助手，請準確翻譯用戶提供的文字。"
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.3,
        });

        const translatedText = completion.choices[0]?.message?.content?.trim();

        if (!translatedText) {
            return NextResponse.json(
                { error: '翻譯失敗' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            originalText: text,
            translatedText: translatedText,
            targetLanguage: targetLanguage,
            targetLanguageName: targetLanguageName,
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
        console.error('翻譯API錯誤:', error);
        return NextResponse.json(
            { error: '翻譯服務暫時無法使用，請稍後再試' },
            { status: 500 }
        );
    }
}
