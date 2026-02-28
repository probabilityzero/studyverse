import { Hono } from 'hono';
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import { getBaseDir } from '../context';

type Message = { role: 'user' | 'assistant' | 'system'; content: string };

export function registerAiRoute(app: Hono) {
  app.post('/api/ai/chat', async (c) => {
    try {
      const body = await c.req.json();
      const { path: filePath, messages } = body as { path: string; messages: Message[] };
      if (!filePath || !Array.isArray(messages)) return c.json({ error: 'Bad request' }, 400);

      const BASE_DIR = getBaseDir();
      const rel = String(filePath).replace(/^[/\\]+/, '');
      const fullPath = path.join(BASE_DIR, rel);
      if (!fullPath.startsWith(BASE_DIR)) return c.json({ error: 'Access denied' }, 403);

      // read file content (safely)
      let fileContent = '';
      try {
        fileContent = await fs.readFile(fullPath, 'utf-8');
      } catch (e) {
        fileContent = '';
      }

      const excerpt = fileContent.slice(0, 60_000);

      const system = `You are a code assistant that can suggest edits to files. When suggesting edits return JSON object with key \"edit\" containing { type:'replace'|'patch', content: string }. Otherwise return plain text user-friendly reply. File path: ${rel}. Context (truncated):\n${excerpt}`;

      // Try Groq first if key provided
      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      const GPT_OSS_URL = process.env.GPT_OSS_URL;

      let replyText = '';

      if (GROQ_API_KEY) {
        const payload = {
          model: 'groq-1',
          prompt: [
            { role: 'system', content: system },
            ...messages,
          ],
          max_tokens: 2000,
          temperature: 0.2,
        };

        const resp = await fetch('https://api.groq.ai/v1/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const t = await resp.text();
          return c.json({ error: 'LLM error', details: t }, 500);
        }
        const data = await resp.json();
        // groq response can vary; try common fields
        replyText = data?.choices?.[0]?.text ?? data?.output ?? JSON.stringify(data);
      } else if (GPT_OSS_URL) {
        // Forward to a GPT OSS compatible endpoint (expect it to accept messages)
        const resp = await fetch(GPT_OSS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [{ role: 'system', content: system }, ...messages] }),
        });
        if (!resp.ok) {
          const t = await resp.text();
          return c.json({ error: 'LLM error', details: t }, 500);
        }
        const data = await resp.json();
        replyText = data?.reply ?? data?.output ?? data?.text ?? JSON.stringify(data);
      } else {
        return c.json({ error: 'No LLM configured. Set GROQ_API_KEY or GPT_OSS_URL' }, 500);
      }

      // Try parse JSON edit
      let suggestedEdit: null | { type: string; content: string } = null;
      try {
        const parsed = JSON.parse(replyText);
        if (parsed?.edit) suggestedEdit = parsed.edit;
      } catch (e) {
        // try to find JSON in text
        const m = replyText.match(/\{[\s\S]*\}/);
        if (m) {
          try {
            const parsed2 = JSON.parse(m[0]);
            if (parsed2?.edit) suggestedEdit = parsed2.edit;
          } catch (e) {
            // ignore
          }
        }
      }

      return c.json({ reply: replyText, suggestedEdit });
    } catch (err) {
      console.error(err);
      return c.json({ error: 'Server error' }, 500);
    }
  });
}
