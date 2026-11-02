const p=PLANNERS.lh,d=p._dbg;go('lilh');document.querySelector('#page-lilh').click();p.openR('b2');
const body=document.querySelector('#card'),review=document.querySelector('.rhero');
if(body.scrollWidth>body.clientWidth+1)throw Error('Recipe overflows at '+innerWidth+'px');
if(document.querySelector('[data-lhproduct],[data-lhdairy]'))throw Error('Redundant product controls remain');
if(!review.textContent.includes('whole milk')||!review.textContent.includes('full-fat plain yoghurt'))throw Error('Confirmed dairy sources absent');
document.querySelector('#dlg').scrollTop=review.offsetTop-140;
return {width:innerWidth,recipeFits:true,fullFatDairyRecorded:true,confirmationPromptsRemoved:true};
