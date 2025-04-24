export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  cache: RequestCache = "no-store"
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST;
  if (!baseUrl) throw new Error("API_HOST não definido nas variáveis de ambiente.");

  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    cache,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text(); // corpo de erro (se houver)
    throw new Error(`Erro ${res.status}: ${error}`);
  }

  /* --------- NOVO: lida com corpo vazio ---------- */
  if (res.status === 204) return undefined as unknown as T;             // 204 No Content
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) {
    // se não for JSON devolve texto/bruto
    return (await res.text()) as unknown as T;
  }

  return res.json() as Promise<T>;
}
