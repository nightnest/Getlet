# One-off helper: reads downloaded images, writes assets/images/manifest.json and OG images.
import glob, json, os, re
from PIL import Image
D = os.path.join(os.path.dirname(__file__), '..', 'assets', 'images')
META = {
 'hero-terrace': ('Row of traditional terraced houses under a clear blue sky','Bruce Barrow','https://unsplash.com/photos/row-of-traditional-terraced-houses-under-a-clear-blue-sky-ugt84GWfaRs','Home hero; landlord pages; Open Graph'),
 'victorian-street': ('Victorian bay-fronted terraced houses on a residential street with cars parked outside','Samuel Regan-Asante','https://unsplash.com/photos/terraced-houses-with-cars-parked-on-street-JJSWWpfkkkk','Home intro; Services; Switch agent page'),
 'brick-terrace': ('Red-brick terrace rooftops and chimneys against a blue sky','Greg Willson','https://unsplash.com/photos/brown-concrete-building-during-daytime-fFUBw5bF38s','Portfolio landlords page'),
 'brick-house': ('Brick cottage-style terraced house with white windows and ivy','Kirsten Drew','https://unsplash.com/photos/brown-concrete-2-storey-house-v-wkJZ4Dbac','Management Plans; About'),
 'front-door': ('Brick house front with a pale grey front door and clipped box hedges','David Walker | Walker Design Co.','https://unsplash.com/photos/a-red-brick-house-with-white-windows-and-a-black-door-Hw67HuisCtU','Home tenant route; Contact'),
 'colourful-street': ('Row of pastel-coloured terraced houses along a quiet road','Jonathan Hunt','https://unsplash.com/photos/a-row-of-brightly-colored-houses-lines-a-street-JC00kUduiW8','Overseas landlords page; Tenant section'),
 'living-room-light': ('Bright, uncluttered living room with a grey sofa and framed prints','Minh Pham','https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-large-window-OtXADkUh3-I','Rent collection page'),
 'living-room-wide': ('Spacious modern living room with timber panelling and large windows','Spacejoy','https://unsplash.com/photos/white-and-brown-living-room-set-9M66C_w_ToM','How It Works; Fees'),
 'living-room-mirrors': ('Calm living room with a cream sofa and two round mirrors','Spacejoy','https://unsplash.com/photos/a-living-room-filled-with-furniture-and-a-mirror-c0JoR_-2x3E','Home rent feature; Services'),
 'plumber-sink': ('Plumber fixing pipework under a sink','Timur Shakerzianov','https://unsplash.com/photos/a-man-working-on-a-pipe-in-a-wall-c314Gh8dXAo','Repairs page; Home maintenance feature'),
 'plumber-bathroom': ('Tradesperson carrying out a plumbing repair in a bathroom','bhagya laxmi','https://unsplash.com/photos/a-plumber-repairs-plumbing-in-a-bathroom-jaP5ClBdIyU','Repairs page'),
 'electrician': ('Electrician in a hard hat working on wiring','Emmanuel Ikwuegbu','https://unsplash.com/photos/electrician-installing-wiring-with-yellow-hardhat-_2AlIm-F6pw','Repairs page; Compliance'),
 'electrical-panel': ('Gloved hands working on an electrical consumer unit','Toolmash Expo','https://unsplash.com/photos/electrician-testing-electrical-panel-with-multimeter-PkHf7BUWbtk','Compliance page'),
 'keys-hallway': ('Hand holding house keys in a hallway','Jakub Żerdzicki','https://unsplash.com/photos/holding-house-keys-in-front-of-the-entrance-bqUZEAeWuok','Contact; Book a valuation'),
 'keys-stairs': ('Hand holding keys with a house-shaped keyring by a staircase','Jakub Żerdzicki','https://unsplash.com/photos/hand-holding-keys-with-house-keychain-V7Q94jc04wQ','About; Management Plans'),
}
man = {}
for k,(alt,ph,url,used) in META.items():
    ws = sorted(int(re.search(r'-(\d+)\.webp$',f).group(1)) for f in glob.glob(os.path.join(D,k+'-*.webp')))
    big = Image.open(os.path.join(D,f'{k}-{ws[-1]}.webp'))
    man[k] = dict(alt=alt, widths=ws, w=big.size[0], h=big.size[1], photographer=ph, source=url,
                  licence='Unsplash Licence (free to use)', used=used)
json.dump(man, open(os.path.join(D,'manifest.json'),'w',encoding='utf-8'), indent=1, ensure_ascii=False)
# Open Graph 1200x630 crop from hero
im = Image.open(os.path.join(D,'hero-terrace-1920.webp')).convert('RGB')
w,h = im.size; th = int(w*630/1200); top=(h-th)//2
im.crop((0,top,w,top+th)).resize((1200,630)).save(os.path.join(D,'og-default.jpg'),quality=82)
print({k:v['widths'] for k,v in man.items()})
