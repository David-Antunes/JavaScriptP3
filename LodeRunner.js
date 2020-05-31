/*     Lode Runner

Aluno 1: ?number ?name <-- mandatory to fill
Aluno 2: ?number ?name <-- mandatory to fill

Comentario:

O ficheiro "LodeRunner.js" tem de incluir, logo nas primeiras linhas,
um comentÃ¡rio inicial contendo: o nome e nÃºmero dos dois alunos que
realizaram o projeto; indicaÃ§Ã£o de quais as partes do trabalho que
foram feitas e das que nÃ£o foram feitas (para facilitar uma correÃ§Ã£o
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementaÃ§Ã£o que possam ser menos Ã³bvios para o avaliador.

01234567890123456789012345678901234567890123456789012345678901234567890123456789
*/


// GLOBAL VARIABLES

// tente nÃ£o definir mais nenhuma variÃ¡vel global

let empty, hero, control;



// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.imageName = imageName;
		this.show();
		this.name = "";
	}
	
	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
				x * ACTOR_PIXELS_X, y* ACTOR_PIXELS_Y);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.showAnimation();
		this.show();
	}
}

class PassiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.moveOnX= false; //tells if the object serves as a horizontal path
		this.moveOnY=false; //tell is the object serves as a vertical path
		this.moveOnUnder=false; //tells if the active actor can move horizontally inside the object
		this.eatable = false;//tells if this object can be eaten, if it can serve as gold
		this.passthrough = false;// tells if this object can be passed through in any direction, example: chimey, destroied blocks,  food
		this.destroyable = false; //tell is the object can be destroied in the game
		this.visible=true;
		this.winObject = false;
		//tells if the active actor can stretch upwards to reach this object, 
		//example: active actors can reach ropes when they are 1 key distance above them,
		this.name =imageName;
		this.destroyed = false;
		//tell if this actor allows the actor above him to shoot
		this.canShootStandingOnMe = false;
	}

	//the actor must not shoot
	getCanShootStandingOnMe() {
		return this.canShootStandingOnMe;
	}
	//it is a solid object
	hardObject() {
		return false;
	}

	show() {
		control.world[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}

	animation(){

	}
}

class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.good = false;
		this.direction = [0,0]; //vetor de direção do ator
	}
	/**
	 * finds a random place in the map to place the object obj
	 * @param {} obj 
	 */
	findRandomPos(obj){
		let co  = true;
		let xx = 0;
		let yy = 0;
		let newA = null;
		while(co){
			xx = rand(WORLD_WIDTH);
			yy = rand(WORLD_HEIGHT);
			newA = control.getObject(xx,yy);
			if(newA==empty){
				co = false;
			}
		}
		newA = obj;
		newA.x = xx;
		newA.y = yy;
		newA.show();
	}
	//responsible for the actor to pick up food
	collectFood(){}
	/**
	 * Responsible to make the actor fall one step
	 * actor only falls one move down if they are on a passthrou (empty object) and down is also an empty object
	 */
	actorFall(){
		let res= false;
		let yy = this.y+1;
		let downActiveActor = control.getActiveObject(this.x,yy);
		if(downActiveActor==control.boundary){
			res=false;
		}else{
			let  downObject = control.getPassiveObject(this.x,yy);
			let passiveBlock = control.getPassiveObject(this.x,this.y);
			if(downActiveActor!=empty){
				res=false;
			}
			else if(passiveBlock.passthrough){
				if(downObject !=null && (downObject.passthrough || downObject.moveOnUnder)){
					this.move(0,1);
					res = true;
				}
			}
		}
		return res;
	}

	animation(dx,dy){
		let xx = this.x+dx;
		let yy = this.y+dy;

		let next = control.getPassiveObject(xx,yy);
		
		let currentWorldObject = control.world[this.x][this.y];
		//check if they can move
		if(next==control.boundary){
			return;
		}
		
		//if the actor is on a vertical object and decides to move up, it only happens if the up
		//object is a vertical path or (can be penetrated and is not destroyed)
		if(dy==-1&&currentWorldObject.moveOnY){
			if(!currentWorldObject.destroyed && (currentWorldObject.moveOnY || next.passthrough||next.moveOnUnder)){
				this.move(dx,dy);
			}
			return;
		}

		//if the next object can be penetrated
		if (next.passthrough){
			if(dy==0){
				this.move(dx,dy);
			}else if(dy==1){
				//actor wants to fall
				this.move(dx,dy);
			}
		}
		//if he wants to go down the vertical path
		else if(next.moveOnY){
			this.move(dx,dy);
		}
		//if he wants move inside the horizontal path
		else if(next.moveOnUnder){
			this.move(dx,dy);
		}
	}
	/*
		tells if the active actor is going left
	*/
	left()
	{
		if(this.direction[0] == -1)
			return true;
		return false;
	}
	/*
		tells if the active actor is going right
	*/
	up()
	{
		if(this.direction[1] == -1)
			return true;
		return false;
	}
	/*
		moves the actor
	*/
	move(dx, dy) {
		if(dx != 0){
			this.direction[0] = dx;
		}
		if(dy != 0){
		this.direction[1] = dy;
		}

		this.collectFood(this.x + dx, this.y + dy);
		super.move(dx,dy);

	}
	show(){
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}


	//show the active actors pictures as they move
	showAnimation()
	{
		let curBlock = control.getPassiveObject(this.x,this.y);
		//let downActiveActor = control.getActiveObject(this.x,this.y+1);
		let groundBlock = control.getPassiveObject(this.x,this.y+1);

		if(groundBlock!=control.boundary){
			//se abaixo estiver um ator passivo, entao sai logo
			if(control.worldActive[this.x][this.y+1]!=empty){
				return;
			}
		}	

		let name = this.name;
		switch(curBlock.name)
					{
						case "ladder": 
							
							if(this.imageName == name + "_on_ladder_left")
								this.imageName = name + "_on_ladder_right";
							else if(this.imageName == name + "_on_ladder_right")
								this.imageName = name + "_on_ladder_left";
							else
							{
								if(this.left()) 
									this.imageName = name + "_on_ladder_left";
								else
									this.imageName = name + "_on_ladder_right";
							}
							
						break;
						case "empty":
							if((groundBlock!= empty  && !groundBlock.passthrough))
							{
								if(this.left()) 
								this.imageName = name + '_runs_left';
								else
								this.imageName = name + '_runs_right';
							} 
							else 
							{
								if(this.left()) 
								this.imageName = name + '_falls_left';
								else
								this.imageName = name + '_falls_right';
							}

						break;

						case "rope":
							if(this.left()) 
								this.imageName = name + '_on_rope_left';
							else
								this.imageName = name + '_on_rope_right';	

						break;

						case "chimney":

							if(this.left()) 
								this.imageName = name + '_falls_left';
							else
								this.imageName = name + '_runs_right';	

						break;

						case "stone":

							if(this.left()) 
								this.imageName = name + '_runs_left';
							else
								this.imageName = name + '_runs_right';	

						break;

						case "brick":

							if(this.left()) 
								this.imageName = name + '_runs_left';
							else
								this.imageName = name + '_runs_right';	

						break;
					}
					this.show();
	}

}

class Brick extends PassiveActor {
	constructor(x, y) { super(x, y, "brick"); 
		super.moveOnX=true;
		this.destroyable =true;
		this.timer = 0;
		this.hard = true;
		super.canShootStandingOnMe = true;
		this.timeToRecover = 0;
	}
		
	hide() 
	{
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}


	destroyBlock()
	{
		//Mete o bloco invisivel
		if(this.destroyed){
			return;
		}
		this.hard = false;
		this.imageName = "empty";
		this.show();
		this.destroyed = true;
		this.passthrough = true;
		super.moveOnY = true;
		super.moveOnX = false;
		
		setTimeout(()=>{
			if(control.world[this.x][this.y]==this){
				let active = control.worldActive[this.x][this.y];
				if(active!=empty&&!active.good){
					active.reborn();
				}else if(active!=empty && active.good)
					control.gameLost();
				this.destroyed = false;
				this.imageName = "brick";
				this.passthrough = false;
				this.moveOnY = false;
				this.moveOnX = true;
				this.hard = true;
				this.show();
			}
		},9000);
	
	}
		
	hardObject()
	{
		return this.hard;
	}
}

class Chimney extends PassiveActor {
	constructor(x, y) { 
		super(x, y, "chimney");
		this.passthrough=true;
	}
}

class Empty extends PassiveActor {
	constructor() { super(-1, -1, "empty");
	super.passthrough = true;	
}
	show() {}
	hide() {}
}

class Gold extends PassiveActor {
	constructor(x, y) { 
	super(x, y, "gold");
	super.eatable=true;
	super.passthrough=true;
	control.food++;
	}

	// SE ISTO E CHAMADO O OURO DESAPARECE E ENTRA EM CICLO
	eaten()
	{
		super.hide();
		this.timeToDrop = 128;
	}

	// E FEITA A PERGUNTA AO OURO SE PODE VOLTAR AO MAPA
	CanIDropU(x,y)
	{
		if(control.getPassiveObject(x,y).hardObject())
			return true;
		return false;
	}


	// LIBERTA O OURO NA POSICAO DADA
	// PODES USAR ISTO PARA QUANDO O ROBOT ESTIVER STUCK
	drop(x,y)
	{
		this.x = x;
		this.y = y;
		this.show();
	}
	// Random drops the gold
	ForceDrop()
	{
		let dropped = false;
		while(!dropped)
		{
			let x = rand(WORLD_WIDTH);
			let y = rand(WORLD_HEIGHT);
			if(control.getPassiveObject(x,y) == empty 
			&& control.getPassiveObject(x,y + 1).hardObject())
			{
				this.drop(x,y);
				dropped = true;
			}
		}
	}

}

class Invalid extends PassiveActor {
	constructor(x, y) { super(x, y, "invalid"); }
}

class Ladder extends PassiveActor {
	constructor(x, y) {
		super(x, y, "ladder");
		super.moveOnY=true;
		this.hide();
		this.visible = false;
		this.canShootStandingOnMe=true;
		this.winObject = true;
	}

	/*
	hide(){
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
	}*/
    makeVisible() {
       this.imageName = "ladder";
      	this.name = "ladder";
		this.show();
		this.visible=true;
		
	}
}

class Rope extends PassiveActor {
	constructor(x, y) { super(x, y, "rope"); 
	super.moveOnUnder=true;
	}
}

class Stone extends PassiveActor {
	constructor(x, y) { 
		super(x, y, "stone");
		super.moveOnX=true;
		this.canShootStandingOnMe = true;
	}

	
	hardObject()
	{
		return true;
	}
}

// GAME CONTROL
class Boundary extends Stone {
	constructor()
	{
		super(-1,-1, "empty");
		this.moveOnX = false;
		this.canShootStandingOnMe=false;
	}

	hide() {}

	show() {}

}

class Hero extends ActiveActor {
	constructor(x, y) {
		super(x, y, "hero_runs_left");
		this.falling = false;
		this.good=true;
		this.name = 'hero';
		this.direction = [-1,0];
		this.eatable = true;
		this.gold = 0;
		this.life = 3;
	}

	animation() {

		if(this.actorFall()){
			return;
		}
		let k = control.getKey();
		if( k == ' ' ) { this.shoot(); return; }
		if(k == null)
			return;
		else
		{			
			let [dx, dy] = k;


			// ISTO E PARA O HEROI TROCAR DE POSICAO NO MESMO BLOCO
			if(dx != this.direction[0] && dx != 0)
			{
				this.direction[0] = dx;
				this.showAnimation();
				return;	
			}
			super.animation(dx,dy);
		}
	}
		
	eaten()
	{
		alert("U LOST >:(")
	}

	
	shoot()
	{


		let BlockToShoot = control.getPassiveObject(this.x + this.direction[0], this.y + 1);
		let BlockFrontHero = control.getPassiveObject(this.x + this.direction[0], this.y);
		let BlockBehindHero = control.getPassiveObject(this.x - this.direction[0], this.y);
		let GroundBehindHero = control.getPassiveObject(this.x - this.direction[0], this.y + 1);

		// Se o chao atras nao aguenta com o recuo do heroi
		if(!GroundBehindHero.getCanShootStandingOnMe() && !BlockBehindHero.getCanShootStandingOnMe()){

			return; }
		// Se o bloco a frente aguenta com um tiro e nao e passthrough o heroi nao pode disparar
		else if(BlockFrontHero.hardObject()){

			return; }
		// Se o bloco a destruir nao for destrutivel o heroi nao dispara
		else if(!BlockToShoot.destroyable){

			return; }
		else
		{
			if(super.left())
			{
				this.imageName = this.name + "_shoots_left";
			}
			else
			{
				this.imageName = this.name + "_shoots_right";
			}

			super.show();
			//Move-se no sentido contrario

			if(!BlockBehindHero.hardObject())
			{
				super.move(-this.direction[0], 0);
				// Colocar o sentido de novo
				this.direction[0] = -this.direction[0];
			}
			BlockToShoot.destroyBlock();
		}
	}

	collectFood(x,y){

		let nextActiveBlock = control.getActiveObject(x,y);

		if(nextActiveBlock != empty && !nextActiveBlock.good)
		{
			control.gameLost();
		}

		let nextBlock = control.getPassiveObject(x,y);

		if(nextBlock.eatable){
			control.food--;
			this.gold++;
			nextBlock.hide();
		}
		control.checkGoldCollected();

	}
}

class Robot extends ActiveActor {
	constructor(x, y) {
		super(x, y, "robot_runs_right");
		this.dx = 1;
		this.dy = 0;
		this.name = 'robot';
		this.tempFood=null;
		this.sec = 0;
		this.direction[1,0];
		this.wasTrapped = false;
		this.timeToDropFood = 0;
		this.freeCount = 0;
	}

	/**moves the robot
	 * 
	 * @param {*} dx 
	 * @param {*} dy 
	 */
	
	move(dx,dy){
		let robotAhead = control.getActiveObject(this.x+dx,this.y+dy);
		//se o robot a frente nao e o heroi, entao avanca
		if(robotAhead == control.boundary || (robotAhead != empty &&!robotAhead.good)){ 
			return;
		}		
		super.move(dx,dy);
		this.dropFood();
	}
	/**
	 * tells if the robot is trapped in a pit or hole
	 */
	trapped()
	{
		let currentBlock = control.getPassiveObject(this.x,this.y);

		if(currentBlock.destroyed)
			return true;
		return false;
	}
	/**
	 * the robot tries to free itself after falling into a pit
	 */
	getOutOfHoleWhenTrapped(){
		if(this.trapped()){

			if(this.tempFood != null)
				this.ForceDropFood();

			let aboveActiveBlock = control.getActiveObject(this.x,this.y - 1);

			if(aboveActiveBlock != empty && !aboveActiveBlock.good)
				return;

			this.freeCount++;
			if(this.freeCount>9){
				this.move(0,-1);
				//this.move(dx,0);
				this.freeCount = 0;
				this.sec = 0;
				this.wasTrapped = true;
			}
		}
	}
	dropFood(){

		if(this.tempFood == null)
			return;

		if(0 < this.timeToDropFood)
			this.timeToDropFood--;
		else if(!this.tempFood.CanIDropU(this.x,this.y))
			this.timeToDropFood = rand(30);
		else
		{
			this.tempFood.drop(this.x,this.y);
			this.tempFood = null;
		}
	}

	ForceDropFood()
	{
		this.tempFood.ForceDrop();
		this.tempFood = null;
		this.timeToDropFood == 0;
	}

	
	/**
	 * if a robot is caught in a hole after it closes,
	 * this function makes sure of its return
	 */
	reborn(){
		control.worldActive[this.x][this.y]=empty;
		this.findRandomPos(this);
		this.freeCount=0;
	}
	/**
	 * gets the direction of the hero to be followed by the robot
	 */
	getHeroDir()
	{
		let dir = [0,0];
		if(this.x < hero.x)
			dir[0] = 1;
		else if(this.x > hero.x)
			dir[0] = -1;
		else{
			dir[0] = rand(1);
		}
		

		if(this.y < hero.y)
			dir[1] = 1;
		else if(this.y > hero.y)
			dir[1] = -1;	
		else
			dir[1] =rand(1);

		return dir;
	}
	
	animation()
	{	
		if(this.sec<3){ //os guardas apenas movem se de 15 em 15 ciclos
			this.sec++;
			return;
		}

		let currentBlock = control.getPassiveObject(this.x,this.y);

		//responsible for letting the actor fall after going down a hole
		if(currentBlock.destroyed){
			this.getOutOfHoleWhenTrapped();
			return;
		}
		
		this.sec = 0;
		if(this.wasTrapped){
			this.wasTrapped = false;
		}else if(this.actorFall()){
			return;
		}

		let [dx, dy] = this.getHeroDir();
		
		if((dx != 0 && dy == 0) || (dy != 0 && dy == 0))
			super.animation(dx,dy);
		else if(!this.alt){
			super.animation(dx,0);
			this.alt=!this.alt;
		}else{
			super.animation(0,dy);
			this.alt=!this.alt;
		}
	}
	resetTimeTodropGold(){
		this.timeToDropFood = rand(30);
	}

	// TENTA COMER
	collectFood(x,y){
		//SE NAO TIVER COMIDA GUARDADA
		
		let nextBlock = control.getPassiveObject(x,y);
		let nextActiveBlock = control.getActiveObject(x,y);
		if(nextActiveBlock != empty && nextActiveBlock.good)
		{
			control.gameLost();
		} else if(nextBlock.eatable){

		if(this.tempFood==null){
			//GUARDA A COMIDA
			this.tempFood = nextBlock;
			this.tempFood.eaten();
			this.timeToDropFood = 30;
			this.show();
			this.resetTimeTodropGold();
			}
		}
	}
}



class GameControl {
	constructor() {
		control = this;
		this.key = 0;
		this.time = 0;
		this.food = 0;
		this.level=2;
		this.gold = 0;
		this.paused = false;
		this.invisibleChairs = [];
		this.boundary = new Boundary();
		this.gameTick = null;

		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(this.level);
		this.setupEvents();
		this.goldLabel = null;
		this.goldLeftLabel = null;
		this.getGoldLabel();
	}
	static ObjectInCanvas(x,y)
	{
		if(x < 0 || x >= WORLD_WIDTH)
			return false;
		if(y < 0 || y >= WORLD_HEIGHT)
			return false;
		
		return true;
	}
	getObject(x,y)
	{
		if(!GameControl.ObjectInCanvas(x,y))
			return new WorldBorder();
		else
			return control.worldActive[x][y] != empty ? control.worldActive[x][y] : control.world[x][y];
	}
	createMatrix() { // stored by columns
		let matrix = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = empty;
			matrix[x] = a;
		}
		return matrix;
	}

	cleanMatrixes()
	{
		for(let x=0 ; x < WORLD_WIDTH ; x++){
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				this.world[x][y].hide();
				this.worldActive[x][y].hide();
			}
		}
		while(this.invisibleChairs.length>0){
			this.invisibleChairs.pop();
		}
	}

	createWorlds(){
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
	}
	loadLevel(level) {
		this.cleanMatrixes();
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];  // -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let actorK = GameFactory.actorFromCode(map[y][x], x, y);
				if(!actorK.visible){
					control.invisibleChairs.push(actorK);
				}
			}
			this.PrintLevel();
			this.showLife();
			
	}

	static ObjectInCanvas(x,y)
	{
		if(x < 0 || x >= WORLD_WIDTH)
			return false;
		if(y < 0 || y >= WORLD_HEIGHT)
			return false;
		
		return true;
	}
	getObject(x,y)
	{
		if(!GameControl.ObjectInCanvas(x,y))
			return this.boundary;
		else
			return control.worldActive[x][y] != empty ? control.worldActive[x][y] : control.world[x][y];
	}

	getActiveObject(x,y)
	{
		if(!GameControl.ObjectInCanvas(x,y))
			return this.boundary;
		else
			return control.worldActive[x][y];
	}

	getPassiveObject(x,y)
	{
		if(!GameControl.ObjectInCanvas(x,y))
			return this.boundary;
		else
			return control.world[x][y];
	}
	
	getKey() {
		let k = control.key;
		control.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0]; //  LEFT, O, J
			case 38: case 81: case 73: return [0, -1]; //    UP, Q, I
			case 39: case 80: case 76: return [1, 0];  // RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];  //  DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	}
	setupEvents() {
		addEventListener("keydown", this.keyDownEvent, false);
		addEventListener("keyup", this.keyUpEvent, false);
		setInterval(this.animationEvent, 1000 / ANIMATION_EVENTS_PER_SECOND);
	}

	getGoldLabel()
	{
			this.goldLabel = document.getElementById("goldLabel");
			this.goldLeftLabel = document.getElementById("goldLeftLabel");
	}
	printGold()
	{
		this.goldLabel.value = this.gold + hero.gold;
		this.goldLeftLabel.value = this.food;
	}

	PrintLevel()
	{
			let levelLabel = document.getElementById("levelLabel");
			levelLabel.value = this.level;
			let levelLeft = document.getElementById("levelLeft");
			levelLeft.value = MAPS.length;
	}

	showLife(){
		let lifeEle = document.getElementById('lg');
		lg.value = hero.life;
	}

	gameOver()
	{
		control.stop = false;
		control.paused = false;
		hero.hearts--;
		control.food = 0;
		if(hero.hearts <0)
		{
			alert("GAME OVER");
			control.level = 1;
			this.loadLevel(control.level);
			control.gold = 0;
		} else
		{
			this.loadLevel(control.level);
		}
	}



	checkGoldCollected()
	{
		if(control.food==0 && !control.won){
			let size = control.invisibleChairs.length;
			let arr = control.invisibleChairs;

			for (let index = 0; index < size; index++) {
				arr[index].makeVisible();
			}
			control.won = true;
		}
	}

		levelWon()
		{
			this.gold += hero.gold;
			control.won = false;
			hero.hide();
			control.cleanMatrixes();
			control.createWorlds();
			control.level++;
			if(control.level>MAPS.length)
			{
				alert("Game Won!");
				location.reload();
				control.stop = true;
				control.paused = true;
			}
			this.loadLevel(control.level);
		}

		checkWinCondition()
		{
			if(hero.y == 0 && this.getPassiveObject(hero.x,hero.y).winObject && control.food == 0)
			{
				this.levelWon();
				return true;
			}
			return false;
		}
	
	gameLost()
	{
		control.lost = true;
		control.stop = true;
	}

	animationEvent() {
		control.time++;
		control.printGold();
		if(!control.paused)
		{
			for(let x=0 ; x < WORLD_WIDTH && !control.stop; x++)
			for(let y=0 ; y < WORLD_HEIGHT && !control.stop; y++) {
				let a = control.worldActive[x][y];
				if( a.time < control.time ) {
					a.time = control.time;
					a.animation();
				}
			}

			control.checkGoldCollected();

			if(control.checkWinCondition())
			{
				control.levelWon();
			}

			if(control.lost)
				control.gameOver();
		}
		control.checkGoldCollected();

		if(control.checkWinCondition())
		{
			control.levelWon();
		} else if(control.lost)
			control.gameOver();
	}
	keyDownEvent(k) {
		control.key = k.keyCode;
	}
	keyUpEvent(k) {
	}
	
}


// HTML FORM

function onLoad() {
  // Asynchronously load the images an then run the game
	GameImages.loadAll(function() { new GameControl(); });
}

function b1() 
{ 
	mesg("Level Restarted!"); 
	control.cleanMatrixes();
	control.createWorlds();
	control.loadLevel(control.level);
}
function b2() {
	
	if(control.paused == false)
		control.paused = true;
	else
		control.paused = false;
}


