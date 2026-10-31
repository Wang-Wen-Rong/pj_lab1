import {Command} from './Command.js';
import {Document} from '../domain/Document.js';
import {Group} from '../domain/Group.js';
export class GroupCommand extends Command{
 constructor(private id:string,private ids:string[]){super();}
 protected apply(d:Document):string{
 d.unique(this.id);if(new Set(this.ids).size!==this.ids.length)throw new Error('duplicate group member');
 const selected=this.ids.map(id=>d.find(id));
 for(const s of selected)if(selected.some(other=>other!==s&&Group.contains(s,other)))throw new Error('cannot group a container into its own descendant: '+s.id);
 const ordered=d.all().filter(s=>selected.includes(s));
 let parent=d.parent(ordered[0]);
 while(!ordered.every(s=>Group.contains(parent,s)))parent=d.parent(parent);
 const index=parent.children.findIndex(s=>ordered.some(n=>n===s||Group.contains(s,n)));
 const group=new Group(this.id);
 for(const s of ordered){d.parent(s).remove(s);group.insert(s);}
 parent.insert(group,index);return 'g#'+this.id+' created with '+ordered.length+' children';
 }
}
