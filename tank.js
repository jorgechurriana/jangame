
var h;
class Humo {
	static fig=new Circle(70,"black");
  constructor(x,y){
    this.humos=[];

    for (var i=0; i<30; i++)
    {
      var h=new Sprite(Humo.fig,x,y);
      h.vx=Math.random()*2-1;
      h.vy=Math.random()*2-1;;
      h.live=100;
      h.valpha=-0.01;
      h.vsize=-0.01;
      this.humos.push(h);
    }
  }  
	update(){
		this.humos.forEach(function (e, i) {
		  e.update();
		});		
	}
}

var jugador1;
var jugador2;

class Disparo extends Sprite {
  static disparos=[];
	static fig = new Box(5,5,"red");
  constructor(x,y,vx,vy){
	  super(Disparo.fig,x,y);
		this.vx=vx;
		this.vy=vy;
		Disparo.disparos.push(this);
    S_bang.play();
  }  

	static update(){
		Disparo.disparos.forEach(function (e, i) {
		  //e.update();
			if ( (e.x<0) || (e.x>Game.LX) || (e.y<0) || (e.y>Game.LY)) {e.activo=false; delete Disparo.disparos[i];}

      for (var j=0; j<Jugador.jugadores.length; j++)
			{
				if ( e.collide(Jugador.jugadores[j].sprite) ) {
          e.activo=false; 
					delete Disparo.disparos[i];
				  Jugador.jugadores[j].hit(e.x,e.y);
				}
			}
		});		
//		for (i=0; i<Disparo.disparos.length; i++) Disparo.disparos[i].update();
	}
}




const V_MAX=2;


class Jugador {
  static jugadores=[];
  constructor(x,y,fig,o){
	  this.sprite=new Sprite(fig,x,y);
		this.o=o;
		this.v=0;
		this.fuego=false;
		this.espera=0;
		this.vida=200;
		Jugador.jugadores.push(this);
  }  
	update(){
		var anda;
		if (keys[this.o.left]) {this.sprite.dir-=1; }
		if (keys[this.o.right]) {this.sprite.dir+=1; }
		if (keys[this.o.up]) {anda=true; if (this.v<0.1) this.v=0.4;}
		if (anda) {if (this.v<V_MAX) this.v=this.v*1.01;} else {this.v=this.v*0.95;}
		if (keys[this.o.down]) {this.v=-0.3;}
		this.sprite.x+=this.sprite.dx*this.v; this.sprite.y+=this.sprite.dy*this.v;
		
		if (keys[this.o.disparo] && this.espera==0) {
		  this.espera=100;
			if (!this.fuego) {
				this.fuego=true;
				var dx=this.sprite.x+this.sprite.dx*35;
        var dy=this.sprite.y+this.sprite.dy*35;
        var z=new Sprite(Aexplosion,dx,dy); z.live=z.nframes;
        new Disparo(dx,dy,this.sprite.dx*3,this.sprite.dy*3);
			}
		} else this.fuego=false;
	  if (this.espera>0) this.espera--;
	
	  //this.sprite.update();
  }
	
	hit(hx,hy){
		//h=new Humo(hx, hy);
		S_explosion.play();
		this.vida-=10;
    d=new Sprite(Aexplosion,hx,hy);
    d.size=2;
    d.live=d.nframes;

	}
	
}


function Preload() {
// Solo imagenes y quizás sonidos.
  fondo=new Img("img/arena1200x800.jpg");

	IT1=new Img("img/tank_verde.png");
	IT2=new Img("img/tank_azul.png");

  S_bang=new Sound("fx/bang.mp3");
  S_explosion=new Sound("fx/explosion.mp3");
	
  Iexplosion=new Img("img/explosion32.png");
  Iexplosion2=new Img("img/explosion.png");
  
}

function Setup() {

  Aexplosion=new ImgAnim(Iexplosion,32,32);
  Aexplosion2=new ImgAnim(Iexplosion2,256,256);
  h=new Humo(300,300);
  
  jugador1=new Jugador(100,100,IT1,{up:KEY_UP, down:KEY_DOWN, left:KEY_LEFT, right:KEY_RIGHT, disparo:KEY_SPACE});
  jugador2=new Jugador(600,400,IT2,{up:KEY_W, down:KEY_S, left:KEY_A, right:KEY_D, disparo:KEY_CONTROL});

  d=new Sprite(Aexplosion2,100,100);  d.live=d.nframes;
  d=new Sprite(Aexplosion2,600,400);  d.live=d.nframes;
  
  Game.load(titulo);
}


function titulo()
{
	Game.clear();
	Game.fontSize=100;
  Game.text("TANKS",100,100);

  if (keys[KEY_SPACE]) {

    Game.load(juego);
	}

}



function juego() {
	Game.clear();

  fondo.paint(600,400);
	//Game.text("hola",100,100,"red",100);
  
	jugador1.update();
	jugador2.update();

  h.update();

	Disparo.update();

  Game.box(5,5,jugador1.vida,40,"red");
  Game.rect(5,5,200,40,"black");
  
  Game.box(505,5,jugador2.vida,40,"red");
  Game.rect(505,5,200,40,"black");
  
  Game.update();
  
}
