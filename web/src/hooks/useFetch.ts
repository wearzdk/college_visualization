import { createSignal, onCleanup } from "solid-js";

export function useFetch<T>(url: string, options?: RequestInit) {
  const [data, setData] = createSignal<T | null>(null);
  const [error, setError] = createSignal<Error | null>(null);
  const [loading, setLoading] = createSignal<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();

  onCleanup(() => {
    // Cleanup if necessary
  });

  return { data, error, loading };
}
