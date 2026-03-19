import { useRender } from "@base-ui/react/use-render";
import { cn } from "@/lib/cn";

function Skeleton({
  className,
  render,
  ref,
  ...props
}: React.ComponentProps<"span"> & useRender.ComponentProps<"span">) {
  const element = useRender({
    defaultTagName: "span",
    render,
    props: {
      "data-slot": "skeleton",
      "aria-hidden": true,
      tabIndex: -1,
      className: cn(
        "animate-pulse rounded-md bg-muted *:invisible empty:block",
        className,
      ),
      ...props,
    },
    ref: ref,
  });

  return element;
}

export { Skeleton };
