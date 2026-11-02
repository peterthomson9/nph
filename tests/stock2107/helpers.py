import struct,zlib
async def swipe(page,selector,dx,dy=0):
 await page.evaluate("""({selector,dx,dy})=>{const target=document.querySelector(selector),r=target.getBoundingClientRect(),x=innerWidth/2,y=Math.max(160,Math.min(innerHeight-180,r.top+r.height/2));const point=(cx,cy)=>new Touch({identifier:1,target,clientX:cx,clientY:cy});target.dispatchEvent(new TouchEvent('touchstart',{bubbles:true,cancelable:true,touches:[point(x,y)]}));target.dispatchEvent(new TouchEvent('touchmove',{bubbles:true,cancelable:true,touches:[point(x+dx,y+dy)]}));target.dispatchEvent(new TouchEvent('touchend',{bubbles:true,cancelable:true,touches:[],changedTouches:[point(x+dx,y+dy)]}));}""",{'selector':selector,'dx':dx,'dy':dy})
def animation_png(frames,path):
 def chunk(kind,data):return struct.pack('!I',len(data))+kind+data+struct.pack('!I',zlib.crc32(kind+data)&0xffffffff)
 def parts(data):
  pos=8;header=None;compressed=[]
  while pos<len(data):
   size=struct.unpack('!I',data[pos:pos+4])[0];kind=data[pos+4:pos+8];value=data[pos+8:pos+8+size];pos+=size+12
   if kind==b'IHDR':header=value
   if kind==b'IDAT':compressed.append(value)
  return header,b''.join(compressed)
 parsed=[parts(data) for _,data in frames];header=parsed[0][0];width,height=struct.unpack('!II',header[:8]);out=bytearray(b'\x89PNG\r\n\x1a\n')
 out+=chunk(b'IHDR',header)+chunk(b'acTL',struct.pack('!II',len(frames),0));seq=0
 for i,((timestamp,_),(ihdr,data)) in enumerate(zip(frames,parsed)):
  assert ihdr==header
  duration=max(20,min(1200,round((frames[i+1][0]-timestamp)*1000))) if i+1<len(frames) else 450
  out+=chunk(b'fcTL',struct.pack('!IIIIIHHBB',seq,width,height,0,0,duration,1000,0,0));seq+=1
  if i==0:out+=chunk(b'IDAT',data)
  else:out+=chunk(b'fdAT',struct.pack('!I',seq)+data);seq+=1
 out+=chunk(b'IEND',b'');path.write_bytes(out)
