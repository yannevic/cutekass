declare module 'canvas' {
  export interface CanvasImage {
    width: number;
    height: number;
  }

  export interface CanvasRenderingContext2D {
    fillStyle: string;
    strokeStyle: string;
    lineWidth: number;
    fillRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    drawImage(img: CanvasImage, x: number, y: number, w: number, h: number): void;
  }

  export interface Canvas {
    width: number;
    height: number;
    getContext(type: '2d'): CanvasRenderingContext2D;
    toBuffer(mimeType: 'image/jpeg', config?: { quality: number }): Buffer;
  }

  export function createCanvas(width: number, height: number): Canvas;
  export function loadImage(src: string): Promise<CanvasImage>;
}
