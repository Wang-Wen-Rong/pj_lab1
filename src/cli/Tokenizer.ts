export class Tokenizer {
 parse(line:string):string[]{
 if(line.trimStart().startsWith('#'))return [];
 const tokens:string[]=[];let token='',quoted=false,active=false;
 for(let i=0;i<line.length;i++){const c=line[i];
 if(c==='\\'&&quoted&&(line[i+1]==='"'||line[i+1]==='\\')){token+=line[++i];active=true;}
 else if(c==='"'){quoted=!quoted;active=true;}
 else if(/\s/.test(c)&&!quoted){if(active){tokens.push(token);token='';active=false;}}
 else{token+=c;active=true;}}
 if(quoted)throw new Error('unterminated quote');if(active)tokens.push(token);return tokens;
 }
}
