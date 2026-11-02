return Object.fromEntries(Object.entries(PLANNERS).map(([id,p])=>[id,{recipes:p.R,families:p.cfg.FAM,ingredients:p.cfg.ING}]));
