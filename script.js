// Campus Network Visualizer with Konva.js

const container = document.getElementById("container");
const toast = document.getElementById("toast");

function showToast(msg) {
  toast.innerText = msg;
  toast.style.display = "block";
  setTimeout(() => (toast.style.display = "none"), 2000);
}

// Konva stage
let stage = new Konva.Stage({
  container: "container",
  width: container.clientWidth,
  height: container.clientHeight,
});
let layer = new Konva.Layer();
stage.add(layer);

window.addEventListener("resize", () => {
  stage.width(container.clientWidth);
  stage.height(container.clientHeight);
});

let nodes = [];
let links = [];
let idCounter = 1;
let linkMode = false;
let linkSource = null;

// Create Building
function createBuilding(name, x = 200, y = 200) {
  const id = "n" + idCounter++;
  const group = new Konva.Group({ x, y, draggable: true, id });

  const circle = new Konva.Circle({
    radius: 40,
    fill: "#f3f4f6",
    stroke: "#0ea5a4",
    strokeWidth: 3,
  });

  const label = new Konva.Text({
    text: name,
    fontSize: 14,
    y: 45,
    width: 80,
    align: "center",
  });

  group.add(circle, label);
  layer.add(group);

  const node = { id, type: "building", group };
  nodes.push(node);

  group.on("click", () => {
    if (linkMode) handleLinkClick(node);
  });

  group.on("dragmove", () => updateLinksForNode(node.id));
}

// Create Device (server/switch/AP)
function createDevice(type, x = 300, y = 300) {
  const id = "n" + idCounter++;
  const group = new Konva.Group({ x, y, draggable: true, id });

  const color =
    type === "server" ? "#6b7280" : type === "switch" ? "#3b82f6" : "#22c55e";
  const icon =
    type === "server" ? "🖥" : type === "switch" ? "🔀" : "📶";

  const circle = new Konva.Circle({
    radius: 25,
    fill: "#fff",
    stroke: color,
    strokeWidth: 3,
  });

  const text = new Konva.Text({
    text: icon,
    fontSize: 20,
    y: -10,
    width: 50,
    align: "center",
  });

  group.add(circle, text);
  layer.add(group);

  const node = { id, type, group };
  nodes.push(node);

  group.on("click", () => {
    if (linkMode) handleLinkClick(node);
  });

  group.on("dragmove", () => updateLinksForNode(node.id));
}

// Create Link
function createLink(fromNode, toNode) {
  if (fromNode.id === toNode.id) return;

  const line = new Konva.Line({
    points: getPoints(fromNode, toNode),
    stroke: "#93c5fd",
    strokeWidth: 3,
  });

  layer.add(line);

  links.push({ fromId: fromNode.id, toId: toNode.id, line });
}

function getPoints(a, b) {
  return [a.group.x(), a.group.y(), b.group.x(), b.group.y()];
}

function updateLinksForNode(nodeId) {
  links.forEach((l) => {
    if (l.fromId === nodeId || l.toId === nodeId) {
      const a = nodes.find((n) => n.id === l.fromId);
      const b = nodes.find((n) => n.id === l.toId);
      l.line.points(getPoints(a, b));
    }
  });
}

// Handle link mode
function handleLinkClick(node) {
  if (!linkSource) {
    linkSource = node;
    showToast("Source selected");
  } else {
    createLink(linkSource, node);
    linkSource = null;
    showToast("Link created");
  }
}

// Simulate traffic
function simulate() {
  links.forEach((l) => {
    const pts = l.line.points();
    const start = { x: pts[0], y: pts[1] };
    const end = { x: pts[2], y: pts[3] };

    const packet = new Konva.Circle({
      x: start.x,
      y: start.y,
      radius: 6,
      fill: "#10b981",
    });
    layer.add(packet);

    const tween = new Konva.Tween({
      node: packet,
      duration: 1.5,
      x: end.x,
      y: end.y,
      onFinish: () => packet.destroy(),
    });
    tween.play();
  });
}

// Toolbar actions
document.getElementById("add-server").onclick = () =>
  createDevice("server", 400, 200);
document.getElementById("add-switch").onclick = () =>
  createDevice("switch", 450, 250);
document.getElementById("add-ap").onclick = () =>
  createDevice("ap", 500, 300);

document.getElementById("clear").onclick = () => {
  nodes.forEach((n) => n.group.destroy());
  links.forEach((l) => l.line.destroy());
  nodes = [];
  links = [];
  layer.draw();
  showToast("Canvas cleared");
};

document.getElementById("link-mode").onclick = () => {
  linkMode = !linkMode;
  showToast(linkMode ? "Link Mode ON" : "Link Mode OFF");
};

document.getElementById("simulate").onclick = simulate;

// Building buttons
document.querySelectorAll(".preset-building").forEach((btn) => {
  btn.onclick = () => createBuilding(btn.dataset.name, Math.random() * 500, Math.random() * 300);
});

// Seed with few nodes
createBuilding("CSC", 200, 200);
createBuilding("ECE", 600, 200);
const ap = createDevice("ap", 400, 300);