import VNEngine from "../VNEngine";
import Active from "./Active";

class Sprite extends Active {
  public image: HTMLImageElement = new Image();
  public ratio?: VNEngine.Percent;
  public realWidth: number = 0;
  public realHeight: number = 0;

  constructor(options?: Sprite.Options) {
    super(options);
    options ??= {};
    this.setSprite(options.imageSrc ?? "", options.ratio);
  }

  /**
   * 
   * @param imageSrc Path to the image
   * @param ratio The ratio of the image size. 100% is the original size. Default is `VNEngine.percent(100)`.
   * @example
   * setSprite("./assets/cheer.png");
   * setSprite("./assets/cheer.png", VNEngine.percent(50)); // Set the image to 50% of the original size.
   */
  public setSprite(imageSrc: string, ratio?: VNEngine.Percent): Promise<HTMLImageElement> {
    if (!imageSrc) {
      return Promise.resolve(this.image);
    }
    this.image.src = imageSrc;
    if (ratio) {
      this.ratio = ratio;
    }

    return this._loadPromise = new Promise((resolve, reject) => {
      const handler = () => {
        this.realWidth = this.image.naturalWidth;
        this.realHeight = this.image.naturalHeight;
        this.image.removeEventListener("load", handler);
        this.image.removeEventListener("error", errorHandler);
        resolve(this.image);
      }
      const errorHandler = (ev: ErrorEvent) => {
        this.image.removeEventListener("load", handler);
        this.image.removeEventListener("error", errorHandler);
        reject(ev.error as Error);
      }

      this.image.addEventListener("load", handler);
      this.image.addEventListener("error", errorHandler);
    });
  }

  private _loadPromise?: Promise<HTMLImageElement>;
  public get loadPromise(): Promise<HTMLImageElement> | undefined {
    return this._loadPromise;
  }

  // Cache values
  public get originXRelative(): number {
    // if (this._cachedOriginXOriginal !== this.originX) {
    if (this.realWidth > 0) {
      // this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXRelative = this.originX instanceof VNEngine.Percent ? this.originX.of(this.realWidth) : this.originX;
    }
    else {
      // this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXRelative = this.originX instanceof VNEngine.Percent ? this.originX.of(this.width) : this.originX;
    }
    // }
    return this._cachedOriginXRelative;
  }

  public get originYRelative(): number {
    // if (this._cachedOriginYOriginal !== this.originY) {
    if (this.realHeight > 0) {
      this._cachedOriginYOriginal = this.originY;
      this._cachedOriginYRelative = this.originY instanceof VNEngine.Percent ? this.originY.of(this.realHeight) : this.originY;
    }
    else {
      this._cachedOriginYOriginal = this.originY;
      this._cachedOriginYRelative = this.originY instanceof VNEngine.Percent ? this.originY.of(this.height) : this.originY;
    }
    // }
    return this._cachedOriginYRelative;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    if (!this.image.src) {
      return super.draw(ctx);
    }
    this.absoluteX = this.x + (this.parent?.absoluteX ?? 0);
    this.absoluteY = this.y + (this.parent?.absoluteY ?? 0);

    let width = this.width;
    let height = this.height;
    if (width === 0 && height === 0) {
      width = this.image.naturalWidth;
      height = this.image.naturalHeight;
    }
    if (this.ratio) {
      width = this.ratio.of(width);
      height = this.ratio.of(height);
    }

    this.realWidth = width;
    this.realHeight = height;

    // console.log(this.width, this.height, this.realWidth, this.realHeight);

    // ctx.save();
    ctx.drawImage(this.image, this.absoluteX - this.originXRelative, this.absoluteY - this.originYRelative, this.realWidth, this.realHeight);
    // ctx.restore();
  }

  public addOnClick(handler: (event: MouseEvent, active: Active) => void): this {
    const listener = (event: MouseEvent) => {
      const { left, top } = VNEngine.game.canvas.getBoundingClientRect();
      const [x1, x2, y1, y2] = [
        left + (this.absoluteX - this.originXRelative),
        left + (this.absoluteX - this.originXRelative) + (this.width || this.realWidth),
        top + (this.absoluteY - this.originYRelative),
        top + (this.absoluteY - this.originYRelative) + (this.height || this.realHeight)
      ];
      if (event.clientX >= x1 &&
        event.clientX <= x2 &&
        event.clientY >= y1 &&
        event.clientY <= y2
      ) {
        handler(event, this);
      }
    };
    this.clickEvents.push(listener);
    window.addEventListener("click", listener);
    return this;
  }
}

namespace Sprite {
  export interface Options extends Active.Options {
    imageSrc?: string;
    ratio?: VNEngine.Percent;
  }
}

export default Sprite;