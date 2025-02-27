class LocalCache {
  private cacheName: string;
  private db: IDBDatabase | null;

  constructor(cacheName = 'drpy') {
    this.cacheName = cacheName;
    this.db = null;
    this.initDatabase().then(() => {
      // Database is initialized, proceed with cache operations
      this.cacheExample();
    });
  }

  private async initDatabase() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.cacheName);

      request.onerror = () => {
        reject(new Error('Failed to open the cache database.'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = () => {
        this.db = request.result;

        if (!this.db.objectStoreNames.contains('cache')) {
          this.db.createObjectStore('cache');
        }
      };
    });
  }

  private getObjectStore(mode: IDBTransactionMode = 'readwrite') {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }

    const transaction = this.db.transaction('cache', mode);
    return transaction.objectStore('cache');
  }

  public async get(id: string, key: string, defaultValue: any = null) {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }

    return new Promise<any>((resolve, reject) => {
      const store = this.getObjectStore('readonly');
      const request = store.get(`${id}${key}`);

      request.onerror = () => {
        reject(new Error('Failed to get value from cache.'));
      };

      request.onsuccess = () => {
        const value = request.result ? request.result : defaultValue;
        resolve(value);
      };
    });
  }

  public async set(id: string, key: string, value: any) {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }
  
    return new Promise<void>((resolve, reject) => {
      const store = this.getObjectStore();
      const request = store.put(value, `${id}${key}`);
  
      request.onerror = () => {
        reject(new Error('Failed to set value in cache.'));
      };
  
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  public async delete(id: string, key: string) {
    if (!this.db) {
      throw new Error('Database is not initialized.');
    }

    return new Promise<void>((resolve, reject) => {
      const store = this.getObjectStore();
      const request = store.delete(`${id}${key}`);

      request.onerror = () => {
        reject(new Error('Failed to delete value from cache.'));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  private async cacheExample() {
    try {
      await this.set('bl', 'name', 'pdudo');
      await this.set('bl', 'site', 'juejin');
      console.log(await this.get('bl', 'name'));
      console.log(await this.get('bl', 'site'));
      // await this.delete('bl', 'name');
      // await this.set('bl', 'site', 'pdudo');
      // console.log(await this.get('bl', 'site'));
      // console.log(await this.get('bl', 'name'));
    } catch (error) {
      console.error(error);
    }
  }
}

export default new LocalCache();