import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, model, fileIds = [] } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "OpenAI-Organization": process.env.OPENAI_ORGANIZATION!,
      },
      body: JSON.stringify({
        model: model || "gpt-3.5-turbo",
        messages,
        stream: true,
        ...(fileIds.length > 0 && { file_ids: fileIds }),
      }),
    });

    // Handle non-OK status codes (like 401, 429, 500)
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `OpenAI API Error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    // All good — stream response to client
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `Internal Error: ${error.message}` },
      { status: 500 }
    );
  }
}
