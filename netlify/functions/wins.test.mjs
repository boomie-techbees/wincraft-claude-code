import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock @netlify/blobs
const mockStore = {
  get: vi.fn(),
  setJSON: vi.fn(),
};
vi.mock('@netlify/blobs', () => ({
  getStore: vi.fn(() => mockStore),
}));

// Import after mock is set up
const { default: handler } = await import('./wins.mjs');

const MOCK_USER_ID = 'user-123';
const MOCK_CONTEXT = {
  clientContext: { user: { sub: MOCK_USER_ID } },
};

function makeRequest(method, body = null) {
  return {
    method,
    json: body ? () => Promise.resolve(body) : undefined,
  };
}

function jsonResponse(body) {
  return JSON.stringify(body);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStore.get.mockResolvedValue([]);
  mockStore.setJSON.mockResolvedValue(undefined);
});

// --- Auth ---

describe('auth', () => {
  it('returns 401 when no user in context', async () => {
    const res = await handler(makeRequest('GET'), {});
    expect(res.status).toBe(401);
  });
});

// --- GET ---

describe('GET /wins', () => {
  it('returns empty array when no wins', async () => {
    mockStore.get.mockResolvedValue(null);
    const res = await handler(makeRequest('GET'), MOCK_CONTEXT);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it('returns stored wins', async () => {
    const wins = [{ id: '1', text: 'Win A', date: new Date().toISOString(), tags: [] }];
    mockStore.get.mockResolvedValue(wins);
    const res = await handler(makeRequest('GET'), MOCK_CONTEXT);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(wins);
  });
});

// --- POST ---

describe('POST /wins', () => {
  it('creates a win and returns it', async () => {
    const res = await handler(makeRequest('POST', { text: 'Shipped a feature', tags: ['work'] }), MOCK_CONTEXT);
    expect(res.status).toBe(201);
    const win = await res.json();
    expect(win.id).toBeDefined();
    expect(win.text).toBe('Shipped a feature');
    expect(win.tags).toEqual(['work']);
    expect(win.date).toBeDefined();
    expect(mockStore.setJSON).toHaveBeenCalledOnce();
  });

  it('trims whitespace from text', async () => {
    const res = await handler(makeRequest('POST', { text: '  Fixed a bug  ', tags: [] }), MOCK_CONTEXT);
    expect(res.status).toBe(201);
    const win = await res.json();
    expect(win.text).toBe('Fixed a bug');
  });

  it('rejects empty text', async () => {
    const res = await handler(makeRequest('POST', { text: '', tags: [] }), MOCK_CONTEXT);
    expect(res.status).toBe(400);
  });

  it('rejects text over 5000 chars', async () => {
    const res = await handler(makeRequest('POST', { text: 'a'.repeat(5001), tags: [] }), MOCK_CONTEXT);
    expect(res.status).toBe(400);
  });

  it('rejects more than 20 tags', async () => {
    const tags = Array.from({ length: 21 }, (_, i) => `tag${i}`);
    const res = await handler(makeRequest('POST', { text: 'Valid', tags }), MOCK_CONTEXT);
    expect(res.status).toBe(400);
  });

  it('rejects when win limit reached', async () => {
    mockStore.get.mockResolvedValue(Array(500).fill({ id: 'x', text: 'x', date: '', tags: [] }));
    const res = await handler(makeRequest('POST', { text: 'One more', tags: [] }), MOCK_CONTEXT);
    expect(res.status).toBe(400);
  });

  it('prepends new win to existing wins', async () => {
    const existing = [{ id: 'old', text: 'Old win', date: '', tags: [] }];
    mockStore.get.mockResolvedValue(existing);
    await handler(makeRequest('POST', { text: 'New win', tags: [] }), MOCK_CONTEXT);
    const saved = mockStore.setJSON.mock.calls[0][1];
    expect(saved[0].text).toBe('New win');
    expect(saved[1].text).toBe('Old win');
  });
});

// --- PATCH ---

describe('PATCH /wins (archive)', () => {
  it('archives a win', async () => {
    const wins = [{ id: 'abc', text: 'A win', date: '', tags: [], archived: false }];
    mockStore.get.mockResolvedValue(wins);
    const res = await handler(makeRequest('PATCH', { id: 'abc', archived: true }), MOCK_CONTEXT);
    expect(res.status).toBe(200);
    const saved = mockStore.setJSON.mock.calls[0][1];
    expect(saved[0].archived).toBe(true);
  });

  it('unarchives a win', async () => {
    const wins = [{ id: 'abc', text: 'A win', date: '', tags: [], archived: true }];
    mockStore.get.mockResolvedValue(wins);
    const res = await handler(makeRequest('PATCH', { id: 'abc', archived: false }), MOCK_CONTEXT);
    expect(res.status).toBe(200);
    const saved = mockStore.setJSON.mock.calls[0][1];
    expect(saved[0].archived).toBe(false);
  });

  it('returns 404 for unknown id', async () => {
    mockStore.get.mockResolvedValue([{ id: 'abc', text: 'x', date: '', tags: [] }]);
    const res = await handler(makeRequest('PATCH', { id: 'nope', archived: true }), MOCK_CONTEXT);
    expect(res.status).toBe(404);
  });

  it('rejects non-boolean archived value', async () => {
    const res = await handler(makeRequest('PATCH', { id: 'abc', archived: 'yes' }), MOCK_CONTEXT);
    expect(res.status).toBe(400);
  });
});

// --- DELETE ---

describe('DELETE /wins', () => {
  it('removes a win by id', async () => {
    const wins = [
      { id: 'keep', text: 'Keep me', date: '', tags: [] },
      { id: 'gone', text: 'Delete me', date: '', tags: [] },
    ];
    mockStore.get.mockResolvedValue(wins);
    const res = await handler(makeRequest('DELETE', { id: 'gone' }), MOCK_CONTEXT);
    expect(res.status).toBe(200);
    const saved = mockStore.setJSON.mock.calls[0][1];
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe('keep');
  });

  it('rejects missing id', async () => {
    const res = await handler(makeRequest('DELETE', {}), MOCK_CONTEXT);
    expect(res.status).toBe(400);
  });
});

// --- Unknown method ---

describe('unknown method', () => {
  it('returns 405', async () => {
    const res = await handler(makeRequest('PUT'), MOCK_CONTEXT);
    expect(res.status).toBe(405);
  });
});
