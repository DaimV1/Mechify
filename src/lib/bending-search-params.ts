import { useNavigate, useSearchParams } from "react-router-dom";

/** The three bending panels share one URL; merge against the latest browser URL. */
export function useBendingSearchParams() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setParams = (
    update: (previous: URLSearchParams) => URLSearchParams,
    options: { replace: boolean },
  ) => {
    const next = update(new URLSearchParams(window.location.search));
    navigate({ search: `?${next}`, hash: window.location.hash }, options);
  };
  return [params, setParams] as const;
}
