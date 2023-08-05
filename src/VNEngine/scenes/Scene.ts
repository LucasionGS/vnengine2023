import VNEngine from "../VNEngine";
import Active from "../actives/Active";
import Transition from "../transitions/Transition";

/**
 * Base class for all scenes. This is the most generic scene.  
 * Scenes are used to separate different parts of the game.
 */
class Scene {
  public get game() {
    return VNEngine.game;
  }

  public beforeTransition?: Scene.EventFunction;
  public afterTransition?: Scene.EventFunction;

  public setEvent(event: "beforeTransition" | "afterTransition", fn: Scene.EventFunction): void {
    this[event] = fn;
  }

  public startedAt: number = 0;

  private _activeElements: Active[] = [];
  public get activeElements(): Active[] {
    return this._activeElements;
  }
  public addActiveElement(...actives: Active[]): void {
    this._activeElements.push(...actives);
    this.updateLayerOrder();
    actives.forEach(active => active.start());
  }

  public updateLayerOrder(): void {
    this._activeElements.sort((a, b) => a.layer - b.layer);
  }

  constructor() {
  }

  public async start(): Promise<void> {
    // Implement Start Transition.
    this.startedAt = window.performance.now();
    await this.beforeTransition?.();
    await this.onEnter();
    await this.afterTransition?.();
  }

  public enterTransition?: Transition;
  /**
   * Triggers transition to the next scene.
   */
  public async onEnter(): Promise<void> {
    // Implement Enter Transition.
  }

  public exitTransition?: Transition;
  /**
   * Runs immediately before transitioning to the next scene.
   */
  public async onExit(): Promise<void> {
    // Implement Exit Transition.
    this.activeElements.forEach(active => active.unload());
  }

  public update(delta: number, time: number): void {
    const ctx = this.game.ctx;

    // Update active elements
    for (const active of this.activeElements) {
      active.update(delta, time);
      active.draw(ctx);
      if (this.game.debug) {
        // Draw origin
        ctx.strokeStyle = "blue";
        ctx.strokeRect(active.x - 2, active.y - 2, 4, 4);
      }
    }
  }
}

namespace Scene {
  export type EventFunction = () => (void | Promise<void>);
}

export default Scene;