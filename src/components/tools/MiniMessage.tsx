import React, { useEffect, useState } from "react";

interface MessageProps {
  input: string;
}

export default function Message({ input }: MessageProps) {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    const MiniMessage = (window as any).MiniMessage;
    if (!MiniMessage) return;

    const mm = MiniMessage.miniMessage();
    const component = mm.deserialize(input);
    setHtml(mm.toHTML(component));
  }, [input]);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="prose font-minecraft-minimessage"
    />
  );
}
