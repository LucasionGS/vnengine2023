import VNEngine from "../VNEngine";
import Sprite from "./Sprite";
import Textbox from "./Textbox";

class Character extends Sprite {
  public name: string;

  constructor(options?: Character.Options) {
    super(options);
    options ??= {};
    this.name = options.name ?? "";
  }

  /**
   * Display text in the textbox and start writing it out. Automatically sets the title to the name of the character.
   * @param text Text or template to generate text from.
   */
  public say(text: Textbox.Text | Textbox.Text[]) {
    const tb = VNEngine.game.getTextbox();
    if (!tb) throw new Error("No textbox found.");
    tb.display(text, { text: this.name, color: "#0056a2", bold: true, fontSize: 32 });
  }

  /**
   * Export a function that will display the text in the textbox and start writing it out. Automatically sets the title to the name of the character.
   * @param text Text or template to generate text from.
   * @param otherAction A function that is executed right before the text is displayed.
   * @returns 
   */
  public sayOut(text: Textbox.Text | Textbox.Text[], otherAction?: () => void) {
    return () => { otherAction?.(); this.say(text); };
  }
}

namespace Character {
  export interface Options extends Sprite.Options {
    name?: string;
  }
}

export default Character;