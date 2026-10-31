import {DOMParser, XMLSerializer, DOMImplementation} from '@xmldom/xmldom';
import {Document} from '../domain/Document.js';
import {Shape} from '../domain/Shape.js';
import {Group} from '../domain/Group.js';
import {ShapeFactory} from '../domain/ShapeFactory.js';
export class SvgCodec {
 parse(source:string):{document:Document,warnings:string[]}{
  if(/<!DOCTYPE|<!ENTITY/i.test(source))throw new Error('unsupported XML declaration');
  const issues:string[]=[];
  const xml=new DOMParser({errorHandler:{warning:m=>issues.push(m),error:m=>issues.push(m),fatalError:m=>issues.push(m)}}).parseFromString(source,'image/svg+xml');
  if(issues.length)throw new Error('invalid SVG XML');
  const root=xml.documentElement;
  if(!root||root.localName!=='svg')throw new Error('expected svg root');
  const d=new Document(Shape.number(root.getAttribute('width')||'800'),Shape.number(root.getAttribute('height')||'600'));
  const viewBox=root.getAttribute('viewBox');
  if(viewBox && viewBox.trim().split(/[\s,]+/).map(Number).join(' ')!==`0 0 ${d.width} ${d.height}`)throw new Error('unsupported viewBox');
  for(let i=0;i<root.attributes.length;i++){const a=root.attributes.item(i)!;if(!['xmlns','width','height','viewBox'].includes(a.name))throw new Error('unsupported svg root attribute: '+a.name);}
  const used=new Set<string>();
  const elements=Array.from({length:root.getElementsByTagName('*').length},(_,i)=>root.getElementsByTagName('*').item(i)!);
  for(const el of elements){const id=el.getAttribute('id');if(id){if(used.has(id))throw new Error('id already exists: '+id);used.add(id);}}
  const warnings:string[]=[];const factory=new ShapeFactory();
  const read=(el:Element):Shape=>{
   if(el.namespaceURI && el.namespaceURI!=='http://www.w3.org/2000/svg')throw new Error('unsupported namespace');
   const tag=el.localName||el.tagName;let id=el.getAttribute('id')||'';
   if(!id){let n=1;while(used.has(tag+n))n++;id=tag+n;used.add(id);warnings.push(`warning: assigned id ${id} to unnamed <${tag}>`);}
   d.unique(id);
   const attrs=new Map<string,string>();for(let i=0;i<el.attributes.length;i++){const a=el.attributes.item(i)!;if(a.name==='transform')throw new Error('unsupported SVG attribute: transform');attrs.set(a.name,a.value);}
   const s=factory.fromAttributes(tag,id,attrs,el.textContent??'');
   for(let child=el.firstChild;child;child=child.nextSibling){if(child.nodeType===1){if(!(s instanceof Group))throw new Error('unsupported nested element in '+tag);s.insert(read(child as unknown as Element));}}
   return s;
  };
  for(let child=root.firstChild;child;child=child.nextSibling)if(child.nodeType===1)d.root.insert(read(child as unknown as Element));
  return {document:d,warnings};
 }
 serialize(d:Document):string{
  const xml=new DOMImplementation().createDocument('http://www.w3.org/2000/svg','svg',null);const root=xml.documentElement;
  root.setAttribute('width',String(d.width));root.setAttribute('height',String(d.height));root.setAttribute('viewBox',`0 0 ${d.width} ${d.height}`);
  const append=(s:Shape,parent:Element)=>{const el=xml.createElementNS('http://www.w3.org/2000/svg',s.tag);el.setAttribute('id',s.id);for(const [k,v]of s.attributes)el.setAttribute(k,v);if(s.text)el.appendChild(xml.createTextNode(s.text));for(const c of s.children)append(c,el);parent.appendChild(el);};
  for(const s of d.root.children)append(s,root);
  return '<?xml version="1.0" encoding="UTF-8"?>\n'+new XMLSerializer().serializeToString(xml)+'\n';
 }
}

