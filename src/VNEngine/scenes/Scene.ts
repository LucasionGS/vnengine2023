import VNEngine from "../VNEngine";
import Active from "../actives/Active";
import Textbox from "../actives/Textbox";
import Transition from "../transitions/Transition";

/**
 * Base class for all scenes. This is the most generic scene.  
 * Scenes are used to separate different parts of the game.
 */
class Scene {
  public get game() {
    return VNEngine.game;
  }

  private _defaultEvent: Scene.SceneEventFunction = () => {};
  /**
   * Events that are triggered at certain points in the scene's lifecycle.
   * 
   * These are defined by the user and have no default behavior.
   */
  public events = {
    /**
     * Triggered when the scene is first started. Use this to initialize the scene's elements.
     */
    initialization: this._defaultEvent,
    beforeTransition: this._defaultEvent,
    afterTransition: this._defaultEvent,
    /**
     * Triggered when the scene is finished. This is triggers after the user clicks after the final dialog is displayed.
     */
    onSceneFinished: this._defaultEvent,
  }

  /**
   * Set the event handler for a scene event. Overwrites any previous handler.
   * @param event The event to set the handler for.
   * @param fn The handler function.
   */
  public setEvent<T extends keyof Scene["events"]>(event: T, fn: Scene["events"][T]): void {
    this.events[event] = fn;
  }

  public startedAt: number = 0;

  private _activeElements: Active[] = [];
  public get activeElements(): Active[] {
    return this._activeElements;
  }
  public addActiveElement(...actives: Active[]): void {
    const anyHasParent = actives.find(active => active.getParent())
    if (anyHasParent) throw new Error("Cannot add an active element that already has a parent.");
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
    await this.events.initialization?.(this);
    await this.events.beforeTransition?.(this);
    await this.onEnter();
    await this.events.afterTransition?.(this);
    this.progressDialog();
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
      active.updateAnimationIfRunning(active, delta, time, time - active.animationStartTime);
      active.update(delta, time);
      active.draw(ctx);
      if (this.game.debug) {
        // Draw origin
        ctx.strokeStyle = "blue";
        ctx.strokeRect(active.x - 2, active.y - 2, 4, 4);
      }
    }
  }

  private dialog: Scene.DialogFunction[] = [];
  /**
   * Set the dialog that will be displayed in the textbox. Should be in order of appearance.
   * @param dialog A list of dialog functions that will be called in order. Easiest way to do so is using `Character.say()`/`Textbox.display`.
   */
  public setDialogList(dialog: Scene.DialogFunction[] | ((data: {
    game: VNEngine;
    scene: Scene;
    textbox: Textbox;
  }) => Scene.DialogFunction[])): void {
    if (typeof dialog === "function") {
      const textbox = this.game.getTextbox();
      if (!textbox) throw new Error("No textbox found. Make sure to call setTextbox() on the game before using setDialogList using a function.");
      dialog = dialog({
        game: this.game,
        scene: this,
        textbox: textbox,
      });
    }
    this.dialog = [...dialog];
    this.dialogGen = this.getDialog();
  }

  private *getDialog() {
    for (const d of this.dialog) {
      yield d;
    }
  }
  
  public displayImmediate: Textbox["displayImmediate"] = (...args) => {
    this.game.getTextbox()?.displayImmediate(...args);
  }

  public display: Textbox["display"] = (...args) => {
    return (event: Scene.DialogEvent) => (this.game.getTextbox()!.display(...args)(event));
  }

  private dialogGen?: ReturnType<Scene["getDialog"]>;
  private curDialogEvent?: Scene.DialogEvent;
  
  /**
   * Progress the dialog to the next line. This is called automatically when the user clicks the textbox but can also be called manually.  
   * If the dialog is finished, the `onSceneFinished` event is triggered.  
   * This function ignores the `dialogProgressionPaused` property of the game.
   */
  public progressDialog() {
    const textbox = this.game.getTextbox();

    if (!textbox) throw new Error("No textbox found. Make sure to call setTextbox() on the game.");
    if (!this.dialogGen) throw new Error("No dialog found. Make sure to call setDialogList() before progressDialog().");
    
    if (textbox.finished) {
      if (this.curDialogEvent) { // Inform old dialog event that it has proceeded
        this.curDialogEvent.hasProceeded = true;
      }
      
      this.curDialogEvent = new Scene.DialogEvent(); // Reset dialog event
      const nextDialog = this.dialogGen.next();
      if (nextDialog.done) {
        this.events.onSceneFinished?.(this);
      }
      else {
        nextDialog.value(this.curDialogEvent);
      }
    }
    else {
      textbox.characterCount = textbox.characterCountMax;
    }
  }
}

namespace Scene {
  export type SceneEventFunction = (scene: Scene) => (void | Promise<void>);
  export type DialogFunction = (event: DialogEvent) => (void | Promise<void>);

  export class DialogEvent {
    /**
     * Whether or not the user has continued beyond this dialog.
     */
    public hasProceeded = false;
  }
}

export default Scene;