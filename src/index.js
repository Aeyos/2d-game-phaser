import Phaser from 'phaser';
import io from 'socket.io-client';

import constants from './config/constants';
import GameScene from './scenes/game';

const socket = io(':3000');
const form = document.querySelector('#loginForm');

form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const name = evt.currentTarget.elements.name.value;
  const pass = evt.currentTarget.elements.pass.value;

  socket.emit('login', name, pass, (response) => {
    if (response.data) {
      form.style.display = 'none';

      const config = {
        type: Phaser.AUTO,
        width: constants.WIDTH,
        height: constants.HEIGHT,
        pixelArt: true,
        scene: [GameScene],
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
          },
        },
      };

      window.$socket = socket;
      const game = new Phaser.Game(config);
      window.$game = game;

      socket.on('broadcast', (msg) => {
        console.log('broadcast', msg);
      });

      socket.on('message', (msg) => {
        console.log('message', msg);
      });

      socket.on('update', function update(data) {
        console.log('game', data)
        game.scene.scenes[0].updateFromServer(data);
      });
    }
  });
});

if (module.hot) {
  module.hot.accept(() => {});

  module.hot.dispose(() => {
    window.location.reload();
  });
}
