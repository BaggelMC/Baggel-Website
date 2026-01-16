import { renderToolbar } from "@scripts/minimessage/toolbar";
import { boldTag } from "@scripts/minimessage/definitions/bold";
import { headTag } from "@scripts/minimessage/definitions/head";

const textarea = document.getElementById("input") as HTMLTextAreaElement | null;
const toolbar = document.getElementById("tag-toolbar") as HTMLDivElement | null;

if (textarea && toolbar) {
  renderToolbar(toolbar, textarea, [boldTag, headTag]);
}
