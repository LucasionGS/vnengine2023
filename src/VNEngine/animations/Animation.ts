import Active from "../actives/Active";

export default abstract class Animation<TActive extends Active> {
  /**
   * This method is called every frame while the animation is running.
   * @param active The active element to animate.
   * @param delta The time since the last frame.
   * @param time The time since the scene started.
   * @param animationTime The time since the animation started.
   */
  public abstract update(active: TActive, delta: number, time: number, animationTime: number): void;

  /**
   * This method is called when the animation is started.
   * @param active The active element to animate.
   */
  public onStart(active: TActive): void {
    
  };

  /**
   * This method is called when the animation is stopped.
   * @param active The active element to animate.
   */
  public onStop(active: TActive): void {
    
  };
}