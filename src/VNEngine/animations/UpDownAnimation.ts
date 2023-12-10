import Active from "../actives/Active";
import Animation from "./Animation";

export default class UpDownAnimation extends Animation<Active> {
  public update(active: Active, _delta: number, _time: number, at: number): void {
    active.y = active.y + Math.sin(at / 200) * 0.5;
  }

  private originalY!: number;
  
  public onStart(active: Active): void {
    this.originalY = active.y;
  }

  public onStop(active: Active): void {
    active.y = this.originalY;
  }
}