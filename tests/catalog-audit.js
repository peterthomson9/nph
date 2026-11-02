const report=PLANNERS.lh._dbg.catalogAudit();
if(report.issues.length)throw Error(JSON.stringify(report.issues));
return {...report,passed:true};
