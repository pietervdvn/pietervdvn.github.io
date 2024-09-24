
I'm from Bruges. You know, that famous medieval city in Bruges.

As everyone in Belgium knows, the center of Bruges is paved mostly in sett/cobblestones. Personally, I'm pretty fond of those sett pavements. 
They're way nicer to see then asphalt (not to mention conrete plates), the absorb a lot of heat in the summer (cooling the city) which is released again in autumn.

But, as the bicycle is my primary means of transportation, one drawback comes to mind: they're uncomfortable to cycle on - especially when pulling a cart. Some types of set pavement are to be avoided then - I'd rather drive 200 meters over asphalt than 100 over the big boulder. However, the smaller sett -often laid in arcs- is more comfortable to drive on and has a smaller penalty.

This implies that more information should be added to the 'surface'-tag. In this document, I propose a few extra tags to deal with this extra information; and what kind of sett these are. These tags are used in Bruges; feel free to use them in other places as well.

All example pictures are taken by me, and may be used freely for OSM-related endeavours (e.g. wiki, tools, ...).

# Cobblestone vs. Sett vs. paving_stones

First things first.. What is sett stone? And what are cobblestones?

According to Wikipedia, _Cobblestone is a natural building material based on cobble-sized stones, and is used for pavement roads, streets, and buildings. Sett is distinct from a cobblestone by being quarried or shaped to a regular form, whereas cobblestone is generally of a naturally occurring form._

In practice, cobblestone is often used in OSM to describe sett stones - although incorrectly. The wiki itself acknowledges this:

- `surface=cobblestone`: Cobblestone paving. "Cobblestone" is used in the colloquial meaning here, and therefore includes the type of stones that would more precisely be called "setts". (Used for around 162k ways)
- `surface=sett`: Sett surface is formed from stones quarried or worked to a regular shape. In OSM, this is a subset of "cobblestone", and it is far more common to tag these surfaces with surface=cobblestone instead. (Used for around 52k ways).

In other words, please, only use sett from now on; and use `cobblestone` only for when the natural form of the stones is still visible and thus results in a random pattern of laying the stones.

And then there is the even more attrocious `surface=cobblestone:flattened`; still in use for around 4k ways. The wiki says on this that _this is neither a correct name, like sett (cobblestone is by definition not shaped into any form), nor a colloquially used name, like cobblestone._ In other words, a tag that should not be used anymore and be translated to `sett`.

## Cobblestone 

As already discussed: cobblestone is somewhat chaotic in natura, as can be seen in this image (again, from Wikipedia).

![Cobblestone](https://en.wikipedia.org/wiki/File:Ancient_road_surface.jpg)



# Types of sett

With these prerequisites out of the way, lets talk about the main topic of the post: sett in all its sizes and patterns.

In Bruges, there are three kinds of shapes:

- Rectangular, often quite big (25cm*10cm)
- Square, measuring around 10cm*10cm
- Cube, small cubes of around 5cm

These can be laid down in various patterns, as described belowed.


# Patterns of sett

## Big boulder (aka 'normal sett')

`surface=sett`
*implies* `sett:pattern=interleaved` and `sett:type=rectangular`

The first, and most common type of sett are the 'big boulders': the big, rectangular sett stones, in a interleaved pattern like a brick wall. As these are the most common stones, I didn't bother to add more tagging to them.

![](https://github.com/pietervdvn/OSMand-Routing/raw/master/Kasseien/NormalSett.jpg)

## Arc

`surface=sett`
`sett:pattern=arc`
*implies* `sett:type=cube`

The second most common type of sett are small cubes, in a pattern of multiple, parallell arcs. Nice to see, and not to be confused with the very similar _belgian fan_.

Some examples I found in Bruges:

- [Simon-Stevenplein](https://www.openstreetmap.org/way/145419676) has arcs, where a few arcs are in white cubes. Notice how those white arcs never touch each other:
![](https://github.com/pietervdvn/OSMand-Routing/raw/master/Kasseien/BogenSimonSteven.jpg)
- [De Burg](https://www.openstreetmap.org/way/39267177) in Bruges has arcs as well: ![](https://raw.githubusercontent.com/pietervdvn/OSMand-Routing/master/Kasseien/BogenBurg.jpg)


## Belgian Fan

`surface=sett`
`sett:pattern=belgian_fan`
*implies* `sett:type=cube`

Even more beautifull -and extremely rare- is the _belgian fan_. The cubes are laid in shell-like or fan-like patterns, as can be seen in the [Sint-Amandsstraat](https://www.openstreetmap.org/way/125770477) near the _Markt_:

![](https://github.com/pietervdvn/OSMand-Routing/raw/master/Kasseien/BelgianFan.jpg)

This is the *only* street in Bruges that still has this pattern! There used to be Belgian Fan in the streets around the Simon Steven-square as well; but a recent (~10 year ago) reconstruction of the site used 'normal' arcs, as visible above. The other place that still has a few specs of belgian fan is one construction site as well; so it is endangered as well. Perhaps someone should complain to Unesco that we are losing some world heritage!


## Interleaved

`surface=sett`
`sett:pattern=interleaved`
*implies* `sett:type=square`

Although square sett is mostly used for foothpaths, it is sometimes used for shorter streets or speed tables as well. The square sett can be used interleaved, as here:

TODO image

## Square without pattern tag

`surface=sett`
`sett:type=square`
*implies* `sett:type=square`

... or used in a straight way, as here:

![](https://github.com/pietervdvn/OSMand-Routing/raw/master/Kasseien/StraightSquare.jpg)

# Paving stones


At last a word on `paving_stones`: the consensus here is that these are (in general) modern, mechanically shaped to neatly fit. The can be cast from concrete, they can be natural stones that are cut in a specific shape, ... For example, I consider brick roads to be a subclass of paving stones (but I'd tag it as `surface=brick` anyway).

The distinction with sett can be very small and subjective. For example, I have been doubting what to call the following:

![](https://github.com/pietervdvn/OSMand-Routing/raw/master/Kasseien/PavingOrSett.jpg)

# In conclusion: a nice map to see

As you've already noticed in my previous posts, I've customized the routing parameters for OSMand to help with this task. It also was an excellent reason to map *all* the street pavements of Bruges. It was a lot of fun to do, and it helped to discover new places in Bruges; both beautiful or ugly.

The result of all this mapping can be visualized, [thanks to overpass-turbo](https://overpass-turbo.eu/map.html?Q=%2F*%0AThis%20overpass%20query%20loads%20all%20highways%20for%20which%20a%20surface%20tag%20is%20present.%0A%0ADepending%20on%20the%20surface%2C%20another%20color%20is%20used%20to%20render.%0A%0A*%2F%0A%0A%5Bout%3Ajson%5D%3B%0A%0A%0A(%0A%20%20way%5Bsurface%5D(51.1967728108966%2C3.1934165954589844%2C51.22148066762262%2C3.2566308975219727)%3B%0A%20%20node%5Bsurface%5D(51.1967728108966%2C3.1934165954589844%2C51.22148066762262%2C3.2566308975219727)%3B%0A%20%20relation%5Bsurface%5D(51.1967728108966%2C3.1934165954589844%2C51.22148066762262%2C3.2566308975219727)%3B%0A)%3B%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%0A%7B%7Bstyle%3A%20%0Anode%2C%20way%2C%20area%0A%7B%20color%3Ablue%3B%20fill-color%3Ablue%3B%20%7D%0A%0Away%5Bsurface%3Dsett%5D%0A%7B%20color%3Abrown%3B%20fill-color%3Abrown%3B%20dashes%3A%204%2C5%7D%0A%0A%0Away%5Bsurface%3Dsett%5D%5Bsett%3Apattern%3Darc%5D%0A%7B%20color%3A%23c9622e%3B%20fill-color%3A%23c9622e%3B%20dashes%3A%204%2C8%7D%0A%0Away%5Bsurface%3Dwood%5D%0A%7B%20color%3Abrown%3B%20fill-color%3Abrown%3B%20%7D%0A%0Away%5Bsett%3Apattern%3Dbelgian_fan%5D%0A%7B%20color%3Aorange%3B%20fill-color%3Aorange%3B%20dashes%3A%202%2C5%7D%0A%0A%0A%0A%0Away%5Bsurface%3Dasphalt%5D%0A%7B%20color%3Ablack%3B%20fill-color%3Ablack%20%7D%0A%0Away%5Bsurface%3Dconcrete%5D%2Cway%5Bsurface%3Dconcrete%3Aplates%5D%0A%7B%20color%3Agrey%3B%20fill-color%3Agrey%20%7D%0A%0Away%5Bsurface%3Dpaving_stones%5D%2Cway%5Bsurface%3Dpaving_stones%3A20%5D%2Cway%5Bsurface%3Dpaving_stones%3A30%5D%0A%7B%20color%3Apink%3B%20fill-color%3Apink%20%7D%0A%0Away%5Bsurface%3Dcobblestone%5D%2Cway%5Bsurface%3Dpaved%5D%2Cway%5Bsurface%3Dunpaved%5D%0A%7B%20color%3Ared%3B%20fill-color%3Ared%20%7D%0A%0Away%5Bsurface%3Dcompacted%5D%0A%7B%20color%3Ayellow%3B%20fill-color%3Ayellow%20%7D%0A%0A%20%7D%7D). 


