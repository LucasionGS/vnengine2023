import Active from "../actives/Active";
import Animation from "./Animation";

export default class SighAnimation extends Animation<Active> {
  constructor(public speed: number = 1) {
    super();
  }
  public update(active: Active, _delta: number, _time: number, animationTime: number): void {
    // Animation that makes the active element move up slow, and down fast.
    if (animationTime <= (1000 / this.speed)) {
      active.y = active.y - (this.speed / 10);
    }
    else if (active.y < this.originalY) {
      active.y = active.y + (this.speed / 2);
    }
    else if (active.y > this.originalY) {
      active.y = this.originalY;
    }
  }

  private originalY!: number;
  
  public onStart(active: Active): void {
    this.originalY = active.y;
  }

  public onStop(active: Active): void {
    active.y = this.originalY;
  }
}