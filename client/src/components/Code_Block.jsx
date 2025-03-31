"use client";

import React from "react";

import { CodeBlock } from "./ui/code_block";

export function CodeBlockDemo({syntax,name}) {
  //const code = `{syntax}`;

  return (
    <div className="max-w-3xl mx-auto w-full">
      <CodeBlock
      
        language="jsx"
        filename={name}
        highlightLines={[9, 13, 14, 18]}
        code={syntax} />
    </div>
  );
}