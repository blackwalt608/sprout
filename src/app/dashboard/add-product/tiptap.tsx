"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  StrikethroughIcon,
} from "lucide-react";
import { Placeholder } from "@tiptap/extensions";
import { useEffect } from "react";

interface TiptapProps {
  value: string;
  onChange: (value: string) => void;
}

const Tiptap = ({ value, onChange }: TiptapProps) => {
  const editor = useEditor({
    extensions: [
      Placeholder.configure({
        placeholder: "Add a longer description for your products...",
        emptyNodeClass:
          "first:before:text-gray-600 girst:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none",
      }),
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      onChange(content);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      },
    },
    immediatelyRender: false,
  });
  useEffect(() => {
    if (editor?.isEmpty) editor.commands.setContent(value);
  }, [value]);

  return (
    <div className="flex flex-col gap-2">
      {editor && (
        <div className="border border-input rounded-md">
          <Toggle
            size={"sm"}
            pressed={editor.isActive("bold")}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="w-4 h-4" />
          </Toggle>
          <Toggle
            size={"sm"}
            pressed={editor.isActive("italic")}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="w-4 h-4" />
          </Toggle>
          <Toggle
            size={"sm"}
            pressed={editor.isActive("strike")}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          >
            <StrikethroughIcon className="w-4 h-4" />
          </Toggle>
          <Toggle
            size={"sm"}
            pressed={editor.isActive("orderedList")}
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            <ListOrdered className="w-4 h-4" />
          </Toggle>
          <Toggle
            size={"sm"}
            pressed={editor.isActive("bulletList")}
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            <List className="w-4 h-4" />
          </Toggle>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
};

export default Tiptap;
