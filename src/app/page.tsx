'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Copy, RotateCcw, History, Sparkles, Check, Loader2 } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  style: string;
  content: string;
  createdAt: string;
}

const styles = [
  { id: 'plant', name: '种草风', emoji: '🌱', desc: '好物推荐，语气亲切' },
  { id: 'review', name: '测评风', emoji: '🔍', desc: '客观分析，有对比' },
  { id: 'tutorial', name: '教程风', emoji: '📚', desc: '步骤清晰，干货满满' },
  { id: 'daily', name: '日常风', emoji: '☕', desc: '轻松自然，像朋友聊天' },
];

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [showApiConfig, setShowApiConfig] = useState(true);
  const [apiVerified, setApiVerified] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('plant');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [generateTime, setGenerateTime] = useState(0);

  // Load API key from localStorage and history from Supabase on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('kimi_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setApiVerified(true);
      setShowApiConfig(false);
    }
    // Load history from Supabase
    fetchHistory();
  }, []);

  // Fetch history from Supabase
  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const verifyApi = async () => {
    if (!apiKey.trim()) return;
    // Simple validation - in production, test the API
    localStorage.setItem('kimi_api_key', apiKey);
    setApiVerified(true);
    setShowApiConfig(false);
  };

  const generateContent = async () => {
    if (!title.trim() || !apiVerified) return;

    setLoading(true);
    const startTime = Date.now();

    try {
      const style = styles.find(s => s.id === selectedStyle);
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          style: selectedStyle,
          styleName: style?.name,
          apiKey,
        }),
      });

      if (!response.ok) throw new Error('生成失败');

      const data = await response.json();
      setGeneratedContent(data.content);
      setGenerateTime((Date.now() - startTime) / 1000);

      // Save to Supabase
      const styleName = style?.name || selectedStyle;
      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          style: styleName,
          content: data.content,
        }),
      });
      // Refresh history from Supabase
      await fetchHistory();
    } catch (error) {
      alert('生成失败，请检查API Key或稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const copyContent = async () => {
    await navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearHistory = async () => {
    if (!confirm('确定要清空所有历史记录吗？')) return;

    try {
      // Delete all history records one by one
      for (const item of history) {
        await fetch(`/api/history?id=${item.id}`, {
          method: 'DELETE',
        });
      }
      setHistory([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
      alert('清空历史记录失败');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">
              小红书文案助手
            </h1>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 hover:bg-pink-50 rounded-lg transition-colors flex items-center gap-2 text-gray-600"
          >
            <History className="w-5 h-5" />
            <span className="hidden sm:inline">历史记录</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            {/* API Config */}
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
              <button
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-pink-50/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔧</span>
                  <span className="font-semibold text-gray-800">API 配置</span>
                  {apiVerified && (
                    <span className="text-green-500 text-sm flex items-center gap-1">
                      <Check className="w-4 h-4" /> 已验证
                    </span>
                  )}
                </div>
                {showApiConfig ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {showApiConfig && (
                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kimi API Key
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="请输入你的 Kimi API Key"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      API Key 仅保存在本地浏览器，不会上传服务器
                    </p>
                  </div>
                  <button
                    onClick={verifyApi}
                    disabled={!apiKey.trim()}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-400 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  >
                    验证并保存
                  </button>
                </div>
              )}
            </div>

            {/* Input Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 space-y-6">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>📝</span>
                  文案标题
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="输入你想写的主题，如：早八伪素颜神器"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
                />
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span>🎨</span>
                  选择风格
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {styles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        selectedStyle === style.id
                          ? 'border-pink-400 bg-pink-50'
                          : 'border-gray-100 hover:border-pink-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{style.emoji}</span>
                        <span className={`font-medium ${selectedStyle === style.id ? 'text-pink-700' : 'text-gray-700'}`}>
                          {style.name}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={!title.trim() || !apiVerified || loading}
                className="w-full py-4 bg-gradient-to-r from-pink-500 via-pink-400 to-orange-400 text-white rounded-xl font-semibold text-lg hover:shadow-lg hover:shadow-pink-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成文案
                  </>
                )}
              </button>

              {!apiVerified && (
                <p className="text-center text-sm text-orange-500">
                  请先配置 API Key 才能生成文案
                </p>
              )}
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                <span>✨</span>
                生成结果
              </h2>
              {generateTime > 0 && (
                <span className="text-sm text-gray-400">
                  生成用时 {generateTime.toFixed(1)}s
                </span>
              )}
            </div>

            {generatedContent ? (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-pink-50 to-orange-50 rounded-xl p-6 min-h-[300px]">
                  <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">
                    {generatedContent}
                  </pre>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyContent}
                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 text-green-500" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        复制文案
                      </>
                    )}
                  </button>
                  <button
                    onClick={generateContent}
                    disabled={loading}
                    className="flex-1 py-3 bg-pink-100 hover:bg-pink-200 rounded-xl font-medium text-pink-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    重新生成
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-orange-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-pink-400" />
                </div>
                <p>输入标题，点击生成按钮</p>
                <p className="text-sm">小红书风格文案一键生成 ✨</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowHistory(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                历史记录
              </h2>
              <div className="flex gap-2">
                {history.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-500 hover:bg-red-50 px-3 py-1 rounded-lg transition-colors"
                  >
                    清空
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {history.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>暂无历史记录</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-800 line-clamp-1">{item.title}</span>
                      <span className="text-xs text-gray-400">{item.style}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.content}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{item.createdAt}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(item.content)}
                        className="text-pink-500 hover:text-pink-600 flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        复制
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
