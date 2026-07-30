import * as React from "react";
import {
  Link as RouterLink,
  useLocation,
  useNavigate,
  useParams as useRouterParams,
  type LinkProps as RouterLinkProps,
} from "react-router-dom";

type LinkProps = Omit<RouterLinkProps, "to"> & {
  href: string;
  /** Accepted for source compatibility; the router prefetches nothing. */
  prefetch?: boolean;
};

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, prefetch, ...props },
  ref,
) {
  void prefetch;
  return <RouterLink ref={ref} to={href} {...props} />;
});

export function usePathname() {
  return useLocation().pathname;
}

export function useParams<T extends Record<string, string | undefined>>() {
  return useRouterParams() as T;
}

export function useRouter() {
  const navigate = useNavigate();

  return React.useMemo(
    () => ({
      push: (href: string) => navigate(href),
      replace: (href: string) => navigate(href, { replace: true }),
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => navigate(0),
    }),
    [navigate],
  );
}
