import { Game } from './core/Game.js';

window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();

  // Character Selector HUD Click Handlers
  const skinButtons = document.querySelectorAll('.skin-btn');
  skinButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const skin = btn.getAttribute('data-skin');
      if (window.playerController && skin) {
        window.playerController.setSkin(skin);
      }
    });
  });
});
