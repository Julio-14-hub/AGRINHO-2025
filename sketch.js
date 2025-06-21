let cube;
let fruits = [];
let blackBalls = [];
let redBalls = [];
let gravity = 0.8;
let score = 0;
let lastRedBallTime = 0;

function setup() {
  createCanvas(600, 400);
  cube = new Cube();
}
function draw() {
  // Verifica a pontuação para mudar o cenário
  if (score >= 100) {
    nightBackground(); // Função para o cenário de noite
  } else if (score >= 50) {
    sunsetBackground(); // Função para o cenário de entardecer
  } else {
    normalBackground(); // Função para o cenário normal (dia)
  }

  // Desenho do chão verde
  fill(34, 139, 34); // Verde
  noStroke();
  rect(0, height - 50, width, 50);

  // Atualiza o cub
  cube.update();
  cube.show();

  // Adiciona frutas
  if (frameCount % 60 === 0) {
    fruits.push(new Fruit());
  }

  // Adiciona bolas pretas quando o jogador atinge 10 pontos
  if (score >= 10) {
    if (frameCount % (100 - Math.floor(score / 10) * 10) === 0) {
      blackBalls.push(new BlackBall()); // Mais bombas aparecem a cada 10 pontos
    }
  }

  // Adiciona bolas vermelhas a cada 10 segundos
  if (millis() - lastRedBallTime > 10000) {
    // 10 segundos
    redBalls.push(new RedBall());
    lastRedBallTime = millis(); // Atualiza o tempo da última bola vermelha
  }

  // Atualiza e desenha frutas
  for (let i = fruits.length - 1; i >= 0; i--) {
    let fruit = fruits[i];
    fruit.fall();
    fruit.show();

    // Verifica colisão com o cubo
    if (fruit.hits(cube)) {
      score += 1; // Frutas ainda valem 1 ponto
      fruits.splice(i, 1); // Remove a fruta da tela
    }

    // Remove frutas que caíram fora da tela
    if (fruit.y > height) {
      fruits.splice(i, 1);
    }
  }

  // Atualiza e desenha bolas pretas (bombas)
  for (let i = blackBalls.length - 1; i >= 0; i--) {
    let ball = blackBalls[i];
    ball.fall();
    ball.show();

    // Verifica colisão com o cubo
    if (ball.hits(cube)) {
      // Exibe a animação de explosão
      ball.explode(); // Chama a função de explosão
      blackBalls.splice(i, 1); // Remove a bomba após explodir

      // Game Over
      textSize(32);
      fill(255, 0, 0);
      textAlign(CENTER, CENTER);
      text("Game Over!", width / 2, height / 2);
      noLoop(); // Para o jogo
    }

    // Remove bolas pretas que saíram da tela
    if (ball.y > height) {
      blackBalls.splice(i, 1);
    }
  }

  // Atualiza e desenha bolas vermelhas (valem 10 pontos)
  for (let i = redBalls.length - 1; i >= 0; i--) {
    let redBall = redBalls[i];
    redBall.fall();
    redBall.show();

    // Verifica colisão com o cubo
    if (redBall.hits(cube)) {
      score += 10; // As bolas vermelhas valem 10 pontos
      redBalls.splice(i, 1); // Remove a bola vermelha da tela
    }

    // Remove bolas vermelhas que saíram da tela
    if (redBall.y > height) {
      redBalls.splice(i, 1);
    }
  }

  // Exibe a pontuação
  fill(0);
  textSize(24);
  text("Pontos: " + score, 20, 30);

  // Desenha as nuvens no céu (no cenário normal)
  if (score < 50) {
    drawClouds();
  }
}

// Função para o cenário normal (dia)
function normalBackground() {
  background(135, 206, 250); // Fundo azul claro (dia)
  drawSun(); // Desenha o sol
}

// Função para o cenário de entardecer
function sunsetBackground() {
  // Fundo laranja para o entardecer
  background(255, 140, 0);
  drawSunsetSun(); // Desenha o sol no horizonte
}

// Função para o cenário de noite
function nightBackground() {
  background(0); // Fundo preto para o espaço
  drawMoon(); // Desenha a lua
  drawStars(); // Desenha as estrelas
}

// Função para desenhar o sol
function drawSun() {
  fill(255, 223, 0); // Cor do sol (amarelo)
  noStroke();
  ellipse(500, 100, 100, 100); // Sol no canto superior direito
}

// Função para desenhar o sol no entardecer
function drawSunsetSun() {
  fill(255, 140, 0); // Sol laranja para o entardecer
  noStroke();
  ellipse(500, height - 50, 120, 120); // Sol se pondo no horizonte
}

// Função para desenhar a lua
function drawMoon() {
  fill(255); // Lua branca
  noStroke();
  ellipse(500, 100, 80, 80); // Lua no canto superior direito
}

// Função para desenhar as estrelas
function drawStars() {
  fill(255);
  noStroke();
  for (let i = 0; i < 100; i++) {
    ellipse(random(width), random(height), random(1, 3), random(1, 3)); // Estrelas aleatórias
  }
}

// Função para desenhar as nuvens
function drawClouds() {
  fill(255, 255, 255, 180); // Nuvens brancas com um pouco de transparência
  noStroke();
  ellipse(100, 80, 100, 60);
  ellipse(150, 60, 120, 70);
  ellipse(400, 100, 110, 65);
  ellipse(450, 120, 90, 55);
}

// Classe do Cubo (Jogador)
class Cube {
  constructor() {
    this.x = width / 2;
    this.y = height - 50;
    this.size = 30;
    this.velY = 0;
    this.speed = 5;
    this.isJumping = false; // Para controlar o estado do pulo
  }

  update() {
    // Movimento do cubo
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
      this.x -= this.speed;
    }
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
      this.x += this.speed;
    }

    // Pulo
    if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && !this.isJumping) {
      this.velY = -12;
      this.isJumping = true;
    }

    // Gravidade
    this.y += this.velY;
    this.velY += gravity;

    // Impede o cubo de sair da tela
    this.x = constrain(this.x, 0, width - this.size);

    // Verifica se o cubo está no chão para permitir um novo pulo
    if (this.y > height - 50) {
      this.y = height - 50;
      this.velY = 0;
      this.isJumping = false; // Permite pular novamente
    }
  }

  show() {
    // Criando o gradiente de cor para o cubo
    let gradient = drawingContext.createLinearGradient(
      this.x,
      this.y,
      this.x + this.size,
      this.y + this.size
    );
    gradient.addColorStop(0, color(255, 0, 0)); // Cor inicial (vermelho)
    gradient.addColorStop(1, color(200, 0, 0)); // Cor final (vermelho mais escuro)

    drawingContext.fillStyle = gradient;
    noStroke();
    rect(this.x, this.y, this.size, this.size);
  }
}

// Classe das Frutas (Bolinhas Amarelas)
class Fruit {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 20;
    this.velY = 5;
  }

  fall() {
    this.y += this.velY;
  }

  show() {
    fill(255, 255, 0); // Bolinhas amarelas
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  hits(cube) {
    let d = dist(
      this.x,
      this.y,
      cube.x + cube.size / 2,
      cube.y + cube.size / 2
    );
    return d < this.size / 2 + cube.size / 2;
  }
}

// Classe das Bolas Pretas (Bombas)
class BlackBall {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 20;
    this.velY = 6;
    this.exploding = false;
  }

  fall() {
    this.y += this.velY;
  }

  show() {
    // Desenha a bomba (bola preta)
    fill(0); // Cor preta
    noStroke();

    // Verifica se estamos no cenário de noite
    if (score >= 100) {
      // Se for noite, adiciona uma borda branca
      stroke(255); // Cor branca para a borda
      strokeWeight(4); // Espessura da borda
      noFill(); // Não preenche a bola, apenas desenha a borda
      ellipse(this.x, this.y, this.size, this.size); // Desenha a borda branca
    }

    ellipse(this.x, this.y, this.size, this.size); // Desenha a bola preta normalmente

    // Desenha o pavio
    this.drawFuse();

    if (this.exploding) {
      this.showExplosion(); // Mostra a explosão
    }
  }

  drawFuse() {
    // Pavio na parte superior da bola preta
    stroke(255, 0, 0); // Cor do pavio (vermelho)
    strokeWeight(3); // Espessura da linha
    line(this.x, this.y - this.size / 2, this.x, this.y - this.size / 2 - 15); // Linha representando o pavio
  }

  explode() {
    this.exploding = true;
  }

  showExplosion() {
    fill(255, 0, 0, 150); // Explosão vermelha
    noStroke();
    ellipse(this.x, this.y, this.size * 2, this.size * 2);
    this.size += 5; // Aumenta o tamanho da explosão

    if (this.size > 100) {
      this.size = 0;
    }
  }

  hits(cube) {
    let d = dist(
      this.x,
      this.y,
      cube.x + cube.size / 2,
      cube.y + cube.size / 2
    );
    return d < this.size / 2 + cube.size / 2;
  }
}

// Classe da Bola Vermelha (10 pontos)
class RedBall {
  constructor() {
    this.x = random(width);
    this.y = 0;
    this.size = 20;
    this.velY = 4;
  }

  fall() {
    this.y += this.velY;
  }

  show() {
    fill(255, 0, 0); // Bola vermelha
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }

  hits(cube) {
    let d = dist(
      this.x,
      this.y,
      cube.x + cube.size / 2,
      cube.y + cube.size / 2
    );
    return d < this.size / 2 + cube.size / 2;
  }
}
