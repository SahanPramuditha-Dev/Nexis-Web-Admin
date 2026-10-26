/**
 * IndexedDB lightweight wrapper for offline-first telemetry caching
 * Zero-dependency native IndexedDB implementation
 */

const DB_NAME = 'nexis_admin_cache';
const DB_VERSION = 1;

export interface CacheMetadata {
  key: string;
  lastUpdated: number;
}

class IndexedDBCache {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return Promise.reject(new Error('IndexedDB not supported in this environment'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('telemetry_records')) {
            const store = db.createObjectStore('telemetry_records', { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('status', 'status', { unique: false });
          }
          if (!db.objectStoreNames.contains('probe_devices')) {
            db.createObjectStore('probe_devices', { keyPath: 'deviceId' });
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'key' });
          }
        };

        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    }

    return this.dbPromise;
  }

  public async getMetadata(key: string): Promise<number | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve) => {
        const tx = db.transaction('metadata', 'readonly');
        const store = tx.objectStore('metadata');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result ? req.result.lastUpdated : null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  public async setMetadata(key: string, lastUpdated: number): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('metadata', 'readwrite');
        const store = tx.objectStore('metadata');
        const req = store.put({ key, lastUpdated });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('Failed to set metadata in IndexedDB', e);
    }
  }

  public async getAllRecords<T>(storeName: 'telemetry_records' | 'probe_devices'): Promise<T[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  public async putRecords<T>(storeName: 'telemetry_records' | 'probe_devices', items: T[]): Promise<void> {
    if (!items || items.length === 0) return;
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        for (const item of items) {
          store.put(item);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn(`Failed to put items into ${storeName}`, e);
    }
  }

  public async deleteRecord(storeName: 'telemetry_records' | 'probe_devices', id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`Failed to delete record ${id} from ${storeName}`, e);
    }
  }

  public async clearStore(storeName: 'telemetry_records' | 'probe_devices'): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn(`Failed to clear ${storeName}`, e);
    }
  }
}

export const localCache = new IndexedDBCache();
