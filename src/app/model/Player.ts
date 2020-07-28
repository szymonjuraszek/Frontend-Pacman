import Phaser from "phaser";
import {MainSceneComponent} from "../scenes/main-scene/main-scene.component";

export class Player extends Phaser.Physics.Arcade.Sprite {
    public nickname: string;
    private _positionX: number;
    private _positionY: number;
    private _score: number;
    private _version: number;
    public static SPEED = 400;

    constructor(scene: MainSceneComponent, x: number, y: number, texture: string, score: number) {
        super(scene, x, y, texture);

        // Dodanie gracza do sceny (zeby w ogole byl widoczny)
        scene.add.existing(this);

        // Dodanie gracza do fizyki co pozwala na ustawianie interakcji
        scene.physics.add.existing(this);

        // Dodanie kolidera na graczu oraz warstwie
        scene.physics.add.collider(this, scene.backgroundLayer);

        // scene.anims.play('myUp');

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

    get version(): number {
        return this._version;
    }

    set version(value: number) {
        this._version = value;
    }
}
