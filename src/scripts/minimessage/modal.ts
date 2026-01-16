export function openModal(def: {
  title: string;
  render: (content: HTMLElement) => void;
  onSubmit: () => boolean;
}) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/60 flex items-center justify-center z-50";

  const modal = document.createElement("div");
  modal.className = "bg-background-10 rounded-2xl p-6 w-[400px] space-y-4";

  const title = document.createElement("h2");
  title.textContent = def.title;
  title.className = "text-lg font-semibold";

  const content = document.createElement("div");

  const footer = document.createElement("div");
  footer.className = "flex justify-end gap-2";

  const cancel = document.createElement("button");
  cancel.textContent = "Cancel";
  cancel.className = "bg-background cursor-pointer px-4 py-2 rounded-lg transition duration-300 hover:scale-105"
  cancel.onclick = () => overlay.remove();

  const submit = document.createElement("button");
  submit.textContent = "Insert";
  submit.className = "bg-accent text-background cursor-pointer px-4 py-2 rounded-lg transition duration-300 hover:scale-105";
  submit.onclick = () => {

    const shouldClose = def.onSubmit();
    if (shouldClose !== false) {
      overlay.remove();
    }
    
  };

  footer.append(cancel, submit);
  modal.append(title, content, footer);
  overlay.append(modal);
  document.body.appendChild(overlay);

  def.render(content);
}
