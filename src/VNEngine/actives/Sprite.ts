import VNEngine from "../VNEngine";
import Active from "./Active";

class Sprite extends Active {
  public imageSrc: HTMLImageElement = new Image();
  public ratio?: VNEngine.Percent;
  public realWidth: number = 0;
  public realHeight: number = 0;
  
  constructor(options?: Sprite.Options) {
    super(options);
    options ??= {};
    this.imageSrc.src = options.imageSrc ?? "";
    this.ratio = options.ratio ?? undefined;
  }

  // Cache values
  public get originXResult(): number {
    if (this._cachedOriginXOriginal !== this.originX) {
      this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXResult = this.originX instanceof VNEngine.Percent ? this.originX.of(this.realWidth) : this.originX;
    }
    return this._cachedOriginXResult;
  }

  public get originYResult(): number {
    if (this._cachedOriginYOriginal !== this.originY) {
      this._cachedOriginYOriginal = this.originY;
      this._cachedOriginYResult = this.originY instanceof VNEngine.Percent ? this.originY.of(this.realHeight) : this.originY;
    }
    return this._cachedOriginYResult;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.absoluteX = this.x + (this.parent?.absoluteX ?? 0);
    this.absoluteY = this.y + (this.parent?.absoluteY ?? 0);

    if (this.width === 0 && this.height === 0) {
      this.width = this.imageSrc.naturalWidth;
      this.height = this.imageSrc.naturalHeight;
    }
    let width = this.width;
    let height = this.height;
    if (this.ratio) {
      width = this.ratio.of(this.width);
      height = this.ratio.of(this.height);
    }

    this.realWidth = width;
    this.realHeight = height;
    
    // ctx.save();
    ctx.drawImage(this.imageSrc, this.absoluteX - this.originXResult, this.absoluteY - this.originYResult, this.realWidth, this.realHeight);
    // ctx.restore();
  }
}

namespace Sprite {
  export interface Options extends Active.Options {
    imageSrc?: string;
    ratio?: VNEngine.Percent;
  }
}

export default Sprite;