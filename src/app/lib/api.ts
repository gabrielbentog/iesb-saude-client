import Cookies from 'js-cookie';

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  cache: RequestCache = "no-store"
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
  if (!baseUrl) throw new Error("API_HOST não definido nas variáveis de ambiente.");

  let token: string | undefined;
  try {
    if (typeof window !== 'undefined') {
      const storage = localStorage.getItem('session') ?? Cookies.get('session');
      if (storage) {
        const parsed = JSON.parse(storage);
        token = parsed?.token;
      }
    }
  } catch {
    token = undefined;
  }

  // If the caller passed a FormData body, do not set Content-Type so the browser
  // can add the correct multipart boundary. Otherwise default to application/json.
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // allow callers to override or add headers
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    cache,
    headers,
  });

    if (!res.ok) {
      let errorMsg = `Erro`;
      try {
        const errorBody = await res.json();
        if (errorBody && Array.isArray(errorBody.errors)) {
          errorMsg += ': ' + errorBody.errors.map((e: { title: string }) => e.title).join(', ');
        } else if (errorBody && errorBody.message) {
          errorMsg += ': ' + errorBody.message;
        }
      } catch {
        const text = await res.text();
        if (text) errorMsg += `: ${text}`;
      }
      throw new Error(errorMsg);
    }

    /* --------- NOVO: lida com corpo vazio ---------- */
    if (res.status === 204) return undefined as unknown as T;             // 204 No Content
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return (await res.text()) as unknown as T;
    }


  return res.json() as Promise<T>;
}
