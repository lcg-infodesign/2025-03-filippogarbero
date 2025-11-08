// ===================== VARIABILI GLOBALI =====================
let vulcani;                 // Oggetto Table per caricare il CSV dei vulcani
let vulcaniData = [];        // Array che conterrà i dati dei vulcani pre-elaborati
let selectedCategory = null; // Categoria selezionata (null = nessuna, mostra tutti)

// Definizione delle categorie con colore e forma
let categories = [
  { name: 'Stratovolcano', color: 'red', shape: 'triangle' },
  { name: 'Cone', color: 'orange', shape: 'triangle' },
  { name: 'Crater System', color: 'yellow', shape: 'ellipse' },
  { name: 'Other / Unknown', color: 'grey', shape: 'ellipse' },
  { name: 'Shield Volcano', color: 'green', shape: 'ellipse' },
  { name: 'Maars / Tuff ring', color: 'purple', shape: 'ellipse' },
  { name: 'Caldera', color: 'blue', shape: 'ellipse' },
  { name: 'Submarine Volcano', color: 'cyan', shape: 'triangle' },
  { name: 'Subglacial', color: 'brown', shape: 'triangle' }
];

// ===================== PRELOAD =====================
function preload() {
  vulcani = loadTable('assets/dataset.csv', 'csv', 'header'); // Carica CSV prima di setup
}

// ===================== SETUP =====================
function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas a tutta finestra
  textAlign(CENTER, CENTER);               // Testo centrato orizzontalmente e verticalmente
  noStroke();                              // Disabilita bordi di default

  // ====== TROVA MIN/MAX LATITUDINE E LONGITUDINE ======
  let latMin = Number.MAX_VALUE; // Inizializza latitudine minima molto alta
  let latMax = -Number.MAX_VALUE; // Inizializza latitudine massima molto bassa
  let lonMin = Number.MAX_VALUE;  // Longitudine minima
  let lonMax = -Number.MAX_VALUE; // Longitudine massima

  for (let i = 0; i < vulcani.getRowCount(); i++) {
    let lat = float(vulcani.getString(i, "Latitude"));   // Latitudine del vulcano i-esimo
    let lon = float(vulcani.getString(i, "Longitude"));  // Longitudine
    if (lat < latMin) latMin = lat;                      // Aggiorna lat minima
    if (lat > latMax) latMax = lat;                      // Aggiorna lat massima
    if (lon < lonMin) lonMin = lon;                      // Aggiorna lon minima
    if (lon > lonMax) lonMax = lon;                      // Aggiorna lon massima
  }

  // ====== PRE-ELABORAZIONE DEI DATI DEI VULCANI ======
  for (let i = 0; i < vulcani.getRowCount(); i++) {
    let nome = vulcani.getString(i, "Volcano Name");           // Nome vulcano
    let lat = float(vulcani.getString(i, "Latitude"));         // Latitudine
    let lon = float(vulcani.getString(i, "Longitude"));        // Longitudine
    let categoria = vulcani.getString(i, "TypeCategory");      // Categoria
    let altezza = float(vulcani.getString(i, "Elevation (m)")) || 0; // Altezza, default 0

    // Mappa coordinate geografiche in coordinate canvas
    let x = map(lon, lonMin, lonMax, 50, width - 50);  // x tra 50 e width-50
    let y = map(lat, latMax, latMin, 100, height - 50); // y tra header e bottom
    let size = map(altezza, 0, 6000, 10, 50);          // Dimensione proporzionale all'altezza

    // Salva il vulcano come oggetto
    vulcaniData.push({ x, y, size, categoria, nome, altezza });
  }
}

// ===================== DRAW =====================
function draw() {
  background(255);   // Sfondo bianco
  drawHeader();      // Disegna header/legenda in alto

  // ====== DISEGNA VULCANI FILTRATI ======
  for (let v of vulcaniData) {
    if (!selectedCategory || v.categoria === selectedCategory) { // Controlla filtro
      drawVulcano(v.x, v.y, v.categoria, v.size);              // Disegna vulcano
    }
  }

  // ====== TOOLTIP ======
  for (let v of vulcaniData) {
    if ((!selectedCategory || v.categoria === selectedCategory) &&
        dist(mouseX, mouseY, v.x, v.y) < v.size / 2) {        // Mouse sopra vulcano?
      fill(255, 255, 200);                                     // Sfondo tooltip giallo chiaro
      stroke(0);                                               // Bordo nero
      strokeWeight(1);
      rect(mouseX + 10, mouseY - 20, 180, 50, 5);             // Rettangolo tooltip
      noStroke();
      fill(0);
      textSize(12);
      text(`${v.nome}\nCategoria: ${v.categoria}\nAltezza: ${v.altezza} m`,
           mouseX + 100, mouseY + 5);                          // Testo tooltip
      break; // Mostra solo un tooltip alla volta
    }
  }
}

// ===================== FUNZIONE PER DISEGNARE UN VULCANO =====================
function drawVulcano(x, y, categoria, size) {
  push();              // Salva stato grafico
  translate(x, y);     // Sposta origine al centro del vulcano

  switch (categoria.toLowerCase()) {
    case 'stratovolcano':
      fill('red'); 
      triangle(0, -size / 2, -size / 2, size / 2, size / 2, size / 2);
      break;
    case 'cone':
      fill('orange'); 
      triangle(0, -size / 3, -size / 3, size / 3, size / 3, size / 3);
      break;
    case 'crater system':
      fill('yellow'); 
      ellipse(0, 0, size * 0.8, size * 0.8);
      break;
    case 'other / unknown':
      fill('grey'); 
      ellipse(0, 0, size / 2, size / 2);
      break;
    case 'shield volcano':
      fill('green'); 
      ellipse(0, 0, size, size / 2);
      break;
    case 'maars / tuff ring':
      fill('purple'); 
      stroke(0); strokeWeight(1);
      ellipse(0, 0, size, size);
      noStroke();
      break;
    case 'caldera':
      fill('blue'); 
      ellipse(0, 0, size * 1.2, size * 1.2);
      break;
    case 'submarine volcano':
      fill('cyan'); 
      triangle(-size / 2, size / 2, size / 2, size / 2, 0, -size / 3);
      break;
    case 'subglacial':
      fill('brown'); 
      triangle(-size / 2, -size / 2, size / 2, -size / 2, 0, size / 2);
      break;
    default:
      fill('black'); 
      ellipse(0, 0, size / 2, size / 2);
  }

  pop(); // Ripristina stato grafico precedente
}

// ===================== HEADER / LEGENDA =====================
function drawHeader() {
  let headerHeight = 100;
  fill(255);              // Sfondo bianco
  noStroke();             // Nessun bordo
  rect(0, 0, width, headerHeight); // Rettangolo header

  textAlign(CENTER, CENTER);
  fill(0);
  textSize(20);
  text("Type Category Vulcani (clicca per filtrare)", width / 2, 25); // Titolo header

  // Calcola spazio tra i simboli
  let spacing = width / (categories.length + 1);

  // Disegna simboli delle categorie e testo
  for (let i = 0; i < categories.length; i++) {
    let cat = categories[i];
    let xPos = spacing * (i + 1);
    let yPos = 60;

    fill(cat.color);
    noStroke();
    if (cat.shape === 'triangle') {
      triangle(xPos, yPos - 7, xPos - 7, yPos + 7, xPos + 7, yPos + 7);
    } else if (cat.shape === 'ellipse') {
      ellipse(xPos, yPos, 15, 15);
    }

    fill(0);
    textSize(12);
    text(cat.name, xPos, yPos + 20); // Nome categoria sotto simbolo
  }
}

// ===================== GESTIONE CLICK SULLA LEGENDA =====================
function mousePressed() {
  let headerHeight = 100;
  if (mouseY < headerHeight) { // Solo se cliccato sull'header
    let spacing = width / (categories.length + 1);
    for (let i = 0; i < categories.length; i++) {
      let xPos = spacing * (i + 1);
      if (dist(mouseX, mouseY, xPos, 60) < 15) { // Se cliccato sul simbolo
        selectedCategory = (selectedCategory === categories[i].name) ? null : categories[i].name; // Toggle
        break;
      }
    }
  }
}

// ===================== RISIZE AUTOMATICO =====================
function windowResized() {
  resizeCanvas(windowWidth, windowHeight); // Aggiorna dimensioni canvas
}
