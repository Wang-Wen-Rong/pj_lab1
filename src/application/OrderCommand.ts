import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
export class OrderCommand extends Command{
 constructor(private id:string,private front:boolean){super();}
 protected apply(d:Document):string{const s=d.find(this.id),p=d.parent(s);p.remove(s);p.insert(s,this.front?p.children.length:0);return s.tag+'#'+s.id+' moved to '+(this.front?'front':'back');}
}
