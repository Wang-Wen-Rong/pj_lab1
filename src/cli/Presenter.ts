import {Document} from '../domain/Document.js';
import {Shape} from '../domain/Shape.js';
export class Presenter {
 tree(d:Document,id?:string):string{
 const lines:string[]=[];
 const walk=(s:Shape,prefix:string,last:boolean)=>{lines.push(prefix+(last?'└── ':'├── ')+s.summary().trim());s.children.forEach((c,i)=>walk(c,prefix+(last?'    ':'│   '),i===s.children.length-1));};
 if(id){const s=d.find(id);lines.push(s.summary().trim());s.children.forEach((c,i)=>walk(c,'',i===s.children.length-1));}
 else{lines.push('svg ('+d.width+'x'+d.height+')');d.root.children.forEach((c,i)=>walk(c,'',i===d.root.children.length-1));}
 return lines.join('\n');
 }
 show(d:Document,id:string):string{const s=d.find(id),p=d.parent(s);return s.tag+'#'+s.id+'  parent='+(p===d.root?'svg':'g#'+p.id)+'\n  '+s.summary();}
}
