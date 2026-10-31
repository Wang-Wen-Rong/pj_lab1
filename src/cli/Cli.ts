import {Editor} from '../application/Editor.js';
import {CreateCommand} from '../application/CreateCommand.js';
import {DeleteCommand} from '../application/DeleteCommand.js';
import {MoveCommand} from '../application/MoveCommand.js';
import {ScaleCommand} from '../application/ScaleCommand.js';
import {SetCommand} from '../application/SetCommand.js';
import {GroupCommand} from '../application/GroupCommand.js';
import {UngroupCommand} from '../application/UngroupCommand.js';
import {AddToCommand} from '../application/AddToCommand.js';
import {OrderCommand} from '../application/OrderCommand.js';
import {Document} from '../domain/Document.js';
import {Shape} from '../domain/Shape.js';
import {FileStore} from '../infrastructure/FileStore.js';
import {SvgCodec} from '../infrastructure/SvgCodec.js';
import {Tokenizer} from './Tokenizer.js';
import {Presenter} from './Presenter.js';
export class Cli {
 private tokenizer=new Tokenizer();private presenter=new Presenter();
 constructor(public readonly editor=new Editor(),private files=new FileStore(),private codec=new SvgCodec()){}
 private count(args:string[],min:number,max=min):void{if(args.length<min||args.length>max)throw new Error('invalid argument count');}
 run(line:string):string{
  try{const tokens=this.tokenizer.parse(line);if(!tokens.length)return '';const [name,...a]=tokens;
  const handlers:Record<string,()=>string>={
   help:()=>{this.count(a,0);return 'init [w] [h]\nread <file.svg>\nsave [file.svg]\ncanvas [w h]\ncreate <rect|circle|ellipse|line|text|g> <id> [params] [in <containerId>]\ndelete <id>\nmove <id> <dx> <dy>\nscale <id> <factor>\nset <id> <attr> <value>\ngroup <newGid> <id1> [id2 ...]\nungroup <gid>\naddto <gid> <id>\nfront <id>\nback <id>\ntree [id]\nshow <id>\nundo\nredo';},
   init:()=>{this.count(a,0,2);const d=new Document(a[0]===undefined?800:Shape.number(a[0]),a[1]===undefined?600:Shape.number(a[1]));this.editor.replace(d);return `canvas ${d.width}x${d.height} created`;},
   read:()=>{this.count(a,1);const r=this.codec.parse(this.files.read(a[0]));this.editor.replace(r.document,a[0]);return [...r.warnings,`read ${a[0]} (${r.document.all().length} elements)`].join('\n');},
   save:()=>{this.count(a,0,1);const d=this.editor.document;const path=a[0]??this.editor.path;if(!path)throw new Error('no file path. use save <file.svg>');this.files.write(path,this.codec.serialize(d));this.editor.saved(path);return `saved to ${path} (${d.all().length} elements)`;},
   canvas:()=>{const d=this.editor.document;if(a.length){this.count(a,2);this.editor.resize(Shape.number(a[0]),Shape.number(a[1]));}return `canvas ${this.editor.document.width}x${this.editor.document.height}`;},
   create:()=>{this.count(a,2,Infinity);let parent:string|undefined;const params=a.slice(2);if(params.length>=2&&params.at(-2)==='in'){parent=params.pop();params.pop();}return this.editor.execute(new CreateCommand(a[0],a[1],params,parent));},
   delete:()=>{this.count(a,1);return this.editor.execute(new DeleteCommand(a[0]));},
   move:()=>{this.count(a,3);return this.editor.execute(new MoveCommand(a[0],Shape.number(a[1]),Shape.number(a[2])));},
   scale:()=>{this.count(a,2);return this.editor.execute(new ScaleCommand(a[0],Shape.number(a[1])));},
   set:()=>{this.count(a,3);return this.editor.execute(new SetCommand(a[0],a[1],a[2]));},
   group:()=>{this.count(a,2,Infinity);return this.editor.execute(new GroupCommand(a[0],a.slice(1)));},
   ungroup:()=>{this.count(a,1);return this.editor.execute(new UngroupCommand(a[0]));},
   addto:()=>{this.count(a,2);return this.editor.execute(new AddToCommand(a[0],a[1]));},
   front:()=>{this.count(a,1);return this.editor.execute(new OrderCommand(a[0],true));},
   back:()=>{this.count(a,1);return this.editor.execute(new OrderCommand(a[0],false));},
   tree:()=>{this.count(a,0,1);return this.presenter.tree(this.editor.document,a[0]);},
   show:()=>{this.count(a,1);return this.presenter.show(this.editor.document,a[0]);},
   undo:()=>{this.count(a,0);return this.editor.undo();},
   redo:()=>{this.count(a,0);return this.editor.redo();}
  };
  if(!handlers[name])throw new Error('unknown command: '+name);
  if(!['init','read','help'].includes(name))this.editor.document;
  return handlers[name]();
  }catch(e){return 'error: '+(e instanceof Error?e.message:String(e)).replace(/[\r\n]+/g,' ');}
 }
}
