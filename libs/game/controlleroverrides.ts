namespace controller {
    //% fixedInstance whenUsed block="{id:controller}A"
    export const A = new Button(ControllerButton.A, -1);
    //% fixedInstance whenUsed block="{id:controller}B"
    export const B = new Button(ControllerButton.B, -1);
    //% fixedInstance whenUsed block="{id:controller}C"
    export const C = new Button(8, -1);
    //% fixedInstance whenUsed block="left"
    export const left = new Button(ControllerButton.Left, -1);
    //% fixedInstance whenUsed block="up"
    export const up = new Button(ControllerButton.Up, -1);
    //% fixedInstance whenUsed block="right"
    export const right = new Button(ControllerButton.Right, -1);
    //% fixedInstance whenUsed block="down"
    export const down = new Button(ControllerButton.Down, -1);
    //% fixedInstance whenUsed block="menu"
    export const menu = new Button(7, -1);

    //% fixedInstance whenUsed block="player 2"
    export const player2 = new Controller(2, undefined);
    //% fixedInstance whenUsed block="player 3"
    export const player3 = new Controller(3, undefined);
    //% fixedInstance whenUsed block="player 4"
    export const player4 = new Controller(4, undefined);
    //% fixedInstance whenUsed block="player 1"
    export const player1 = controller._player1();
}