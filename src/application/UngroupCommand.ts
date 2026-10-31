import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
import {Group} from '../domain/Group.js';
export class UngroupCommand extends Command{
 constructor(private id:string){super();}
 protected apply(d:Document):string{const s=d.find(this.id);if(!(s instanceof Group))throw new Error('not a container: '+this.id);const p=d.parent(s);if(p===d.root)throw new Error('cannot ungroup top-level container: '+this.id);const i=p.children.indexOf(s);p.remove(s);[...s.children].forEach((c,n)=>{s.remove(c);p.insert(c,i+n);});return 'g#'+s.id+' ungrouped';}
}
