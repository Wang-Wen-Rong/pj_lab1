import {readFileSync,writeFileSync,renameSync,unlinkSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
export class FileStore {
 read(path:string):string{try{return readFileSync(path,'utf8');}catch{throw new Error('cannot read file: '+path);}}
 write(path:string,text:string):void{
  const temporary=path+'.'+randomUUID()+'.tmp';
  try{writeFileSync(temporary,text,'utf8');renameSync(temporary,path);}catch{try{unlinkSync(temporary);}catch{}throw new Error('cannot write file: '+path);}
 }
}
