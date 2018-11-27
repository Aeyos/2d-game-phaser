speed: in tiles/s
1s = 32px = 1tile

if game @ 100fps

delta = 0.01
speed = 1
pixels to displace === delta * speed * 32
                   === 0.01 * 1 * 32
                   === 0.32
after 100 frames... 100 * 0.32 === 32