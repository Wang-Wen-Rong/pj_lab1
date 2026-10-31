import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
import {ShapeFactory} from '../domain/ShapeFactory.js';
export class CreateCommand extends Command{
 constructor(private type:string,private id:string,private args:string[],private container?:string){super();}
 protected apply(d:Document):string{d.unique(this.id);const parent=d.container(this.container);const s=new ShapeFactory().create(this.type,this.id,this.args);parent.insert(s);return s.tag+'#'+s.id+' created'+(this.container?' in g#'+this.container:'');}
}
