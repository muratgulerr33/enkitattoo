import * as React from "react";

type ExternalLinkProps = Omit<React.ComponentPropsWithoutRef<"a">, "target" | "rel">;

export const ExternalLink = React.forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  ({ href, ...props }, ref) => (
    <a ref={ref} href={href} target="_blank" rel="nofollow noopener noreferrer" {...props} />
  ),
);

ExternalLink.displayName = "ExternalLink";
