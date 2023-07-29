import "./style.css";
import Active from "./VNEngine/actives/Active";
import Character from "./VNEngine/actives/Character";
import Text from "./VNEngine/actives/Text";
import Scene from "./VNEngine/scenes/Scene";
import VNEngine from "./VNEngine/VNEngine";
import Cheer from "./assets/cheer.png";

const app = document.querySelector<HTMLDivElement>("#app")!;

const game = VNEngine.builder(app)
  .width(800)
  .height(800)
  .debug(true)
  .build();

const mainScene = new Scene(game);
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
  }).addScene(mainScene);

  const ionchan = new Character({
    id: "Ionchan",
    x: game.canvas.width / 2,
    y: game.canvas.height / 2,
    ratio: VNEngine.percent(16),
    originX: VNEngine.percent(50),
    originY: VNEngine.percent(50),
    layer: 1,
    imageSrc: Cheer,
  }).addScene(mainScene);

  const title = new Text({
    id: "Title",
    text: "Hello World!",
    x: game.canvas.width / 2,
    y: 64,
    fontSize: 64,
    textAlign: "center",
    textBaseline: "middle",
    layer: 0,
    color: "#000",
    style: "fill",
  }).addScene(mainScene);

  // text.setParent(character);

  // Make character go in a circle
  let angle = 0;
  const speed = 0.0005;
  ionchan.update = ((delta) => {
    angle += speed * delta;
    const cRadius = ionchan.realHeight / 4;
    ionchan.x = Math.cos(angle) * cRadius + game.canvas.width / 2;
    ionchan.y = Math.sin(angle) * cRadius + game.canvas.height * 0.75;
    
  });
  
  let color = { r: 0, g: 0, b: 0};
  title.update = (() => {
    const colorS = `rgb(${
      ((color.r = color.r + 1) % 256).toString().padStart(3, "0")
    }, ${
      ((color.g = color.g + 2) % 256).toString().padStart(3, "0")
    }, ${
      ((color.b = color.b + 3) % 256).toString().padStart(3, "0")
    })`;
    // background.color = colorS;
    title.color = colorS;
    title.text = `Ionchan ${colorS}`;
  });
});

game.setCurrentScene(mainScene);
game.start();