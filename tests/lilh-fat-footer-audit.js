const p=PLANNERS.lh,t=p._dbg.todayN();
p.openR('s3');const normal=document.querySelector('#card').innerText;
document.querySelector('#dlg').close();await new Promise(r=>setTimeout(r,100));
S.lh['dy-xL'+t]={r:'s3',v:1};p.openR('s3','xL'+t,'test');const resized=document.querySelector('#card').innerText;
return {defaultHasFinishingOil:normal.includes('Stir in 1 tsp olive oil'),resizedHasFinishingOil:resized.includes('Stir in ½ tsp olive oil'),resizedHasScalingNote:resized.includes('Amounts are scaled'),oilInRequiredIngredients:p.R.s3.need.includes('oil')};
