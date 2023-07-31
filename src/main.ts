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
    color: "#fff",
  }).addScene(mainScene);

  const ionchan = new Character({
    id: "Ionchan",
    x: game.canvas.width / 2,
    y: game.canvas.height,
    ratio: VNEngine.percent(16),
    originX: VNEngine.percent(50),
    originY: VNEngine.percent(100),
    layer: 0,
    imageSrc: Cheer,
  }).addScene(mainScene);

  const title = new Text({
    id: "Title",
    text: "Hello World!",
    x: 0,
    y: 64,
    fontSize: 48,
    textAlign: "center",
    textBaseline: "middle",
    layer: 0,
    color: "#000",
    style: "fill",
  }).addScene(mainScene);

  title.setParent(ionchan);

  const handler = () => {
    title.y = -ionchan.realHeight;
    ionchan.image.removeEventListener("load", handler);
  };
  ionchan.image.addEventListener("load", handler);

  let titleAngle = 0;
  const titleSpeed = 0.002;
  title.update = ((delta) => {
    titleAngle += titleSpeed * delta;
    const titleRadius = 4;
    title.y = Math.sin(titleAngle) * titleRadius - ionchan.realHeight - title.textHeight;
  });
});

game.setCurrentScene(mainScene);
game.start();