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
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
		// Esta variavel serve para saber se o heroi pode destroir o objeto ou nao
		this.destroyable = false;
		// Esta variavel serve para saber se o heroi estar em cima do objecto
		this.overlap = false;
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

	constructor(x,y,ImageName, eatable)
	{
		super(x,y,ImageName);
		this.destroyed = false;
		this.eatable = eatable;
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
}

class ActiveActor extends Actor 
{

	constructor(x, y, imageName) 
	{
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.falling = true;
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

	moveInMatrix(dx, dy)
	{
		control.worldActive[this.x][this.y] = empty;
		control.worldActive[this.x + dx][this.y + dy] = this;
	}

	applyGravity()
	{
		if(control.worldActive[this.x][this.y] === empty 
			&& control.world[this.x][this.y] === empty 
			&& control.worldActive[this.x][(this.y + 1)] === empty 
			&& control.world[this.x][(this.y + 1)] === empty)
			super.move(0,1);
	}
	
	// ESTE METODO E PARA VERIFICAR SE O PROXIMO MOVIMENTO E POSSIVEL
	checkMove(dx,dy)
	{
		let nextX = (this.x + dx);
		let nextY = (this.y + dy);
		let canMove = this.moveNextBlock(nextX,nextY);
		if(!canMove)
			canMove = false;
		else
		{
			if(control.world[this.x][this.y] === empty && dy == -1)
				canMove = false;
			else
			{
				if(control.world[this.x][this.y + 1] === empty && control.world[nextX][this.y + 1] === empty)
					this.falling = true;
			}
		}
		return canMove;
	}
	//VERIFICA SE EXISTE CHAO
	moveNextBlock(x,y)
	{
		if(y > WORLD_HEIGHT || y < 0 || x < 0 || x > WORLD_WIDTH)
		{
			return false;
		}
		else
		{
			if(control.worldActive[x][y] === empty)
			{
				if(control.world[x][y].destroyable)
				{
					if(!control.world[x][y].destroyed)
						return false;
				}
				else if(!control.world[x][y].overlap)
							return false;
			}
			else
			{
				return false;
			}
		}
		return true;
	}

	move(dx, dy) 
	{

		if(this.falling)
		{
			if(this.moveNextBlock(this.x, this.y + 1))
				super.move(0,1);
			else
				this.falling = false;
		}
		else
		{
		if(this.checkMove(dx, dy))
			super.move(dx,dy);
		}
		console.log(this.y);
	}

}

class Brick extends PassiveActor 
{

	constructor(x, y) 
	{ 
		super(x, y, "brick",false); 
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
}

class Chimney extends PassiveActor 
{
	constructor(x, y) 
	{ 
		super(x, y, "chimney",false); 
		this.setOverlap(true);
	}

	moveInto(dx, dy)
	{
		if(dx != 0 && dy != 1)
			return false;
		return true;
	}
}

class Empty extends PassiveActor 
{
	constructor() 
	{ 
	super(-1, -1, "empty",false); 
	this.setOverlap(true);
	}
	show() {}
	hide() {}
}

class Gold extends PassiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "gold",true);
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
		super(x, y, "ladder",false);
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
		super(x, y, "rope",false); 
		this.setOverlap(true);
	}

	moveInto(dx, dy)
	{
		if(dx == 0 && dy == -1)
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
		hero = this;
	}

	animation() 
	{
		let k = control.getKey();
        if( k == ' ' ) { alert('SHOOT') ; return; }
        if( k == null ) return;
		let [dx, dy] = k;
		
		if(dx===-1&&dy===0){ // moving left
			this.imageName = 'hero_runs_left';
		} else if (dx===1&&dy===0){ //moving right
			this.imageName = 'hero_runs_right';
		}else if ([dx,dy]===[0,-1]){ //moving up
			//this.imageName = 'hero_runs_up';
		} else if ([dx,dy]===[0,1]){ //moving down
			//this.imageName = 'hero_runs_down';
		}
		if(control.worldActive[this.x+1][this.y].canEat()){
			control.worldActive[this.x][this.y] = empty;
		}
		console.log(control.worldActive[this.x+1][this.y].canEat() +" jjOUROoo "+ this.x, this.y);
		console.log(control.worldActive[18][this.y].canEat() +" jjOUROoo "+ this.x);
		if(control.worldActive[this.x + 1][this.y] instanceof Gold ){
			console.log("OUROoo");
		}
		super.move(dx,dy);
		
	}
}

class Robot extends ActiveActor 
{
	constructor(x, y) 
	{
		super(x, y, "robot_runs_right");
		this.dx = 1;
		this.dy = 0;
	}
}



// GAME CONTROL

class GameControl 
{
	constructor() 
	{
		control = this;
		this.key = 0;
		this.time = 0;
		this.stop = false;
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
	onLoad(); 
}

function b2()
{

}



