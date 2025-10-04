export function apiFetch<T>(path: string, options: RequestInit = {}, token?: string) {
  return fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  }).then(async (res) => {
    if (!res.ok) throw new Error(await res.text())
    return res.json() as Promise<T>
  })
}
