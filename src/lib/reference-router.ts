import { validators } from "./reference-validation";
import { useSearchParams } from "react-router-dom";
type Search = Record<string, string | undefined>;
export function useSearch(options: { from: string }): Search {
  const [params] = useSearchParams();
  const raw = Object.fromEntries(params);
  return (validators[options.from]?.(raw) ?? raw) as Search;
}
export function useNavigate(_options: { from: string }) {
  const [, setParams] = useSearchParams();
  return ({
    search,
    replace = true,
  }: {
    search: (previous: Search) => Search;
    replace?: boolean;
  }) => {
    setParams(
      (previous) => {
        const next = search(Object.fromEntries(previous));
        return new URLSearchParams(
          Object.entries(next).filter((entry): entry is [string, string] => entry[1] !== undefined),
        );
      },
      { replace },
    );
  };
}
