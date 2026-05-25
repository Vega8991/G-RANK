const AUTH_KEY    = 'g_auth';
const ACCESS_KEY  = 'g_token';
const REFRESH_KEY = 'g_refresh';

export interface AuthInfo {
    username: string;
    role: string;
    exp: number;
}

export function saveAuthInfo(info: AuthInfo): void {
    try { localStorage.setItem(AUTH_KEY, JSON.stringify(info)); } catch {}
}

export function clearAuthInfo(): void {
    try { localStorage.removeItem(AUTH_KEY); } catch {}
}

export function getAuthInfo(): AuthInfo | null {
    // Try cookie first (same-domain / local dev)
    try {
        const match = document.cookie.split(';').find(c => c.trim().startsWith('auth_info='));
        if (match) {
            const raw = decodeURIComponent(match.trim().slice('auth_info='.length));
            const info = JSON.parse(raw) as AuthInfo;
            if (info.username && info.role && info.exp && Date.now() / 1000 <= info.exp) return info;
        }
    } catch {}

    // Fallback: localStorage (cross-domain production)
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        if (!raw) return null;
        const info = JSON.parse(raw) as AuthInfo;
        if (!info.username || !info.role || !info.exp) return null;
        if (Date.now() / 1000 > info.exp) { clearAuthInfo(); return null; }
        return info;
    } catch {
        return null;
    }
}

export function saveTokens(accessToken: string, refreshToken?: string): void {
    try {
        localStorage.setItem(ACCESS_KEY, accessToken);
        if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
    } catch {}
}

export function clearTokens(): void {
    try {
        localStorage.removeItem(ACCESS_KEY);
        localStorage.removeItem(REFRESH_KEY);
    } catch {}
}

export function getAccessToken(): string | null {
    try { return localStorage.getItem(ACCESS_KEY); } catch { return null; }
}

export function getRefreshToken(): string | null {
    try { return localStorage.getItem(REFRESH_KEY); } catch { return null; }
}
