"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Dispatch, forwardRef, SetStateAction, useState } from "react";
import { useFormContext } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
type InputTagsProps = {
  value: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
};

export const InputTags = forwardRef<HTMLInputElement, InputTagsProps>(
  ({ onChange, value, ...props }, ref) => {
    const [pendingDataPoint, setPendingDataPoint] = useState("");
    const [focused, setFocused] = useState(false);
    function addPendingDataPoint() {
      if (pendingDataPoint) {
        const newDataPoints = new Set([...value, pendingDataPoint]);
        onChange(Array.from(newDataPoints));
        setPendingDataPoint("");
      }
    }
    const { setFocus } = useFormContext();

    return (
      <div
        onClick={() => setFocus("tags")}
        className={cn(
          "flex items-center file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          focused
            ? "ring-offset-2 outline-none ring-ring ring-2"
            : "ring-offset-0 outline-none ring-ring ring-0"
        )}
      >
        <motion.div className="rounded-md min-h-[2rem] p-2 flex flex-wrap items-center gap-2">
          <AnimatePresence>
            {value.map((tag) => (
              <motion.div
                animate={{ scale: 1 }}
                initial={{ scale: 0 }}
                exit={{ scale: 0 }}
                key={tag}
                className="flex items-center"
              >
                <Badge variant="secondary">{tag}</Badge>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="ml-1 p-0"
                  onClick={() => onChange(value.filter((i) => i !== tag))}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          <Input
            className="flex-1 min-w-[6rem] border-transparent focus:ring-0 focus:border-transparent"
            value={pendingDataPoint}
            placeholder="Add tags..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addPendingDataPoint();
              }
              if (
                !pendingDataPoint &&
                e.key === "Backspace" &&
                value.length > 0
              ) {
                e.preventDefault();
                const newValue = [...value];
                newValue.pop();
                onChange(newValue);
              }
            }}
            onFocus={() => setFocused(true)}
            onBlurCapture={() => setFocused(false)}
            onChange={(e) => setPendingDataPoint(e.target.value)}
            {...props}
          />
        </motion.div>
      </div>
    );
  }
);

InputTags.displayName = "InputTags";
