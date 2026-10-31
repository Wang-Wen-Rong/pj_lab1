import {Shape} from './Shape.js';
export class Text extends Shape {
 constructor(id:string,values:number[],content=''){super(id,'text');this.initialize(["x","y"],values);this.content=content;}
 move(dx:number,dy:number):void{this.translate(["x"],["y"],dx,dy);}
 scale(f:number):void{this.multiply(f);}
 clone():Text{return this.copyTo(new Text(this.id,[...this.values.values()],this.content));}
 override set(attr:string,value:string):void{if(attr==='text'){this.content=value;return;}super.set(attr,value);}
 override summary():string{return super.summary()+' '+JSON.stringify(this.content);}
}
