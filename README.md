
# UltraStar Lyrics Editor

UltraStar Lyrics Editor is a user-friendly application designed for editing lyrics files for UltraStar, a popular karaoke game. 

It allows you to create a new UltraStar song file based on an existing [UltraStar song file](https://usdx.eu/format/#specs), edit the lyrics on the existing timings, and save the final result in the UltraStar format.


## Usage

Open the UltraStar Lyrics Editor application (simple HTML file to open with your browser).

1. Load an existing UltraStar song file (.txt)
2. Paste the new lyrics into the text area (or load a text file)
3. Click on "Auto-sync"
4. Review and adjust manually if necessary
5. Generate and copy the synchronized file (or download it)


## Auto-synchronization

As the existing UltraStar song file contains timing information for each line of lyrics, 
the editor automatically synchronizes the new lyrics with the existing timings based on the lines.

### Syllable Separator

You can use the `|` character to split words into syllables in your new lyrics.
For example: `hel|lo wor|ld` will be split into 4 syllables: `hel`, `lo`, `wor`, `ld`.

Each syllable will be assigned to a separate note timing from the original file.
