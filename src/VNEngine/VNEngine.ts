import Scene from "./scenes/Scene";

// Game engine instance
class VNEngine {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public debug: boolean = false;
  constructor(private root: HTMLElement, private options?: VNEngine.GameOptions) {
    this.options = options ??= {};
    this.canvas = document.createElement("canvas");
    this.canvas.classList.add("vn-canvas");

    // Apply initial options
    this.canvas.width = options.width ?? (options.width = 800);
    this.canvas.height = options.height ?? (options.height = 600);
    this.debug = options.debug ?? (options.debug = false);

    // Get context
    this.ctx = this.canvas.getContext("2d")!;

    // Append
    this.root.appendChild(this.canvas);
  }

  private currentScene?: Scene;
  public getCurrentScene<T extends Scene>(): T | undefined {
    return this.currentScene as T;
  }
  public setCurrentScene(scene: Scene): void {
    this.currentScene = scene;
    scene.start();
    scene.onEnter();
  }

  public start() {
    this.update = this.update.bind(this);
    this.update();
  }

  private lastTime: number = 0;
  private update(time: number = 0): void {
    const delta = time - this.lastTime;
    this.lastTime = time;

    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Update current scene
    const currentScene = this.getCurrentScene();
    if (currentScene) {
      currentScene.update(delta, time);
    }

    // Update debug
    if (this.debug) {
      ctx.save();
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
      const lh = 20; // Line height
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      const height = (lh * 5) + (currentScene?.activeElements.length ?? 0) * (lh * 2);
      ctx.fillRect(0, 0, 300, height);
      ctx.fillStyle = "white";
      ctx.font = `${(lh * 0.75).toFixed(0)}px monospace`;
      ctx.fillText(`FPS: ${Math.round(1000 / delta)}`, lh, lh * 1);
      ctx.fillText(`Delta: ${(delta).toFixed(3)}ms`, lh, lh * 2);
      ctx.fillText(`Time: ${(time / 1000).toFixed(3)}s`, lh, lh * 3);
      if (currentScene) {
        ctx.fillText(`Current Scene: ${currentScene?.constructor.name ?? "None"}`, lh, lh * 4);
        currentScene.activeElements.forEach((active, i) => {
          ctx.fillText(`\t${active.id ? active.id : `Active ${i}`}(${active.constructor.name})`, lh, lh * 5 + (i * (lh * 2)));
          ctx.fillText(`\t\t${active.x.toFixed(0)}X ${active.y.toFixed(0)}Y`, lh, (lh * 6) + (i * (lh * 2)));
        });
      }
      ctx.restore();
    }

    // Request next frame
    requestAnimationFrame(this.update);
  }
}

// Static functions for the VNEngine
namespace VNEngine {
  export interface GameOptions {
    width?: number;
    height?: number;
    debug?: boolean;
  }

  /**
   * Used for getting an easy to use percentage value.
   */
  export class Percent {
    public value: number;
    constructor(value: number) {
      this.value = value;
    }

    public of(value: number): number {
      return value * (this.value / 100);
    }
  }

  export function percent(value: number): Percent {
    return new Percent(value);
  }

  export type AxisPositionValue = number | Percent;

  class VNEngineBuilder {
    private root: HTMLElement;
    private options: GameOptions = {};
    constructor(root: HTMLElement) {
      this.root = root;
    }

    public width(width: number): VNEngineBuilder {
      this.options.width = width;
      return this;
    }

    public height(height: number): VNEngineBuilder {
      this.options.height = height;
      return this;
    }

    public debug(debug: boolean): VNEngineBuilder {
      this.options.debug = debug;
      return this;
    }

    public build(): VNEngine {
      return new VNEngine(this.root, this.options);
    }
  }

  export function builder(root: HTMLElement): VNEngineBuilder {
    return new VNEngineBuilder(root);
  }
}

export default VNEngine;