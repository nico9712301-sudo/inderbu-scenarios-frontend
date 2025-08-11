import { cva, type VariantProps } from "class-variance-authority";

export const tabTrigger = cva(
  "relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium \
   text-muted-foreground transition-colors duration-200 rounded-md cursor-pointer",
  {
    variants: {
      active: {
        false: "hover:text-primary",
        true: "text-primary data-[state=active]:shadow \
           data-[state=active]:before:absolute \
           data-[state=active]:before:inset-x-0 \
           data-[state=active]:before:-bottom-0.5 \
           data-[state=active]:before:h-0.5 \
           data-[state=active]:before:rounded-full \
           data-[state=active]:before:bg-primary",
      },
    },
    defaultVariants: { active: false },
  }
);

export type TabTriggerProps = VariantProps<typeof tabTrigger>;
