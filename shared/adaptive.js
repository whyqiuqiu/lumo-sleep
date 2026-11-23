// Accelerated demonstration frames. These are not measured EEG or clinical sleep stages.
export function adaptiveFrame(seconds){
 const t=Math.max(0,seconds),phase=t<4?0:t<16?1:t<32?2:3;
 const fatigue=Math.min(86,Math.round(57+t*.48)),tension=Math.max(22,Math.round(68-t*.8));
 return {phase,title:['佩戴确认','状态感知','自适应助眠','渐弱陪伴'][phase],sound:['准备声景','轻柔雨声','低频海浪','低频海浪'][phase],track:phase<2?0:2,volume:phase===0?0:phase===1?.22:phase===2?.16:Math.max(.035,.14-(t-32)*.006),cutoff:phase<2?950:phase===2?550:320,fatigue,tension,quality:96,progress:Math.min(100,Math.round(t/48*100))};
}
