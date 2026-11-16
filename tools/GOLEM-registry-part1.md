# GOLEM registry v1, part 1 of 3 (sent by GOLEM to VOXEL II, 16 Nov 2026; approved by His Grace 15 Nov)

Rules
1. Key by room name; where a name repeats (8 maids', 8 footmen's rooms, two Lamp Rooms), by name and building.
2. Each Colour has ONE main room. Only it shows the files button, opening page landing.<colour>. Other rooms show their objects, or "Nothing here yet. The <Colour> House keeps its files in <main room>."
3. Each object opens its own page id. Only the Seeing Stone opens the GOLEM front page. Every globe opens the Globe.
4. A page not "live" makes its object say "Not yet linked." Anything clickable not in the registry says the same.
5. Public template: every page blank ("Empty. This record is yours to fill."); no link of his ships.
6. obsidian is now charcoal. "suite" = His Grace's five rooms (Study, Bedchamber, Dressing Room, Bath, Belvedere): no Colour, no files button. Suite colour #D4AF37.
7. A room not in the room table (part 3) is plain.

For the builder
- Replace URLS, ROOMOF, DHOF, VIEWURL, HOUSEDOCS and per-room object lists with one embedded registry, wired to page ids.
- Room Colours from the registry. Changes: Estate Office Copper; Double Library Gold; Ballroom Cellars Charcoal; Stables and Lodgings plain; the eleven colour Bedrooms take their Colour.
- New object kinds with no anchor stand at room centre until the Depot gives a prop. Act codes: "@kchat" Kairos chat (Full chat opens page "kairos"); "@cat:*" toolkit catalog; "@cat:orange"; "@info:<text>" a toast.
- Globe pass kept; drop the Map Room's double globe.
- Find: Houses in order gold, silver, white, copper, blue, yellow, green, violet, orange, grey, charcoal, brown, pink, red; then His Grace's rooms; then grounds. Under each House: main room first, then rooms with objects. The Kairos tour walks main rooms in that order.
- Grounds object: "The Great Cedar: the Great Tree", kind tree, page "tree".
- Tiers Crown, Court, Hearth; Silver the Exchequer (Treasurer); Red the Yeomanry (Reeve); the Carving is the Ascent.

HOUSES {key:[name, title, colour, tier, main room, life area]}
{"gold":["Gold","The Conquering House","#C9A227","Crown","The Map Room","Command, schooling, strategy and the Library"],"silver":["Silver","The Exchequer","#C0C7CF","Crown","The Business Room","Money-making: markets, ventures, products"],"white":["White","The Sanctuary","#F4F1EA","Crown","The Nave","Faith, sacred study and sealed records"],"copper":["Copper","The Bureau","#B87333","Crown","The Estate Office","Time, records, rules and the Ledger"],"blue":["Blue","The Midnight School","#2E5E9E","Court","The Observatory","The news datastream and every journey"],"yellow":["Yellow","The Lyceum","#E3B23C","Court","The Laboratory","Research: the Laboratory and the clinic"],"green":["Green","The Grid","#3FA34D","Court","The Orangery Laboratory","Code, AI and systems"],"violet":["Violet","The Grove","#7B4FA0","Court","The Long Gallery","Everything made to be seen or heard"],"orange":["Orange","The Forgeworks","#E07A1F","Court","The Forge","Hardware, machines, repairs and gear"],"grey":["Grey","The Watch","#7D8287","Court","The Watch Room","Defence, the kill switch, the field"],"charcoal":["Charcoal","The Longhouse","#2B2B2F","Hearth","The Ballroom Cellars","Strength and training, forged by fire"],"brown":["Brown","The Service Wing","#7A5230","Hearth","The Servants' Hall","The house running itself"],"pink":["Pink","The Garden","#E8A0B4","Hearth","The Drawing Room","People: family, friends and the network"],"red":["Red","The Yeomanry","#A4161A","Hearth","The Farm Office","The daily work, the hours, the why"]}
