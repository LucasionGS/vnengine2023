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

  public style: "fill" | "stroke" = "fill";

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
    this.style = options.style ?? "fill";
    this.color = options.color ?? "black";
  }

  /**
   * Called automatically when the active element neeeds to be unloaded from the scene.
   */
  unload(): void {
    console.log("Unload: " + this.id);
    this.clickEvents.forEach(listener => window.removeEventListener("click", listener));
    this.clickEvents = [];
  }

  protected clickEvents: Array<(event: MouseEvent) => void> = [];
  public addOnClick(handler: (event: MouseEvent, active: Active) => void): this {
    const listener = (event: MouseEvent) => {
      const { left, top } = VNEngine.game.canvas.getBoundingClientRect();
      if (event.clientX >= (left + this.absoluteX - this.originXRelative) &&
        event.clientX <= (left + this.absoluteX - this.originXRelative + this.width) &&
        event.clientY >= (top + this.absoluteY - this.originYRelative) &&
        event.clientY <= (top + this.absoluteY - this.originYRelative + this.height)) {
        handler(event, this);
      }
    };
    this.clickEvents.push(listener);
    window.addEventListener("click", listener);
    return this;
  }

  // Cache values
  protected _cachedOriginXOriginal!: VNEngine.AxisPositionValue;
  protected _cachedOriginXRelative!: number;
  public get originXRelative(): number {
    if (this._cachedOriginXOriginal !== this.originX) {
      this._cachedOriginXOriginal = this.originX;
      this._cachedOriginXRelative = this.originX instanceof VNEngine.Percent ? this.originX.of(this.width) : this.originX;
    }
    return this._cachedOriginXRelative;
  }

  protected _cachedOriginYOriginal!: VNEngine.AxisPositionValue;
  protected _cachedOriginYRelative!: number;
  public get originYRelative(): number {
    if (this._cachedOriginYOriginal !== this.originY) {
      this._cachedOriginYOriginal = this.originY;
      this._cachedOriginYRelative = this.originY instanceof VNEngine.Percent ? this.originY.of(this.height) : this.originY;
    }
    return this._cachedOriginYRelative;
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
    if (this.style === "fill") {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.absoluteX - this.originXRelative, this.absoluteY - this.originYRelative, this.width, this.height);
    }
    else if (this.style === "stroke") {
      ctx.strokeStyle = this.color;
      ctx.strokeRect(this.absoluteX - this.originXRelative, this.absoluteY - this.originYRelative, this.width, this.height);
    }
    ctx.restore();
  }

  /**
   * Add this active element to the scene.
   */
  public addToScene(scene: Scene) {
    scene.addActiveElement(this);
    return this;
  }

  private newX!: number;
  private newY!: number;
  private moveDelay!: number;
  private _moving = false;

  /**
   * Move the active element to the specified position smoothly.
   * @param position The position to move to. Only the values that are defined will be moved. If both are defined, it will move diagonally.
   * @param delay The delay in milliseconds between each movement. Default is 25. The higher the number, the slower the movement. `1` is instant.
   * @returns 
   */
  public moveTo(position: { x?: number, y?: number, delay?: number }): this {
    const { x: newX, y: newY, delay = 25 } = position;
    if (delay < 1) {
      throw new Error("Delay must be 1 or greater.");
    }
    if (typeof newX === "number") this.newX = newX;
    if (typeof newY === "number") this.newY = newY;
    this.moveDelay = delay;
    const move = () => {
      this._moving = true;
      const hasX = typeof this.newX === "number";
      const hasY = typeof this.newY === "number";
      
      if (hasX && this.x != this.newX) {
        if (Math.abs(this.newX - this.x) > 2)
          this.x += (this.newX - this.x) / this.moveDelay;
        else
          this.x = this.newX;
      }
      if (hasY && this.y != this.newY) {
        if (Math.abs(this.newY - this.y) > 2)
          this.y += (this.newY - this.y) / this.moveDelay;
        else
          this.y = this.newY;
      }
      if ((hasX && this.x != this.newX) || (hasY && this.y != this.newY)) {
        setTimeout(() => {
          move();
        }, 10);
      }
      else {
        this._moving = false;
      }
    }
    if (!this._moving) move();
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
    style?: "fill" | "stroke";
    color?: string | number;
  }
}

export default Active;