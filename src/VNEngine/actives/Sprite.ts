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
    this.image.src = options.imageSrc ?? "";
    this.ratio = options.ratio ?? undefined;
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
    this.image.src = imageSrc;
    ratio ?? (this.ratio = ratio);

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
    if (this._cachedOriginXOriginal !== this.originX && this.realWidth > 0) {
      this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXRelative = this.originX instanceof VNEngine.Percent ? this.originX.of(this.realWidth) : this.originX;
    }
    return this._cachedOriginXRelative;
  }

  public get originYRelative(): number {
    if (this._cachedOriginYOriginal !== this.originY && this.realHeight > 0) {
      this._cachedOriginYOriginal = this.originY;
      this._cachedOriginYRelative = this.originY instanceof VNEngine.Percent ? this.originY.of(this.realHeight) : this.originY;
    }
    return this._cachedOriginYRelative;
  }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.absoluteX = this.x + (this.parent?.absoluteX ?? 0);
    this.absoluteY = this.y + (this.parent?.absoluteY ?? 0);

    if (this.width === 0 && this.height === 0) {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
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
    ctx.drawImage(this.image, this.absoluteX - this.originXRelative, this.absoluteY - this.originYRelative, this.realWidth, this.realHeight);
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