export async function apiFetch<T = any>(
  url: string,
  options: RequestInit = {},
  cache: RequestCache = 'no-store'
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST;

  if (!baseUrl) throw new Error("API_HOST não definido nas variáveis de ambiente.");

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    cache,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Erro ${res.status}: ${error}`);
  }

  return res.json();
}
