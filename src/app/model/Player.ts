import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite{
    public nickname: string;
    private _positionX: number;
    private _positionY: number;
    private _score: number;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, score: number) {
        super(scene, x, y, texture);
        console.error('Tworze gracza w konstruktorze!')
        scene.add.existing(this);
        scene.physics.add.existing(this);
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
