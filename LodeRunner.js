/*     Lode Runner

Aluno 1: ?number ?name <-- mandatory to fill
Aluno 2: ?number ?name <-- mandatory to fill

Comentario:

O ficheiro "LodeRunner.js" tem de incluir, logo nas primeiras linhas,
um comentário inicial contendo: o nome e número dos dois alunos que
realizaram o projeto; indicação de quais as partes do trabalho que
foram feitas e das que não foram feitas (para facilitar uma correção
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementação que possam ser menos óbvios para o avaliador.

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/


// GLOBAL VARIABLES

// tente não definir mais nenhuma variável global

let empty, hero, control, currentLevel;

// ACTORS

class Actor 
{

	constructor(x, y, imageName) 
	{
		this.name = "";
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
		// Esta variavel serve para saber se o heroi pode destroir o objeto ou nao
		this.destroyable = false;
		// Esta variavel serve para saber se o heroi estar em cima do objecto
		this.overlap = false;
		this.eatable = false;
	}

	draw(x, y) 
	{
		control.ctx.drawImage(GameImages[this.imageName],
				x * ACTOR_PIXELS_X, y* ACTOR_PIXELS_Y);
	}

	move(dx, dy) 
	{
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}

	// Altera o estado do objecto para destrutivel
	setDestroyable(bool)
	{
		this.destroyable = bool;
	}

	// Altera o estado do objecto para se possivel estar em cima dele
	setOverlap(bool)
	{
		this.overlap = bool;
	}
	
}

class PassiveActor extends Actor 
{

	constructor(x,y,ImageName)
	{
		super(x,y,ImageName);
		// Variavel para saber se foi destruido
		this.destroyed = false;
		// Variavel para saber se pode ser comido
		this.eatable = false;
		// Variavel para saber se podemos atravessar
		this.passthrough = false;
		// Variavel para saber se tem um movimento predefinido
		this.constraint = false;
	}

	show() 
	{
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}

	hide() 
	{
		console.log("I am going to hide");
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}

	canEat(){
		return this.eatable;
	}

	moveInto(dx,dy)
	{
		return true;
	}

	moveOutFrom(dx,dy)
	{
		return true;
	}

	checkConstraint()
	{
		return [0,0];
	}

	animation()
	{
		
	}
}

class ActiveActor extends Actor 
{

	constructor(x, y, imageName) 
	{
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.gravity = true;
		this.direction = [0,0];
	}
	show() 
	{
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() 
	{
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}
	animation() {}

	//VERIFICA Se tem chao
	hasGround()
	{
		if(!control.world[this.x][this.y + 1].overlap && !control.world[this.x][this.y + 1].passthrough)
			return true;
		return false;
	}

	left()
	{
		if(this.direction[0] == -1)
			return true;
		return false;
	}

	up()
	{
		if(this.direction[1] == -1)
			return true;
		return false;
	}
	// Verifica se o proximo movimento esta dentro do mundo
	// Verifica se pode sair do objecto em que esta
	// Verifica se pode entrar para o objecto seguinte
	move(dx, dy) 
	{
		let nextX = (this.x + dx);
		let nextY = (this.y + dy);

		if(!ObjectInCanvas(nextX, nextY))
			return;
		else if(!control.world[this.x][this.y].moveOutFrom(dx,dy))
			return;
		else if(!control.world[nextX][nextY].moveInto(dx,dy))
			return;
		else
		{
			super.move(dx,dy);
			if(dx == 1 ||dx == -1)
				this.direction[0] = dx;
			if(dy == 1 || dy == -1)
				this.direction[1] = dy;
		}
	}

	canShoot()
	{
		return false;
	}

	shoot()
	{

	}
}

class Brick extends PassiveActor 
{
	constructor(x, y) 
	{ 
		super(x, y, "brick");
		super.name = "brick";
		super.setDestroyable(true);
		this.destroyed = false;
		this.timer = 0;
		this.passthrough = false;
	}

	show() 
	{
		super.show();
		super.setOverlap(false);
		this.destroyed=false;
		this.passthrough = false;
	}

	hide() 
	{
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}

	moveInto(dx, dy)
	{
		if(!this.overlap)
			return false;
		
		if(dx == 0 && dy == -1)
			return false;
		
		return true;
	}
	
	moveOutFrom(dx,dy)
	{
/* 		if(!this.Overlap)
			return false;
		else
		{ */
			/* let AdjcentBricks = getAdjecentBricks();

			for(let i = 0; i < AdjcentBricks.length ; i++)
			{
				let brick = AdjcentBricks[i];
				let [bx, by] = [brick.x - this.x,brick.y - this.y];

				if(bx == dx && by == dy)
					return brick.moveInto(dx,dy);
			} */

			if(dx == 0 && dy == -1)
				return false;
		//}
		return true;
	}

	getAdjecentBricks()
	{
		let list = [];

		let brickLeft = getPassiveObject(this.x -1, y);
		let brickRight = getPassiveObject(this.x + 1, y);
		let brickUp = getPassiveObject(this.x, y - 1);
		let brickDown = getPassiveObject(this.x, y + 1);

		list.push(brickLeft);
		list.push(brickRight);
		list.push(brickUp);
		list.push(brickDown);

		return list;
	}

	animation(){
		if(this.destroyed == true){
			if(this.timer == 0){
				this.show();
			}else{
				this.timer--;
			}
		}
	}

	destroyBlock()
	{
		if(this.timer > 0)
			return;
		this.timer = 80;
		super.setOverlap(true);
		this.destroyed = true;
		this.passthrough = true;
		empty.draw(this.x, this.y);
	}
}

class Chimney extends PassiveActor 
{
	constructor(x, y) 
	{ 
		super(x, y, "chimney");
		super.name = "chimney"; 
		this.setOverlap(true);
		this.passthrough = true;
		this.constraint = true;
	}

	moveInto(dx, dy)
	{
		if(dx != 0 && dy != 1)
			return false;
		return true;
	}

	// Devolve o movimento que o heroi tem que fazer para sair
	checkConstraint()
	{
		return [0, 1];
	}
}

class Empty extends PassiveActor 
{
	constructor() 
	{ 
	super(-1, -1, "empty"); 
	super.name = "empty";
	this.passthrough = true;
	//this.setOverlap(true);
	}
	show() {}
	hide() {}
}

class Gold extends PassiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "gold");
		super.name = "gold";
		this.eatable = true;
	}

	show() 
	{
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() 
	{
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}
	
}

class Invalid extends PassiveActor 
{

	constructor(x, y) { super(x, y, "invalid",false); }
}

class Ladder extends PassiveActor 
{

	constructor(x, y) 
	{
		super(x, y, "ladder");
		super.name = "ladder";
		this.visible = false;
		this.setOverlap(true);
	}

	show() 
	{
		if( this.visible )
			super.show();
	}

	hide() 
	{
		if( this.visible )
			super.hide();
	}

	makeVisible() 
	{
		this.visible = true;
		this.show();
	}

	moveInto(dx,dy)
	{
		if(dx == 0 && dy == -1 && control.getPassiveObject(this.x,this.y + 1).name != "ladder")
			return false;
		else
			return true;
	}
}

class Rope extends PassiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "rope"); 
		super.name = "rope";
		this.setOverlap(true);
		this.passthrough = true;
	}

	moveInto(dx, dy)
	{
		if(dx == 0 && dy == -1 && control.world[this.x][this.y + 1] == empty)
			return false;
		return true;
	}

	moveOutFrom(dx,dy)
	{
		return this.moveInto(dx,dy);
	}
}

class Stone extends PassiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "stone");
		super.name = "stone"; 
		this.setOverlap(true);
	}

	moveInto(dx, dy)
	{
		if( dx == 0 && dy != 0)
			return false;
		return true;
	}
	
	moveOutFrom(dx,dy)
	{
		return this.moveInto(dx,dy);
	}
}

class Hero extends ActiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "hero_runs_left");
		super.name = "hero";
		hero = this;
		this.eatable = true;
		super.show();
		this.direction = [-1,0];
	}
	//funcao booleana para verificar se que verifica se ha possibilidade de haver objetos a frente
	isThereNext(dx,dy){
		let tx = this.x+dx;
		let ty = this.y+dy;
		if(tx>=0&&tx<WORLD_WIDTH&&ty>0&&ty<WORLD_HEIGHT){
			return true;
		}
		return false;
	}

	showAnimation()
	{
		let curBlock = control.world[this.x][this.y];
		let groundBlock = control.world[this.x][this.y + 1];

		switch(curBlock.name)
					{
						case "ladder": 
							if(this.imageName == "hero_on_ladder_left")
								this.imageName = "hero_on_ladder_right";
							else if(this.imageName == "hero_on_ladder_right")
								this.imageName = "hero_on_ladder_left";
							else
							{
								if(this.direction[0] == -1) 
									this.imageName = "hero_on_ladder_left";
								else
									this.imageName = "hero_on_ladder_right";
							}

						break;
						case "empty":
							if(curBlock == empty && groundBlock != empty && !groundBlock.passthrough)
							{
								if(this.direction[0] == -1 || this.direction[0] == 0) 
								this.imageName = 'hero_runs_left';
								else
								this.imageName = 'hero_runs_right';
							} 
							else 
							{
								if(this.direction[0] == -1) 
								this.imageName = 'hero_falls_left';
								else
								this.imageName = 'hero_falls_right';
							}

						break;

						case "rope":

							if(this.direction[0] == -1) 
								this.imageName = 'hero_on_rope_left';
							else
								this.imageName = 'hero_on_rope_right';	

						break;

						case "chimney":

							if(this.direction[0] == -1) 
								this.imageName = 'hero_falls_left';
							else
								this.imageName = 'hero_runs_right';	

						break;

						case "stone":

							if(this.direction[0] == -1) 
								this.imageName = 'hero_runs_left';
							else
								this.imageName = 'hero_runs_right';	

						break;
					}
					super.show();
	}

	animation()
	{
	// Recebe input
		this.countGold();
		let k = control.getKey();
		let nextBlock=null;
		let [dx, dy] = [0,0];
		
			if(k != ' ' && k != null)
			{
				[dx, dy] = k;
				if(this.isThereNext(dx,dy)){
					nextBlock = control.world[this.x + dx][this.y + dy];
				}
			}
		let curBlock = control.world[this.x][this.y];
		
		let groundBlock = null;

		if(this.isThereNext(dx,1)){
			groundBlock = control.world[this.x][this.y + 1];
		}else{
			//caiu num buraco em que nao e possivel sair
			//control.worldActive[this.x][this.y]=control.world[this.x][this.y];
			return;
		}
		// Verifica se não esta restringido
		if(curBlock.constraint || groundBlock.constraint)
		{
			let dir;
			// Recebe a direcao para percorrer
			if(curBlock.constraint)
				dir = curBlock.checkConstraint();
			else
				dir = groundBlock.checkConstraint();

			super.hide();
			super.move(dir[0],dir[1]);
			this.showAnimation();
		}
		// Verifica se nao esta a cair
		
		else if((groundBlock == empty && curBlock == empty) || (curBlock == empty && groundBlock != empty && groundBlock.passthrough) ||  (!curBlock.overlap && groundBlock.passthrough) || (curBlock.destroyed && groundBlock.passthrough && !groundBlock.overlap	))
		{	
			super.hide();
			super.move(0,1);
			this.showAnimation();
		}
		// Tenta Mover
		else
		{
			// SE FOR PARA DISPARAR
			if( k == ' ' ) 
			{ 
				this.shoot();
			}
			// VERIFICA SE NAO EXISTE NENHUM INPUT
			else if(k != null)
			{
				// VERIFICA SE CONSEGUE MUDAR PARA A PROXIMA POSICAO
				if(!curBlock.moveOutFrom(dx,dy))
					return;
				else if(nextBlock!=null && !nextBlock.moveInto(dx,dy))
					return;
				else
				{
					// ISTO E PARA IMPEDIR QUE ELE DE UM SALTO
					if((nextBlock ==null) || nextBlock == empty && curBlock == empty && dy == -1)
						return;

					// MUDA DE POSICAO
					super.hide();
					super.move(dx,dy);
					this.showAnimation();
					super.show();
				}
			}
		}
	}

	shoot()
	{
		let groundBlockToShoot = null;
		let xx = 0;
		let yy = this.y+1;
		if(super.left()){
			xx = this.x-1;
			if(xx>0){
				groundBlockToShoot = control.world[xx][yy];
				if(groundBlockToShoot.destroyable){
					this.imageName = "hero_shoots_left";
					groundBlockToShoot.destroyBlock();
				}
			}
		}else{
			xx = this.x+1;
			if(xx<WORLD_WIDTH){
				groundBlockToShoot = control.world[xx][yy];
				if(groundBlockToShoot.destroyable){
					this.imageName = "hero_shoots_right";
					groundBlockToShoot.destroyBlock();
				}
			}
		}
	}
	countGold(){
		//console.log(control.world[this.x][this.y]);
		if(control.world[this.x][this.y].eatable){
			console.log("Count gold");
			control.gold--;
			console.log("Count gold "+control.gold);
			if(control.gold===0){
				currentLevel++;
				control.loadLevel(currentLevel);
			}
		}
	}
}

class Robot extends ActiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "robot_runs_right");
		super.name = "robot";
		this.eatable = false;
		this.overlap = false;
		this.timer = 0;
	}

	getHeroDir()
	{
		let dir = [0,0];
		if(this.x < hero.x)
			dir[0] = 1;
		else if(this.x > hero.x)
			dir[0] = -1;
		else
		dir[0] = 0;

		if(this.y < hero.y)
			dir[1] = 1;
		else if(this.y > hero.y)
			dir[1] = -1;	
		else
			dir[1] = 0;

		return dir;
	}

	showAnimation()
	{
		let curBlock = control.world[this.x][this.y];
		let groundBlock = control.world[this.x][this.y + 1];

		switch(curBlock.name)
					{
						case "ladder": 
							if(this.imageName == "robot_on_ladder_left")
								this.imageName = "robot_on_ladder_right";
							else if(this.imageName == "hero_on_ladder_right")
								this.imageName = "robot_on_ladder_left";
							else
							{
								if(this.direction[0] == -1) 
									this.imageName = "robot_on_ladder_left";
								else
									this.imageName = "robot_on_ladder_right";
							}

						break;
						case "empty":
							if(curBlock == empty && groundBlock != empty && !groundBlock.overlap)
							{
								if(this.direction[0] == -1 || this.direction[0] == 0) 
								this.imageName = 'robot_runs_left';
								else
								this.imageName = 'robot_runs_right';
							} 
							else 
							{
								if(this.direction[0] == -1) 
								this.imageName = 'robot_falls_left';
								else
								this.imageName = 'robot_falls_right';
							}

						break;

						case "rope":

							if(this.direction[0] == -1) 
								this.imageName = 'robot_on_rope_left';
							else
								this.imageName = 'robot_on_rope_right';	

						break;

						case "chimney":

							if(this.direction[0] == -1) 
								this.imageName = 'robot_falls_left';
							else
								this.imageName = 'robot_falls_right';	

						break;

						case "stone":

							if(this.direction[0] == -1) 
								this.imageName = 'robot_runs_left';
							else
								this.imageName = 'robot_runs_right';	

						break;
					}
					super.show();
	}

	animation()
	{
	// Recebe input
		let [dx, dy] = this.getHeroDir();
		
		let curBlock = control.world[this.x][this.y];
		let groundBlock = control.world[this.x][this.y + 1];

		if(!super.hasGround() && (curBlock == empty || curBlock.passthrough))
		{	
			super.hide();
			super.move(0,1);
			this.showAnimation();
		}
		// Tenta Mover
		else
		{
			if(this.timer > 0)
			{
				this.timer--;
				return;
			} 
			else
			{
				this.timer = 9999;
				let nextBlock = control.world[this.x][this.y + dy];
				// ISTO E PARA IMPEDIR QUE ELE DE UM SALTO
				if((nextBlock ==null) || nextBlock == empty && curBlock == empty && dy == -1)
				return;
				// VERIFICA SE CONSEGUE MUDAR PARA A PROXIMA POSICAO

				// TESTA SE CONSEGUE MEXER NA VERTICAL
				if(dy != 0)
				{

					if(!nextBlock.moveInto(0,dy))
						dy = 0;
					else if(!curBlock.moveOutFrom(0,dy))
						dy = 0;
					else
						dx = 0;
				}	

					// TESTA SE CONSEGUE MEXER NA HORIZONTAL
					if(dx != 0) 
					{
						nextBlock = control.world[this.x + dx][this.y];
						
						if(nextBlock.moveInto(dx,0))
						{
							if(!curBlock.moveOutFrom(dx,0))
								dx = 0;
						}
					}
					//SE NAO SE CONSEGUE MEXER NAO FAZ NADA
					if(dx == 0 && dy == 0)
						return;

					super.hide();
					super.move(dx,dy);
					this.showAnimation();
					super.show();
			}
		}
	}
}

class WorldBorder extends Stone
{
	constructor()
	{
		super(-1,-1,"Stone");
		this.overlap(false);
	}

	moveInto(dx, dy)
	{
		return false;
	}
	
	moveOutFrom(dx,dy)
	{
		return false;
	}

	show() {}
	hide() {}
}

// GAME CONTROL

class GameControl 
{
	constructor() 
	{
		this.gold = 0;
		this.level = 0;
		this.end = 0;
		control = this;
		currentLevel = 2;
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(currentLevel);
		this.setupEvents();
	}

	createMatrix() 
	{ // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ )
		{
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}

	loadLevel(level) 
	{
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];  // -1 because levels start at 1
		control.level = level;
        for(let x=0 ; x < WORLD_WIDTH ; x++)
            for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
				if(map[y][x]==='o'){
					control.gold++;
					console.log("Gold "+x+" "+y);
				}
			}
	}
	getKey() 
	{
		let k = control.key;
		control.key = 0;
		switch( k ) 
		{
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		}	
	}

	setupEvents() 
	{
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	}

	animationEvent() 
	{
		control.time++;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let active = control.worldActive[x][y];
				let passive = control.world[x][y];
				if( active.time < control.time ) {
					active.time = control.time;
					active.animation();	
				}
					passive.animation();	
            }
	}


	keyDownEvent(k) { control.key = k.keyCode; }

	keyUpEvent(k) {}

	// Devolve o objecto que se encontra encontra no mundo ativo
	// Se nao houver objeto no mundo ativo
	// Devolve o objecto do mundo passivo
	getObject(x,y)
	{
		if(!ObjectInCanvas(x,y))
			return new WorldBorder();
		else if(control.worldActive[x][y] != empty)
			return control.worldActive[x][y] != empty ? control.worldActive[x][y] : control.world[x][y];
	}

	// Devolve o objecto que se encontra no mundo passivo
	getPassiveObject(x,y)
	{
		if(!ObjectInCanvas(x,y))
		return new WorldBorder();
	else
		return control.world[x][y];
	}
	//Devolve o chao das coordenadas x e y
	getGroundObject(x,y)
	{
		let groundY = y+1;
		if(!ObjectInCanvas(x,groundY))
			return new WorldBorder();
		else this.getObject(x, groundY);
	}

	EndGame()
	{
		if(isHeroStuck())
			control.end = 1;
		else(hero.x == -1 && hero.y == -1)
			control.end = 1;
		
	}
	isHeroStuck() {}
}


// HTML FORM

function onLoad() 
{
  // Asynchronously load the images an then run the game
	GameImages.loadAll(function() { new GameControl(); });
}

function b1() 
{ 
	control.ctx.clearRect(0,0, 504, 272); 
	control = new GameControl();
}

function b2()
{

}

function ObjectInCanvas(x,y)
{
	if(x < 0 || x > WORLD_WIDTH)
		return false;
	if(y < 0 || y > WORLD_HEIGHT)
		return false;
	
	return true;
}


