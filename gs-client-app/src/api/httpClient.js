const BASE_URL = 'https://gs-main-api.i4624.info';

/**
 * 공통 fetch 래퍼
 * @param {string} path
 * @param {object} options
 * @param {string} [options.method='GET']
 * @param {object} [options.params]
 * @param {object} [options.body]
 * @returns {Promise<any>}
 */
export async function httpRequest(path, { method = 'GET', params, body } = {}) {
    const url = new URL(path, BASE_URL);

    if (params && typeof params === 'object') {
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
        });
    }

    const headers = { 'Content-Type': 'application/json' };

    const res = await fetch(url.toString(), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!res.ok) {
        const message =
            (data && (data.message || data.error)) ||
            `HTTP ${res.status} ${res.statusText}`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}
