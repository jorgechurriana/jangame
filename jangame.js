/*
Mini Game Engine
jangame.js


Funciones
  Box(lx,ly,color,x,y)
  Sprite(x, y, src)
  Text(x, y, color, size, font, texto)



*/

////////////////////////
//   Pintables
////////////////////////


class Pintable {
	constructor()
	{
		this.x = 0; // El sprite es el que define X e Y
		this.y = 0;
    this.nframes = 1;
	}
  paint(x,y) {
    var ctx = Game.context;
    ctx.save();
    ctx.translate(x,y);
    this.Ppaint(ctx,1,0);
    ctx.restore();    		
	}
	
  
}

class Circle extends Pintable {
  constructor(radio, color){
    super();
    this.radio=radio;
    this.lx = radio*2;
    this.ly = radio*2;
    this.color=color;
  }  

  Ppaint(ctx,size,frame) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radio*size, 0, Math.PI*2);
    ctx.fill();
  }
}


class Box extends Pintable {
  constructor(lx, ly, color){
    super();
    this.lx = lx;
    this.ly = ly;
    this.color=color;
  }  

  Ppaint(ctx,size,frame) {
		var nlx=this.lx*size;
		var nly=this.ly*size;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x-nlx/2, this.y-nly/2, nlx, nly);
  }
}


class Img extends Pintable {
 static Total=0;
 static Loaded=0;
 constructor(src) {
  super();
	Img.Total++;
  this.image = new Image();
  this.image.src = src;
	this.image.IMG=this;
	this.image.onload=function(){
		  Img.Loaded++;
		  this.IMG.lx=this.width;
			this.IMG.ly=this.height;
			//console.log('IMG LOAD'+this.src+" "+this.lx+"x"+this.ly+" "+Img.Loaded+"/"+Img.Total);
			}
	this.image.onerror=function(){console.log('IMG ERR'+this.src);}
	
	}

  Ppaint(ctx,size,frame) {
		var nlx=this.lx*size;
		var nly=this.ly*size;
		ctx.drawImage(this.image, 
			this.x-nlx/2, 
			this.y-nly/2 ,nlx, nly);
  }

}


class ImgAnim extends Pintable{
 constructor(img,elx,ely) {
    super();
    this.img=img;
    this.elx=elx;
    this.ely=ely;
    this.lx=img.lx;
    this.ly=img.ly;
    //console.log(this.lx,this.ly);
    //console.log(this.elx,this.ely);
    // Ya Tenemos que saber el tamaño de la imagen
    var numx=this.lx/this.elx;
    var numy=this.ly/this.ely;
    this.frame=0;
    this.nframes=numx*numy;
	}

  Ppaint(ctx,size,frame) {
 
    var numx=this.lx/this.elx;
    var numy=this.ly/this.ely;
    var numf=numx*numy;
    var fx=Math.floor(frame)%numx;
    var fy=Math.floor(Math.floor(frame)/numx);
    
		var nlx=this.elx*size;
		var nly=this.ely*size;
		ctx.drawImage(this.img.image, 
      fx*this.elx,fy*this.ely,this.elx,this.ely,
			this.x-nlx/2, 
			this.y-nly/2,
      nlx, nly);
  }

}


// Por probar
class Text extends Pintable{
  constructor(texto, color, size, font) {
		super();
		this.speedX = 0;
		this.speedY = 0; 
		this.color=color;
		this.size=size;
		this.font=font;
		this.Text=texto;	
	}
	Ppaint(ctx,size) {
		ctx = Game.context;
		ctx.font = this.size + "px " + this.font;
		ctx.fillStyle = this.color;
		ctx.fillText(this.Text, this.x, this.y);
  }
}
/////////////////////////


class Sprite {
  static all=[];
  constructor(fig, x, y) {
		this.fig=fig;
		this.lx=fig.lx;
		this.ly=fig.ly;
		this.vx = 0;
		this.vy = 0;
		this.alpha=1;
		this.valpha=0;
		this.size=1;
		this.vsize=0;
		this.dir=0;
		this.x = x;
		this.y = y;
		this.live=0;
		this.activo=true;
		this.collidef=1; // Collide factor. Para reducir o ampliar el box de colision.
    // Anim
    this.frame=0;
    this.nframes=fig.nframes;
		Sprite.all.push(this);
	}
  goto(x,y) {
    this.x=x;
    this.y=y;
  }

  get dx() {
    return Math.sin(Math.PI*this.dir/180);
  }
  get dy() {
    return -Math.cos(Math.PI*this.dir/180);
  }

  update() {
    if (this.activo) {
      var ctx = Game.context;
      ctx.save();
      ctx.translate(this.x,this.y);
      ctx.rotate(this.dir*Math.PI/180);
      //ctx.translate(-this.x,-this.y);
      ctx.globalAlpha=this.alpha;
      this.fig.Ppaint(ctx,this.size,this.frame);
      ctx.restore();
      this.alpha+=this.valpha;
      this.size+=this.vsize;
      this.x+=this.vx;
      this.y+=this.vy;
      if (this.live>0) {this.live--; if (this.live==0) this.activo=false;}
      
      this.frame+=1; if (this.frame>=this.nframes) this.frame=0;

    }
  }
  
	del() {
		for (var i=0; i<Sprite.all.length; i++)
		{
			if (Sprite.all[i]===this) {Sprite.all.splice(i,1); break;}
  	}
	}
	
	static update() {
		Sprite.all.forEach(function (e, i) {
		  e.update();
		});
	}
  
  collide(otro) {
		if (otro.activo) {
			// Añadir margen del collide.
			var tlx=this.lx*this.size*this.collidef;
			var tly=this.ly*this.size*this.collidef;
			var olx=otro.lx*otro.size*otro.collidef;
			var oly=otro.ly*otro.size*otro.collidef;
			var tx=this.x-tlx/2;
			var ty=this.y-tly/2;
			var ox=otro.x-olx/2;
			var oy=otro.y-oly/2;
			//Game.rect(tx,ty,tlx,tly,"red");
			//Game.rect(ox,oy,olx,oly,"red");
			if ( (tx+tlx>ox) && (tx<ox+olx) &&
				 (ty+tly>oy) && (ty<oy+oly) )
				 return true;
			else return false;
		}
  }
  
}




function Sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
	this.sound.onload=function(){console.log('MP3 LOAD'+this.sound.src);}
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.currentTime=0;
	this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}


// http://cherrytree.at/misc/vk.htm
const KEY_LEFT=37;
const KEY_UP=38;
const KEY_RIGHT=39;
const KEY_DOWN=40;

const KEY_SPACE=32;
const KEY_CONTROL=17;
const KEY_SHIFT=16;

const KEY_A=65;
const KEY_B=66;
const KEY_C=67;
const KEY_D=68;
const KEY_E=69;
const KEY_F=70;
const KEY_G=71;

const KEY_S=83;
const KEY_W=87;
const KEY_X=88;


var keys={};

var Game = {
//    canvas : document.createElement("canvas"),
    canvas : null, //document.createElement("canvas"),
		fontSize:50,
		fontName:"arial",
		fontColor:"white",
    init : function() {
		    this.canvas=document.getElementById("GAMECANVAS");
				if (this.canvas == null) {
					console.log("Creo");
				  this.canvas=document.createElement("canvas");
          this.canvas.width = 800;
          this.canvas.height = 600;
          document.body.append(this.canvas);
//					this.canvas.background="red";
				}
				this.background = "#000000";
				this.LX=this.canvas.width;
				this.LY=this.canvas.height;
				this.XXX=3;
        this.context = this.canvas.getContext("2d");
        this.interval=null;
        
        window.addEventListener('keydown', function (e) {
				  //console.log(e.keyCode);
          keys[e.keyCode] = true;				
					if ((e.keyCode<112) || (e.keyCode>123)) { e.preventDefault(); e.stopPropagation();}
        });
        window.addEventListener('keyup', function (e) {
            keys[e.keyCode] = false;	
  					if ((e.keyCode<112) || (e.keyCode>123)) { e.preventDefault(); e.stopPropagation();}
        });

				Preload();
				this.load(GamePreload);
    }, 
    load : function(scene) {
        if (this.interval!=null) clearInterval(this.interval);
        this.interval = setInterval(scene, 15);
    }, 
    clear : function(){
//        this.context.clearRect(0, 0, this.LX, this.LY);
        this.context.fillStyle=this.background;
        this.context.fillRect(0, 0, this.LX, this.LY);
    },
    update: function(){
			Sprite.update();
    },
    
    paint: function(fig,x,y)
		{
      var ctx = this.context;
      ctx.save();
      ctx.translate(x,y);
      fig.paint(ctx);
      ctx.restore();
		},
		
    box: function(x,y,lx,ly,color) {
      var ctx = this.context;
      ctx.fillStyle = color;
      ctx.fillRect(x,y, lx, ly);
    },

    rect: function(x,y,lx,ly,color) {
      var ctx = this.context;
      ctx.save();
			ctx.strokeStyle=color;
      ctx.beginPath();
      ctx.rect(x,y, lx, ly);
      ctx.stroke();
      ctx.restore();
    },
    
		text: function (text,x,y,color) {
      ctx = Game.context;
      ctx.font = this.fontSize + "px " + this.fontName;
			//if (mod.search('R')>=0) {ctx.textAlign='right'; x=Game.LX-x;}
			ctx.textAlign='left';
//		  if (mod.search('B')>=0) { ctx.textBaseline='bottom';  y=Game.LY-y;}
			ctx.textBaseline='top';
			if (color==undefined) color=this.fontColor;
      ctx.fillStyle = color;
      ctx.fillText(text,x,y);
		},
		
    dummy: "FIN"
    
}

function GamePreload(){
	Game.clear();

	t="Load "+Img.Loaded + "/" + Img.Total;
	Game.text(t,100,100);

	if (Img.Total == Img.Loaded) {
		Setup();
	}
};


function GameInit(){Game.init()};
window.onload=GameInit;

function Preload(){}

function clear(){Game.clear();}
function update(){Game.update();}



