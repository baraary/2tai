import type {
  AppState,
  CategoryItem,
  DeletedTombstones,
  SharedCloudPayload,
} from '../types/app';
import { sanitizeState } from './storageAndValidation';

const GIST_FILENAME = 'dotaee_m3_v2_data.json';
const LEGACY_GIST_FILENAME = 'dotaee_m3_data.json';
const TOMBSTONE_TTL_MS = 1000 * 60 * 60 * 24 * 60; // 60 days

function mergeTombstoneMaps(
  localMap: Record<string, number>,
  remoteMap: Record<string, number>
): Record<string, number> {
  const cutoff = Date.now() - TOMBSTONE_TTL_MS;
  const merged: Record<string, number> = {};
  for (const [id, ts] of Object.entries(localMap || {})) {
    if (ts >= cutoff) merged[id] = ts;
  }
  for (const [id, ts] of Object.entries(remoteMap || {})) {
    if (ts >= cutoff) {
      merged[id] = Math.max(merged[id] || 0, ts);
    }
  }
  return merged;
}

function mergeEntityArray<T extends { id: string; updatedAt: number }>(
  localList: T[],
  remoteList: T[],
  deletedMap: Record<string, number>
): T[] {
  const byId = new Map<string, T>();

  for (const item of remoteList) {
    const delTs = deletedMap[item.id] || 0;
    if (delTs >= item.updatedAt) continue;
    byId.set(item.id, item);
  }

  for (const item of localList) {
    const delTs = deletedMap[item.id] || 0;
    if (delTs >= item.updatedAt) continue;
    const existing = byId.get(item.id);
    if (!existing || item.updatedAt >= existing.updatedAt) {
      byId.set(item.id, item);
    }
  }

  return Array.from(byId.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

function mergeCategories(localCats: CategoryItem[], remoteCats: CategoryItem[]): CategoryItem[] {
  const map = new Map<string, CategoryItem>();
  for (const c of remoteCats) map.set(c.name, c);
  for (const c of localCats) {
    if (!map.has(c.name)) map.set(c.name, c);
  }
  return Array.from(map.values());
}

/**
 * Item-level 3-way merge using per-item `updatedAt` and `deletedIds` tombstones.
 * Prevents concurrent edits from Partner 1 and Partner 2 from overwriting each other!
 * Keeps local-only private wishes (`localOnly: true`) strictly on the current device.
 */
export function mergeStates(local: AppState, remoteRaw: unknown): AppState {
  const remote = sanitizeState(remoteRaw, local);

  const mergedDeleted: DeletedTombstones = {
    events: mergeTombstoneMaps(local.deletedIds.events, remote.deletedIds.events),
    shopping: mergeTombstoneMaps(local.deletedIds.shopping, remote.deletedIds.shopping),
    pantry: mergeTombstoneMaps(local.deletedIds.pantry, remote.deletedIds.pantry),
    tasks: mergeTombstoneMaps(local.deletedIds.tasks, remote.deletedIds.tasks),
    wishes: mergeTombstoneMaps(local.deletedIds.wishes, remote.deletedIds.wishes),
    memories: mergeTombstoneMaps(local.deletedIds.memories, remote.deletedIds.memories),
  };

  // Preserve device-local-only wishes untouched while merging shared wishes
  const localOnlyWishes = local.wishes.filter((w) => w.localOnly);
  const localSharedWishes = local.wishes.filter((w) => !w.localOnly);
  const remoteSharedWishes = remote.wishes.filter((w) => !w.localOnly);
  const mergedSharedWishes = mergeEntityArray(localSharedWishes, remoteSharedWishes, mergedDeleted.wishes);

  const localNewer = local.lastUpdated >= remote.lastUpdated;

  const mergeQuickNudge = () => {
    const a = local.quickNudge;
    const b = remote.quickNudge;
    if (!a && !b) return null;
    if (a && !b) return a;
    if (!a && b) return b;
    if (a && b) {
      if (a.id === b.id) {
        return { ...a, seenBy: a.seenBy || b.seenBy || null };
      }
      return a.createdAt >= b.createdAt ? a : b;
    }
    return null;
  };

  return {
    ...local,
    lastUpdated: Math.max(local.lastUpdated, remote.lastUpdated),
    isInitialized: local.isInitialized || remote.isInitialized,
    partners: localNewer ? local.partners : remote.partners,
    partnerAvatars: localNewer ? local.partnerAvatars : remote.partnerAvatars,
    dailyPulse: {
      p1:
        local.dailyPulse.p1.updatedAt >= remote.dailyPulse.p1.updatedAt
          ? local.dailyPulse.p1
          : remote.dailyPulse.p1,
      p2:
        local.dailyPulse.p2.updatedAt >= remote.dailyPulse.p2.updatedAt
          ? local.dailyPulse.p2
          : remote.dailyPulse.p2,
    },
    quickNudge: mergeQuickNudge(),
    eventCategories: mergeCategories(local.eventCategories, remote.eventCategories),
    marketCategories: mergeCategories(local.marketCategories, remote.marketCategories),
    taskCategories: mergeCategories(local.taskCategories, remote.taskCategories),
    wishCategories: mergeCategories(local.wishCategories, remote.wishCategories),
    events: mergeEntityArray(local.events, remote.events, mergedDeleted.events),
    shopping: mergeEntityArray(local.shopping, remote.shopping, mergedDeleted.shopping),
    pantry: mergeEntityArray(local.pantry, remote.pantry, mergedDeleted.pantry),
    tasks: mergeEntityArray(local.tasks, remote.tasks, mergedDeleted.tasks),
    wishes: [...localOnlyWishes, ...mergedSharedWishes].sort((a, b) => b.updatedAt - a.updatedAt),
    memories: mergeEntityArray(local.memories, remote.memories, mergedDeleted.memories),
    deletedIds: mergedDeleted,
  };
}

export function buildSharedCloudPayload(state: AppState): SharedCloudPayload {
  return {
    schemaVersion: 3,
    lastUpdated: state.lastUpdated || Date.now(),
    isInitialized: true,
    partners: state.partners,
    partnerAvatars: state.partnerAvatars,
    dailyPulse: state.dailyPulse,
    quickNudge: state.quickNudge,
    eventCategories: state.eventCategories,
    marketCategories: state.marketCategories,
    taskCategories: state.taskCategories,
    wishCategories: state.wishCategories,
    events: state.events,
    shopping: state.shopping,
    pantry: state.pantry,
    tasks: state.tasks,
    // Strip local-only private wishes so surprise ideas never leave this device!
    wishes: state.wishes.filter((w) => !w.localOnly),
    memories: state.memories,
    deletedIds: state.deletedIds,
  };
}

export interface PullGistResult {
  status: 'updated' | 'not_modified' | 'error';
  data?: unknown;
  etag?: string | null;
  errorMessage?: string;
}

export async function fetchGistRemote(
  token: string,
  gistId: string,
  lastEtag?: string | null
): Promise<PullGistResult> {
  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    };
    if (lastEtag) {
      headers['If-None-Match'] = lastEtag;
    }

    const res = await fetch(`https://api.github.com/gists/${encodeURIComponent(gistId)}`, {
      method: 'GET',
      headers,
      cache: 'no-cache',
    });

    if (res.status === 304) {
      return { status: 'not_modified', etag: lastEtag };
    }

    if (!res.ok) {
      return {
        status: 'error',
        errorMessage: res.status === 401 ? 'توکن گیت‌هاب نامعتبر است' : `خطای گیت‌هاب (${res.status})`,
      };
    }

    const newEtag = res.headers.get('ETag');
    const gist = (await res.json()) as {
      files?: Record<string, { content?: string }>;
    };
    const fileObj = gist.files?.[GIST_FILENAME] || gist.files?.[LEGACY_GIST_FILENAME];
    if (!fileObj?.content) {
      return { status: 'not_modified', etag: newEtag };
    }

    const parsed = JSON.parse(fileObj.content);
    return { status: 'updated', data: parsed, etag: newEtag };
  } catch {
    return { status: 'error', errorMessage: 'خطا در اتصال به گیت‌هاب' };
  }
}

export interface PushGistResult {
  ok: boolean;
  gistId?: string;
  etag?: string | null;
  errorMessage?: string;
}

export async function pushGistRemote(
  token: string,
  gistId: string,
  payload: SharedCloudPayload
): Promise<PushGistResult> {
  try {
    const url = gistId
      ? `https://api.github.com/gists/${encodeURIComponent(gistId)}`
      : 'https://api.github.com/gists';

    const res = await fetch(url, {
      method: gistId ? 'PATCH' : 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'Dotaee Couple App Cloud Sync',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(payload, null, 2),
          },
        },
      }),
    });

    if (!res.ok) {
      return {
        ok: false,
        errorMessage: res.status === 401 ? 'توکن گیت‌هاب نامعتبر است' : `خطای ذخیره ابری (${res.status})`,
      };
    }

    const data = (await res.json()) as { id: string };
    return {
      ok: true,
      gistId: data.id,
      etag: res.headers.get('ETag'),
    };
  } catch {
    return { ok: false, errorMessage: 'خطا در ارتباط با گیت‌هاب' };
  }
}
