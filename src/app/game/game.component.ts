import {Component, OnInit} from '@angular/core';
import Phaser from 'phaser';
import {MainSceneComponent} from '../scene/main-scene.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;

  constructor(private mainScene: MainSceneComponent) {
    this.config = {
      type: Phaser.AUTO,
      height: 1024,
      width: 1600,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
      },
      scene: [],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: {y: 0}
        }
      },
      fps: {
        target: 50,
        forceSetTimeOut: true
      }
    };

  }

  ngOnInit() {

      console.error('Initialize Game Object');

      this.phaserGame = new Phaser.Game(this.config);
      this.phaserGame.scene.add('main', this.mainScene);
      this.phaserGame.scene.start('main');

      console.error('Completed Initialization Game Object');
    }
}
