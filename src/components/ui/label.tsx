import * as React from "react";
import { cn } from "@/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "font-mono text-[13px] font-medium tracking-wide text-foreground",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
