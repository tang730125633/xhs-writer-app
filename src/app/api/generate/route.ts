import { NextRequest, NextResponse } from 'next/server';

interface GenerateRequest {
  title: string;
  style: string;
  styleName?: string;
  apiKey: string;
}

// 小红书风格 Prompt 模板
const stylePrompts: Record<string, string> = {
  plant: `你是一位专业的小红书种草博主，擅长用亲切的语气推荐好物。
请根据以下主题生成一篇种草风格的小红书文案：

要求：
1. 标题要有吸引力，带2-3个emoji
2. 开头用"姐妹们！""谁懂啊！"等小红书流行语
3. 正文分段清晰，每段3-4行，多用emoji增加趣味性
4. 语气亲切热情，像闺蜜推荐好物
5. 突出产品/事物的优点，让人产生购买/尝试欲望
6. 结尾带5-8个相关话题标签（#）
7. 总字数控制在200-400字

主题：`,

  review: `你是一位客观专业的小红书测评博主，擅长深度分析产品优缺点。
请根据以下主题生成一篇测评风格的小红书文案：

要求：
1. 标题要客观但有吸引力，带2-3个emoji
2. 开头简要介绍测评对象
3. 正文包含：优点（✅）、缺点（⚠️）、适合人群
4. 分段清晰，每段有明确主题
5. 语气客观理性，有真实感
6. 给出明确的使用建议或购买建议
7. 结尾带5-8个相关话题标签（#）
8. 总字数控制在250-450字

主题：`,

  tutorial: `你是一位干货满满的小红书教程博主，擅长分享实用技巧。
请根据以下主题生成一篇教程风格的小红书文案：

要求：
1. 标题要明确是教程，带2-3个emoji
2. 开头说明这个教程能解决什么问题
3. 正文用Step 1/2/3或①②③分步骤讲解
4. 每个步骤简洁明了，有具体操作指导
5. 适当使用emoji增加可读性
6. 结尾有总结或注意事项
7. 结尾带5-8个相关话题标签（#）
8. 总字数控制在250-450字

主题：`,

  daily: `你是一位热爱生活的小红书日常博主，擅长分享生活中的小确幸。
请根据以下主题生成一篇日常风格的小红书文案：

要求：
1. 标题轻松随意，带2-3个emoji
2. 开头像跟朋友聊天一样自然
3. 正文讲述一个生活片段或心情分享
4. 语气轻松、真实、有"人味儿"
5. 分段自然，不要太刻意
6. 可以适当吐槽或表达小情绪
7. 结尾带3-5个相关话题标签（#）
8. 总字数控制在150-300字

主题：`,
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { title, style, apiKey } = body;

    // 验证必填参数
    if (!title || !style || !apiKey) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    // 获取对应风格的 prompt
    const basePrompt = stylePrompts[style] || stylePrompts.plant;
    const fullPrompt = `${basePrompt}"${title}"`;

    // 调用 Kimi API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的小红书内容创作者，擅长根据不同风格生成优质文案。你的文案总是带有合适的emoji、分段清晰、符合小红书用户的阅读习惯。',
          },
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
        temperature: 1,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Kimi API error:', errorData);

      if (response.status === 401) {
        return NextResponse.json(
          { error: 'API Key 无效，请检查后再试' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: '生成失败，请稍后重试' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      return NextResponse.json(
        { error: '生成内容为空，请重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: generatedContent,
      usage: data.usage,
    });

  } catch (error) {
    console.error('Generate API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
