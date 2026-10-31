import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
export class SetCommand extends Command{
 constructor(private id:string,private attr:string,private value:string){super();}
 protected apply(d:Document):string{const s=d.find(this.id);s.set(this.attr,this.value);return s.tag+'#'+s.id+' updated: '+this.attr+'='+JSON.stringify(this.value);}
}
