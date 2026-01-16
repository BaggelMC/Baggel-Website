export interface TagContext {
  textarea: HTMLTextAreaElement;
}

export interface TagResult {
  start: string;
  end?: string | null;
}

export interface TagModalDefinition {
  title: string;
  render: (container: HTMLElement) => void;
  validate?: () => boolean;
  submit: () => TagResult;
}

export interface TagDefinition {
  id: string;
  label: string;
  icon?: string;
  appearance: HTMLElement | (() => HTMLElement);
  modal?: (ctx: TagContext) => TagModalDefinition;
  staticResult?: TagResult;
}
