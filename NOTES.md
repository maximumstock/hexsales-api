# Notes
This is just a collection of digital notes I'd like to preserve for this project going from here.

## Using the game's GUIDs for item identification
To identify different versions of the same card (aka Regular Art vs Alternate Art vs Extended Regular Art vs Extended
Alternate Art) one could use the GUIDs that are attached to each unique card, piece of equipment, set pack, asset of any art.
Currently, two different art versions of a card are distinguished by modifying their names if it's not a regular art
card (eg. a regular art Extinction is just named 'Extinction', an alternate art version is called 'Extinction AA').
At the moment the information whether a cards is alternate art is inferred from the field `rarity` in the auction house
dumps. There is no support for spotting trades of extended art versions (neither extended regular nor extended alternate
art), but extended versions could be prefixed with another 'E' in the future (eg. Extended Regular Art = EA, Extended
Alternate Art = EAA).

As of 2016-07-20 HexEnt has recently started to include GUIDs in their auction house dumps. I thought about moving
towards GUIDs for identification of assets for reasons of simplicity and safety. However, HexEnt has not added GUIDs to
past auction house dumps and is apparently not going to do so, which would result is more time supporting additional data
sources (such as doc-x' GUID-ified data dumps, which he offered to provide). Furthermore there is no real benefit as
there is no official mapping from GUIDs to assets anyway and apparently those GUID values are not meant to uniquely
identify assets anyway ([source](http://forums.cryptozoic.com/showthread.php?t=40975&page=23&p=508068#post508068)).
