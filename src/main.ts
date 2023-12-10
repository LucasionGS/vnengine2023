import "./style.css";
import VNEngine from "./VNEngine/VNEngine";
import Active from "./VNEngine/actives/Active";
import Character from "./VNEngine/actives/Character";
import Scene from "./VNEngine/scenes/Scene";
import Textbox from "./VNEngine/actives/Textbox";
// Assets
import Default from "./assets/standing.png";
import Smile from "./assets/smiling.png";
import Sad from "./assets/sad.png";
import UpDownAnimation from "./VNEngine/animations/UpDownAnimation";
import ShakingAnimation from "./VNEngine/animations/ShakingAnimation";
import SighAnimation from "./VNEngine/animations/SighAnimation";

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = VNEngine.builder(app)
  .width(1000)
  .height(800)
  .debug(true)
  .build();

const mainScene = new Scene();
mainScene.setEvent("initialization", () => {
  mainScene.activeElements.splice(0);
  // const background = 
  new Active({
    id: "Background",
    x: 0,
    y: 0,
    width: game.canvas.width,
    height: game.canvas.height,
    originX: 0,
    originY: 0,
    layer: 0,
    color: "#ffffff"
  }).addToScene(mainScene);

  const unknown = new Character({ name: "???" });

  const lilium = new Character({
    id: "Lilium",
    name: "Lilium",
    color: "#ffdbd7",
    x: game.canvas.width / 2,
    y: game.canvas.height * 2,
    scale: VNEngine.percent(65),
    originX: VNEngine.percent(50),
    originY: VNEngine.percent(100),
    layer: 0,
    imageSrc: Default,
  }).addToScene(mainScene);

  const lily = new Character({
    id: "Lily",
    name: "Lily",
    color: "#811408",
    x: 0,
    y: game.canvas.height,
    scale: VNEngine.percent(65),
    originX: VNEngine.percent(0),
    originY: VNEngine.percent(100),
    layer: 0,
    imageSrc: Default,
  }).addToScene(mainScene);

  game.setTextbox(new Textbox());

  const emp = (text: string, color?: string) => ({ text: text, bold: true, color: color || "#e1b400" });

  mainScene.setDialogList(({ game, scene }) => [
    unknown.say("Hello there!"),

    lilium.say(["My name is ", () => lilium.name], async () => {
      game.pauseDialogProgression();
      await lilium.moveTo({
        y: game.canvas.height + (lilium.realHeight / 4),
        delay: 50,
      });
      scene.progressDialog();
    }),
    
    lilium.say("This is a tiny demo", async () => {
      lily.setAnimation(new UpDownAnimation).startAnimation();
      await VNEngine.delay(100);
      await lilium.moveTo({ x: lilium.x + 64, delay: 50 });
      lilium.continueDialog(", for what this engine can do!");
      lily.setAnimation(new ShakingAnimation(4)).startAnimation();
      await lilium.moveTo({ x: lilium.x - 128, delay: 50 });
      lilium.continueDialog(["... ", emp("Including this continuous text.")]);
      await lilium.moveTo({ x: lilium.x + 64, delay: 50 });
      lilium.setAnimation(new SighAnimation(1)).startAnimation();
      game.resumeDialogProgression();
    }),

    lilium.say("This is something I say, you can see who speaks above.", () => lily.stopAnimation()),

    lilium.say("^^^^^ Up here you can see the name of who speaks.", () => lilium.moveTo({
      x: game.canvas.width - lilium.realWidth / 2,
      y: game.canvas.height,
      delay: 10,
    })),

    lily.say(
      "You can also have multiple characters speaking together by following up dialog from different characters!."
    ),

    scene.display("It can also be nameless. If not providing a name. You can also have multiple lines if the text gets way too long and the words will be automatically wrapped."),

    lilium.say([
      "But I am ", emp(lilium.name, lilium.color),
      "! You can see that I am bold and have a different color!"
    ]),

    lilium.say([
      "The ", emp("sprite"), " can be changed at anytime."],
      () => lilium.setSprite(Smile)
    ),

    lilium.say([
      "The sprite is now set to be ",
      () => emp(decodeURIComponent(lilium.image.src.replace(window.location.protocol + "//" + window.location.host, ""))),
      "."
    ], async () => {
      lilium.setSprite(Sad);
      game.pauseDialogProgressionWhile(() => lilium.moveTo({ x: lilium.realWidth / 2, y: game.canvas.height * 1.2 }));
    }),

    lilium.say(
      "You can also have a function that returns a text template. This is useful for displaying dynamic text.",
      () => {
        lilium.setSprite(Default);
        lilium.moveTo({ x: game.canvas.width / 2, y: game.canvas.height, delay: 10 });
      }
    ),

  ]);

  mainScene.setEvent("onSceneFinished", (s) => {
    game.setCurrentScene(s);
  });
});

game.setCurrentScene(mainScene);
game.start();