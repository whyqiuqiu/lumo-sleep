"""Generate deterministic, seamlessly looping synthetic ambience assets."""
import math, random, struct, wave
from pathlib import Path
random.seed(20261013)
output=Path(__file__).parent/'assets'
output.mkdir(exist_ok=True)
rate=22050
size=rate*8
for name, smooth in [('rain',.97),('forest',.93),('ocean',.99),('noise',.70)]:
    samples=[]
    last=0
    for i in range(size):
        last=smooth*last+(1-smooth)*random.uniform(-1,1)
        envelope=.7+.3*math.sin(2*math.pi*i/size) if name=='ocean' else 1
        # Fade to silence at both boundaries to prevent loop discontinuities.
        edge=min(1,i/(rate*.12),(size-1-i)/(rate*.12))
        samples.append(last*envelope*edge)
    scale=.65/max(abs(v) for v in samples)
    with wave.open(str(output/f'{name}.wav'),'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(b''.join(struct.pack('<h',int(v*scale*32767)) for v in samples))
    print(name, 'generated')
