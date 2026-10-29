import numpy as np, io, os, sys
from PIL import Image, ImageFilter
from playwright.sync_api import sync_playwright
scene, out = sys.argv[1], sys.argv[2]
FPS=25; DUR=12.0; SUB=3; SHUTTER=float(sys.argv[3]) if len(sys.argv)>3 else 0.25
os.makedirs(out+'/x1',exist_ok=True); os.makedirs(out+'/x2',exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':970,'height':250},device_scale_factor=2)
    pg.goto('file://'+scene); pg.evaluate('window.ready')
    for f in range(int(FPS*DUR)):
        t0=f/FPS; acc=None
        for k in range(SUB):
            t=t0+(k-(SUB-1)/2)/(SUB-1)*SHUTTER/FPS
            pg.evaluate(f'render({max(0,min(DUR,t)):.4f})')
            a=np.asarray(Image.open(io.BytesIO(pg.screenshot(omit_background=True))).convert('RGBA')).astype(np.float32)/255
            a[...,:3]*=a[...,3:4]; acc=a if acc is None else acc+a
        acc/=SUB
        def unpre(arr):
            al=arr[...,3:4]; o=arr.copy(); o[...,:3]=np.where(al>0,arr[...,:3]/np.maximum(al,1e-6),0)
            return Image.fromarray((np.clip(o,0,1)*255+0.5).astype(np.uint8),'RGBA')
        unpre(acc).save(f'{out}/x2/f{f:04d}.png')
        pm=Image.fromarray((acc*255+0.5).astype(np.uint8),'RGBA').resize((970,250),Image.LANCZOS)
        a=np.asarray(pm).astype(np.float32)/255
        # netlik: renk kanallarına hafif unsharp mask
        rgb=Image.fromarray((a[...,:3]*255+0.5).astype(np.uint8)).filter(ImageFilter.UnsharpMask(radius=1.1,percent=70,threshold=1))
        a[...,:3]=np.minimum(np.asarray(rgb).astype(np.float32)/255,a[...,3:4])
        unpre(a).save(f'{out}/x1/f{f:04d}.png')
    b.close()
print('done')
