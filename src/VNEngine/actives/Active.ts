import VNEngine from "../VNEngine";
import Animation from "../animations/Animation";
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
      if (
        event.clientX >= (left + this.absoluteX - this.originXRelative) &&
        event.clientX <= (left + this.absoluteX - this.originXRelative + this.width) &&
        event.clientY >= (top + this.absoluteY - this.originYRelative) &&
        event.clientY <= (top + this.absoluteY - this.originYRelative + this.height)
      ) {
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

    // Draw children
    this.children.forEach(child => child.draw(ctx));
    
  }

  /**
   * Add this active element to the scene.
   */
  public addToScene(scene: Scene) {
    scene.addActiveElement(this);
    return this;
  }

  private animation?: Animation<this>;
  public animationRunning = false;
  public animationStartTime = 0;

  public updateAnimationIfRunning(active: this, delta: number, time: number, animationTime: number): void {
    if (this.animationRunning) {
      this.animation?.update(active, delta, time, animationTime);
    }
  }

  /**
   * Add an animation to the active element. Animations do not start automatically and must be started with `startAnimation()`.
   * @param animation The animation to add.
   */
  public setAnimation(animation: Animation<this>): this {
    if (this.animation && this.animationRunning) this.stopAnimation();
    this.animation = animation;
    return this;
  }

  /**
   * Start the active element's animation.
   */
  public startAnimation(): this {
    if (this.animationRunning) this.stopAnimation();
    this.animation?.onStart(this);
    this.animationRunning = true;
    this.animationStartTime = window.performance.now();
    return this;
  }

  /**
   * Stop the active element's animation.
   */
  public stopAnimation(): this {
    this.animationRunning = false;
    this.animation?.onStop(this);
    return this;
  }
  
  private newX!: number;
  private newY!: number;

  /**
   * Move the active element to the specified position smoothly.
   * 
   * Avoid running this method multiple times at once, as it can cause unexpected behavior.
   * @param position The position to move to. Only the values that are defined will be moved. If both are defined, it will move diagonally.
   * @param delay The delay in milliseconds between each movement. Default is 25. The higher the number, the slower the movement. `1` is instant.
   * @returns 
   */
  public async moveTo(position: { x?: number, y?: number, delay?: number, after?: number }): Promise<this> {
    const { x: newX, y: newY, delay = 25, after = 0 } = position;
    let resolve: (active: this) => void;
    const p = new Promise<this>(r => resolve = r);
    if (delay < 1) {
      throw new Error("Delay must be 1 or greater.");
    }

    if (after > 0) {
      await VNEngine.delay(after);
    }
    
    if (typeof newX === "number") this.newX = newX;
    if (typeof newY === "number") this.newY = newY;
    let moveDelay = delay;
    let _moving = false;
    const move = () => {
      _moving = true;
      const hasX = typeof this.newX === "number";
      const hasY = typeof this.newY === "number";
      
      if (hasX && this.x != this.newX) {
        if (Math.abs(this.newX - this.x) > 2)
          this.x += (this.newX - this.x) / moveDelay;
        else
          this.x = this.newX;
      }
      if (hasY && this.y != this.newY) {
        if (Math.abs(this.newY - this.y) > 2)
          this.y += (this.newY - this.y) / moveDelay;
        else
          this.y = this.newY;
      }
      if ((hasX && this.x != this.newX) || (hasY && this.y != this.newY)) {
        setTimeout(() => {
          move();
        }, 10);
      }
      else {
        _moving = false;
        resolve(this);
      }
    }
    if (!_moving) move();
    return p;
  }

  private children: Active[] = [];
  public getChildren<T extends Active>(): T[] {
    return this.children as T[];
  }

  public addChild<T extends Active>(child: T): T {
    // Remove old parent
    const oldParent = child.getParent();
    if (oldParent) {
      oldParent.removeChild(child);
    }
    
    child.setParent(this);
    this.children.push(child);
    return child;
  }

  public addChildren<T extends Active>(...children: T[]): T[] {
    children.forEach(child => this.addChild(child));
    return children;
  }

  public removeChild<T extends Active>(child: T): T {
    this.children = this.children.filter(c => c !== child);
    return child;
  }

  public removeChildren<T extends Active>(...children: T[]): T[] {
    children.forEach(child => this.removeChild(child));
    return children;
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