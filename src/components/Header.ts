const toggleButton = document.getElementById('mobile-menu-toggle') as HTMLButtonElement | null;
const mobileMenu = document.getElementById('mobile-menu') as HTMLElement | null;

if (toggleButton && mobileMenu) {
  toggleButton.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('max-h-[1000px]');
    mobileMenu.classList.toggle('max-h-[1000px]');
    if (!isOpen) {
      mobileMenu.classList.remove('overflow-hidden');
      toggleButton.setAttribute('aria-expanded', 'true');
    } else {
      mobileMenu.classList.add('overflow-hidden');
      toggleButton.setAttribute('aria-expanded', 'false');
    }
  });
}

// Mobile dropdown toggles
document.querySelectorAll('[data-toggle]').forEach((btn) => {
  if (!(btn instanceof HTMLButtonElement)) return;

  const id = btn.getAttribute('data-toggle');
  if (!id) return;

  const submenu = document.getElementById(id);
  const icon = btn.querySelector('svg');

  if (!submenu || !icon) return;

  const toggleSubmenu = () => {
    const isHidden = submenu.classList.contains('hidden');
    submenu.classList.toggle('hidden');
    icon.classList.toggle('rotate-180');
    btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    
    const menuItems = submenu.querySelectorAll<HTMLElement>('a[role="menuitem"]');
    if (isHidden) {
      menuItems.forEach(item => item.removeAttribute('tabindex'));
    } else {
      menuItems.forEach(item => item.setAttribute('tabindex', '-1'));
    }
  };

  btn.addEventListener('click', toggleSubmenu);

  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSubmenu();
    } else if (e.key === 'ArrowDown' && submenu.classList.contains('hidden')) {
      e.preventDefault();
      toggleSubmenu();
      const firstItem = submenu.querySelector<HTMLElement>('a[role="menuitem"]');
      firstItem?.focus();
    }
  });

  const menuItems = submenu.querySelectorAll<HTMLElement>('a[role="menuitem"]');
  menuItems.forEach(item => item.setAttribute('tabindex', '-1'));

  menuItems.forEach((item, index) => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = (index + 1) % menuItems.length;
        (menuItems[nextIndex] as HTMLElement).focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (index === 0) {
          btn.focus();
        } else {
          const prevIndex = (index - 1 + menuItems.length) % menuItems.length;
          (menuItems[prevIndex] as HTMLElement).focus();
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        (menuItems[0] as HTMLElement).focus();
      } else if (e.key === 'End') {
        e.preventDefault();
        (menuItems[menuItems.length - 1] as HTMLElement).focus();
      }
    });
  });
});