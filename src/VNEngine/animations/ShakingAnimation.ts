import Active from "../actives/Active";
import Animation from "./Animation";

export default class ShakingAnimation extends Animation<Active> {
  constructor(public frequency: number = 20) {
    super();
  }
  public update(active: Active, _delta: number, _time: number, at: number): void {
    active.x = active.x + Math.sin(at / this.frequency) * 0.5;
    active.y = active.y + Math.sin(at / (this.frequency * 3)) * 0.5;
  }

  private originalX!: number;
  private originalY!: number;
  
  public onStart(active: Active): void {
    this.originalX = active.x;
    this.originalY = active.y;
  }

  public onStop(active: Active): void {
    active.x = this.originalX;
    active.y = this.originalY;
  }
}