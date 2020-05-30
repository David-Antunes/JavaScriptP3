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
		this.visible=true;
		this.eatable = false;
	}
	draw(x, y) {
		control.ctx.drawImage(GameImages[this.imageName],
				x * ACTOR_PIXELS_X, y* ACTOR_PIXELS_Y);
	}
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	holdsAShot() {
		return false;
	}
}

class PassiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.moveOnX= false;
		this.moveOnY=false;
		this.moveOnUnder=false;
		this.eatable = false;
		this.passthrough = false;
		this.destroyable = false;
		this.reachableFromSth = false;
		this.name =imageName;
		this.destroyed = false;
	}

	holdsAShot() {
		return false;
	}

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
	canMoveOnX(){
		return this.moveOnX;
	}
	canMoveOnY(){
		return this,this.moveOnY;
	}
	canClimbXUnder(){
		return this.moveOnUnder;
	}
	canEat(){
		return this.eatable;
	}
	airAhead(){
		return this.nothing;
	}
	animation(){

	}
}

class ActiveActor extends Actor {
	constructor(x, y, imageName) {
		super(x, y, imageName);
		this.time = 0;	// timestamp used in the control of the animations
		this.good = false;
		this.direction = [0,0];
	}

	showAnimation()
	{
		let curBlock = control.world[this.x][this.y];
		let groundBlock = null;

		if(this.y+1<WORLD_HEIGHT){
			//se abaixo estiver um ator passivo, entao sai logo
			if(control.worldActive[this.x][this.y+1]!=empty){
				return;
			}
			groundBlock = control.world[this.x][this.y + 1];
		}else{
			console.log(curBlock.name);
			console.log(groundBlock);
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
							if(groundBlock==null || (groundBlock!= empty  && !groundBlock.passthrough))
							{
								if(this.direction[0] == -1 || this.direction[0] == 0) 
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
	collectFood(){}
	
	actorFall(downObject){
		let res= false;
		let yy = this.y+1;
		let downActiveActor = control.worldActive[this.x][yy];
		if(downActiveActor!=empty){
			res=false;
		}
		else if(control.world[this.x][this.y].passthrough || (control.world[this.x][this.y].passthrough)){
			if(downObject !=null && (downObject.passthrough || downObject.moveOnUnder)){
				this.move(0,1);
				res = true;
				//console.log(downActiveActor!=empty+ " "+!downActiveActor.good+" e good "+downActiveActor.good);
			}
		}
		return res;
	}
	animation(dx,dy){
		
		let downObject = control.world[this.x][this.y+1];
		let currentWorldObject = control.world[this.x][this.y];
		
		let xx = this.x+dx;
		let yy = this.y+dy;

		//se nao estiver num objeto que permite andar na vertical
		if(dy===-1){

			if(!control.world[this.x][this.y].moveOnY){
				return;
			}
			//control.world[this.x][this.y+dy]==empty||control.world[this.x][this.y+dy].moveOnY||control.world[this.x][this.y+dy].moveOnUnder) && !control.world[this.x][this.y].destroyed
			if((control.world[this.x][this.y+dy].reachableFromSth) && !control.world[this.x][this.y].destroyed){
				this.move(dx,dy);
				return;
			}
			return;
		}

		//actor wants to fall
		if(currentWorldObject.moveOnUnder &&dy===1&&downObject.passthrough){
			this.move(0,1);
			return;
		}
		
		if(GameControl.ObjectInCanvas(xx,yy)){
			let actorInNextStep = control.world[xx][yy];
			let nextActiveActor = control.worldActive[xx][yy];
			
			if(dy!==-1 && nextActiveActor!==empty && nextActiveActor.good!==this.good){
				alert('END OF THE GAME!');
				location.reload();
			}
			if (actorInNextStep.passthrough /* && !actorInNextStep.destroyed */){
				if(dy==0){
					this.move(dx,dy);
				}else if(currentWorldObject.moveOnY){
					this.move(dx,dy);
				}
			}
			else if(actorInNextStep.moveOnY){
				this.move(dx,dy);
			}else if(actorInNextStep.moveOnUnder){
				this.move(dx,dy);
			}
		}else{
			return;
		}
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

	move(dx, dy) {
		if(dx != 0){
			this.direction[0] = dx;
		}
		if(dy != 0){
		this.direction[1] = dy;
		}
		this.hide();
		this.x += dx;
		this.y += dy;
		this.show();
	}
	show(){
		control.worldActive[this.x][this.y] = this;
		this.draw(this.x, this.y);
	}
	hide() {
		control.worldActive[this.x][this.y] = empty;
		control.world[this.x][this.y].draw(this.x, this.y);
	}
	trappedInHole(){
		let res=false;
		let befX = this.x-1;
		let afterX = this.x+1;
		if(befX>0 && afterX<WORLD_WIDTH){
			let ob1 = control.world[befX][this.y];
			let ob2 = control.world[afterX][this.y];
			if(ob1.moveOnX&&ob2.moveOnX&&control.world[this.x][this.y]==empty){
				res = true;
			}
		}
		return res;
	}
}

class Brick extends PassiveActor {
	constructor(x, y) { super(x, y, "brick"); 
		super.moveOnX=true;
		this.destroyable =true;
		this.timer = 0;
		this.regen = null;

	}

	holdsAShot() {
		return true;
	}
	
	hide() 
	{
		control.world[this.x][this.y] = empty;
		empty.draw(this.x, this.y);
		clearTimeout(this.regen);
	}

	destroyBlock()
	{
		//Mete o bloco invisivel
		this.imageName = "empty";
		this.show();
		this.destroyed = true;
		this.passthrough = true;
		super.moveOnY = true;
		super.moveOnX = false;

		this.regen = setTimeout(()=>{
		this.show();
		if(control.worldActive[this.x][this.y]!=empty){
			if(control.worldActive[this.x][this.y].good){
				location.reload();	
			}else{
				let xx = rand(WORLD_WIDTH);
				let yy = rand(WORLD_HEIGHT);
				let oldA = control.worldActive[this.x][this.y];
				let newA = oldA;
				let co  = true;
				//let oldP = control.worldActive[this.x][this.y];
				while(co){
					xx = rand(WORLD_WIDTH);
					yy = rand(WORLD_HEIGHT);
					if(control.worldActive[xx][yy]==empty&&control.world[xx][yy]==empty){
						co = false;
					}
				}
				newA.x = xx;
				newA.y = yy;
				control.worldActive[this.x][this.y] = empty;
				newA.show();
				newA.reborn();
				this.passthrough = false;
			}
		}
		let currentBlock =control.world[this.x][this.y];
		if(control.world[this.x][this.y].destroyed)
		{

			control.worldActive[this.x][this.y]=empty;
			this.destroyed = false;
			this.imageName = "brick";
			this.passthrough = false;
			this.moveOnY = false;
			this.moveOnX = true;
			this.show();
		}
	
	}, 20000);
	
	}

		
	hardObject()
	{
		return true;
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
	super.reachableFromSth = true; 
}
	show() {}
	hide() {}
}

class Gold extends PassiveActor {
	constructor(x, y) { 
	super(x, y, "gold");
	super.eatable=true;
	super.passthrough=true;
	this.reachableFromSth = true;
	this.timeToDrop = 0;

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
		// SE O TEMPO AINDA NAO ACABOU 
		if(this.timeToDrop > 0)
		{
			// DIMINUI
			this.timeToDrop--;
			return false;
		} else {
			// VERIFICA SE PODE VOLTAR AO MAPA SE TIVER UM TIJOLO OU PEDRA POR BAIXO
			if(control.getObject(x, y + 1).hardObject())
				this.drop(x,y);
			else
			// SE NAO FOR POSSIVEL O TIMER VOLTA A AUMENTAR MAS POUCO
			// O TEMPO E MAIS PEQUENO PORQUE E PARA TENTAR EJATAR ASSIM QUE O ROBOT ESTIVER NUM TIJOLO OU PEDRA
				this.timeToDrop = 16;
		}
	}


	// LIBERTA O OURO NA POSICAO DADA
	// PODES USAR ISTO PARA QUANDO O ROBOT ESTIVER STUCK
	drop(x,y)
	{
		this.x = x;
		this.y = y;
		this.timeToDrop = 0;
		this.show();
	}

}

class Invalid extends PassiveActor {
	constructor(x, y) { super(x, y, "invalid"); }
}

class Ladder extends PassiveActor {
	constructor(x, y) {
		super(x, y, "ladder");
		super.moveOnY=true;
		this.reachableFromSth = true;
		this.hide();
		this.visible = false;
	}

	holdsAShot() {
		return true;
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
	this.reachableFromSth=true;
	}
}

class Stone extends PassiveActor {
	constructor(x, y) { 
		super(x, y, "stone");
		super.moveOnX=true;
	}

	holdsAShot() {
		return true;
	}
	
	hardObject()
	{
		return true;
	}
}

class Hero extends ActiveActor {
	constructor(x, y) {
		super(x, y, "hero_runs_left");
		this.falling = false;
		this.good=true;
		this.name = 'hero';
		this.direction = [-1,0];
		this.eatable = true;
	}

	move(dx,dy){
		super.move(dx,dy);
		super.showAnimation();
		if(this.y===0&&control.food===0){
			hero.hide();
			alert('GAME OVER, YOU A WINNER');
			control.level++;
			control.cleanMatrixes();
			control.createWorlds();
			control.loadLevel(control.level);
		}
		//console.log(this.x+ ' '+this.y + 'hero pos');
		//console.log(control.world[this.x][this.y]);
	}
	animation() {
		
		if(control.world[this.x][this.y].eatable){
			this.collectFood();
		}
		if(this.y+1>=WORLD_HEIGHT){
			control.food =90;
		}
		if(this.actorFall(control.world[this.x][this.y+1])){
			return;
		} else
		{
			
			let k = control.getKey();
			if( k == ' ' ) { this.shoot(); this.show(); return; }
			if(k == null)
				return;
			else
			{			
				let [dx, dy] = k;
				super.animation(dx,dy);
			}
		}
	}
		
	eaten()
	{
		alert("U LOST >:(")
	}

	//DAVID

	
	shoot()
	{
		// Busca o bloco do chao que esta na direcao do heroi

		let BlockToShoot = control.getObject(this.x + this.direction[0], this.y + 1);
		let BlockFrontHero = control.getObject(this.x + this.direction[0], this.y);
		let BlockBehindHero = control.getObject(this.x - this.direction[0], this.y);
		let GroundBehindHero = control.getObject(this.x - this.direction[0], this.y + 1);
		let currentBlock = control.world[this.x][this.y];


		// Se o chao atras nao aguenta com o recuo do heroi
		if(!GroundBehindHero.holdsAShot()){
			console.log("aqui3");
			return; }
		// Se o bloco a frente aguenta com um tiro e nao e passthrough o heroi nao pode disparar
		else if(BlockFrontHero.hardObject()){
			console.log("aqui4");
			return; }
		// Se o bloco a destruir nao for destrutivel o heroi nao dispara
		else if(!BlockToShoot.destroyable){
			console.log("aqui5");
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

	collectFood(){
	
		if(control.world[this.x][this.y].eatable){
			control.food--;
			control.world[this.x][this.y].hide();
			this.show();
		}
			if(control.food===0){
				let size = control.invisibleChairs.length;
				let arr = control.invisibleChairs;
				for (let index = 0; index < size; index++) {
					arr[index].makeVisible();
				}
			}
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
		this.alt=false;
		this.direction[1,0];
		this.eatable = false;
		this.notTrapped = true;
		this.timeToDropFood = 0;
	}
	
	dropFood(yy)
	{
		/*
		let xPos = 0;
		//se nao estiver num buraco, deixa o ouro atras
		if(this.y===yy){
			xPos = this.x-this.direction[0];
		}else{
			xPos = this.x;						
		} */
		let ob22 = control.world[this.x][yy];

		if(ob22==empty)
		{
			control.world[this.x][yy]= this.tempFood;
			this.tempFood.x = this.x;
			this.tempFood.y = yy;
			this.tempFood.show();
			this.tempFood = null;
			this.timeToDropFood = 0;
		}
		else
		{
			let leftBlock = control.world[this.x - 1][yy];
			let RightBlock = control.world[this.x + 1][yy];
			let canMove = false;
			if(leftBlock == empty)
			{
				this.tempFood.x = this.x - 1;
				this.tempFood.y = yy;
				this.tempFood.show();
				this.tempFood = null;
				this.timeToDropFood = 0;
				canMove = true;
			}
			if(RightBlock == empty)
			{
				this.tempFood.x = this.x + 1;
				this.tempFood.y = yy;
				this.tempFood.show();
				this.tempFood = null;
				this.timeToDropFood = 0;	
				canMove = true;	
			}
			if(!canMove)
			{
				let co = true;
				let xx;
				let yy;
				while(co)
				{
					xx = rand(WORLD_WIDTH);
					yy = rand(WORLD_HEIGHT);
					if(control.worldActive[xx][yy]==empty&&control.world[xx][yy]==empty && control.world[xx][yy + 1].hardObject())
					{
						co = false;
					}
				}
				this.tempFood.x = xx;
				this.tempFood.y = yy;
				this.tempFood.show();
				this.tempFood = null;
				this.timeToDropFood = 0;	
			}			
		}
	}

	move(dx,dy){
		let robotAhead = control.worldActive[this.x+dx][this.y+dy];
		//se o robot a frente nao e o heroi, entao avanca
		if(robotAhead==empty || robotAhead.good){ 
			
			if(this.timeToDropFood>0){
				this.timeToDropFood--;
			}else if(this.tempFood!=null) {
				if(control.world[this.x][this.y]==empty&&control.world[this.x][this.y+1]!=empty){
					this.tempFood.x = this.x;
					this.tempFood.y = this.y;
					this.tempFood.show();
					this.tempFood = null;
					this.timeToDropFood = 0;
				}else{
					this.timeToDropFood++;
				}
			}
			super.move(dx,dy);
			super.showAnimation();
		}else{
			return;
		}

		
	}
	reborn(){
		this.notTrapped = true;
	}

	trapped()
	{
		//SE Nao ESTIVER TRAPPED
		if(!(control.world[this.x][this.y].destroyed))
			return false;
		//SE ESTA TRAPPED FICA TRAPPED
		else if(this.sec < 10)
		{
			// SE TIVER COMIDA DEITA FORA
			if(this.tempFood != null)
			this.dropFood(this.y - 1);

			this.sec++;
			return true;
		}
		else
		{
			// 
			this.sec = 0;
			if(!control.worldActive[this.x][this.y - 1].hardObject())
			{
				this.move(0,-1);
				this.notTrapped = false;
				this.alt = true;
				this.sec = 0;
			}
			else
				this.sec = 5;
		}
		return false;
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
	
	animation()
	{	
		if(control.world[this.x][this.y].destroyed) {
			if(this.trapped())
			return;
		}
		if(this.sec<3){ //os guardas apenas movem se de 15 em 15 ciclos
			this.sec++;
			return;
		}
		this.sec = 0;
		if(control.world[this.x][this.y].eatable){//pensar se este if esta bem aqui
			this.collectFood();
		}
		if(this.notTrapped && this.actorFall(control.world[this.x][this.y+1])){
			return;
		}
		else{
			let [dx, dy] = this.getHeroDir();
		//console.log(dx+' '+dy);
			if(this.notTrapped && this.actorFall(control.world[this.x][this.y+1])){
				return;
			}
			this.notTrapped = true;
			this.sec=0;
			if(this.alt){
				super.animation(dx,0);
				this.alt=!this.alt;
			}else{
				super.animation(0,dy);
				this.alt=!this.alt;
			}
		}
	}
	resetTimeTodropGold(){
		this.timeToDropFood = rand(30);
	}

	// TENTA COMER
	collectFood(){
		//SE NAO TIVER COMIDA GUARDADA
		if(this.tempFood==null){
			//GUARDA A COMIDA
			this.tempFood = control.world[this.x][this.y];
			this.tempFood.eaten();
			this.show();
			this.resetTimeTodropGold();
		} 
	}

	eaten() {}

}



// GAME CONTROL
class WorldBorder extends Stone {
	constructor()
	{
		super(-1,-1, "empty");
		this.moveOnX = false;
	}

	hide() {}

	show() {}

	holdsAShot() {
		return false;
	}

}



class GameControl {
	constructor() {
		control = this;
		this.key = 0;
		this.time = 0;
		this.food = 0;
		this.level=1;
		this.paused = false;
		this.invisibleChairs = [];
		this.ctx = document.getElementById("canvas1").getContext("2d");
		empty = new Empty();	// only one empty actor needed
		this.world = this.createMatrix();
		this.worldActive = this.createMatrix();
		this.loadLevel(this.level);
		this.setupEvents();
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
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];  // -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let actorK = GameFactory.actorFromCode(map[y][x], x, y);
				if(map[y][x]=='o'){
					this.food++;
				}
				if(!actorK.visible){
					control.invisibleChairs.push(actorK);
				}
			}
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
	animationEvent() {
		control.time++;
		if(!this.paused)
		{
			for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let a = control.worldActive[x][y];
				//let passive = control.world[x][y];
				if( a.time < control.time ) {
					a.time = control.time;
					a.animation();
				}
				//passive.animation();
			}
		}
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
	
	if(control.paused = false)
		control.paused = true;
	else
		control.paused = false;
}


