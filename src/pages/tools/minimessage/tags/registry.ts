import { boldTag, italicTag, underlineTag, stTag, obfTag } from "./RegularTags";
import { InsertTag } from "./InsertTag";

export const tagRegistry = [
  boldTag,
  italicTag,
  underlineTag,
  stTag,
  obfTag,
  new InsertTag()
];
