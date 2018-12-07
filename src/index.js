import Phaser from 'phaser';
import io from 'socket.io-client';

import constants from './config/constants';
import GameScene from './scenes/Game';
import state from './State';

const socket = io(':3000');
const form = document.querySelector('#loginForm');
state.$socket = socket;


form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const name = evt.currentTarget.elements.name.value;
  const pass = evt.currentTarget.elements.pass.value;

  socket.emit('login', name, pass, (response) => {
    if (response.data) {
      state.$playerEntity = response.data;
      form.style.display = 'none';

      const config = {
        type: Phaser.AUTO,
        width: constants.WIDTH,
        height: constants.HEIGHT,
        pixelArt: true,
        scene: [GameScene],
      };

      const game = new Phaser.Game(config);
      state.$game = game;
    }
  });
});

if (module.hot) {
  module.hot.accept(() => {});

  module.hot.dispose(() => {
    window.location.reload();
  });
}
