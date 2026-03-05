import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// 获取历史记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default';

    const { data, error } = await supabase
      .from('history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: '获取历史记录失败' },
        { status: 500 }
      );
    }

    // 格式化返回数据
    const formattedData = data?.map(item => ({
      id: item.id,
      title: item.title,
      style: item.style,
      content: item.content,
      createdAt: new Date(item.created_at).toLocaleString('zh-CN'),
    })) || [];

    return NextResponse.json({ history: formattedData });

  } catch (error) {
    console.error('Get history error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 保存历史记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, style, content, userId = 'default' } = body;

    if (!title || !style || !content) {
      return NextResponse.json(
        { error: '缺少必填参数' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('history')
      .insert([
        {
          title,
          style,
          content,
          user_id: userId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { error: '保存历史记录失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        style: data.style,
        content: data.content,
        createdAt: new Date(data.created_at).toLocaleString('zh-CN'),
      }
    });

  } catch (error) {
    console.error('Save history error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 删除单条历史记录
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '缺少记录ID' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('history')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json(
        { error: '删除失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete history error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}
