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

let empty, hero, control;

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
		if(control.world[this.x][this.y + 1] === empty)
			return false;
		return true;
	}

	left()
	{
		if(this.dir == [-1,0])
			return true;
		return false;
	}

	up()
	{
		if(this.dir == [0,-1])
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
			this.hide();
			super.move(dx,dy);
			this.direction[dx,dy];
			this.show();
			console.log([this.x,this.y]);
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
	}

	show() 
	{
		super.show();
		control.worldActive[this.x][this.y] = this;
		super.setOverlap(false);
	}

	hide() 
	{
		control.worldActive[this.x][this.y] = empty;
		super.setOverlap(true);
		this.destroyed = true;
	}

	moveInto(dx, dy)
	{
		if(!this.Overlap)
			return false;
		
		if(dx == 0 && dy == -1)
			return false;
		
		return true;
	}
	
	moveOutFrom()
	{
		if(this.Overlap)
			return true;
		else return false;
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
	this.setOverlap(true);
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
		if(dx == 0 && dy == -1 && control.world[this.x][this.y + 1] === empty)
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
	}
	animation()
	{
	// Recebe input
		let k = control.getKey();
		let nextBLock;
		let [dx, dy] = [0,0];
		
			if(k != ' ' && k != null)
			{
				[dx, dy] = k;
				nextBLock = control.world[this.x + dx][this.y + dy];
			}


		let curBlock = control.world[this.x][this.y];
		let groundBlock = control.world[this.x][this.y + 1];

		// Verifica se não esta restringido
		if(curBlock.constraint || groundBlock.constraint)
		{
			let dir;
			// Recebe a direcao para percorrer
			if(curBlock.constraint)
				dir = curBlock.checkConstraint();
			else
				dir = groundBlock.checkConstraint();

			super.move(dir[0],dir[1]);
		}
		// Verifica se nao esta a cair 
		else if(!super.hasGround() && curBlock == empty)
		{
			if(this.left())
				this.imageName = "hero_falls_left";
			else
				this.imageName = "hero_falls_right";
			
			super.move(0,1);
		}
		// Tenta Mover
		else
		{
			if( k == ' ' ) 
			{ 
				if(super.canShoot())
				{
					if(super.left())
					this.imageName = "hero_shoots_left"
					else
					this.imageName = "hero_shoots_right"
					
					super.shoot();
				}
			}
			else if(k != null)
			{
				if(!curBlock.moveOutFrom(dx,dy))
					return;
				else if(!nextBLock.moveInto(dx,dy))
					return;
				else
				{
					if(nextBLock == empty && curBlock == empty && dy == -1)
						return;

					switch(nextBLock.name)
					{
						case "ladder": 
							if(this.imageName == "hero_on_ladder_left")
								this.imageName = "hero_on_ladder_right";
							else if(this.imageName == "hero_on_ladder_right")
								this.imageName = "hero_on_ladder_left";
							else
							{
								if(dx==-1 && dy==0) 
									this.imageName = "hero_on_ladder_left";
								else
									this.imageName = "hero_on_ladder_right";
							}

						break;
						case "empty":
							if(nextBLock == empty && groundBlock != empty)
							{
								if(dx==-1 && dy==0) 
								this.imageName = 'hero_runs_left';
								else
								this.imageName = 'hero_runs_right';
							}
							else
							{
								if(super.left()) 
								this.imageName = 'hero_falls_left';
								else
								this.imageName = 'hero_falls_right';
							}
					
						break;

						case "rope":

							if(dx==-1 && dy==0) 
								this.imageName = 'hero_on_rope_left';
							else
								this.imageName = 'hero_on_rope_right';	

						break;
					}
					super.move(dx,dy);
				}
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
	}

	getHeroDir()
	{
		let dir = [0,0];
		if(this.x < hero.x)
			dir[0] = 1;
		else
			dir[0] = -1;

		if(this.y < hero.y)
			dir[1] = 1;
		else
			dir[1] = -1;

		return dir;
	}

	animation()
	{
		
	}
}



// GAME CONTROL

class GameControl 
{
	constructor() 
	{
		this.gold = 0;
		this.level = 0;

		control = this;
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(2);
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
				let a = control.worldActive[x][y];
				if( a.time < control.time ) {
					a.time = control.time;
					a.animation();	
				}
            }
	}


	keyDownEvent(k) { control.key = k.keyCode; }

	keyUpEvent(k) {}

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


