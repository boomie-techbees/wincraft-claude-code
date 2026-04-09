import { getStore } from '@netlify/blobs';

const MAX_WINS = 500;
const MAX_TEXT_LENGTH = 5000;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

function getUserId(context) {
  return context.clientContext?.user?.sub || null;
}

function validateWinInput(text, tags) {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return 'Win text is required.';
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return `Win text must be under ${MAX_TEXT_LENGTH} characters.`;
  }
  if (!Array.isArray(tags)) {
    return 'Tags must be an array.';
  }
  if (tags.length > MAX_TAGS) {
    return `Too many tags (max ${MAX_TAGS}).`;
  }
  for (const tag of tags) {
    if (typeof tag !== 'string' || tag.length > MAX_TAG_LENGTH) {
      return `Each tag must be a string under ${MAX_TAG_LENGTH} characters.`;
    }
  }
  return null;
}

export default async (req, context) => {
  const userId = getUserId(context);
  if (!userId) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const store = getStore('wins');

  if (req.method === 'GET') {
    try {
      const wins = (await store.get(userId, { type: 'json' })) || [];
      return new Response(JSON.stringify(wins), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('wins GET error:', err);
      return new Response(JSON.stringify({ error: 'Failed to load wins' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const tags = Array.isArray(body.tags)
        ? body.tags.map(t => String(t).trim()).filter(Boolean)
        : [];

      const validationError = validateWinInput(text, tags);
      if (validationError) {
        return new Response(JSON.stringify({ error: validationError }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const wins = (await store.get(userId, { type: 'json' })) || [];
      if (wins.length >= MAX_WINS) {
        return new Response(JSON.stringify({ error: `Win limit reached (max ${MAX_WINS}).` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const win = {
        id: crypto.randomUUID(),
        text,
        date: new Date().toISOString(),
        tags,
      };

      wins.unshift(win);
      await store.setJSON(userId, wins);

      return new Response(JSON.stringify(win), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('wins POST error:', err);
      return new Response(JSON.stringify({ error: 'Failed to save win' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, archived } = await req.json();
      if (!id || typeof id !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid win ID.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      if (typeof archived !== 'boolean') {
        return new Response(JSON.stringify({ error: 'archived must be a boolean.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const wins = (await store.get(userId, { type: 'json' })) || [];
      const win = wins.find(w => w.id === id);
      if (!win) {
        return new Response(JSON.stringify({ error: 'Win not found.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      win.archived = archived;
      await store.setJSON(userId, wins);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('wins PATCH error:', err);
      return new Response(JSON.stringify({ error: 'Failed to update win' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = await req.json();
      if (!id || typeof id !== 'string') {
        return new Response(JSON.stringify({ error: 'Invalid win ID.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const wins = (await store.get(userId, { type: 'json' })) || [];
      const updated = wins.filter(w => w.id !== id);
      await store.setJSON(userId, updated);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('wins DELETE error:', err);
      return new Response(JSON.stringify({ error: 'Failed to delete win' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return new Response('Method not allowed', { status: 405 });
};
