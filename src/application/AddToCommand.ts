import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
import {Group} from '../domain/Group.js';
export class AddToCommand extends Command{
 constructor(private gid:string,private id:string){super();}
 protected apply(d:Document):string{const p=d.container(this.gid),s=d.find(this.id);if(s===p||Group.contains(s,p))throw new Error('cannot move a container into its own descendant: '+s.id);d.parent(s).remove(s);p.insert(s);return s.tag+'#'+s.id+' moved into g#'+p.id;}
}
