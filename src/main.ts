import "./style.css";
import VNEngine from "./VNEngine/VNEngine";
import Active from "./VNEngine/actives/Active";
import Character from "./VNEngine/actives/Character";
import Scene from "./VNEngine/scenes/Scene";
import Textbox from "./VNEngine/actives/Textbox";
import Text from "./VNEngine/actives/Text";
// Assets
import Default from "./assets/KG040000.kg.png";
import Smile from "./assets/KG040001.kg.png";
import BigLaugh from "./assets/KG040002.kg.png";

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = VNEngine.builder(app)
  .width(1000)
  .height(800)
  .debug(true)
  .build();

const mainScene = new Scene();
mainScene.setEvent("beforeTransition", () => {
  mainScene.activeElements.splice(0);
  const background = new Active({
    id: "Background",
    x: 0,
    y: 0,
    width: game.canvas.width,
    height: game.canvas.height,
    originX: 0,
    originY: 0,
    layer: 0,
    color: "#fff",
  }).addToScene(mainScene);

  const girl = new Character({
    id: "Blue Hair Girl",
    name: "Girl",
    x: game.canvas.width / 2,
    y: game.canvas.height * 2,
    ratio: VNEngine.percent(120),
    originX: VNEngine.percent(50),
    originY: VNEngine.percent(100),
    layer: 0,
    imageSrc: Default,
  }).addToScene(mainScene);

  const textbox = game.setTextbox(new Textbox());

  // setTimeout(() => {
  //   game.setCurrentScene(new Scene());
  // }, 5000);

  const emp = (text: string) => ({ text: text, bold: true, color: "#e1a100" });

  textbox.display({
    text: "Welcome to the game",
    fontSize: 48,
    bold: true,
  });
  const dialog = [
    girl.sayOut("This is something I say, you can see who speaks above.", () => girl.moveTo({
      y: game.canvas.height + girl.realHeight - 256,
      delay: 100,
    })),
    girl.sayOut("^^^^^ Up here you can see the name of who speaks.", () => girl.moveTo({
      x: game.canvas.width - girl.realWidth / 2,
      y: game.canvas.height,
      delay: 10,
    })),
    textbox.displayOut("It can also be nameless. If not providing a name. You can also have multiple lines if the text gets way too long and the words will be automatically wrapped."),
    girl.sayOut([
      "But I am ", emp(girl.name),
      "! You can see that I am bold and have a different color!"
    ]),
    girl.sayOut([
      "The ", emp("sprite"), " can be changed at anytime."],
      () => girl.setSprite(Smile)
    ),
    girl.sayOut([
      "The sprite is now set to be ",
      () => emp(decodeURIComponent(girl.image.src.replace(window.location.protocol + "//" + window.location.host, ""))),
      "."
    ], () => {
      girl.setSprite(BigLaugh);
      girl.moveTo({ x: girl.realWidth / 2 });
    }),
    girl.sayOut(
      "You can also have a function that returns a text template. This is useful for displaying dynamic text.",
      () => {
        girl.setSprite(Default);
        girl.moveTo({ x: girl.x + 64 });
      }
    ),
  ];
  function* getDialog() {
    for (const d of dialog) {
      yield d;
    }
  }
  const gen = getDialog();
  background.addOnClick(() => {
    if (textbox.finished) {
      const nextDialog = gen.next();
      if (nextDialog.done) {
        game.setCurrentScene(mainScene);
      }
      else {
        nextDialog.value();
      }
    }
    else {
      textbox.characterCount = textbox.characterCountMax;
    }
  });
});

game.setCurrentScene(mainScene);
game.start();