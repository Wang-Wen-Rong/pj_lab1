import {Shape} from './Shape.js';
export class Group extends Shape {
  private nodes:Shape[]=[];
  constructor(id:string){super(id,'g');}
  override get children():readonly Shape[]{return this.nodes;}
  insert(shape:Shape,index=this.nodes.length):void {
    if(shape===this || Group.contains(shape,this))throw new Error('cannot move a container into its own descendant: '+shape.id);
    this.nodes.splice(index,0,shape);
  }
  remove(shape:Shape):void {const i=this.nodes.indexOf(shape);if(i<0)throw new Error('shape is not a child');this.nodes.splice(i,1);}
  static contains(root:Shape,target:Shape):boolean{return root.children.some(c=>c===target||Group.contains(c,target));}
  move(dx:number,dy:number):void{for(const c of this.nodes)c.move(dx,dy);}
  scale(f:number):void{for(const c of this.nodes)c.scale(f);}
  clone():Group{const g=this.copyTo(new Group(this.id));for(const c of this.nodes)g.insert(c.clone());return g;}
}
