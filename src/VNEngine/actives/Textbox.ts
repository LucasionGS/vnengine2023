import VNEngine from "../VNEngine";
import Sprite from "./Sprite";

class Textbox {
  constructor(options?: Textbox.Options) {

  }

  /**
   * Display text in the textbox and start writing it out.
   * @param text Text or template to generate text from.
   * @param title Title of the textbox. Usually the name of the character speaking.
   * @param defaultOptions Default options for all text in `text`.
   */
  public display(text: Textbox.Text | Textbox.Text[], title?: Textbox.Text, defaultOptions?: Omit<Textbox.TextTemplate, "text">) {
    if (typeof title === "function") title = title();
    this.title = title ? (typeof title === "string" ? { ...defaultOptions, text: title } : { ...defaultOptions, ...title }) : null;
    defaultOptions ??= {};
    this.characterCount = 0;
    if (!Array.isArray(text)) text = [text];
    const textTexmples = text.map((t) => {
      if (typeof t === "function") t = t();
      const data = typeof t === "string" ? { ...defaultOptions, text: t } : { ...defaultOptions, ...t };
      // Split per space, so its one word per data object, + 1 for the space if it exists
      const words = data.text.split(" ");
      const dataObjects: Textbox.TextTemplate[] = words.map((w, i) => {
        const d = { ...data, text: w };
        if (i < words.length - 1) d.text += " ";
        return d;
      });
      return dataObjects;
    }).flat();
    this._text = textTexmples;
    this.characterCountMax = textTexmples.reduce((a, b) => a + b.text.length, 0);
    this.characterCountStarted = false;
  }

  /**
   * Export a function that will display the text in the textbox and start writing it out.
   * @param text Text or template to generate text from.
   * @param title Title of the textbox. Usually the name of the character speaking.
   * @param defaultOptions Default options for all text in `text`.
   * @param otherAction A function that is executed right before the text is displayed.
   * @returns 
   */
  public displayOut(text: Textbox.Text | Textbox.Text[], title?: Textbox.Text, defaultOptions?: Omit<Textbox.TextTemplate, "text">, otherAction?: () => void) {
    return () => { otherAction?.(); this.display(text, title, defaultOptions); }
  }

  public incrementCharacterCount() {
    this.characterCountStarted = true;
    if (this.characterCount < this.characterCountMax) {
      this.characterCount++;
      setTimeout(() => this.incrementCharacterCount(), 15);
    }
  }

  public title: Textbox.TextTemplate | null = null;
  public characterCountStarted = false;
  public characterCount = 0;
  public characterCountMax = 0;
  public get finished(): boolean {
    return this.characterCount >= this.characterCountMax;
  }
  private _text: Textbox.TextTemplate[] = [];

  public animationState = - 100; // 0-100%

  public draw(ctx: CanvasRenderingContext2D): void {
    if (this.animationState < 100) this.animationState += (100 - this.animationState) / 50;
    const percent = (this.animationState > 0 ? this.animationState : 0) / 100;
    const game = VNEngine.game;
    // Draw outline around the textbox
    let x = game.canvas.width / 2;
    let y = game.canvas.height - 32;
    const width = (game.canvas.width - 64) * percent;
    const height = 200;
    const originX = width / 2;
    const originY = height;

    if (this.animationState > 0) {
      ctx.save();
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(x - originX, y - originY, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.strokeRect(x - originX, y - originY, width, height);
      ctx.restore();
    }

    // Draw text
    if (this.animationState > 99) {
      if (this.title) {
        const textX = x - originX + 8;
        const textY = y - height - (this.title.fontSize ?? 24);
        ctx.save();
        ctx.fillStyle = this.title.color ?? "white";
        ctx.font = `${this.title.fontSize ?? 24}px ${this.title.fontFamily ?? "sans-serif"}`;
        this.title.bold && (ctx.font = `bold ${ctx.font}`);
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(this.title.text, textX, textY);
        ctx.restore();
      }

      if (!this.characterCountStarted && this.characterCount === 0) {
        this.incrementCharacterCount();
      }
      if (this.characterCountStarted) {
        const textX = x - originX + 8;
        const textY = y - height + 4;
        let xRelative = 0;
        let yRelative = 0;
        ctx.save();
        let totalCharacters = 0;
        this._text.forEach(d => {
          const showCharacters = this.characterCount - totalCharacters;
          const text = d.text.substring(0, showCharacters);
          if (xRelative + ctx.measureText(text).width > width - 4) {
            xRelative = 0;
            yRelative++;
          }
          totalCharacters += text.length;
          ctx.fillStyle = d.color ?? "white";
          ctx.font = `${d.fontSize ?? 24}px ${d.fontFamily ?? "sans-serif"}`;
          d.bold && (ctx.font = `bold ${ctx.font}`);
          ctx.textAlign = "left";
          ctx.textBaseline = "top";
          ctx.fillText(text, textX + xRelative, textY + (yRelative * ((d.fontSize ?? 24) + 2)));
          xRelative += ctx.measureText(text).width;
        });
        ctx.restore();
      }
    }
  }
}

namespace Textbox {
  export interface Options extends Sprite.Options {
    autoPosition?: boolean;
  }

  export type Text = string | TextTemplate | (() => string | TextTemplate);
  export interface TextTemplate {
    text: string;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
  }
}

export default Textbox;