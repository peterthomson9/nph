/* Example: today's Lil H cards, the day's warning button, and the buttons behind a meal's ⋯ */
const W=ms=>new Promise(r=>setTimeout(r,ms));const out={};
go('lilh');await W(500);PLANNERS.lh.showToday();await W(400);
const day=()=>document.querySelector('#page-lilh .day.today');
out.cards=[...day().querySelectorAll('.meal')].map(m=>m.innerText.replace(/\n+/g,' | '));
const wb=day().querySelector('[data-dwarn]');out.warnings=wb?wb.innerText:'none';
if(wb){wb.click();await W(300);out.warningText=[...day().querySelectorAll('.meal em')].map(e=>e.innerText)}
day().querySelector('.grp .row [data-mdots]').click();await W(300);
out.editButtons=[...day().querySelectorAll('.edbtn')].map(b=>b.innerText);
return out;
