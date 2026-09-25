'use strict';
const original=[
 {id:1,month:'2026-09',date:'09-25',name:'Pavyzdinis atlyginimas',amount:2400,category:'Pajamos'},
 {id:2,month:'2026-09',date:'09-23',name:'Maisto prekės',amount:-84.20,category:'Maistas'},
 {id:3,month:'2026-09',date:'09-20',name:'Būsto išlaidos',amount:-620,category:'Būstas'},
 {id:4,month:'2026-09',date:'09-18',name:'Degalai',amount:-53.40,category:'Transportas'},
 {id:5,month:'2026-09',date:'09-15',name:'Pietūs',amount:-12.80,category:'Maistas'},
 {id:6,month:'2026-09',date:'09-10',name:'Prenumerata',amount:-8.99,category:'Kita'},
 {id:7,month:'2026-08',date:'08-28',name:'Pavyzdinis atlyginimas',amount:2300,category:'Pajamos'},
 {id:8,month:'2026-08',date:'08-21',name:'Būsto išlaidos',amount:-620,category:'Būstas'},
 {id:9,month:'2026-08',date:'08-15',name:'Kelionė',amount:-150,category:'Laisvalaikis'},
 {id:10,month:'2026-08',date:'08-12',name:'Maisto prekės',amount:-124.75,category:'Maistas'}
];
let entries=original.map(item=>({...item}));
const categories=['Maistas','Būstas','Transportas','Laisvalaikis','Kita'];
const euro=value=>new Intl.NumberFormat('lt-LT',{style:'currency',currency:'EUR'}).format(value);
const $=id=>document.getElementById(id);
function render(){
 const rows=entries.filter(item=>item.month===$('period').value);
 const income=rows.filter(item=>item.amount>0).reduce((sum,item)=>sum+item.amount,0);
 const expenses=-rows.filter(item=>item.amount<0).reduce((sum,item)=>sum+item.amount,0);
 $('income').textContent=euro(income);$('expenses').textContent=euro(expenses);$('balance').textContent=euro(income-expenses);
 const sums=categories.map(category=>({category,total:-rows.filter(item=>item.amount<0&&item.category===category).reduce((sum,item)=>sum+item.amount,0)})).filter(item=>item.total>0).sort((a,b)=>b.total-a.total);
 const list=$('categories');list.replaceChildren();
 for(const item of sums){
  const line=document.createElement('div');line.className='category';
  const title=document.createElement('div');title.className='category-line';
  const name=document.createElement('span'),sum=document.createElement('strong');name.textContent=item.category;sum.textContent=euro(item.total);title.append(name,sum);
  const track=document.createElement('div');track.className='bar';const fill=document.createElement('span');fill.style.width=(expenses?item.total/expenses*100:0).toFixed(1)+'%';track.append(fill);
  line.append(title,track);list.append(line);
 }
 const transactions=$('transactions');transactions.replaceChildren();
 for(const item of rows){
  const line=document.createElement('div');line.className='transaction';
  const description=document.createElement('div'),name=document.createElement('strong'),date=document.createElement('small');name.textContent=item.name;date.textContent=item.date;description.append(name,date);
  if(item.amount<0){const select=document.createElement('select');select.setAttribute('aria-label','Kategorija: '+item.name);for(const category of categories){const option=document.createElement('option');option.value=category;option.textContent=category;select.append(option)}select.value=item.category;select.onchange=()=>{item.category=select.value;render()};description.append(select)}
  const amount=document.createElement('div');amount.className='amount'+(item.amount<0?' negative':'');amount.textContent=euro(item.amount);line.append(description,amount);transactions.append(line);
 }
}
$('period').onchange=render;
$('reset').onclick=()=>{entries=original.map(item=>({...item}));$('period').value='2026-09';render()};
render();
