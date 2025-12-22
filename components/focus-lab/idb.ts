'use client'

const IDB_NAME = 'focus-lab-cache'
const IDB_VERSION = 3

const STORES = ['focus-station', 'brain-dump', 'dopamine', 'todo']

const upgradeStores = (db: IDBDatabase) => {
  STORES.forEach((store) => {
    if (!db.objectStoreNames.contains(store)) {
      db.createObjectStore(store)
    }
  })
}

const openInternal = (version: number): Promise<IDBDatabase | null> =>
  new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null)
      return
    }
    const request = indexedDB.open(IDB_NAME, version)
    request.onupgradeneeded = () => {
      upgradeStores(request.result)
    }
    request.onsuccess = () => {
      const db = request.result
      const missing = STORES.some((s) => !db.objectStoreNames.contains(s))
      if (missing && version <= IDB_VERSION) {
        // force an upgrade pass to create missing stores
        db.close()
        openInternal(IDB_VERSION + 1).then(resolve)
        return
      }
      resolve(db)
    }
    request.onerror = () => {
      console.error('IndexedDB open failed for Focus Lab cache', request.error)
      resolve(null)
    }
  })

export const openSharedIdb = () => openInternal(IDB_VERSION)
export const FOCUS_IDB_STORES = STORES
