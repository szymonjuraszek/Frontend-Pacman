import Phaser from "phaser";
import {MainSceneComponent} from "../scenes/main-scene/main-scene.component";

export class Player extends Phaser.Physics.Arcade.Sprite{
    public nickname: string;
    private _positionX: number;
    private _positionY: number;
    private _score: number;

    constructor(scene: MainSceneComponent, x: number, y: number, texture: string, score: number) {
        super(scene, x, y, texture);

        // Dodanie gracza do sceny (zeby w ogole byl widoczny)
        scene.add.existing(this);

        // Dodanie gracza do fizyki co pozwala na ustawianie interakcji
        scene.physics.add.existing(this);

        // Dodanie kolidera na graczu oraz warstwie
        scene.physics.add.collider(this, scene.backgroundLayer);

        this._score = score;
    }

    get score(): number {
        return this._score;
    }

    set score(value: number) {
        this._score = value;
    }

    get positionX(): number {
        return this._positionX;
    }

    set positionX(value: number) {
        this._positionX = value;
    }

    get positionY(): number {
        return this._positionY;
    }

    set positionY(value: number) {
        this._positionY = value;
    }
}
