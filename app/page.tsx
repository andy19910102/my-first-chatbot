'use client';

import { useState } from 'react';

interface Message {
  text: string;
  timestamp: string;
  isUser: boolean;
  audio?: string; // 新增音頻base64數據
  translations?: { [key: string]: string }; // 新增翻譯結果
}

// 語言選項
const languages = [
  { code: 'en', name: '英文' },
  { code: 'ja', name: '日文' },
  { code: 'fr', name: '法文' },
  { code: 'de', name: '德文' },
  { code: 'es', name: '西班牙文' },
  { code: 'it', name: '義大利文' },
  { code: 'ko', name: '韓文' },
  { code: 'zh', name: '中文' },
  { code: 'ru', name: '俄文' },
  { code: 'pt', name: '葡萄牙文' },
  { code: 'ar', name: '阿拉伯文' },
  { code: 'hi', name: '印地文' },
  { code: 'th', name: '泰文' },
  { code: 'vi', name: '越南文' },
  { code: 'nl', name: '荷蘭文' }
];

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [generatingTTS, setGeneratingTTS] = useState<string | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<{ [key: number]: string }>({});
  const [translatingMessages, setTranslatingMessages] = useState<{ [key: number]: boolean }>({});
  const [playingTranslationAudio, setPlayingTranslationAudio] = useState<string | null>(null);
  const [generatingTranslationTTS, setGeneratingTranslationTTS] = useState<string | null>(null);

  // 處理語言選擇變更
  const handleLanguageChange = async (messageIndex: number, languageCode: string) => {
    if (!languageCode) {
      setSelectedLanguages(prev => ({
        ...prev,
        [messageIndex]: ''
      }));
      return;
    }

    setSelectedLanguages(prev => ({
      ...prev,
      [messageIndex]: languageCode
    }));

    // 如果選擇了語言，立即進行翻譯
    if (languageCode) {
      await translateMessage(messageIndex, languageCode);
    }
  };

  // 翻譯訊息
  const translateMessage = async (messageIndex: number, targetLanguage: string) => {
    const message = messages[messageIndex];
    if (!message || message.isUser) return;

    setTranslatingMessages(prev => ({
      ...prev,
      [messageIndex]: true
    }));

    try {
      const response = await fetch('/api/lang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message.text,
          targetLanguage: targetLanguage
        }),
      });

      if (!response.ok) {
        throw new Error('翻譯請求失敗');
      }

      const data = await response.json();

      // 更新訊息的翻譯結果
      setMessages(prev => prev.map((msg, index) => {
        if (index === messageIndex) {
          return {
            ...msg,
            translations: {
              ...msg.translations,
              [targetLanguage]: data.translatedText
            }
          };
        }
        return msg;
      }));

    } catch (error) {
      console.error('翻譯錯誤:', error);
      // 可以添加錯誤提示
    } finally {
      setTranslatingMessages(prev => ({
        ...prev,
        [messageIndex]: false
      }));
    }
  };

  // 播放音頻的函數
  const playAudio = async (base64Audio: string, isTranslation: boolean = false, audioKey?: string) => {
    try {
      // 將base64轉換為blob
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio(audioUrl);

      if (isTranslation && audioKey) {
        setPlayingTranslationAudio(audioKey);
      } else {
        setPlayingAudio(base64Audio);
      }

      audio.onended = () => {
        if (isTranslation && audioKey) {
          setPlayingTranslationAudio(null);
        } else {
          setPlayingAudio(null);
        }
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        if (isTranslation && audioKey) {
          setPlayingTranslationAudio(null);
        } else {
          setPlayingAudio(null);
        }
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('播放音頻時發生錯誤:', error);
      if (isTranslation && audioKey) {
        setPlayingTranslationAudio(null);
      } else {
        setPlayingAudio(null);
      }
    }
  };

  // 生成TTS音頻
  const generateTTS = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('TTS API 請求失敗');
      }

      const data = await response.json();
      return data.audio;
    } catch (error) {
      console.error('生成TTS時發生錯誤:', error);
      return null;
    }
  };

  // 播放翻譯音頻
  const playTranslationAudio = async (translatedText: string, messageIndex: number, languageCode: string) => {
    const audioKey = `${messageIndex}-${languageCode}`;

    try {
      setGeneratingTranslationTTS(translatedText);

      const audioData = await generateTTS(translatedText);

      if (audioData) {
        await playAudio(audioData, true, audioKey);
      }
    } catch (error) {
      console.error('播放翻譯音頻時發生錯誤:', error);
    } finally {
      setGeneratingTranslationTTS(null);
    }
  };

  const handleSubmit = async () => {
    if (inputText.trim() && !isLoading) {
      const now = new Date();
      const timestamp = now.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '.');

      // 新增使用者訊息
      const userMessage: Message = {
        text: inputText,
        timestamp: timestamp,
        isUser: true
      };

      setMessages(prev => [userMessage, ...prev]);
      setInputText('');
      setIsLoading(true);

      try {
        // 發送請求到 API
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputText }),
        });

        if (!response.ok) {
          throw new Error('API 請求失敗');
        }

        const data = await response.json();

        // 生成TTS音頻（可選，失敗不影響聊天）
        let audioData = null;
        setGeneratingTTS(data.response);
        try {
          audioData = await generateTTS(data.response);
        } catch (error) {
          console.warn('TTS生成失敗，但不影響聊天功能:', error);
        } finally {
          setGeneratingTTS(null);
        }

        // 新增 AI 回應
        const aiMessage: Message = {
          text: data.response,
          timestamp: data.timestamp,
          isUser: false,
          audio: audioData
        };

        setMessages(prev => [aiMessage, ...prev]);
      } catch (error) {
        console.error('錯誤:', error);
        // 新增錯誤訊息
        const errorMessage: Message = {
          text: '抱歉，發生錯誤，請稍後再試。',
          timestamp: new Date().toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).replace(/\//g, '.'),
          isUser: false
        };
        setMessages(prev => [errorMessage, ...prev]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <>
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* 標題 */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                來跟我的&ldquo;AI&rdquo;機器人聊天
              </h1>
              <p className="text-gray-600 text-lg">
                輸入您的問題，AI 將為您提供智能回應
              </p>
            </div>

            {/* 輸入區域 */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="請輸入文字..."
                disabled={isLoading}
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-0 focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-md focus:shadow-[0_0_30px_rgba(59,130,246,0.3)] focus:bg-white/90 relative disabled:opacity-50"
              />
              <button
                onClick={handleSubmit}
                disabled={isLoading || !inputText.trim()}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '處理中...' : '送出'}
              </button>
            </div>

            {/* 對話紀錄 */}
            <div className="space-y-4">
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md">
                    <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-t-lg rounded-br-lg shadow-sm">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">客服人員正在處理您的問題...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.isUser ? '' : 'w-full'}`}>
                    <div className={`px-4 py-3 rounded-lg shadow-sm ${message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg rounded-bl-lg'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-t-lg rounded-br-lg'
                      }`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm break-words flex-1">{message.text}</p>
                        {!message.isUser && (
                          generatingTTS === message.text ? (
                            <div className="flex-shrink-0 ml-2 p-1.5 rounded-full bg-gray-300 text-gray-600">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          ) : message.audio ? (
                            <button
                              onClick={() => playAudio(message.audio!)}
                              disabled={playingAudio === message.audio}
                              className="flex-shrink-0 ml-2 p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="播放語音"
                            >
                              {playingAudio === message.audio ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ) : null
                        )}
                      </div>
                    </div>
                    {/* 語言選擇下拉選單 - 只在AI回覆時顯示 */}
                    {!message.isUser && (
                      <div className="mt-2 mb-1">
                        <select
                          value={selectedLanguages[index] || ''}
                          onChange={(e) => handleLanguageChange(index, e.target.value)}
                          disabled={translatingMessages[index]}
                          className="w-32 px-2 py-1 text-xs border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="">選擇語言...</option>
                          {languages.map((language) => (
                            <option key={language.code} value={language.code}>
                              {language.name}
                            </option>
                          ))}
                        </select>

                        {/* 翻譯中指示器 */}
                        {translatingMessages[index] && (
                          <div className="mt-1 flex items-center space-x-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-spin"></div>
                            <span className="text-xs text-gray-500">翻譯中...</span>
                          </div>
                        )}

                        {/* 翻譯結果顯示 */}
                        {selectedLanguages[index] && message.translations && message.translations[selectedLanguages[index]] && (
                          <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-xs text-gray-600 mb-1">
                                  翻譯 ({languages.find(lang => lang.code === selectedLanguages[index])?.name}):
                                </div>
                                <div className="text-sm text-gray-800">
                                  {message.translations[selectedLanguages[index]]}
                                </div>
                              </div>

                              {/* 翻譯音頻播放按鈕 */}
                              <button
                                onClick={() => playTranslationAudio(
                                  message.translations![selectedLanguages[index]],
                                  index,
                                  selectedLanguages[index]
                                )}
                                disabled={generatingTranslationTTS === message.translations![selectedLanguages[index]] ||
                                  playingTranslationAudio === `${index}-${selectedLanguages[index]}`}
                                className="flex-shrink-0 ml-2 p-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="播放翻譯語音"
                              >
                                {generatingTranslationTTS === message.translations![selectedLanguages[index]] ? (
                                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : playingTranslationAudio === `${index}-${selectedLanguages[index]}` ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <p className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
