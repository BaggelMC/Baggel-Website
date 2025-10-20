const toggleButton = document.getElementById('mobile-menu-toggle') as HTMLButtonElement | null;
const mobileMenu = document.getElementById('mobile-menu') as HTMLElement | null;

if (toggleButton && mobileMenu) {
  toggleButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('max-h-[1000px]');
    mobileMenu.classList.toggle('max-h-[1000px]');
    if (!isOpen) {
      mobileMenu.classList.remove('overflow-hidden');
    } else {
      mobileMenu.classList.add('overflow-hidden');
    }
  });
}

// Mobile
document.querySelectorAll('[data-toggle]').forEach((btn) => {
  if (!(btn instanceof HTMLButtonElement)) return;

  const id = btn.getAttribute('data-toggle');
  if (!id) return;

  const submenu = document.getElementById(id);
  const icon = btn.querySelector('svg');

  if (!submenu || !icon) return;

  btn.addEventListener('click', () => {
    submenu.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
  });
});