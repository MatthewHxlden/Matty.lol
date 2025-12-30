import { useState } from "react";
import MDEditor from "@uiw/react-md-editor";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  return (
    <div data-color-mode="dark" className="markdown-editor-container">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || "")}
        height={400}
        preview="live"
        hideToolbar={false}
      />
    </div>
  );
};

export default MarkdownEditor;
