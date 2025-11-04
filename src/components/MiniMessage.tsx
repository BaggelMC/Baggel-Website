import React from "react";
import MiniMessage from "minimessage-js";

interface MessageProps {
  input: string;
}

export default function Message({ input }: MessageProps) {
  const mm = MiniMessage.miniMessage();

  const component = mm.deserialize(input);

  const html = mm.toHTML(component);

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="prose font-minecraft-minimessage"
    />
  );
}
