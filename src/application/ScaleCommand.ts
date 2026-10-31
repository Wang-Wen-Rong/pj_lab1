import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
export class ScaleCommand extends Command{
 constructor(private id:string,private factor:number){super();}
 protected apply(d:Document):string{if(!Number.isFinite(this.factor)||this.factor<=0)throw new Error('scale factor must be positive');const s=d.find(this.id);s.scale(this.factor);return s.tag+'#'+s.id+' scaled by '+this.factor;}
}
