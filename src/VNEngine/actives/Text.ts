import VNEngine from "../VNEngine";
import Active from "./Active";

class Text extends Active {
  public text: string;
  public style: "fill" | "stroke" = "fill";
  public fontSize: number;
  public fontFamily: string;
  public textAlign: CanvasTextAlign;
  public textBaseline: CanvasTextBaseline;

  private _cachedTextWidth: number = 0;
  public get textWidth(): number {
    return this._cachedTextWidth;
  }
  private calculateTextWidth(ctx: CanvasRenderingContext2D) {
    this._cachedTextWidth = ctx.measureText(this.text).width;
    return this._cachedTextWidth;
  }

  constructor(options?: Text.Options) {
    super(options);
    options ??= {};
    this.text = options.text ?? "";
    this.style = options.style ?? "fill";
    this.fontSize = options.fontSize ?? 16;
    this.fontFamily = options.fontFamily ?? "sans-serif";
    this.textAlign = options.textAlign ?? "start";
    this.textBaseline = options.textBaseline ?? "alphabetic";
  }

  public get originXResult(): number {
    if (this._cachedOriginXOriginal !== this.originX) {
      this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXResult = this.originX instanceof VNEngine.Percent ? this.originX.of(this.textWidth ?? this.width) : this.originX;
    }
    return this._cachedOriginXResult;
  }

  // public get originYResult(): number {
  //   if (this._cachedOriginYOriginal !== this.originY) {
  //     this._cachedOriginYOriginal = this.originY;
  //     this._cachedOriginYResult = this.originY instanceof VNEngine.Percent ? this.originY.of(this.height) : this.originY;
  //   }
  //   return this._cachedOriginYResult;
  // }

  public draw(ctx: CanvasRenderingContext2D): void {
    this.absoluteX = this.x + (this.parent?.absoluteX ?? 0);
    this.absoluteY = this.y + (this.parent?.absoluteY ?? 0);
    ctx.save();
    ctx.font = `${this.fontSize}px ${this.fontFamily}`;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    this.calculateTextWidth(ctx);
    if (this.style === "fill") {
      ctx.fillStyle = this.color;
      ctx.fillText(this.text, this.absoluteX - this.originXResult, this.absoluteY - this.originYResult);
    }
    else if (this.style === "stroke") {
      ctx.strokeStyle = this.color;
      ctx.strokeText(this.text, this.absoluteX - this.originXResult, this.absoluteY - this.originYResult);
    }
    else {
      throw new Error(`Unknown style: ${this.style}`);
    }
    ctx.restore();
  }
}

namespace Text {
  export interface Options extends Active.Options {
    text?: string;
    style?: "fill" | "stroke";
    fontSize?: number;
    fontFamily?: string;
    textAlign?: CanvasTextAlign;
    textBaseline?: CanvasTextBaseline;
  }
}

export default Text;