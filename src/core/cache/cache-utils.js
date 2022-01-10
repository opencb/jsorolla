
export default class CacheUtils {

    static cache = new Map();

    constructor() {
        // // Singleton pattern
        // if (!this.cache) {
        //     this.cache = new Map();
        // }
    }

    static put(key, value) {
        CacheUtils.cache.set(key, value);
    }

    static get(key) {
        return CacheUtils.cache.get(key);
    }

    static contains(key) {
        return CacheUtils.cache.has(key);
    }

}
