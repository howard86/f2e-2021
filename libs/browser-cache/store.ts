export interface CacheEntry<T = unknown> {
  expiresAt: number;
  storedAt: number;
  value: T;
}

export interface CacheStore {
  get: <T>(key: string) => Promise<CacheEntry<T> | undefined>;
  set: <T>(key: string, entry: CacheEntry<T>) => Promise<void>;
}

const DB_NAME = 'f2e-browser-cache';
const STORE_NAME = 'responses';
const EXPIRES_INDEX = 'expiresAt';

const promisify = <T>(request: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

// Drop every entry past its maxAge so the database doesn't grow with each
// distinct query typed into a search box.
const pruneExpired = (db: IDBDatabase) => {
  const index = db
    .transaction(STORE_NAME, 'readwrite')
    .objectStore(STORE_NAME)
    .index(EXPIRES_INDEX);
  const request = index.openCursor(IDBKeyRange.upperBound(Date.now()));

  request.onsuccess = () => {
    const cursor = request.result;
    if (cursor) {
      cursor.delete();
      cursor.continue();
    }
  };
};

const openDatabase = () => {
  const request = indexedDB.open(DB_NAME, 1);

  request.onupgradeneeded = () => {
    request.result
      .createObjectStore(STORE_NAME)
      .createIndex(EXPIRES_INDEX, EXPIRES_INDEX);
  };

  return promisify(request).then((db) => {
    pruneExpired(db);
    return db;
  });
};

let database: Promise<IDBDatabase> | undefined;

const createIndexedDbStore = (): CacheStore => {
  const getStore = async (mode: IDBTransactionMode) => {
    database ??= openDatabase();
    return (await database)
      .transaction(STORE_NAME, mode)
      .objectStore(STORE_NAME);
  };

  return {
    get: async <T>(key: string) =>
      promisify<CacheEntry<T> | undefined>(
        (await getStore('readonly')).get(key),
      ),
    set: async (key, entry) => {
      await promisify((await getStore('readwrite')).put(entry, key));
    },
  };
};

/** IndexedDB in the browser; undefined on the server or when it's blocked. */
export const getDefaultStore = (): CacheStore | undefined =>
  typeof indexedDB === 'undefined' ? undefined : createIndexedDbStore();
