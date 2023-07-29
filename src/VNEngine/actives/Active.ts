import VNEngine from "../VNEngine";
import Scene from "../scenes/Scene";

/**
 * Base class for all active elements.  
 * Active elements are elements that are dynamic and can change their state.
 */
class Active {
  /**
   * The parent active element, if any.
   */
  protected parent?: Active;
  public setParent(parent: Active): void {
    this.parent = parent;
  }
  public getParent<T extends Active>(): T | undefined {
    return this.parent as T;
  }
  /**
   * Identifier for the active element.
   */
  public id?: string;
  /**
   * The x position to draw the active element.
   */
  public x: number;
  public absoluteX: number;
  /**
   * The y position to draw the active element.
   */
  public y: number;
  public absoluteY: number;
  /**
   * The point of origin for the X axis. 0 is the left side of the element, 1 is the right side.
   */
  public originX: VNEngine.AxisPositionValue;
  /**
   * The point of origin for the X axis. 0 is the left side of the element, 1 is the right side.
   */
  public originY: VNEngine.AxisPositionValue;
  /**
   * The layer of the active element.
   */
  public layer: number;
  public width: number;
  public height: number;
  
  protected _color: string = "white";
  public set color(value: string | number) {
    if (typeof value === "number") {
      value = value.toString(16);
      this._color = "#" + value;
    }
    else {
      this._color = value;
    }
  }

  public get color(): string {
    return this._color;
  }

  constructor(options?: Active.Options) {
    options ??= {};
    this.id = options.id ?? undefined;
    this.x = this.absoluteX = options.x ?? 0;
    this.y = this.absoluteY = options.y ?? 0;
    this.originX = options.originX ?? 0;
    this.originY = options.originY ?? 0;
    this.layer = options.layer ?? 0;
    this.width = options.width ?? 0;
    this.height = options.height ?? 0;
    this.color = options.color ?? "white";
  }

  // Cache values
  protected _cachedOriginXOriginal!: VNEngine.AxisPositionValue;
  protected _cachedOriginXResult!: number;
  public get originXResult(): number {
    if (this._cachedOriginXOriginal !== this.originX) {
      this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXResult = this.originX instanceof VNEngine.Percent ? this.originX.of(this.width) : this.originX;
    }
    return this._cachedOriginXResult;
  }

  protected _cachedOriginYOriginal!: VNEngine.AxisPositionValue;
  protected _cachedOriginYResult!: number;
  public get originYResult(): number {
    if (this._cachedOriginYOriginal !== this.originY) {
      this._cachedOriginYOriginal = this.originY;
      this._cachedOriginYResult = this.originY instanceof VNEngine.Percent ? this.originY.of(this.height) : this.originY;
    }
    return this._cachedOriginYResult;
  }


  /**
   * Called when the active element is added to the game.
   * @override
   */
  public start(): void {
    // Do nothing, user can override
  }

  /**
   * Called every frame.
   * @override
  */
  // @ts-expect-error - Unused parameters
  public update(delta: number, time: number): void {
    // Do nothing, user can override
  }

  /**
   * Called every frame, after `update()`. This is where you should draw your active element.
   * @override
   */
  public draw(ctx: CanvasRenderingContext2D): void {
    this.absoluteX = this.x + (this.parent?.absoluteX ?? 0);
    this.absoluteY = this.y + (this.parent?.absoluteY ?? 0);
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.absoluteX - this.originXResult, this.absoluteY - this.originYResult, this.width, this.height);
    ctx.restore();
  }

  public addScene(scene: Scene) {
    scene.addActiveElement(this);
    return this;
  }
}

namespace Active {
  export interface Options {
    id?: string;
    x?: number;
    y?: number;
    originX?: VNEngine.AxisPositionValue;
    originY?: VNEngine.AxisPositionValue;
    layer?: number;
    width?: number;
    height?: number;
    color?: string | number;
  }
}

export default Active;