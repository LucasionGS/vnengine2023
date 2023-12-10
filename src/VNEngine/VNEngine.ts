import Textbox from "./actives/Textbox";
import Scene from "./scenes/Scene";

// Game engine instance
class VNEngine {
  /**
   * The current game instance.
   */
  public static game: VNEngine;
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public debug: boolean = false;
  constructor(private root: HTMLElement, options?: VNEngine.GameOptions) {
    if (!root) throw new Error("Root element is required.");
    if (VNEngine.game) throw new Error(`Only one game instance can be created. Use ${this.constructor.name}.clear() to clear the current instance.`);
    options ??= {};
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

    // Set static game instance
    VNEngine.game = this;
    this.listenToEvents();
  }

  /**
   * Clears the current game instance.
   */
  public static clear(): void {
    if (VNEngine.game) {
      VNEngine.game.unlistenToEvents();
    }
    VNEngine.game = undefined as any;
  }

  private dialogProgressionPaused = false;
  /**
   * Pauses the dialog progression. This prevents the dialog from progressing when the user clicks on the screen.
   */
  public pauseDialogProgression(): void {
    console.log(window.performance.now(), "pauseDialogProgression");
    this.dialogProgressionPaused = true;
  }

  /**
   * Resumes the dialog progression. This allows the dialog to progress when the user clicks on the screen again.
   */
  public resumeDialogProgression(): void {
    console.log(window.performance.now(), "resumeDialogProgression");
    this.dialogProgressionPaused = false;
  }

  /**
   * Pauses the dialog progression while the function is running. This can be async/awaited
   * @param fn The function to run.
   */
  public async pauseDialogProgressionWhile(fn: () => any|Promise<any>) {
    this.pauseDialogProgression();
    await fn();
    this.resumeDialogProgression();
  }

  public _events: VNEngine.GameEvent<keyof HTMLElementEventMap>[] = [
    ["click", () => {
      const currentScene = VNEngine.game.getCurrentScene();
      if (!currentScene) return;
      if (this.dialogProgressionPaused) return;
      currentScene.progressDialog();
    }],
  ];

  private listenToEvents() {
    this._events.forEach(([event, handler]) => {
      this.canvas.addEventListener(event, handler);
    });
  }

  private unlistenToEvents() {
    this._events.forEach(([event, handler]) => {
      this.canvas.removeEventListener(event, handler);
    });
  }

  private currentScene?: Scene;
  public getCurrentScene<T extends Scene>(): T | undefined {
    return this.currentScene as T;
  }
  public async setCurrentScene(scene: Scene): Promise<void> {
    if (this.currentScene) {
      await this.currentScene.onExit();
    }
    this.currentScene = scene;
    scene.start();
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

    const textbox = this.textbox;
    if (textbox) {
      textbox.draw(ctx);
    }

    // Update debug
    if (this.debug) {
      ctx.save();
      ctx.textAlign = "start";
      ctx.textBaseline = "alphabetic";
      const lh = 20; // Line height
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      const height = (lh * 6) + (currentScene?.activeElements.length ?? 0) * (lh * 2);
      ctx.fillRect(0, 0, 300, height);
      ctx.fillStyle = "white";
      ctx.font = `${(lh * 0.75).toFixed(0)}px monospace`;
      ctx.fillText(`FPS: ${Math.round(1000 / delta)}`, lh, lh * 1);
      ctx.fillText(`Delta: ${(delta).toFixed(3)}ms`, lh, lh * 2);
      ctx.fillText(`Time: ${(time / 1000).toFixed(3)}s`, lh, lh * 3);
      if (currentScene) {
        ctx.fillText(`Scene time: ${((time - currentScene.startedAt) / 1000).toFixed(3)}s`, lh, lh * 4);
        ctx.fillText(`Current Scene: ${currentScene?.constructor.name ?? "None"}`, lh, lh * 5);
        currentScene.activeElements.forEach((active, i) => {
          ctx.fillText(`\t${active.id ? active.id : `Active ${i}`}(${active.constructor.name})`, lh, lh * 6 + (i * (lh * 2)));
          ctx.fillText(`\t\t${active.x.toFixed(0)}X ${active.y.toFixed(0)}Y`, lh, (lh * 7) + (i * (lh * 2)));
        });
      }
      ctx.restore();
    }

    // Request next frame
    requestAnimationFrame(this.update);
  }

  private textbox?: Textbox;
  public setTextbox(textbox: Textbox): Textbox {
    this.textbox = textbox;
    return textbox;
  }
  public getTextbox(): Textbox | undefined {
    return this.textbox;
  }

  /**
   * Simple delay function that resolves after `ms` milliseconds.
   * @param ms 
   * @returns 
   */
  public static delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
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
   * Used for getting an easy to use percentage value for certain fields that support it.
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

  /**
   * Wrapper for creating a percent value.
   */
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

  export type GameEvent<T extends keyof HTMLElementEventMap> = [T, (event: HTMLElementEventMap[T]) => void];
}

export default VNEngine;